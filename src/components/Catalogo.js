import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import BotonVolver from './BotonVolver';

const categorias = ['Novelas', 'Técnicos', 'Infantil', 'Historia'];
const portadaPorDefecto = 'https://placehold.co/300x180/e9e1cb/333333?text=Sin+portada';
const MAX_PRESTAMOS_ACTIVOS = 5;

const Catalogo = ({ busqueda, libros, pedirPrestamo, reservarLibro, usuario, prestamos }) => {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const categoriaActiva = nombre ? decodeURIComponent(nombre) : null;

  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [confirmado, setConfirmado] = useState(null);

  const prestamosActivos = usuario
      ? (prestamos || []).filter((p) => p.correo === usuario.correo && (p.estado === 'ACTIVO' || p.estado === 'ATRASADO')).length
      : 0;
  const alcanzoLimite = prestamosActivos >= MAX_PRESTAMOS_ACTIVOS;

  const librosFiltrados = libros.filter((libro) => {
    const texto = (busqueda || '').toLowerCase();
    const coincideTexto =
        libro.titulo.toLowerCase().includes(texto) ||
        libro.autor.toLowerCase().includes(texto);
    const coincideCategoria = !categoriaActiva || libro.categoria === categoriaActiva;
    return coincideTexto && coincideCategoria;
  });

  const handleSeleccionar = (libro) => {
    if (!usuario) return;
    setConfirmado(null);
    setLibroSeleccionado(libro);
  };

  const handleConfirmar = async () => {
    if (!libroSeleccionado || alcanzoLimite) return;
    const libro = libroSeleccionado;
    setLibroSeleccionado(null);
    const exito = await pedirPrestamo(libro, usuario);
    if (exito) {
      setConfirmado(libro.titulo);
    }
  };

  const handleCancelar = () => {
    setLibroSeleccionado(null);
  };

  return (
      <Container className="my-4" style={{ paddingBottom: libroSeleccionado ? '120px' : '0' }}>
        <BotonVolver />
        <div className="seccion-titulo">
          <span>Catálogo</span>
        </div>

        {usuario && alcanzoLimite && (
            <Alert variant="warning" className="text-center">
              Ya tienes {MAX_PRESTAMOS_ACTIVOS} préstamos activos. Devuelve alguno antes de pedir otro.
            </Alert>
        )}

        {confirmado && (
            <Alert variant="success" className="text-center" onClose={() => setConfirmado(null)} dismissible>
              Préstamo de "{confirmado}" confirmado.
            </Alert>
        )}

        <Row className="g-2 mb-4">
          {categorias.map((cat) => (
              <Col xs={6} md={3} key={cat}>
                <Link to={`/categoria/${encodeURIComponent(cat)}`} style={{ textDecoration: 'none' }}>
                  <div
                      className="categoria-card"
                      style={{ outline: categoriaActiva === cat ? '2px solid #f2c14e' : 'none' }}
                  >
                    {cat}
                  </div>
                </Link>
              </Col>
          ))}
        </Row>

        <div className="seccion-titulo">
          <span>{categoriaActiva ? `Libros de ${categoriaActiva}` : 'Libros destacados'}</span>
        </div>

        {categoriaActiva && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Button variant="outline-secondary" size="sm" onClick={() => navigate('/catalogo')}>
                Quitar filtro de categoría
              </Button>
            </div>
        )}

        {librosFiltrados.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#777' }}>
              No se encontraron libros{busqueda ? ` para "${busqueda}"` : ''}{categoriaActiva ? ` en ${categoriaActiva}` : ''}.
            </p>
        ) : (
            <Row className="g-3">
              {librosFiltrados.map((libro) => {
                const yaSeleccionado = libroSeleccionado?.id === libro.id;
                return (
                    <Col md={6} lg={3} key={libro.id}>
                      <Card
                          className="h-100 shadow-sm"
                          style={{ outline: yaSeleccionado ? '2px solid #f2c14e' : 'none' }}
                      >
                        <Card.Img
                            variant="top"
                            src={libro.portada || portadaPorDefecto}
                            style={{ height: '240px', objectFit: 'contain', backgroundColor: '#f5f5f5', padding: '8px' }}
                            onError={(e) => { e.target.src = portadaPorDefecto; }}
                        />
                        <Card.Body>
                          <Card.Title style={{ fontSize: '15px' }}>{libro.titulo}</Card.Title>
                          <Card.Text className="text-muted" style={{ fontSize: '13px' }}>{libro.autor}</Card.Text>
                          <Card.Text style={{ fontSize: '12px' }}>
                            {libro.disponibles > 0 ? (
                                <span style={{ color: 'green' }}>Disponible ({libro.disponibles})</span>
                            ) : (
                                <span style={{ color: 'red' }}>Agotado</span>
                            )}
                          </Card.Text>
                          {!usuario ? (
                              <Link to="/login" className="btn btn-amarillo btn-sm">
                                Inicia sesión para pedir
                              </Link>
                          ) : libro.disponibles === 0 ? (
                              <Button variant="outline-dark" size="sm" onClick={() => reservarLibro(libro)}>
                                Reservar
                              </Button>
                          ) : (
                              <Button
                                  className="btn-amarillo"
                                  disabled={alcanzoLimite}
                                  onClick={() => handleSeleccionar(libro)}
                              >
                                {yaSeleccionado ? 'Seleccionado ✓' : 'Pedir préstamo'}
                              </Button>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                );
              })}
            </Row>
        )}

        {libroSeleccionado && (
            <div
                style={{
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#111111',
                  borderTop: '4px solid #f2c14e',
                  padding: '14px 20px',
                  zIndex: 1000,
                  boxShadow: '0 -6px 16px rgba(0,0,0,0.25)',
                }}
            >
              <Container className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <img
                      src={libroSeleccionado.portada || portadaPorDefecto}
                      alt={libroSeleccionado.titulo}
                      style={{ width: '44px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.target.src = portadaPorDefecto; }}
                  />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{libroSeleccionado.titulo}</div>
                    <div style={{ color: '#aaa', fontSize: '12px' }}>{libroSeleccionado.autor}</div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-light" size="sm" onClick={handleCancelar}>
                    Cancelar
                  </Button>
                  <Button className="btn-amarillo" size="sm" onClick={handleConfirmar} disabled={alcanzoLimite}>
                    Confirmar préstamo
                  </Button>
                </div>
              </Container>
            </div>
        )}
      </Container>
  );
};

export default Catalogo;