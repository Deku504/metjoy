const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Verificación básica de variables obligatorias
const requiredEnvVars = [
  "PROJECT_ID",
  "PRIVATE_KEY_ID",
  "PRIVATE_KEY",
  "CLIENT_EMAIL",
  "CLIENT_ID"
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Falta la variable de entorno: ${key}`);
    process.exit(1);
  }
});

// Inicializar Firebase Admin con credenciales del entorno
admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    type: "service_account",
  }),
  projectId: process.env.PROJECT_ID // 👈 importante para Render
});


// Ruta para enviar notificación
app.post("/send-notification", async (req, res) => {
  const message = req.body.message;

  if (!message || (!message.token && !message.topic && !message.condition)) {
    return res.status(400).json({
      success: false,
      error: "El cuerpo debe incluir al menos 'token', 'topic' o 'condition' en 'message'.",
    });
  }

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Error enviando notificación:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
