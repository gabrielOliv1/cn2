const AZURE_BLOB_CONFIG = {
    baseUrl: 'https://stop1cn2.blob.core.windows.net/?sv=2024-11-04&ss=bft&srt=sco&sp=rwdlacuiytfx&se=2025-11-07T05:54:06Z&st=2025-10-06T21:39:06Z&spr=https,http&sig=lCWLP6OPnUByrISGDMxyDk%2FZdE1WdyFkXd0XO9KG5PA%3D',
    containerName: 'gabriel-oliveira-veiculos-cn2',
    sasToken: 'sv=2024-11-04&ss=bft&srt=sco&sp=rwdlacuiytfx&se=2025-11-07T05:54:06Z&st=2025-10-06T21:39:06Z&spr=https,http&sig=lCWLP6OPnUByrISGDMxyDk%2FZdE1WdyFkXd0XO9KG5PA%3D'
};

function uploadImage(file, fileName) {
    const url = `${AZURE_BLOB_CONFIG.baseUrl}/${AZURE_BLOB_CONFIG.containerName}/${file.name}?${AZURE_BLOB_CONFIG.sasToken}`;
    
    return fetch(url, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type
        },
        body: file
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro no upload: ${response.status}`);
        }
        return response;
    })
    .then(() => {
        return getImageUrl(fileName);
    })
    .catch(error => {
        console.error('Erro no upload da imagem:', error);
        throw error;
    });
}

function getImageUrl(fileName) {
    return `${AZURE_BLOB_CONFIG.baseUrl}&$container=${AZURE_BLOB_CONFIG.containerName}&$blob=${fileName}`;
}

function deleteImage(fileName) {
    const url = `${AZURE_BLOB_CONFIG.baseUrl}&$container=${AZURE_BLOB_CONFIG.containerName}&$blob=${fileName}`;
    
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
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
        showAlert('Tipo de arquivo não permitido. Use JPG, PNG ou GIF.', 'danger');
        return false;
    }
    
    if (file.size > maxSize) {
        showAlert('Arquivo muito grande. Máximo 5MB.', 'danger');
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
        showAlert('Nenhum arquivo selecionado.', 'danger');
        return;
    }
    
    if (!validateImageFile(file)) {
        return;
    }
    
    const fileName = generateFileName(file.name, 'veiculo_');
    
    showLoading('upload-status');
    
    uploadImage(file, fileName)
        .then(imageUrl => {
            hideLoading('upload-status', 'Upload concluído!');
            if (callback) {
                callback(imageUrl, fileName);
            }
        })
        .catch(error => {
            hideLoading('upload-status', 'Erro no upload');
            showAlert('Erro ao fazer upload da imagem: ' + error.message, 'danger');
        });
}

