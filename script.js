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

// Inicialização
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Verificação de inicialização
console.log('Firebase inicializado:', !!auth && !!database);

// Função de teste
function testUISwitch() {
    const chatArea = document.getElementById('chatArea');
    const loginArea = document.getElementById('loginArea');
    
    if (chatArea.style.display === 'none') {
        chatArea.style.display = 'block';
        loginArea.style.display = 'none';
        console.log('Mudando para chat');
    } else {
        chatArea.style.display = 'none';
        loginArea.style.display = 'block';
        console.log('Mudando para login');
    }
}

// Adicione esta função
function updateUIState(user) {
    const chatArea = document.getElementById('chatArea');
    const loginArea = document.getElementById('loginArea');
    const registerArea = document.getElementById('registerArea');

    console.log('Atualizando UI para:', user ? 'usuário logado' : 'usuário deslogado');

    if (user) {
        chatArea.style.display = 'block';
        loginArea.style.display = 'none';
        registerArea.style.display = 'none';
        
        // Atualiza informações do usuário
        database.ref('users/' + user.uid).once('value')
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData) {
                    document.getElementById('userPhoto').src = userData.photoUrl || 'https://via.placeholder.com/150';
                    document.getElementById('userName').textContent = userData.username;
                }
            });

        // Carrega tweets e usuários online
        loadTweets();
        updateOnlineUsers();
    } else {
        chatArea.style.display = 'none';
        loginArea.style.display = 'block';
        registerArea.style.display = 'none';
    }
}

// Modifique o listener de autenticação
auth.onAuthStateChanged((user) => {
    console.log('Estado de autenticação mudou:', user);
    const chatArea = document.getElementById('chatArea');
    const loginArea = document.getElementById('loginArea');
    const registerArea = document.getElementById('registerArea');

    // Mostra a área de chat primeiro
    chatArea.style.display = 'block';

    // Se não houver usuário logado, redireciona para login após um breve delay
    if (!user) {
        setTimeout(() => {
            chatArea.style.display = 'none';
            loginArea.style.display = 'block';
            registerArea.style.display = 'none';
        }, 1000); // 1 segundo de delay
    } else {
        // Usuário está logado
        database.ref('users/' + user.uid).once('value')
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData) {
                    document.getElementById('userPhoto').src = userData.photoUrl || 'https://via.placeholder.com/150';
                    document.getElementById('userName').textContent = userData.username;
                }
            });

        loginArea.style.display = 'none';
        registerArea.style.display = 'none';
        
        // Carrega tweets e usuários online
        loadTweets();
        updateOnlineUsers();
    }
});

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Iniciando login para:', username); // Debug

    if (!username || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    // Adiciona @tweetchat.com ao username para formar o email
    const email = username + '@tweetchat.com';
    console.log('Tentando login com email:', email); // Debug

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Login bem sucedido!', userCredential.user);
            
            // Forçar atualização da UI
            const chatArea = document.getElementById('chatArea');
            const loginArea = document.getElementById('loginArea');
            
            chatArea.style.display = 'block';
            loginArea.style.display = 'none';
        })
        .catch((error) => {
            console.error('Erro no login:', error);
            alert('Erro no login: ' + error.message);
        });
}

// Função para enviar tweet
function sendTweet() {
    const tweetInput = document.getElementById('tweetInput');
    const tweetText = tweetInput.value.trim();
    
    if (!tweetText) return; // Não envia tweets vazios
    
    const user = auth.currentUser;
    if (!user) return; // Verifica se usuário está logado

    // Busca dados do usuário atual
    database.ref('users/' + user.uid).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            
            // Cria novo tweet
            const newTweet = {
                userId: user.uid,
                username: userData.username,
                photoUrl: userData.photoUrl,
                text: tweetText,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // Adiciona ao database
            database.ref('tweets').push(newTweet)
                .then(() => {
                    console.log('Tweet enviado com sucesso');
                    tweetInput.value = ''; // Limpa o input
                })
                .catch(error => console.error('Erro ao enviar tweet:', error));
        });
}

// Função para carregar e mostrar tweets em tempo real
function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    
    // Referência para os últimos 100 tweets, ordenados por timestamp
    const tweetsRef = database.ref('tweets').orderByChild('timestamp').limitToLast(100);
    
    // Listener para novos tweets
    tweetsRef.on('child_added', (snapshot) => {
        const tweet = snapshot.val();
        const tweetId = snapshot.key;
        
        // Cria elemento do tweet
        const tweetElement = document.createElement('div');
        tweetElement.className = 'tweet';
        tweetElement.id = `tweet-${tweetId}`;
        
        // Formata a data
        const tweetDate = new Date(tweet.timestamp);
        const formattedDate = tweetDate.toLocaleString();
        
        tweetElement.innerHTML = `
            <div class="tweet-user-info">
                <img src="${tweet.photoUrl}" alt="Foto de ${tweet.username}" class="tweet-user-photo">
                <span class="tweet-username">${tweet.username}</span>
            </div>
            <div class="tweet-content">
                <p class="tweet-text">${tweet.text}</p>
                <span class="tweet-time">${formattedDate}</span>
            </div>
        `;
        
        // Adiciona o novo tweet no início do container
        tweetsContainer.insertBefore(tweetElement, tweetsContainer.firstChild);
    });

    // Listener para tweets removidos
    tweetsRef.on('child_removed', (snapshot) => {
        const tweetId = snapshot.key;
        const tweetElement = document.getElementById(`tweet-${tweetId}`);
        if (tweetElement) {
            tweetElement.remove();
        }
    });
}

// Adicione estes estilos CSS