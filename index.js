const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    type: "service_account",
  }),
});

app.post("/send-notification", async (req, res) => {
  const message = req.body.message; // Asegúrate que el JSON tenga key "message"

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error enviando notificación:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
