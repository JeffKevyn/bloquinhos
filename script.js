// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_5SNVK5Q6bnB555zoscl6B9pyZrhOrgM",
  authDomain: "bequiwitter.firebaseapp.com",
  databaseURL: "https://bequiwitter-default-rtdb.firebaseio.com",
  projectId: "bequiwitter",
  storageBucket: "bequiwitter.firebasestorage.app",
  messagingSenderId: "483644278868",
  appId: "1:483644278868:web:74c03b4eabb261654905c1",
  measurementId: "G-66YRW7LB4Z"
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
  
