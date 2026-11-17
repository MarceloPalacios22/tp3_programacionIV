// Funciones auxiliares de formato

// "2026-10-05" -> "05/10/2026"
export function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

// 1150.5 -> "1.150,5 km"
export function formatearKm(km) {
  return `${Number(km).toLocaleString("es-AR")} km`;
}

// Fecha de hoy en formato "YYYY-MM-DD"
export function hoy() {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().slice(0, 10);
}

// Convierte la respuesta de error de la API en un texto
export async function mensajeDeError(response) {
  try {
    const err = await response.json();
    if (err.errores) {
      return err.errores.map((e) => e.msg).join(". ");
    }
    return err.mensaje ?? `Error ${response.status}`;
  } catch {
    return `Error ${response.status}`;
  }
}
