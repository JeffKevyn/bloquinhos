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

// ID do usuário
const userId = 'user_' + Math.random().toString(36).substr(2, 9);

// Função para postar tweet
function postTweet() {
    const tweetInput = document.getElementById('tweetInput');
    const tweetText = tweetInput.value.trim();
    
    if (!tweetText) {
        return;
    }

    const userName = document.getElementById('userNameInput').value.trim() || 'Anônimo';
    const photoUrl = document.getElementById('profileImage').src;

    const newTweet = {
        userId: userId,
        userName: userName,
        userPhoto: photoUrl,
        text: tweetText,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('tweets').push(newTweet)
        .then(() => {
            tweetInput.value = '';
            document.getElementById('charCount').textContent = '280';
        })
        .catch(error => {
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
            const tweetElement = document.createElement('div');
            tweetElement.className = 'tweet';
            
            const time = new Date(tweet.timestamp).toLocaleString();
            
            tweetElement.innerHTML = `
                <div class="tweet-header">
                    <img src="${tweet.userPhoto}" alt="Foto de perfil">
                    <div class="tweet-name-container">
                        <span class="tweet-name">${tweet.userName}</span>
                    </div>
                    <span class="tweet-time">${time}</span>
                </div>
                <div class="tweet-content">${tweet.text}</div>
            `;
            
            tweetsContainer.insertBefore(tweetElement, tweetsContainer.firstChild);
        });
}

// Upload de imagem
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImage').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Contador de caracteres
document.getElementById('tweetInput').addEventListener('input', function() {
    const remaining = 280 - this.value.length;
    document.getElementById('charCount').textContent = remaining;
});

// Inicializar
loadTweets(); 

// Remova todas as partes relacionadas à verificação e senha
function updateProfile() {
    const nameInput = document.getElementById('userNameInput');
    const username = nameInput.value.trim();

    if (!username) {
        alert('Por favor, digite seu nome');
        return;
    }

    alert('Perfil atualizado com sucesso!');
} 