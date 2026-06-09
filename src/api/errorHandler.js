import { displayValue } from '../utils/displayValue';

export const getErrorMessage = (error) => {
  let errorMessage = "Unexpected error: Please try again.";

  if (error.response) {
    console.error("Error response:", error.response);
    const responseMessage =
      error.response.data?.message
      ?? error.response.data?.detail
      ?? error.response.statusText;
    errorMessage = `Server error: ${displayValue(responseMessage) || 'Request failed'}`;
  } else if (error.request) {
    console.error("Error request:", error.request);
    errorMessage = "Network error: Please check your internet connection.";
  } else {
    console.error("Error message:", error.message);
    errorMessage = `Unexpected error: ${displayValue(error.message)}`;
  }

  return errorMessage;
};
  
