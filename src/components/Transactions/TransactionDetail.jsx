import { useState, useEffect } from "react";
import { useCustomerStore } from "../../zustand/slices/customer.slice";
import { useTransactionStore } from "../../zustand/slices/transactions.slice";
import "./TransactionDetail.css";

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

  return (
    <div className="transaction-detail-container">
      <div className="transaction-detail-wrapper">
        <div className="transaction-detail-header">
          <h1 className="transaction-detail-title">Transactions</h1>
          <p className="transaction-detail-subtitle">Manage customer transactions</p>
        </div>

        {message && (
          <div className={`message-alert ${messageType}`}>
            {message}
          </div>
        )}

        <div className="transaction-grid">
          <div className="card">
            <h2 className="card-title">Search Customer</h2>

            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <div className="customer-list">
              {filteredCustomers.length === 0 ? (
                <p className="customer-list-empty">No customers found</p>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    className={`customer-item ${selectedCustomer == customer.id ? "selected" : ""}`}
                  >
                    <p className="customer-name">
                      {customer.firstname} {customer.lastname}
                    </p>
                    <p className="customer-phone">{customer.phone || "No phone"}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">
              {selectedCustomer ? "Add Transaction" : "Select a Customer"}
            </h2>

            {selectedCustomer && (
              <div className="customer-info-box">
                <p className="customer-info-text">
                  <strong>Customer:</strong> {selectedCustomerData?.firstname} {selectedCustomerData?.lastname}
                </p>
              </div>
            )}

            {selectedCustomer ? (
              <form onSubmit={handleAddTransaction} className="transaction-form">
                <div className="form-group">
                  <label className="form-label">Type:</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="form-select"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount:</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0.01"
                    step="0.01"
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Adding..." : "Add Transaction"}
                </button>
              </form>
            ) : (
              <p className="empty-state">
                Select a customer from the list to add a transaction
              </p>
            )}
          </div>
        </div>

        {selectedCustomer && isFetched && transactions.length > 0 && (
          <div className="card">
            <h2 className="card-title">
              Transactions for {selectedCustomerData?.firstname} {selectedCustomerData?.lastname}
            </h2>

            <div className="transaction-table-wrapper">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>
                        {editingTransactionId === t.id ? (
                          <select
                            value={editedType}
                            onChange={(e) => setEditedType(e.target.value)}
                            className="table-select"
                          >
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                          </select>
                        ) : (
                          <span className="transaction-type">{t.transaction_type}</span>
                        )}
                      </td>
                      <td>
                        {editingTransactionId === t.id ? (
                          <input
                            type="number"
                            value={editedAmount}
                            onChange={(e) => setEditedAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            className="table-input"
                          />
                        ) : (
                          <span className="transaction-amount">${t.amount.toFixed(2)}</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingTransactionId === t.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(t.id)}
                                disabled={loading}
                                className="btn btn-success"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={loading}
                                className="btn btn-secondary"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(t)}
                                disabled={loading}
                                className="btn btn-warning"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                disabled={loading}
                                className="btn btn-danger"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedCustomer && isFetched && transactions.length === 0 && (
          <div className="empty-transaction-state">
            <p className="empty-transaction-text">
              No transactions yet. Add your first transaction above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}