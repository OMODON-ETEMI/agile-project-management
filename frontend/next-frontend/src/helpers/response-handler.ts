import { toast } from 'react-hot-toast';
import { showErrorToast } from './clienttoast';


export const handleAxiosError = (error: any) => {
  const errorMessage = error.response ? 
    `Error: ${error.response.data.error || error.response.data.Error || error.response.data.message ||  error.response.data || error}` :
    error.request ?
      'No response received from backend' :
      `Error setting up request: ${error.message}`;

  console.error(errorMessage);

  if (typeof window !== 'undefined') {
    showErrorToast(errorMessage);
  }
  
  return error.response ? error.response.data : error;
}

export const handleAxiosSuccess = (response: any) => {
  const successMessage = response || response.data?.message || response.data?.response || 'Request successful';

  console.log(successMessage);

  if (typeof window !== 'undefined') {
    toast.success(successMessage);
  }

  return response.data;
};