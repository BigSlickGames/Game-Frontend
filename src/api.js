// API configuration and helper functions
const API_BASE_URL = 'http://localhost:3000';

// Generic API call function
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Example API functions - customize these based on your backend endpoints
export const api = {
  // GET request example
  getData: () => apiCall('/api/data'),
  
  // POST request example
  postData: (data) => apiCall('/api/data', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // PUT request example
  updateData: (id, data) => apiCall(`/api/data/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // DELETE request example
  deleteData: (id) => apiCall(`/api/data/${id}`, {
    method: 'DELETE',
  }),
};