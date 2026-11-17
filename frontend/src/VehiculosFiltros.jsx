export function VehiculosFiltros({ filtros, onChange }) {
  return (
    <div className="filtros">
      <div>
        <label htmlFor="filtroMarca">Marca:</label>
        <input
          type="text"
          id="filtroMarca"
          value={filtros.marca}
          onChange={(e) => onChange((f) => ({ ...f, marca: e.target.value }))}
        />
      </div>
      <div>
        <label htmlFor="filtroPatente">Patente:</label>
        <input
          type="text"
          id="filtroPatente"
          value={filtros.patente}
          onChange={(e) =>
            onChange((f) => ({
              ...f,
              patente: e.target.value.replace(/[^A-Za-z0-9]/g, ""),
            }))
          }
        />
      </div>
    </div>
  );
}
