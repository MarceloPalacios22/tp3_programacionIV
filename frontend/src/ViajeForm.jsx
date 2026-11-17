import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useAuth } from "./Auth";
import { VehiculosSelect } from "./VehiculosSelect";
import { ConductoresSelect } from "./ConductoresSelect";
import { mensajeDeError } from "./formato";

// Formulario de registro (/viajes/crear) y modificacion (/viajes/:id/modificar)
export function ViajeForm() {
  const { id } = useParams();
  // Permite llegar con el vehiculo o conductor preseleccionado
  // (por ejemplo /viajes/crear?vehiculoId=1)
  const [searchParams] = useSearchParams();
  const [viaje, setViaje] = useState({
    vehiculoId: Number(searchParams.get("vehiculoId")) || 0,
    conductorId: Number(searchParams.get("conductorId")) || 0,
    fechaSalida: "",
    fechaLlegada: "",
    origen: "",
    destino: "",
    kilometros: "",
    observaciones: "",
  });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  // Si es modificacion, cargo los datos del viaje
  const obtenerViaje = useCallback(async () => {
    if (!id) {
      return;
    }

    const response = await fetchAuth(`http://localhost:3000/viajes/${id}`);

    if (!response.ok) {
      setErrorApi(await mensajeDeError(response));
      return;
    }

    const viaje = await response.json();

    setViaje({
      vehiculoId: viaje.vehiculoId,
      conductorId: viaje.conductorId,
      fechaSalida: viaje.fechaSalida,
      fechaLlegada: viaje.fechaLlegada,
      origen: viaje.origen,
      destino: viaje.destino,
      kilometros: String(viaje.kilometros),
      observaciones: viaje.observaciones ?? "",
    });
  }, [id, fetchAuth]);

  useEffect(() => {
    obtenerViaje();
  }, [obtenerViaje]);

  // Validaciones del formulario (las mismas reglas que el backend)
  const validar = () => {
    const nuevosErrores = {};
    const {
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = viaje;

    if (vehiculoId === 0) {
      nuevosErrores.vehiculoId = "Seleccione un vehículo";
    }
    if (conductorId === 0) {
      nuevosErrores.conductorId = "Seleccione un conductor";
    }
    if (!fechaSalida) {
      nuevosErrores.fechaSalida = "La fecha de salida es obligatoria";
    }
    if (!fechaLlegada) {
      nuevosErrores.fechaLlegada = "La fecha de llegada es obligatoria";
    } else if (fechaSalida && fechaLlegada < fechaSalida) {
      nuevosErrores.fechaLlegada =
        "No puede ser anterior a la fecha de salida";
    }
    if (!origen.trim()) {
      nuevosErrores.origen = "El origen es obligatorio";
    } else if (origen.trim().length > 100) {
      nuevosErrores.origen = "Máximo 100 caracteres";
    }
    if (!destino.trim()) {
      nuevosErrores.destino = "El destino es obligatorio";
    } else if (destino.trim().length > 100) {
      nuevosErrores.destino = "Máximo 100 caracteres";
    }
    if (!kilometros) {
      nuevosErrores.kilometros = "Los kilómetros son obligatorios";
    } else if (
      isNaN(Number(kilometros)) ||
      Number(kilometros) <= 0 ||
      Number(kilometros) > 100000
    ) {
      nuevosErrores.kilometros = "Debe ser un número mayor a 0";
    }
    if (observaciones.length > 255) {
      nuevosErrores.observaciones = "Máximo 255 caracteres";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi(null);

    if (!validar()) {
      return;
    }

    const url = id
      ? `http://localhost:3000/viajes/${id}`
      : "http://localhost:3000/viajes";

    const response = await fetchAuth(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...viaje,
        origen: viaje.origen.trim(),
        destino: viaje.destino.trim(),
        kilometros: Number(viaje.kilometros),
        observaciones: viaje.observaciones.trim(),
      }),
    });

    if (!response.ok) {
      setErrorApi(await mensajeDeError(response));
      return;
    }

    navigate("/viajes");
  };

  return (
    <>
      <h2>{id ? "Modificar viaje" : "Registrar viaje"}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <VehiculosSelect
          vehiculoId={viaje.vehiculoId}
          onChange={(vehiculoId) => setViaje((v) => ({ ...v, vehiculoId }))}
        />
        {errores.vehiculoId && <p className="error">{errores.vehiculoId}</p>}

        <ConductoresSelect
          conductorId={viaje.conductorId}
          onChange={(conductorId) => setViaje((v) => ({ ...v, conductorId }))}
        />
        {errores.conductorId && (
          <p className="error">{errores.conductorId}</p>
        )}

        <label htmlFor="fechaSalida">Fecha de salida:</label>
        <input
          type="date"
          id="fechaSalida"
          value={viaje.fechaSalida}
          onChange={(e) =>
            setViaje((v) => ({ ...v, fechaSalida: e.target.value }))
          }
        />
        {errores.fechaSalida && (
          <p className="error">{errores.fechaSalida}</p>
        )}

        <label htmlFor="fechaLlegada">Fecha de llegada:</label>
        <input
          type="date"
          id="fechaLlegada"
          min={viaje.fechaSalida}
          value={viaje.fechaLlegada}
          onChange={(e) =>
            setViaje((v) => ({ ...v, fechaLlegada: e.target.value }))
          }
        />
        {errores.fechaLlegada && (
          <p className="error">{errores.fechaLlegada}</p>
        )}

        <label htmlFor="origen">Origen:</label>
        <input
          type="text"
          id="origen"
          maxLength={100}
          value={viaje.origen}
          onChange={(e) => setViaje((v) => ({ ...v, origen: e.target.value }))}
        />
        {errores.origen && <p className="error">{errores.origen}</p>}

        <label htmlFor="destino">Destino:</label>
        <input
          type="text"
          id="destino"
          maxLength={100}
          value={viaje.destino}
          onChange={(e) => setViaje((v) => ({ ...v, destino: e.target.value }))}
        />
        {errores.destino && <p className="error">{errores.destino}</p>}

        <label htmlFor="kilometros">Kilómetros:</label>
        <input
          type="number"
          id="kilometros"
          min={0}
          step="0.01"
          value={viaje.kilometros}
          onChange={(e) =>
            setViaje((v) => ({ ...v, kilometros: e.target.value }))
          }
        />
        {errores.kilometros && <p className="error">{errores.kilometros}</p>}

        <label htmlFor="observaciones">Observaciones (opcional):</label>
        <textarea
          id="observaciones"
          rows={3}
          maxLength={255}
          value={viaje.observaciones}
          onChange={(e) =>
            setViaje((v) => ({ ...v, observaciones: e.target.value }))
          }
        />
        {errores.observaciones && (
          <p className="error">{errores.observaciones}</p>
        )}

        {errorApi && <p className="error">{errorApi}</p>}

        <div>
          <button type="submit">{id ? "Guardar cambios" : "Registrar"}</button>{" "}
          <button type="button" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </form>
    </>
  );
}
