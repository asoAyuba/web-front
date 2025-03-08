const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs'); // <-- Importamos fs para leer ficheros

const app = express();

// Carga de textos e imágenes
const texts = require('./config/texts.json');
const images = require('./config/images.json');

// Cargamos el fichero de secretos desde la carpeta "../secrets", 
// que está fuera del proyecto actual
const secretsPath = path.join(__dirname, '../secrets', 'nodemailer.json');
const mailSecrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear formularios
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  // Flags para secciones opcionales
  const sectionsVisibility = {
    adopta: true,
    socios: true,
    voluntarios: true
  };

  // Renderizamos la vista pasando los textos e imágenes
  res.render('index', {
    sectionsVisibility,
    texts,
    images
  });
});

// Ruta POST para el formulario de Contacta
app.post('/contact', async (req, res) => {
  const { name, email, userSubject, asuntoSelect, message } = req.body;
  if (!name || !email || !userSubject || !asuntoSelect || !message) {
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  // Configuración de nodemailer con los datos del fichero de secretos
  let transporter = nodemailer.createTransport({
    host: mailSecrets.host,
    port: mailSecrets.port,
    secure: mailSecrets.secure,
    auth: {
      user: mailSecrets.auth.user,
      pass: mailSecrets.auth.pass
    }
  });

  let mailOptions = {
    // El 'from' debe ser un correo que coincida con el usuario autenticado
    from: 'info@ayuba.org',
    to: 'info@ayuba.org',
    replyTo: email, // Para responder directamente al usuario
    subject: `${asuntoSelect} - ${userSubject}`,
    text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/?contact=success');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al enviar el mensaje.");
  }
});

// Inicializa el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`));
