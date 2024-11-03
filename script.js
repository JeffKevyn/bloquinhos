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

// Função para gerar um novo ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Função para obter ou criar um ID persistente
function getPersistentUserId() {
    // Tenta obter o ID existente do localStorage
    let storedId = localStorage.getItem('userId');
    
    // Se não existir, cria um novo ID e salva
    if (!storedId) {
        storedId = generateUserId();
        localStorage.setItem('userId', storedId);
    }
    
    return storedId;
}

// Usar o ID persistente em vez de gerar um novo a cada vez
const userId = getPersistentUserId();

// Adicione isso logo após a definição do userId
console.log('Seu ID de usuário é:', userId);

// Adicione um botão na interface para mostrar o ID
document.addEventListener('DOMContentLoaded', function() {
    const header = document.createElement('div');
    header.style.padding = '10px';
    header.style.backgroundColor = '#1DA1F2';
    header.style.color = 'white';
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <p>Seu ID de usuário: ${userId}</p>
        <button onclick="copyUserId()" style="padding: 5px 10px;">Copiar ID</button>
    `;
    
    // Inserir antes do container de tweets
    const tweetsContainer = document.getElementById('tweetsContainer');
    tweetsContainer.parentNode.insertBefore(header, tweetsContainer);
});

// Função para copiar o ID
function copyUserId() {
    navigator.clipboard.writeText(userId).then(() => {
        alert('ID copiado para a área de transferência!');
    });
}

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
            
            // Verifica se o usuário é admin
            database.ref('UserADM/' + tweet.userId).once('value')
                .then((snapshot) => {
                    const isAdmin = snapshot.exists();
                    const adminData = snapshot.val() || {};
                    
                    const tweetElement = document.createElement('div');
                    tweetElement.className = 'tweet';
                    
                    const time = new Date(tweet.timestamp).toLocaleString();
                    
                    tweetElement.innerHTML = `
                        <div class="tweet-header">
                            <img src="${tweet.userPhoto}" alt="Foto de perfil">
                            <div class="tweet-name-container">
                                <span class="tweet-name">${tweet.userName}</span>
                                ${isAdmin ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                                ${adminData.dev ? '<i class="fas fa-code dev-badge"></i>' : ''}
                                ${adminData.premium ? '<i class="fas fa-crown premium-badge"></i>' : ''}
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
    // Configurar usuários admin
    const adminUsers = {
        'user_dkc0ec011': {  // Admin principal
            verified: true,
            dev: true,
            premium: true
        },
        'user_qaunowfad': {  // Novo usuário verificado
            verified: true,
            dev: false,
            premium: false
        },
        'user_abc123': {     
            verified: true,
            premium: true
        },
        'user_xyz789': {
            verified: true,
            dev: true
        }
        // Adicione mais usuários admin aqui
    };

    // Criar ou atualizar o nó UserADM
    database.ref('UserADM').set(adminUsers)
        .then(() => {
            console.log('Usuários admin configurados com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao configurar usuários admin:', error);
        });

    // Inicializar outras funções
    loadTweets();
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

// Sistema de Verificação por ID
const ADMIN_IDS = ['user_dkc0ec011']; // Substitua pelo seu ID real

// Função para verificar usuário por ID
function verifyUser(targetUserId) {
    if (!ADMIN_IDS.includes(userId)) {
        alert('Você não é admin!');
        return;
    }
    
    database.ref('verifiedUsers/' + targetUserId).set(true)
        .then(() => {
            alert('Usuário verificado com sucesso!');
            loadTweets();
        })
        .catch(error => {
            alert('Erro ao verificar usuário: ' + error.message);
        });
}

// Função para remover verificação
function unverifyUser(targetUserId) {
    if (!ADMIN_IDS.includes(userId)) {
        alert('Você não é admin!');
        return;
    }
    
    database.ref('verifiedUsers/' + targetUserId).remove()
        .then(() => {
            alert('Verificação removida com sucesso!');
            loadTweets();
        })
        .catch(error => {
            alert('Erro ao remover verificação: ' + error.message);
        });
}

// Função para renderizar tweet
function renderTweet(tweet, container) {
    const tweetElement = document.createElement('div');
    tweetElement.className = 'tweet';
    
    // Verifica se o usuário está verificado pelo ID
    database.ref('verifiedUsers/' + tweet.userId).once('value')
        .then(snapshot => {
            const isVerified = snapshot.exists();
            
            tweetElement.innerHTML = `
                <div class="tweet-header">
                    <img src="${tweet.userPhoto}" alt="Foto de perfil">
                    <div class="tweet-name-container">
                        <span class="tweet-name">${tweet.userName}</span>
                        ${isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                    </div>
                    ${ADMIN_IDS.includes(userId) ? `
                        <button onclick="${isVerified ? 'unverifyUser' : 'verifyUser'}('${tweet.userId}')" 
                                class="verify-button">
                            ${isVerified ? 'Remover Verificação' : 'Verificar Usuário'}
                        </button>
                    ` : ''}
                </div>
                <div class="tweet-content">${tweet.text}</div>
                <div class="tweet-actions">
                    <button onclick="toggleLike('${tweet.id}')" class="like-button">
                        <i class="fas fa-heart"></i>
                        <span>${tweet.likes || 0}</span>
                    </button>
                </div>
            `;
            
            container.appendChild(tweetElement);
        });
}

// Adicione estes estilos CSS
const styles = `
    .verified-badge {
        color: #1DA1F2;
        margin-left: 4px;
        font-size: 14px;
    }

    .dev-badge {
        color: #6e5494;
        margin-left: 4px;
        font-size: 14px;
    }

    .premium-badge {
        color: #FFD700;
        margin-left: 4px;
        font-size: 14px;
    }

    .tweet-name-container {
        display: flex;
        align-items: center;
    }
`;

// Adiciona os estilos à página
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
  