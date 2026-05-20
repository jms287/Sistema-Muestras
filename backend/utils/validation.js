const MAX_STRING_LENGTH = Number(process.env.MAX_STRING_LENGTH) || 4000;

const ASCII_REGEX = /^[\x00-\x7F]*$/;
const CRLF_REGEX = /[\r\n]/;
const NULL_BYTE_REGEX = /\x00/;
const PATH_TRAVERSAL_REGEX = /(\.\.\/|\.\.\\)/;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

function canonicalizeString(value) {
  if (typeof value !== 'string') return value;
  return value.normalize('NFC');
}

function assertAscii(value, context) {
  if (value == null) return;
  const val = Array.isArray(value) ? value.join(',') : String(value);
  if (!ASCII_REGEX.test(val)) {
    throw new ValidationError(`Encabezado no ASCII en ${context}`);
  }
  if (CRLF_REGEX.test(val)) {
    throw new ValidationError(`Encabezado con salto de linea en ${context}`);
  }
}

function validateStringBasics(value, context) {
  const val = canonicalizeString(String(value));
  if (val.length > MAX_STRING_LENGTH) {
    throw new ValidationError(`Longitud de texto invalida en ${context}`);
  }
  if (NULL_BYTE_REGEX.test(val)) {
    throw new ValidationError(`Byte nulo en ${context}`);
  }
  if (CRLF_REGEX.test(val)) {
    throw new ValidationError(`Salto de linea no permitido en ${context}`);
  }
  return val;
}

function validatePathString(value, context) {
  const val = validateStringBasics(value, context);
  if (PATH_TRAVERSAL_REGEX.test(val)) {
    throw new ValidationError(`Secuencia de ruta invalida en ${context}`);
  }
  return val;
}

function validateIdentifier(value, context) {
  const val = validateStringBasics(value, context);
  if (!/^[A-Za-z0-9_]+$/.test(val)) {
    throw new ValidationError(`Identificador invalido en ${context}`);
  }
  return val;
}

function validateInteger(value, context, { min, max } = {}) {
  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new ValidationError(`Se esperaba entero en ${context}`);
  }
  if (min != null && num < min) {
    throw new ValidationError(`Entero fuera de rango en ${context}`);
  }
  if (max != null && num > max) {
    throw new ValidationError(`Entero fuera de rango en ${context}`);
  }
  return num;
}

function validateNumber(value, context, { min, max } = {}) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new ValidationError(`Se esperaba numero en ${context}`);
  }
  if (min != null && num < min) {
    throw new ValidationError(`Numero fuera de rango en ${context}`);
  }
  if (max != null && num > max) {
    throw new ValidationError(`Numero fuera de rango en ${context}`);
  }
  return num;
}

function validateDateString(value, context) {
  const val = validateStringBasics(value, context);
  const ts = Date.parse(val);
  if (Number.isNaN(ts)) {
    throw new ValidationError(`Fecha invalida en ${context}`);
  }
  return val;
}

function scanValue(value, context) {
  if (value == null) return;
  if (typeof value === 'string') {
    validateStringBasics(value, context);
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanValue(item, `${context}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, val]) => {
      validateIdentifier(key, `${context}.key`);
      scanValue(val, `${context}.${key}`);
    });
  }
}

function requestInputValidation(req, res, next) {
  try {
    Object.entries(req.headers).forEach(([key, value]) => {
      assertAscii(key, 'header name');
      assertAscii(value, `header ${key}`);
    });

    const originalUrl = req.originalUrl || '';
    validatePathString(originalUrl, 'url');

    let decodedUrl = originalUrl;
    try {
      decodedUrl = decodeURIComponent(originalUrl);
    } catch (err) {
      throw new ValidationError('URL con codificacion invalida');
    }
    validatePathString(decodedUrl, 'url decoded');

    if (req.params) scanValue(req.params, 'params');
    if (req.query) scanValue(req.query, 'query');
    if (req.body) scanValue(req.body, 'body');

    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = (name, value) => {
      assertAscii(name, 'response header name');
      assertAscii(value, `response header ${name}`);
      return originalSetHeader(name, value);
    };

    next();
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
}

function getIntegerRange(dataType, isUnsigned) {
  switch (dataType) {
    case 'tinyint':
      return isUnsigned ? { min: 0, max: 255 } : { min: -128, max: 127 };
    case 'smallint':
      return isUnsigned ? { min: 0, max: 65535 } : { min: -32768, max: 32767 };
    case 'mediumint':
      return isUnsigned ? { min: 0, max: 16777215 } : { min: -8388608, max: 8388607 };
    case 'int':
    case 'integer':
      return isUnsigned ? { min: 0, max: 4294967295 } : { min: -2147483648, max: 2147483647 };
    case 'bigint':
      return isUnsigned
        ? { min: 0, max: Number.MAX_SAFE_INTEGER }
        : { min: -Number.MAX_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER };
    default:
      return null;
  }
}

function validateArgsAgainstParams(args, params) {
  if (!Array.isArray(args)) {
    throw new ValidationError('Args debe ser un arreglo');
  }

  if (params.length !== args.length) {
    throw new ValidationError(`Cantidad de argumentos invalida: esperado ${params.length}, recibido ${args.length}`);
  }

  params.forEach((param, index) => {
    const value = args[index];
    if (value == null) return;

    const dataType = String(param.DATA_TYPE || '').toLowerCase();
    const dtd = String(param.DTD_IDENTIFIER || '').toLowerCase();
    const isUnsigned = dtd.includes('unsigned');
    const context = param.PARAMETER_NAME || `arg${index + 1}`;

    if (['char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext', 'enum', 'set'].includes(dataType)) {
      const val = validateStringBasics(value, context);
      const maxLength = param.CHARACTER_MAXIMUM_LENGTH;
      if (maxLength && val.length > Number(maxLength)) {
        throw new ValidationError(`Longitud excedida en ${context}`);
      }
      return;
    }

    if (['date', 'datetime', 'timestamp', 'time', 'year'].includes(dataType)) {
      validateDateString(value, context);
      return;
    }

    if (['bit', 'bool', 'boolean'].includes(dataType)) {
      if (typeof value === 'boolean') return;
      validateInteger(value, context, { min: 0, max: 1 });
      return;
    }

    if (['decimal', 'numeric', 'float', 'double', 'real'].includes(dataType)) {
      validateNumber(value, context);
      return;
    }

    if (['tinyint', 'smallint', 'mediumint', 'int', 'integer', 'bigint'].includes(dataType)) {
      const range = getIntegerRange(dataType, isUnsigned);
      validateInteger(value, context, range || undefined);
      return;
    }

    validateStringBasics(value, context);
  });
}

function normalizeArgs(args) {
  if (!Array.isArray(args)) return [];
  return args.map((val) => {
    if (val === undefined) return null;
    if (typeof val === 'string') return canonicalizeString(val);
    return val;
  });
}

module.exports = {
  ValidationError,
  requestInputValidation,
  validateArgsAgainstParams,
  normalizeArgs,
  validateIdentifier,
  validateInteger,
  validateNumber,
  validateDateString,
  validateStringBasics,
  validatePathString,
  scanValue,
};
