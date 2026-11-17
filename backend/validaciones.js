import { body, param, query, validationResult } from "express-validator";
import passport from "passport";

// Validacion de autenticacion
export const validarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un numero positivo mayor a 0");

// Validacion de usuario (registro)
export const validarUsuario = [
  body("nombre")
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede tener letras")
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre debe tener entre 1 y 50 caracteres"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email inválido")
    .isLength({ max: 100 })
    .withMessage("El email no puede superar los 100 caracteres")
    .toLowerCase(),
  body("password")
    .isStrongPassword({
      minLength: 8, // Minimo de 8 caracteres
      minLowercase: 1, // Al menos una letra en minusculas
      minUppercase: 0, // Letras mayusculas opcionales
      minNumbers: 1, // Al menos un número
      minSymbols: 0, // Símbolos opcionales
    })
    .withMessage(
      "La contraseña debe tener al menos 8 caracteres, una minúscula y un número",
    )
    .isLength({ max: 50 })
    .withMessage("La contraseña no puede superar los 50 caracteres"),
];

// Validacion de login
export const validarLogin = [
  body("email").trim().isEmail().withMessage("Email inválido").toLowerCase(),
  body("password")
    .isLength({ min: 1, max: 50 })
    .withMessage("La contraseña es obligatoria"),
];

// Validacion de filtros de vehiculos
export const validarFiltrosVehiculos = [
  query("marca").trim().isLength({ max: 50 }).optional(),
  query("patente").trim().isAlphanumeric().isLength({ max: 7 }).optional(),
];

// Validacion de vehiculo
export const validarVehiculo = [
  body("marca")
    .trim()
    .isAlpha("es-ES", { ignore: " -" })
    .withMessage("La marca solo puede tener letras")
    .isLength({ min: 1, max: 50 })
    .withMessage("La marca debe tener entre 1 y 50 caracteres"),
  body("modelo")
    .trim()
    .isAlphanumeric("es-ES", { ignore: " -." })
    .withMessage("El modelo solo puede tener letras y números")
    .isLength({ min: 1, max: 50 })
    .withMessage("El modelo debe tener entre 1 y 50 caracteres"),
  body("patente")
    .trim()
    .toUpperCase()
    .matches(/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/)
    .withMessage("La patente debe tener el formato ABC123 o AB123CD"),
  body("anio")
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage(
      `El año debe estar entre 1950 y ${new Date().getFullYear() + 1}`,
    ),
  body("capacidadCarga")
    .isFloat({ gt: 0, max: 100000 })
    .withMessage("La capacidad de carga (kg) debe ser un número mayor a 0"),
];

// Validacion de filtros de conductores
export const validarFiltrosConductores = [
  query("apellido").trim().isAlpha("es-ES", { ignore: " " }).optional(),
  query("dni").trim().isInt().optional(),
];

// Validacion de conductor
export const validarConductor = [
  body("nombre")
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede tener letras")
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre debe tener entre 1 y 50 caracteres"),
  body("apellido")
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El apellido solo puede tener letras")
    .isLength({ min: 1, max: 50 })
    .withMessage("El apellido debe tener entre 1 y 50 caracteres"),
  body("dni")
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage("El DNI debe tener 7 u 8 números"),
  body("numeroLicencia")
    .trim()
    .isAlphanumeric()
    .withMessage("El número de licencia solo puede tener letras y números")
    .isLength({ min: 1, max: 20 })
    .withMessage("El número de licencia debe tener entre 1 y 20 caracteres"),
  body("fechaAltaLicencia")
    .isISO8601({ strict: true })
    .withMessage("Fecha de alta de licencia inválida (YYYY-MM-DD)"),
  body("fechaVencimientoLicencia")
    .isISO8601({ strict: true })
    .withMessage("Fecha de vencimiento de licencia inválida (YYYY-MM-DD)")
    .custom((value, { req }) => value > req.body.fechaAltaLicencia)
    .withMessage(
      "La fecha de vencimiento debe ser posterior a la fecha de alta",
    ),
];

// Validacion de filtros de viajes
export const validarFiltrosViajes = [
  query("vehiculoId").isInt({ min: 1 }).optional(),
  query("conductorId").isInt({ min: 1 }).optional(),
];

// Validacion de viaje
export const validarViaje = [
  body("vehiculoId")
    .isInt({ min: 1 })
    .withMessage("vehiculoId debe ser un numero positivo mayor a 0"),
  body("conductorId")
    .isInt({ min: 1 })
    .withMessage("conductorId debe ser un numero positivo mayor a 0"),
  body("fechaSalida")
    .isISO8601({ strict: true })
    .withMessage("Fecha de salida inválida (YYYY-MM-DD)"),
  body("fechaLlegada")
    .isISO8601({ strict: true })
    .withMessage("Fecha de llegada inválida (YYYY-MM-DD)")
    .custom((value, { req }) => value >= req.body.fechaSalida)
    .withMessage(
      "La fecha de llegada no puede ser anterior a la fecha de salida",
    ),
  body("origen")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El origen debe tener entre 1 y 100 caracteres"),
  body("destino")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El destino debe tener entre 1 y 100 caracteres"),
  body("kilometros")
    .isFloat({ gt: 0, max: 100000 })
    .withMessage("Los kilómetros deben ser un número mayor a 0"),
  body("observaciones")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Las observaciones no pueden superar los 255 caracteres"),
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros no válidos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};
