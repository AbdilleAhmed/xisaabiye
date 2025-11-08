import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <button
        onClick={() => navigate("/addtransaction")}
        className="dashboard-btn"
      >
        Add New Transaction
      </button>

      <button onClick={() => navigate("/summary")} className="dashboard-btn">
        Show Summary
      </button>

    

     

      <button
        onClick={() => navigate("/customers")}
        className="dashboard-btn dashboard-btn-primary"
      >
        Add New Client
      </button>
    </div>
  );
}
