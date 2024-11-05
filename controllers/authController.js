const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../config/firebase'); // Firebase Storage config
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Función para registrar un nuevo usuario (gamer o empresa)
// Función para registrar un nuevo usuario (gamer o empresa)
// controllers/authController.js
exports.registerUser = async (req, res) => {
  const { name, email, password, role, dateOfBirth, description } = req.body;

  try {
      if (!name) return res.status(400).json({ message: 'El nombre es obligatorio.' });
      if (!email) return res.status(400).json({ message: 'El correo electrónico es obligatorio.' });
      if (!password) return res.status(400).json({ message: 'La contraseña es obligatoria.' });
      if (!dateOfBirth) return res.status(400).json({ message: 'La fecha de nacimiento es requerida.' });

      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });

      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      if (age < 12) {
          return res.status(400).json({ message: 'Debes ser mayor de 12 años para registrarte.' });
      }

      let logoUrl = null;
      if (req.file && role === 'empresa') {
          const storageRef = ref(storage, `logos/${uuidv4()}_${req.file.originalname}`);
          await uploadBytes(storageRef, req.file.buffer);
          logoUrl = await getDownloadURL(storageRef);
      }

      const user = new User({
          name,
          email,
          password,
          role: role || 'gamer',
          logo: logoUrl,
          dateOfBirth,
          description: role === 'empresa' ? description : null,
      });

      await user.save();

      res.status(201).json({
          message: 'Usuario registrado exitosamente',
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              logo: user.logo || 'No logo uploaded',
              dateOfBirth: user.dateOfBirth,
              description: user.description, // Añadimos la descripción
          },
      });
  } catch (error) {
      res.status(500).json({ message: 'Ha ocurrido un error al registrar al usuario. Por favor, inténtelo de nuevo.' });
  }
};

  


// Función para iniciar sesión
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por su email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si la contraseña es correcta
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Generar un token JWT con el rol y ID del usuario
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                logo: user.logo || 'No logo uploaded',
            } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPasswordRequest = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Expira en 1 hora
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await sendEmail(user.email, 'Restablecimiento de contraseña', `
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="${resetLink}">Resetear Contraseña</a>
        `);

        res.json({ message: 'Enlace de restablecimiento enviado al correo.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Token inválido o expirado.' });

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

