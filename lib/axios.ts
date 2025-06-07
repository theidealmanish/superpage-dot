import axios from 'axios';

// Create a basic axios instance without auth headers initially
const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.superpa.ge',
	withCredentials: true,
});

// Only add auth token on the client side
if (typeof window !== 'undefined') {
	const token = localStorage.getItem('token');
	if (token) {
		axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}
}

// Add an interceptor to dynamically set the auth token on each request
axiosInstance.interceptors.request.use(
	(config) => {
		// Only try to get token in browser environment
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default axiosInstance;
