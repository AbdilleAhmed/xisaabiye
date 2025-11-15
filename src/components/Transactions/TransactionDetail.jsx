import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Check, X, CreditCard } from "lucide-react";
import { useCustomerStore } from "../../zustand/slices/customer.slice";
import { useTransactionStore } from "../../zustand/slices/transactions.slice";
import "./TransactionDetail.css";

// ============================================================================
// CONSTANTS - Define fixed values here, not scattered throughout the code
// ============================================================================
const TRANSACTION_TYPES = {
  CREDIT: "credit",
  DEBIT: "debit",
};

const TRANSACTION_DESCRIPTIONS = {
  credit: "Payment received from customer",
  debit: "Amount owed by customer",
};

const MESSAGES = {
  SELECT_CUSTOMER: "Please select a customer",
  INVALID_AMOUNT: "Please enter a valid amount",
  ADD_SUCCESS: "Transaction added successfully!",
  DELETE_SUCCESS: "Transaction deleted successfully!",
  UPDATE_SUCCESS: "Transaction updated successfully!",
  DELETE_CONFIRM: "Are you sure you want to delete this transaction?",
  FETCH_CUSTOMERS_ERROR: "Failed to load customers",
  FETCH_TRANSACTIONS_ERROR: "Failed to load transactions",
  ADD_TRANSACTION_ERROR: "Failed to add transaction",
  DELETE_TRANSACTION_ERROR: "Failed to delete transaction",
  UPDATE_TRANSACTION_ERROR: "Failed to update transaction",
};




const parseAmount = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};


const formatCurrency = (amount) => {
  return `$${parseAmount(amount).toFixed(2)}`;
};


const getBalanceClass = (balance) => {
  return parseAmount(balance) >= 0 ? "balance-positive" : "balance-negative";
};


const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || "An error occurred";
};


