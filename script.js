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
  
// Configuração inicial dos admins (adicione logo após a conexão com Firebase)
const adminUsers = {
    "UserADM": {
        "user_abc123": {
            "premium": true,
            "verified": true
        },
        "user_qaunowfad": {
            "dev": true,
            "premium": true,
            "verified": true
        },
        "user_xyz789": {
            "dev": true,
            "verified": true
        }
    }
};

// Atualizar/criar nó UserADM
database.ref().update(adminUsers);
  
function toggleLike(tweetId) {
    const tweetRef = database.ref('tweets/' + tweetId);
    
    tweetRef.transaction((tweet) => {
        if (tweet) {
            if (!tweet.likedBy) {
                tweet.likedBy = {};
            }
            
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
  
function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    tweetsContainer.innerHTML = '';
    
    database.ref('tweets')
        .orderByChild('timestamp')
        .on('child_added', (snapshot) => {
            const tweet = snapshot.val();
            const tweetId = snapshot.key;
            
            // Verificar status de admin
            database.ref('UserADM/' + tweet.userId).once('value')
                .then((adminSnapshot) => {
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
        const storageRef = firebase.storage().ref();
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

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadTweets();
    
    // Contador de caracteres
    document.getElementById('tweetInput').addEventListener('input', function() {
        const remaining = 280 - this.value.length;
        document.getElementById('charCount').textContent = remaining;
    });
});
  