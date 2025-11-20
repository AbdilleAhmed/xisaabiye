import { useState, useEffect } from "react";
import { useCustomerStore } from "../../zustand/slices/customer.slice";
import { useTransactionStore } from "../../zustand/slices/transactions.slice";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Phone,
  User
} from "lucide-react";
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

  // Calculate current balance from transactions
  const calculateBalance = () => {
    if (!transactions || transactions.length === 0) return 0;
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    return sortedTransactions[0]?.balance_after || 0;
  };

  const currentBalance = calculateBalance();

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

  // Get first 5 customers to display by default
  const displayCustomers = searchTerm ? filteredCustomers : filteredCustomers.slice(0, 5);
  const selectedCustomerData = customers.find((c) => c.id == selectedCustomer);

  return (
    <div className="transaction-detail-container">
      <div className="transaction-detail-wrapper">
        {/* Header */}
        <div className="transaction-detail-header">
          <div className="header-content">
            <div className="header-icon">
              <Wallet size={40} strokeWidth={2} />
            </div>
            <div>
              <h1 className="transaction-detail-title">Transaction Manager</h1>
              <p className="transaction-detail-subtitle">Track customer payments and purchases</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`message-alert ${messageType}`}>
            {messageType === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="transaction-grid">
          {/* Customer Selection Card */}
          <div className="card customer-card">
            <div className="card-header">
              <Users size={24} />
              <h2 className="card-title">Select Customer</h2>
            </div>

            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="customer-list">
              {displayCustomers.length === 0 ? (
                <div className="customer-list-empty">
                  <Users size={40} className="empty-icon" />
                  <p>No customers found</p>
                </div>
              ) : (
                <>
                  {displayCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer.id)}
                      className={`customer-item ${selectedCustomer == customer.id ? "selected" : ""}`}
                    >
                      <div className="customer-avatar">
                        <User size={20} />
                      </div>
                      <div className="customer-details">
                        <p className="customer-name">
                          {customer.firstname} {customer.lastname}
                        </p>
                        <p className="customer-phone">
                          <Phone size={12} />
                          {customer.phone || "No phone"}
                        </p>
                      </div>
                      {selectedCustomer == customer.id && (
                        <CheckCircle size={18} className="selected-icon" />
                      )}
                    </div>
                  ))}
                  {!searchTerm && filteredCustomers.length > 5 && (
                    <div className="customer-count-info">
                    total customers {filteredCustomers.length} 
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Transaction Form Card */}
          <div className="card transaction-card">
            <div className="card-header">
              <DollarSign size={24} />
              <h2 className="card-title">
                {selectedCustomer ? "New Transaction" : "Select a Customer"}
              </h2>
            </div>

            {selectedCustomer ? (
              <>
                {/* Customer Info */}
                <div className="customer-info-box">
                  <User size={16} />
                  <span>
                    <strong>{selectedCustomerData?.firstname} {selectedCustomerData?.lastname}</strong>
                  </span>
                </div>

                {/* Balance Display */}
                <div className={`balance-display ${currentBalance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                  <div className="balance-icon">
                    <Wallet size={28} />
                  </div>
                  <div className="balance-info">
                    <div className="balance-label">Current Balance</div>
                    <div className="balance-amount">
                      ${Math.abs(currentBalance).toFixed(2)}
                      {currentBalance < 0 && <span className="balance-status">Owes</span>}
                    </div>
                  </div>
                </div>

               

                {/* Transaction Form */}
                <form onSubmit={handleAddTransaction} className="transaction-form">
                  <div className="form-group">
                    <label className="form-label">Transaction Type</label>
                    <div className="select-wrapper">
                      {transactionType === "credit" ? (
                        <TrendingUp size={16} className="select-icon icon-credit" />
                      ) : (
                        <TrendingDown size={16} className="select-icon icon-debit" />
                      )}
                      <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        className="form-select"
                      >
                        <option value="credit">Credit - Payment Received</option>
                        <option value="debit">Debit - Purchase/Owe</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <div className="input-wrapper">
                      <DollarSign size={16} className="input-icon" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    <Plus size={18} />
                    {loading ? "Adding..." : "Add Transaction"}
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-state">
                <Users size={48} className="empty-icon" />
                <p>Select a customer from the list to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        {selectedCustomer && isFetched && transactions.length > 0 && (
          <div className="card transaction-history-card">
            <div className="card-header">
              <Wallet size={24} />
              <h2 className="card-title">
                Transaction History - {selectedCustomerData?.firstname} {selectedCustomerData?.lastname}
              </h2>
            </div>

            <div className="transaction-table-wrapper">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
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
                          <span className={`transaction-type-badge ${t.transaction_type}`}>
                            {t.transaction_type === "credit" ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {t.transaction_type}
                          </span>
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
                          <span className="transaction-amount">
                            <DollarSign size={14} />
                            {t.amount.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`balance-after ${t.balance_after >= 0 ? 'positive' : 'negative'}`}>
                          <DollarSign size={14} />
                          {Math.abs(t.balance_after).toFixed(2)}
                          {t.balance_after < 0 && (
                            <span className="owes-badge">Owes</span>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingTransactionId === t.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(t.id)}
                                disabled={loading}
                                className="btn btn-success btn-icon"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={loading}
                                className="btn btn-secondary btn-icon"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(t)}
                                disabled={loading}
                                className="btn btn-warning btn-icon"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                disabled={loading}
                                className="btn btn-danger btn-icon"
                                title="Delete"
                              >
                                <Trash2 size={16} />
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
          <div className="card empty-transaction-card">
            <div className="empty-transaction-state">
              <Wallet size={64} className="empty-icon" />
              <h3>No transactions yet</h3>
              <p>Add the first transaction for this customer above!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}