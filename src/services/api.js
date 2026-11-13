import axios from 'axios';

const CLAVE_SESION = 'biblioteca_sesion';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1',
});

export const sesion = {
  leer() {
    try {
      const guardada = localStorage.getItem(CLAVE_SESION);
      return guardada ? JSON.parse(guardada) : null;
    } catch (error) {
      return null;
    }
  },
  guardar(token, usuario) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ token, usuario }));
  },
  actualizarUsuario(usuario) {
    const actual = this.leer();
    if (actual) {
      this.guardar(actual.token, usuario);
    }
  },
  cerrar() {
    localStorage.removeItem(CLAVE_SESION);
  },
};

api.interceptors.request.use((config) => {
  const actual = sesion.leer();
  if (actual && actual.token) {
    config.headers.Authorization = `Bearer ${actual.token}`;
  }
  return config;
});

export const mensajeDeError = (error) => {
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.';
  }
  const datos = error.response.data;
  if (datos && datos.detalles) {
    return Object.values(datos.detalles).join('. ');
  }
  return (datos && datos.mensaje) || 'Ocurrió un error inesperado.';
};