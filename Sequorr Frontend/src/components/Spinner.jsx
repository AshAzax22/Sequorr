import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'md' }) => {
  return (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div className={styles.circle}></div>
    </div>
  );
};

export default Spinner;
