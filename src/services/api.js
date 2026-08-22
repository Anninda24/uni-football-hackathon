const API_BASE_URL = 'http://localhost:5000/api';

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ff_jwt_token');

  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto-detect JSON body
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  // --- Auth APIs ---
  auth: {
    login: async (email, password) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      if (data.token) {
        localStorage.setItem('ff_jwt_token', data.token);
      }
      return data;
    },
    getMe: () => request('/auth/me'),
    logout: () => {
      localStorage.removeItem('ff_jwt_token');
    }
  },

  // --- Admin Config & Phase APIs ---
  admin: {
    getPhase: () => request('/admin/system-phase'),
    updatePhase: (phase) => request('/admin/system-phase', {
      method: 'PUT',
      body: { phase }
    }),
    getRules: () => request('/admin/rules'),
    updateRules: (rules) => request('/admin/rules', {
      method: 'PUT',
      body: rules
    })
  },

  // --- Player Portal APIs ---
  player: {
    getMe: () => request('/player/me'),
    register: (formData) => request('/player/register', {
      method: 'POST',
      body: formData // Must be FormData for image upload
    }),
    update: (formData) => request('/player/register', {
      method: 'PUT',
      body: formData // Must be FormData
    }),
    withdraw: () => request('/player/register', {
      method: 'DELETE'
    })
  }
};
