export interface Appointment {
  id?: number;
  udi: string;
  count: number;
  date: string; // YYYY-MM-DD
  timeStart: string;
  timeEnd: string;
  repeat: string;
  confirmed: boolean;
  cancelled: boolean;
  status: string;
  userId?: number;
  appTag?: string;
  createdAt?: string;
  updatedAt?: string;
  // User fields from JOIN
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  ipAddress?: string;
}

export interface User {
  uid?: number;
  name: string;
  middle?: string;
  surname: string;
  email: string;
  phone?: string;
  ipAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin {
  aid?: number;
  aName: string;
  aSurname: string;
  email?: string;
  login: string;
  password: string;
  passwordLastChanged?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Settings {
  sid?: number;
  maxApp: number;
  maxAppWeek: number;
  startHour?: number;
  endHour?: number;
  displayAvailability?: number; // weeks ahead to show availability
  availabilityLocked?: number; // 0 or 1 boolean stored as integer
  availabilityLockedUntil?: string | null; // ISO date string or null
  headerMessage?: string;
  pastAppointmentsDays?: number; // how many days back to show
  futureAppointmentsDays?: number; // how many days ahead to show
  includeWeekend?: number; // 0 or 1
  allow30Min?: number; // 0 or 1
  appointmentCurrency?: string; // currency code (USD, EUR, etc.)
  
  updatedAt?: string;
}

export interface Blocked {
  bid?: number;
  userId: number;
  ipAddress: string;
  email?: string;
  reason?: string;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CreateAppointmentRequest {
  date: string;
  timeStart: string;
  timeEnd: string;
  repeat?: string;
  appTag?: string;
  user: {
    name: string;
    middle?: string;
    surname: string;
    email: string;
    phone?: string;
  };
}

export interface EmailSettings {
  eid?: number;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  emailFooter: string;
  updatedAt?: string;
}