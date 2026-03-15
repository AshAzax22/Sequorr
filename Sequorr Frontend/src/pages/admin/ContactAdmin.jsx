import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, Mail, Clock, MessageSquare } from 'lucide-react';
import { getContacts, updateContactStatus, deleteContact } from '../../api/contact';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import styles from './ContactAdmin.module.css';

const ContactAdmin = () => {
  const [data, setData] = useState({ items: [], totalPages: 1, page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchContacts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getContacts(page, 20);
      setData({
        items: res.data,
        totalPages: res.totalPages,
        page: res.page,
        total: res.total,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load messages' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(1);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContact(deleteId);
      setToast({ type: 'success', message: 'Message deleted successfully' });
      const newPage = (data.items.length === 1 && data.page > 1) ? data.page - 1 : data.page;
      fetchContacts(newPage);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete message' });
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'new' ? 'read' : (currentStatus === 'read' ? 'responded' : 'read');
      await updateContactStatus(id, nextStatus);
      setData(prev => ({
        ...prev,
        items: prev.items.map(item => item._id === id ? { ...item, status: nextStatus } : item)
      }));
      setToast({ type: 'success', message: `Status updated to ${nextStatus}` });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update status' });
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return styles.statusNew;
      case 'read': return styles.statusRead;
      case 'responded': return styles.statusResponded;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to delete this contact message? This action cannot be undone."
        isDestructive={true}
        confirmText="Delete"
      />

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Contact Messages</h1>
          <p className={styles.subtitle}>Manage inquiries from the Sequorr community</p>
        </div>
        <div className={styles.totalBadge}>{data.total} total messages</div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Spinner size="lg" />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState 
            title="No messages yet" 
            description="When users fill out the contact form, they will appear here."
            icon={MessageSquare}
          />
        ) : (
          <>
            <div className={styles.messageGrid}>
              {data.items.map(message => (
                <div key={message._id} className={`${styles.card} ${message.status === 'new' ? styles.cardNew : ''}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{message.name}</span>
                      <span className={styles.userEmail}>{message.email}</span>
                    </div>
                    <div className={`${styles.statusBadge} ${getStatusClass(message.status)}`}>
                      {message.status}
                    </div>
                  </div>
                  
                  <div className={styles.reasonTag}>
                    <span className={styles.reasonLabel}>Reason:</span> {message.reason}
                  </div>

                  <div className={styles.messageContent}>
                    {message.message}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.dateInfo}>
                      <Clock size={14} />
                      <span>
                        {new Date(message.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className={styles.actions}>
                      <button 
                        className={styles.statusBtn}
                        onClick={() => handleToggleStatus(message._id, message.status)}
                        title="Change Status"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                         className={styles.deleteBtn}
                         onClick={() => setDeleteId(message._id)}
                         title="Delete Message"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.paginationWrapper}>
              <Pagination 
                currentPage={data.page} 
                totalPages={data.totalPages} 
                onPageChange={fetchContacts} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactAdmin;
