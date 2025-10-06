const AZURE_BLOB_CONFIG = {
    storageAccount: 'stop1cn2',
    containerName: 'gabriel-oliveira-veiculos-cn2',
    sasToken: 'sv=2024-11-04&ss=bft&srt=sco&sp=rwdlacuiytfx&se=2025-11-07T05:54:06Z&st=2025-10-06T21:39:06Z&spr=https,http&sig=lCWLP6OPnUByrISGDMxyDk%2FZdE1WdyFkXd0XO9KG5PA%3D'
};

function uploadImage(file, fileName) {
    // URL correta: https://storageaccount.blob.core.windows.net/container/blob?sasToken
    const url = `https://${AZURE_BLOB_CONFIG.storageAccount}.blob.core.windows.net/${AZURE_BLOB_CONFIG.containerName}/${fileName}?${AZURE_BLOB_CONFIG.sasToken}`;
    
    console.log('🔵 Iniciando upload...');
    console.log('📁 Arquivo:', file.name, 'Tamanho:', file.size, 'bytes');
    console.log('🌐 URL:', url);
    
    return fetch(url, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
    })
    .then(response => {
        console.log('📡 Resposta do servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            return response.text().then(text => {
                console.error('❌ Erro detalhado:', text);
                throw new Error(`Erro no upload: ${response.status} - ${response.statusText}`);
            });
        }
        
        console.log('✅ Upload concluído com sucesso!');
        return response;
    })
    .then(() => {
        return getImageUrl(fileName);
    })
    .catch(error => {
        console.error('💥 Erro no upload da imagem:', error);
        throw error;
    });
}

function getImageUrl(fileName) {
    return `https://${AZURE_BLOB_CONFIG.storageAccount}.blob.core.windows.net/${AZURE_BLOB_CONFIG.containerName}/${fileName}?${AZURE_BLOB_CONFIG.sasToken}`;
}

function deleteImage(fileName) {
    const url = `https://${AZURE_BLOB_CONFIG.storageAccount}.blob.core.windows.net/${AZURE_BLOB_CONFIG.containerName}/${fileName}?${AZURE_BLOB_CONFIG.sasToken}`;
    
    return fetch(url, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao deletar imagem: ${response.status}`);
        }
        return { success: true };
    })
    .catch(error => {
        console.error('Erro ao deletar imagem:', error);
        throw error;
    });
}

function generateFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '');
    return `${prefix}${timestamp}_${cleanName}`;
}

function validateImageFile(file) {
    if (file.size > 5000000) {
        alert('Arquivo muito grande. Máximo 5MB.');
        return false;
    }
    return true;
}

function createImagePreview(file, elementId) {
    const reader = new FileReader();
    const previewElement = document.getElementById(elementId);
    
    reader.onload = function(e) {
        if (previewElement) {
            previewElement.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 150px;">`;
        }
    };
    
    reader.readAsDataURL(file);
}

function handleImageUpload(inputElement, callback) {
    const file = inputElement.files[0];
    
    if (!file) {
        alert('Selecione uma imagem');
        return;
    }
    
    const fileName = 'veiculo_' + Date.now() + '_' + file.name;
    
    uploadImage(file, fileName)
        .then(imageUrl => {
            alert('Upload concluído!');
            if (callback) {
                callback(imageUrl, fileName);
            }
        })
        .catch(error => {
            alert('Erro no upload: ' + error.message);
        });
}

