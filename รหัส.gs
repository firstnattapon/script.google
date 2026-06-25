function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ลงทะเบียนและนัดหมายดูบ้านพัก')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ฟังก์ชันบันทึกข้อมูลลง Sheet
function saveToSheet(data) {
  try {
    var sheetName = "ข้อมูลผู้เช่า";

    // บันทึกลงไฟล์ Google Sheets ตามลิงก์ที่คุณระบุโดยตรง
    var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1yy-GLEy0xotYay4BiUD83xhOO0Aw-FqKoh3p8lvR2VU/edit?gid=0#gid=0");
    var sheet = ss.getSheetByName(sheetName);

    var headers = ["วันที่และเวลา", "ชื่อ-นามสกุล", "เบอร์โทร", "ชื่อ LINE/LINE ID", "อาชีพ", "สถานที่ทำงาน/รายละเอียด", "จำนวนคน", "สัตว์เลี้ยง", "รถยนต์", "การย้ายเข้า", "คะแนนรวม", "สถานะ"];

    // สร้าง Sheet ใหม่ถ้ายังไม่มี พร้อมหัวตารางที่เพิ่มช่อง LINE ID และรายละเอียดสถานที่ทำงาน
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
    } else if (sheet.getLastColumn() === 11) {
      sheet.insertColumnAfter(5);
    }

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#d9ead3");

    // บันทึกข้อมูล (ผูกข้อมูล LINE ID และรายละเอียดสถานที่ทำงานลงตารางระบบกรอง)
    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.lineId,
      data.job,
      data.jobDetail,
      data.people,
      data.pet,
      data.car,
      data.date,
      data.score,
      data.status
    ]);

    return true;
  } catch (error) {
    throw new Error("ไม่สามารถบันทึกข้อมูลได้: " + error.toString());
  }
}
