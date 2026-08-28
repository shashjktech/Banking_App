import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  const fetchCustomers = async (query = '', page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`http://localhost:5000/bank/staff/customers?search=${encodeURIComponent(query)}&page=${page}&limit=10`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setCustomers(data.data || data.customers); 
        setCurrentPage(data.meta.currentPage);
        setTotalPages(data.meta.totalPages);
        setTotalRecords(data.meta.totalCount);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error. Unable to reach server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers('', 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers(searchTerm, 1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchCustomers('', 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) fetchCustomers(searchTerm, currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) fetchCustomers(searchTerm, currentPage - 1);
  };

  const handleViewCustomer = (customerId, accountId, accountType) => {
  if (accountType === 'LOAN') {
    // Navigate to the specialized Loan Dashboard
    navigate(`/loan/${accountId}`);
  } else {
    // Default to the standard Customer Profile/Dashboard
    navigate(`/customer/${customerId}`);
  }
};

  const handleStatusChange = async (customerId, accountId, newStatus) => {
    if (!accountId) {
      alert("This customer does not have an active account.");
      return;
    }

    try {
      setCustomers(customers.map(c => {
        if (c.id === customerId && c.accounts && c.accounts.length > 0) {
          const updatedAccounts = [...c.accounts];
          updatedAccounts[0].status = newStatus;
          return { ...c, accounts: updatedAccounts };
        }
        return c;
      }));

      const res = await fetch(`http://localhost:5000/bank/staff/customers/${accountId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status on server');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update account status.');
      fetchCustomers(searchTerm, currentPage); 
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }; 
      case 'FROZEN':
      case 'SUSPENDED':
        return { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' }; 
      case 'CLOSED':
      case 'BLOCKED':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }; 
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' }; 
    }
  };

  return (
    <div className="profile-card" style={{ maxWidth: '1050px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Customer Directory</h3>
        <span style={{ fontSize: '0.875rem', color: '#666' }}>Total Records: {totalRecords}</span>
      </div>

      <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e5e5e5' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search by Customer Name or Account Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn-dark" disabled={loading}>Search</button>
          {searchTerm && (
            <button type="button" className="btn-outline" onClick={handleClear} disabled={loading}>Clear</button>
          )}
        </form>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ overflowX: 'auto', minHeight: '300px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e5e5', color: '#666' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Customer Name</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Contact</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Account Type</th> {/* 👈 NEW COLUMN HEADER */}
              <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading records...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No customers found.</td></tr>
            ) : (
              customers.map((customer) => {
                const primaryAccount = customer.accounts && customer.accounts.length > 0 ? customer.accounts[0] : null;
                const currentStatus = primaryAccount ? primaryAccount.status : 'N/A';
                const statusStyles = getStatusStyles(currentStatus);
                // Safely grab the account type name
                const accountTypeName = primaryAccount?.accountType?.name || primaryAccount?.accountType || 'N/A';

                return (
                  <tr key={customer.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#111' }}>{customer.firstName} {customer.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>
                        Joined: {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: '#555' }}>
                      <div>{customer.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{customer.phoneNumber || 'No phone'}</div>
                    </td>

                    {/* 👈 NEW COLUMN DATA CELL */}
                    <td style={{ padding: '1rem 0.5rem', color: '#333', textTransform: 'capitalize', fontWeight: 500 }}>
                      {accountTypeName}
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {primaryAccount ? (
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(customer.id, primaryAccount.id, e.target.value)}
                          style={{
                            backgroundColor: statusStyles.bg,
                            color: statusStyles.text,
                            border: `1px solid ${statusStyles.border}`,
                            padding: '0.3rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="FROZEN">FROZEN</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>No Account</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      {/* Grab the specific account ID and type to pass into the function */}
                      <button 
                        onClick={() => handleViewCustomer(
                          customer.id, 
                          primaryAccount?.id, 
                          primaryAccount?.accountType
                        )} 
                        className="btn-outline" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {primaryAccount?.accountType === 'LOAN' ? 'View Loan' : 'View Profile'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e5e5' }}>
          <button className="btn-outline" onClick={handlePrevPage} disabled={currentPage === 1 || loading} style={{ padding: '0.4rem 0.8rem' }}>
            &larr; Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: '#555' }}>
            Page <span style={{ fontWeight: 600 }}>{currentPage}</span> of <span style={{ fontWeight: 600 }}>{totalPages}</span>
          </span>
          <button className="btn-outline" onClick={handleNextPage} disabled={currentPage === totalPages || loading} style={{ padding: '0.4rem 0.8rem' }}>
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomersList;