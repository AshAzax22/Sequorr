import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { getWaitlist, deleteWaitlistEntry } from '../../api/waitlist';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import styles from './WaitlistAdmin.module.css';

const WaitlistAdmin = () => {
  const [data, setData] = useState({ items: [], totalPages: 1, page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchWaitlist = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getWaitlist(page, 20); // 20 per page
      setData({
        items: res.data,
        totalPages: res.totalPages,
        page: res.page,
        total: res.total,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load waitlist' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist(1);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWaitlistEntry(deleteId);
      setToast({ type: 'success', message: 'Entry deleted successfully' });
      // Re-fetch current page, or previous page if this was the last item
      const newPage = (data.items.length === 1 && data.page > 1) ? data.page - 1 : data.page;
      fetchWaitlist(newPage);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete entry' });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className={styles.container}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Waitlist Entry"
        message="Are you sure you want to delete this email from the waitlist? This action cannot be undone."
        isDestructive={true}
        confirmText="Delete"
      />

      <div className={styles.header}>
        <h1 className={styles.title}>Waitlist Management</h1>
        <div className={styles.totalBadge}>{data.total} total signups</div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Spinner size="lg" />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Who they are</th>
                  <th>When they move</th>
                  <th>Date Joined</th>
                  <th className={styles.actions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(entry => (
                  <tr key={entry._id}>
                    <td className={styles.email}>{entry.email}</td>
                    <td className={styles.description}>{entry.description}</td>
                    <td className={styles.description}>{entry.usualMoveTime}</td>
                    <td className={styles.date}>
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className={styles.actions}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => setDeleteId(entry._id)}
                        aria-label="Delete entry"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className={styles.paginationWrapper}>
              <Pagination 
                currentPage={data.page} 
                totalPages={data.totalPages} 
                onPageChange={fetchWaitlist} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaitlistAdmin;
