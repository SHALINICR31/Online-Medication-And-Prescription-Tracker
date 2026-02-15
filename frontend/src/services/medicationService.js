import { api } from './api';

export const medicationService = {
  getAll: () => api.get('/medications'),

  search: (name) => api.get(`/medications/search?name=${encodeURIComponent(name)}`),

  getById: (id) => api.get(`/medications/${id}`),

  logIntake: (log) => api.post('/medications/intake', log),

  getTodayIntakes: (patientId) => api.get(`/medications/intake/today/${patientId}`),

  getIntakeHistory: (patientId) => api.get(`/medications/intake/history/${patientId}`),

  getIntakesByDate: (patientId, date) =>
    api.get(`/medications/intake/${patientId}/date?date=${date}`),

  getAdherence: (patientId) => api.get(`/medications/adherence/${patientId}`),

  updateIntakeStatus: (logId, status) =>
    api.patch(`/medications/intake/${logId}/status`, { status }),
};

export default medicationService;
