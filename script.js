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

// Variável global para armazenar a imagem do tweet
let tweetImage = null;

// Função para lidar com a seleção de imagem do tweet
document.getElementById('tweetImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            tweetImage = e.target.result;
            // Mostrar preview
            const previewContainer = document.getElementById('tweetMediaPreview');
            previewContainer.style.display = 'block';
            previewContainer.innerHTML = `
                <img src="${tweetImage}" alt="Preview">
                <button onclick="removeTweetImage()" class="btn btn-small">✕</button>
            `;
        };
        reader.readAsDataURL(file);
    }
});

// Função para remover a imagem do tweet
function removeTweetImage() {
    tweetImage = null;
    document.getElementById('tweetMediaPreview').style.display = 'none';
    document.getElementById('tweetMediaPreview').innerHTML = '';
    document.getElementById('tweetImageInput').value = '';
}

// Função atualizada para postar tweet
function postTweet() {
    const tweetInput = document.getElementById('tweetInput');
    const tweetText = tweetInput.value.trim();
    
    if (!tweetText && !tweetImage) {
        return;
    }

    const userName = document.getElementById('userNameInput').value.trim() || 'Anônimo';
    const photoUrl = document.getElementById('profileImage').src;

    // Verificar se o usuário está na lista de verificados
    database.ref('verifiedUsers').child(userName).once('value')
        .then((snapshot) => {
            const isVerified = snapshot.exists();

            const newTweet = {
                userId: userId,
                userName: userName,
                userPhoto: photoUrl,
                text: tweetText,
                image: tweetImage,
                isVerified: isVerified,
                likes: 0,
                likedBy: {},
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            return database.ref('tweets').push(newTweet);
        })
        .then(() => {
            tweetInput.value = '';
            document.getElementById('charCount').textContent = '280';
            removeTweetImage();
        })
        .catch(error => {
            console.error('Erro ao postar tweet:', error);
            alert('Erro ao postar tweet');
        });
}

// Função para dar/remover like
function toggleLike(tweetId) {
    const tweetRef = database.ref('tweets/' + tweetId);
    
    tweetRef.once('value')
        .then((snapshot) => {
            const tweet = snapshot.val();
            const likedBy = tweet.likedBy || {};
            
            if (likedBy[userId]) {
                // Remove o like
                likedBy[userId] = null;
                tweetRef.update({
                    likes: (tweet.likes || 0) - 1,
                    likedBy: likedBy
                });
            } else {
                // Adiciona o like
                likedBy[userId] = true;
                tweetRef.update({
                    likes: (tweet.likes || 0) + 1,
                    likedBy: likedBy
                });
            }
        });
}

// Função atualizada para carregar tweets
function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    tweetsContainer.innerHTML = '';
    
    database.ref('tweets')
        .orderByChild('timestamp')
        .on('child_added', (snapshot) => {
            const tweet = snapshot.val();
            const tweetId = snapshot.key;
            const isLiked = tweet.likedBy && tweet.likedBy[userId];
            
            const tweetElement = document.createElement('div');
            tweetElement.className = 'tweet';
            
            const time = new Date(tweet.timestamp).toLocaleString();
            
            tweetElement.innerHTML = `
                <div class="tweet-header">
                    <img src="${tweet.userPhoto}" alt="Foto de perfil">
                    <div class="tweet-name-container">
                        <span class="tweet-name">${tweet.userName}</span>
                        ${tweet.isVerified ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                    </div>
                    <span class="tweet-time">${time}</span>
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

    // Atualizar contagem de likes em tempo real
    database.ref('tweets').on('child_changed', (snapshot) => {
        const tweet = snapshot.val();
        const tweetId = snapshot.key;
        const isLiked = tweet.likedBy && tweet.likedBy[userId];
        
        const likeButton = document.querySelector(`[onclick="toggleLike('${tweetId}')"]`);
        if (likeButton) {
            likeButton.className = `like-button ${isLiked ? 'liked' : ''}`;
            likeButton.querySelector('i').className = `fa-heart ${isLiked ? 'fas' : 'far'}`;
            likeButton.querySelector('.like-count').textContent = tweet.likes || 0;
        }
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

// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    // Configurar usuários verificados
    const verifiedUsers = {
        'BeqiDev': true,
        'ModeradorTop': true,
        'VipUser': true
        // Adicione mais usuários verificados aqui
    };

    database.ref('verifiedUsers').set(verifiedUsers)
        .then(() => {
            console.log('Usuários verificados configurados com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao configurar usuários verificados:', error);
        });

    // Inicializar outras funções
    loadTweets();
    
    // Contador de caracteres
    document.getElementById('tweetInput').addEventListener('input', function() {
        const remaining = 280 - this.value.length;
        document.getElementById('charCount').textContent = remaining;
    });
});

// Função para verificar se um usuário está na lista de verificados
function checkVerified(userId) {
    return database.ref('verifiedUsers/' + userId).once('value')
        .then(snapshot => {
            return snapshot.exists(); // Retorna true se o usuário estiver verificado
        });
}

// Função para adicionar um usuário à lista de verificados
function addVerifiedUser(userId) {
    return database.ref('verifiedUsers/' + userId).set(true)
        .then(() => {
            console.log('Usuário verificado com sucesso!');
            return true;
        })
        .catch(error => {
            console.error('Erro ao verificar usuário:', error);
            return false;
        });
}

// Função para remover a verificação de um usuário
function removeVerifiedUser(userId) {
    return database.ref('verifiedUsers/' + userId).remove()
        .then(() => {
            console.log('Verificação removida com sucesso!');
            return true;
        })
        .catch(error => {
            console.error('Erro ao remover verificação:', error);
            return false;
        });
}

// Função para renderizar um tweet
function renderTweet(tweet, container) {
    checkVerified(tweet.userId).then(isVerified => {
        const tweetElement = document.createElement('div');
        tweetElement.className = `tweet ${tweet.isPinned ? 'pinned' : ''}`;
        
        const time = new Date(tweet.timestamp).toLocaleString();
        
        tweetElement.innerHTML = `
            ${tweet.isPinned ? '<div class="pinned-badge"><i class="fas fa-thumbtack"></i> Tweet Fixado</div>' : ''}
            <div class="tweet-header">
                <img src="${tweet.userPhoto}" alt="Foto de perfil">
                <div class="tweet-name-container">
                    <span class="tweet-name">${tweet.userName}</span>
                    ${isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                </div>
                <span class="tweet-time">${time}</span>
                ${ADMIN_IDS.includes(userId) ? `
                    <button onclick="${isVerified ? 'removeVerifiedUser' : 'addVerifiedUser'}('${tweet.userId}')" 
                            class="verify-button ${isVerified ? 'verified' : ''}">
                        ${isVerified ? 'Remover Verificação' : 'Verificar Usuário'}
                    </button>
                ` : ''}
            </div>
            <div class="tweet-content">${tweet.text}</div>
            ${tweet.image ? `<img src="${tweet.image}" alt="Tweet image" class="tweet-image">` : ''}
            <div class="tweet-actions">
                <button onclick="toggleLike('${tweet.id}')" class="like-button ${tweet.likedBy && tweet.likedBy[userId] ? 'liked' : ''}">
                    <i class="fa-heart ${tweet.likedBy && tweet.likedBy[userId] ? 'fas' : 'far'}"></i>
                    <span class="like-count">${tweet.likes || 0}</span>
                </button>
            </div>
        `;
        
        container.appendChild(tweetElement);
    });
}

// Lista de IDs de administradores que podem verificar usuários (coloque no início do arquivo)
const ADMIN_IDS = ['user_0mgztq1g9']; // Substitua 'seu_id_aqui' pelo seu userId real do Firebase

// Função para verificar se o usuário atual é um administrador
function isAdmin() {
    return ADMIN_IDS.includes(userId);
}

// Função para gerenciar verificação de usuários (apenas para admins)
function manageVerification(targetUserId, shouldVerify) {
    if (!isAdmin()) {
        console.error('Acesso negado: apenas administradores podem gerenciar verificações');
        return;
    }

    if (shouldVerify) {
        addVerifiedUser(targetUserId);
    } else {
        removeVerifiedUser(targetUserId);
    }
}

// Exemplo de uso:
// manageVerification('id_do_usuario', true); // Para verificar um usuário
// manageVerification('id_do_usuario', false); // Para remover a verificação
  