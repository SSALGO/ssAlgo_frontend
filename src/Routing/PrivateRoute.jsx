import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  console.log("location", location);

  if (!token || token === "undefined") {
    // Redirect to the login page if the user is not authenticated
    return <Navigate to="/auth" />;
  }

  return children;
};

export default PrivateRoute;