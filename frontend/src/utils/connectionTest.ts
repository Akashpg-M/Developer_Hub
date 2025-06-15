import axios from '../lib/axios';

export interface ConnectionTestResult {
  success: boolean;
  backendUrl: string;
  status?: number;
  statusText?: string;
  data?: any;
  error?: string;
  timestamp: string;
}

export const testBackendConnection = async (): Promise<ConnectionTestResult> => {
  const result: ConnectionTestResult = {
    success: false,
    backendUrl: axios.defaults.baseURL || 'http://localhost:5000/api',
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('Testing connection to backend at:', result.backendUrl);
    const response = await axios.get('/health', {
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    result.success = response.status === 200;
    result.status = response.status;
    result.statusText = response.statusText;
    result.data = response.data;
    
    console.log('Backend connection successful:', result);
  } catch (error: any) {
    console.error('Backend connection test failed:', error);
    result.error = error.message;
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      result.status = error.response.status;
      result.statusText = error.response.statusText;
      result.data = error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      result.error = 'No response from server. Check if the backend is running.';
    } else {
      // Something happened in setting up the request that triggered an Error
      result.error = error.message;
    }
  }

  return result;
};

// Helper function to log connection status to the console
export const logConnectionStatus = (result: ConnectionTestResult) => {
  console.group('Backend Connection Test');
  console.log('Backend URL:', result.backendUrl);
  console.log('Status:', result.status, result.statusText || '');
  console.log('Success:', result.success);
  console.log('Timestamp:', result.timestamp);
  
  if (result.error) {
    console.error('Error:', result.error);
  }
  
  if (result.data) {
    console.log('Response Data:', result.data);
  }
  
  console.groupEnd();
};
