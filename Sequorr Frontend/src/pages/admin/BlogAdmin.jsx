import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Search, Filter } from 'lucide-react';
import { getAdminBlogs, deleteBlog } from '../../api/blog';
import { getTags } from '../../api/tags';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import TagBadge from '../../components/TagBadge';
import CustomSelect from '../../components/CustomSelect';
import styles from './BlogAdmin.module.css';

const BlogAdmin = () => {
  const [data, setData] = useState({ items: [], totalPages: 1, page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'all', sort: 'newest', tags: '' });
  const [availableTags, setAvailableTags] = useState([]);
  const navigate = useNavigate();

  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15, sort: filters.sort };
      if (filters.status !== 'all') params.published = filters.status === 'published';
      if (filters.tags) params.tags = filters.tags;
      if (filters.search) params.search = filters.search;
      
      const res = await getAdminBlogs(params);
      setData({
        items: res.data,
        totalPages: res.totalPages,
        page: res.page,
        total: res.total,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load blogs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tagsRes = await getTags();
        if (tagsRes.success) setAvailableTags(tagsRes.tags);
      } catch (err) {
        console.error('Failed to get tags', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBlog(deleteId);
      setToast({ type: 'success', message: 'Blog deleted successfully' });
      const newPage = (data.items.length === 1 && data.page > 1) ? data.page - 1 : data.page;
      fetchBlogs(newPage);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete blog' });
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublish = async (blog) => {
    try {
      // Re-hydrate full payload since PUT validates everything
      // Actually we might need full data to update, but let's assume updateBlog handles partial or we need to fetch it?
      // Wait, Sequorr Backend might need full body for PUT /api/blog/:id.
      // Let's check. The API reference says "Same structure as POST. All fields are re-validated."
      // So we can't easily toggle from the list directly if we don't have the `sections`. The list endpoint returns them without sections? 
      // Actually, wait, does the list endpoint return sections? 
      // It says: data:[{ _id, title, slug, tags, averageReadTime, readCount, published, createdAt, updatedAt }].
      // No sections in the list!
      // So quick toggle publish is tricky unless we fetch it first.
      // To keep it clean, let's just show status and direct users to Edit to change status.
      navigate(`/admin/blogs/edit/${blog._id}`);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update' });
    }
  };

  return (
    <div className={styles.container}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        isDestructive={true}
        confirmText="Delete"
      />

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Blog Posts</h1>
          <div className={styles.totalBadge}>{data.total} total</div>
        </div>
        
        <Link to="/admin/blogs/new" className={styles.newBtn}>
          <Plus size={18} />
          <span>New Post</span>
        </Link>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <div className={styles.inputWrapper}>
            <Search size={16} className={styles.inputIcon} />
            <input 
              type="text" 
              name="search"
              placeholder="Search blogs..." 
              value={filters.search}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <CustomSelect 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange} 
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Drafts' }
            ]} 
          />

          <CustomSelect 
            name="tags" 
            value={filters.tags} 
            onChange={handleFilterChange} 
            placeholder="All Tags"
            options={[
              { value: '', label: 'All Tags' },
              ...availableTags.map(t => ({ value: t, label: t }))
            ]} 
          />

          <CustomSelect 
            name="sort" 
            value={filters.sort} 
            onChange={handleFilterChange} 
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'most-read', label: 'Most Read' }
            ]} 
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Spinner size="lg" />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState 
            title="No blog posts found"
            message="You haven't created any blog posts yet."
            action={
              <Link to="/admin/blogs/new" className={styles.newBtn}>Create your first post</Link>
            }
          />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th>Stats</th>
                  <th>Last Updated</th>
                  <th className={styles.actions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(blog => (
                  <tr key={blog._id}>
                    <td className={styles.titleCol}>
                      <div className={styles.titleCell}>
                        <span className={styles.blogTitle}>{blog.title}</span>
                        <span className={styles.blogSlug}>/{blog.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${blog.published ? styles.published : styles.draft}`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className={styles.tagsCol}>
                      <div className={styles.tagsWrapper}>
                        {blog.tags?.slice(0, 2).map(tag => (
                          <TagBadge key={tag} label={tag} />
                        ))}
                        {blog.tags?.length > 2 && (
                          <span className={styles.moreTags}>+{blog.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.statsCol}>
                      <div className={styles.statLine}>
                        <Eye size={14} className={styles.statIcon} />
                        <span>{blog.readCount} reads</span>
                      </div>
                    </td>
                    <td className={styles.dateCol}>
                      {new Date(blog.updatedAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className={styles.actions}>
                      <div className={styles.actionsGroup}>
                        <Link 
                          to={`/admin/blogs/edit/${blog._id}`}
                          className={styles.actionBtn}
                          aria-label="Edit blog"
                          title="Edit blog"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteId(blog._id)}
                          aria-label="Delete blog"
                          title="Delete blog"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className={styles.paginationWrapper}>
              <Pagination 
                currentPage={data.page} 
                totalPages={data.totalPages} 
                onPageChange={fetchBlogs} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogAdmin;
