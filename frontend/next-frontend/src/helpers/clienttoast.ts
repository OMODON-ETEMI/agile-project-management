import { toast } from 'react-hot-toast';

export const showErrorToast = (message: string) => {
  toast.error(message);
};