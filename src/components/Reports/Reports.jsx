import { useState, useEffect } from "react";
import { useSummaryStore } from "../../zustand/slices/summary.slice";
import "./Reports.css";

export default function Reports() {
  const { summary, fetchSummary, loading } = useSummaryStore();
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setError("");
      let params = {};
      
      if (filterType === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (filterType === "today") {
        const today = new Date().toISOString().split('T')[0];
        params.startDate = today;
        params.endDate = today;
      } else if (filterType === "week") {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (filterType === "month") {
        const today = new Date();
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.startDate = monthAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      }
      
      await fetchSummary(params);
    } catch (err) {
      console.error("Error loading summary:", err);
      setError("Failed to load reports");
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (type !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const applyDateFilter = () => {
    if (filterType === "custom" && (!startDate || !endDate)) {
      setError("Please select both start and end dates");
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date");
      return;
    }
    loadSummary();
  };

  const resetFilters = () => {
    setFilterType("all");
    setStartDate("");
    setEndDate("");
    setError("");
  };

  useEffect(() => {
    if (filterType !== "custom") {
      loadSummary();
    }
  }, [filterType]);

  const StatCard = ({ title, value, color }) => (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-card-body">
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value" style={{ color }}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reports-container">
      <div className="reports-wrapper">
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">Summary of all reports</p>
        </div>

        <div className="date-filter-section">
          <h3 className="filter-title">Filter by Date</h3>
          
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              All Time
            </button>
            <button
              className={`filter-btn ${filterType === "today" ? "active" : ""}`}
              onClick={() => handleFilterChange("today")}
            >
              Today
            </button>
            <button
              className={`filter-btn ${filterType === "week" ? "active" : ""}`}
              onClick={() => handleFilterChange("week")}
            >
              Last 7 Days
            </button>
            <button
              className={`filter-btn ${filterType === "month" ? "active" : ""}`}
              onClick={() => handleFilterChange("month")}
            >
              Last 30 Days
            </button>
            <button
              className={`filter-btn ${filterType === "custom" ? "active" : ""}`}
              onClick={() => handleFilterChange("custom")}
            >
              Custom Range
            </button>
          </div>

          {filterType === "custom" && (
            <div className="custom-date-range">
              <div className="date-input-group">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              
              <div className="date-input-group">
                <label htmlFor="end-date">End Date:</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="custom-date-actions">
                <button className="apply-filter-btn" onClick={applyDateFilter}>
                  Apply Filter
                </button>
                <button className="reset-filter-btn" onClick={resetFilters}>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <div className="reports-error">{error}</div>}

        {loading && (
          <div className="reports-loading">
            <p className="reports-loading-text">Loading reports...</p>
          </div>
        )}

        {!loading && summary && (
          <>
            <div className="stat-cards-grid">
              <StatCard
                title="Total Customers"
                value={summary.totalCustomers || 0}
                color="#2e7d32"
              />
              <StatCard
                title="Total Amount Paid"
                value={`$${(summary.totalPaid || 0).toFixed(2)}`}
                color="#1976d2"
              />
              <StatCard
                title="Total Amount Owed"
                value={`$${(summary.totalOwed || 0).toFixed(2)}`}
                color="#d32f2f"
              />
            </div>

            <div className="summary-details-section">
              <h2 className="summary-details-title">Summary Details</h2>

              <div className="details-grid">
                <div className="detail-card">
                  <p className="detail-card-label">Total Transactions</p>
                  <p className="detail-card-value">{summary.totalTransactions || 0}</p>
                </div>

                <div className="detail-card">
                  <p className="detail-card-label">Credit Transactions</p>
                  <p className="detail-card-value green">{summary.creditCount || 0}</p>
                </div>

                <div className="detail-card">
                  <p className="detail-card-label">Debit Transactions</p>
                  <p className="detail-card-value red">{summary.debitCount || 0}</p>
                </div>

                <div className="detail-card">
                  <p className="detail-card-label">Customers with Balance</p>
                  <p className="detail-card-value blue">{summary.customersWithBalance || 0}</p>
                </div>

                <div className="detail-card">
                  <p className="detail-card-label">Customers with Debt</p>
                  <p className="detail-card-value red">{summary.customersWithDebt || 0}</p>
                </div>
              </div>
            </div>

            <div className="refresh-button-container">
              <button className="refresh-button" onClick={loadSummary}>
                Refresh Reports
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

