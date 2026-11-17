import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { mensajeDeError } from "./formato";

export function Registro() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmacion: "",
  });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [registrado, setRegistrado] = useState(false);
  const navigate = useNavigate();

  // Validaciones del formulario (las mismas reglas que el backend)
  const validar = () => {
    const nuevosErrores = {};
    if (!usuario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{1,50}$/.test(usuario.nombre.trim())) {
      nuevosErrores.nombre = "Solo letras, hasta 50 caracteres";
    }
    if (!usuario.email.trim()) {
      nuevosErrores.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email.trim())) {
      nuevosErrores.email = "Email inválido";
    }
    if (
      usuario.password.length < 8 ||
      !/[a-z]/.test(usuario.password) ||
      !/\d/.test(usuario.password)
    ) {
      nuevosErrores.password =
        "Mínimo 8 caracteres, con al menos una minúscula y un número";
    } else if (usuario.password.length > 50) {
      nuevosErrores.password = "Máximo 50 caracteres";
    }
    if (usuario.confirmacion !== usuario.password) {
      nuevosErrores.confirmacion = "Las contraseñas no coinciden";
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

    try {
      const response = await fetch("http://localhost:3000/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: usuario.nombre.trim(),
          email: usuario.email.trim(),
          password: usuario.password,
        }),
      });

      if (!response.ok) {
        setErrorApi(await mensajeDeError(response));
        return;
      }

      setRegistrado(true);
    } catch {
      setErrorApi("No se pudo conectar con el servidor");
    }
  };

  if (registrado) {
    return (
      <>
        <h2>Registro exitoso</h2>
        <p className="centrado">Ya puede iniciar sesión con su cuenta.</p>
        <div className="centrado">
          <button onClick={() => navigate("/login")}>Ingresar</button>
        </div>
      </>
    );
  }

  return (
    <>
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="nombre">Nombre:</label>
        <input
          id="nombre"
          value={usuario.nombre}
          onChange={(e) => setUsuario((u) => ({ ...u, nombre: e.target.value }))}
        />
        {errores.nombre && <p className="error">{errores.nombre}</p>}

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={usuario.email}
          onChange={(e) => setUsuario((u) => ({ ...u, email: e.target.value }))}
        />
        {errores.email && <p className="error">{errores.email}</p>}

        <label htmlFor="password">Contraseña:</label>
        <input
          id="password"
          type="password"
          value={usuario.password}
          onChange={(e) =>
            setUsuario((u) => ({ ...u, password: e.target.value }))
          }
        />
        {errores.password && <p className="error">{errores.password}</p>}

        <label htmlFor="confirmacion">Repetir contraseña:</label>
        <input
          id="confirmacion"
          type="password"
          value={usuario.confirmacion}
          onChange={(e) =>
            setUsuario((u) => ({ ...u, confirmacion: e.target.value }))
          }
        />
        {errores.confirmacion && (
          <p className="error">{errores.confirmacion}</p>
        )}

        {errorApi && <p className="error">{errorApi}</p>}

        <div>
          <button type="submit">Registrarse</button>{" "}
          <Link to="/login">
            <button type="button">Ya tengo cuenta</button>
          </Link>
        </div>
      </form>
    </>
  );
}
