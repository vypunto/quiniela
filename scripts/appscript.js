// Google Apps Script — CALENDAPP
// Pega este código en tu proyecto de Apps Script (Extensions → Apps Script)
// y vuelve a desplegarlo como aplicación web (Deploy → Manage deployments → New deployment)

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    // Busca la hoja PETICIONES; si no existe, usa la segunda hoja
    var sheet = ss.getSheetByName('PETICIONES') || ss.getSheets()[1]

    // ── ACTUALIZAR fila existente ──────────────────────────────────
    if (data.action === 'update') {
      var rowNumber = parseInt(data.rowIndex) + 2 // +1 cabecera, +1 base 1
      var lastRow = sheet.getLastRow()
      if (rowNumber >= 2 && rowNumber <= lastRow) {
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
        var updateData = data.data || {}
        headers.forEach(function (header, colIndex) {
          var key = header.toString().toLowerCase().trim()
            .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
          if (Object.prototype.hasOwnProperty.call(updateData, key)) {
            sheet.getRange(rowNumber, colIndex + 1).setValue(updateData[key])
          }
        })
        return ContentService
          .createTextOutput(JSON.stringify({ ok: true }))
          .setMimeType(ContentService.MimeType.JSON)
      }
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Fila no encontrada' }))
        .setMimeType(ContentService.MimeType.JSON)
    }

    // ── INSERTAR nueva fila ────────────────────────────────────────
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var row = headers.map(function (h) {
      var key = h.toString().toLowerCase().trim()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
      return data[key] !== undefined ? data[key] : (data[h] !== undefined ? data[h] : '')
    })
    sheet.appendRow(row)

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// Necesario para CORS — devuelve OK en preflight OPTIONS
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, status: 'CALENDAPP Apps Script activo' }))
    .setMimeType(ContentService.MimeType.JSON)
}
