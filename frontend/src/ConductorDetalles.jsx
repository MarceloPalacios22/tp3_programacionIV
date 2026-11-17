import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "./Auth";
import { ViajesTabla } from "./ViajesTabla";
import { formatearFecha, formatearKm, hoy } from "./formato";

export function ConductorDetalles() {
  const [conductor, setConductor] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [totales, setTotales] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { fetchAuth } = useAuth();

  const obtenerDatos = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/conductores/${id}`);

    if (!response.ok) {
      console.error("Fallo al pedir detalles de conductor");
      setError("Conductor no encontrado");
      setConductor(null);
      return;
    }

    setConductor(await response.json());

    // Historial de viajes del conductor
    const responseViajes = await fetchAuth(
      `http://localhost:3000/conductores/${id}/viajes`,
    );
    if (responseViajes.ok) {
      setViajes(await responseViajes.json());
    }

    // Total de kilometros recorridos
    const responseKm = await fetchAuth(
      `http://localhost:3000/conductores/${id}/kilometros`,
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
        <Link to="/conductores">
          <button>Volver</button>
        </Link>
      </>
    );
  }

  if (!conductor || !id) {
    return null;
  }

  const licenciaVencida = conductor.fechaVencimientoLicencia < hoy();

  return (
    <>
      <h2>
        Conductor {conductor.apellido}, {conductor.nombre}
      </h2>
      <div className="detalle">
        <p>
          DNI: <b>{conductor.dni}</b>
        </p>
        <p>
          Número de licencia: <b>{conductor.numeroLicencia}</b>
        </p>
        <p>
          Alta de licencia: <b>{formatearFecha(conductor.fechaAltaLicencia)}</b>
        </p>
        <p>
          Vencimiento de licencia:{" "}
          <b className={licenciaVencida ? "vencida" : ""}>
            {formatearFecha(conductor.fechaVencimientoLicencia)}
            {licenciaVencida && " (vencida)"}
          </b>
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
      <Link to={`/viajes/crear?conductorId=${conductor.id}`}>
        <button>Registrar viaje</button>
      </Link>
      <ViajesTabla viajes={viajes} />

      <div>
        <Link to={`/conductores/${conductor.id}/modificar`}>
          <button>Modificar</button>
        </Link>{" "}
        <Link to="/conductores">
          <button>Volver</button>
        </Link>
      </div>
    </>
  );
}
