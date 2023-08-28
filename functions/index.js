const { google } = require('googleapis');
const functions = require('firebase-functions');

exports.createSpreadsheetRaportPdf = functions.region('europe-central2').https.onRequest(async (req, res) => {
  try {
    // Load the service account credentials from environment variables
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: functions.config().gdrive.client_email,
        private_key: functions.config().gdrive.private_key.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create a client instance for Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth });

    // Create a new spreadsheet
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'New Spreadsheet',
        },
      },
    });

    const spreadsheetId = response.data.spreadsheetId;
    console.log(`Spreadsheet created with ID: ${spreadsheetId}`);

    // Share the file with specific email addresses
    const drive = google.drive({ version: 'v3', auth });
    const emailAddresses = ['devjoter@gmail.com', 'user2@example.com'];

    for (const email of emailAddresses) {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: email,
        },
      });
    }

    res.status(200).send(`Spreadsheet created with ID: ${spreadsheetId}`);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred.');
  }
});
