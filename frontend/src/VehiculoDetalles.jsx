import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "./Auth";
import { ViajesTabla } from "./ViajesTabla";
import { formatearKm } from "./formato";

export function VehiculoDetalles() {
  const [vehiculo, setVehiculo] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [totales, setTotales] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { fetchAuth } = useAuth();

  const obtenerDatos = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/vehiculos/${id}`);

    if (!response.ok) {
      console.error("Fallo al pedir detalles de vehiculo");
      setError("Vehículo no encontrado");
      setVehiculo(null);
      return;
    }

    setVehiculo(await response.json());

    // Historial de viajes del vehiculo
    const responseViajes = await fetchAuth(
      `http://localhost:3000/vehiculos/${id}/viajes`,
    );
    if (responseViajes.ok) {
      setViajes(await responseViajes.json());
    }

    // Total de kilometros recorridos
    const responseKm = await fetchAuth(
      `http://localhost:3000/vehiculos/${id}/kilometros`,
    );
    if (responseKm.ok) {
      setTotales(await responseKm.json());
    }
  }, [id, fetchAuth]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  if (error) {
    return (
      <>
        <p className="error">{error}</p>
        <Link to="/vehiculos">
          <button>Volver</button>
        </Link>
      </>
    );
  }

  if (!vehiculo || !id) {
    return null;
  }

  return (
    <>
      <h2>
        Vehículo {vehiculo.marca} {vehiculo.modelo}
      </h2>
      <div className="detalle">
        <p>
          Patente: <b>{vehiculo.patente}</b>
        </p>
        <p>
          Año: <b>{vehiculo.anio}</b>
        </p>
        <p>
          Capacidad de carga:{" "}
          <b>{vehiculo.capacidadCarga.toLocaleString("es-AR")} kg</b>
        </p>
      </div>

      {totales && (
        <div className="resumen">
          <p>
            Viajes realizados: <b>{totales.cantidadViajes}</b>
          </p>
          <p>
            Total de kilómetros recorridos:{" "}
            <b>{formatearKm(totales.totalKilometros)}</b>
          </p>
        </div>
      )}

      <h3>Historial de viajes</h3>
      <Link to={`/viajes/crear?vehiculoId=${vehiculo.id}`}>
        <button>Registrar viaje</button>
      </Link>
      <ViajesTabla viajes={viajes} />

      <div>
        <Link to={`/vehiculos/${vehiculo.id}/modificar`}>
          <button>Modificar</button>
        </Link>{" "}
        <Link to="/vehiculos">
          <button>Volver</button>
        </Link>
      </div>
    </>
  );
}
