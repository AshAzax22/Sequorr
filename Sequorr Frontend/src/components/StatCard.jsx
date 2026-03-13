import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {Icon && <Icon className={styles.icon} size={20} />}
      </div>
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        {trend && (
          <div className={`${styles.trend} ${trend > 0 ? styles.positive : trend < 0 ? styles.negative : styles.neutral}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
