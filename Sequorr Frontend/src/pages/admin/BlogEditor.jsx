import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { createBlog, updateBlog, getAdminBlogById } from '../../api/blog';
import { getTags, createTag } from '../../api/tags';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import styles from './BlogEditor.module.css';

const ImagePreview = ({ url, label, type }) => {
  if (!url) return null;
  return (
    <div className={styles.previewContainer}>
      <span className={styles.previewLabel}>{label} Preview:</span>
      <div className={`${styles.previewFrame} ${type === 'thumbnail' ? styles.thumbnailPreview : ''}`}>
        <img 
          src={url} 
          alt={label} 
          className={styles.previewImage} 
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
          }}
        />
      </div>
    </div>
  );
};

const BlogEditor = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    thumbnailImage: '',
    sections: [{ subHeading: '', content: '', imageUrl: '', imageCaption: '' }],
    tags: [],
    published: true,
    isFeatured: false,
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fromPage = location.state?.fromPage || 1;

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const tagsRes = await getTags();
        if (tagsRes.success) setAvailableTags(tagsRes.tags);

        if (id) {
          // Edit mode
          const res = await getAdminBlogById(id);
          const blogToEdit = res.data;
          
          if (blogToEdit) {
            setFormData({
              title: blogToEdit.title || '',
              description: blogToEdit.description || '',
              coverImage: blogToEdit.coverImage || '',
              thumbnailImage: blogToEdit.thumbnailImage || '',
              sections: blogToEdit.sections?.length > 0 ? blogToEdit.sections : [{ subHeading: '', content: '', imageUrl: '', imageCaption: '' }],
              tags: blogToEdit.tags || [],
              published: blogToEdit.published ?? true,
              isFeatured: blogToEdit.isFeatured || false,
            });
          } else {
            setToast({ type: 'error', message: 'Blog not found.' });
          }
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Error loading data' });
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { subHeading: '', content: '', imageUrl: '', imageCaption: '' }]
    });
  };

  const removeSection = (index) => {
    if (formData.sections.length <= 1) return;
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const handleTagToggle = (tag) => {
    const current = formData.tags;
    if (current.includes(tag)) {
      setFormData({ ...formData, tags: current.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...current, tag] });
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault(); // Might be triggered inside form if we're not careful with buttons
    if (!newTag.trim()) return;

    try {
      setCreatingTag(true);
      const res = await createTag(newTag.trim());
      
      if (res.success && res.data) {
        // Add to available tags
        setAvailableTags(prev => [...prev, res.data.name]);
        
        // Auto-select it for the current blog
        setFormData(prev => ({ ...prev, tags: [...prev.tags, res.data.name] }));
        
        setNewTag('');
        setToast({ type: 'success', message: 'Tag created successfully' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create tag' });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) {
        await updateBlog(id, formData);
        setToast({ type: 'success', message: 'Blog updated successfully' });
      } else {
        await createBlog(formData);
        setToast({ type: 'success', message: 'Blog created successfully' });
      }
      setTimeout(() => navigate('/admin/blogs', { state: { page: fromPage } }), 1500);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save blog' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingWrapper}><Spinner size="lg" /></div>;
  }

  return (
    <div className={styles.container}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <button 
            className={styles.backBtn} 
            onClick={() => navigate('/admin/blogs', { state: { page: fromPage } })} 
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>{id ? 'Edit Blog' : 'New Blog'}</h1>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving} 
          className={styles.saveBtn}
        >
          {saving ? <Spinner size="sm" /> : <Save size={18} />}
          <span>{saving ? 'Saving...' : 'Save Post'}</span>
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.mainCol}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 5 Daily Habits That Transform Your Fitness"
              className={`${styles.input} ${styles.titleInput}`}
              required
              maxLength={300}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Short Description / Starter</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. A brief introduction that hooks the reader before the main sections..."
              className={`${styles.input} ${styles.textarea} ${styles.descriptionInput}`}
              required
              rows={3}
              maxLength={500}
            />
          </div>

          <div className={styles.imageFieldsWrapper}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Cover Image URL</label>
              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className={styles.input}
              />
              <ImagePreview url={formData.coverImage} label="Cover" />
            </div>
            
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Thumbnail Image URL</label>
              <input
                type="text"
                name="thumbnailImage"
                value={formData.thumbnailImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className={styles.input}
              />
              <ImagePreview url={formData.thumbnailImage} label="Thumbnail" type="thumbnail" />
            </div>
          </div>

          <div className={styles.sectionsHeader}>
            <h2 className={styles.subTitle}>Content Sections</h2>
            <span className={styles.helperText}>Add at least one section</span>
          </div>

          <div className={styles.sectionsList}>
            {formData.sections.map((section, index) => (
              <div key={index} className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionBadge}>Section {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    disabled={formData.sections.length === 1}
                    className={styles.removeBtn}
                    aria-label="Remove section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Sub-heading</label>
                  <input
                    type="text"
                    value={section.subHeading}
                    onChange={(e) => handleSectionChange(index, 'subHeading', e.target.value)}
                    placeholder="e.g. Start Your Morning Right"
                    className={styles.input}
                    required
                    maxLength={200}
                  />
                </div>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Content</label>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                    placeholder="Write your content here..."
                    className={`${styles.input} ${styles.textarea}`}
                    required
                    rows={6}
                  />
                </div>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Section Image URL (Optional)</label>
                  <input
                    type="text"
                    value={section.imageUrl || ''}
                    onChange={(e) => handleSectionChange(index, 'imageUrl', e.target.value)}
                    placeholder="https://..."
                    className={styles.input}
                  />
                  <ImagePreview url={section.imageUrl} label={`Section ${index + 1}`} />
                </div>

                {section.imageUrl && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Image Caption (Optional)</label>
                    <input
                      type="text"
                      value={section.imageCaption || ''}
                      onChange={(e) => handleSectionChange(index, 'imageCaption', e.target.value)}
                      placeholder="Caption for the image..."
                      className={styles.input}
                      maxLength={200}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addSection} className={styles.addSectionBtn}>
            <Plus size={16} />
            <span>Add Another Section</span>
          </button>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Publish Status</h3>
            <label className={styles.toggleLabel}>
              <div className={styles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className={styles.realCheckbox}
                />
                <div className={`${styles.fakeToggle} ${formData.published ? styles.toggleOn : ''}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>
              <span>{formData.published ? 'Published (Visible)' : 'Draft (Hidden)'}</span>
            </label>
            <p className={styles.cardDesc}>
              Drafts are only visible in the admin dashboard.
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Featured Setting</h3>
            <label className={styles.toggleLabel}>
              <div className={styles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className={styles.realCheckbox}
                />
                <div className={`${styles.fakeToggle} ${formData.isFeatured ? styles.toggleOn : ''}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>
              <span>{formData.isFeatured ? 'Featured Post' : 'Standard Post'}</span>
            </label>
            <p className={styles.cardDesc}>
              Featured posts appear in the "Featured" section of the blog.
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Tags</h3>
            <p className={styles.cardDesc}>Select topics for this post.</p>
            
            <div className={styles.tagInputWrapper}>
              <input 
                type="text" 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag..."
                className={styles.input}
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
              />
              <button 
                type="button" 
                onClick={handleAddTag}
                disabled={creatingTag || !newTag.trim()}
                className={styles.addTagBtn}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className={styles.tagsGrid}>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`${styles.tagSelectable} ${formData.tags.includes(tag) ? styles.tagActive : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {availableTags.length === 0 && !loading && (
              <p className={styles.loadingTags}>No tags available yet.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
