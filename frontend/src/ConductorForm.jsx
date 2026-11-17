import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "./Auth";
import { mensajeDeError } from "./formato";

// Formulario de alta (/conductores/crear) y modificacion (/conductores/:id/modificar)
export function ConductorForm() {
  const { id } = useParams();
  const [conductor, setConductor] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    numeroLicencia: "",
    fechaAltaLicencia: "",
    fechaVencimientoLicencia: "",
  });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  // Si es modificacion, cargo los datos del conductor
  const obtenerConductor = useCallback(async () => {
    if (!id) {
      return;
    }

    const response = await fetchAuth(
      `http://localhost:3000/conductores/${id}`,
    );

    if (!response.ok) {
      setErrorApi(await mensajeDeError(response));
      return;
    }

    const conductor = await response.json();

    setConductor({
      nombre: conductor.nombre,
      apellido: conductor.apellido,
      dni: conductor.dni,
      numeroLicencia: conductor.numeroLicencia,
      fechaAltaLicencia: conductor.fechaAltaLicencia,
      fechaVencimientoLicencia: conductor.fechaVencimientoLicencia,
    });
  }, [id, fetchAuth]);

  useEffect(() => {
    obtenerConductor();
  }, [obtenerConductor]);

  // Validaciones del formulario (las mismas reglas que el backend)
  const validar = () => {
    const nuevosErrores = {};
    const {
      nombre,
      apellido,
      dni,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    } = conductor;
    const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{1,50}$/;

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (!soloLetras.test(nombre.trim())) {
      nuevosErrores.nombre = "Solo letras, hasta 50 caracteres";
    }

    if (!apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio";
    } else if (!soloLetras.test(apellido.trim())) {
      nuevosErrores.apellido = "Solo letras, hasta 50 caracteres";
    }

    if (!/^\d{7,8}$/.test(dni)) {
      nuevosErrores.dni = "El DNI debe tener 7 u 8 números";
    }

    if (!numeroLicencia.trim()) {
      nuevosErrores.numeroLicencia = "El número de licencia es obligatorio";
    } else if (!/^[A-Za-z0-9]{1,20}$/.test(numeroLicencia.trim())) {
      nuevosErrores.numeroLicencia = "Solo letras y números, hasta 20";
    }

    if (!fechaAltaLicencia) {
      nuevosErrores.fechaAltaLicencia = "La fecha de alta es obligatoria";
    }

    if (!fechaVencimientoLicencia) {
      nuevosErrores.fechaVencimientoLicencia =
        "La fecha de vencimiento es obligatoria";
    } else if (
      fechaAltaLicencia &&
      fechaVencimientoLicencia <= fechaAltaLicencia
    ) {
      nuevosErrores.fechaVencimientoLicencia =
        "Debe ser posterior a la fecha de alta";
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
      ? `http://localhost:3000/conductores/${id}`
      : "http://localhost:3000/conductores";

    const response = await fetchAuth(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...conductor,
        nombre: conductor.nombre.trim(),
        apellido: conductor.apellido.trim(),
        numeroLicencia: conductor.numeroLicencia.trim(),
      }),
    });

    if (!response.ok) {
      setErrorApi(await mensajeDeError(response));
      return;
    }

    navigate("/conductores");
  };

  return (
    <>
      <h2>{id ? "Modificar conductor" : "Nuevo conductor"}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="nombre">Nombre:</label>
        <input
          type="text"
          id="nombre"
          value={conductor.nombre}
          onChange={(e) =>
            setConductor((c) => ({ ...c, nombre: e.target.value }))
          }
        />
        {errores.nombre && <p className="error">{errores.nombre}</p>}

        <label htmlFor="apellido">Apellido:</label>
        <input
          type="text"
          id="apellido"
          value={conductor.apellido}
          onChange={(e) =>
            setConductor((c) => ({ ...c, apellido: e.target.value }))
          }
        />
        {errores.apellido && <p className="error">{errores.apellido}</p>}

        <label htmlFor="dni">Número de documento:</label>
        <input
          type="text"
          id="dni"
          inputMode="numeric"
          maxLength={8}
          value={conductor.dni}
          onChange={(e) =>
            setConductor((c) => ({
              ...c,
              dni: e.target.value.replace(/\D/g, ""),
            }))
          }
        />
        {errores.dni && <p className="error">{errores.dni}</p>}

        <label htmlFor="numeroLicencia">Número de licencia:</label>
        <input
          type="text"
          id="numeroLicencia"
          maxLength={20}
          value={conductor.numeroLicencia}
          onChange={(e) =>
            setConductor((c) => ({ ...c, numeroLicencia: e.target.value }))
          }
        />
        {errores.numeroLicencia && (
          <p className="error">{errores.numeroLicencia}</p>
        )}

        <label htmlFor="fechaAltaLicencia">Fecha de alta de licencia:</label>
        <input
          type="date"
          id="fechaAltaLicencia"
          value={conductor.fechaAltaLicencia}
          onChange={(e) =>
            setConductor((c) => ({ ...c, fechaAltaLicencia: e.target.value }))
          }
        />
        {errores.fechaAltaLicencia && (
          <p className="error">{errores.fechaAltaLicencia}</p>
        )}

        <label htmlFor="fechaVencimientoLicencia">
          Fecha de vencimiento de licencia:
        </label>
        <input
          type="date"
          id="fechaVencimientoLicencia"
          value={conductor.fechaVencimientoLicencia}
          onChange={(e) =>
            setConductor((c) => ({
              ...c,
              fechaVencimientoLicencia: e.target.value,
            }))
          }
        />
        {errores.fechaVencimientoLicencia && (
          <p className="error">{errores.fechaVencimientoLicencia}</p>
        )}

        {errorApi && <p className="error">{errorApi}</p>}

        <div>
          <button type="submit">{id ? "Guardar cambios" : "Crear"}</button>{" "}
          <Link to="/conductores">
            <button type="button">Volver</button>
          </Link>
        </div>
      </form>
    </>
  );
}
