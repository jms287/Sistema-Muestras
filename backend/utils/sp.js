const db = require('../db');

async function callSP(procName, args = [], hasOutParam = false) {
  const normArgs = (Array.isArray(args) ? args : []).map(v => v === undefined ? null : v);
  
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