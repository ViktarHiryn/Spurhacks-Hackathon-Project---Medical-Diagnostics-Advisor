import axios from "axios";
import io from "socket.io-client";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aiDoctorToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("aiDoctorToken");
      localStorage.removeItem("aiDoctorUser");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Socket.IO instance
let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ["websocket"],
      upgrade: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// API Functions
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post("/auth/login", credentials),
    register: (userData) => apiClient.post("/auth/register", userData),
    logout: () => apiClient.post("/auth/logout"),
  },

  // Chat endpoints
  chat: {
    sendMessage: (message) => apiClient.post("/chat/message", message),
    getHistory: () => apiClient.get("/chat/history"),
    uploadDocument: (formData) =>
      apiClient.post("/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  // Vision endpoints
  vision: {
    processFrame: (frameData) => apiClient.post("/vision/process", frameData),
    getBlinkData: () => apiClient.get("/vision/blink-data"),
  },

  // Medication endpoints
  medications: {
    getAll: () => apiClient.get("/medications"),
    add: (medication) => apiClient.post("/medications", medication),
    update: (id, medication) => apiClient.put(`/medications/${id}`, medication),
    delete: (id) => apiClient.delete(`/medications/${id}`),
    searchPharmacy: (medicationName) =>
      apiClient.get(`/medications/search/${medicationName}`),
  },

  // Tasks endpoints
  tasks: {
    getAll: () => apiClient.get("/tasks"),
    update: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),
  },
};

export default apiClient;
