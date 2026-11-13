import { api } from './api';

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}-${mes}-${anio}`;
};

const aUsuario = (u) => ({
  id: u.id,
  nombre: u.nombreCompleto,
  correo: u.correo,
  fechaNacimiento: u.fechaNacimiento || '',
  tipo: u.rol,
});

const aPrestamo = (p) => {
  let estado = p.estado === 'DEVOLUCION_SOLICITADA' ? 'ACTIVO' : p.estado;
  if (p.atrasado && estado !== 'DEVUELTO') {
    estado = 'ATRASADO';
  }
  return {
    id: p.id,
    correo: p.usuarioCorreo,
    usuarioNombre: p.usuarioNombre,
    libroId: p.libroId,
    libroTitulo: p.libroTitulo,
    codigoEjemplar: p.codigoEjemplar,
    fechaPrestamo: formatearFecha(p.fechaPrestamo),
    fechaVencimiento: formatearFecha(p.fechaVencimiento),
    estado,
    solicitaDevolucion: p.estado === 'DEVOLUCION_SOLICITADA',
  };
};

const aReserva = (r) => ({
  id: r.id,
  correo: r.usuarioCorreo,
  usuario: r.usuarioNombre,
  libroId: r.libroId,
  libro: r.libroTitulo,
  libroTitulo: r.libroTitulo,
  fecha: formatearFecha(r.fechaReserva),
  vigencia: formatearFecha(r.fechaVigencia),
  estado: r.estado,
});

const aLibroRequest = (libro) => ({
  titulo: libro.titulo,
  autor: libro.autor,
  isbn: libro.isbn || null,
  anio: libro.anio || null,
  portada: libro.portada || null,
  categoria: libro.categoria,
  editorial: libro.editorial || null,
  stock: Number(libro.stock),
});

export const authApi = {
  async login(correo, clave) {
    const { data } = await api.post('/auth/login', { correo, clave });
    return { token: data.token, usuario: aUsuario(data) };
  },
  async registrar({ nombre, correo, clave, fechaNacimiento }) {
    const { data } = await api.post('/auth/registro', {
      nombreCompleto: nombre,
      correo,
      clave,
      fechaNacimiento,
    });
    return { token: data.token, usuario: aUsuario(data) };
  },
};

export const libroApi = {
  async listar() {
    const { data } = await api.get('/libros');
    return data;
  },
  async crear(libro) {
    const { data } = await api.post('/libros', aLibroRequest(libro));
    return data;
  },
  async actualizar(id, libro) {
    const { data } = await api.put(`/libros/${id}`, aLibroRequest(libro));
    return data;
  },
  async eliminar(id) {
    await api.delete(`/libros/${id}`);
  },
};

export const prestamoApi = {
  async listarTodos() {
    const { data } = await api.get('/prestamos');
    return data.map(aPrestamo);
  },
  async listarMios() {
    const { data } = await api.get('/prestamos/mios');
    return data.map(aPrestamo);
  },
  async pedir(libroId) {
    const { data } = await api.post('/prestamos', { libroId });
    return aPrestamo(data);
  },
  async solicitarDevolucion(id) {
    const { data } = await api.put(`/prestamos/${id}/solicitar-devolucion`);
    return aPrestamo(data);
  },
  async confirmarDevolucion(id) {
    const { data } = await api.put(`/prestamos/${id}/confirmar-devolucion`);
    return aPrestamo(data);
  },
};

export const reservaApi = {
  async listarTodas() {
    const { data } = await api.get('/reservas');
    return data.map(aReserva);
  },
  async listarMias() {
    const { data } = await api.get('/reservas/mias');
    return data.map(aReserva);
  },
  async reservar(libroId) {
    const { data } = await api.post('/reservas', { libroId });
    return aReserva(data);
  },
};

export const usuarioApi = {
  async listar() {
    const { data } = await api.get('/usuarios');
    return data.map(aUsuario);
  },
  async actualizarPerfil({ nombre, fechaNacimiento }) {
    const { data } = await api.put('/usuarios/yo', {
      nombreCompleto: nombre,
      fechaNacimiento: fechaNacimiento || null,
    });
    return aUsuario(data);
  },
};