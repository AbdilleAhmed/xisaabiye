import React, { useState, useEffect } from "react";
import { useCustomerStore } from "../../zustand/slices/customer.slice";

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
    console.log("Component mounted, fetching customers...");
    fetchCustomers().catch(err => {
      console.error("Failed to fetch customers on mount:", err);
    });
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

    console.log("Data to send:", data);

    try {
      if (editingCustomerId) {
        console.log("🔄 Updating customer...");
        await updateCustomer(editingCustomerId, data);
        alert("Customer updated successfully!");
      } else {
        console.log("➕ Adding new customer...");
        await addCustomer(data);
        alert("Customer added successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to save customer: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        console.log("🗑️ Deleting customer ID:", id);
        await deleteCustomer(id);
        alert("Customer deleted successfully!");
        resetForm();
      } catch (error) {
        console.error("❌ Error deleting customer:", error);
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

  console.log("📊 Current state - Customers:", customers.length, "Filtered:", filteredCustomers.length);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* PAGE HEADER */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>
            Customers
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Manage your customer database
          </p>
        </div>

        {/* ADD CUSTOMER FORM */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #ddd",
            padding: "30px",
            marginBottom: "40px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "25px", color: "#333" }}>
            {editingCustomerId ? "✏️ Edit Customer" : "➕ Add Customer"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
                opacity: loading ? 0.6 : 1,
              }}
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
                opacity: loading ? 0.6 : 1,
              }}
            />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
                opacity: loading ? 0.6 : 1,
              }}
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows="3"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
                fontFamily: "inherit",
                resize: "vertical",
                opacity: loading ? 0.6 : 1,
              }}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: loading ? "#999" : "#000",
                  color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#333")}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#000")}
              >
                {loading ? "Processing..." : (editingCustomerId ? "Update" : "Add")}
              </button>

              {editingCustomerId && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(editingCustomerId)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: loading ? "#999" : "#ff4444",
                      color: "#fff",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#cc0000")}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#ff4444")}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f5f5f5",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#e0e0e0")}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#f5f5f5")}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
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
          <h2 style={{ marginBottom: "20px", color: "#333" }}>
            👥 All Customers ({filteredCustomers.length})
          </h2>

      
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="🔍 Search customers..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #2196F3",
                fontSize: "15px",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#000")}
              onBlur={(e) => (e.target.style.borderColor = "#2196F3")}
            />
            {searchTerm && (
              <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
                Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

         
          {loading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ color: "#666" }}>Loading...</p>
            </div>
          )}

          {/* CUSTOMERS LIST */}
          {!loading && filteredCustomers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
                {searchTerm
                  ? `No customers found matching "${searchTerm}"`
                  : "No customers yet. Add your first customer above!"}
              </p>
            </div>
          ) : !loading && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {currentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      backgroundColor: editingCustomerId === customer.id ? "#fff3cd" : "#fff",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* CUSTOMER INFO */}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "bold" }}>
                        {customer.firstname} {customer.lastname}
                      </p>
                      <p style={{ margin: "0 0 5px 0", color: "#666", fontSize: "14px" }}>
                        📞 {customer.phone || "No phone"}
                      </p>
                      {customer.notes && (
                        <p style={{ margin: "0", fontSize: "13px", color: "#888", fontStyle: "italic" }}>
                          📝 {customer.notes}
                        </p>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: "flex", gap: "8px", marginLeft: "15px" }}>
                      <button
                        onClick={() => handleEdit(customer)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#FFC107",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "14px",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFB300")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "#FFC107")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#f44336",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "14px",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#da190b")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  gap: "10px",
                  marginTop: "20px" 
                }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      backgroundColor: currentPage === 1 ? "#f5f5f5" : "#fff",
                      color: currentPage === 1 ? "#999" : "#000",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      transition: "all 0.3s",
                    }}
                  >
                    Previous
                  </button>
                  
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      backgroundColor: currentPage === totalPages ? "#f5f5f5" : "#fff",
                      color: currentPage === totalPages ? "#999" : "#000",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      transition: "all 0.3s",
                    }}
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