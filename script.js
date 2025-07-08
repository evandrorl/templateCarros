// Estado da aplicação
let isEditMode = false;
let originalData = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    saveOriginalData();
    setupEditableElements();
});

// Salva os dados originais para possível reset
function saveOriginalData() {
    const editableTexts = document.querySelectorAll('.editable-text');
    const editableImages = document.querySelectorAll('.editable-image');
    
    editableTexts.forEach(element => {
        originalData[element.id] = element.textContent || element.innerText;
    });
    
    editableImages.forEach(element => {
        originalData[element.id] = element.src;
    });
}

// Configura os elementos editáveis
function setupEditableElements() {
    const editableTexts = document.querySelectorAll('.editable-text');
    
    editableTexts.forEach(element => {
        element.addEventListener('click', function() {
            if (isEditMode) {
                makeTextEditable(this);
            }
        });
        
        element.addEventListener('blur', function() {
            if (isEditMode) {
                finishTextEdit(this);
            }
        });
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

// Torna um elemento de texto editável
function makeTextEditable(element) {
    if (element.contentEditable === 'true') return;
    
    element.contentEditable = 'true';
    element.focus();
    
    // Seleciona todo o texto
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Finaliza a edição de texto
function finishTextEdit(element) {
    element.contentEditable = 'false';
    
    // Remove quebras de linha desnecessárias
    element.innerHTML = element.textContent;
}

// Alterna o modo de edição
function toggleEditMode() {
    isEditMode = !isEditMode;
    const container = document.querySelector('.container');
    const editToggle = document.getElementById('edit-toggle');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const imageUploadSection = document.getElementById('image-upload-section');
    
    if (isEditMode) {
        container.classList.add('edit-mode');
        editToggle.textContent = 'Desativar Edição';
        editToggle.style.background = '#e74c3c';
        saveBtn.style.display = 'block';
        resetBtn.style.display = 'block';
        imageUploadSection.style.display = 'block';
    } else {
        container.classList.remove('edit-mode');
        editToggle.textContent = 'Ativar Edição';
        editToggle.style.background = '#3498db';
        saveBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        imageUploadSection.style.display = 'none';
        
        // Remove contentEditable de todos os elementos
        const editableTexts = document.querySelectorAll('.editable-text');
        editableTexts.forEach(element => {
            element.contentEditable = 'false';
        });
    }
}

// Troca uma imagem
function changeImage(imageId, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const image = document.getElementById(imageId);
            if (image) {
                image.src = e.target.result;
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Salva o template atual
function saveTemplate() {
    const templateData = {
        timestamp: new Date().toISOString(),
        texts: {},
        images: {}
    };
    
    // Coleta dados de texto
    const editableTexts = document.querySelectorAll('.editable-text');
    editableTexts.forEach(element => {
        templateData.texts[element.id] = element.textContent || element.innerText;
    });
    
    // Coleta dados de imagem
    const editableImages = document.querySelectorAll('.editable-image');
    editableImages.forEach(element => {
        templateData.images[element.id] = element.src;
    });
    
    // Salva no localStorage
    localStorage.setItem('carTemplate', JSON.stringify(templateData));
    
    // Feedback visual
    showNotification('Template salvo com sucesso!', 'success');
}

// Reseta o template para os valores originais
function resetTemplate() {
    if (confirm('Tem certeza que deseja resetar todas as alterações?')) {
        // Restaura textos
        Object.keys(originalData).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'IMG') {
                    element.src = originalData[id];
                } else {
                    element.textContent = originalData[id];
                }
            }
        });
        
        // Limpa uploads
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });
        
        showNotification('Template resetado!', 'info');
    }
}

// Carrega template salvo
function loadSavedTemplate() {
    const savedData = localStorage.getItem('carTemplate');
    if (savedData) {
        try {
            const templateData = JSON.parse(savedData);
            
            // Restaura textos
            Object.keys(templateData.texts).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = templateData.texts[id];
                }
            });
            
            // Restaura imagens
            Object.keys(templateData.images).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.src = templateData.images[id];
                }
            });
            
            showNotification('Template carregado!', 'success');
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            showNotification('Erro ao carregar template salvo', 'error');
        }
    }
}

// Mostra notificação
function showNotification(message, type = 'info') {
    // Remove notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Adiciona animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Carrega template salvo ao inicializar (opcional)
// Descomente a linha abaixo se quiser carregar automaticamente
// document.addEventListener('DOMContentLoaded', loadSavedTemplate);

// Exporta funções para uso global
window.toggleEditMode = toggleEditMode;
window.changeImage = changeImage;
window.saveTemplate = saveTemplate;
window.resetTemplate = resetTemplate;
window.loadSavedTemplate = loadSavedTemplate;

