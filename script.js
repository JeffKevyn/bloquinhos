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

// Gerar ID único para usuário (em uma aplicação real, você usaria autenticação)
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

// Adicione no início do arquivo, após a configuração do Firebase
let isVerified = false;

// Carregar perfil do usuário
function loadUserProfile() {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            document.getElementById('userNameInput').value = userData.name || '';
            document.getElementById('profileImage').src = userData.photoUrl || 'https://via.placeholder.com/150';
        }
    });
}

// Atualizar perfil
async function updateProfile() {
    const nameInput = document.getElementById('userNameInput');
    const passwordInput = document.getElementById('userPasswordInput');
    const imageFile = document.getElementById('imageUpload').files[0];
    
    // Verifica a senha
    isVerified = verifiedPasswords[passwordInput.value] || false;
    
    let photoUrl = document.getElementById('profileImage').src;
    
    if (imageFile) {
        const imageRef = storage.ref('profile-images/' + userId);
        imageRef.put(imageFile).then(() => {
            return imageRef.getDownloadURL();
        }).then(url => {
            photoUrl = url;
            saveProfileData(nameInput.value, photoUrl);
        });
    } else {
        saveProfileData(nameInput.value, photoUrl);
    }
}

// Função para salvar dados do perfil
function saveProfileData(name, photoUrl) {
    database.ref('users/' + userId).set({
        name: name,
        photoUrl: photoUrl,
        isVerified: isVerified
    }).then(() => {
        alert('Perfil atualizado!');
    }).catch(error => {
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao atualizar perfil');
    });
}

// Postar tweet
function postTweet() {
    const tweetInput = document.getElementById('tweetInput');
    const tweetText = tweetInput.value.trim();
    
    if (!tweetText) return;

    database.ref('users/' + userId).once('value').then((snapshot) => {
        const userData = snapshot.val();
        
        database.ref('tweets').push({
            userId: userId,
            userName: userData.name || 'Anônimo',
            userPhoto: userData.photoUrl || 'https://via.placeholder.com/150',
            text: tweetText,
            isVerified: userData.isVerified || false,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        tweetInput.value = '';
    });
}

// Carregar tweets
function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    
    database.ref('tweets').orderByChild('timestamp').on('child_added', (snapshot) => {
        const tweet = snapshot.val();
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

// Contador de caracteres
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

// Inicializar
loadUserProfile();
loadTweets();

// Adicione um listener para o botão Enter no textarea
document.getElementById('tweetInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        postTweet();
    }
});

// Verifique se o Firebase está inicializado corretamente
console.log('Firebase Database:', !!database);
console.log('Firebase Storage:', !!storage); 