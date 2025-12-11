import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const AUTH_URL = 'http://localhost:8000/api/auth';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to request headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
            console.log('Auth Token:', token ? `${token.substring(0, 20)}...` : 'None');
        } else {
            console.warn('No access token found for request:', config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${AUTH_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('access_token', response.data.access);
                    api.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (err) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_role');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// ============ AUTH APIS ============
export const authAPI = {
    login: (credentials) => axios.post(`${AUTH_URL}/login/`, credentials),
    refreshToken: (refreshToken) => axios.post(`${AUTH_URL}/token/refresh/`, { refresh: refreshToken }),
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
    },
    getMe: () => api.get('/auth/me/'),
    getCurrentUser: () => api.get('/auth/me/'), // convenience alias for legacy callers
};

// ============ USER APIS ============
export const userAPI = {
    getAll: (params = {}) => api.get('/users/', { params }),
    getById: (id) => api.get(`/users/${id}/`),
    create: (data) => api.post('/users/', data),
    update: (id, data) => api.put(`/users/${id}/`, data),
    delete: (id) => api.delete(`/users/${id}/`),
    getMe: () => api.get('/auth/me/'),
    updateMe: (data) => api.put('/auth/update_me/', data),
    changePassword: (data) => api.post('/auth/change_password/', data),
};

// ============ DEPARTMENT APIS ============
export const departmentAPI = {
    getAll: (params = {}) => api.get('/attendance/departments/', { params }),
    getById: (id) => api.get(`/attendance/departments/${id}/`),
    create: (data) => api.post('/attendance/departments/', data),
    update: (id, data) => api.put(`/attendance/departments/${id}/`, data),
    delete: (id) => api.delete(`/attendance/departments/${id}/`),
    getStatistics: (id) => api.get(`/attendance/departments/${id}/statistics/`),
};

// ============ SEMESTER APIS ============
export const semesterAPI = {
    getAll: (params = {}) => api.get('/attendance/semesters/', { params }),
    getById: (id) => api.get(`/attendance/semesters/${id}/`),
    create: (data) => api.post('/attendance/semesters/', data),
    update: (id, data) => api.put(`/attendance/semesters/${id}/`, data),
    delete: (id) => api.delete(`/attendance/semesters/${id}/`),
    getByDepartment: (departmentId) => api.get('/attendance/semesters/', { params: { department: departmentId } }),
};

// ============ SUBJECT APIS ============
export const subjectAPI = {
    getAll: (params = {}) => api.get('/attendance/subjects/', { params }),
    getById: (id) => api.get(`/attendance/subjects/${id}/`),
    create: (data) => api.post('/attendance/subjects/', data),
    update: (id, data) => api.put(`/attendance/subjects/${id}/`, data),
    delete: (id) => api.delete(`/attendance/subjects/${id}/`),
    search: (query) => api.get('/attendance/subjects/', { params: { search: query } }),
    getBySemester: (semesterId) => api.get('/attendance/subjects/', { params: { semester: semesterId } }),
};

// ============ CLASS APIS ============
export const classAPI = {
    getAll: (params = {}) => api.get('/attendance/classes/', { params }),
    getById: (id) => api.get(`/attendance/classes/${id}/`),
    create: (data) => api.post('/attendance/classes/', data),
    update: (id, data) => api.put(`/attendance/classes/${id}/`, data),
    delete: (id) => api.delete(`/attendance/classes/${id}/`),
    search: (query) => api.get('/attendance/classes/', { params: { search: query } }),
};

// ============ CLASS STUDENT APIS ============
export const classStudentAPI = {
    getAll: (params = {}) => api.get('/attendance/class-students/', { params }),
    getById: (id) => api.get(`/attendance/class-students/${id}/`),
    create: (data) => api.post('/attendance/class-students/', data),
    update: (id, data) => api.put(`/attendance/class-students/${id}/`, data),
    delete: (id) => api.delete(`/attendance/class-students/${id}/`),
};

// ============ TEACHER ASSIGNMENT APIS ============
export const teacherAssignmentAPI = {
    getAll: (params = {}) => api.get('/attendance/teacher-assignments/', { params }),
    getById: (id) => api.get(`/attendance/teacher-assignments/${id}/`),
    create: (data) => api.post('/attendance/teacher-assignments/', data),
    update: (id, data) => api.put(`/attendance/teacher-assignments/${id}/`, data),
    delete: (id) => api.delete(`/attendance/teacher-assignments/${id}/`),
};

// ============ CLASS SCHEDULE APIS ============
export const classScheduleAPI = {
    getAll: (params = {}) => api.get('/attendance/class-schedules/', { params }),
    getById: (id) => api.get(`/attendance/class-schedules/${id}/`),
    create: (data) => api.post('/attendance/class-schedules/', data),
    update: (id, data) => api.put(`/attendance/class-schedules/${id}/`, data),
    delete: (id) => api.delete(`/attendance/class-schedules/${id}/`),
    getByDay: (day) => api.get('/attendance/class-schedules/by_day/', { params: { day } }),
};

// ============ SESSION APIS ============
export const sessionAPI = {
    getAll: (params = {}) => api.get('/attendance/sessions/', { params }),
    getById: (id) => api.get(`/attendance/sessions/${id}/`),
    create: (data) => api.post('/attendance/sessions/', data),
    update: (id, data) => api.put(`/attendance/sessions/${id}/`, data),
    delete: (id) => api.delete(`/attendance/sessions/${id}/`),
    startSession: (data) => api.post('/attendance/sessions/start_session/', data),
    endSession: (id) => api.post(`/attendance/sessions/${id}/end_session/`),
    getActiveSessions: () => api.get('/attendance/sessions/active_sessions/'),
};

// ============ ATTENDANCE APIS ============
export const attendanceAPI = {
    getAll: (params = {}) => api.get('/attendance/attendance/', { params }),
    getById: (id) => api.get(`/attendance/attendance/${id}/`),
    create: (data) => api.post('/attendance/attendance/', data),
    update: (id, data) => api.put(`/attendance/attendance/${id}/`, data),
    delete: (id) => api.delete(`/attendance/attendance/${id}/`),
    markAttendance: (data) => api.post('/attendance/attendance/mark_attendance/', data),
    markMultiple: (data) => api.post('/attendance/attendance/mark_multiple/', data),
    getStatistics: (params = {}) => api.get('/attendance/attendance/statistics/', { params }),
    getByDate: (date) => api.get('/attendance/attendance/by_date/', { params: { date } }),
    filterBySubject: (subjectId, params = {}) =>
        api.get('/attendance/attendance/', { params: { ...params, session__subject: subjectId } }),
    filterByClass: (classId, params = {}) =>
        api.get('/attendance/attendance/', { params: { ...params, session__class_assigned: classId } }),
};

// ============ ATTENDANCE CHANGE APIS ============
export const attendanceChangeAPI = {
    getAll: (params = {}) => api.get('/attendance/attendance-changes/', { params }),
    getById: (id) => api.get(`/attendance/attendance-changes/${id}/`),
    create: (data) => api.post('/attendance/attendance-changes/', data),
    approve: (id) => api.post(`/attendance/attendance-changes/${id}/approve/`),
    reject: (id) => api.post(`/attendance/attendance-changes/${id}/reject/`),
    getPending: () => api.get('/attendance/attendance-changes/pending/'),
};

// ============ ATTENDANCE REPORT APIS ============
export const attendanceReportAPI = {
    getAll: (params = {}) => api.get('/attendance/attendance-reports/', { params }),
    getById: (id) => api.get(`/attendance/attendance-reports/${id}/`),
    getLowAttendance: (threshold = 75) => 
        api.get('/attendance/attendance-reports/low_attendance/', { params: { threshold } }),
    regenerate: (data) => api.post('/attendance/attendance-reports/regenerate/', data),
};

// ============ FACE EMBEDDING APIS ============
export const faceEmbeddingAPI = {
    getAll: (params = {}) => api.get('/attendance/embeddings/', { params }),
    getById: (id) => api.get(`/attendance/embeddings/${id}/`),
    create: (data) => {
        const formData = new FormData();
        formData.append('student', data.student);
        formData.append('embedding_vector', JSON.stringify(data.embedding_vector));
        if (data.image) formData.append('image', data.image);
        return api.post('/attendance/embeddings/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    update: (id, data) => {
        const formData = new FormData();
        if (data.embedding_vector) formData.append('embedding_vector', JSON.stringify(data.embedding_vector));
        if (data.image) formData.append('image', data.image);
        return api.put(`/attendance/embeddings/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    delete: (id) => api.delete(`/attendance/embeddings/${id}/`),
};

// ============ NOTIFICATION APIS ============
export const notificationAPI = {
    getAll: (params = {}) => api.get('/attendance/notifications/', { params }),
    getById: (id) => api.get(`/attendance/notifications/${id}/`),
    create: (data) => api.post('/attendance/notifications/', data),
    update: (id, data) => api.put(`/attendance/notifications/${id}/`, data),
    delete: (id) => api.delete(`/attendance/notifications/${id}/`),
    markRead: (id) => api.post(`/attendance/notifications/${id}/mark_read/`),
    markAllRead: () => api.post('/attendance/notifications/mark_all_read/'),
    getUnreadCount: () => api.get('/attendance/notifications/unread_count/'),
    getByCategory: (category) => api.get('/attendance/notifications/by_category/', { params: { category } }),
};

// ============ UTILITY FUNCTIONS ============
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        localStorage.setItem('access_token', token);
    } else {
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem('access_token');
    }
};

export const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};

export const getUserRole = () => {
    return localStorage.getItem('user_role');
};

export const setUserRole = (role) => {
    localStorage.setItem('user_role', role);
};

export default api;
