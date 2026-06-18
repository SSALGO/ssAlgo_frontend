import React from "react";

const LoadingSpinner = ({ label = "Loading..." }) => (
  <div
    className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
    role="status"
    aria-live="polite"
  >
    <div
      className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF5733]"
      aria-hidden="true"
    />
    <span className="text-sm font-semibold text-gray-600">{label}</span>
  </div>
);

export default LoadingSpinner;
