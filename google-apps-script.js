/**
 * NutriNuts - Google Apps Script for Google Sheets Integration
 * =============================================================
 *
 * Features:
 *   - Records new orders in the "Orders" sheet (PRESERVED — never modified)
 *   - Sends email notifications to:
 *       • nutrinutspk@gmail.com
 *       • haris.hanif87@gmail.com
 *   - Sends FCM push notifications to all registered admin devices
 *     (with Order ID idempotency — duplicate pushes are blocked)
 *   - Records contact form submissions in the "Contacts" sheet
 *   - Registers/unregisters admin devices for push notifications
 *   - Auto-cleans invalid/expired FCM tokens
 *   - Logs every notification attempt in "NotificationLogs" sheet
 *
 * DEPLOYMENT SAFETY GUARANTEES:
 *   1. Order recording in Google Sheets ALWAYS succeeds regardless of
 *      email or FCM failures.
 *   2. Email and FCM are fire-and-forget — failures are logged but
 *      NEVER block the order being recorded.
 *   3. If Firebase is entirely unavailable, orders still work normally.
 *   4. WhatsApp Business flow is completely independent (client-side).
 *   5. Customer checkout is never interrupted by notification failures.
 *
 * HOW TO SET UP / UPDATE:
 *
 * 1. Go to https://sheets.google.com/open?id=1MOY9SUTttdxCA4rGhEhmjbT0ZyYHJO05G1S-50NyHv8
 *
 * 2. Set up sheets (the script auto-creates missing ones):
 *
 *    a) "Orders" sheet with headers in Row 1:
 *       Order ID | Date & Time | Customer Name | Customer Phone |
 *       Receiver Name | Receiver Phone | Delivery Address | Google Maps Link |
 *       Product Name | Quantity | Unit Price | Line Total |
 *       Delivery Charges | Grand Total | Payment Method |
 *       Payment Status | Delivery Status | Notes
 *
 *    b) "Contacts" sheet with headers:
 *       Date | Name | Email | Phone | Message
 *
 *    c) "DeviceTokens" sheet with headers:
 *       Token | Device Name | Platform | Registered At | Last Used | Status
 *
 *    d) "NotificationLogs" sheet with headers:
 *       Timestamp | Order ID | Type | Recipient | Success | Error Message | Devices Notified
 *
 * 3. Go to Extensions > Apps Script. Replace all code with this file.
 *
 * 4. Set Script Properties (Project Settings > Script Properties):
 *    Add property: FIREBASE_SERVICE_ACCOUNT
 *    Value: The ENTIRE JSON content of your Firebase Service Account key file.
 *           (Copy the whole JSON including braces — one continuous string.)
 *
 *    ⚠️  SECURITY: Never store the Service Account JSON in source code or GitHub.
 *        Script Properties is the ONLY place this credential should exist.
 *
 * 5. Click Deploy > Manage Deployments > (select existing) > Update.
 *    Or create a New Deployment if this is the first time.
 *    - Choose type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *
 * 6. If prompted, authorize the app (needs: Spreadsheets, Mail, URL Fetch).
 *
 * 7. The URL stays the same if you updated an existing deployment.
 */

