import { toast } from 'react-toastify';

export const customToast = (message, type = "default", position = "top-right", duration = 3000) => {
  const isLoading = type === "loading";

  const toastOptions = {
    position,
    ...(isLoading ? { autoClose: false} : { autoClose: duration }),
  };

  let toastId;

  switch (type) {
    case "success":
      toastId = toast.success(message, toastOptions);
      break;
    case "error":
      toastId = toast.error(message, toastOptions);
      break;
    case "info":
      toastId = toast.info(message, toastOptions);
      break;
    case "warning":
      toastId = toast.warn(message, toastOptions);
      break;
    case "loading":
      toastId = toast.loading(message, toastOptions);
      break;
    default:
      toastId = toast(message, toastOptions);
      break;
  }

  return toastId;
};

