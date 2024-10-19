"use client";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs"; // Import dayjs for date formatting
import "./CreateBill.css"; // Assuming you store the CSS in CreateBill.css

const CreateBill = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false); // State for loading bills
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
  });

  const [bills, setBills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [billsPerPage] = useState(5); // Number of bills per page
  const [totalBills, setTotalBills] = useState(0); // Total number of bills
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [showBills, setShowBills] = useState(false); // State to toggle views
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        amount: formData.amount,
      }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {
      alert(data.message);
      setFormData({
        name: "",
        phone: "",
        amount: "",
      });
      fetchBills(); // Refresh the list of bills after adding a new one
    } else {
      alert(`Error: ${data.message}`);
    }
  };

  // Function to fetch all bills from the API with pagination
  const fetchBills = async (page = currentPage) => {
    setIsLoadingBills(true); // Set loading state for bills fetching
    const response = await fetch(`/api/bills?page=${page}&limit=${billsPerPage}`);
    const data = await response.json();
    setIsLoadingBills(false); // Reset loading state

    if (response.ok) {
      setBills(data.bills); // Set the bills state with the fetched data
      setTotalBills(data.total); // Set the total number of bills
      setTotalPages(data.totalPages); // Set the total number of pages
    } else {
      alert(`Error fetching bills: ${data.message}`);
    }
  };

  // Handle toggle between Create Bill and All Bills view
  const toggleView = () => {
    if (showBills) {
      setShowBills(false);
      setFormData({ name: "", phone: "", amount: "" }); // Reset form fields
      setCurrentPage(1); // Reset to the first page when switching back
    } else {
      fetchBills(); // Fetch bills when switching to view
      setShowBills(true);
    }
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchBills(pageNumber); // Fetch bills for the new page
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter bills based on the search query
  const filteredBills = bills.filter((bill) =>
    bill.name.toLowerCase().includes(searchQuery) ||
    bill.phone.includes(searchQuery) || // Assuming phone is stored as a string
    bill.amount.toString().includes(searchQuery) // Convert amount to string for search
  );

  return (
    <div className="form-container">
      <h1>{showBills ? "All Bills" : "Create Bill"}</h1>
      {showBills ? (
        <div>
          {isLoadingBills ? (
            <div className="loading-spinner"></div> // Show loading spinner for bills
          ) : (
            <>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input" // Add your styling class
              />
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Created At</th> {/* Show created_at instead of ID */}
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length > 0 ? (
                    filteredBills.map((bill) => (
                      <tr key={bill.id}>
                        <td>{bill.name}</td>
                        <td>{bill.phone}</td>
                        <td>{bill.amount}</td>
                        <td>{dayjs(bill.created_at).format("DD-MM-YYYY hh:mm A")}</td> {/* Format created_at with AM/PM */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No bills found</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pagination">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
              </div>
            </>
          )}

          <button onClick={toggleView} className="btn">Create New Bill</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="number"
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              maxLength="10"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={`btn ${isLoading ? "loading" : ""}`}>
            <span className="btn-text">Save</span>
            {isLoading && <span className="loading-spinner"></span>}
          </button>

          <button type="button" onClick={toggleView} className="btn">
            View All Bills
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateBill;