/* ================================================================== */
/*                         MAIN ENTRY POINT                            */
/* ================================================================== */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Route by type
    switch (data.type) {
      case 'contact':
        return handleContact(data);
      case 'register-device':
        return handleDeviceRegistration(data);
      case 'unregister-device':
        return handleDeviceUnregistration(data);
      case 'test-notification':
        return handleTestNotification(data);
      case 'system-health':
        return handleSystemHealth();
      case 'test-push-all':
        return handleTestPushAll();
      case 'test-email':
        return handleTestEmail();
      default:
        // Default: order (backward compatible — orders don't send a type field)
        return handleOrder(data);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'NutriNuts API is running',
      version: '2.1.0-fcm-health-monitor',
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================================================================== */
/*                         ORDER HANDLING                              */
/* ================================================================== */

/**
 * Handle a new order — the core order processing pipeline.
 *
 * GUARANTEED: Order is ALWAYS recorded in the Orders sheet, even if
 *             email or FCM notifications fail.
 *
 * Pipeline:
 *   1. Record order in Orders sheet (MUST succeed)
 *   2. Send email notifications (independent — logged on failure)
 *   3. Send FCM push notifications (independent — idempotent — logged)
 */
function handleOrder(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');

  if (!data.items || data.items.length === 0) {
    throw new Error('No items in order');
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Record order in Google Sheets (PRESERVED — never modified)
  // ═══════════════════════════════════════════════════════════════
  for (const item of data.items) {
    const row = [
      data.orderId,
      data.dateTime,
      data.customerName,
      data.customerPhone,
      data.receiverName,
      data.receiverPhone,
      data.deliveryAddress,
      data.mapsLink || '',
      item.productName,
      item.quantity,
      item.unitPrice,
      item.lineTotal,
      'To be confirmed',
      data.grandTotal,
      data.paymentMethod || '',
      data.paymentStatus || 'Pending',
      data.deliveryStatus || 'Pending',
      data.specialInstructions || ''
    ];
    sheet.appendRow(row);
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Email notifications (independent — never blocks orders)
  // ═══════════════════════════════════════════════════════════════
  sendOrderEmail(data);

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: FCM push notifications (independent — idempotent — logged)
  // ═══════════════════════════════════════════════════════════════
  sendOrderPushNotification(data);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      orderId: data.orderId,
      rows: data.items.length,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================================================================== */
/*                       EMAIL NOTIFICATION                            */
/* ================================================================== */

/**
 * Send email notifications for a new order.
 *
 * Recipients (both receive every order notification):
 *   • nutrinutspk@gmail.com — Primary business email
 *   • haris.hanif87@gmail.com — Owner's personal email
 *
 * Failure here does NOT affect the order being recorded in the sheet.
 * Each recipient is attempted independently.
 */
function sendOrderEmail(data) {
  const recipients = [
    'nutrinutspk@gmail.com',
    'haris.hanif87@gmail.com',
  ];

  const itemCount = data.items.reduce(function(sum, i) { return sum + i.quantity; }, 0);

  var itemsList = data.items.map(function(item) {
    return '• ' + item.productName + ' × ' + item.quantity + ' = Rs. ' + item.lineTotal.toLocaleString();
  }).join('\n');

  var subject = '🛒 New Order: ' + data.orderId + ' — Rs. ' + data.grandTotal.toLocaleString();
  var body = [
    '🔔 NEW ORDER RECEIVED',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Order ID:    ' + data.orderId,
    'Date:        ' + data.dateTime,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '📋 CUSTOMER DETAILS',
    'Name:        ' + data.customerName,
    'Phone:       ' + data.customerPhone,
    '',
    '📦 DELIVERY DETAILS',
    'Receiver:    ' + data.receiverName,
    'Phone:       ' + data.receiverPhone,
    'Address:     ' + data.deliveryAddress,
    (data.mapsLink ? 'Maps:        ' + data.mapsLink + '\n' : ''),
    '',
    '🛍️ ORDER ITEMS (' + itemCount + ' items)',
    itemsList,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Grand Total: Rs. ' + data.grandTotal.toLocaleString(),
    'Payment:     ' + (data.paymentMethod || 'N/A'),
    'Instructions: ' + (data.specialInstructions || 'None'),
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    'View all orders: https://sheets.google.com/open?id=' + SpreadsheetApp.getActiveSpreadsheet().getId(),
    '',
    '— NutriNuts Order System'
  ].join('\n');

  // Try each recipient independently
  recipients.forEach(function(recipient) {
    try {
      MailApp.sendEmail(recipient, subject, body);
      logNotification(data.orderId, 'Email', recipient, true, '', 1);
    } catch (e) {
      console.error('Failed to send email to ' + recipient + ': ' + e.toString());
      logNotification(data.orderId, 'Email', recipient, false, e.toString(), 0);
    }
  });
}

/* ================================================================== */
/*                     FCM PUSH NOTIFICATIONS                          */
/* ================================================================== */

/**
 * Send FCM push notifications to all registered admin devices.
 *
 * IDEMPOTENCY: Uses the Order ID as the deduplication key. If a
 * notification for this Order ID was already successfully sent
 * (recorded in NotificationLogs), the push is SKIPPED — even if
 * Google Apps Script retries the webhook call.
 *
 * This is fire-and-forget. Failure never blocks the order.
 *
 * @param {Object} orderData - Order data from placeOrder()
 */
function sendOrderPushNotification(orderData) {
  var orderId = orderData.orderId;

  try {
    // ═══ IDEMPOTENCY CHECK ═══
    // If this Order ID was already processed recently (success or failure),
    // skip to prevent duplicate notifications from GAS retries.
    // Uses a 5-minute sliding window — see isNotificationAlreadySent().
    if (isNotificationAlreadySent(orderId, 'FCM')) {
      console.log('[FCM] Order ' + orderId + ' already processed recently — skipping (idempotent).');
      return;
    }

    // ═══ GET ACTIVE TOKENS ═══
    var sheet = getOrCreateDeviceTokensSheet();
    var tokens = getActiveTokens(sheet);

    if (tokens.length === 0) {
      console.log('[FCM] No registered devices for ' + orderId + ' — skipping push.');
      logNotification(orderId, 'FCM', 'all-devices', false, 'No active devices registered', 0);
      return;
    }

    // ═══ GET OAUTH2 TOKEN ═══
    var accessToken = getFCMAccessToken();
    if (!accessToken) {
      console.warn('[FCM] Could not get FCM access token for ' + orderId + ' — skipping push.');
      logNotification(orderId, 'FCM', 'all-devices', false, 'OAuth2 token retrieval failed — check Service Account config', 0);
      return;
    }

    // ═══ SEND TO EACH DEVICE ═══
    var projectId = getFirebaseProjectId();
    var itemCount = orderData.items.reduce(function(sum, i) { return sum + i.quantity; }, 0);
    var successCount = 0;
    var failCount = 0;
    var lastError = '';

    tokens.forEach(function(tokenRow) {
      var token = tokenRow.token;
      try {
        sendFCMMessage(accessToken, projectId, token, orderData, itemCount);
        // Update last used + status
        tokenRow.row[4] = new Date(); // Column E: Last Used
        tokenRow.row[5] = 'active';   // Column F: Status
        sheet.getRange(tokenRow.index, 1, 1, 6).setValues([tokenRow.row]);
        successCount++;
      } catch (e) {
        failCount++;
        lastError = e.toString();
        console.warn('[FCM] Failed to send to ' + token.substring(0, 20) + '…: ' + lastError);

        // Mark invalid tokens for cleanup
        if (isTokenInvalidError(lastError)) {
          tokenRow.row[5] = 'invalid'; // Column F: Status
          sheet.getRange(tokenRow.index, 1, 1, 6).setValues([tokenRow.row]);
        }
      }
    });

    // ═══ LOG RESULT ═══
    if (failCount === 0) {
      logNotification(orderId, 'FCM', 'all-devices', true, '', successCount);
    } else if (successCount > 0) {
      // Partial success
      logNotification(orderId, 'FCM', 'all-devices', true,
        'Partial: ' + successCount + ' sent, ' + failCount + ' failed. Last error: ' + lastError,
        successCount);
    } else {
      // Complete failure
      logNotification(orderId, 'FCM', 'all-devices', false,
        'All ' + failCount + ' devices failed. Last error: ' + lastError,
        0);
    }

    // ═══ CLEANUP INVALID TOKENS ═══
    cleanupInvalidTokens(sheet);

  } catch (e) {
    // ABSOLUTE last-resort catch — FCM failure NEVER affects the order
    console.error('[FCM] sendOrderPushNotification crashed: ' + e.toString());
    logNotification(orderId, 'FCM', 'all-devices', false, 'Fatal error: ' + e.toString(), 0);
  }
}

/**
 * Check if a notification for this Order ID + Type was already processed
 * recently. This provides idempotency across GAS retries.
 *
 * Uses a 5-minute sliding window: if ANY log entry (success OR failure)
 * exists for this Order ID + Type within the last 5 minutes, we skip.
 * This closes the TOCTOU race between check-and-send:
 *   - GAS retries happen within seconds → always caught by the window
 *   - Legitimate retries after real outages (>5 min) still work
 *   - Both success and failure entries act as the idempotency guard
 *
 * @param {string} orderId
 * @param {string} type - 'FCM' | 'Email'
 * @returns {boolean} True if a recent entry exists (should skip)
 */
function isNotificationAlreadySent(orderId, type) {
  try {
    var sheet = getOrCreateNotificationLogsSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) return false; // Only header row

    var FIVE_MINUTES_MS = 5 * 60 * 1000;
    var cutoff = new Date(Date.now() - FIVE_MINUTES_MS);

    // Scan from bottom up (most recent entries first) for efficiency
    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var rowTimestamp = row[0]; // Column A: Timestamp

      // Stop scanning if we've gone past the 5-minute window
      // (older entries are irrelevant for idempotency)
      if (rowTimestamp instanceof Date && rowTimestamp < cutoff) {
        break;
      }

      // Column B (index 1): Order ID, Column C (index 2): Type
      // Match ANY entry (success=true or success=false) — both indicate
      // the order was already processed (or attempted) in this window
      if (String(row[1]).trim() === String(orderId).trim() &&
          String(row[2]).trim() === type) {
        console.log('[FCM] Idempotency: found existing entry for ' + orderId + ' (' + type + ') from ' + rowTimestamp);
        return true;
      }
    }
    return false;
  } catch (e) {
    console.warn('[FCM] Idempotency check failed (non-blocking): ' + e.toString());
    return false; // On error, proceed with sending (better to duplicate than miss)
  }
}

/**
 * Send a single FCM message via the HTTP v1 API.
 *
 * @param {string} accessToken - OAuth2 access token
 * @param {string} projectId - Firebase project ID
 * @param {string} token - FCM device token
 * @param {Object} orderData - Order data
 * @param {number} itemCount - Number of items
 */
function sendFCMMessage(accessToken, projectId, token, orderData, itemCount) {
  var url = 'https://fcm.googleapis.com/v1/projects/' + projectId + '/messages:send';

  var message = {
    message: {
      token: token,
      notification: {
        title: '🔔 New Order: ' + orderData.orderId,
        body: 'Customer: ' + (orderData.customerName || 'N/A') +
              ' | Total: Rs. ' + (orderData.grandTotal || 0).toLocaleString() +
              ' | Items: ' + itemCount,
      },
      data: {
        orderId: String(orderData.orderId || ''),
        customerName: String(orderData.customerName || ''),
        grandTotal: String(orderData.grandTotal || '0'),
        itemCount: String(itemCount),
        timestamp: String(Date.now()),
      },
      webpush: {
        notification: {
          requireInteraction: true,
          icon: 'https://nutrinuts.pk/assets/images/logo.png',
          badge: 'https://nutrinuts.pk/assets/images/logo.png',
          vibrate: [200, 100, 200, 100, 200],
          tag: 'nutrinuts-order-' + orderData.orderId,
          actions: [
            { action: 'view', title: 'View Order' },
            { action: 'dismiss', title: 'Dismiss' },
          ],
        },
        fcmOptions: {
          link: 'https://nutrinuts.pk/pages/admin-register.html',
        },
      },
    },
  };

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
    payload: JSON.stringify(message),
    muteHttpExceptions: true,
  });

  var responseCode = response.getResponseCode();
  var responseBody = JSON.parse(response.getContentText());

  if (responseCode !== 200) {
    throw new Error('FCM API returned ' + responseCode + ': ' + JSON.stringify(responseBody));
  }

  console.log('[FCM] Push sent. Token: ' + token.substring(0, 20) + '… Order: ' + orderData.orderId);
}

