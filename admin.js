// Configuração dos usuários verificados
function setupVerifiedUsers() {
    const verifiedUsers = {
        'BeqiDev': {
            password: 'admin123',
            badge: '✓'
        },
        'ModeradorTop': {
            password: 'mod456',
            badge: '✓'
        },
        'VipUser': {
            password: 'vip789',
            badge: '✓'
        }
    };

    console.log('Configurando usuários verificados...'); // Debug
    
    database.ref('verifiedUsers').set(verifiedUsers)
        .then(() => {
            console.log('Usuários verificados registrados com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao registrar usuários:', error);
        });
}

// Executar a função
setupVerifiedUsers(); 