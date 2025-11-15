import { useState, useEffect } from "react";
import { Users, DollarSign, CreditCard, TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react";
import { useSummaryStore } from "../../zustand/slices/summary.slice";
import "./Reports.css";

export default function Reports() {
  const { summary, fetchSummary, loading } = useSummaryStore();
  const [error, setError] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setError("");
      await fetchSummary();
    } catch (err) {
      console.error("Error loading summary:", err);
      setError("Failed to load reports");
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-card-icon" style={{ color }}>
          {icon}
        </div>
        <div className="stat-card-body">
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value" style={{ color }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reports-container">
      <div className="reports-wrapper">
        {/* HEADER */}
        <div className="reports-header">
          <h1 className="reports-title">
            <BarChart3 size={32} style={{ display: "inline", marginRight: "8px" }} />
            Reports
          </h1>
          <p className="reports-subtitle">summary of all reports</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && <div className="reports-error">{error}</div>}

        {/* LOADING STATE */}
        {loading && (
          <div className="reports-loading">
            <p className="reports-loading-text">Loading reports...</p>
          </div>
        )}

        {/* STATS GRID */}
        {!loading && summary && (
          <>
            <div className="stat-cards-grid">
              <StatCard
                title="Total Customers"
                value={summary.totalCustomers || 0}
                color="#2e7d32"
                icon={<Users size={40} />}
              />
              <StatCard
                title="Total Amount Paid"
                value={`$${(summary.totalPaid || 0).toFixed(2)}`}
                color="#1976d2"
                icon={<TrendingUp size={40} />}
              />
              <StatCard
                title="Total Amount Owed"
                value={`$${(summary.totalOwed || 0).toFixed(2)}`}
                color="#d32f2f"
                icon={<TrendingDown size={40} />}
              />
            </div>

            {/* DETAILS SECTION */}
            <div className="summary-details-section">
              <h2 className="summary-details-title">
                <BarChart3 size={24} style={{ display: "inline", marginRight: "8px" }} />
                Summary Details
              </h2>

              <div className="details-grid">
                {/* TOTAL TRANSACTIONS */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    <CreditCard size={16} style={{ display: "inline", marginRight: "6px" }} />
                    Total Transactions
                  </p>
                  <p className="detail-card-value">{summary.totalTransactions || 0}</p>
                </div>

                {/* CREDIT TRANSACTIONS */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    <TrendingUp size={16} style={{ display: "inline", marginRight: "6px", color: "#2e7d32" }} />
                    Credit Transactions
                  </p>
                  <p className="detail-card-value green">{summary.creditCount || 0}</p>
                </div>

                {/* DEBIT TRANSACTIONS */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    <TrendingDown size={16} style={{ display: "inline", marginRight: "6px", color: "#d32f2f" }} />
                    Debit Transactions
                  </p>
                  <p className="detail-card-value red">{summary.debitCount || 0}</p>
                </div>

                {/* CUSTOMERS WITH BALANCE */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    <DollarSign size={16} style={{ display: "inline", marginRight: "6px", color: "#1976d2" }} />
                    Customers with Balance
                  </p>
                  <p className="detail-card-value blue">{summary.customersWithBalance || 0}</p>
                </div>

                {/* CUSTOMERS WITH DEBT */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    <Users size={16} style={{ display: "inline", marginRight: "6px", color: "#d32f2f" }} />
                    Customers with Debt
                  </p>
                  <p className="detail-card-value red">{summary.customersWithDebt || 0}</p>
                </div>
              </div>
            </div>

            {/* REFRESH BUTTON */}
            <div className="refresh-button-container">
              <button className="refresh-button" onClick={loadSummary} title="Refresh reports">
                <RefreshCw size={18} style={{ marginRight: "6px" }} />
                Refresh Reports
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}