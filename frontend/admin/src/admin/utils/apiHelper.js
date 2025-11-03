/**
 * Helper function to retrieve JWT token from sessionStorage
 */
export const getAuthToken = () => {
  try {
    const sessionData = sessionStorage.getItem('adminSession');
    if (sessionData) {
      const { admin } = JSON.parse(sessionData);
      return admin.token;
    }
  } catch (error) {
    console.error('Error retrieving auth token:', error);
  }
  return null;
};

/**
 * Helper function to create headers with Authorization token
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Helper function for authenticated API calls
 */
export const authenticatedFetch = async (url, options = {}) => {
  const headers = getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
};
