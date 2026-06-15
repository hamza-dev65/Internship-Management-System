import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor to inject JWT token into requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth endpoints
export const login = (email, password) => API.post("/auth/login", { email, password });
export const registerAdmin = (name, email, password) => API.post("/auth/register", { name, email, password });

// Intern endpoints
export const getInterns = () => API.get("/interns");
export const onboardIntern = (data) => API.post("/interns", data);
export const updateIntern = (id, data) => API.put(`/interns/${id}`, data);
export const deleteIntern = (id) => API.delete(`/interns/${id}`);
export const getInternDetails = (id) => API.get(`/interns/${id}`);

// Task endpoints
export const getTasks = () => API.get("/tasks");
export const createTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Submission endpoints
export const getSubmissions = () => API.get("/submissions");
export const submitWork = (taskId, workLink) => API.post("/submissions", { taskId, workLink });
export const reviewSubmission = (id, feedback, status) => API.put(`/submissions/${id}/feedback`, { feedback, status });

export default API;
