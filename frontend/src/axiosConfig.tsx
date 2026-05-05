/**
 * Pre-configured Axios instance used for all API calls in the application.
 *
 * `baseURL` is set to '/' so that requests like `/api/assets` resolve relative
 * to the page origin. In development this relies on Vite's proxy (vite.config.ts)
 * forwarding `/api/*` traffic to the Express backend. In production the Nginx
 * reverse-proxy fulfils the same role (nginx.conf).
 */

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/',
});

export default axiosInstance;
