import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de usuarios (sin contraseña)
router.get("/", validarAutenticacion, async (req, res) => {
  const [usuarios] = await db.execute("SELECT id, nombre, email FROM usuarios");
  res.json(usuarios);
});

// GET para entregar detalle de usuario (sin contraseña)
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [usuarios] = await db.execute(
      "SELECT id, nombre, email FROM usuarios WHERE id=?",
      [id],
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuarios[0]);
  },
);

// DELETE para eliminar la cuenta (solo la propia)
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    // Verificar que el usuario solo elimine su propia cuenta
    if (req.user.userId !== id) {
      return res
        .status(403)
        .json({ mensaje: "No tiene permiso para eliminar otro usuario" });
    }

    const [result] = await db.execute("DELETE FROM usuarios WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ id });
  },
);

export default router;