export default function TransactionDetail() {

  const { customers, fetchCustomers } = useCustomerStore();
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    fetchTransactionsByCustomer,
  } = useTransactionStore();



  // Customer selection
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Message notifications
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Transaction fetching
  const [isFetched, setIsFetched] = useState(false);

  // Loading states - separated for clarity
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Add transaction form
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState(TRANSACTION_TYPES.CREDIT);

  // Edit transaction form
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editedType, setEditedType] = useState(TRANSACTION_TYPES.CREDIT);

  

  /**
   * Display a temporary message to the user
   */
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  /**
   * Validate transaction form inputs
   */
  const validateTransactionForm = (amount) => {
    if (!selectedCustomer) {
      showMessage(MESSAGES.SELECT_CUSTOMER, "error");
      return false;
    }

    if (!amount || parseAmount(amount) <= 0) {
      showMessage(MESSAGES.INVALID_AMOUNT, "error");
      return false;
    }

    return true;
  };

  /**
   * Reset the add transaction form
   */
  const resetAddTransactionForm = () => {
    setAmount("");
    setTransactionType(TRANSACTION_TYPES.CREDIT);
  };

  /**
   * Reset the edit transaction form
   */
  const resetEditForm = () => {
    setEditingTransactionId(null);
    setEditedAmount("");
    setEditedType(TRANSACTION_TYPES.CREDIT);
  };

  /**
   * Get the currently selected customer data
   */
  const getSelectedCustomerData = () => {
    return customers.find((c) => c.id === parseInt(selectedCustomer));
  };

  /**
   * Calculate the current balance from transactions
   */
  const calculateBalance = () => {
    if (transactions.length === 0) return 0;
    const balance = transactions[0]?.balance_after;
    return parseAmount(balance);
  };

  /**
   * Filter customers based on search term
   */
  const getFilteredCustomers = () => {
    if (!searchTerm) return customers;

    const search = searchTerm.toLowerCase();
    return customers.filter((customer) => {
      const firstName = customer.firstname?.toLowerCase() || "";
      const lastName = customer.lastname?.toLowerCase() || "";
      const phone = customer.phone?.toLowerCase() || "";

      return (
        firstName.includes(search) ||
        lastName.includes(search) ||
        phone.includes(search)
      );
    });
  };

  // ========================================================================
  // SIDE EFFECTS - useEffect hooks
  // ========================================================================

  /**
   * Fetch all customers when component mounts
   */
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        console.log("Fetching customers...");
        await fetchCustomers();
        console.log("Customers fetched successfully");
      } catch (error) {
        console.error("Error fetching customers:", error);
        showMessage(
          `${MESSAGES.FETCH_CUSTOMERS_ERROR}: ${getErrorMessage(error)}`,
          "error"
        );
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, [fetchCustomers]);

  // ========================================================================
  // EVENT HANDLERS - User interaction functions
  // ========================================================================

  /**
   * Handle adding a new transaction
   */
  const handleAddTransaction = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateTransactionForm(amount)) {
      return;
    }

    setLoadingTransactions(true);
    try {
      const transactionData = {
        customer_id: parseInt(selectedCustomer),
        amount: parseAmount(amount),
        transaction_type: transactionType,
      };

      console.log("Adding transaction:", transactionData);
      await addTransaction(transactionData);
      showMessage(MESSAGES.ADD_SUCCESS, "success");
      resetAddTransactionForm();
      await fetchTransactionsByCustomer(selectedCustomer);
    } catch (error) {
      console.error("Error adding transaction:", error);
      showMessage(
        `${MESSAGES.ADD_TRANSACTION_ERROR}: ${getErrorMessage(error)}`,
        "error"
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  /**
   * Handle selecting a customer
   */
  const handleSelectCustomer = async (customerId) => {
    setSelectedCustomer(customerId);
    setSearchTerm("");
    setIsFetched(false);

    if (customerId) {
      setLoadingTransactions(true);
      try {
        console.log("Fetching transactions for customer:", customerId);
        await fetchTransactionsByCustomer(customerId);
        setIsFetched(true);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        showMessage(
          `${MESSAGES.FETCH_TRANSACTIONS_ERROR}: ${getErrorMessage(error)}`,
          "error"
        );
      } finally {
        setLoadingTransactions(false);
      }
    }
  };

  /**
   * Handle editing a transaction
   */
  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
    setEditedAmount(transaction.amount);
    setEditedType(transaction.transaction_type);
  };

  /**
   * Handle updating a transaction
   */
  const handleUpdateTransaction = async (transactionId) => {
    // Validate form
    if (!editedAmount || parseAmount(editedAmount) <= 0) {
      showMessage(MESSAGES.INVALID_AMOUNT, "error");
      return;
    }

    setLoadingTransactions(true);
    try {
      const updateData = {
        amount: parseAmount(editedAmount),
        transaction_type: editedType,
      };

      console.log("Updating transaction:", transactionId, updateData);
      await updateTransaction(transactionId, updateData);
      resetEditForm();
      showMessage(MESSAGES.UPDATE_SUCCESS, "success");
      await fetchTransactionsByCustomer(selectedCustomer);
    } catch (error) {
      console.error("Error updating transaction:", error);
      showMessage(
        `${MESSAGES.UPDATE_TRANSACTION_ERROR}: ${getErrorMessage(error)}`,
        "error"
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  /**
   * Handle deleting a transaction
   */
  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm(MESSAGES.DELETE_CONFIRM)) {
      return;
    }

    setLoadingTransactions(true);
    try {
      console.log("Deleting transaction:", transactionId);
      await deleteTransaction(transactionId);
      showMessage(MESSAGES.DELETE_SUCCESS, "success");
      await fetchTransactionsByCustomer(selectedCustomer);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showMessage(
        `${MESSAGES.DELETE_TRANSACTION_ERROR}: ${getErrorMessage(error)}`,
        "error"
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  /**
   * Handle canceling edit mode
   */
  const handleCancelEdit = () => {
    resetEditForm();
  };

  // ========================================================================
  // DERIVED STATE - Calculate values from state
  // ========================================================================
  const filteredCustomers = getFilteredCustomers();
  const selectedCustomerData = getSelectedCustomerData();
  const currentBalance = calculateBalance();
  const isTransactionFormValid = selectedCustomer && amount && parseAmount(amount) > 0;

  // ========================================================================
  // RENDER - UI components
  // ========================================================================
  return (
    <div className="transaction-container">
      <div className="transaction-wrapper">
        {/* HEADER */}
        <div className="transaction-header">
          <h1 className="transaction-title">
            <CreditCard size={32} className="header-icon" />
            Transactions
          </h1>
          <p className="transaction-subtitle">Manage customer transactions</p>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {/* MAIN GRID - Two columns: Search & Add Transaction */}
        <div className="transaction-grid">
          {/* LEFT COLUMN - CUSTOMER SEARCH */}
          <div className="card">
            <h2 className="card-title">
              <Search size={20} className="card-icon" />
              Search Customer
            </h2>

            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              disabled={loadingCustomers}
            />

            <div className="customer-list">
              {loadingCustomers && filteredCustomers.length === 0 ? (
                <p className="list-message">Loading customers...</p>
              ) : filteredCustomers.length === 0 ? (
                <p className="list-message">No customers found</p>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    className={`customer-item ${
                      selectedCustomer === customer.id ? "selected" : ""
                    }`}
                  >
                    <p className="customer-name">
                      {customer.firstname} {customer.lastname}
                    </p>
                    <p className="customer-phone">
                      {customer.phone || "No phone"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - ADD TRANSACTION */}
          <div className="card">
            <h2 className="card-title">
              <Plus size={20} className="card-icon" />
              {selectedCustomer ? "Add Transaction" : "Select a Customer"}
            </h2>

            {selectedCustomer && selectedCustomerData && (
              <div className="customer-info">
                <p className="info-row">
                  <strong>Customer:</strong> {selectedCustomerData.firstname}{" "}
                  {selectedCustomerData.lastname}
                </p>
                <p className="info-row">
                  <strong>Balance:</strong>{" "}
                  <span className={`balance-display ${getBalanceClass(currentBalance)}`}>
                    {formatCurrency(currentBalance)}
                  </span>
                </p>
              </div>
            )}

            {selectedCustomer ? (
              <form onSubmit={handleAddTransaction} className="form">
                {/* Transaction Type Field */}
                <div className="form-group">
                  <label className="form-label">Type:</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="form-select"
                    disabled={loadingTransactions}
                  >
                    <option value={TRANSACTION_TYPES.CREDIT}>
                      Credit - Payment received
                    </option>
                    <option value={TRANSACTION_TYPES.DEBIT}>
                      Debit - Amount owed
                    </option>
                  </select>
                  <p className="form-description">
                    {TRANSACTION_DESCRIPTIONS[transactionType]}
                  </p>
                </div>

                {/* Amount Field */}
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
                    disabled={loadingTransactions}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loadingTransactions || !isTransactionFormValid}
                >
                  <Plus size={18} className="button-icon" />
                  {loadingTransactions ? "Adding..." : "Add Transaction"}
                </button>
              </form>
            ) : (
              <p className="empty-message">
                Select a customer from the list to add a transaction
              </p>
            )}
          </div>
        </div>

        {/* TRANSACTIONS TABLE - Only show if transactions exist */}
        {selectedCustomer && isFetched && transactions.length > 0 && (
          <div className="card">
            <div className="transactions-header">
              <h2 className="transactions-title">
                Transactions for {selectedCustomerData?.firstname}{" "}
                {selectedCustomerData?.lastname}
              </h2>
              <div className="balance-section">
                <p className="balance-label">Current Balance:</p>
                <p className={`balance-value ${getBalanceClass(currentBalance)}`}>
                  {formatCurrency(currentBalance)}
                </p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="transaction-table">
                <thead className="table-header">
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {transactions.map((transaction) => {
                    const transactionBalance = parseAmount(transaction.balance_after);
                    const isEditing = editingTransactionId === transaction.id;

                    return (
                      <tr key={transaction.id}>
                        {/* Type Column */}
                        <td>
                          {isEditing ? (
                            <select
                              value={editedType}
                              onChange={(e) => setEditedType(e.target.value)}
                              className="type-select"
                            >
                              <option value={TRANSACTION_TYPES.CREDIT}>Credit</option>
                              <option value={TRANSACTION_TYPES.DEBIT}>Debit</option>
                            </select>
                          ) : (
                            <div>
                              <span className="transaction-type">
                                {transaction.transaction_type}
                              </span>
                              <p className="transaction-type-description">
                                {TRANSACTION_DESCRIPTIONS[transaction.transaction_type]}
                              </p>
                            </div>
                          )}
                        </td>

                        {/* Amount Column */}
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedAmount}
                              onChange={(e) => setEditedAmount(e.target.value)}
                              min="0.01"
                              step="0.01"
                              className="amount-input"
                            />
                          ) : (
                            <span className="amount-display">
                              {formatCurrency(transaction.amount)}
                            </span>
                          )}
                        </td>

                        {/* Balance Column */}
                        <td>
                          <span
                            className={`balance-text ${getBalanceClass(transactionBalance)}`}
                          >
                            {formatCurrency(transactionBalance)}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td>
                          <div className="action-buttons">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdateTransaction(transaction.id)}
                                  className="button button-save"
                                  title="Save changes"
                                  disabled={loadingTransactions}
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="button button-cancel"
                                  title="Cancel editing"
                                  disabled={loadingTransactions}
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="button button-edit"
                                  title="Edit transaction"
                                  disabled={loadingTransactions}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="button button-delete"
                                  title="Delete transaction"
                                  disabled={loadingTransactions}
                                >
                                  <Trash2 size={16} />
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

        {/* EMPTY STATE - No transactions */}
        {selectedCustomer && isFetched && transactions.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-message">
              No transactions yet. Add your first transaction above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}