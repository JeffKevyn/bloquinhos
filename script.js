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

// Nome e foto do usuário
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

// Função para carregar tweets
function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    tweetsContainer.innerHTML = '';

    database.ref('tweets').orderByChild('timestamp').on('child_added', (snapshot) => {
        const tweet = snapshot.val();
        const tweetId = snapshot.key;

        // Verificar status de admin
        database.ref('UserADM/' + tweet.userId).once('value', (adminSnapshot) => {
            const adminData = adminSnapshot.val();
            const isVerified = adminData && adminData.verified;
            const isDev = adminData && adminData.dev;
            const isPremium = adminData && adminData.premium;

            const tweetElement = document.createElement('div');
            tweetElement.className = 'tweet';
            
            const time = new Date(tweet.timestamp).toLocaleString();
            const isLiked = tweet.likedBy && tweet.likedBy[userId];

            tweetElement.innerHTML = `
                <div class="tweet-header">
                    <img src="${tweet.userPhoto}" alt="Foto de perfil">
                    <div class="tweet-name-container">
                        <span class="tweet-name">${tweet.userName}</span>
                        ${isVerified ? '<span class="badge verified">✓</span>' : ''}
                        ${isDev ? '<span class="badge dev">👨‍💻</span>' : ''}
                        ${isPremium ? '<span class="badge premium">👑</span>' : ''}
                        <span class="tweet-time">${time}</span>
                    </div>
                </div>
                <div class="tweet-content">${tweet.text}</div>
                ${tweet.image ? `<img src="${tweet.image}" alt="Tweet image" class="tweet-image">` : ''}
                <div class="tweet-actions">
                    <button onclick="toggleLike('${tweetId}')" class="like-button ${isLiked ? 'liked' : ''}">
                        <i class="fa-heart ${isLiked ? 'fas' : 'far'}"></i>
                        <span class="like-count">${tweet.likes || 0}</span>
                    </button>
                </div>
            `;

            tweetsContainer.insertBefore(tweetElement, tweetsContainer.firstChild);
        });
    });
}

// Função para dar/remover like
function toggleLike(tweetId) {
    const tweetRef = database.ref('tweets/' + tweetId);
    
    tweetRef.transaction((tweet) => {
        if (tweet) {
            if (!tweet.likedBy) tweet.likedBy = {};
            
            if (tweet.likedBy[userId]) {
                tweet.likes--;
                tweet.likedBy[userId] = null;
            } else {
                tweet.likes = (tweet.likes || 0) + 1;
                tweet.likedBy[userId] = true;
            }
        }
        return tweet;
    });
}

// Função para enviar tweet
function sendTweet() {
    const tweetInput = document.getElementById('tweetInput');
    const text = tweetInput.value.trim();
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];

    if (!text && !file) {
        alert('Por favor, escreva algo ou selecione uma imagem!');
        return;
    }

    if (file) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`images/${Date.now()}_${file.name}`);
        
        imageRef.put(file).then(snapshot => {
            return snapshot.ref.getDownloadURL();
        }).then(imageUrl => {
            saveTweet(text, imageUrl);
        });
    } else {
        saveTweet(text);
    }

    tweetInput.value = '';
    imageInput.value = '';
    updateCharCount();
}

// Função para salvar tweet
function saveTweet(text, imageUrl = null) {
    const tweet = {
        userId: userId,
        userName: userName,
        userPhoto: userPhoto,
        text: text,
        image: imageUrl,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        likes: 0
    };

    database.ref('tweets').push(tweet);
}

// Atualizar contador de caracteres
function updateCharCount() {
    const tweetInput = document.getElementById('tweetInput');
    const charCount = document.getElementById('charCount');
    const remaining = 280 - tweetInput.value.length;
    charCount.textContent = remaining;
}

// Adicionar estilos CSS
const styles = `
    .badge {
        margin-left: 4px;
        font-size: 14px;
    }
    
    .verified {
        color: #1DA1F2;
    }
    
    .dev {
        color: #6e5494;
    }
    
    .premium {
        color: #FFD700;
    }
    
    .tweet-name-container {
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    loadTweets();
    
    // Adicionar listener para contador de caracteres
    const tweetInput = document.getElementById('tweetInput');
    tweetInput.addEventListener('input', updateCharCount);
});
  
