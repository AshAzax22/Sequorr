import { apiFetch, authHeaders } from './config';

export const getAdminBlogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/blog/admin${query ? `?${query}` : ''}`, {
    headers: authHeaders(),
  });
};

export const createBlog = async (data) => {
  return apiFetch('/blog', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
};

export const updateBlog = async (id, data) => {
  return apiFetch(`/blog/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
};

export const deleteBlog = async (id) => {
  return apiFetch(`/blog/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
};

export const getBlogTags = async () => {
  return apiFetch('/blog/tags');
};

export const getBlogBySlug = async (slug) => {
  return apiFetch(`/blog/${slug}`);
};

export const getBlogStats = async () => {
  return apiFetch('/blog/admin/stats', {
    headers: authHeaders(),
  });
};

export const getAdminBlogById = async (id) => {
  return apiFetch(`/blog/admin/${id}`, {
    headers: authHeaders(),
  });
};
