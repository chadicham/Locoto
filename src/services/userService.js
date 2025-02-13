import api from './axiosConfig';

export const updateUserProfile = async (userData) => {
  const response = await api.patch('/users/profile', userData);
  return response.data;
};