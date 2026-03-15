import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { path: '/admin/waitlist', icon: <Users size={20} />, label: 'Waitlist' },
  { path: '/admin/blogs', icon: <FileText size={20} />, label: 'Blogs' },
  { path: '/admin/contact', icon: <MessageSquare size={20} />, label: 'Messages' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.brand}>Sequorr</span>
          <span className={styles.dot}>.</span>
        </div>
        <div className={styles.badge}>Admin</div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
