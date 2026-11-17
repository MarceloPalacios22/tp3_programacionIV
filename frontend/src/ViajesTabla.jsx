import { formatearFecha, formatearKm } from "./formato";

// Tabla de viajes reutilizada en Viajes, VehiculoDetalles y ConductorDetalles
export function ViajesTabla({ viajes, onModificar, onEliminar }) {
  const totalKilometros = viajes.reduce((total, v) => total + v.kilometros, 0);
  const conAcciones = onModificar || onEliminar;

  return (
    <table>
      <thead>
        <tr>
          <th>Salida</th>
          <th>Llegada</th>
          <th>Vehículo</th>
          <th>Conductor</th>
          <th>Origen</th>
          <th>Destino</th>
          <th>Kilómetros</th>
          <th>Observaciones</th>
          {conAcciones && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {viajes.map((viaje) => (
          <tr key={viaje.id}>
            <td>{formatearFecha(viaje.fechaSalida)}</td>
            <td>{formatearFecha(viaje.fechaLlegada)}</td>
            <td>
              {viaje.vehiculo} ({viaje.patente})
            </td>
            <td>{viaje.conductor}</td>
            <td>{viaje.origen}</td>
            <td>{viaje.destino}</td>
            <td>{formatearKm(viaje.kilometros)}</td>
            <td>{viaje.observaciones}</td>
            {conAcciones && (
              <td className="acciones">
                {onModificar && (
                  <button onClick={() => onModificar(viaje)}>Modificar</button>
                )}
                {onEliminar && (
                  <button className="peligro" onClick={() => onEliminar(viaje)}>
                    Eliminar
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
        {viajes.length === 0 && (
          <tr>
            <td colSpan={conAcciones ? 9 : 8}>No hay viajes registrados</td>
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr>
          <th colSpan={6}>Total ({viajes.length} viajes)</th>
          <th>{formatearKm(totalKilometros)}</th>
          <th colSpan={conAcciones ? 2 : 1}></th>
        </tr>
      </tfoot>
    </table>
  );
}
