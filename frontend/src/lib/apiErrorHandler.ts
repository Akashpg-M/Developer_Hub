// import { AxiosError } from 'axios';
// import { toast } from 'react-hot-toast';

// export interface ApiError {
//   message: string;
//   status?: number;
//   errors?: Record<string, string[]>;
// }

// export const handleApiError = (error: unknown): ApiError => {
//   console.error('API Error:', error);
  
//   // Default error message
//   const defaultError: ApiError = {
//     message: 'An unexpected error occurred. Please try again later.',
//   };

//   if (error instanceof Error) {
//     // Handle Axios errors
//     if ('isAxiosError' in error) {
//       const axiosError = error as AxiosError<{
//         message?: string;
//         error?: string;
//         errors?: Record<string, string[]>;
//       }>;

//       const responseData = axiosError.response?.data;
//       const status = axiosError.response?.status;

//       // Handle different HTTP status codes
//       switch (status) {
//         case 400:
//           return {
//             message: responseData?.message || 'Invalid request. Please check your input.',
//             status,
//             errors: responseData?.errors,
//           };
//         case 401:
//           return {
//             message: 'You are not authorized. Please log in again.',
//             status,
//           };
//         case 403:
//           return {
//             message: 'You do not have permission to perform this action.',
//             status,
//           };
//         case 404:
//           return {
//             message: 'The requested resource was not found.',
//             status,
//           };
//         case 500:
//           return {
//             message: 'A server error occurred. Please try again later.',
//             status,
//           };
//         default:
//           return {
//             message: responseData?.message || responseData?.error || defaultError.message,
//             status,
//             errors: responseData?.errors,
//           };
//       }
//     }

//     // Handle other Error types
//     return {
//       ...defaultError,
//       message: error.message || defaultError.message,
//     };
//   }

//   // Fallback for unknown error types
//   return defaultError;
// };

// export const showApiErrorToast = (error: unknown): void => {
//   const apiError = handleApiError(error);
  
//   // Show the main error message
//   toast.error(apiError.message);
  
//   // If there are field-specific errors, show them as well
//   if (apiError.errors) {
//     Object.entries(apiError.errors).forEach(([field, messages]) => {
//       messages.forEach(message => {
//         toast.error(`${field}: ${message}`, { duration: 5000 });
//       });
//     });
//   }
// };

// export const isUnauthorizedError = (error: unknown): boolean => {
//   if (error && typeof error === 'object' && 'status' in error) {
//     return error.status === 401;
//   }
//   return false;
// };

// export const isForbiddenError = (error: unknown): boolean => {
//   if (error && typeof error === 'object' && 'status' in error) {
//     return error.status === 403;
//   }
//   return false;
// };


// import { AxiosError } from "axios";
// import { toast } from "react-hot-toast";

// export interface ApiError {
//   message: string;
//   status?: number;
//   errors?: Record<string, string[]>;
// }

// export const handleApiError = (error: unknown): ApiError => {
//   if (error instanceof AxiosError) {
//     const responseData = error.response?.data;
//     const status = error.response?.status;

//     switch (status) {
//       case 400:
//         return { message: responseData?.message || "Invalid request", status, errors: responseData?.errors };
//       case 401:
//         return { message: "Please log in again", status };
//       case 403:
//         return { message: "Access denied", status };
//       case 404:
//         return { message: "Resource not found", status };
//       case 500:
//         return { message: "Server error, try again later", status };
//       default:
//         return { message: responseData?.message || "An error occurred", status };
//     }
//   }

//   return { message: error instanceof Error ? error.message : "An unexpected error occurred" };
// };

// export const showApiErrorToast = (error: unknown): void => {
//   const apiError = handleApiError(error);
//   toast.error(apiError.message);
//   if (apiError.errors) {
//     Object.entries(apiError.errors).forEach(([field, messages]) => {
//       messages.forEach((message) => toast.error(`${field}: ${message}`));
//     });
//   }
// };


import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;
    const status = error.response?.status;

    switch (status) {
      case 400:
        return { message: responseData?.message || "Invalid request", status, errors: responseData?.errors };
      case 401:
        return { message: "Please log in again", status };
      case 403:
        return { message: "Access denied", status };
      case 404:
        return { message: "Resource not found", status };
      case 500:
        return { message: "Server error, try again later", status };
      default:
        return { message: responseData?.message || "An error occurred", status };
    }
  }

  return { message: error instanceof Error ? error.message : "An unexpected error occurred" };
};

export const showApiErrorToast = (error: unknown): void => {
  const apiError = handleApiError(error);
  toast.error(apiError.message);
  if (apiError.errors) {
    Object.entries(apiError.errors).forEach(([field, messages]) => {
      messages.forEach((message) => toast.error(`${field}: ${message}`));
    });
  }
};