// Configuration for API Environment

// This is your LIVE Cloudflare Worker URL
// Now that we are in production, everything points here.
export const API_URL = import.meta.env.VITE_API_URL || 'https://smart-language-app-backend.germanbyabdullah.workers.dev';
