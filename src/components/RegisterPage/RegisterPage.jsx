import { useState, useEffect } from "react";
import useStore from "../../zustand/store";
import useLanguageStore from "../../zustand/slices/language.slice";
import "./RegisterPage.css";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");

  const register = useStore((state) => state.register);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  const { language, translations } = useLanguageStore();
  const t = translations[language].admin;
  const loginT = translations[language].login;

  useEffect(() => {
    return () => {
      setAuthErrorMessage("");
    };
  }, [setAuthErrorMessage]);

  const handleRegister = (event) => {
    event.preventDefault();
    register({ username, password, role });
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* HEADER */}
        <div className="register-header">
          <h1 className="register-title">
            👤 {t.registerUser}
          </h1>
          <p className="register-subtitle">
            Create a new user account
          </p>
        </div>

        {/* FORM CARD */}
        <div className="register-card">
        

          <form onSubmit={handleRegister} className="register-form">
            {/* USERNAME */}
            <div className="form-group">
              <label className="form-label">
                <svg className="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {t.username}
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={loginT.pleaseEnterUsername}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label className="form-label">
                <svg className="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                {t.password}
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={loginT.pleaseEnterPassword}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* ROLE */}
            <div className="form-group">
              <label className="form-label">
                <svg className="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {t.role}
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="staff">👤 {t.staff}</option>
                  <option value="admin">⚙️ {t.admin}</option>
                 
                </select>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="submit-button">
              <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              {t.registerUser}
            </button>
          </form>

          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div className="error-message">
              <svg className="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;