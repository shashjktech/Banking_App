import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Import your existing TransactionHistory component if you have one
// import TransactionHistory from './TransactionHistory'; 

const LoanDashboard = () => {
  const navigate = useNavigate();
  const { accountId } = useParams(); // URL parameter
  
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/bank'; 

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/staff/loan/${accountId}`, { 
            credentials: 'include' 
        });

        if (res.ok) {
          const json = await res.json();
          setLoanData(json.data);
        } else {
          setError('Failed to load loan details. Please try again.');
        }
      } catch (err) {
        setError('Network error while fetching loan data.');
      } finally {
        setLoading(false);
      }
    };
    
    if (accountId) fetchLoanData();
  }, [accountId]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading Loan Details...</div>;
  if (error) return <div className="error-banner" style={{ textAlign: 'center', marginTop: '20vh' }}>{error}</div>;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Loan Dashboard</h1>
        <button className="btn-outline" onClick={() => navigate(-1)}>&larr; Back</button>
      </div>

      {loanData && (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#555', fontSize: '1.1rem' }}>Personal Loan</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
              
              {/* Outstanding Principal */}
              <div>
                  <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>Outstanding Principal</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#991b1b', marginTop: '0.5rem' }}>
                      ₹{Number(loanData.loanDetails.principalRemaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
              </div>

              {/* EMI Amount */}
              <div style={{ background: '#fefce8', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #fef08a' }}>
                  <span style={{ fontSize: '0.85rem', color: '#854d0e', textTransform: 'uppercase' }}>Monthly EMI</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111', marginTop: '0.5rem' }}>
                      ₹{loanData.loanDetails.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <button className="btn-dark" style={{ marginTop: '1rem', width: '100%' }}>Pay EMI Now</button>
              </div>
          </div>

          <hr style={{ borderTop: '1px solid #eee', margin: '2rem 0' }} />

          {/* Loan Terms Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              <div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>Interest Rate</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{loanData.loanDetails.interestRate.toFixed(2)}% p.a.</div>
              </div>
              <div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>Loan Term</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{loanData.loanDetails.termMonths} Months</div>
              </div>
              <div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>Account Number</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', fontFamily: 'monospace' }}>{loanData.accountNumber}</div>
              </div>
              <div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>Status</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: loanData.status === 'ACTIVE' ? '#166534' : '#991b1b' }}>{loanData.status}</div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDashboard;