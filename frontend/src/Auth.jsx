import { createContext, useCallback, useContext, useState } from "react";

// Contexto para compartir el estado de autenticacion
const AuthContext = createContext(null);

// Lee la sesion guardada (para no perderla al recargar la pagina)
const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem("sesion")) ?? {};
  } catch {
    return {};
  }
};

// Hook personzalizado para acceder al contexto de auth
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => leerSesion().token ?? null);
  const [nombre, setNombre] = useState(() => leerSesion().nombre ?? null);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(session.mensaje ?? "No se pudo iniciar sesión");
      }

      setToken(session.token);
      setNombre(session.nombre);
      localStorage.setItem(
        "sesion",
        JSON.stringify({ token: session.token, nombre: session.nombre }),
      );
      return { success: true };
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor"
          : err.message,
      );
      return { success: false };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setNombre(null);
    setError(null);
    localStorage.removeItem("sesion");
  }, []);

  // fetch que agrega el token en el header Authorization
  const fetchAuth = useCallback(
    async (url, options = {}) => {
      if (!token) {
        throw new Error("No esta iniciada la sesion");
      }

      const response = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      });

      // Si el token vencio (4 horas) o no es valido se cierra la sesion
      if (response.status === 401) {
        logout();
      }

      return response;
    },
    [token, logout],
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        nombre,
        error,
        isAuthenticated: !!token,
        login,
        logout,
        fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
