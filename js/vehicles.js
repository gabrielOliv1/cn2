function createVehicle(vehicleData) {
    console.log('🚗 Criando veículo...');
    console.log('📋 Dados recebidos:', vehicleData);
    
    // Garantir que PartitionKey e RowKey existam
    const vehicle = {
        // CHAVES OBRIGATÓRIAS DO AZURE TABLE STORAGE
        PartitionKey: 'VEICULOS',
        RowKey: vehicleData.placa,
        
        // DADOS DO VEÍCULO
        Marca: vehicleData.marca,
        Modelo: vehicleData.modelo,
        Ano: vehicleData.ano,
        Placa: vehicleData.placa,
        Disponivel: vehicleData.disponivel,
        PrecoDiaria: vehicleData.precoDiaria,
        Cor: vehicleData.cor,
        Combustivel: vehicleData.combustivel,
        ImagemUrl: vehicleData.imagemUrl,
        Observacoes: vehicleData.observacoes
    };

    console.log('📊 Dados formatados para Table Storage:', vehicle);
    return createEntity('Veiculos', vehicle);
}

function getAllVehicles() {
    return getAllEntities('Veiculos');
}

function getVehicleByPlaca(placa) {
    return getEntity('Veiculos', 'VEICULOS', placa);
}

function updateVehicle(placa, vehicleData) {
    const updatedData = {
        Marca: vehicleData.marca,
        Modelo: vehicleData.modelo,
        Ano: vehicleData.ano,
        Disponivel: vehicleData.disponivel,
        PrecoDiaria: vehicleData.precoDiaria,
        Cor: vehicleData.cor,
        Combustivel: vehicleData.combustivel,
        ImagemUrl: vehicleData.imagemUrl,
        Observacoes: vehicleData.observacoes
    };

    return updateEntity('Veiculos', 'VEICULOS', placa, updatedData);
}

function deleteVehicle(placa) {
    return deleteEntity('Veiculos', 'VEICULOS', placa);
}

function getAvailableVehicles() {
    return filterEntities('Veiculos', 'Disponivel', 'eq', 'true');
}

function searchVehicles(marca, modelo, precoMax) {
    return getAllVehicles().then(vehicles => {
        return vehicles.filter(vehicle => {
            if (marca && vehicle.Marca !== marca) return false;
            if (modelo && vehicle.Modelo !== modelo) return false;
            if (precoMax && vehicle.PrecoDiaria > precoMax) return false;
            return true;
        });
    });
}

function validateVehicleData(vehicleData) {
    if (!vehicleData.marca) {
        showAlert('Marca é obrigatória', 'danger');
        return false;
    }
    if (!vehicleData.modelo) {
        showAlert('Modelo é obrigatório', 'danger');
        return false;
    }
    if (!vehicleData.placa) {
        showAlert('Placa é obrigatória', 'danger');
        return false;
    }
    if (!vehicleData.precoDiaria) {
        showAlert('Preço é obrigatório', 'danger');
        return false;
    }
    return true;
}

