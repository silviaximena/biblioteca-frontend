import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import BotonVolver from './BotonVolver';
import { mensajeDeError } from '../services/api';

const CrearCuenta = ({ registrarUsuario, setUsuario }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const correoLimpio = correo.trim().toLowerCase();

    if (!nombre || !correoLimpio || !clave || !fechaNacimiento) {
      setError('Completa todos los campos.');
      return;
    }
    if (!correoLimpio.endsWith('@duoc.cl') && !correoLimpio.endsWith('@profesor.duoc.cl')) {
      setError('El correo debe ser @duoc.cl o @profesor.duoc.cl');
      return;
    }
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaNacimiento > hoy) {
      setError('La fecha de nacimiento no puede ser una fecha futura.');
      return;
    }
    if (clave.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setCargando(true);
    try {
      const nuevoUsuario = await registrarUsuario({ nombre, correo: correoLimpio, clave, fechaNacimiento });
      setError('');
      setExito(true);
      setTimeout(() => {
        setUsuario(nuevoUsuario);
        navigate('/', { state: { bienvenida: nombre } });
      }, 2500);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: '420px', position: 'relative' }}>
      <BotonVolver />
      {exito && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          style={{ position: 'fixed', top: 0, left: 0 }}
        />
      )}
      <div className="seccion-titulo">
        <span>Crear cuenta</span>
      </div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre completo</Form.Label>
          <Form.Control type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={exito} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Correo institucional</Form.Label>
          <Form.Control type="email" placeholder="nombre@duoc.cl" value={correo} onChange={(e) => setCorreo(e.target.value)} disabled={exito} />
          <Form.Text muted>@duoc.cl para estudiantes, @profesor.duoc.cl para docentes.</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Fecha de nacimiento</Form.Label>
          <Form.Control type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} disabled={exito} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control type="password" placeholder="Contraseña" value={clave} onChange={(e) => setClave(e.target.value)} disabled={exito} />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        {exito && (
          <Alert variant="success">
            ¡Bienvenido/a a Biblioteca Municipal, {nombre}! Te estamos llevando a Inicio...
          </Alert>
        )}
        {!exito && (
          <Button type="submit" className="btn-amarillo w-100 mb-3" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        )}
        {!exito && (
          <div style={{ textAlign: 'center', fontSize: '14px' }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        )}
      </Form>
    </Container>
  );
};

export default CrearCuenta;