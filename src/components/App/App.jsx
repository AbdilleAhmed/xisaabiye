import { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

import useStore from '../../zustand/store';
import Nav from '../Nav/Nav';
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import Dashboard from '../Dashboard/Dashboard.jsx';
import PrivateRoute from "../Protected/PrivateRoute";
import CustomerPage from '../Customers/CustomersPage.jsx';
import AddTransaction from '../Transactions/Addtransaction.jsx';
import TransactionDetail from '../Transactions/TransactionDetail.jsx';

function App() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="d-flex flex-column align-items-center justify-content-center py-4 bg-light">
        <h1>Xisabiye Credit Calculator</h1>
        <Nav />
      </header>

      <main className="flex-fill container my-4">
        <Routes>
          <Route path="/" element={user?.id ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user?.id ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/registration" element={user?.id && (user.role === 'admin' || user.role === 'owner') ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/addtransaction" element={<TransactionDetail />} />
          <Route path="/about" element={<div className="text-center"><h2>About Page</h2><p>Intelligence doesn’t seem like an aspect of personal character, and it isn’t.</p><p>--From Steve McConnell's <em>Code Complete</em>.</p></div>} />
          <Route path="*" element={<h2 className="text-center text-danger mt-3">404 Page</h2>} />
        </Routes>
      </main>

      <footer className="d-flex align-items-center justify-content-center py-3 bg-light">
        <p className="mb-0">Copyright © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;

