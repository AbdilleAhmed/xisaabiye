import { useState, useEffect } from "react";
import useStore from "../../zustand/store";
import useLanguageStore from "../../zustand/slices/language.slice";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const register = useStore((state) => state.register);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  const { language, translations, setLanguage } = useLanguageStore();
  const t = translations[language].admin;

  useEffect(() => {
    return () => {
      setAuthErrorMessage("");
    };
  }, []);

  const handleRegister = (event) => {
    event.preventDefault();

    register({
      username: username,
      password: password,
      role: role,
    });
  };

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "30px" }}>
        {t.registerUser}
      </h1>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label style={{ 
            display: "block", 
            fontSize: "16px", 
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            {t.username || "Username"}:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={translations[language].login?.pleaseEnterUsername}
            required
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            fontSize: "16px", 
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            {t.password || "Password"}:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={translations[language].login?.pleaseEnterPassword}
            required
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            fontSize: "16px", 
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            {t.role || "Role"}:
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxSizing: "border-box",
              cursor: "pointer"
            }}
          >
            <option value="staff">{t.staff || "Staff"}</option>
            <option value="admin">{t.admin || "Admin"}</option>
            <option value="owner">{t.storeOwner || "Owner"}</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: "15px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#000",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          {t.registerUser}
        </button>
      </form>

      {errorMessage && (
        <h5 style={{ color: "#dc3545", textAlign: "center", marginTop: "20px" }}>
          {errorMessage}
        </h5>
      )}
    </div>
  );
}

export default RegisterPage;

