import axios from '@/lib/axios';

// export const createProfile = (data: {
// 	bio: string;
//     country: string;
//     social
// }) => {
// 	return axios.post('/profile', data);
// };

export const getProfileFromUsername = async (username: string) => {
	const response = await axios.get(`/profile/${username}`);
	return response.data;
};
