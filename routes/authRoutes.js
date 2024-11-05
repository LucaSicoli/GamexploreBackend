const express = require('express');
const { registerUser, loginUser,resetPasswordRequest, resetPassword } = require('../controllers/authController');
const upload = require('../middleware/upload'); // Middleware Multer para subir archivos
const router = express.Router();

router.post('/register', upload.single('logo'), registerUser);

router.post('/login', loginUser);
router.post('/reset-password-request', resetPasswordRequest); 
router.post('/reset-password', resetPassword);

module.exports = router;
