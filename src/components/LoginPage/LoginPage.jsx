import { useState, useEffect } from 'react';
import { LogIn, Globe, User, Lock } from 'lucide-react';
import useStore from '../../zustand/store';
import useLanguageStore from '../../zustand/slices/language.slice';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const logIn = useStore((state) => state.logIn);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  const { language, translations, setLanguage } = useLanguageStore();
  const t = translations[language].login; 

  useEffect(() => {
    return () => {
      setAuthErrorMessage('');
    };
  }, []);

  const handleLogIn = (event) => {
    event.preventDefault();
    logIn({
      username: username,
      password: password,
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* LANGUAGE SWITCHER */}
        <div className="language-switcher">
          <Globe size={16} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
            title="Select language"
          >
            <option value="en">English</option>
            <option value="so">Somali</option>
          </select>
        </div>

        {/* HEADER */}
        <div className="login-header">
          <h2 className="login-title">
            🔐 {t.title}
          </h2>
          
        </div>

        {/* LOGIN CARD */}
        <div className="login-card">
          <form onSubmit={handleLogIn} className="login-form">
            {/* USERNAME INPUT */}
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                placeholder={t.username}
                className="login-input"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                placeholder={t.password}
                className="login-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* LOGIN BUTTON */}
            <button type="submit" className="login-button">
              <LogIn size={20} />
              {t.button}
            </button>
          </form>

          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div className="login-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;