function renderVehiclesTable(vehicles, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    console.log('🖼️ Renderizando tabela de veículos...');
    console.log('📊 Dados recebidos:', vehicles);

    // Verificar se vehicles tem propriedade value (resposta do Azure)
    const vehiclesList = vehicles.value || vehicles;

    if (!vehiclesList || vehiclesList.length === 0) {
        container.innerHTML = '<div>Nenhum veículo encontrado.</div>';
        return;
    }

    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Placa</th>
                    <th>Marca/Modelo</th>
                    <th>Ano</th>
                    <th>Preço Diária</th>
                    <th>Disponível</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    vehiclesList.forEach(vehicle => {
        console.log('🔍 Processando veículo:', vehicle.Placa);
        console.log('🖼️ URL da imagem:', vehicle.ImagemUrl);
        
        html += `
            <tr>
                <td id="img-${vehicle.Placa}">Carregando...</td>
                <td>${vehicle.Placa}</td>
                <td>${vehicle.Marca} ${vehicle.Modelo}</td>
                <td>${vehicle.Ano}</td>
                <td>${formatCurrency(vehicle.PrecoDiaria)}</td>
                <td>${vehicle.Disponivel ? 'Sim' : 'Não'}</td>
                <td>
                    <button onclick="editVehicle('${vehicle.Placa}')">Editar</button>
                    <button onclick="deleteVehicleConfirm('${vehicle.Placa}')">Excluir</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
    
    // Carregar imagens após renderizar a tabela
    loadVehicleImages(vehiclesList);
}

function loadVehicleImages(vehicles) {
    console.log('🖼️ Carregando imagens dos veículos...');
    console.log(`📊 ${vehicles.length} veículos para processar`);
    
    vehicles.forEach(vehicle => {
        const imgContainer = document.getElementById(`img-${vehicle.Placa}`);
        if (!imgContainer) {
            console.log(`❌ Container não encontrado para placa: ${vehicle.Placa}`);
            return;
        }
        
        console.log(`🔍 Processando veículo: ${vehicle.Placa}`);
        console.log(`📋 Dados do veículo:`, vehicle);
        
        if (vehicle.ImagemUrl) {
            console.log(`🖼️ URL da imagem: ${vehicle.ImagemUrl}`);
            
            // Criar elemento img com tratamento de erro
            const img = document.createElement('img');
            img.style.maxWidth = '80px';
            img.style.maxHeight = '60px';
            img.style.border = '1px solid #ccc';
            img.src = vehicle.ImagemUrl;
            
            img.onload = function() {
                console.log(`✅ Imagem carregou com sucesso: ${vehicle.Placa}`);
                imgContainer.innerHTML = '';
                imgContainer.appendChild(img);
            };
            
            img.onerror = function() {
                console.log(`❌ Erro ao carregar imagem: ${vehicle.Placa}`);
                console.log(`🔗 URL que falhou: ${vehicle.ImagemUrl}`);
                imgContainer.innerHTML = '<div style="width: 80px; height: 60px; background: #f0f0f0; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px;">Erro ao carregar</div>';
            };
        } else {
            console.log(`ℹ️ Veículo sem imagem: ${vehicle.Placa}`);
            imgContainer.innerHTML = '<div style="width: 80px; height: 60px; background: #f0f0f0; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px;">Sem foto</div>';
        }
    });
    
    console.log('✅ Processamento de imagens concluído');
}

function loadVehicles() {
    showLoading('vehicles-list');
    
    getAllVehicles()
        .then(vehicles => {
            hideLoading('vehicles-list', '');
            // Verificar se vehicles tem propriedade value (resposta do Azure)
            const vehiclesList = vehicles.value || vehicles;
            renderVehiclesTable(vehiclesList, 'vehicles-list');
        })
        .catch(error => {
            hideLoading('vehicles-list', 'Erro ao carregar veículos');
            showAlert('Erro ao carregar veículos: ' + error.message);
        });
}

function saveVehicle() {
    const form = document.getElementById('vehicle-form');
    if (!form) return;

    const vehicleData = {
        marca: form.marca.value,
        modelo: form.modelo.value,
        ano: form.ano.value,
        placa: form.placa.value,
        precoDiaria: form.precoDiaria.value,
        cor: form.cor.value,
        combustivel: form.combustivel.value,
        observacoes: form.observacoes.value,
        disponivel: form.disponivel.checked,
        imagemUrl: form.imagemUrl.value
    };

    if (!validateVehicleData(vehicleData)) {
        return;
    }

    const isEditing = form.isEditing.value === 'true';
    const originalPlaca = form.originalPlaca.value;

    if (isEditing) {
        updateVehicle(originalPlaca, vehicleData)
            .then(() => {
                showAlert('Veículo atualizado!');
                loadVehicles();
                clearVehicleForm();
            })
            .catch(error => {
                showAlert('Erro: ' + error.message);
            });
    } else {
        createVehicle(vehicleData)
            .then(() => {
                showAlert('Veículo cadastrado!');
                loadVehicles();
                clearVehicleForm();
            })
            .catch(error => {
                showAlert('Erro: ' + error.message);
            });
    }
}

function editVehicle(placa) {
    getVehicleByPlaca(placa)
        .then(vehicle => {
            const form = document.getElementById('vehicle-form');
            if (!form) return;

            form.marca.value = vehicle.Marca;
            form.modelo.value = vehicle.Modelo;
            form.ano.value = vehicle.Ano;
            form.placa.value = vehicle.Placa;
            form.precoDiaria.value = vehicle.PrecoDiaria;
            form.cor.value = vehicle.Cor;
            form.combustivel.value = vehicle.Combustivel;
            form.observacoes.value = vehicle.Observacoes;
            form.disponivel.checked = vehicle.Disponivel;
            form.imagemUrl.value = vehicle.ImagemUrl;

            form.isEditing.value = 'true';
            form.originalPlaca.value = vehicle.Placa;

            document.getElementById('vehicle-form-title').textContent = 'Editar Veículo';
            document.getElementById('save-vehicle-btn').textContent = 'Atualizar';
        })
        .catch(error => {
            showAlert('Erro: ' + error.message);
        });
}

function deleteVehicleConfirm(placa) {
    if (confirm('Excluir veículo?')) {
        deleteVehicle(placa)
            .then(() => {
                showAlert('Veículo excluído!');
                loadVehicles();
            })
            .catch(error => {
                showAlert('Erro: ' + error.message);
            });
    }
}

function clearVehicleForm() {
    const form = document.getElementById('vehicle-form');
    if (!form) return;

    form.reset();
    form.isEditing.value = 'false';
    form.originalPlaca.value = '';

    document.getElementById('vehicle-form-title').textContent = 'Cadastrar Veículo';
    document.getElementById('save-vehicle-btn').textContent = 'Salvar';
    document.getElementById('image-preview').innerHTML = '';
}

function searchVehiclesForm() {
    const marca = document.getElementById('search-marca').value;
    const modelo = document.getElementById('search-modelo').value;
    const precoMax = document.getElementById('search-preco').value;

    showLoading('vehicles-list');

    // Buscar todos os veículos e filtrar localmente
    getAllVehicles()
        .then(vehicles => {
            let filteredVehicles = vehicles.value || vehicles;
            
            if (marca) {
                filteredVehicles = filteredVehicles.filter(v => v.Marca.toLowerCase().includes(marca.toLowerCase()));
            }
            if (modelo) {
                filteredVehicles = filteredVehicles.filter(v => v.Modelo.toLowerCase().includes(modelo.toLowerCase()));
            }
            if (precoMax) {
                filteredVehicles = filteredVehicles.filter(v => v.PrecoDiaria <= parseFloat(precoMax));
            }
            
            hideLoading('vehicles-list', '');
            renderVehiclesTable(filteredVehicles, 'vehicles-list');
        })
        .catch(error => {
            hideLoading('vehicles-list', 'Erro na busca');
            showAlert('Erro: ' + error.message);
        });
}

function handleVehicleImageUpload() {
    const input = document.getElementById('vehicle-image-input');
    if (!input || !input.files[0]) {
        alert('Selecione uma imagem');
        return;
    }

    const file = input.files[0];
    const fileName = 'veiculo_' + Date.now() + '_' + file.name;
    
    console.log('Iniciando upload de imagem do veículo...');
    console.log('Arquivo:', file.name, 'Tamanho:', file.size, 'bytes');
    
    uploadImage(file, fileName)
        .then(imageUrl => {
            console.log('Upload da imagem do veículo concluído!');
            console.log('URL:', imageUrl);
            
            document.getElementById('vehicle-imagem-url').value = imageUrl;
            document.getElementById('image-preview').innerHTML = `<img src="${imageUrl}" style="max-width: 200px; max-height: 150px; border: 1px solid #ccc;">`;
            
            alert('Imagem enviada com sucesso!');
        })
        .catch(error => {
            console.error('Erro no upload da imagem do veículo:', error);
            alert('Erro no upload da imagem: ' + error.message);
        });
}

// Função de teste para Table Storage
function testTableStorage() {
    console.log('🧪 Testando Table Storage...');
    
    const testVehicle = {
        PartitionKey: 'VEICULOS',
        RowKey: 'TEST' + Date.now(),
        Marca: 'Teste',
        Modelo: 'Debug',
        Ano: 2024,
        Placa: 'TEST' + Date.now(),
        PrecoDiaria: 100.00,
        Cor: 'Branco',
        Combustivel: 'Gasolina',
        Observacoes: 'Veículo de teste',
        Disponivel: true,
        ImagemUrl: 'https://stop1cn2.blob.core.windows.net/gabriel-oliveira-veiculos-cn2/test.jpg'
    };
    
    console.log('📋 Dados do teste:', testVehicle);
    
    return createEntity('Veiculos', testVehicle)
        .then(result => {
            console.log('✅ Veículo criado com sucesso!');
            console.log('📊 Resultado:', result);
            return getAllEntities('Veiculos');
        })
        .then(entities => {
            console.log('✅ Busca de veículos funcionou!');
            console.log('📊 Quantidade encontrada:', entities.value ? entities.value.length : 0);
            console.log('📋 Dados:', entities);
            return entities;
        })
        .catch(error => {
            console.error('❌ Erro no teste:', error);
            console.error('🔍 Detalhes:', error.message);
            throw error;
        });
}
