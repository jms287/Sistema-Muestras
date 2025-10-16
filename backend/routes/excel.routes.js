const express = require('express');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const router = express.Router();

// Example route to test if the file is accessible
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Excel routes are working!' });
});

// Middleware simple para verificar autenticación (ajusta según tu sistema)
function requireAuth(req, res, next) {
  if (!req.user || !req.user.id_usuario) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  next();
}

// Selección de plantilla y edición automática según tipo de muestra
const plantillaConfig = {
  1: { 
    nombre: 'alimento.xlsx', 
    editar: (ws, datos) => { 
      // Celdas comunes
      ws.getCell('C13').value = datos.codigo_muestra || '-';
      ws.getCell('G13').value = datos.fecha_recepcion_muestra || '-';
      ws.getCell('I13').value = datos.fabricante || '-';
      ws.getCell('G14').value = datos.fecha_vencimiento_muestra || '-';
      ws.getCell('I14').value = datos.distribuidor || '-';
      ws.getCell('C15').value = datos.nombre_producto_muestra || '-';
      ws.getCell('G15').value = datos.fecha_creacion_muestra || '-';
      ws.getCell('I16').value = datos.laboratorio || '-';
      ws.getCell('G16').value = datos.fecha_actualizacion_muestra || '-';
      ws.getCell('B19').value = datos.color_muestra || '-';
      ws.getCell('F19').value = datos.aspecto_muestra || '-';
      ws.getCell('L19').value = datos.condicion_transp_muestra || '-';
      ws.getCell('B20').value = datos.olor_muestra || '-';
      ws.getCell('F20').value = datos.textura_muestra || '-';
      ws.getCell('L20').value = datos.condicion_almac_muestra || '-';
      ws.getCell('B21').value = datos.sabor_muestra || '-';
      ws.getCell('F21').value = datos.peso_neto_muestra || '-';
      ws.getCell('L21').value = datos.temperatura_muestra || '-';
      ws.getCell('L22').value = datos.fecha_reporte || '-';

      // Agregar resultados de pruebas
      datos.resultadosPrueba.forEach((resultado, index) => {
        ws.getCell(`B${index + 2}`).value = resultado.resultado_texto || resultado.resultado_numerico || '-';
      });
    } 
  },
  2: { 
    nombre: 'agua.xlsx', 
    editar: (ws, datos) => { 
      // Celdas comunes
      ws.getCell('C13').value = datos.codigo_muestra || '-';
      ws.getCell('G13').value = datos.fecha_recepcion_muestra || '-';
      ws.getCell('I13').value = datos.fabricante || '-';
      ws.getCell('G14').value = datos.fecha_vencimiento_muestra || '-';
      ws.getCell('I14').value = datos.distribuidor || '-';
      ws.getCell('C15').value = datos.nombre_producto_muestra || '-';
      ws.getCell('G15').value = datos.fecha_creacion_muestra || '-';
      ws.getCell('I16').value = datos.laboratorio || '-';
      ws.getCell('G16').value = datos.fecha_actualizacion_muestra || '-';
      ws.getCell('B19').value = datos.color_muestra || '-';
      ws.getCell('F19').value = datos.aspecto_muestra || '-';
      ws.getCell('L19').value = datos.condicion_transp_muestra || '-';
      ws.getCell('B20').value = datos.olor_muestra || '-';
      ws.getCell('F20').value = datos.textura_muestra || '-';
      ws.getCell('L20').value = datos.condicion_almac_muestra || '-';
      ws.getCell('B21').value = datos.sabor_muestra || '-';
      ws.getCell('F21').value = datos.peso_neto_muestra || '-';
      ws.getCell('L21').value = datos.temperatura_muestra || '-';
      ws.getCell('L22').value = datos.fecha_reporte || '-';

      // Agregar resultados de pruebas
      datos.resultadosPrueba.forEach((resultado, index) => {
        ws.getCell(`C${index + 2}`).value = resultado.resultado_texto || resultado.resultado_numerico || '-';
      });
    } 
  },
  3: { 
    nombre: 'alcohol.xlsx', 
    editar: (ws, datos) => { 
      // Celdas comunes
      ws.getCell('C13').value = datos.codigo_muestra || '-';
      ws.getCell('G13').value = datos.fecha_recepcion_muestra || '-';
      ws.getCell('I13').value = datos.fabricante || '-';
      ws.getCell('G14').value = datos.fecha_vencimiento_muestra || '-';
      ws.getCell('I14').value = datos.distribuidor || '-';
      ws.getCell('C15').value = datos.nombre_producto_muestra || '-';
      ws.getCell('G15').value = datos.fecha_creacion_muestra || '-';
      ws.getCell('I16').value = datos.laboratorio || '-';
      ws.getCell('G16').value = datos.fecha_actualizacion_muestra || '-';
      ws.getCell('B19').value = datos.color_muestra || '-';
      ws.getCell('F19').value = datos.aspecto_muestra || '-';
      ws.getCell('L19').value = datos.condicion_transp_muestra || '-';
      ws.getCell('B20').value = datos.olor_muestra || '-';
      ws.getCell('F20').value = datos.textura_muestra || '-';
      ws.getCell('L20').value = datos.condicion_almac_muestra || '-';
      ws.getCell('B21').value = datos.sabor_muestra || '-';
      ws.getCell('F21').value = datos.peso_neto_muestra || '-';
      ws.getCell('L21').value = datos.temperatura_muestra || '-';
      ws.getCell('L22').value = datos.fecha_reporte || '-';

      // Agregar resultados de pruebas
      datos.resultadosPrueba.forEach((resultado, index) => {
        ws.getCell(`D${index + 2}`).value = resultado.resultado_texto || resultado.resultado_numerico || '-';
      });
    } 
  }
};

