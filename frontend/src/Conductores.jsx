import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";
import { ConductoresFiltros } from "./ConductoresFiltros";
import { formatearFecha, hoy, mensajeDeError } from "./formato";

export function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [filtros, setFiltros] = useState({ apellido: "", dni: "" });
  const [error, setError] = useState(null);
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  const obtenerConductores = useCallback(async () => {
    const url = new URL("http://localhost:3000/conductores");

    if (filtros.apellido.trim()) {
      url.searchParams.append("apellido", filtros.apellido.trim());
    }
    if (filtros.dni) {
      url.searchParams.append("dni", filtros.dni);
    }

    const response = await fetchAuth(url);

    if (!response.ok) {
      console.error("Fallo al pedir conductores");
      setConductores([]);
      return;
    }

    const conductores = await response.json();

    setConductores(conductores);
  }, [filtros, fetchAuth]);

  useEffect(() => {
    obtenerConductores();
  }, [obtenerConductores]);

  const eliminarConductor = async (conductor) => {
    setError(null);
    if (
      !window.confirm(
        `¿Eliminar al conductor ${conductor.apellido}, ${conductor.nombre}?`,
      )
    ) {
      return;
    }

    const response = await fetchAuth(
      `http://localhost:3000/conductores/${conductor.id}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setError(await mensajeDeError(response));
      return;
    }

    obtenerConductores();
  };

  return (
    <>
      <h1>Conductores</h1>

      <h2>Filtros</h2>
      <ConductoresFiltros filtros={filtros} onChange={setFiltros} />

      <h2>Listado</h2>

      <Link to="/conductores/crear">
        <button>Nuevo conductor</button>
      </Link>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Licencia</th>
            <th>Alta licencia</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {conductores.map((conductor) => (
            <tr key={conductor.id}>
              <td>
                <Link to={`/conductores/${conductor.id}`}>{conductor.id}</Link>
              </td>
              <td>{conductor.apellido}</td>
              <td>{conductor.nombre}</td>
              <td>{conductor.dni}</td>
              <td>{conductor.numeroLicencia}</td>
              <td>{formatearFecha(conductor.fechaAltaLicencia)}</td>
              <td
                className={
                  conductor.fechaVencimientoLicencia < hoy() ? "vencida" : ""
                }
              >
                {formatearFecha(conductor.fechaVencimientoLicencia)}
                {conductor.fechaVencimientoLicencia < hoy() && " (vencida)"}
              </td>
              <td className="acciones">
                <button
                  onClick={() => navigate(`/conductores/${conductor.id}`)}
                >
                  Viajes
                </button>
                <button
                  onClick={() =>
                    navigate(`/conductores/${conductor.id}/modificar`)
                  }
                >
                  Modificar
                </button>
                <button
                  className="peligro"
                  onClick={() => eliminarConductor(conductor)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {conductores.length === 0 && (
            <tr>
              <td colSpan={8}>No hay conductores</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
