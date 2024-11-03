// Função para atualizar perfil sem usar Storage
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

// Função para lidar com upload de imagem usando Base64
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