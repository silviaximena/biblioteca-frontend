import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import QuienesSomos from './components/QuienesSomos';
import Navbar from './components/Navbar';
import Inicio from './components/Inicio';
import Catalogo from './components/Catalogo';
import Usuarios from './components/Usuarios';
import Prestamos from './components/Prestamos';
import Reservas from './components/Reservas';
import Login from './components/Login';
import CrearCuenta from './components/CrearCuenta';
import PanelAdmin from './components/PanelAdmin';
import Perfil from './components/Perfil';
import Ayuda from './components/Ayuda';
import Horarios from './components/Horarios';
import DetalleActividad from './components/DetalleActividad';
import RutaProtegida from './components/RutaProtegida';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import { sesion, mensajeDeError } from './services/api';
import { authApi, libroApi, prestamoApi, reservaApi, usuarioApi } from './services/biblioteca';

function App() {
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuarioActual] = useState(() => {
    const guardada = sesion.leer();
    return guardada ? guardada.usuario : null;
  });
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [aviso, setAviso] = useState(null);

  const esPersonal = !!usuario && ['ADMINISTRADOR', 'BIBLIOTECARIO'].includes(usuario.tipo);

  const setUsuario = (nuevoUsuario) => {
    if (!nuevoUsuario) {
      sesion.cerrar();
    }
    setUsuarioActual(nuevoUsuario);
  };

  const mostrarError = useCallback((error) => {
    if (error.response && error.response.status === 401 && sesion.leer()) {
      sesion.cerrar();
      setUsuarioActual(null);
      setAviso({ tipo: 'warning', texto: 'Tu sesión expiró. Vuelve a iniciar sesión.' });
      return;
    }
    setAviso({ tipo: 'danger', texto: mensajeDeError(error) });
  }, []);

  const cargarLibros = useCallback(async () => {
    try {
      setLibros(await libroApi.listar());
    } catch (error) {
      mostrarError(error);
    }
  }, [mostrarError]);

  const cargarDatosDelUsuario = useCallback(async () => {
    if (!usuario) {
      setPrestamos([]);
      setReservas([]);
      setUsuarios([]);
      return;
    }
    try {
      if (esPersonal) {
        const [todosLosPrestamos, todasLasReservas, todosLosUsuarios] = await Promise.all([
          prestamoApi.listarTodos(),
          reservaApi.listarTodas(),
          usuarioApi.listar(),
        ]);
        setPrestamos(todosLosPrestamos);
        setReservas(todasLasReservas);
        setUsuarios(todosLosUsuarios);
      } else {
        const [misPrestamos, misReservas] = await Promise.all([
          prestamoApi.listarMios(),
          reservaApi.listarMias(),
        ]);
        setPrestamos(misPrestamos);
        setReservas(misReservas);
        setUsuarios([]);
      }
    } catch (error) {
      mostrarError(error);
    }
  }, [usuario, esPersonal, mostrarError]);

  useEffect(() => {
    cargarLibros();
  }, [cargarLibros]);

  useEffect(() => {
    cargarDatosDelUsuario();
  }, [cargarDatosDelUsuario]);

  const recargarTodo = () => Promise.all([cargarLibros(), cargarDatosDelUsuario()]);

  const iniciarSesion = async (correo, clave) => {
    const { token, usuario: datosUsuario } = await authApi.login(correo, clave);
    sesion.guardar(token, datosUsuario);
    setUsuarioActual(datosUsuario);
    setAviso(null);
  };

  const registrarUsuario = async (datos) => {
    const { token, usuario: datosUsuario } = await authApi.registrar(datos);
    sesion.guardar(token, datosUsuario);
    return datosUsuario;
  };

  const editarPerfil = async (correo, cambios) => {
    try {
      const actualizado = await usuarioApi.actualizarPerfil(cambios);
      sesion.actualizarUsuario(actualizado);
      setUsuarioActual(actualizado);
      return true;
    } catch (error) {
      mostrarError(error);
      return false;
    }
  };

  const agregarLibro = async (libro) => {
    try {
      await libroApi.crear(libro);
      await cargarLibros();
      setAviso({ tipo: 'success', texto: `Libro "${libro.titulo}" agregado.` });
    } catch (error) {
      mostrarError(error);
    }
  };

  const editarLibro = async (id, cambios) => {
    try {
      const actual = libros.find((l) => l.id === id) || {};
      await libroApi.actualizar(id, { ...actual, ...cambios });
      await cargarLibros();
      setAviso({ tipo: 'success', texto: 'Libro actualizado.' });
    } catch (error) {
      mostrarError(error);
    }
  };

  const eliminarLibro = async (id) => {
    try {
      await libroApi.eliminar(id);
      await cargarLibros();
      setAviso({ tipo: 'success', texto: 'Libro eliminado.' });
    } catch (error) {
      mostrarError(error);
    }
  };

  const pedirPrestamo = async (libro) => {
    try {
      const prestamo = await prestamoApi.pedir(libro.id);
      await recargarTodo();
      setAviso({ tipo: 'success', texto: `Préstamo de "${libro.titulo}" registrado. Vence el ${prestamo.fechaVencimiento}.` });
      return true;
    } catch (error) {
      mostrarError(error);
      return false;
    }
  };

  const reservarLibro = async (libro) => {
    try {
      const reserva = await reservaApi.reservar(libro.id);
      await recargarTodo();
      setAviso({ tipo: 'success', texto: `Reserva de "${libro.titulo}" registrada. Vigente hasta el ${reserva.vigencia}.` });
    } catch (error) {
      mostrarError(error);
    }
  };

  const solicitarDevolucion = async (idPrestamo) => {
    try {
      await prestamoApi.solicitarDevolucion(idPrestamo);
      await recargarTodo();
      setAviso({ tipo: 'success', texto: 'Devolución solicitada. El bibliotecario la confirmará.' });
    } catch (error) {
      mostrarError(error);
    }
  };

  const confirmarDevolucion = async (idPrestamo) => {
    try {
      await prestamoApi.confirmarDevolucion(idPrestamo);
      await recargarTodo();
      setAviso({ tipo: 'success', texto: 'Devolución confirmada. El ejemplar quedó disponible.' });
    } catch (error) {
      mostrarError(error);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <ErrorBoundary>
          <Navbar busqueda={busqueda} setBusqueda={setBusqueda} usuario={usuario} setUsuario={setUsuario} />
          {aviso && (
            <Container className="mt-3">
              <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)}>
                {aviso.texto}
              </Alert>
            </Container>
          )}
          <Routes>
            <Route path="/" element={<Inicio libros={libros} usuario={usuario} />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/actividad/:id" element={<DetalleActividad usuario={usuario} />} />
            <Route path="/catalogo" element={<Catalogo busqueda={busqueda} libros={libros} pedirPrestamo={pedirPrestamo} reservarLibro={reservarLibro} usuario={usuario} prestamos={prestamos} />} />
            <Route path="/categoria/:nombre" element={<Catalogo busqueda={busqueda} libros={libros} pedirPrestamo={pedirPrestamo} reservarLibro={reservarLibro} usuario={usuario} prestamos={prestamos} />} />
            <Route
              path="/usuarios"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={['ADMINISTRADOR', 'BIBLIOTECARIO']}>
                  <Usuarios usuarios={usuarios} />
                </RutaProtegida>
              }
            />
            <Route
              path="/prestamos"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={['ADMINISTRADOR', 'BIBLIOTECARIO']}>
                  <Prestamos prestamos={prestamos} confirmarDevolucion={confirmarDevolucion} />
                </RutaProtegida>
              }
            />
            <Route
              path="/reservas"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={['ADMINISTRADOR', 'BIBLIOTECARIO']}>
                  <Reservas reservas={reservas} />
                </RutaProtegida>
              }
            />
            <Route path="/login" element={<Login iniciarSesion={iniciarSesion} />} />
            <Route path="/crear-cuenta" element={<CrearCuenta registrarUsuario={registrarUsuario} setUsuario={setUsuario} />} />
            <Route
              path="/perfil"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={['ESTUDIANTE', 'BIBLIOTECARIO', 'ADMINISTRADOR']}>
                  <Perfil
                    usuario={usuario}
                    editarPerfil={editarPerfil}
                    misPrestamos={usuario ? prestamos.filter((p) => p.correo === usuario.correo) : []}
                    misReservas={usuario ? reservas.filter((r) => r.correo === usuario.correo) : []}
                    solicitarDevolucion={solicitarDevolucion}
                  />
                </RutaProtegida>
              }
            />
            <Route
              path="/panel"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={['ADMINISTRADOR', 'BIBLIOTECARIO']}>
                  <PanelAdmin
                    usuario={usuario}
                    libros={libros}
                    agregarLibro={agregarLibro}
                    editarLibro={editarLibro}
                    eliminarLibro={eliminarLibro}
                    usuarios={usuarios}
                    prestamos={prestamos}
                    reservas={reservas}
                  />
                </RutaProtegida>
              }
            />
          </Routes>
          <Footer />
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;