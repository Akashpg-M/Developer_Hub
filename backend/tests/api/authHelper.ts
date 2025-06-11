import axios from 'axios';
import { TEST_CONFIG } from './testConfig';

let authToken: string | null = null;

export const getAuthToken = async (): Promise<string> => {
  if (authToken) return authToken;

  try {
    const response = await axios.post(
      `${TEST_CONFIG.BASE_URL}/auth/login`,
      {
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password,
      },
      {
        withCredentials: true,
      }
    );

    // Extract the token from the response
    // This might need adjustment based on your auth implementation
    authToken = response.data.token || response.headers['set-cookie']?.[0];
    
    if (!authToken) {
      throw new Error('No auth token received');
    }

    return authToken;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
};

export const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};
