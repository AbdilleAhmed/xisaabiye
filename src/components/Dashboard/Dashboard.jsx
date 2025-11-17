
import { useNavigate } from "react-router-dom";
import useLanguageStore from "../../zustand/slices/language.slice";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { language, translations } = useLanguageStore();
  const t = translations[language].dashboard;

  return (
    <div className="dashboard-container">
      <button
        onClick={() => navigate("/addtransaction")}
        className="dashboard-btn"
      >
        {t.addTransaction}
      </button>

      <button
        onClick={() => navigate("/dashboard/reports")}
        className="dashboard-btn"
      >
        {t.reports}
      </button>

      <button
        onClick={() => navigate("/customers")}
        className="dashboard-btn dashboard-btn-primary"
      >
        {t.addClient}
      </button>
    </div>
  );
}
