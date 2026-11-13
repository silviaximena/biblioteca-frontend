import React from 'react';
import { Table, Container, Badge } from 'react-bootstrap';
import BotonVolver from './BotonVolver';

const colorEstado = {
  VIGENTE: 'success',
  VENCIDA: 'secondary',
  CANCELADA: 'danger',
};

const Reservas = ({ reservas }) => {
  return (
    <Container className="my-4">
      <BotonVolver />
      <div className="seccion-titulo">
        <span>Reservas</span>
      </div>
      {reservas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>No hay reservas registradas.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead style={{ backgroundColor: '#111111', color: '#fff' }}>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Libro</th>
              <th>Fecha</th>
              <th>Vigente hasta</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.id}</td>
                <td>{reserva.usuario}</td>
                <td>{reserva.libro}</td>
                <td>{reserva.fecha}</td>
                <td>{reserva.vigencia}</td>
                <td>
                  <Badge bg={colorEstado[reserva.estado]}>{reserva.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Reservas;