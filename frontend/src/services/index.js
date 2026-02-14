import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const statsService = {
  getDashboardStats: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },
};

export const customerService = {
  getAll: async (params) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/customers/${id}/status`);
    return response.data;
  },
};

export const institutionService = {
  getAll: async (params) => {
    const response = await api.get('/institutions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/institutions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/institutions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/institutions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/institutions/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/institutions/${id}/status`);
    return response.data;
  },
};

export const userService = {
  getAll: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/users/${id}/status`);
    return response.data;
  },
};

export const panelService = {
  getAll: async (params) => {
    const response = await api.get('/panels', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/panels/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/panels', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/panels/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/panels/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/panels/${id}/status`);
    return response.data;
  },
};
