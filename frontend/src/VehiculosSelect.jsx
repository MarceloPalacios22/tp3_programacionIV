import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";

export function VehiculosSelect({
  vehiculoId,
  onChange,
  textoVacio = "Seleccione un vehículo",
}) {
  const [vehiculos, setVehiculos] = useState([]);
  const { fetchAuth } = useAuth();

  const obtenerVehiculos = useCallback(async () => {
    const response = await fetchAuth("http://localhost:3000/vehiculos");

    if (!response.ok) {
      console.error("Fallo al pedir vehiculos");
      return;
    }

    const vehiculos = await response.json();

    setVehiculos(vehiculos);
  }, [fetchAuth]);

  useEffect(() => {
    obtenerVehiculos();
  }, [obtenerVehiculos]);

  return (
    <>
      <label htmlFor="vehiculo">Vehículo:</label>
      <select
        id="vehiculo"
        value={vehiculoId}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value={0}>{textoVacio}</option>
        {vehiculos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.patente} - {v.marca} {v.modelo}
          </option>
        ))}
      </select>
    </>
  );
}
