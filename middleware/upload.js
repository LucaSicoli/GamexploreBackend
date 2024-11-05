const multer = require('multer');

// Configuración de almacenamiento en memoria para subir el archivo como buffer
const storage = multer.memoryStorage(); 

// Solo aceptamos archivos de imagen (JPEG, PNG)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); // Aceptamos el archivo
    } else {
        cb(new Error('Formato de archivo no soportado. Solo JPEG o PNG.'), false); // Rechazamos el archivo
    }
};

// Exportamos la configuración de Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limitar a 5MB por archivo
    fileFilter: fileFilter,
});

module.exports = upload;