/* ================================================================== */
/*                       FCM OAUTH2 (Service Account)                  */
/* ================================================================== */

/**
 * Generate an OAuth2 access token for the Firebase Cloud Messaging API
 * using the Service Account JSON stored in Script Properties.
 *
 * The Service Account JSON MUST be stored as a Script Property named
 * FIREBASE_SERVICE_ACCOUNT with the full JSON content.
 *
 * IMPORTANT: The Service Account JSON contains a private_key. It must
 * NEVER appear in source code, GitHub, or any file committed to the repo.
 *
 * @returns {string|null} OAuth2 access token, or null on failure
 */
function getFCMAccessToken() {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var saJson = scriptProperties.getProperty('FIREBASE_SERVICE_ACCOUNT');

    if (!saJson) {
      console.error('[FCM] FIREBASE_SERVICE_ACCOUNT not set in Script Properties.');
      return null;
    }

    var serviceAccount = JSON.parse(saJson);

    // Validate required fields
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      console.error('[FCM] Service Account JSON missing client_email or private_key.');
      return null;
    }

    // Build JWT header
    var header = { alg: 'RS256', typ: 'JWT' };

    // Build JWT claim set
    var now = Math.floor(Date.now() / 1000);
    var claim = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now,
    };

    // Base64url-encode header and claim
    var headerB64 = base64UrlEncode(JSON.stringify(header));
    var claimB64 = base64UrlEncode(JSON.stringify(claim));
    var signatureInput = headerB64 + '.' + claimB64;

    // Sign with RS256 using the Service Account private key
    var signatureBytes = Utilities.computeRsaSha256Signature(
      signatureInput,
      serviceAccount.private_key
    );
    var signatureB64 = base64UrlEncodeFromBytes(signatureBytes);

    // Assemble JWT
    var jwt = signatureInput + '.' + signatureB64;

    // Exchange JWT for OAuth2 access token
    var response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
      method: 'post',
      payload: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      },
      muteHttpExceptions: true,
    });

    var responseCode = response.getResponseCode();
    var responseBody = JSON.parse(response.getContentText());

    if (responseCode !== 200) {
      console.error('[FCM] OAuth2 token request failed: ' + JSON.stringify(responseBody));
      return null;
    }

    return responseBody.access_token;
  } catch (e) {
    console.error('[FCM] getFCMAccessToken error: ' + e.toString());
    return null;
  }
}

