import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Signup from "./components/signup";
import Login from "./components/Login";
import Home from "./components/Home";
import Logout from "./components/Logout";
import ExpenseForm from "./components/ExpenseForm.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken);

        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          const userData = decodedToken.user || decodedToken;

          setIsLoggedIn(true);
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
          });
        } else {
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/" />
            ) : (
              <Signup setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" />
            ) : (
              <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Home
                user={user}
                setIsLoggedIn={setIsLoggedIn}
                setUser={setUser}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/addexpense"
          element={
            isLoggedIn ? (
              <ExpenseForm
                user={user}
                setIsLoggedIn={setIsLoggedIn}
                setUser={setUser}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/logout"
          element={<Logout setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
