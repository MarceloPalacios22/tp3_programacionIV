import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarConductor,
  validarFiltrosConductores,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";
import { sqlViajes } from "./viajes.js";

const router = express.Router();

const sqlConductores =
  "SELECT id, nombre, apellido, dni, numero_licencia AS numeroLicencia, " +
  "fecha_alta_licencia AS fechaAltaLicencia, " +
  "fecha_vencimiento_licencia AS fechaVencimientoLicencia " +
  "FROM conductores";

// GET para entregar listado de conductores
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosConductores,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { apellido, dni } = req.query;

    if (apellido) {
      filtros.push("apellido LIKE ?");
      parametros.push(`%${apellido}%`);
    }

    if (dni) {
      filtros.push("dni LIKE ?");
      parametros.push(`%${dni}%`);
    }

    let sql = sqlConductores;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY apellido, nombre";

    const [conductores] = await db.execute(sql, parametros);
    res.json(conductores);
  },
);

// GET para entregar detalle de conductor
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    const [conductores] = await db.execute(sqlConductores + " WHERE id=?", [
      id,
    ]);

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.json(conductores[0]);
  },
);

// POST para crear conductor
router.post(
  "/",
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo body
    const {
      nombre,
      apellido,
      dni,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    } = req.body;

    // Verificar que el DNI y la licencia no esten registrados
    const [existentes] = await db.execute(
      "SELECT id FROM conductores WHERE dni=? OR numero_licencia=?",
      [dni, numeroLicencia],
    );
    if (existentes.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe un conductor con ese DNI o número de licencia",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO conductores (nombre, apellido, dni, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) " +
        "VALUES (?,?,?,?,?,?)",
      [
        nombre,
        apellido,
        dni,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      dni,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    });
  },
);

// PUT para modificar conductor
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      nombre,
      apellido,
      dni,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    } = req.body;

    // Verificar que este presente el conductor
    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id=?",
      [id],
    );
    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    // Verificar que el DNI y la licencia no los tenga otro conductor
    const [existentes] = await db.execute(
      "SELECT id FROM conductores WHERE (dni=? OR numero_licencia=?) AND id<>?",
      [dni, numeroLicencia, id],
    );
    if (existentes.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe otro conductor con ese DNI o número de licencia",
      });
    }

    await db.execute(
      "UPDATE conductores SET nombre=?, apellido=?, dni=?, numero_licencia=?, " +
        "fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?",
      [
        nombre,
        apellido,
        dni,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
        id,
      ],
    );

    res.json({
      id,
      nombre,
      apellido,
      dni,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    });
  },
);

// DELETE para quitar conductor
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    // No se puede eliminar si tiene viajes registrados
    const [viajes] = await db.execute(
      "SELECT id FROM viajes WHERE conductor_id=? LIMIT 1",
      [id],
    );
    if (viajes.length > 0) {
      return res.status(400).json({
        mensaje:
          "No se puede eliminar el conductor porque tiene viajes registrados",
      });
    }

    const [result] = await db.execute("DELETE FROM conductores WHERE id=?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.json({ id });
  },
);

// GET para entregar historial de viajes de un conductor
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id=?",
      [id],
    );
    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    const [viajes] = await db.execute(
      sqlViajes + " WHERE vj.conductor_id = ? ORDER BY vj.fecha_salida DESC",
      [id],
    );

    res.json(viajes);
  },
);

// GET para entregar el total de kilometros recorridos por un conductor
router.get(
  "/:id/kilometros",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id=?",
      [id],
    );
    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    const [totales] = await db.execute(
      "SELECT COUNT(*) AS cantidadViajes, COALESCE(SUM(kilometros), 0) AS totalKilometros " +
        "FROM viajes WHERE conductor_id = ?",
      [id],
    );

    res.json({ conductorId: id, ...totales[0] });
  },
);

export default router;