router.post('/descargar-pdf', async (req, res) => { // Elimina `requireAuth` temporalmente para probar
  try {
    const { tipoMuestra, datosDB } = req.body;
    const config = plantillaConfig[tipoMuestra];
    if (!config) return res.status(400).json({ success: false, message: 'Tipo de muestra inválido' });

    const plantillaPath = path.join(__dirname, '../plantillas excel', config.nombre); // Corrected path
    const tempExcel = path.join(__dirname, '../temp', `temp_${Date.now()}.xlsx`); // Ensure temp path is correct
    const tempPdf = tempExcel.replace('.xlsx', '.pdf');

    // Carga y modifica la plantilla Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(plantillaPath);
    const worksheet = workbook.getWorksheet(1);

    // Edición automática según tipo de muestra
    config.editar(worksheet, datosDB);

    await workbook.xlsx.writeFile(tempExcel);

    const libreofficeCmd = `soffice --headless --convert-to pdf --outdir "${path.dirname(tempPdf)}" "${tempExcel}"`;

    exec(libreofficeCmd, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al convertir a PDF' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla-editada.pdf');
      fs.createReadStream(tempPdf)
        .on('end', () => {
          fs.unlinkSync(tempExcel);
          fs.unlinkSync(tempPdf);
        })
        .pipe(res);
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/descargar-excel/:idMuestra', async (req, res) => {
  try {
    const { idMuestra } = req.params;

    // Obtener los datos de la muestra desde la base de datos
    const muestra = await obtenerDatosMuestra(idMuestra); // Implementa esta función según tu lógica
    if (!muestra) {
      return res.status(404).json({ success: false, message: 'Muestra no encontrada' });
    }

    const config = plantillaConfig[muestra.id_tipo_muestra];
    if (!config) {
      return res.status(400).json({ success: false, message: 'Tipo de muestra inválido' });
    }

    const plantillaPath = path.join(__dirname, '../plantillas excel', config.nombre); // Corrected path
    const tempExcel = path.join(__dirname, '../temp', `temp_${Date.now()}.xlsx`); // Ensure temp path is correct
    const tempPdf = tempExcel.replace('.xlsx', '.pdf');

    // Carga y modifica la plantilla Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(plantillaPath);
    const worksheet = workbook.getWorksheet(1);

    // Edición automática según tipo de muestra
    config.editar(worksheet, muestra);

    await workbook.xlsx.writeFile(tempExcel);

    const libreofficeCmd = `soffice --headless --convert-to pdf --outdir "${path.dirname(tempPdf)}" "${tempExcel}"`;

    exec(libreofficeCmd, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al convertir a PDF' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla-editada.pdf');
      fs.createReadStream(tempPdf)
        .on('end', () => {
          fs.unlinkSync(tempExcel);
          fs.unlinkSync(tempPdf);
        })
        .pipe(res);
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Función para obtener los datos de la muestra desde la base de datos
async function obtenerDatosMuestra(idMuestra) {
  // Implementa la lógica para obtener los datos de la muestra desde la base de datos
  // Esto puede incluir consultas a varias tablas para obtener todos los datos necesarios
  return {
    id_tipo_muestra: 1, // Ejemplo: tipo de muestra
    codigo_muestra: '12345',
    fecha_recepcion_muestra: '2023-01-01',
    fabricante: 'Empresa A',
    distribuidor: 'Empresa B',
    laboratorio: 'Laboratorio X',
    color_muestra: 'Rojo',
    // ...otros datos necesarios...
    resultadosPrueba: [
      { resultado_texto: 'Aprobado', resultado_numerico: null },
      { resultado_texto: null, resultado_numerico: 95 }
    ]
  };
}

module.exports = router; // Ensure only the router is exported