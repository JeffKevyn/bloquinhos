// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAWSZlplTEvEH5uKBLdG16gRdivxVqpTNc",
  authDomain: "witterquinhos.firebaseapp.com",
  databaseURL: "https://witterquinhos-default-rtdb.firebaseio.com",
  projectId: "witterquinhos",
  storageBucket: "witterquinhos.firebasestorage.app",
  messagingSenderId: "1058191243094",
  appId: "1:1058191243094:web:c4424c955381d648f288f7",
  measurementId: "G-9VDZ5W58P3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Gerar ID de usuário
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

// Nome e foto do usuário
const userName = localStorage.getItem('userName') || 'Usuário';
const userPhoto = localStorage.getItem('userPhoto') || 'default-avatar.png';

// Configurar admin (apenas adicionando esta parte nova)
database.ref('UserADM').set({
    "user_qaunowfad": {
        "verified": true,
        "dev": true,
        "premium": true
    }
});

// Resto do seu código original aqui...
  
