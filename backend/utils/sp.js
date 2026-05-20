const db = require('../db');
const { normalizeArgs, validateArgsAgainstParams } = require('./validation');

const paramCache = new Map();

async function getProcParams(procName) {
  if (paramCache.has(procName)) return paramCache.get(procName);
  const schema = db?.config?.connectionConfig?.database || process.env.DB_NAME || 'webreto';
  const [rows] = await db.query(
    `SELECT PARAMETER_NAME, PARAMETER_MODE, DATA_TYPE, DTD_IDENTIFIER,
            CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
     FROM INFORMATION_SCHEMA.PARAMETERS
     WHERE SPECIFIC_SCHEMA = ? AND SPECIFIC_NAME = ?
     ORDER BY ORDINAL_POSITION`,
    [schema, procName]
  );

  const inParams = (rows || []).filter((row) => String(row.PARAMETER_MODE || 'IN').toUpperCase() !== 'OUT');
  paramCache.set(procName, inParams);
  return inParams;
}

async function callSP(procName, args = [], hasOutParam = false) {
  const normArgs = normalizeArgs(args);
  const params = await getProcParams(procName);
  if (params.length) {
    validateArgsAgainstParams(normArgs, params);
  }
  
  if (!hasOutParam) {
    // Para SP sin OUT params (comportamiento original)
    const placeholders = normArgs.length ? normArgs.map(() => '?').join(', ') : '';
    const sql = `CALL ${procName}(${placeholders})`;
    const [results] = await db.query(sql, normArgs);
    return Array.isArray(results) && Array.isArray(results[0]) ? results[0] : results;    
  } else {
    // Para SP con OUT params
    const placeholders = normArgs.map(() => '?').join(', ');
    const sql = `CALL ${procName}(${placeholders}, @out_param)`;
    await db.query(sql, normArgs);
    const [outResult] = await db.query('SELECT @out_param AS out_value');
    return outResult;
  }
}

module.exports = { callSP };