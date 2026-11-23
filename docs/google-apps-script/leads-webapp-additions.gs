// ACTION 25 — paste this near the TOP of your existing doPost(e) function,
// before your current logic. It returns early for its own two action
// types ("getNextCode", "logLead") and returns null for anything else, so
// your existing booking/contact handling (which has no "action" field)
// is completely untouched — it just falls through to whatever runs after
// the lines you add below.
//
// You will need two new tabs in the same spreadsheet this script already
// writes to:
//   - "Counters"  — a single cell, B1, holding the last-used sequence
//                    number (ONE global counter shared by every source
//                    prefix, so codes look like G101, S102, D103 — the
//                    number always increases, regardless of source).
//                    Put the label "NextNumber" in A1 and 100 in B1.
//                    (This script also creates it automatically on first
//                    use if you skip this step.)
//   - "Leads log" — header row (also auto-created on first use, but you
//                    can create it yourself first with this exact row):
//                    Timestamp | Code | Source | GCLID | Page Language |
//                    Landing Page | Channel | Name | Phone | Booked | Booking Date

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
        "Landing Page", "Channel", "Name", "Phone", "Booked", "Booking Date",
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
      "", // Booked — filled in by reception
      "", // Booking date — filled in by reception
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
