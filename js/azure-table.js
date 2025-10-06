const AZURE_TABLE_CONFIG = {
    baseUrl: 'https://stop1cn2.table.core.windows.net/?sv=2024-11-04&ss=bft&srt=sco&sp=rwdlacuiytfx&se=2025-11-07T05:54:06Z&st=2025-10-06T21:39:06Z&spr=https,http&sig=lCWLP6OPnUByrISGDMxyDk%2FZdE1WdyFkXd0XO9KG5PA%3D',
    headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json',
        'DataServiceVersion': '3.0',
        'MaxDataServiceVersion': '3.0'
    }
};

function makeAzureRequest(method, tableName, partitionKey = '', rowKey = '', data = null) {
    let url = `${AZURE_TABLE_CONFIG.baseUrl}&$table=${tableName}`;
    
    if (partitionKey && rowKey) {
        url += `(PartitionKey='${encodeURIComponent(partitionKey)}',RowKey='${encodeURIComponent(rowKey)}')`;
    }

    const options = {
        method: method,
        headers: AZURE_TABLE_CONFIG.headers
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'MERGE')) {
        options.body = JSON.stringify(data);
    }

    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return method === 'DELETE' ? { success: true } : response.text();
        })
        .then(result => {
            if (typeof result === 'string') {
                return result ? JSON.parse(result) : { success: true };
            }
            return result;
        })
        .catch(error => {
            console.error('Erro na requisição Azure Table Storage:', error);
            throw error;
        });
}

function createEntity(tableName, entity) {
    const entityWithTimestamp = {
        ...entity,
        Timestamp: entity.Timestamp || new Date().toISOString()
    };
    
    return makeAzureRequest('POST', tableName, '', '', entityWithTimestamp);
}

function getAllEntities(tableName, filter = '') {
    let url = `${AZURE_TABLE_CONFIG.baseUrl}&$table=${tableName}`;
    
    if (filter) {
        url += `&$filter=${encodeURIComponent(filter)}`;
    }

    return fetch(url, {
        method: 'GET',
        headers: AZURE_TABLE_CONFIG.headers
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(result => {
        const data = result ? JSON.parse(result) : {};
        return data.value || [];
    })
    .catch(error => {
        console.error('Erro ao buscar entidades:', error);
        throw error;
    });
}

function getEntity(tableName, partitionKey, rowKey) {
    return makeAzureRequest('GET', tableName, partitionKey, rowKey);
}

function updateEntity(tableName, partitionKey, rowKey, entity) {
    const entityWithTimestamp = {
        ...entity,
        Timestamp: new Date().toISOString()
    };
    
    return makeAzureRequest('MERGE', tableName, partitionKey, rowKey, entityWithTimestamp);
}

function deleteEntity(tableName, partitionKey, rowKey) {
    return makeAzureRequest('DELETE', tableName, partitionKey, rowKey);
}

function filterEntities(tableName, property, operator, value) {
    const filter = `${property} ${operator} '${value}'`;
    return getAllEntities(tableName, filter);
}
