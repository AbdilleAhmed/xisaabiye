import { useState, useEffect } from 'react';
import useStore from '../../zustand/store';
import useLanguageStore from '../../zustand/slices/language.slice'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const logIn = useStore((state) => state.logIn);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  const { language, translations, setLanguage } = useLanguageStore();
  const t = translations[language].login; 

  useEffect(() => {
    // Clear the auth error message when the component unmounts:
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
    <>
      <h2 className="text-center mt-4 mb-3">{t.title}</h2>

      <form onSubmit={handleLogIn} className="container p-4 border rounded shadow-sm" style={{ maxWidth: '400px' }}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">{t.username}:</label>
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
          <label htmlFor="password" className="form-label">{t.password}:</label>
          <input
            type="password"
            id="password"
            className="form-control"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          {t.button}
        </button>
      </form>

      {errorMessage && (
        <h5 className="text-danger text-center mt-3">{errorMessage}</h5>
      )}

      {/* Language switch buttons */}
      <div className="text-center mt-3">
        <button
          className="btn btn-outline-primary me-2"
          onClick={() => setLanguage('en')}
          disabled={language === 'en'}
        >
          English
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setLanguage('so')}
          disabled={language === 'so'}
        >
          Somali
        </button>
      </div>
    </>
  );
}

export default LoginPage;

