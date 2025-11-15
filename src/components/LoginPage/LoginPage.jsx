import { useState, useEffect } from 'react';
import { LogIn, Globe } from 'lucide-react';
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
    <div className="login-container">
        <div className="language-switcher">
        <Globe size={16} style={{ marginRight: '8px' }} />
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
      <h2 className="login-title">{t.title}</h2>

      <form onSubmit={handleLogIn} className="login-form">
        <input
          type="text"
          placeholder={t.username}
          className="login-input"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder={t.password}
          className="login-input"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="login-button">
          <LogIn size={20} style={{ marginRight: '8px' }} />
          {t.button}
        </button>
      </form>

      {errorMessage && (
        <div className="login-error">{errorMessage}</div>
      )}

    
    </div>
  );
}

export default LoginPage;