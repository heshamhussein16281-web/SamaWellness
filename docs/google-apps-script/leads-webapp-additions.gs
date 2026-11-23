// ACTION 25 — paste this near the TOP of your existing doPost(e) function,
// before your current logic. It returns early for its own two action
// types ("getNextCode", "logLead") and returns null for anything else, so
// your existing booking/contact handling (which has no "action" field)
// is completely untouched — it just falls through to whatever runs after
// the lines you add below.
//
// You will need three tabs in the same spreadsheet this script already
// writes to:
//   - "Counters"     — a single cell, B1, holding the last-used sequence
//                       number (ONE global counter shared by every source
//                       prefix, so codes look like G101, S102, D103 — the
//                       number always increases, regardless of source).
//                       Put the label "NextNumber" in A1 and 100 in B1.
//                       (Also auto-created on first use if you skip this.)
//   - "Leads log"     — fully automatic, you never edit this by hand.
//                       Header row (also auto-created on first use, but
//                       you can create it yourself first with this exact
//                       row): Timestamp | Code | Source | GCLID |
//                       Page Language | Landing Page | Channel | Name | Phone
//   - "Booked codes"  — the ONLY manual step for reception: when a lead
//                       actually books, type its code into column A here.
//                       Column B (Timestamp) fills itself automatically —
//                       see the onEdit(e) trigger below. Header row:
//                       Code | Timestamp

function handleAction25(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (payload.action === "getNextCode") {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000); // wait up to 10s for the lock, then proceed anyway
    try {
      var counters = ss.getSheetByName("Counters");
      if (!counters) {
        counters = ss.insertSheet("Counters");
        counters.getRange("A1").setValue("NextNumber");
        counters.getRange("B1").setValue(100);
      }
      var next = counters.getRange("B1").getValue() + 1;
      counters.getRange("B1").setValue(next);
      var source = (payload.source || "D").toString().toUpperCase();
      if (["G", "S", "I", "D"].indexOf(source) === -1) source = "D";
      var code = source + next;
      return ContentService.createTextOutput(
        JSON.stringify({ code: code })
      ).setMimeType(ContentService.MimeType.JSON);
    } finally {
      lock.releaseLock();
    }
  }

  if (payload.action === "logLead") {
    var log = ss.getSheetByName("Leads log");
    if (!log) {
      log = ss.insertSheet("Leads log");
      log.appendRow([
        "Timestamp", "Code", "Source", "GCLID", "Page Language",
        "Landing Page", "Channel", "Name", "Phone",
      ]);
    }
    log.appendRow([
      new Date(),
      payload.code || "",
      payload.source || "",
      payload.gclid || "",
      payload.pageLanguage || "",
      payload.landingPage || "",
      payload.channel || "",
      payload.name || "",
      payload.phone || "",
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return null; // not an Action 25 request — let existing doPost logic continue
}

// In your existing doPost(e), add these two lines as the FIRST thing
// inside the function, right after it parses `payload` from
// e.postData.contents (however your existing code already does that):
//
//   var action25Result = handleAction25(payload);
//   if (action25Result) return action25Result;
//
// Everything below that in your existing doPost stays exactly as it is.

// Separate from doPost entirely — this is a spreadsheet-edit trigger, not
// a web request handler. If you don't already have an onEdit(e) function
// in this project, paste this as its own top-level function (Apps Script
// runs it automatically on any edit, no wiring needed). If you DO already
// have one, merge this body into it instead of having two onEdit functions
// (only the last one defined would run otherwise).
function onEdit(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== "Booked codes") return;
  if (e.range.getRow() === 1) return; // header row
  if (e.range.getColumn() !== 1) return; // only react to edits in column A (Code)

  var row = e.range.getRow();
  var codeValue = sheet.getRange(row, 1).getValue();
  if (!codeValue) {
    sheet.getRange(row, 2).clearContent(); // code cleared -> clear its timestamp too
    return;
  }
  sheet.getRange(row, 2).setValue(new Date());
}
