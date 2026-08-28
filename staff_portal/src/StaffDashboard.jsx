import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAccount from './CreateAccount';
import CustomersList from './CustomerList';
import GlobalTransactionsList from './GlobalTransactionsList';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('My Profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/bank/staff/profile', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.data);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to load profile');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogoutClick = async () => {
    try {
      await fetch('http://localhost:5000/bank/staff/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      navigate('/');
    }
  };

  const navItems = ['Open Account', 'Customers', 'Transactions', 'My Profile'];

  return (
    <div className="portal-layout">
      {/* Top Bar */}
      <header className="portal-navbar">
        <div className="portal-logo">JKbank</div>
        <button onClick={handleLogoutClick} className="btn-outline">
          Logout
        </button>
      </header>

      {/* Main Layout Area */}
      <div className="portal-body">
        {/* Navigation Sidebar */}
        <aside className="portal-sidebar">
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activeTab === item ? 'active' : ''}`}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </button>
          ))}
        </aside>

        {/* Dynamic Main Workspace */}
        <main className="portal-content">
          {activeTab === 'Customers' && <CustomersList />}
          {activeTab === 'Open Account' && <CreateAccount branch={profile?.branch}/>}
          {activeTab === 'Transactions' && <GlobalTransactionsList />}
          {activeTab === 'My Profile' && (
                <section className="profile-card" style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Staff Profile</h3>
                    <span className="badge">{profile?.role}</span>
                  </div>

                  {loading ? (
                    <p style={{ color: '#666', fontSize: '0.875rem' }}>Loading profile information...</p>
                  ) : profile ? (
                    <div className="profile-grid">
                      {/* Personal & Account Information */}
                      <div className="profile-row">
                        <span className="profile-label">Username</span>
                        <span className="profile-value">{profile.username}</span>
                      </div>

                      <div className="profile-row">
                        <span className="profile-label">Email Address</span>
                        <span className="profile-value">{profile.email}</span>
                      </div>

                      <div className="profile-row">
                        <span className="profile-label">Staff Role</span>
                        <span className="profile-value">{profile.role}</span>
                      </div>

                      <div className="profile-row">
                        <span className="profile-label">Account Status</span>
                        <span className="profile-value">
                          {profile.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>

                      {/* Assigned Branch Section */}
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e5e5' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                          Branch
                        </h4>

                        {profile.branch ? (
                          <div className="profile-grid">
                            <div className="profile-row">
                              <span className="profile-label">Branch Name</span>
                              <span className="profile-value">{profile.branch.name}</span>
                            </div>

                            <div className="profile-row">
                              <span className="profile-label">IFSC Code</span>
                              <span className="profile-value">{profile.branch.branchcode}</span>
                            </div>
                            <div className="profile-row">
                              <span className="profile-label">Branch City / Address</span>
                              <span className="profile-value">
                                {profile.branch.city} &bull; {profile.branch.address}
                              </span>
                            </div>
                            {profile.branch.phone && (
                              <div className="profile-row">
                                <span className="profile-label">Branch Contact</span>
                                <span className="profile-value">{profile.branch.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p style={{ color: '#888', fontSize: '0.85rem' }}>
                            No home branch linked to this staff profile.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#888', fontSize: '0.875rem' }}>No staff profile records found.</p>
                  )}
                </section>
              )}


          {activeTab !== 'My Profile' && activeTab!== 'Customers'&& activeTab!== 'Transactions' && activeTab !== 'Open Account' && (
            <section className="profile-card">
              <h3>{activeTab}</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Module workspace for {activeTab.toLowerCase()} operations.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;