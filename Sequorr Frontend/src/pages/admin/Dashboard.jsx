import React, { useEffect, useState } from 'react';
import { Users, FileText, Activity, Clock, Server, MessageSquare } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import { checkHealth } from '../../api/health';
import { getWaitlistStats } from '../../api/waitlist';
import { getAdminBlogs, getBlogStats } from '../../api/blog';
import { getContactStats } from '../../api/contact';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    health: false,
    waitlistStats: null,
    blogData: null,
    blogStats: null,
    contactStats: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [healthRes, waitlistRes, blogRes, blogStatsRes, contactRes] = await Promise.all([
          checkHealth().catch(() => ({ success: false })),
          getWaitlistStats().catch(e => { throw e; }),
          getAdminBlogs({ limit: 1 }).catch(e => { throw e; }),
          getBlogStats().catch(e => { throw e; }),
          getContactStats().catch(() => ({ success: true, data: { unread: 0 } }))
        ]);

        setData({
          headerData: null,
          health: healthRes.success,
          waitlistStats: waitlistRes,
          blogData: blogRes,
          blogStats: blogStatsRes.data,
          contactStats: contactRes.data
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard metrics. Check your API key.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.healthBadge}>
          <span className={`${styles.statusDot} ${data.health ? styles.online : styles.offline}`}></span>
          <span>API {data.health ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className={styles.grid}>
        <StatCard 
          title="Total Waitlist" 
          value={data.waitlistStats?.total || 0} 
          icon={Users} 
        />
        <StatCard 
          title="New Messages" 
          value={data.contactStats?.unread || 0} 
          icon={MessageSquare}
          trend={data.contactStats?.unread > 0 ? 'new' : null}
        />
        <StatCard 
          title="Total Blogs" 
          value={data.blogStats?.totalBlogs || 0} 
          icon={FileText} 
        />
        <StatCard 
          title="Total Reads" 
          value={data.blogStats?.totalReads || 0} 
          icon={Activity} 
        />
      </div>

      <div className={styles.charts}>
        {/* Simplified stats breakdown */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top User Descriptions</h3>
          <div className={styles.list}>
            {data.waitlistStats?.byDescription?.map(item => (
              <div key={item._id} className={styles.listItem}>
                <span className={styles.itemLabel}>{item._id}</span>
                <span className={styles.itemValue}>{item.count}</span>
              </div>
            ))}
            {(!data.waitlistStats?.byDescription || data.waitlistStats.byDescription.length === 0) && (
              <p className={styles.emptyText}>No waitlist data yet</p>
            )}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Preferred Move Times</h3>
          <div className={styles.list}>
            {data.waitlistStats?.byMoveTime?.map(item => (
              <div key={item._id} className={styles.listItem}>
                <span className={styles.itemLabel}>{item._id}</span>
                <span className={styles.itemValue}>{item.count}</span>
              </div>
            ))}
            {(!data.waitlistStats?.byMoveTime || data.waitlistStats.byMoveTime.length === 0) && (
              <p className={styles.emptyText}>No waitlist data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
