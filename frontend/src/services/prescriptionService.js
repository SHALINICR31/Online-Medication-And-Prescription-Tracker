import { api } from './api';

export const prescriptionService = {
  create: (prescription) => api.post('/prescriptions', prescription),

  getByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),

  getActiveByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}/active`),

  getByDoctor: (doctorId) => api.get(`/prescriptions/doctor/${doctorId}`),

  getById: (id) => api.get(`/prescriptions/${id}`),

  updateStatus: (id, status) => api.patch(`/prescriptions/${id}/status`, { status }),

  delete: (id) => api.delete(`/prescriptions/${id}`),
};

export default prescriptionService;
