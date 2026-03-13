import React from 'react';
import { Database } from 'lucide-react';
import styles from './EmptyState.module.css';

const EmptyState = ({ icon: Icon = Database, title = 'No data found', message = 'There is nothing to display here yet.', action }) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <Icon size={48} strokeWidth={1} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;
