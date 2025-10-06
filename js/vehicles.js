function createVehicle(vehicleData) {
    const vehicle = {
        PartitionKey: 'Veiculo',
        RowKey: vehicleData.placa,
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

    return createEntity('Veiculos', vehicle);
}

function getAllVehicles() {
    return getAllEntities('Veiculos');
}

function getVehicleByPlaca(placa) {
    return getEntity('Veiculos', 'Veiculo', placa);
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

    return updateEntity('Veiculos', 'Veiculo', placa, updatedData);
}

function deleteVehicle(placa) {
    return deleteEntity('Veiculos', 'Veiculo', placa);
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

    if (!vehicles || vehicles.length === 0) {
        container.innerHTML = '<div>Nenhum veículo encontrado.</div>';
        return;
    }

    let html = `
        <table class="table">
            <thead>
                <tr>
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

    vehicles.forEach(vehicle => {
        html += `
            <tr>
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
}

function loadVehicles() {
    showLoading('vehicles-list');
    
    getAllVehicles()
        .then(vehicles => {
            hideLoading('vehicles-list', '');
            renderVehiclesTable(vehicles, 'vehicles-list');
        })
        .catch(error => {
            hideLoading('vehicles-list', 'Erro ao carregar veículos');
            showAlert('Erro ao carregar veículos: ' + error.message, 'danger');
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

    searchVehicles(marca, modelo, precoMax)
        .then(vehicles => {
            hideLoading('vehicles-list', '');
            renderVehiclesTable(vehicles, 'vehicles-list');
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
