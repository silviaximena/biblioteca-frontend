import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Table, Badge, Row, Col } from 'react-bootstrap';
import BotonVolver from './BotonVolver';

const Perfil = ({ usuario, editarPerfil, misPrestamos, misReservas, solicitarDevolucion }) => {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario.nombre);
  const [fechaNacimiento, setFechaNacimiento] = useState(usuario.fechaNacimiento || '');
  const [guardado, setGuardado] = useState(false);

  const categoria = usuario.correo.endsWith('@profesor.duoc.cl') ? 'Docente' : 'Estudiante';

  const handleGuardar = async (e) => {
    e.preventDefault();
    const exito = await editarPerfil(usuario.correo, { nombre, fechaNacimiento });
    if (exito) {
      setEditando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    }
  };

  return (
    <Container className="my-4" style={{ maxWidth: '700px' }}>
      <BotonVolver />
      <div className="seccion-titulo">
        <span>Mi perfil</span>
      </div>

      {guardado && <Alert variant="success">Perfil actualizado correctamente.</Alert>}

      <Card className="mb-4 p-3 shadow-sm">
        {!editando ? (
          <>
            <Row className="g-3">
              <Col md={6}>
                <div style={{ fontSize: '12px', color: '#888' }}>Nombre</div>
                <div style={{ fontWeight: 600 }}>{usuario.nombre}</div>
              </Col>
              <Col md={6}>
                <div style={{ fontSize: '12px', color: '#888' }}>Correo</div>
                <div style={{ fontWeight: 600 }}>{usuario.correo}</div>
              </Col>
              <Col md={6}>
                <div style={{ fontSize: '12px', color: '#888' }}>Fecha de nacimiento</div>
                <div style={{ fontWeight: 600 }}>{usuario.fechaNacimiento || 'No registrada'}</div>
              </Col>
              <Col md={6}>
                <div style={{ fontSize: '12px', color: '#888' }}>Tipo de cuenta</div>
                <div>
                  <Badge bg="secondary" className="me-1">{categoria}</Badge>
                  <Badge bg={usuario.tipo === 'ADMINISTRADOR' ? 'warning' : usuario.tipo === 'BIBLIOTECARIO' ? 'info' : 'dark'}>
                    {usuario.tipo}
                  </Badge>
                </div>
              </Col>
            </Row>
            <Button className="btn-amarillo mt-3" style={{ width: 'fit-content' }} onClick={() => setEditando(true)}>
              Editar perfil
            </Button>
          </>
        ) : (
          <Form onSubmit={handleGuardar}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de nacimiento</Form.Label>
              <Form.Control
                type="date"
                value={fechaNacimiento}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" className="btn-amarillo me-2">Guardar cambios</Button>
            <Button variant="outline-secondary" onClick={() => setEditando(false)}>Cancelar</Button>
          </Form>
        )}
      </Card>

      <div className="seccion-titulo">
        <span>Mis préstamos</span>
      </div>
      {misPrestamos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>Aún no has pedido ningún préstamo.</p>
      ) : (
        <Table striped bordered hover responsive className="mb-5">
          <thead style={{ backgroundColor: '#111111', color: '#fff' }}>
            <tr><th>Libro</th><th>Fecha préstamo</th><th>Vence</th><th>Estado</th><th>Devolución</th></tr>
          </thead>
          <tbody>
            {misPrestamos.map((p) => (
              <tr key={p.id}>
                <td>{p.libroTitulo}</td>
                <td>{p.fechaPrestamo}</td>
                <td>{p.fechaVencimiento}</td>
                <td><Badge bg={p.estado === 'ATRASADO' ? 'danger' : p.estado === 'DEVUELTO' ? 'secondary' : 'success'}>{p.estado}</Badge></td>
                <td>
                  {p.estado === 'DEVUELTO' ? (
                    <span style={{ color: '#888', fontSize: '13px' }}>—</span>
                  ) : p.solicitaDevolucion ? (
                    <span style={{ color: '#b5860a', fontSize: '13px' }}>Solicitada, esperando confirmación</span>
                  ) : (
                    <Button size="sm" variant="outline-dark" onClick={() => solicitarDevolucion(p.id)}>
                      Solicitar devolución
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="seccion-titulo">
        <span>Mis reservas</span>
      </div>
      {misReservas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>No tienes reservas activas.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead style={{ backgroundColor: '#111111', color: '#fff' }}>
            <tr><th>Libro</th><th>Fecha</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {misReservas.map((r) => (
              <tr key={r.id}>
                <td>{r.libroTitulo}</td>
                <td>{r.fecha}</td>
                <td><Badge bg="success">{r.estado}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Perfil;