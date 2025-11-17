import React, { useState, useEffect } from "react";
import { useCustomerStore } from "../../zustand/slices/customer.slice";
import "./CustomersPage.css";

export default function CustomersPage() {
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const loading = useCustomerStore((state) => state.loading);

  // FORM STATES
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  // SEARCH STATES
  const [searchTerm, setSearchTerm] = useState("");
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch customers automatically on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // FORM HANDLERS
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== FORM SUBMIT ===");
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Phone:", phoneNumber);
    console.log("Notes:", notes);
    console.log("Editing ID:", editingCustomerId);

    if (!firstName.trim() || !lastName.trim()) {
      alert("Please fill in first and last name");
      return;
    }

    const data = {
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      phone: phoneNumber.trim(),
      notes: notes.trim(),
    };

    try {
      if (editingCustomerId) {
        console.log("🔄 Updating customer...");
        await updateCustomer(editingCustomerId, data);
        alert("Customer updated successfully!");
      } else {
        await addCustomer(data);
        alert("Customer added successfully!");
      }
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to save customer: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        alert("Customer deleted successfully!");
        resetForm();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Unknown error";
        alert(`Failed to delete customer: ${errorMessage}`);
      }
    }
  };

  const handleEdit = (customer) => {
    console.log("✏️ Editing customer:", customer);
    setEditingCustomerId(customer.id);
    setFirstName(customer.firstname);
    setLastName(customer.lastname);
    setPhoneNumber(customer.phone || "");
    setNotes(customer.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    console.log("🔄 Resetting form");
    setEditingCustomerId(null);
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setNotes("");
  };

  // SEARCH FILTER
  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.firstname.toLowerCase().includes(search) ||
      c.lastname.toLowerCase().includes(search) ||
      (c.phone && c.phone.toLowerCase().includes(search)) ||
      (c.notes && c.notes.toLowerCase().includes(search))
    );
  });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="customers-page">
      <div className="customers-page-wrapper">
        {/* PAGE HEADER */}
        <div className="customers-header">
          <h1 className="customers-title">Customers</h1>
          <p className="customers-subtitle">Manage your customer database</p>
        </div>

        {/* ADD CUSTOMER FORM */}
        <div className="customer-form-card">
          <h2 className="customer-form-title">
            {editingCustomerId ? "✏️ Edit Customer" : "➕ Add Customer"}
          </h2>

          <form onSubmit={handleSubmit} className="customer-form">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
              disabled={loading}
              className="customer-input"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
              disabled={loading}
              className="customer-input"
            />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              disabled={loading}
              className="customer-input"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows="3"
              disabled={loading}
              className="customer-textarea"
            />

            <div className="form-button-group">
              <button
                type="submit"
                disabled={loading}
                className="form-button form-button-submit"
              >
                {loading ? "Processing..." : (editingCustomerId ? "Update" : "Add")}
              </button>

              {editingCustomerId && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(editingCustomerId)}
                    disabled={loading}
                    className="form-button form-button-delete"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="form-button form-button-cancel"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* CUSTOMERS LIST */}
        <div className="customers-list-card">
          <h2 className="customers-list-title">
            👥 All Customers ({filteredCustomers.length})
          </h2>

          {/* SEARCH BAR */}
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search customers..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <p className="search-results-text">
                Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="loading-container">
              <p className="loading-text">Loading...</p>
            </div>
          )}

          {/* CUSTOMERS LIST */}
          {!loading && filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">
                {searchTerm
                  ? `No customers found matching "${searchTerm}"`
                  : "No customers yet. Add your first customer above!"}
              </p>
            </div>
          ) : !loading && (
            <>
              <div className="customers-list">
                {currentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`customer-item ${editingCustomerId === customer.id ? "editing" : ""}`}
                  >
                    {/* CUSTOMER INFO */}
                    <div className="customer-info">
                      <p className="customer-name">
                        {customer.firstname} {customer.lastname}
                      </p>
                      <p className="customer-phone">
                        📞 {customer.phone || "No phone"}
                      </p>
                      {customer.notes && (
                        <p className="customer-notes">
                          📝 {customer.notes}
                        </p>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="customer-actions">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="customer-action-button customer-action-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="customer-action-button customer-action-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}