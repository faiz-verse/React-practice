// googleDriveConfig.js
const { google } = require("googleapis");

// Load credentials from environment variables
const credentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS);

// Authenticate using the provided credentials
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/drive"]
});

// Create Google Drive client
const drive = google.drive({ version: "v3", auth });

module.exports = { drive };
