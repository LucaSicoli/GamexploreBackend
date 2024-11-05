const nodemailer = require('nodemailer');

// Configura el transportador de nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Puerto seguro de Gmail
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER, // Email remitente
        pass: process.env.EMAIL_PASSWORD, // Contraseña de aplicación (app password)
    },
});

// Verifica la conexión al servidor SMTP al cargar este archivo
transporter.verify((error, success) => {
    if (error) {
        console.error('Error conectando con el servidor SMTP:', error.message);
    } else {
        console.log('Servidor SMTP listo para enviar correos.');
    }
});

// Función para enviar correos
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Soporte Gamexplorer" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Correo enviado correctamente.');
    } catch (error) {
        console.error('Error enviando correo:', error.message);
        throw new Error('No se pudo enviar el correo.');
    }
};

module.exports = sendEmail;
