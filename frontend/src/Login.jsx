import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Login() {
  const { error, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  // Validaciones del formulario
  const validar = () => {
    const nuevosErrores = {};
    if (!email.trim()) {
      nuevosErrores.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nuevosErrores.email = "Email inválido";
    }
    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) {
      return;
    }
    const res = await login(email.trim(), password);
    if (res.success) {
      navigate("/");
    }
  };

  return (
    <>
      <h2>Ingresar</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errores.email && <p className="error">{errores.email}</p>}

        <label htmlFor="password">Contraseña:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errores.password && <p className="error">{errores.password}</p>}

        {error && <p className="error">{error}</p>}

        <div>
          <button type="submit">Ingresar</button>{" "}
          <Link to="/registro">
            <button type="button">Crear cuenta</button>
          </Link>
        </div>
      </form>
    </>
  );
}
