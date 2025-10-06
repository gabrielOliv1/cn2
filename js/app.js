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

function showAlert(message, type = 'info') {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const main = document.querySelector('.main');
    if (main) {
        main.insertBefore(alertDiv, main.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
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
    if (!value || value.trim() === '') {
        showAlert(`${fieldName} é obrigatório`, 'danger');
        return false;
    }
    return true;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Email inválido', 'danger');
        return false;
    }
    return true;
}

function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
        showAlert('CPF deve ter 11 dígitos', 'danger');
        return false;
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
        showAlert('CPF inválido', 'danger');
        return false;
    }

    return true;
}

function validatePlaca(placa) {
    placa = placa.replace(/\s/g, '').toUpperCase();
    
    const placaRegex = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    
    if (!placaRegex.test(placa)) {
        showAlert('Formato de placa inválido (ex: ABC1234 ou ABC1D23)', 'danger');
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
