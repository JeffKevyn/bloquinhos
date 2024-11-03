// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAiQwg5sxVTQqVT5-9_144LRkXwUYEQyxg",
    authDomain: "bloquinhos-b1478.firebaseapp.com",
    databaseURL: "https://bloquinhos-b1478-default-rtdb.firebaseio.com",
    projectId: "bloquinhos-b1478",
    storageBucket: "bloquinhos-b1478.appspot.com",
    messagingSenderId: "46091311744",
    appId: "1:46091311744:web:a5e1ab6d9f5a8d0b9f0e1a"
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
  