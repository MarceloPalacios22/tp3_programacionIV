export function ConductoresFiltros({ filtros, onChange }) {
  return (
    <div className="filtros">
      <div>
        <label htmlFor="filtroApellido">Apellido:</label>
        <input
          type="text"
          id="filtroApellido"
          value={filtros.apellido}
          onChange={(e) =>
            onChange((f) => ({
              ...f,
              apellido: e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, ""),
            }))
          }
        />
      </div>
      <div>
        <label htmlFor="filtroDni">DNI:</label>
        <input
          type="text"
          id="filtroDni"
          inputMode="numeric"
          value={filtros.dni}
          onChange={(e) =>
            onChange((f) => ({ ...f, dni: e.target.value.replace(/\D/g, "") }))
          }
        />
      </div>
    </div>
  );
}
