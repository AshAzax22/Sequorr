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
  const [searchString, setSearchString] = useState('');
  const containerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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
    setSearchString('');
  };

  const scrollToSelected = () => {
    setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        const selectedEl = container.querySelector(`.${styles.selected}`);
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }, 0);
  };

  // Keyboard Navigation & Type-to-select
  useEffect(() => {
    if (!isOpen) {
      setSearchString('');
      return;
    }

    const handleKeyDown = (e) => {
      // Ignore functional keys
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
        return;
      }

      // Arrow Key Navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = options.findIndex(opt => opt.value === value);
        let nextIndex;
        
        if (e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % options.length;
        } else {
          nextIndex = (currentIndex - 1 + options.length) % options.length;
        }
        
        const nextOption = options[nextIndex];
        if (nextOption) {
          onChange({ target: { name, value: nextOption.value } });
          scrollToSelected();
        }
        return;
      }

      // Type-to-select logic
      if (e.key.length === 1) {
        const newSearch = searchString + e.key.toLowerCase();
        setSearchString(newSearch);

        // Clear timeout
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => setSearchString(''), 1000);

        // Find matching option
        const match = options.find(opt => 
          opt.label.toLowerCase().startsWith(newSearch)
        );

        if (match) {
          onChange({ target: { name, value: match.value } });
          scrollToSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchString, options, name, onChange]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        type="button" 
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
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
