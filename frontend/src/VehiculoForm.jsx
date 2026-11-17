import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "./Auth";
import { mensajeDeError } from "./formato";

const anioMaximo = new Date().getFullYear() + 1;

// Formulario de alta (/vehiculos/crear) y modificacion (/vehiculos/:id/modificar)
export function VehiculoForm() {
  const { id } = useParams();
  const [vehiculo, setVehiculo] = useState({
    marca: "",
    modelo: "",
    patente: "",
    anio: "",
    capacidadCarga: "",
  });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  // Si es modificacion, cargo los datos del vehiculo
  const obtenerVehiculo = useCallback(async () => {
    if (!id) {
      return;
    }

    const response = await fetchAuth(`http://localhost:3000/vehiculos/${id}`);

    if (!response.ok) {
      setErrorApi(await mensajeDeError(response));
      return;
    }

    const vehiculo = await response.json();

    setVehiculo({
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      patente: vehiculo.patente,
      anio: String(vehiculo.anio),
      capacidadCarga: String(vehiculo.capacidadCarga),
    });
  }, [id, fetchAuth]);

  useEffect(() => {
    obtenerVehiculo();
  }, [obtenerVehiculo]);

  // Validaciones del formulario (las mismas reglas que el backend)
  const validar = () => {
    const nuevosErrores = {};
    const { marca, modelo, patente, anio, capacidadCarga } = vehiculo;

    if (!marca.trim()) {
      nuevosErrores.marca = "La marca es obligatoria";
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ -]{1,50}$/.test(marca.trim())) {
      nuevosErrores.marca = "Solo letras, hasta 50 caracteres";
    }

    if (!modelo.trim()) {
      nuevosErrores.modelo = "El modelo es obligatorio";
    } else if (!/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .-]{1,50}$/.test(modelo.trim())) {
      nuevosErrores.modelo = "Solo letras y números, hasta 50 caracteres";
    }

    if (!patente.trim()) {
      nuevosErrores.patente = "La patente es obligatoria";
    } else if (
      !/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/.test(patente.trim())
    ) {
      nuevosErrores.patente = "Formato ABC123 o AB123CD";
    }

    if (!anio) {
      nuevosErrores.anio = "El año es obligatorio";
    } else if (
      !Number.isInteger(Number(anio)) ||
      Number(anio) < 1950 ||
      Number(anio) > anioMaximo
    ) {
      nuevosErrores.anio = `El año debe estar entre 1950 y ${anioMaximo}`;
    }

    if (!capacidadCarga) {
      nuevosErrores.capacidadCarga = "La capacidad de carga es obligatoria";
    } else if (
      isNaN(Number(capacidadCarga)) ||
      Number(capacidadCarga) <= 0 ||
      Number(capacidadCarga) > 100000
    ) {
      nuevosErrores.capacidadCarga = "Debe ser un número mayor a 0";
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
      ? `http://localhost:3000/vehiculos/${id}`
      : "http://localhost:3000/vehiculos";

    const response = await fetchAuth(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marca: vehiculo.marca.trim(),
        modelo: vehiculo.modelo.trim(),
        patente: vehiculo.patente.trim(),
        anio: Number(vehiculo.anio),
        capacidadCarga: Number(vehiculo.capacidadCarga),
      }),
    });

    if (!response.ok) {
      setErrorApi(await mensajeDeError(response));
      return;
    }

    navigate("/vehiculos");
  };

  return (
    <>
      <h2>{id ? "Modificar vehículo" : "Nuevo vehículo"}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="marca">Marca:</label>
        <input
          type="text"
          id="marca"
          value={vehiculo.marca}
          onChange={(e) => setVehiculo((v) => ({ ...v, marca: e.target.value }))}
        />
        {errores.marca && <p className="error">{errores.marca}</p>}

        <label htmlFor="modelo">Modelo:</label>
        <input
          type="text"
          id="modelo"
          value={vehiculo.modelo}
          onChange={(e) =>
            setVehiculo((v) => ({ ...v, modelo: e.target.value }))
          }
        />
        {errores.modelo && <p className="error">{errores.modelo}</p>}

        <label htmlFor="patente">Patente:</label>
        <input
          type="text"
          id="patente"
          maxLength={7}
          placeholder="ABC123 o AB123CD"
          value={vehiculo.patente}
          onChange={(e) =>
            setVehiculo((v) => ({
              ...v,
              patente: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
            }))
          }
        />
        {errores.patente && <p className="error">{errores.patente}</p>}

        <label htmlFor="anio">Año:</label>
        <input
          type="number"
          id="anio"
          min={1950}
          max={anioMaximo}
          value={vehiculo.anio}
          onChange={(e) => setVehiculo((v) => ({ ...v, anio: e.target.value }))}
        />
        {errores.anio && <p className="error">{errores.anio}</p>}

        <label htmlFor="capacidadCarga">Capacidad de carga (kg):</label>
        <input
          type="number"
          id="capacidadCarga"
          min={0}
          step="0.01"
          value={vehiculo.capacidadCarga}
          onChange={(e) =>
            setVehiculo((v) => ({ ...v, capacidadCarga: e.target.value }))
          }
        />
        {errores.capacidadCarga && (
          <p className="error">{errores.capacidadCarga}</p>
        )}

        {errorApi && <p className="error">{errorApi}</p>}

        <div>
          <button type="submit">{id ? "Guardar cambios" : "Crear"}</button>{" "}
          <Link to="/vehiculos">
            <button type="button">Volver</button>
          </Link>
        </div>
      </form>
    </>
  );
}
