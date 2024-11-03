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

// Gerar ID único para usuário
const userId = 'user_' + Math.random().toString(36).substr(2, 9);

// Função para atualizar perfil
async function updateProfile() {
    const nameInput = document.getElementById('userNameInput');
    const passwordInput = document.getElementById('userPasswordInput');
    const username = nameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log('Tentando verificar usuário:', username);
    console.log('Com senha:', password);

    try {
        // Buscar usuário verificado
        const verifiedSnapshot = await database.ref('verifiedUsers').child(username).once('value');
        const verifiedData = verifiedSnapshot.val();
        
        console.log('Dados encontrados:', verifiedData);

        // Verificar se o usuário existe e a senha está correta
        isVerified = verifiedData && verifiedData.password === password;
        
        console.log('Senha do banco:', verifiedData?.password);
        console.log('Senha fornecida:', password);
        console.log('É verificado?', isVerified);

        // Atualizar perfil
        let photoUrl = document.getElementById('profileImage').src;
        
        await database.ref('users/' + userId).set({
            name: username,
            photoUrl: photoUrl,
            isVerified: isVerified
        });

        // Atualizar UI
        if (isVerified) {
            document.getElementById('profileVerifiedBadge').style.display = 'inline-flex';
            alert('Perfil verificado e atualizado com sucesso!');
        } else {
            document.getElementById('profileVerifiedBadge').style.display = 'none';
            alert('Perfil atualizado! (Não verificado)');
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar perfil: ' + error.message);
    }
}

// Função para lidar com upload de imagem
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

// Função para postar tweet
function postTweet() {
    const tweetInput = document.getElementById('tweetInput');
    const tweetText = tweetInput.value.trim();
    
    if (!tweetText) return;

    database.ref('users/' + userId).once('value')
        .then((snapshot) => {
            const userData = snapshot.val() || {};
            
            return database.ref('tweets').push({
                userId: userId,
                userName: userData.name || 'Anônimo',
                userPhoto: userData.photoUrl || 'https://via.placeholder.com/150',
                text: tweetText,
                isVerified: userData.isVerified || false,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .then(() => {
            tweetInput.value = '';
            document.getElementById('charCount').textContent = '280';
        })
        .catch(error => {
            console.error('Erro ao postar tweet:', error);
            alert('Erro ao postar tweet');
        });
}

// Carregar tweets
function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    
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

// Inicializar
loadTweets();

// Contador de caracteres
document.getElementById('tweetInput').addEventListener('input', function() {
    const remaining = 280 - this.value.length;
    document.getElementById('charCount').textContent = remaining;
}); 