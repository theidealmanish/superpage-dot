import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

const fetchUserProfile = async () => {
	// Replace this with your actual API call
	const token = localStorage.getItem('token');
	if (!token) {
		throw new Error('No authentication token');
	}

	try {
		const res = await axios.get('/profile/me');
		console.log('User profile response:', res.data.data);
		return res.data.data;
	} catch (error: any) {
		// Check for specific error status codes that indicate token issues
		if (
			error.response &&
			(error.response.status === 401 || error.response.status === 403)
		) {
			console.log('Invalid token detected, removing from localStorage');
			localStorage.removeItem('token');
			throw new Error('Invalid authentication token');
		}
		throw error;
	}
};

export function useUserProfile() {
	return useQuery({
		queryKey: ['userProfile'],
		queryFn: fetchUserProfile,
		// Only fetch when we have a token
		enabled: !!localStorage.getItem('token'),
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
}
