// App Constants
//export const API_BASE_URL = 'http://10.0.2.2:8080/api'; // Android Emulator
 export const API_BASE_URL = 'http://localhost:8080/api'; // iOS Simulator
// export const API_BASE_URL = 'https://your-api.com/api'; // Production

export const ROLES = {
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
};

export const PRESCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const INTAKE_STATUS = {
  TAKEN: 'TAKEN',
  MISSED: 'MISSED',
  SKIPPED: 'SKIPPED',
  PENDING: 'PENDING',
};

export const FREQUENCY_OPTIONS = [
  { label: 'Once Daily', value: 'ONCE_DAILY', times: ['08:00 AM'] },
  { label: 'Twice Daily', value: 'TWICE_DAILY', times: ['08:00 AM', '08:00 PM'] },
  { label: 'Three Times Daily', value: 'THREE_TIMES_DAILY', times: ['08:00 AM', '02:00 PM', '08:00 PM'] },
  { label: 'Four Times Daily', value: 'FOUR_TIMES_DAILY', times: ['08:00 AM', '12:00 PM', '04:00 PM', '08:00 PM'] },
  { label: 'At Bedtime', value: 'BEDTIME', times: ['10:00 PM'] },
  { label: 'As Needed', value: 'AS_NEEDED', times: [] },
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const TOKEN_KEY = '@medlink_token';
export const USER_KEY = '@medlink_user';
