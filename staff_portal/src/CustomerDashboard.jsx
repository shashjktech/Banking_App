import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionHistory from './TransactionHistory';
import TransactionModal from './TransactionModal'; 

const CustomerDashboard = () => {
  const { customerId } = useParams(); 
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 2. STATE TO CONTROL WHICH MODAL IS OPEN
  const [activeModal, setActiveModal] = useState(null); // 'deposit', 'withdraw', 'transfer', or null

  // Pagination for transactions
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = 'http://localhost:5000/bank';

  // Fetch full customer details, accounts, and transaction history
  const fetchCustomerData = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/staff/customer/${customerId}?page=${page}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const json = await res.json();

      if (res.ok) {
        setCustomer(json.data.customer);
        setAccounts(json.data.accounts);
        
        if (json.data.accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(json.data.accounts[0]);
        }

        setTransactions(json.data.transactions || []);
        setCurrentPage(json.meta?.currentPage || 1);
        setTotalPages(json.meta?.totalPages || 1);
      } else {
        setError(json.message || 'Failed to fetch customer profile.');
      }
    } catch (err) {
      setError('Network error. Unable to reach server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerData(1);
    }
  }, [customerId]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchCustomerData(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchCustomerData(currentPage - 1);
    }
  };

  if (loading && !customer) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
        Loading secure customer profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="error-banner">{error}</div>
        <button className="btn-outline" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          &larr; Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Top Bar / Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn-outline" onClick={() => navigate(-1)} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          &larr; Back to Dashboard
        </button>
      </div>

      <main>
        {customer && (
          <>
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{customer.firstName} {customer.lastName}</h2>
                <p style={{ margin: '0.3rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                  Customer ID: {customer.id}
                </p>
              </div>

              {/* 3. STAFF ACTION BUTTONS CONNECTED TO STATE */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn-dark" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  onClick={() => setActiveModal('deposit')}
                >
                  + Deposit
                </button>
                <button 
                  className="btn-outline" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  onClick={() => setActiveModal('withdraw')}
                >
                  - Withdraw
                </button>
                <button 
                  className="btn-outline" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  onClick={() => setActiveModal('transfer')}
                >
                  ⇄ Transfer
                </button>
              </div>
            </div>

            {/* Grid Layout: Account Overview & Profile Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Account Card */}
              <div className="profile-card" style={{ margin: 0, background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ marginTop: '0', fontSize: '1.1rem', color: '#333' }}>Active Account</h3>
                
                {accounts.length > 0 ? (
                  <div>
                    <select 
                      value={selectedAccount?.id} 
                      onChange={(e) => setSelectedAccount(accounts.find(acc => acc.id === e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountNumber} ({acc.accountType})
                        </option>
                      ))}
                    </select>

                    <div style={{ lineHeight: '2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                        <span style={{ color: '#666' }}>Account Number</span>
                        <strong>{selectedAccount?.accountNumber}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginTop: '0.5rem' }}>
                        <span style={{ color: '#666' }}>Type</span>
                        <strong>{selectedAccount?.accountType}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginTop: '0.5rem' }}>
                        <span style={{ color: '#666' }}>Balance</span>
                        <strong style={{ color: '#166534' }}>₹ {Number(selectedAccount?.balance || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>No active accounts found for this customer.</p>
                )}
              </div>

              {/* Personal Details Card */}
              <div className="profile-card" style={{ margin: 0, background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ marginTop: '0', fontSize: '1.1rem', color: '#333' }}>Customer Details</h3>
                <div style={{ lineHeight: '2', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#666' }}>Email</span>
                    <strong>{customer.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginTop: '0.5rem' }}>
                    <span style={{ color: '#666' }}>Phone</span>
                    <strong>{customer.phoneNumber || 'Not provided'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginTop: '0.5rem' }}>
                    <span style={{ color: '#666' }}>Address</span>
                    <strong style={{ textAlign: 'right', maxWidth: '60%' }}>{customer.address || 'Not provided'}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Transaction History Component */}
            <TransactionHistory 
              transactions={transactions} 
              currentAccountId={selectedAccount?.id} 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onNextPage={handleNextPage} 
              onPrevPage={handlePrevPage} 
            />

            {/* 4. MODAL RENDERED HERE */}
            <TransactionModal 
              isOpen={activeModal !== null}
              type={activeModal}
              onClose={() => setActiveModal(null)}
              accountId={selectedAccount?.id}
              accountNumber={selectedAccount?.accountNumber}
              onSuccess={() => {
                // When transaction succeeds, refresh the data to show new balance & history!
                fetchCustomerData(1); 
              }} 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;