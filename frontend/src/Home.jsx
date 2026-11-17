import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Home() {
  const { isAuthenticated, nombre } = useAuth();

  return (
    <>
      <h1>Gestión de transporte</h1>
      <p className="centrado">
        Registro de vehículos, conductores y viajes de la empresa.
      </p>

      {isAuthenticated ? (
        <>
          <h2>Bienvenido/a, {nombre}</h2>
          <div className="tarjetas">
            <Link to="/vehiculos" className="tarjeta">
              <h3>Vehículos</h3>
              <p>Alta, modificación y baja de vehículos.</p>
            </Link>
            <Link to="/conductores" className="tarjeta">
              <h3>Conductores</h3>
              <p>Alta, modificación y baja de conductores.</p>
            </Link>
            <Link to="/viajes" className="tarjeta">
              <h3>Viajes</h3>
              <p>Registro e historial de viajes con total de kilómetros.</p>
            </Link>
          </div>
        </>
      ) : (
        <div className="centrado">
          <p>Para operar con el sistema debe iniciar sesión.</p>
          <Link to="/login">
            <button>Ingresar</button>
          </Link>{" "}
          <Link to="/registro">
            <button>Registrarse</button>
          </Link>
        </div>
      )}
    </>
  );
}
