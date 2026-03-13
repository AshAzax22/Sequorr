import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({ 
  icon: Icon = Filter, 
  options = [], 
  value = '', 
  onChange, 
  name, 
  placeholder = 'Select...' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        type="button" 
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.left}>
          {Icon && <Icon size={16} className={styles.icon} />}
          <span className={styles.label}>{displayLabel}</span>
        </div>
        <ChevronDown size={14} className={styles.chevron} />
      </button>

      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {options.map((opt) => (
            <li 
              key={opt.value}
              className={`${styles.option} ${value === opt.value ? styles.selected : ''}`}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
