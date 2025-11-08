import { useState, useEffect } from "react";
import { useCustomerStore } from "../../zustand/slices/customer.slice";
import { useTransactionStore } from "../../zustand/slices/transactions.slice";

export default function TransactionDetail() {
  const { customers, fetchCustomers } = useCustomerStore();
  const { transactions, addTransaction, deleteTransaction, updateTransaction, fetchTransactionsByCustomer } = useTransactionStore();

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isFetched, setIsFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("credit");
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editedType, setEditedType] = useState("credit");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      showMessage("Please select a customer", "error");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showMessage("Please enter a valid amount", "error");
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        customer_id: parseInt(selectedCustomer),
        amount: parseFloat(amount),
        transaction_type: transactionType,
      };

      console.log("Adding transaction:", transactionData);

      await addTransaction(transactionData);
      showMessage("Transaction added successfully!", "success");
      setAmount("");
      setTransactionType("credit");
      await fetchTransactionsByCustomer(selectedCustomer);
    } catch (err) {
      console.error("Error adding transaction:", err);
      showMessage(`Failed to add transaction: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setLoading(true);
      try {
        console.log("Deleting transaction:", id);
        await deleteTransaction(id);
        showMessage("Transaction deleted successfully!", "success");
        await fetchTransactionsByCustomer(selectedCustomer);
      } catch (err) {
        console.error("Error deleting transaction:", err);
        showMessage(`Failed to delete transaction: ${err.response?.data?.message || err.message}`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransactionId(transaction.id);
    setEditedAmount(transaction.amount);
    setEditedType(transaction.transaction_type);
  };

  const handleUpdate = async (id) => {
    if (!editedAmount || parseFloat(editedAmount) <= 0) {
      showMessage("Please enter a valid amount", "error");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        amount: parseFloat(editedAmount),
        transaction_type: editedType,
      };

      console.log("Updating transaction:", id, updateData);

      await updateTransaction(id, updateData);
      setEditingTransactionId(null);
      showMessage("Transaction updated successfully!", "success");
      await fetchTransactionsByCustomer(selectedCustomer);
    } catch (err) {
      console.error("Error updating transaction:", err);
      showMessage(`Failed to update transaction: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditedAmount("");
    setEditedType("credit");
  };

  const handleSelectCustomer = async (customerId) => {
    setSelectedCustomer(customerId);
    setSearchTerm("");
    setIsFetched(false);

    if (customerId) {
      setLoading(true);
      try {
        console.log("Fetching transactions for customer:", customerId);
        await fetchTransactionsByCustomer(customerId);
        setIsFetched(true);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        showMessage(`Failed to load transactions: ${err.response?.data?.message || err.message}`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.firstname.toLowerCase().includes(search) ||
      c.lastname.toLowerCase().includes(search) ||
      (c.phone && c.phone.toLowerCase().includes(search))
    );
  });

  const selectedCustomerData = customers.find((c) => c.id == selectedCustomer);

  const calculateBalance = () => {
    if (transactions.length === 0) return 0;
    const balance = transactions[0]?.balance_after;
    return typeof balance === 'string' ? parseFloat(balance) : balance;
  };

  const getTransactionTypeDescription = (type) => {
    if (type === "credit") {
      return "Payment received from customer";
    } else if (type === "debit") {
      return "Amount owed by customer";
    }
    return "";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>
            Transactions
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Manage customer transactions
          </p>
        </div>

        {message && (
          <div
            style={{
              backgroundColor: messageType === "success" ? "#e8f5e9" : "#ffebee",
              color: messageType === "success" ? "#2e7d32" : "#c62828",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: `1px solid ${messageType === "success" ? "#c8e6c9" : "#ef9a9a"}`,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              padding: "30px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
              Search Customer
            </h2>

            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #2196F3",
                fontSize: "15px",
                boxSizing: "border-box",
                marginBottom: "15px",
              }}
            />

            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              {filteredCustomers.length === 0 ? (
                <p style={{ padding: "20px", color: "#888", textAlign: "center" }}>
                  No customers found
                </p>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      backgroundColor: selectedCustomer == customer.id ? "#f0f0f0" : "#fff",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedCustomer == customer.id ? "#f0f0f0" : "#fff")}
                  >
                    <p style={{ margin: "0 0 3px 0", fontWeight: "bold", fontSize: "14px" }}>
                      {customer.firstname} {customer.lastname}
                    </p>
                    <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>
                      {customer.phone || "No phone"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              padding: "30px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
              {selectedCustomer ? "Add Transaction" : "Select a Customer"}
            </h2>

            {selectedCustomer && (
              <>
                <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
                    <strong>Customer:</strong> {selectedCustomerData?.firstname} {selectedCustomerData?.lastname}
                  </p>
                  <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                    <strong>Balance:</strong> <span style={{ fontSize: "18px", fontWeight: "bold", color: calculateBalance() >= 0 ? "#2e7d32" : "#c62828" }}>
                      ${calculateBalance().toFixed(2)}
                    </span>
                  </p>
                </div>
              </>
            )}

            {selectedCustomer ? (
              <form onSubmit={handleAddTransaction} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>
                    Type:
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="credit">Credit - Payment received</option>
                    <option value="debit">Debit - Amount owed</option>
                  </select>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                    {getTransactionTypeDescription(transactionType)}
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>
                    Amount:
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0.01"
                    step="0.01"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: loading ? "#ccc" : "#000",
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                    marginTop: "10px",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#333")}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#000")}
                >
                  {loading ? "Adding..." : "Add Transaction"}
                </button>
              </form>
            ) : (
              <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
                Select a customer from the list to add a transaction
              </p>
            )}
          </div>
        </div>

        {selectedCustomer && isFetched && transactions.length > 0 && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              padding: "30px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: "0", color: "#333" }}>
                Transactions for {selectedCustomerData?.firstname} {selectedCustomerData?.lastname}
              </h2>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>Current Balance:</p>
                <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold", color: calculateBalance() >= 0 ? "#2e7d32" : "#c62828" }}>
                  ${calculateBalance().toFixed(2)}
                </p>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Type</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Amount</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Balance</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const transactionBalance = typeof t.balance_after === 'string' ? parseFloat(t.balance_after) : t.balance_after;
                    return (
                      <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px" }}>
                          {editingTransactionId === t.id ? (
                            <select
                              value={editedType}
                              onChange={(e) => setEditedType(e.target.value)}
                              style={{
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                              }}
                            >
                              <option value="credit">Credit</option>
                              <option value="debit">Debit</option>
                            </select>
                          ) : (
                            <div>
                              <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                                {t.transaction_type}
                              </span>
                              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#888" }}>
                                {getTransactionTypeDescription(t.transaction_type)}
                              </p>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {editingTransactionId === t.id ? (
                            <input
                              type="number"
                              value={editedAmount}
                              onChange={(e) => setEditedAmount(e.target.value)}
                              min="0.01"
                              step="0.01"
                              style={{
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                                width: "100px",
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: "bold" }}>${t.amount.toFixed(2)}</span>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ fontWeight: "bold", color: transactionBalance >= 0 ? "#2e7d32" : "#c62828" }}>
                            ${transactionBalance.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {editingTransactionId === t.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(t.id)}
                                  disabled={loading}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: loading ? "#ccc" : "#4CAF50",
                                    color: "#fff",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: "bold",
                                    fontSize: "13px",
                                    transition: "all 0.3s",
                                  }}
                                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#45a049")}
                                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#4CAF50")}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={loading}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f5f5f5",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: "bold",
                                    fontSize: "13px",
                                    transition: "all 0.3s",
                                  }}
                                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#e0e0e0")}
                                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#f5f5f5")}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(t)}
                                  disabled={loading}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: loading ? "#ccc" : "#FFC107",
                                    color: "#fff",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: "bold",
                                    fontSize: "13px",
                                    transition: "all 0.3s",
                                  }}
                                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#FFB300")}
                                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#FFC107")}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(t.id)}
                                  disabled={loading}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: loading ? "#ccc" : "#f44336",
                                    color: "#fff",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: "bold",
                                    fontSize: "13px",
                                    transition: "all 0.3s",
                                  }}
                                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#da190b")}
                                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#f44336")}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedCustomer && isFetched && transactions.length === 0 && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
              No transactions yet. Add your first transaction above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}