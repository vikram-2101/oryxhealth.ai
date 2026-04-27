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

export const categoryService = {
  getAll: async (params) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const protocolService = {
  getAll: async (params) => {
    const response = await api.get('/protocols', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/protocols/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/protocols', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/protocols/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/protocols/${id}`);
    return response.data;
  },
};

export const programTypeService = {
  getAll: async (params) => {
    const response = await api.get('/program-types', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/program-types/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/program-types', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/program-types/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/program-types/${id}`);
    return response.data;
  },
};

export const programService = {
  getAll: async (params) => {
    const response = await api.get('/programs', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/programs/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/programs', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/programs/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/programs/${id}`);
    return response.data;
  },
};

export const appointmentTypeService = {
  getAll: async (params) => {
    const response = await api.get('/appointment-types', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/appointment-types', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/appointment-types/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/appointment-types/${id}`);
    return response.data;
  },
};

