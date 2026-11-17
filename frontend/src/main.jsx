import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { AuthProvider } from "./Auth";
import { AuthLayout } from "./AuthLayout";
import { Layout } from "./Layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { Registro } from "./Registro";
import { Vehiculos } from "./Vehiculos";
import { VehiculoDetalles } from "./VehiculoDetalles";
import { VehiculoForm } from "./VehiculoForm";
import { Conductores } from "./Conductores";
import { ConductorDetalles } from "./ConductorDetalles";
import { ConductorForm } from "./ConductorForm";
import { Viajes } from "./Viajes";
import { ViajeForm } from "./ViajeForm";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />

            <Route path="vehiculos" element={<AuthLayout />}>
              <Route index element={<Vehiculos />} />
              <Route path="crear" element={<VehiculoForm />} />
              <Route path=":id" element={<VehiculoDetalles />} />
              <Route path=":id/modificar" element={<VehiculoForm />} />
            </Route>

            <Route path="conductores" element={<AuthLayout />}>
              <Route index element={<Conductores />} />
              <Route path="crear" element={<ConductorForm />} />
              <Route path=":id" element={<ConductorDetalles />} />
              <Route path=":id/modificar" element={<ConductorForm />} />
            </Route>

            <Route path="viajes" element={<AuthLayout />}>
              <Route index element={<Viajes />} />
              <Route path="crear" element={<ViajeForm />} />
              <Route path=":id/modificar" element={<ViajeForm />} />
            </Route>

            <Route path="*" element={<p>Página no encontrada</p>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
