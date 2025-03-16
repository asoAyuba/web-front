const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs'); // Para leer ficheros

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
    adopta: false,
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
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
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
    from: 'info@ayuba.org',
    to: 'info@ayuba.org',
    replyTo: email,
    subject: `${asuntoSelect} - ${userSubject}`,
    text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    // Envío correcto: respondemos con JSON
    res.json({ success: true });
  } catch (error) {
    console.error("Error al enviar el formulario:", error);

    // Aseguramos que la carpeta /logs existe
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    // Formateamos la fecha para el nombre del archivo: ddmmssAAAA-log-contactForm.txt
    let now = new Date();
    let dd = String(now.getDate()).padStart(2, '0');
    let mm = String(now.getMonth() + 1).padStart(2, '0'); // meses empiezan en 0
    let ss = String(now.getSeconds()).padStart(2, '0');
    let aaaa = now.getFullYear();
    let filename = `${dd}${mm}${ss}${aaaa}-log-contactForm.txt`;
    let logPath = path.join(logsDir, filename);

    // Contenido del log: datos del formulario y descripción del error
    let logContent = `--- Datos del formulario ---\n`;
    logContent += `Nombre: ${name}\nEmail: ${email}\nUserSubject: ${userSubject}\nAsuntoSelect: ${asuntoSelect}\nMensaje: ${message}\n\n`;
    logContent += `--- Error ---\n`;
    logContent += error.toString();

    // Escribimos el log en el fichero
    fs.writeFileSync(logPath, logContent, 'utf8');

    // Configuramos el email que enviará el log
    let logEmailOptions = {
      from: 'info@ayuba.org',
      to: 'info@ayuba.org',
      subject: 'log - formulario contacto fallido',
      text: logContent
    };

    // Intentamos enviar el email del log
    try {
      await transporter.sendMail(logEmailOptions);
    } catch (logError) {
      console.error("Error al enviar el email del log:", logError);
    }

    // Respondemos con error (aunque internamente se ha generado el log)
    res.status(500).json({ success: false, message: "Error al enviar el mensaje." });
  }
});


// Inicializa el servidor
const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`));
