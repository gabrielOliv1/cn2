async function loadStats() {
    try {
        console.log('Carregando estatísticas...');
        
        const [veiculos, clientes, locacoes] = await Promise.all([
            getAllEntities('Veiculos').catch(() => []),
            getAllEntities('Clientes').catch(() => []),
            getAllEntities('Locacoes').catch(() => [])
        ]);

        updateStatElement('total-vehicles', veiculos.length);
        updateStatElement('total-clients', clientes.length);
        
        const locacoesAtivas = locacoes.filter(locacao => 
            locacao.Status !== 'Finalizada' && locacao.Status !== 'Cancelada'
        );
        updateStatElement('active-rentals', locacoesAtivas.length);

        console.log('Estatísticas carregadas:', {
            veiculos: veiculos.length,
            clientes: clientes.length,
            locacoesAtivas: locacoesAtivas.length
        });

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        
        updateStatElement('total-vehicles', '0');
        updateStatElement('total-clients', '0');
        updateStatElement('active-rentals', '0');
    }
}

function updateStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function showAlert(message) {
    alert(message);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return dateString;
    }
}

function formatCurrency(value) {
    if (value === null || value === undefined) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function validateRequired(value, fieldName) {
    if (!value) {
        showAlert(`${fieldName} é obrigatório`);
        return false;
    }
    return true;
}

function validateEmail(email) {
    if (!email.includes('@')) {
        showAlert('Email inválido');
        return false;
    }
    return true;
}

function validateCPF(cpf) {
    if (cpf.length < 11) {
        showAlert('CPF deve ter 11 dígitos');
        return false;
    }
    return true;
}

function validatePlaca(placa) {
    if (placa.length < 7) {
        showAlert('Placa deve ter pelo menos 7 caracteres');
        return false;
    }
    return true;
}

function initApp() {
    console.log('Car Rental App iniciado');
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div>Carregando...</div>';
    }
}

function hideLoading(elementId, content = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

function navigateTo(page) {
    window.location.href = page;
}

function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', initApp);

window.showAlert = showAlert;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.validateRequired = validateRequired;
window.validateEmail = validateEmail;
window.validateCPF = validateCPF;
window.validatePlaca = validatePlaca;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.navigateTo = navigateTo;
window.goBack = goBack;
