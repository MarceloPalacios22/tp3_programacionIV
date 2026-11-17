import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosVehiculos,
  validarId,
  validarVehiculo,
  verificarValidaciones,
} from "./validaciones.js";
import { sqlViajes } from "./viajes.js";

const router = express.Router();

const sqlVehiculos =
  "SELECT id, marca, modelo, patente, anio, capacidad_carga AS capacidadCarga " +
  "FROM vehiculos";

// GET para entregar listado de vehiculos
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosVehiculos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { marca, patente } = req.query;

    if (marca) {
      filtros.push("marca LIKE ?");
      parametros.push(`%${marca}%`);
    }

    if (patente) {
      filtros.push("patente LIKE ?");
      parametros.push(`%${patente}%`);
    }

    let sql = sqlVehiculos;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY marca, modelo";

    const [vehiculos] = await db.execute(sql, parametros);
    res.json(vehiculos);
  },
);

// GET para entregar detalle de vehiculo
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(sqlVehiculos + " WHERE id=?", [id]);

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.json(vehiculos[0]);
  },
);

// POST para crear vehiculo
router.post(
  "/",
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo body
    const { marca, modelo, patente, anio, capacidadCarga } = req.body;

    // Verificar que la patente no este registrada
    const [existentes] = await db.execute(
      "SELECT id FROM vehiculos WHERE patente=?",
      [patente],
    );
    if (existentes.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un vehículo con esa patente" });
    }

    const [result] = await db.execute(
      "INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)",
      [marca, modelo, patente, anio, capacidadCarga],
    );

    res.status(201).json({
      id: result.insertId,
      marca,
      modelo,
      patente,
      anio,
      capacidadCarga,
    });
  },
);

// PUT para modificar vehiculo
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { marca, modelo, patente, anio, capacidadCarga } = req.body;

    // Verificar que este presente el vehiculo
    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id=?",
      [id],
    );
    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    // Verificar que la patente no la tenga otro vehiculo
    const [existentes] = await db.execute(
      "SELECT id FROM vehiculos WHERE patente=? AND id<>?",
      [patente, id],
    );
    if (existentes.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe otro vehículo con esa patente" });
    }

    await db.execute(
      "UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?",
      [marca, modelo, patente, anio, capacidadCarga, id],
    );

    res.json({ id, marca, modelo, patente, anio, capacidadCarga });
  },
);

// DELETE para quitar vehiculo
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    // No se puede eliminar si tiene viajes registrados
    const [viajes] = await db.execute(
      "SELECT id FROM viajes WHERE vehiculo_id=? LIMIT 1",
      [id],
    );
    if (viajes.length > 0) {
      return res.status(400).json({
        mensaje:
          "No se puede eliminar el vehículo porque tiene viajes registrados",
      });
    }

    const [result] = await db.execute("DELETE FROM vehiculos WHERE id=?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.json({ id });
  },
);

// GET para entregar historial de viajes de un vehiculo
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id=?",
      [id],
    );
    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    const [viajes] = await db.execute(
      sqlViajes + " WHERE vj.vehiculo_id = ? ORDER BY vj.fecha_salida DESC",
      [id],
    );

    res.json(viajes);
  },
);

// GET para entregar el total de kilometros recorridos por un vehiculo
router.get(
  "/:id/kilometros",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id=?",
      [id],
    );
    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    const [totales] = await db.execute(
      "SELECT COUNT(*) AS cantidadViajes, COALESCE(SUM(kilometros), 0) AS totalKilometros " +
        "FROM viajes WHERE vehiculo_id = ?",
      [id],
    );

    res.json({ vehiculoId: id, ...totales[0] });
  },
);

export default router;
