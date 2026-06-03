"""
TimesFM Model Singleton for ChronoSight backend.
Loads and manages the google/timesfm-2.5-200m-transformers model.
"""
import torch
from transformers.models.timesfm2_5.modeling_timesfm2_5 import TimesFm2_5ModelForPrediction
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TimesFMModel:
    """Singleton class for TimesFM model."""
    _instance = None
    _model = None
    _device = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TimesFMModel, cls).__new__(cls)
        return cls._instance

    def load_model(self):
        """Load the TimesFM model if not already loaded."""
        if self._model is None:
            logger.info("Loading TimesFM 2.5 200M model...")
            self._device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {self._device}")

            try:
                self._model = TimesFm2_5ModelForPrediction.from_pretrained(
                    "google/timesfm-2.5-200m-transformers",
                    attn_implementation="sdpa"
                )
                self._model.to(self._device)
                self._model.eval()
                logger.info("Model loaded successfully!")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise
        return self._model

    def get_model(self):
        """Get the loaded model, loading if necessary."""
        if self._model is None:
            self.load_model()
        return self._model

    def get_device(self):
        """Get the device the model is on."""
        if self._device is None:
            self._device = "cuda" if torch.cuda.is_available() else "cpu"
        return self._device

    def normalize(self, values: torch.Tensor) -> tuple:
        """Normalize values using mean and std."""
        mean = values.mean()
        std = values.std()
        if std == 0:
            std = 1.0
        normalized = (values - mean) / std
        return normalized, mean, std

    def denormalize(self, values: torch.Tensor, mean: float, std: float) -> torch.Tensor:
        """Denormalize values using mean and std."""
        return values * std + mean

    def forecast(self, past_values: list, horizon: int, frequency: str = 'D') -> dict:
        """
        Generate forecast using TimesFM model.
        
        Args:
            past_values: List of historical values (1D tensor as list)
            horizon: Number of steps to forecast
            frequency: Frequency code ('D', 'W', 'M', etc.)
        
        Returns:
            Dictionary with forecast mean, lower/upper bounds, and timestamps
        """
        model = self.get_model()
        device = self.get_device()
        
        # Convert past_values to tensor
        if isinstance(past_values, list):
            past_tensor = torch.tensor(past_values, dtype=torch.float32)
        else:
            past_tensor = past_values
        
        # Ensure 1D tensor
        if past_tensor.dim() > 1:
            past_tensor = past_tensor.flatten()
        
        # Normalize input
        normalized_input, mean, std = self.normalize(past_tensor)
        
        # Pad to multiple of 32 for model compatibility
        input_len = normalized_input.shape[0]
        pad_len = (32 - input_len % 32) % 32
        if pad_len > 0:
            normalized_input = torch.nn.functional.pad(normalized_input, (0, pad_len), mode='constant', value=0)
        
        # Prepare input for model - as list of 1D tensors
        input_batch = [normalized_input.to(device)]
        
        # Generate forecast
        with torch.no_grad():
            outputs = model(
                past_values=input_batch
            )
        
        # Extract predictions - model returns quantile predictions
        # outputs has mean_predictions and full_predictions attributes
        predictions = outputs.mean_predictions  # Mean forecast
        
        # Get quantile predictions for confidence bounds from full_predictions
        full_preds = outputs.full_predictions  # Shape: [batch, horizon, num_quantiles]
        
        # Extract 10th and 90th percentiles
        # full_preds shape is [batch, horizon, num_quantiles]
        lower_bound = full_preds[0, :, 0]  # 10th percentile
        upper_bound = full_preds[0, :, -1]  # 90th percentile
        
        # Denormalize outputs
        predictions_denorm = self.denormalize(predictions[0], mean, std)
        lower_denorm = self.denormalize(lower_bound, mean, std)
        upper_denorm = self.denormalize(upper_bound, mean, std)
        
        return {
            'mean': predictions_denorm.cpu().numpy().tolist(),
            'lower': lower_denorm.cpu().numpy().tolist(),
            'upper': upper_denorm.cpu().numpy().tolist(),
            'horizon': horizon
        }


# Global singleton instance
timesfm_singleton = TimesFMModel()
