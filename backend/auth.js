import express from "express";
import { db } from "./db.js";
import {
  validarLogin,
  validarUsuario,
  verificarValidaciones,
} from "./validaciones.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
  // Opciones de configuracion de passport-jwt
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  // Creo estrategia jwt
  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      // Si llegamos a este punto es porque el token es valido
      // Si hace falta realizar algun paso extra antes de llamar al handler de la API
      next(null, payload);
    }),
  );
}

// Registro de usuario
router.post(
  "/registro",
  validarUsuario,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body;

    // Verificar que el email no este registrado
    const [usuarios] = await db.execute(
      "SELECT id FROM usuarios WHERE email=?",
      [email],
    );

    if (usuarios.length > 0) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // Creamos Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?,?,?)",
      [nombre, email, hashedPassword],
    );

    // Nunca se devuelve la contraseña
    res.status(201).json({ id: result.insertId, nombre, email });
  },
);

// Inicio de sesion
router.post("/login", validarLogin, verificarValidaciones, async (req, res) => {
  const { email, password } = req.body;

  // Consultar por el usuario a la base de datos
  const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE email=?", [
    email,
  ]);

  if (usuarios.length === 0) {
    return res.status(401).json({ mensaje: "Email o contraseña incorrectos" });
  }

  // Verificar la contraseña
  const hashedPassword = usuarios[0].password;

  const passwordComparada = await bcrypt.compare(password, hashedPassword);

  if (!passwordComparada) {
    return res.status(401).json({ mensaje: "Email o contraseña incorrectos" });
  }

  // Generar jwt (expira a las 4 horas)
  const payload = { userId: usuarios[0].id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });

  // Devolver token y datos del usuario
  res.json({
    token,
    nombre: usuarios[0].nombre,
    email: usuarios[0].email,
  });
});

export default router;
