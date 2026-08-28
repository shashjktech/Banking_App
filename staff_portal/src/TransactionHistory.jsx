import React, { useState } from 'react';

const TransactionHistory = ({ 
    transactions, 
    currentAccountId,
    currentPage,
    totalPages,
    onNextPage,
    onPrevPage
 }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const API_BASE_URL = 'http://localhost:5000/bank/staff';

    const handleDownloadStatement = async () => {
        setIsDownloading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/statement`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to generate statement');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'JKbank_Statement.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading statement:', error);
            alert('Could not download the statement at this time.');
        } finally {
            setIsDownloading(false);
        }
    };

  return (
    <>
        <div className="transaction-section">
            <div className="transaction-header">
                <h3>Recent Transactions</h3>
                <button 
                    onClick={handleDownloadStatement} 
                    disabled={isDownloading}
                    className="btn btn-dark statement-btn"
                >
                    {isDownloading ? 'Generating PDF...' : 'Download E-Statement'}
                </button>
            </div>

            {transactions.length === 0 ? (
                <p className="no-transactions">No recent transactions.</p>
            ) : (
                <>
                    <ul className="transaction-list">
                    {transactions.map((tx) => {
                        // ROBUST DEBIT/CREDIT LOGIC
                        // It is a DEBIT (Red/-) if the type is WITHDRAWAL, or if this account is the sender in a TRANSFER.
                        // Note: Using `fromaccountId` to match your Prisma backend casing!
                        const isDebit = 
                            tx.type === 'WITHDRAWAL' || 
                            tx.fromaccountId === currentAccountId;
                        
                        const amountClass = isDebit ? 'amount-debit' : 'amount-credit';
                        const amountSymbol = isDebit ? '-' : '+';

                        return (
                        <li key={tx.id} className="transaction-item">
                            <div className="transaction-details">
                                <strong>{tx.type}</strong>
                                <div className="transaction-date">
                                    {/* Show the target/source account if applicable */}
                                    {tx.type === 'TRANSFER' && isDebit && `To: ${tx.toaccountId}`}
                                    {tx.type === 'TRANSFER' && !isDebit && `From: ${tx.fromaccountId}`}
                                    {tx.type !== 'TRANSFER' && `Ref: ${tx.referenceNote || 'N/A'}`}
                                    <br/>
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className={`transaction-amount ${amountClass}`}>
                                {amountSymbol}₹{Number(tx.amount).toFixed(2)}
                            </div>
                        </li>
                        );
                    })}
                    </ul>

                    <div className="pagination-footer">
                        <button 
                            onClick={onPrevPage} 
                            disabled={currentPage === 1}
                            className={`btn btn-outline ${currentPage === 1 ? 'disabled-btn' : ''}`}
                        >
                            &larr; Previous
                        </button>

                        <span className="page-indicator">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button 
                            onClick={onNextPage} 
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`btn btn-outline ${(currentPage === totalPages || totalPages === 0) ? 'disabled-btn' : ''}`}
                        >
                            Next &rarr;
                        </button>
                    </div>
                </>
            )}
        </div>
    </>
  );
};

export default TransactionHistory;