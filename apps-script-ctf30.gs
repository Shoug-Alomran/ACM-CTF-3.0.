/**
 * ACM/CyberTech CTF 3.0 — registration branch for the shared ACM event
 * Apps Script (the same web app JAM.26 posts to).
 *
 * Paste this file into the shared Apps Script project alongside the JAM.26
 * code, add the router line shown below to doPost, then redeploy the web app.
 * Nothing here touches the jam26 or Messages behaviour.
 *
 *   function doPost(e) {
 *     var lock = LockService.getScriptLock();
 *     try {
 *       lock.waitLock(15000);
 *       var form = (e && e.parameter) || {};
 *       if (form.eventType === 'ctf30' || form.event === 'ctf30') return handleCtfRegistration(form);   // <-- add
 *       return form.type === 'contact' ? handleContact(form) : handleRegistration(form);
 *     } catch (err) {
 *       console.error(err);
 *       return page('Error: something went wrong on our side. Please try again, or contact the organizers.');
 *     } finally {
 *       lock.releaseLock();
 *     }
 *   }
 *
 * Reuses these helpers already defined in the shared project:
 *   REGISTRATION_SPREADSHEET_ID, isEmail, safeCell, allowRequest, hasExactValue
 */

var CTF_SHEET_NAME = 'ctf30';

/* Payload field -> worksheet header. Row cells are placed by header lookup,
 * never by position, so re-ordering columns in the sheet cannot shift values. */
var CTF_FIELD_TO_HEADER = {
  teamName:      'Team Name',
  captainName:   'Captain Name',
  captainId:     'Captain University ID',
  captainEmail:  'Captain University Email',
  captainPhone:  'Captain Phone Number',
  captainMajor:  'Captain Major',
  member2Name:   'Member 2 Name',
  member2Id:     'Member 2 University ID',
  member2Email:  'Member 2 University Email',
  member2Major:  'Member 2 Major',
  member3Name:   'Member 3 Name',
  member3Id:     'Member 3 University ID',
  member3Email:  'Member 3 University Email',
  member3Major:  'Member 3 Major',
  experience:    'Experience Level'
};

var CTF_REQUIRED = [
  'teamName', 'experience',
  'captainName', 'captainId', 'captainEmail', 'captainPhone', 'captainMajor',
  'member2Name', 'member2Id', 'member2Email', 'member2Major'
];

var CTF_MEMBER3 = ['member3Name', 'member3Id', 'member3Email', 'member3Major'];

var CTF_LIMITS = {
  teamName: 120, experience: 40,
  captainName: 120, captainId: 40, captainEmail: 254, captainPhone: 40, captainMajor: 120,
  member2Name: 120, member2Id: 40, member2Email: 254, member2Major: 120,
  member3Name: 120, member3Id: 40, member3Email: 254, member3Major: 120
};

var CTF_EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];

