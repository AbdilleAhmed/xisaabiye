import { useState, useEffect } from 'react';
import useStore from '../../zustand/store';


function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const register = useStore((state) => state.register)
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  useEffect(() => {
    // Clear the auth error message when the component unmounts:
    return () => {
      setAuthErrorMessage('');
    }
  }, [])

  const handleRegister = (event) => {
    event.preventDefault();

    register({
      username: username,
      password: password,
    })
  };

  return (
    <>
      <h2 className="text-center mt-4 mb-3">Register Page</h2>

<form onSubmit={handleRegister} className="container p-4 border rounded shadow-sm" style={{ maxWidth: '400px' }}>
  <div className="mb-3">
    <label htmlFor="username" className="form-label">Username:</label>
    <input
      type="text"
      id="username"
      className="form-control"
      required
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
  </div>

  <div className="mb-3">
    <label htmlFor="password" className="form-label">Password:</label>
    <input
      type="password"
      id="password"
      className="form-control"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>

  <button type="submit" className="btn btn-primary w-100">
    Register
  </button>
</form>

{errorMessage && (
  <h5 className="text-danger text-center mt-3">{errorMessage}</h5>
)}

    </>
  );
}


export default RegisterPage;
