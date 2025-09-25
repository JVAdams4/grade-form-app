import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Grade Form App</Link>
        {user && <button className="btn btn-outline-danger" onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
};
export default Navbar;
