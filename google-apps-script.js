/**
 * NutriNuts - Google Apps Script for Google Sheets Integration
 *
 * HOW TO SET UP / UPDATE:
 *
 * 1. Go to https://sheets.google.com/open?id=1MOY9SUTttdxCA4rGhEhmjbT0ZyYHJO05G1S-50NyHv8
 *
 * 2. Rename Sheet1 to "Orders". Set up these column headers in Row 1:
 *    Order ID | Date & Time | Customer Name | Customer Phone |
 *    Receiver Name | Receiver Phone | Delivery Address | Google Maps Link |
 *    Product Name | Quantity | Unit Price | Line Total |
 *    Delivery Charges | Grand Total | Payment Method |
 *    Payment Status | Delivery Status | Notes
 *
 * 3. Create a second sheet named "Contacts" with headers in Row 1:
 *    Date | Name | Email | Phone | Message
 *
 * 4. Go to Extensions > Apps Script. Replace all code with this file.
 *
 * 5. Click Deploy > Manage Deployments > (select existing) > Update.
 *    Or create a New Deployment if this is the first time.
 *    - Choose type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *
 * 6. If prompted, authorize the app (needs permission to send email and edit sheets).
 *
 * 7. The URL stays the same if you updated an existing deployment.
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'contact') {
      return handleContact(data);
    }

    return handleOrder(data);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleOrder(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');

  if (!data.items || data.items.length === 0) {
    throw new Error('No items in order');
  }

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

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, orderId: data.orderId, rows: data.items.length }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleContact(data) {
  const emailTo = 'nutrinutspk@gmail.com';

  const subject = 'New Contact Message from NutriNuts Website';
  const body =
    'You received a new message from the NutriNuts contact form:\n\n' +
    'Name: ' + (data.name || 'Not provided') + '\n' +
    'Email: ' + (data.email || 'Not provided') + '\n' +
    'Phone: ' + (data.phone || 'Not provided') + '\n' +
    'Message:\n' + (data.message || 'Not provided');

  MailApp.sendEmail(emailTo, subject, body);

  let contactSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contacts');
  if (!contactSheet) {
    contactSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Contacts');
    contactSheet.appendRow(['Date', 'Name', 'Email', 'Phone', 'Message']);
  }
  contactSheet.appendRow([new Date(), data.name || '', data.email || '', data.phone || '', data.message || '']);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'NutriNuts API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
