import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@h2ocontrol.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const TEACHER_PIN = process.env.TEACHER_PIN || '1234';

export const PORT = process.env.PORT || 5000;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://admin:adminpassword@localhost:5432/h2ocontrol';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
