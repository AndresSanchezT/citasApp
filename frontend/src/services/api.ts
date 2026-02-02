import axios from "axios";
import type { AxiosInstance, AxiosError } from "axios";
import type {
  Cita,
  CreateCitaDTO,
  ApiResponse,
  LoginDTO,
  RegisterDTO,
  AuthResponse,
  Stats,
  User,
} from "../types";

// UpdateCitaDTO;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipo para errores de API
interface ApiError {
  error?: string;
  message?: string;
}

// Función helper para manejar errores
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { error: "Error en la petición" };
  }
  throw error;
};

// ====== SERVICIOS DE AUTENTICACIÓN ======

export const authService = {
  // Login
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Registro
  register: async (userData: RegisterDTO): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Verificar token
  verifyToken: async (): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await api.get<{ success: boolean; user: User }>(
        "/auth/verify",
      );
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Obtener usuario actual
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },
};

// ====== SERVICIOS DE CITAS (PÚBLICO) ======

export const citasService = {
  // Crear cita (público)
  create: async (citaData: CreateCitaDTO): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse>("/citas", citaData);
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Verificar salud del servidor
  health: async (): Promise<{ status: string; message: string }> => {
    try {
      const response = await api.get<{ status: string; message: string }>(
        "/health",
      );
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },
};

// ====== SERVICIOS DE ADMIN (PROTEGIDOS) ======

export const adminService = {
  // Obtener todas las citas
  getAllCitas: async (): Promise<Cita[]> => {
    try {
      const response = await api.get<Cita[]>("/admin/citas");
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Obtener estadísticas
  getStats: async (): Promise<Stats> => {
    try {
      const response = await api.get<Stats>("/admin/stats");
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Confirmar cita
  confirmarCita: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.patch<ApiResponse>(
        `/admin/citas/${id}/confirmar`,
      );
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Rechazar cita
  rechazarCita: async (
    id: number,
    motivoRechazo: string,
  ): Promise<ApiResponse> => {
    try {
      const response = await api.patch<ApiResponse>(
        `/admin/citas/${id}/rechazar`,
        {
          motivoRechazo,
        },
      );
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // Eliminar cita
  deleteCita: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.delete<ApiResponse>(`/admin/citas/${id}`);
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },
};

export default api;
