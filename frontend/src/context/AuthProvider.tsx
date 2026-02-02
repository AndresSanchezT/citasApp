import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/api";
import type { LoginDTO, User } from "../types";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario guardado al cargar
    const verifyAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();

      if (token && savedUser) {
        try {
          // Verificar que el token sea válido
          await authService.verifyToken();
          setUser(savedUser);
        } catch (error) {
          // Token inválido, limpiar
          console.log(error);
          authService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (credentials: LoginDTO) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
