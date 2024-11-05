// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['gamer', 'empresa'], default: 'gamer' },
    logo: { type: String, default: null },
    description: { type: String, default: null }, // Descripción para empresas
    dateOfBirth: { type: Date, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
