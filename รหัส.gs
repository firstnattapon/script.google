var PHOTO_FOLDER_ID = "1p7jgatZOTpJq6OWtpmGstNc04DoDvnob";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ลงทะเบียนและนัดหมายดูบ้านพัก')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ฟังก์ชันบันทึกข้อมูลลง Sheet
function saveToSheet(data) {
  try {
    var sheetName = "ข้อมูลผู้เช่า";
    var photoUrl = savePhoto(data);

    // บันทึกลงไฟล์ Google Sheets ตามลิงก์ที่คุณระบุโดยตรง
    var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1yy-GLEy0xotYay4BiUD83xhOO0Aw-FqKoh3p8lvR2VU/edit?gid=0#gid=0");
    var sheet = ss.getSheetByName(sheetName);

    // สร้าง Sheet ใหม่ถ้ายังไม่มี พร้อมหัวตารางที่เพิ่มช่อง LINE ID และรูปแนบ
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["วันที่และเวลา", "ชื่อ-นามสกุล", "เบอร์โทร", "ชื่อ LINE/LINE ID", "อาชีพ", "จำนวนคน", "สัตว์เลี้ยง", "รถยนต์", "การย้ายเข้า", "คะแนนรวม", "สถานะ", "รูปแนบ"]);
      sheet.getRange("A1:L1").setFontWeight("bold").setBackground("#d9ead3");
    } else if (sheet.getLastColumn() < 12) {
      sheet.getRange(1, 12).setValue("รูปแนบ").setFontWeight("bold").setBackground("#d9ead3");
    }

    // บันทึกข้อมูล (ผูกข้อมูล LINE ID และรูปแนบลงตารางระบบกรอง)
    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.lineId,
      data.job,
      data.people,
      data.pet,
      data.car,
      data.date,
      data.score,
      data.status,
      photoUrl
    ]);

    data.photoUrl = photoUrl;

    // ส่งแจ้งเตือน LINE Notify ไปยังคุณ (ผู้ให้เช่า)
    sendLineNotification(data);

    return true;
  } catch (error) {
    throw new Error("ไม่สามารถบันทึกข้อมูลได้: " + error.toString());
  }
}

// ฟังก์ชันบันทึกรูปแนบลง Google Drive
function savePhoto(data) {
  if (!data.photo || !data.photo.content) return "";

  var folder = DriveApp.getFolderById(PHOTO_FOLDER_ID);
  var decoded = Utilities.base64Decode(data.photo.content);
  var contentType = data.photo.type || "image/jpeg";
  var originalName = data.photo.name || "photo.jpg";
  var safeName = originalName.replace(/[\\/:*?"<>|]/g, "_");
  var fileName = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss") + "_" + (data.name || "tenant") + "_" + safeName;
  var blob = Utilities.newBlob(decoded, contentType, fileName);
  var file = folder.createFile(blob);

  return file.getUrl();
}

// ฟังก์ชันส่งแจ้งเตือนเข้า LINE ของผู้ให้เช่า
function sendLineNotification(data) {
  // 📌 นำ Token ของ LINE Notify มาใส่ในเครื่องหมายคำพูดด้านล่างนี้
  var lineToken = "ใส่_TOKEN_LINE_NOTIFY_ตรงนี้";

  if (lineToken === "ใส่_TOKEN_LINE_NOTIFY_ตรงนี้" || lineToken === "") return;

  var message = "\n🎯 มีผู้ลงทะเบียนโปรไฟล์ดีเข้ามา!\n" +
                "👤 ชื่อ: " + data.name + "\n" +
                "🟢 LINE: " + data.lineId + "\n" +
                "📞 โทร: " + data.phone + "\n" +
                "📊 คะแนน: " + data.score + " คะแนน\n" +
                "🚩 สถานะ: " + data.status + "\n" +
                "🖼️ รูปแนบ: " + (data.photoUrl || "ไม่มี");

  var options = {
    "method" : "post",
    "headers" : {"Authorization" : "Bearer " + lineToken},
    "payload" : {"message" : message}
  };

  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}
