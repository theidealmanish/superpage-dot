import axios from '@/lib/axios';

export const getUserFromUsername = async (username: string) => {
	const response = await axios.get(`/profile/${username}`);
	return response.data;
};
