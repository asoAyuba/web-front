const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

// Carga de textos e imágenes
const texts = require('./config/texts.json');
const images = require('./config/images.json');

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

// Ruta POST para el formulario de Contacta (campo "Asunto" y "Select")
app.post('/contact', async (req, res) => {
  const {
    name,
    email,
    userSubject,     // Campo de texto para "Asunto"
    asuntoSelect,    // Valor del <select>
    message
  } = req.body;

  if (!name || !email || !userSubject || !asuntoSelect || !message) {
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  // Configura tu transporter con credenciales válidas
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_password'
    }
  });

  // El asunto final será "asuntoSelect - userSubject"
  let mailOptions = {
    from: email,
    to: 'info@ayuba.org',
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

// NOTA: Eliminamos la ruta POST para voluntarios ya que la sección voluntarios
//       ya no contiene formulario.

// Inicializa el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`));
