const { initializeApp } = require('firebase/app'); // Inicializa Firebase
const { getStorage } = require('firebase/storage'); // Obtén Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBhsiwKSZPCf-ZerlC4uD6R-eL37CK2LnI",
  authDomain: "gamexplorer-42a0c.firebaseapp.com",
  projectId: "gamexplorer-42a0c",
  storageBucket: "gamexplorer-42a0c.appspot.com",
  messagingSenderId: "960392946252",
  appId: "1:960392946252:web:5a0afa302abfc0d6584ae9",
  measurementId: "G-68Q0WDD2NF"
};

// Inicializa Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);

// Obtén una instancia de Firebase Storage
const storage = getStorage(app);

module.exports = { app, storage };
