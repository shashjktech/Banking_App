import React, { useState } from 'react';

const CreateAccount = ({ branch }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1. ADD LOAN FIELDS TO STATE
  const [formData, setFormData] = useState({
    accountType: 'SAVINGS',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    initialDeposit: '',
    loanAmount: '', // NEW
    loanTerm: '',   // NEW (in months)
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.accountType) return setError('Please select an account type');
    setError('');
    setStep(2);
  };

  const handleNext2 = (e) => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      return setError('First name, last name, and email are required.');
    }
    // Validation for Loan vs Regular accounts
    if (formData.accountType === 'LOAN' && (!formData.loanAmount || !formData.loanTerm)) {
      return setError('Loan Amount and Loan Term are required for Loan Accounts.');
    }
    setError('');
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/bank/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          initialDeposit: formData.initialDeposit ? parseFloat(formData.initialDeposit) : 0,
          loanAmount: formData.loanAmount ? parseFloat(formData.loanAmount) : 0,
          loanTerm: formData.loanTerm ? parseInt(formData.loanTerm) : 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Account opened successfully! Account Number: ${data.data.account.accountNumber}`);
        // Reset form
        setFormData({
          accountType: 'SAVINGS', firstName: '', lastName: '', email: '', 
          phoneNumber: '', address: '', initialDeposit: '', loanAmount: '', loanTerm: ''
        });
        setStep(1);
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (err) {
      setError('Network error. Unable to reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-card" style={{ maxWidth: '640px' }}>
      {message && (
        <div style={{ padding: '0.75rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}
      {error && <div className="error-banner">{error}</div>}

      {/* STEP 1: Select Account Type */}
      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Select Account Type</h3>
          <form onSubmit={handleNext}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#444' }}>
                Account Category
              </label>
              <select name="accountType" value={formData.accountType} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', outline: 'none' }}>
                <option value="SAVINGS">Savings Account</option>
                <option value="CURRENT">Current Account</option>
                <option value="LOAN">Loan Account</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-dark">Next &rarr;</button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: Personal Details */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Customer & Account Details</h3>
            <span className="badge">{formData.accountType}</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleNext2(); }} className="auth-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <label>Phone Number</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} style={{ width: '100%', padding: '0.65rem', border: '1px solid #e5e5e5', borderRadius: '6px' }} />
            </div>

            {/* 2. CONDITIONALLY RENDER LOAN OR DEPOSIT FIELDS */}
            {formData.accountType === 'LOAN' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#fefce8', padding: '1rem', borderRadius: '6px', border: '1px solid #fef08a', marginTop: '1rem' }}>
                <div>
                  <label style={{ color: '#854d0e' }}>Loan Principal Amount (₹)</label>
                  <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} min="1000" required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ color: '#854d0e' }}>Term Duration (Months)</label>
                  <input type="number" name="loanTerm" value={formData.loanTerm} onChange={handleChange} min="1" required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <label>Initial Opening Deposit (Optional)</label>
                <input type="number" name="initialDeposit" value={formData.initialDeposit} onChange={handleChange} placeholder="₹ 0.00" min="0" />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>&larr; Back</button>
              <button type="submit" className="btn-dark">Preview Details &rarr;</button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Preview Details */}
      {step === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Review Application</h3>
            <span className="badge">{formData.accountType}</span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="profile-row"><span className="profile-label">Customer Name</span><span className="profile-value">{formData.firstName} {formData.lastName}</span></div>
            <div className="profile-row"><span className="profile-label">Email Address</span><span className="profile-value">{formData.email}</span></div>
            
            <hr style={{ borderTop: '1px solid #eee', margin: '0.5rem 0' }} />
            
            <div className="profile-row"><span className="profile-label">Account Category</span><span className="profile-value">{formData.accountType}</span></div>
            
            {/* 3. CONDITIONALLY RENDER PREVIEW DATA */}
            {formData.accountType === 'LOAN' ? (
              <>
                <div className="profile-row"><span className="profile-label">Loan Principal</span><span className="profile-value">₹ {parseFloat(formData.loanAmount).toFixed(2)}</span></div>
                <div className="profile-row"><span className="profile-label">Loan Term</span><span className="profile-value">{formData.loanTerm} Months</span></div>
              </>
            ) : (
              <div className="profile-row"><span className="profile-label">Opening Deposit</span><span className="profile-value">₹ {formData.initialDeposit ? parseFloat(formData.initialDeposit).toFixed(2) : '0.00'}</span></div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="btn-outline" onClick={() => setStep(2)} disabled={loading}>&larr; Edit Details</button>
            <button type="button" className="btn-dark" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm & Open Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccount;