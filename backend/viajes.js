import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosViajes,
  validarId,
  validarViaje,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Consulta base de viajes con datos del vehiculo y del conductor
// (se reutiliza en vehiculos.js y conductores.js)
export const sqlViajes =
  "SELECT vj.id, vj.vehiculo_id AS vehiculoId, v.patente, " +
  "CONCAT(v.marca, ' ', v.modelo) AS vehiculo, " +
  "vj.conductor_id AS conductorId, " +
  "CONCAT(c.apellido, ', ', c.nombre) AS conductor, " +
  "vj.fecha_salida AS fechaSalida, vj.fecha_llegada AS fechaLlegada, " +
  "vj.origen, vj.destino, vj.kilometros, vj.observaciones " +
  "FROM viajes vj " +
  "JOIN vehiculos v ON vj.vehiculo_id = v.id " +
  "JOIN conductores c ON vj.conductor_id = c.id";

// Verifica que existan el vehiculo y el conductor del viaje,
// y que la licencia del conductor este vigente en la fecha de salida
async function verificarViaje(viaje) {
  const { vehiculoId, conductorId, fechaSalida } = viaje;

  const [vehiculos] = await db.execute("SELECT id FROM vehiculos WHERE id=?", [
    vehiculoId,
  ]);
  if (vehiculos.length === 0) {
    return "El vehículo indicado no existe";
  }

  const [conductores] = await db.execute(
    "SELECT fecha_alta_licencia AS fechaAlta, fecha_vencimiento_licencia AS fechaVencimiento " +
      "FROM conductores WHERE id=?",
    [conductorId],
  );
  if (conductores.length === 0) {
    return "El conductor indicado no existe";
  }

  const { fechaAlta, fechaVencimiento } = conductores[0];
  if (fechaSalida < fechaAlta || fechaSalida > fechaVencimiento) {
    return "La licencia del conductor no está vigente en la fecha de salida";
  }

  return null;
}

// GET para entregar listado de viajes (filtrable por vehiculo y/o conductor)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { vehiculoId, conductorId } = req.query;

    if (vehiculoId !== undefined) {
      filtros.push("vj.vehiculo_id = ?");
      parametros.push(Number(vehiculoId));
    }

    if (conductorId !== undefined) {
      filtros.push("vj.conductor_id = ?");
      parametros.push(Number(conductorId));
    }

    let sql = sqlViajes;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY vj.fecha_salida DESC, vj.id DESC";

    const [viajes] = await db.execute(sql, parametros);
    res.json(viajes);
  },
);

// GET para entregar detalle de viaje
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    const [viajes] = await db.execute(sqlViajes + " WHERE vj.id = ?", [id]);

    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    res.json(viajes[0]);
  },
);

// POST para registrar viaje
router.post(
  "/",
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo body
    const {
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    const error = await verificarViaje(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error });
    }

    const [result] = await db.execute(
      "INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) " +
        "VALUES (?,?,?,?,?,?,?,?)",
      [
        vehiculoId,
        conductorId,
        fechaSalida,
        fechaLlegada,
        origen,
        destino,
        kilometros,
        observaciones || null,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones: observaciones || null,
    });
  },
);

// PUT para modificar viaje
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    // Verificar que este presente el viaje
    const [viajes] = await db.execute("SELECT id FROM viajes WHERE id=?", [id]);
    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    const error = await verificarViaje(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error });
    }

    await db.execute(
      "UPDATE viajes SET vehiculo_id=?, conductor_id=?, fecha_salida=?, fecha_llegada=?, " +
        "origen=?, destino=?, kilometros=?, observaciones=? WHERE id=?",
      [
        vehiculoId,
        conductorId,
        fechaSalida,
        fechaLlegada,
        origen,
        destino,
        kilometros,
        observaciones || null,
        id,
      ],
    );

    res.json({
      id,
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones: observaciones || null,
    });
  },
);

// DELETE para quitar viaje
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM viajes WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    res.json({ id });
  },
);

export default router;
