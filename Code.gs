// Prominds New Chapter RSVP backend
// Paste this into Extensions > Apps Script on the
// "20261003 Prominds VSQ Office Grand Opening" Google Sheet,
// then Deploy > New deployment > Web app
//   Execute as: Me
//   Who has access: Anyone
// Copy the resulting /exec URL and send it back.

var SHEET_ID = '1qpUTF0uu_aSkYrLItcNObnE6-PqVcC4ZNtIcPK5PtKM';
var SHEET_NAME = '出席名单';

function doPost(e) {
  var result = { ok: false };
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var no = sheet.getLastRow(); // header occupies row 1, so lastRow == next No.
      var attendCell = data.attending === '是'
        ? ('出席' + (data.guests ? (' +' + data.guests) : ''))
        : '不出席';
      sheet.appendRow([
        no,
        data.name || '',
        data.contact || '',
        data.role || '',
        data.remark || '',
        attendCell
      ]);
    } finally {
      lock.releaseLock();
    }
    result.ok = true;
  } catch (err) {
    result.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var result = { ok: false, total: 0 };
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var values = sheet.getDataRange().getValues();
    var total = 0;
    for (var i = 1; i < values.length; i++) {
      var att = String(values[i][5] || '');
      if (att.indexOf('出席') === 0) {
        total += 1;
        var plusIdx = att.indexOf('+');
        if (plusIdx !== -1) {
          var extra = parseInt(att.substring(plusIdx + 1).trim(), 10);
          if (!isNaN(extra)) total += extra;
        }
      }
    }
    result.ok = true;
    result.total = total;
  } catch (err) {
    result.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
