// Configuração do Firebase
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

// Configuração inicial
let userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('userId', userId);

// Função para postar tweet
function postTweet() {
    const tweetInput = document.getElementById('tweetInput');
    const tweetText = tweetInput.value.trim();
    
    if (!tweetText) {
        console.log('Tweet vazio');
        return;
    }

    // Pegar dados do usuário atual
    database.ref('users/' + userId).once('value')
        .then((snapshot) => {
            const userData = snapshot.val() || {};
            
            // Criar novo tweet
            const newTweet = {
                userId: userId,
                userName: userData.name || 'Anônimo',
                userPhoto: userData.photoUrl || 'https://via.placeholder.com/150',
                text: tweetText,
                isVerified: userData.isVerified || false,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // Salvar tweet
            return database.ref('tweets').push(newTweet);
        })
        .then(() => {
            console.log('Tweet postado com sucesso');
            tweetInput.value = '';
            document.getElementById('charCount').textContent = '280';
        })
        .catch((error) => {
            console.error('Erro ao postar tweet:', error);
            alert('Erro ao postar tweet');
        });
}

// Função para carregar tweets
function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    tweetsContainer.innerHTML = ''; // Limpa tweets anteriores
    
    database.ref('tweets')
        .orderByChild('timestamp')
        .on('child_added', (snapshot) => {
            const tweet = snapshot.val();
            console.log('Novo tweet recebido:', tweet); // Debug

            const tweetElement = document.createElement('div');
            tweetElement.className = 'tweet';
            
            const time = new Date(tweet.timestamp).toLocaleString();
            
            tweetElement.innerHTML = `
                <div class="tweet-header">
                    <img src="${tweet.userPhoto}" alt="Foto de perfil">
                    <div class="tweet-name-container">
                        <span class="tweet-name">${tweet.userName}</span>
                        ${tweet.isVerified ? '<span class="verified-badge">✓</span>' : ''}
                    </div>
                    <span class="tweet-time">${time}</span>
                </div>
                <div class="tweet-content">${tweet.text}</div>
            `;
            
            tweetsContainer.insertBefore(tweetElement, tweetsContainer.firstChild);
        });
}

// Atualizar perfil
function updateProfile() {
    const nameInput = document.getElementById('userNameInput');
    const passwordInput = document.getElementById('userPasswordInput');
    const username = nameInput.value.trim();
    const password = passwordInput.value.trim();

    // Verificar se é um usuário verificado
    database.ref('verifiedUsers').child(username).once('value')
        .then((snapshot) => {
            const verifiedData = snapshot.val();
            const isVerified = verifiedData && verifiedData.password === password;

            // Atualizar perfil do usuário
            return database.ref('users/' + userId).update({
                name: username,
                photoUrl: document.getElementById('profileImage').src,
                isVerified: isVerified
            });
        })
        .then(() => {
            alert(isVerified ? 'Perfil verificado e atualizado!' : 'Perfil atualizado!');
        })
        .catch((error) => {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil');
        });
}

// Event Listeners
document.getElementById('tweetInput').addEventListener('input', function() {
    const remaining = 280 - this.value.length;
    document.getElementById('charCount').textContent = remaining;
});

// Preview de imagem
document.getElementById('imageUpload').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImage').src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
    }
});

// Inicialização
loadTweets();