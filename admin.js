// Este arquivo deve ser executado uma vez para configurar os usuários verificados
function setupVerifiedUsers() {
    const verifiedUsers = {
        'BeqiDev': {
            password: 'admin123',
            badge: '✓',
            role: 'admin'
        },
        'ModeradorTop': {
            password: 'mod456',
            badge: '✓',
            role: 'moderator'
        },
        'VipUser': {
            password: 'vip789',
            badge: '✓',
            role: 'vip'
        }
    };

    // Salvar no Firebase
    const database = firebase.database();
    database.ref('verifiedUsers').set(verifiedUsers)
        .then(() => console.log('Usuários verificados registrados com sucesso!'))
        .catch(error => console.error('Erro ao registrar usuários:', error));
}

// Executando a função automaticamente
setupVerifiedUsers(); 