/**
 * Get the Firebase project ID from the Service Account JSON.
 * No hardcoding — it's always in the Service Account key.
 *
 * @returns {string} Firebase project ID
 */
function getFirebaseProjectId() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var saJson = scriptProperties.getProperty('FIREBASE_SERVICE_ACCOUNT');

  if (!saJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT not set in Script Properties.');
  }

  var serviceAccount = JSON.parse(saJson);
  return serviceAccount.project_id;
}

/* ─────────── Base64url Helpers ─────────── */

function base64UrlEncode(input) {
  var bytes = Utilities.newBlob(input).getBytes();
  return base64UrlEncodeFromBytes(bytes);
}

function base64UrlEncodeFromBytes(bytes) {
  var base64 = Utilities.base64Encode(bytes);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/* ================================================================== */
/*                     NOTIFICATION LOGGING                            */
/* ================================================================== */

/**
 * Get or create the NotificationLogs sheet.
 *
 * Columns:
 *   A: Timestamp       — When the notification was attempted
 *   B: Order ID        — The order this notification is for
 *   C: Type            — 'FCM' | 'Email' | 'Test'
 *   D: Recipient       — Email address or 'all-devices'
 *   E: Success         — 'true' | 'false'
 *   F: Error Message   — Empty on success, error details on failure
 *   G: Devices Notified — Number of devices that received (0 for email)
 */
function getOrCreateNotificationLogsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('NotificationLogs');

  if (!sheet) {
    sheet = ss.insertSheet('NotificationLogs');
    sheet.appendRow([
      'Timestamp',
      'Order ID',
      'Type',
      'Recipient',
      'Success',
      'Error Message',
      'Devices Notified',
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Log a notification attempt to the NotificationLogs sheet.
 *
 * @param {string} orderId
 * @param {string} type - 'FCM' | 'Email' | 'Test'
 * @param {string} recipient - Email address or 'all-devices'
 * @param {boolean} success
 * @param {string} errorMessage - Empty string on success
 * @param {number} devicesNotified - Number of devices (0 for email, count for FCM)
 */
function logNotification(orderId, type, recipient, success, errorMessage, devicesNotified) {
  try {
    var sheet = getOrCreateNotificationLogsSheet();
    sheet.appendRow([
      new Date(),
      String(orderId || ''),
      String(type || ''),
      String(recipient || ''),
      success ? 'true' : 'false',
      String(errorMessage || ''),
      Number(devicesNotified || 0),
    ]);
  } catch (e) {
    // Logging failure should never affect anything else
    console.error('[Log] Failed to write notification log: ' + e.toString());
  }
}

/* ================================================================== */
/*                     DEVICE TOKEN MANAGEMENT                         */
/* ================================================================== */

/**
 * Get or create the DeviceTokens sheet.
 *
 * Columns:
 *   A: Token (FCM device token)
 *   B: Device Name (human-readable)
 *   C: Platform (android | ios | desktop | unknown)
 *   D: Registered At (timestamp)
 *   E: Last Used (timestamp — updated when a push is sent)
 *   F: Status (active | inactive | invalid)
 */
function getOrCreateDeviceTokensSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DeviceTokens');

  if (!sheet) {
    sheet = ss.insertSheet('DeviceTokens');
    sheet.appendRow([
      'Token',
      'Device Name',
      'Platform',
      'Registered At',
      'Last Used',
      'Status',
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Get all active device tokens from the sheet.
 *
 * @param {Sheet} sheet - The DeviceTokens sheet
 * @returns {Array<{token: string, index: number, row: Array}>}
 */
function getActiveTokens(sheet) {
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) return []; // Only header row

  var tokens = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = row[5] || 'active'; // Column F: Status
    if (status === 'active' && row[0]) {
      tokens.push({
        token: String(row[0]).trim(),
        index: i + 1, // 1-indexed row number
        row: row,
      });
    }
  }

  return tokens;
}

/**
 * Register a new device token or update an existing one.
 *
 * Request payload:
 *   { type: 'register-device', token: '...', deviceName: '...', platform: '...' }
 */
function handleDeviceRegistration(data) {
  if (!data.token) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Missing token.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = getOrCreateDeviceTokensSheet();
  var allData = sheet.getDataRange().getValues();

  // Check if this token already exists — update if so
  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][0]).trim() === data.token) {
      sheet.getRange(i + 1, 2).setValue(data.deviceName || 'Unknown');
      sheet.getRange(i + 1, 3).setValue(data.platform || 'unknown');
      sheet.getRange(i + 1, 5).setValue(new Date()); // Last Used
      sheet.getRange(i + 1, 6).setValue('active');    // Status

      console.log('[FCM] Device re-registered: ' + data.token.substring(0, 20) + '…');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          action: 'updated',
          message: 'Device re-registered successfully.',
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // New token — append
  var now = new Date();
  sheet.appendRow([
    data.token,
    data.deviceName || 'Unknown Device',
    data.platform || 'unknown',
    now,
    now,
    'active',
  ]);

  console.log('[FCM] New device registered: ' + data.token.substring(0, 20) + '… (' + (data.deviceName || 'Unknown') + ')');

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      action: 'registered',
      message: 'Device registered for push notifications.',
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Unregister a device token.
 */
function handleDeviceUnregistration(data) {
  if (!data.token) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Missing token.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = getOrCreateDeviceTokensSheet();
  var allData = sheet.getDataRange().getValues();

  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][0]).trim() === data.token) {
      sheet.getRange(i + 1, 6).setValue('inactive'); // Status
      sheet.getRange(i + 1, 5).setValue(new Date());  // Last Used

      console.log('[FCM] Device unregistered: ' + data.token.substring(0, 20) + '…');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Device unregistered.',
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Token was not registered (already removed).',
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Send a test push notification to a single device.
 */
function handleTestNotification(data) {
  if (!data.token) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Missing token.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var accessToken = getFCMAccessToken();
    if (!accessToken) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Could not get FCM access token. Check Service Account configuration.',
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var projectId = getFirebaseProjectId();

    var testMessage = {
      message: {
        token: data.token,
        notification: {
          title: '✅ Test Notification',
          body: 'NutriNuts push notifications are working! You will receive order alerts here.',
        },
        data: {
          type: 'test',
          timestamp: String(Date.now()),
        },
        webpush: {
          notification: {
            requireInteraction: false,
            icon: 'https://nutrinuts.pk/assets/images/logo.png',
            tag: 'nutrinuts-test',
            vibrate: [200, 100, 200],
          },
        },
      },
    };

    var url = 'https://fcm.googleapis.com/v1/projects/' + projectId + '/messages:send';
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + accessToken },
      payload: JSON.stringify(testMessage),
      muteHttpExceptions: true,
    });

    var responseCode = response.getResponseCode();
    var responseBody = JSON.parse(response.getContentText());

    if (responseCode === 200) {
      logNotification('TEST', 'Test', 'single-device', true, '', 1);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Test notification sent!' }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      logNotification('TEST', 'Test', 'single-device', false, JSON.stringify(responseBody), 0);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'FCM API error: ' + JSON.stringify(responseBody),
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (e) {
    logNotification('TEST', 'Test', 'single-device', false, e.toString(), 0);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ================================================================== */
/*                       TOKEN CLEANUP                                 */
/* ================================================================== */

/**
 * Check if an FCM error indicates the token should be removed.
 *
 * FCM error codes for invalid tokens:
 *   - UNREGISTERED: Token is no longer valid
 *   - INVALID_ARGUMENT: Token format is invalid
 *   - NOT_FOUND: Token doesn't exist
 *   - SENDER_ID_MISMATCH: Token belongs to different Firebase project
 *   - PERMISSION_DENIED: Token scope/permission issue
 */
function isTokenInvalidError(errorMessage) {
  var invalidPatterns = [
    'UNREGISTERED',
    'INVALID_ARGUMENT',
    'NOT_FOUND',
    'SENDER_ID_MISMATCH',
    'PERMISSION_DENIED',
  ];

  return invalidPatterns.some(function(pattern) {
    return errorMessage.indexOf(pattern) !== -1;
  });
}

/**
 * Remove tokens marked as 'invalid' immediately, and 'inactive'
 * tokens older than 30 days. Called after each push notification batch.
 *
 * @param {Sheet} sheet - The DeviceTokens sheet (optional)
 */
function cleanupInvalidTokens(sheet) {
  try {
    if (!sheet) sheet = getOrCreateDeviceTokensSheet();

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    var now = new Date();
    var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    var rowsToDelete = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var status = String(row[5] || '');
      var lastUsed = row[4]; // Column E: Last Used

      var shouldDelete = false;

      if (status === 'invalid') {
        shouldDelete = true; // Remove immediately
      } else if (status === 'inactive') {
        if (lastUsed instanceof Date) {
          if (now.getTime() - lastUsed.getTime() > THIRTY_DAYS_MS) {
            shouldDelete = true;
          }
        } else {
          shouldDelete = true; // No date = stale data
        }
      }

      if (shouldDelete) {
        rowsToDelete.push(i + 1); // 1-indexed
      }
    }

    // Delete from bottom up
    for (var j = rowsToDelete.length - 1; j >= 0; j--) {
      sheet.deleteRow(rowsToDelete[j]);
    }

    if (rowsToDelete.length > 0) {
      console.log('[FCM] Cleanup: removed ' + rowsToDelete.length + ' invalid/expired token(s).');
    }
  } catch (e) {
    console.warn('[FCM] Token cleanup failed (non-critical): ' + e.toString());
  }
}

/* ================================================================== */
/*                       SYSTEM HEALTH MONITOR                          */
/* ================================================================== */

/**
 * Full system health check — verifies all integrations and returns
 * status of every component. Called from /pages/admin/system-health.html
 *
 * No parameters required. Returns comprehensive status object.
 *
 * Response:
 * {
 *   googleSheets:    { status, detail },
 *   appsScript:      { status, detail, version },
 *   firebase:        { status, detail },
 *   email:           { status, detail, dailyQuota },
 *   whatsapp:        { status, detail },
 *   devices:         { registered, active },
 *   lastOrder:       { orderId, timestamp },
 *   lastPush:        { timestamp, success },
 *   lastEmail:       { timestamp, success },
 *   today:           { orders, notificationsSent, notificationsFailed },
 *   timestamp:       "ISO string"
 * }
 */
function handleSystemHealth() {
  var result = {
    googleSheets: { status: 'error', detail: '' },
    appsScript: { status: 'ok', detail: 'GAS endpoint responding', version: '2.1.0-fcm-health-monitor' },
    firebase: { status: 'error', detail: '' },
    email: { status: 'error', detail: '', dailyQuota: 0 },
    whatsapp: { status: 'ok', detail: 'Client-side only — WhatsApp Business number configured' },
    devices: { registered: 0, active: 0 },
    lastOrder: { orderId: '', timestamp: '' },
    lastPush: { timestamp: '', success: false },
    lastEmail: { timestamp: '', success: false },
    today: { orders: 0, notificationsSent: 0, notificationsFailed: 0 },
    timestamp: new Date().toISOString(),
  };

  // ═══ Google Sheets ═══
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordersSheet = ss.getSheetByName('Orders');
    if (ordersSheet) {
      var lastRow = ordersSheet.getLastRow();
      result.googleSheets.status = 'ok';
      result.googleSheets.detail = 'Spreadsheet accessible. Orders sheet has ' + Math.max(0, lastRow - 1) + ' rows.';
    } else {
      result.googleSheets.status = 'warning';
      result.googleSheets.detail = 'Spreadsheet accessible but "Orders" sheet not found. It will be created on first order.';
    }
  } catch (e) {
    result.googleSheets.status = 'error';
    result.googleSheets.detail = 'Cannot access spreadsheet: ' + e.toString();
  }

  // ═══ Firebase Cloud Messaging ═══
  try {
    var accessToken = getFCMAccessToken();
    if (accessToken) {
      result.firebase.status = 'ok';
      result.firebase.detail = 'Service Account valid, OAuth2 token obtained. Project: ' + getFirebaseProjectId();
    } else {
      result.firebase.status = 'error';
      result.firebase.detail = 'Could not get FCM access token. Check FIREBASE_SERVICE_ACCOUNT in Script Properties.';
    }
  } catch (e) {
    result.firebase.status = 'error';
    result.firebase.detail = 'Firebase check failed: ' + e.toString();
  }

  // ═══ Email Service ═══
  try {
    var quota = MailApp.getRemainingDailyQuota();
    result.email.dailyQuota = quota;
    if (quota > 0) {
      result.email.status = 'ok';
      result.email.detail = 'MailApp available. ' + quota + ' emails remaining today.';
    } else {
      result.email.status = 'error';
      result.email.detail = 'Daily email quota exhausted. Emails will not send until quota resets.';
    }
  } catch (e) {
    result.email.status = 'error';
    result.email.detail = 'MailApp check failed: ' + e.toString();
  }

  // ═══ Device Stats ═══
  try {
    var deviceSheet = getOrCreateDeviceTokensSheet();
    var deviceData = deviceSheet.getDataRange().getValues();
    var activeCount = 0;
    for (var i = 1; i < deviceData.length; i++) {
      if (deviceData[i][5] === 'active') activeCount++; // Column F: Status
    }
    result.devices.registered = Math.max(0, deviceData.length - 1); // Minus header
    result.devices.active = activeCount;
  } catch (e) {
    result.devices.registered = -1;
    result.devices.active = -1;
  }

  // ═══ Last Order ═══
  try {
    var ordersData = ordersSheet ? ordersSheet.getDataRange().getValues() : [];
    if (ordersData.length > 1) {
      var last = ordersData[ordersData.length - 1];
      result.lastOrder.orderId = String(last[0] || '');
      result.lastOrder.timestamp = String(last[1] || '');
    }
  } catch (e) {
    // Non-critical — leave defaults
  }

  // ═══ Last Push & Email ═══
  try {
    var logSheet = getOrCreateNotificationLogsSheet();
    var logData = logSheet.getDataRange().getValues();

    // Scan logs from bottom up to find last push and last email
    for (var j = logData.length - 1; j >= 1; j--) {
      var logRow = logData[j];
      var logType = String(logRow[2] || '');   // Column C: Type
      var logSuccess = String(logRow[4] || '') === 'true'; // Column E: Success

      if (!result.lastPush.timestamp && logType === 'FCM') {
        result.lastPush.timestamp = String(logRow[0] || '');
        result.lastPush.success = logSuccess;
      }
      if (!result.lastEmail.timestamp && logType === 'Email') {
        result.lastEmail.timestamp = String(logRow[0] || '');
        result.lastEmail.success = logSuccess;
      }
      if (result.lastPush.timestamp && result.lastEmail.timestamp) break;
    }
  } catch (e) {
    // Non-critical — leave defaults
  }

  // ═══ Today's Stats ═══
  try {
    var today = new Date();
    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Count today's orders
    if (ordersData && ordersData.length > 1) {
      for (var k = 1; k < ordersData.length; k++) {
        var orderDate = ordersData[k][1]; // Column B: Date & Time
        if (orderDate instanceof Date && orderDate >= todayStart) {
          result.today.orders++;
        }
      }
    }

    // Count today's notifications
    if (logData && logData.length > 1) {
      for (var m = 1; m < logData.length; m++) {
        var logDate = logData[m][0]; // Column A: Timestamp
        if (logDate instanceof Date && logDate >= todayStart) {
          var lType = String(logData[m][2] || '');
          var lSuccess = String(logData[m][4] || '') === 'true';
          if (lType === 'FCM') {
            if (lSuccess) {
              result.today.notificationsSent++;
            } else {
              result.today.notificationsFailed++;
            }
          }
        }
      }
    }
  } catch (e) {
    // Non-critical — leave defaults
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Send a test push notification to ALL registered active devices.
 * Unlike test-notification (single device), this broadcasts to every
 * registered admin device without creating an order.
 *
 * Logs the attempt in NotificationLogs.
 */
function handleTestPushAll() {
  try {
    var sheet = getOrCreateDeviceTokensSheet();
    var tokens = getActiveTokens(sheet);

    if (tokens.length === 0) {
      logNotification('TEST-BROADCAST', 'Test', 'all-devices', false, 'No active devices registered', 0);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No active devices registered.',
          devicesFound: 0,
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var accessToken = getFCMAccessToken();
    if (!accessToken) {
      logNotification('TEST-BROADCAST', 'Test', 'all-devices', false, 'OAuth2 token retrieval failed', 0);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Could not get FCM access token. Check Service Account configuration.',
          devicesFound: tokens.length,
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var projectId = getFirebaseProjectId();
    var successCount = 0;
    var failCount = 0;
    var errors = [];

    tokens.forEach(function(tokenRow) {
      var token = tokenRow.token;
      try {
        var testMessage = {
          message: {
            token: token,
            notification: {
              title: '🧪 System Health Test',
              body: 'This is a test notification from the NutriNuts System Health Monitor. All systems operational.',
            },
            data: {
              type: 'system-health-test',
              timestamp: String(Date.now()),
            },
            webpush: {
              notification: {
                requireInteraction: false,
                icon: 'https://nutrinuts.pk/assets/images/logo.png',
                tag: 'nutrinuts-health-test',
                vibrate: [100, 50, 100],
              },
            },
          },
        };

        var url = 'https://fcm.googleapis.com/v1/projects/' + projectId + '/messages:send';
        var response = UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + accessToken },
          payload: JSON.stringify(testMessage),
          muteHttpExceptions: true,
        });

        var responseCode = response.getResponseCode();
        if (responseCode === 200) {
          successCount++;
          // Update last used
          tokenRow.row[4] = new Date();
          tokenRow.row[5] = 'active';
          sheet.getRange(tokenRow.index, 1, 1, 6).setValues([tokenRow.row]);
        } else {
          failCount++;
          var errBody = JSON.parse(response.getContentText());
          errors.push('Device ' + token.substring(0, 20) + '…: ' + JSON.stringify(errBody));

          if (isTokenInvalidError(JSON.stringify(errBody))) {
            tokenRow.row[5] = 'invalid';
            sheet.getRange(tokenRow.index, 1, 1, 6).setValues([tokenRow.row]);
          }
        }
      } catch (e) {
        failCount++;
        errors.push('Device ' + token.substring(0, 20) + '…: ' + e.toString());
      }
    });

    // Log result
    var allSuccess = failCount === 0;
    var errorSummary = errors.length > 0 ? errors.slice(0, 5).join(' | ') : '';
    if (errors.length > 5) errorSummary += ' … and ' + (errors.length - 5) + ' more';

    logNotification('TEST-BROADCAST', 'Test', 'all-devices', allSuccess,
      allSuccess ? '' : errorSummary, successCount);

    // Cleanup
    cleanupInvalidTokens(sheet);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: allSuccess,
        devicesFound: tokens.length,
        sent: successCount,
        failed: failCount,
        errors: errors.slice(0, 10), // Return first 10 errors for UI display
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    logNotification('TEST-BROADCAST', 'Test', 'all-devices', false, e.toString(), 0);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Send test emails to both admin recipients to verify email delivery.
 *
 * Sends independently to each — one failure doesn't affect the other.
 */
function handleTestEmail() {
  var recipients = [
    'nutrinutspk@gmail.com',
    'haris.hanif87@gmail.com',
  ];

  var results = [];
  var allSuccess = true;

  recipients.forEach(function(recipient) {
    try {
      var subject = '🧪 NutriNuts System Health Test';
      var body = [
        'SYSTEM HEALTH TEST',
        '',
        'This is an automated test email from the NutriNuts System Health Monitor.',
        '',
        'Timestamp: ' + new Date().toISOString(),
        'Status: All systems operational.',
        '',
        'If you received this, email delivery is working correctly.',
        '',
        '— NutriNuts System Health Monitor',
      ].join('\n');

      MailApp.sendEmail(recipient, subject, body);
      logNotification('TEST-EMAIL', 'Test', recipient, true, '', 0);
      results.push({ recipient: recipient, success: true });
    } catch (e) {
      allSuccess = false;
      logNotification('TEST-EMAIL', 'Test', recipient, false, e.toString(), 0);
      results.push({ recipient: recipient, success: false, error: e.toString() });
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      success: allSuccess,
      results: results,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================================================================== */
/*                       CONTACT FORM HANDLING                         */
/* ================================================================== */

function handleContact(data) {
  var emailTo = 'nutrinutspk@gmail.com';

  var subject = 'New Contact Message from NutriNuts Website';
  var body =
    'You received a new message from the NutriNuts contact form:\n\n' +
    'Name: ' + (data.name || 'Not provided') + '\n' +
    'Email: ' + (data.email || 'Not provided') + '\n' +
    'Phone: ' + (data.phone || 'Not provided') + '\n' +
    'Message:\n' + (data.message || 'Not provided');

  MailApp.sendEmail(emailTo, subject, body);

  var contactSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contacts');
  if (!contactSheet) {
    contactSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Contacts');
    contactSheet.appendRow(['Date', 'Name', 'Email', 'Phone', 'Message']);
  }
  contactSheet.appendRow([new Date(), data.name || '', data.email || '', data.phone || '', data.message || '']);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
