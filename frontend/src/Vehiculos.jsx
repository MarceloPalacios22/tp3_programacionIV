import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";
import { VehiculosFiltros } from "./VehiculosFiltros";
import { mensajeDeError } from "./formato";

export function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtros, setFiltros] = useState({ marca: "", patente: "" });
  const [error, setError] = useState(null);
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  const obtenerVehiculos = useCallback(async () => {
    const url = new URL("http://localhost:3000/vehiculos");

    if (filtros.marca.trim()) {
      url.searchParams.append("marca", filtros.marca.trim());
    }
    if (filtros.patente) {
      url.searchParams.append("patente", filtros.patente);
    }

    const response = await fetchAuth(url);

    if (!response.ok) {
      console.error("Fallo al pedir vehiculos");
      setVehiculos([]);
      return;
    }

    const vehiculos = await response.json();

    setVehiculos(vehiculos);
  }, [filtros, fetchAuth]);

  useEffect(() => {
    obtenerVehiculos();
  }, [obtenerVehiculos]);

  const eliminarVehiculo = async (vehiculo) => {
    setError(null);
    if (
      !window.confirm(
        `¿Eliminar el vehículo ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})?`,
      )
    ) {
      return;
    }

    const response = await fetchAuth(
      `http://localhost:3000/vehiculos/${vehiculo.id}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setError(await mensajeDeError(response));
      return;
    }

    obtenerVehiculos();
  };

  return (
    <>
      <h1>Vehículos</h1>

      <h2>Filtros</h2>
      <VehiculosFiltros filtros={filtros} onChange={setFiltros} />

      <h2>Listado</h2>

      <Link to="/vehiculos/crear">
        <button>Nuevo vehículo</button>
      </Link>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Patente</th>
            <th>Año</th>
            <th>Capacidad (kg)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((vehiculo) => (
            <tr key={vehiculo.id}>
              <td>
                <Link to={`/vehiculos/${vehiculo.id}`}>{vehiculo.id}</Link>
              </td>
              <td>{vehiculo.marca}</td>
              <td>{vehiculo.modelo}</td>
              <td>{vehiculo.patente}</td>
              <td>{vehiculo.anio}</td>
              <td>{vehiculo.capacidadCarga.toLocaleString("es-AR")}</td>
              <td className="acciones">
                <button onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}>
                  Viajes
                </button>
                <button
                  onClick={() =>
                    navigate(`/vehiculos/${vehiculo.id}/modificar`)
                  }
                >
                  Modificar
                </button>
                <button
                  className="peligro"
                  onClick={() => eliminarVehiculo(vehiculo)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {vehiculos.length === 0 && (
            <tr>
              <td colSpan={7}>No hay vehículos</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
