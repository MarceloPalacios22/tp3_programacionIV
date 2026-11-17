import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";
import { VehiculosSelect } from "./VehiculosSelect";
import { ConductoresSelect } from "./ConductoresSelect";
import { ViajesTabla } from "./ViajesTabla";
import { formatearFecha, mensajeDeError } from "./formato";

export function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [filtros, setFiltros] = useState({ vehiculoId: 0, conductorId: 0 });
  const [error, setError] = useState(null);
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  const obtenerViajes = useCallback(async () => {
    const url = new URL("http://localhost:3000/viajes");

    if (filtros.vehiculoId > 0) {
      url.searchParams.append("vehiculoId", filtros.vehiculoId);
    }
    if (filtros.conductorId > 0) {
      url.searchParams.append("conductorId", filtros.conductorId);
    }

    const response = await fetchAuth(url);

    if (!response.ok) {
      console.error("Fallo al pedir viajes");
      setViajes([]);
      return;
    }

    const viajes = await response.json();

    setViajes(viajes);
  }, [filtros, fetchAuth]);

  useEffect(() => {
    obtenerViajes();
  }, [obtenerViajes]);

  const eliminarViaje = async (viaje) => {
    setError(null);
    if (
      !window.confirm(
        `¿Eliminar el viaje ${viaje.origen} - ${viaje.destino} del ${formatearFecha(viaje.fechaSalida)}?`,
      )
    ) {
      return;
    }

    const response = await fetchAuth(
      `http://localhost:3000/viajes/${viaje.id}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setError(await mensajeDeError(response));
      return;
    }

    obtenerViajes();
  };

  return (
    <>
      <h1>Viajes</h1>

      <h2>Historial por vehículo o conductor</h2>
      <div className="filtros">
        <div>
          <VehiculosSelect
            vehiculoId={filtros.vehiculoId}
            textoVacio="Todos los vehículos"
            onChange={(vehiculoId) => setFiltros((f) => ({ ...f, vehiculoId }))}
          />
        </div>
        <div>
          <ConductoresSelect
            conductorId={filtros.conductorId}
            textoVacio="Todos los conductores"
            onChange={(conductorId) =>
              setFiltros((f) => ({ ...f, conductorId }))
            }
          />
        </div>
      </div>

      <h2>Listado</h2>

      <Link to="/viajes/crear">
        <button>Registrar viaje</button>
      </Link>

      {error && <p className="error">{error}</p>}

      <ViajesTabla
        viajes={viajes}
        onModificar={(viaje) => navigate(`/viajes/${viaje.id}/modificar`)}
        onEliminar={eliminarViaje}
      />
    </>
  );
}
