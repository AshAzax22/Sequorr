import React from 'react';
import styles from './TagBadge.module.css';

const TagBadge = ({ label, onRemove }) => {
  return (
    <span className={styles.badge}>
      {label}
      {onRemove && (
        <button 
          className={styles.removeBtn} 
          onClick={onRemove}
          type="button"
          aria-label={`Remove ${label}`}
        >
          &times;
        </button>
      )}
    </span>
  );
};

export default TagBadge;
