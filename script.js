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

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// Gerar ID de usuário persistente
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

// Nome e foto do usuário (você pode personalizar isso)
const userName = localStorage.getItem('userName') || 'Usuário';
const userPhoto = localStorage.getItem('userPhoto') || 'default-avatar.png';

// Verificar conexão com o Firebase
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
        console.log('Conectado ao Firebase!');
    } else {
        console.log('Desconectado do Firebase!');
    }
});

// Configuração dos admins
database.ref('UserADM').set({
    "user_qaunowfad": {
        "dev": true,
        "premium": true,
        "verified": true
    }
});

// Listener para tweets em tempo real
function initializeRealtimeListeners() {
    database.ref('tweets').on('child_added', (snapshot) => {
        console.log('Novo tweet adicionado!');
        loadTweets();
    });

    database.ref('tweets').on('child_changed', (snapshot) => {
        console.log('Tweet atualizado!');
        loadTweets();
    });

    database.ref('tweets').on('child_removed', (snapshot) => {
        console.log('Tweet removido!');
        loadTweets();
    });
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    initializeRealtimeListeners();
    loadTweets();
});
  