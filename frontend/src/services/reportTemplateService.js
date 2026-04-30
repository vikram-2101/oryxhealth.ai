import axios from 'axios';
import { API_BASE_URL } from './api';

const CLINICAL_API_URL = import.meta.env.VITE_CLINICAL_API_URL || API_BASE_URL || 'http://localhost:5000/api';

const clinicalApi = axios.create({
  baseURL: CLINICAL_API_URL,
});

// Use the same token as the admin portal (assuming they use the same auth system or shared JWT secret)
clinicalApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const reportTemplateService = {
  getTemplateByProtocol: async (protocolId) => {
    const response = await clinicalApi.get(`/report-templates/protocol/${protocolId}`);
    return response.data;
  },

  updateTemplate: async (templateId, data) => {
    const response = await clinicalApi.put(`/report-templates/${templateId}`, data);
    return response.data;
  },

  seedTemplate: async (protocolId) => {
    const response = await clinicalApi.post(`/report-templates/seed/${protocolId}`);
    return response.data;
  }
};
