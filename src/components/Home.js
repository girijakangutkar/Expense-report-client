import React from "react";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import ExpenseReport from "./ExpenseReport";

function Home({ user, setIsLoggedIn, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="home-container">
      <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
        <Link className="navbar-brand" to="/">
          ExpTrack
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Link className="navbar-item" to="/addexpense">
              Add Expense
            </Link>
          </Nav>
          <span className="navbar-text me-3">Welcome, {user.name}</span>
          <button
            className="btn btn-outline-danger logoutbtn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </Navbar.Collapse>
      </Navbar>

      <div class="column">
        <div class="col col-1">
          <div className="cards">
            <h2>User Profile</h2>
            <ul>
              <li>
                <strong>Name:</strong> {user.name}
              </li>
              <li>
                <strong>Email:</strong> {user.email}
              </li>
            </ul>
            <h2>Account Details</h2>
            <ul>
              <li>
                <strong>Joined:</strong> {new Date().toLocaleDateString()}
              </li>
              <li>
                <strong>Account Status:</strong> Active
              </li>
            </ul>
          </div>
        </div>
        <div class="col col-2">
          <ExpenseReport user={user} />
        </div>
      </div>
    </div>
  );
}

export default Home;
