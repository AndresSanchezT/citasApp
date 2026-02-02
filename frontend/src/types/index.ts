// Tipo para una Cita
export interface Cita {
  id: number;
  nombreCompleto: string;
  telefono: string;
  email: string;
  tipoServicio: string;
  fecha: Date | string;
  hora: string;
  estado: "pendiente" | "confirmada" | "rechazada";
  motivoRechazo?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Tipo para crear una nueva cita
export interface CreateCitaDTO {
  nombreCompleto: string;
  telefono: string;
  email: string;
  tipoServicio: string;
  fecha: string;
  hora: string;
}

// Tipo para actualizar una cita
export interface UpdateCitaDTO extends Partial<CreateCitaDTO> {
  estado?: "pendiente" | "confirmada" | "rechazada";
  motivoRechazo?: string;
}

// Tipo para la respuesta de la API
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: Cita;
  error?: string;
}

// Tipos de servicios médicos
export type TipoServicio =
  | "Consulta General"
  | "Pediatría"
  | "Cardiología"
  | "Dermatología"
  | "Odontología"
  | "Oftalmología";

// Tipo para errores de validación
export interface ValidationErrors {
  [key: string]: string;
}

// ====== NUEVOS TIPOS PARA AUTH ======

// Tipo para usuario
export interface User {
  id: number;
  email: string;
  nombre: string;
  role: string;
}

// Tipo para login
export interface LoginDTO {
  email: string;
  password: string;
}

// Tipo para registro
export interface RegisterDTO {
  email: string;
  password: string;
  nombre: string;
}

// Tipo para respuesta de auth
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Tipo para estadísticas del admin
export interface Stats {
  total: number;
  pendientes: number;
  confirmadas: number;
  rechazadas: number;
}