function handleCtfRegistration(form) {
  // Honeypot: pretend success so bots do not learn anything, write nothing.
  if (form.website) return ctfPage('OK');

  var value = function (field) { return String(form[field] || '').trim(); };

  var i;
  for (i = 0; i < CTF_REQUIRED.length; i++) {
    if (!value(CTF_REQUIRED[i])) return ctfPage('Error: missing ' + CTF_REQUIRED[i]);
  }

  var fields = Object.keys(CTF_FIELD_TO_HEADER);
  for (i = 0; i < fields.length; i++) {
    if (value(fields[i]).length > CTF_LIMITS[fields[i]]) return ctfPage('Error: ' + fields[i] + ' is too long');
  }

  if (CTF_EXPERIENCE.indexOf(value('experience')) === -1) return ctfPage('Error: invalid experience');

  // Member 3 is optional, but all-or-nothing so a partial row never lands.
  var thirdFilled = CTF_MEMBER3.filter(function (f) { return value(f); });
  if (thirdFilled.length && thirdFilled.length !== CTF_MEMBER3.length) {
    return ctfPage('Error: complete every member 3 field or leave them all blank');
  }
  var hasThird = thirdFilled.length === CTF_MEMBER3.length;

  if (!isEmail(value('captainEmail'))) return ctfPage('Error: invalid captainEmail');
  if (!isEmail(value('member2Email'))) return ctfPage('Error: invalid member2Email');
  if (hasThird && !isEmail(value('member3Email'))) return ctfPage('Error: invalid member3Email');

  var emails = [value('captainEmail').toLowerCase(), value('member2Email').toLowerCase()];
  var ids = [value('captainId').toLowerCase(), value('member2Id').toLowerCase()];
  if (hasThird) {
    emails.push(value('member3Email').toLowerCase());
    ids.push(value('member3Id').toLowerCase());
  }
  if (hasDuplicate(emails)) return ctfPage('Error: each member needs a different university email');
  if (hasDuplicate(ids)) return ctfPage('Error: each member needs a different university ID');

  // Rate limit on the captain's identity: blocks double-submits and retry storms.
  if (!allowRequest('ctf30', emails[0] + '|' + ids[0], 300)) {
    return ctfPage('Error: please wait before submitting again');
  }

  var sheet = SpreadsheetApp.openById(REGISTRATION_SPREADSHEET_ID).getSheetByName(CTF_SHEET_NAME);
  if (!sheet) return ctfPage('Error: registration storage is not ready. Please contact the organizers.');

  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0]
    .map(function (h) { return String(h).trim(); });

  // Refuse to write rather than silently drop a column if the tab is not set up.
  var missing = ctfMissingHeaders(headers);
  if (missing.length) return ctfPage('Error: the ctf30 sheet is missing these columns: ' + missing.join(', '));

  // Nobody may appear twice across the sheet, in any member slot. Read the
  // sheet once rather than per column, so a large tab cannot blow the timeout.
  var taken = existingCtfValues(sheet, headers);
  for (i = 0; i < emails.length; i++) {
    if (taken.emails[emails[i]] || taken.ids[ids[i]]) {
      return ctfPage('Error: one of these participants is already registered');
    }
  }
  if (taken.teams[value('teamName').toLowerCase()]) {
    return ctfPage('Error: that team name is already taken');
  }

  var row = new Array(headers.length).fill('');
  fields.forEach(function (field) {
    var col = headers.indexOf(CTF_FIELD_TO_HEADER[field]);
    if (col !== -1) row[col] = safeCell(value(field));   // safeCell blocks =, +, -, @ formula injection
  });

  var tsCol = headers.indexOf('Timestamp');
  if (tsCol !== -1) row[tsCol] = new Date();

  sheet.appendRow(row);   // appendRow only ever adds a new last row
  return ctfPage('OK');
}

/* One read of the sheet, indexed for the duplicate checks above. */
function existingCtfValues(sheet, headers) {
  var taken = { emails: {}, ids: {}, teams: {} };
  if (sheet.getLastRow() < 2) return taken;

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
  var buckets = [
    ['emails', ['Captain University Email', 'Member 2 University Email', 'Member 3 University Email']],
    ['ids', ['Captain University ID', 'Member 2 University ID', 'Member 3 University ID']],
    ['teams', ['Team Name']]
  ];

  buckets.forEach(function (bucket) {
    bucket[1].forEach(function (header) {
      var col = headers.indexOf(header);
      if (col === -1) return;
      rows.forEach(function (row) {
        var cell = String(row[col] || '').trim().toLowerCase();
        if (cell) taken[bucket[0]][cell] = true;
      });
    });
  });
  return taken;
}

function ctfMissingHeaders(headers) {
  var expected = ['Timestamp'];
  Object.keys(CTF_FIELD_TO_HEADER).forEach(function (field) { expected.push(CTF_FIELD_TO_HEADER[field]); });
  return expected.filter(function (header) { return headers.indexOf(header) === -1; });
}

function hasDuplicate(values) {
  for (var i = 0; i < values.length; i++) {
    if (values.indexOf(values[i]) !== i) return true;
  }
  return false;
}

/* Same transport as jam26, tagged so the CTF page only reacts to its own reply. */
function ctfPage(msg) {
  var json = JSON.stringify({ source: 'ctf30', message: String(msg) }).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<p>' + String(msg) + '</p><script>parent.postMessage(' + json + ', "*");<\/script>');
}
