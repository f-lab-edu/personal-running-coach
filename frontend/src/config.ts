// export const API_BASE_URL = 'http://localhost:8000';
// export const API_BASE_URL = 'https://your-production-url.com';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
