// Configuração simplificada do Azure Table Storage
const AZURE_TABLE_CONFIG = {
    storageAccount: 'stop1cn2',
    sasToken: 'sv=2024-11-04&ss=bft&srt=sco&sp=rwdlacuiytfx&se=2025-11-07T05:54:06Z&st=2025-10-06T21:39:06Z&spr=https,http&sig=lCWLP6OPnUByrISGDMxyDk%2FZdE1WdyFkXd0XO9KG5PA%3D',
    tableName: 'Veiculos'
};

// Função para criar URL da tabela
function getTableUrl(operation = '') {
    const baseUrl = `https://${AZURE_TABLE_CONFIG.storageAccount}.table.core.windows.net/${AZURE_TABLE_CONFIG.tableName}`;
    const sasToken = AZURE_TABLE_CONFIG.sasToken;
    
    if (operation) {
        return `${baseUrl}(${operation})?${sasToken}`;
    }
    return `${baseUrl}?${sasToken}`;
}

// Função para fazer requisições HTTP
async function makeRequest(url, method = 'GET', data = null) {
    console.log(`${method} ${url}`);
    if (data) {
        console.log('Dados:', data);
    }
    
    const options = {
        method: method,
        headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-Type': 'application/json',
            'DataServiceVersion': '3.0',
            'MaxDataServiceVersion': '3.0'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        console.log(`Resposta: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro da API:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.text();
        return result ? JSON.parse(result) : { success: true };
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Criar entidade
function createEntity(tableName, entity) {
    console.log('➕ Criando entidade...');
    
    // Verificar se PartitionKey e RowKey existem
    if (!entity.PartitionKey || !entity.RowKey) {
        console.error('PartitionKey e RowKey são obrigatórios!');
        console.error('Dados recebidos:', entity);
        throw new Error('PartitionKey e RowKey são obrigatórios para Azure Table Storage');
    }
    
    // Adicionar timestamp se não existir
    const entityWithTimestamp = {
        ...entity,
        Timestamp: entity.Timestamp || new Date().toISOString()
    };
    
    console.log('Dados formatados para Table Storage:', entityWithTimestamp);
    
    const url = getTableUrl();
    return makeRequest(url, 'POST', entityWithTimestamp);
}

// Buscar todas as entidades
function getAllEntities(tableName, filter = '') {
    console.log('🔍 Buscando todas as entidades...');
    
    let url = getTableUrl();
    if (filter) {
        url += `&$filter=${encodeURIComponent(filter)}`;
    }
    
    return makeRequest(url, 'GET');
}

// Buscar entidade específica
function getEntity(tableName, partitionKey, rowKey) {
    console.log(`Buscando entidade: ${partitionKey}/${rowKey}`);
    
    const operation = `PartitionKey='${encodeURIComponent(partitionKey)}',RowKey='${encodeURIComponent(rowKey)}'`;
    const url = getTableUrl(operation);
    
    return makeRequest(url, 'GET');
}

// Atualizar entidade
function updateEntity(tableName, partitionKey, rowKey, entity) {
    console.log(`Atualizando entidade: ${partitionKey}/${rowKey}`);
    
    const operation = `PartitionKey='${encodeURIComponent(partitionKey)}',RowKey='${encodeURIComponent(rowKey)}'`;
    const url = getTableUrl(operation);
    
    const entityWithTimestamp = {
        ...entity,
        Timestamp: new Date().toISOString()
    };
    
    return makeRequest(url, 'MERGE', entityWithTimestamp);
}

// Deletar entidade
function deleteEntity(tableName, partitionKey, rowKey) {
    console.log(`Deletando entidade: ${partitionKey}/${rowKey}`);
    
    const operation = `PartitionKey='${encodeURIComponent(partitionKey)}',RowKey='${encodeURIComponent(rowKey)}'`;
    const url = getTableUrl(operation);
    
    return makeRequest(url, 'DELETE');
}

// Filtrar entidades
function filterEntities(tableName, property, operator, value) {
    console.log(`🔍 Filtrando: ${property} ${operator} ${value}`);
    
    const filter = `${property} ${operator} '${value}'`;
    return getAllEntities(tableName, filter);
}

// Função de teste
function testTableStorage() {
    console.log('Testando Table Storage...');
    
    const testEntity = {
        PartitionKey: 'Teste',
        RowKey: 'test_' + Date.now(),
        Nome: 'Teste de Entidade',
        Valor: 123.45,
        Ativo: true
    };
    
    return createEntity('Veiculos', testEntity)
        .then(result => {
            console.log('Teste de criação passou:', result);
            return getAllEntities('Veiculos');
        })
        .then(entities => {
            console.log('Teste de busca passou:', entities);
            return entities;
        })
        .catch(error => {
            console.error('Teste falhou:', error);
            throw error;
        });
}