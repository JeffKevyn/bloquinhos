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

// Variável global para controlar verificação
let isVerified = false;

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
            const tweetElement = document.createElement('div');
            tweetElement.className = 'tweet';
            
            const time = new Date(tweet.timestamp).toLocaleString();
            
            tweetElement.innerHTML = `
                <div class="tweet-header">
                    <img src="${tweet.userPhoto}" alt="Foto de perfil">
                    <div class="tweet-name-container">
                        <span class="tweet-name">${tweet.userName}</span>
                        ${tweet.isVerified ? '<span class="verified-badge" title="Conta Verificada"></span>' : ''}
                    </div>
                    <span class="tweet-time">${time}</span>
                </div>
                <div class="tweet-content">${tweet.text}</div>
            `;
            
            tweetsContainer.insertBefore(tweetElement, tweetsContainer.firstChild);
        });
}

// Função para atualizar perfil com mais logs de debug
function updateProfile() {
    const nameInput = document.getElementById('userNameInput');
    const passwordInput = document.getElementById('userPasswordInput');
    const username = nameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log('Tentando verificar:', username, password); // Debug

    if (!username || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    // Primeiro, vamos buscar e mostrar todos os usuários verificados (para debug)
    database.ref('verifiedUsers').once('value')
        .then(snapshot => {
            console.log('Todos os usuários verificados:', snapshot.val());
            return database.ref('verifiedUsers/' + username).once('value');
        })
        .then((snapshot) => {
            const verifiedData = snapshot.val();
            console.log('Dados do usuário encontrado:', verifiedData);

            if (!verifiedData) {
                console.log('Usuário não encontrado na lista de verificados');
                isVerified = false;
            } else {
                console.log('Senha fornecida:', password);
                console.log('Senha esperada:', verifiedData.password);
                isVerified = verifiedData.password === password;
                console.log('É verificado?', isVerified);
            }

            let photoUrl = document.getElementById('profileImage').src;
            
            // Atualiza os dados do usuário
            return database.ref('users/' + userId).set({
                name: username,
                photoUrl: photoUrl,
                isVerified: isVerified
            });
        })
        .then(() => {
            if (isVerified) {
                document.getElementById('profileVerifiedBadge').style.display = 'inline-flex';
                alert('Perfil verificado e atualizado com sucesso!');
            } else {
                document.getElementById('profileVerifiedBadge').style.display = 'none';
                alert('Perfil atualizado! (Não verificado)');
            }
        })
        .catch((error) => {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil: ' + error.message);
        });
}

// Event Listeners
document.getElementById('tweetInput').addEventListener('input', function() {
    const remaining = 280 - this.value.length;
    document.getElementById('charCount').textContent = remaining;
});

// Função para upload de imagem
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

// Inicialização
loadTweets();