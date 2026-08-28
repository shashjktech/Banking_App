import React, { useState, useEffect, useCallback } from 'react';

const GlobalTransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    accountNumber: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  const API_BASE_URL = 'http://localhost:5000/bank/staff';

  const fetchGlobalTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: page,
        limit: 15,
        ...(filters.accountNumber && { accountNumber: filters.accountNumber }),
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const res = await fetch(`${API_BASE_URL}/transactions?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });

      const json = await res.json();

      if (res.ok) {
        setTransactions(json.data);
        setCurrentPage(json.meta.currentPage);
        setTotalPages(json.meta.totalPages);
        setTotalRecords(json.meta.totalCount);
      } else {
        setError(json.message || 'Failed to fetch global transactions.');
      }
    } catch (err) {
      setError('Network error. Unable to reach server.');
    } finally {
      setLoading(false);
    }
  }, [filters, API_BASE_URL]);

  // Initial load
  useEffect(() => {
    fetchGlobalTransactions(1);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchGlobalTransactions(1);
  };

  const clearFilters = () => {
    setFilters({ accountNumber: '', type: '', startDate: '', endDate: '' });
    // setTimeout ensures state clears before fetching
    setTimeout(() => fetchGlobalTransactions(1), 0); 
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111' }}>Global Transaction Ledger</h2>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>Total Records: {totalRecords}</span>
      </div>

      {/* Filter Control Bar */}
      <form onSubmit={applyFilters} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem' }}>Account Number</label>
          <input type="text" name="accountNumber" placeholder="Search account..." value={filters.accountNumber} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem' }}>Type</label>
          <select name="type" value={filters.type} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}>
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem' }}>Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem' }}>End Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', flex: '1 1 100%' }}>
          <button type="submit" className="btn-dark" style={{ padding: '0.5rem 1.5rem' }}>Apply Filters</button>
          <button type="button" onClick={clearFilters} className="btn-outline" style={{ padding: '0.5rem 1.5rem' }}>Clear</button>
        </div>
      </form>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

      {/* Global Data Table */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f9f9fa', borderBottom: '2px solid #e5e5e5', color: '#444' }}>
              <th style={{ padding: '1rem' }}>Date & Time</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Sender Acc.</th>
              <th style={{ padding: '1rem' }}>Receiver Acc.</th>
              <th style={{ padding: '1rem' }}>Processed By</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading global ledger...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No transactions found matching your criteria.</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem', color: '#555' }}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                      background: tx.type === 'DEPOSIT' ? '#dcfce7' : tx.type === 'WITHDRAWAL' ? '#fee2e2' : '#e0f2fe',
                      color: tx.type === 'DEPOSIT' ? '#166534' : tx.type === 'WITHDRAWAL' ? '#991b1b' : '#0369a1'
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#111' }}>
                    {tx.fromaccount?.accountNumber || <span style={{ color: '#aaa' }}>N/A (Cash)</span>}
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#111' }}>
                    {tx.toAccount?.accountNumber || <span style={{ color: '#aaa' }}>N/A (Cash)</span>}
                  </td>
                  <td style={{ padding: '1rem', color: '#666' }}>
                    {tx.staff?.username || 'System'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#111' }}>
                    ₹{Number(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <button className="btn-outline" onClick={() => fetchGlobalTransactions(currentPage - 1)} disabled={currentPage === 1}>
            &larr; Previous
          </button>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>Page <strong>{currentPage}</strong> of {totalPages}</span>
          <button className="btn-outline" onClick={() => fetchGlobalTransactions(currentPage + 1)} disabled={currentPage === totalPages}>
            Next &rarr;
          </button>
        </div>
      )}

    </div>
  );
};

export default GlobalTransactionsList;