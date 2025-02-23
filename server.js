const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

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
    adopta: false,   // Mostrar sección de adopción si hay gatos disponibles
    socios: false,   // Se oculta o muestra mediante un flag de estilos
    voluntarios: true
  };
  res.render('index', { sectionsVisibility });
});

// Ruta POST para el formulario de Contacta
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_password'
    }
  });

  let mailOptions = {
    from: email,
    to: 'info@ayuba.org',
    subject: 'Mensaje de la sección Contacta',
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

// Ruta POST para el formulario de Voluntarios
app.post('/volunteer', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_password'
    }
  });

  let mailOptions = {
    from: email,
    to: 'info@ayuba.org',
    subject: 'Solicitud de voluntariado',
    text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/?volunteer=success');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al enviar la solicitud.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));
