import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("authToken");

    setIsLoggedIn(false);
    setUser(null);

    navigate("/login");
  }, [setIsLoggedIn, setUser, navigate]);

  return (
    <div className="container text-center mt-5">
      <h2>Logging out...</h2>
      <p>Please wait while we log you out.</p>
    </div>
  );
}

export default Logout;
