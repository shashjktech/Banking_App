import React, { useState } from 'react';

const TransactionModal = ({ isOpen, onClose, type, accountId, accountNumber, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // NEW: State to track and show the success screen
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !type) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpointMap = {
      deposit: `/customers/${accountId}/deposit`,
      withdraw: `/customers/${accountId}/withdraw`,
      transfer: `/customers/${accountId}/transfer`,
    };

    const payload = {
      amount: parseFloat(amount),
      referenceNote: referenceNote,
      ...(type === 'transfer' && { toAccountNumber }) 
    };

    try {
      const res = await fetch(`http://localhost:5000/bank/staff${endpointMap[type]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Show success UI instead of alert
        setSuccessMessage(data.message || 'Transaction completed successfully!');
        
        // Wait 2 seconds so the user can read it, then close and refresh
        setTimeout(() => {
          handleClose();
          onSuccess(); 
        }, 2000);

      } else {
        setError(data.message || `Failed to process ${type}`);
      }
    } catch (err) {
      setError('Network error. Unable to process transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setReferenceNote('');
    setToAccountNumber('');
    setError('');
    setSuccessMessage(''); // Reset success state
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', 
      alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        
        {/* SUCCESS UI */}
        {successMessage ? (
          <div style={{ textAlign: 'center', padding: '1rem 0', animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ 
              width: '60px', height: '60px', background: '#dcfce7', color: '#166534', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '2rem', margin: '0 auto 1.5rem auto' 
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#111', fontSize: '1.25rem' }}>Success!</h3>
            <p style={{ margin: 0, color: '#555', fontSize: '0.95rem' }}>{successMessage}</p>
          </div>
        ) : (
          /* DEFAULT FORM UI */
          <>
            <h3 style={{ marginTop: 0, textTransform: 'capitalize', fontSize: '1.25rem' }}>
              {type} Funds
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
              Selected Account: <strong style={{ color: '#111' }}>{accountNumber}</strong>
            </p>

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {type === 'transfer' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500, color: '#333' }}>Destination Account No.</label>
                  <input 
                    type="text" 
                    required 
                    value={toAccountNumber} 
                    onChange={(e) => setToAccountNumber(e.target.value)} 
                    style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', outline: 'none' }} 
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500, color: '#333' }}>Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  step="any"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500, color: '#333' }}>Reference Note (Optional)</label>
                <input 
                  type="text" 
                  value={referenceNote} 
                  placeholder="e.g. Branch cash deposit"
                  onChange={(e) => setReferenceNote(e.target.value)} 
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn-outline" onClick={handleClose} disabled={loading} style={{ padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-dark" disabled={loading} style={{ padding: '0.5rem 1rem', textTransform: 'capitalize' }}>
                  {loading ? 'Processing...' : `Confirm ${type}`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;