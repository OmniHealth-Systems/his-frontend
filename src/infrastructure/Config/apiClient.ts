import axios from 'axios';
import { toast } from 'sonner';

const getApiGatewayUrl = (): string => {
  if (import.meta.env?.VITE_API_GATEWAY_URL) {
    return import.meta.env.VITE_API_GATEWAY_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'http://localhost:8080';
};

const API_GATEWAY_URL = getApiGatewayUrl();

export const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let tokenGetter: (() => Promise<string | undefined>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string | undefined>) => {
  tokenGetter = getter;
};

// Interceptor de Peticiones (Inyección de Bearer Token Auth0)
apiClient.interceptors.request.use(
  async (config) => {
    if (tokenGetter) {
      try {
        const token = await tokenGetter();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('[OmniHIS Auth] No se pudo obtener el Bearer Token:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Global de Respuestas con Sonner Toasts
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      toast.error('Error de Conexión', {
        description: 'No se pudo conectar con el API Gateway o microservicios. Verifique su red.',
      });
    } else {
      const status = error.response.status;
      const data = error.response.data;
      const customMessage = data?.message || data?.error || error.message || 'Error desconocido';

      switch (status) {
        case 401:
          toast.warning('Sesión Expirada (401)', {
            description: 'Su sesión ha caducado. Por favor, vuelva a iniciar sesión.',
          });
          break;
        case 403:
          toast.error('Acceso Denegado (403)', {
            description: 'No cuenta con los privilegios suficientes para realizar esta acción.',
          });
          break;
        case 404:
          toast.warning('Recurso no encontrado (404)', {
            description: customMessage,
          });
          break;
        case 409:
          toast.warning('Conflicto Clínico / Negocio (409)', {
            description: customMessage,
          });
          break;
        case 500:
        case 502:
        case 503:
          toast.error(`Falla de Microservicio (${status})`, {
            description: customMessage,
          });
          break;
        default:
          toast.error(`Error de Operación (${status})`, {
            description: customMessage,
          });
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
