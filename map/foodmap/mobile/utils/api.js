// utils/api.js
// API utility functions

// Change this to your backend URL
export const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Get token from storage (implement based on your auth solution)
function getAuthToken() {
  // Example: return AsyncStorage.getItem('token');
  return null;
}

export async function get(endpoint) {
  const token = await getAuthToken();
  const headers = { ...defaultHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function post(endpoint, data) {
  const token = await getAuthToken();
  const headers = { ...defaultHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function put(endpoint, data) {
  const token = await getAuthToken();
  const headers = { ...defaultHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function del(endpoint) {
  const token = await getAuthToken();
  const headers = { ...defaultHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Convenience object
export const API = { get, post, put, delete: del };
