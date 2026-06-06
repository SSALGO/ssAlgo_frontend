// utils/errorHandler.js
export const getErrorMessage = (error) => {
    let errorMessage = "Unexpected error: Please try again.";
  
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error("Error response:", error.response);
      errorMessage = `Server error: ${
        error.response.data.message || error.response.statusText
      }`;
    } else if (error.request) {
      // Request was made but no response received
      console.error("Error request:", error.request);
      errorMessage = "Network error: Please check your internet connection.";
    } else {
      // Something else happened while setting up the request
      console.error("Error message:", error.message);
      errorMessage = `Unexpected error: ${error.message}`;
    }
  
    return errorMessage;
  };
  