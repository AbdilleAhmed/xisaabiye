import React, { useState } from "react";
import { useCustomerStore } from "../../zustand/slices/customer.slice";

export default function CustomersPage() {
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);

  // FORM STATES
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  // SEARCH STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetched, setIsFetched] = useState(false);

  // FORM HANDLERS
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      alert("Please fill in first and last name");
      return;
    }

    const data = {
      firstname: firstName,
      lastname: lastName,
      phone: phoneNumber,
      notes,
    };

    try {
      if (editingCustomerId) {
        await updateCustomer(editingCustomerId, data);
        alert("Customer updated!");
      } else {
        await addCustomer(data);
        alert("Customer added!");
      }
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save customer. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        alert("Customer deleted!");
        resetForm();
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to delete customer. Please try again.");
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomerId(customer.id);
    setFirstName(customer.firstname);
    setLastName(customer.lastname);
    setPhoneNumber(customer.phone || "");
    setNotes(customer.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFetchCustomers = async () => {
    try {
      await fetchCustomers();
      setIsFetched(true);
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert("Failed to fetch customers.");
    }
  };

  const resetForm = () => {
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
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
              }}
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
              }}
            />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
              }}
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows="3"
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#000",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#333")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#000")}
              >
                {editingCustomerId ? "Update" : "Add"}
              </button>

              {editingCustomerId && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(editingCustomerId)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#ff4444",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#cc0000")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff4444")}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f5f5f5",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* CUSTOMERS LIST SECTION */}
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
            👥 All Customers ({customers.length})
          </h2>

          {/* FETCH BUTTON */}
          <button
            onClick={handleFetchCustomers}
            style={{
              padding: "12px 24px",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
          >
            Fetch All Customers
          </button>

          {/* SEARCH BOX */}
          {isFetched && (
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="🔍 Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          )}

          {/* CUSTOMERS LIST */}
          {isFetched ? (
            <>
              {filteredCustomers.length === 0 ? (
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
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredCustomers.map((customer) => (
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
              )}
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
                Click "Fetch All Customers" to load your customers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}