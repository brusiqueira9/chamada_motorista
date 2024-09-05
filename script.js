const lastCallsList = document.getElementById('lastCalls');
const clearListButton = document.getElementById('clearListButton');
const voiceSelect = document.getElementById('voiceSelect');
let ptBrVoices = [];

// Função para exibir os últimos chamados na tela
function displayLastCalls() {
    const lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
    lastCallsList.innerHTML = '';

    lastCalls.forEach(call => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Motorista:</strong> ${call.name}<br>
            <strong>Placa:</strong> ${call.plate}<br>
            <strong>Ação:</strong> ${call.action.charAt(0).toUpperCase() + call.action.slice(1)}<br>
            <strong>Voz:</strong> ${call.voice}<br>
            <button onclick="reCall('${call.name}', '${call.plate}', '${call.action}', '${call.voice}')">
                <i class="fas fa-bell"></i> Chamar Novamente
            </button>
        `;
        lastCallsList.appendChild(listItem);
    });
    console.log("Chamados exibidos na tela:", lastCalls);
}

// Função para formatar a placa
function formatPlate(input) {
    input = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (input.length > 3) {
        input = input.slice(0, 3) + '-' + input.slice(3);
    }

    if (input.length > 6) {
        input = input.slice(0, 6) + ' ' + input.slice(6, 8);
    }

    return input;
}

// Adiciona evento ao campo de entrada da placa
document.getElementById('plate').addEventListener('input', function(event) {
    const formattedPlate = formatPlate(event.target.value);
    event.target.value = formattedPlate;
});

// Função para adicionar um chamado à lista e armazená-lo no localStorage
function addLastCall(name, plate, action, voice) {
    let lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
    console.log('Chamados antes de adicionar:', lastCalls);

    // Verifica se o chamado já existe para evitar duplicatas
    const existingCallIndex = lastCalls.findIndex(call => call.name === name && call.plate === plate && call.action === action && call.voice === voice);
    if (existingCallIndex === -1) {
        // Adiciona o novo chamado à lista
        lastCalls.push({ name, plate, action, voice });

        // Se houver mais de 10 chamados, remove o mais antigo
        if (lastCalls.length > 10) {
            lastCalls.shift();
        }

        // Salva a lista atualizada no localStorage
        localStorage.setItem('lastCalls', JSON.stringify(lastCalls));
        console.log('Chamados após adicionar:', lastCalls);
    } else {
        console.log('Chamado já existente, não adicionado novamente.');
    }

    displayLastCalls(); // Atualiza a lista exibida na tela
}

// Função para chamar o motorista
function callDriver(name, plate, action, selectedVoiceIndex) {
    const parts = [
        `Atenção!`,
        `Chamada para ${action}.`,
        `Motorista ${name}.`,
        `Placa ${plate}.`
    ];

    const audio = new Audio('assets/toque.mp3');
    audio.play().then(() => {
        audio.onended = () => {
            let delay = 0;
            parts.forEach(part => {
                setTimeout(() => {
                    const speech = new SpeechSynthesisUtterance(part);
                    speech.voice = ptBrVoices[selectedVoiceIndex];
                    speech.lang = 'pt-BR';
                    speech.rate = 0.9;
                    window.speechSynthesis.speak(speech);
                }, delay);
                delay += 2000; // Atraso de 2 segundos entre cada parte
            });
        };
    }).catch(error => {
        console.error('Erro ao reproduzir o som:', error);
    });
}

// Função para chamar novamente o motorista
function reCall(name, plate, action, voice) {
    callDriver(name, plate, action, ptBrVoices.findIndex(v => v.name === voice)); // Chama automaticamente ao clicar no botão
}

// Função para listar vozes disponíveis e preenchê-las no select
function listAvailableVoices() {
    const voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';

    ptBrVoices = voices.filter(voice => voice.lang === 'pt-BR');

    ptBrVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang}) ${voice.default ? '(Default)' : ''}`;
        voiceSelect.appendChild(option);
    });

    if (ptBrVoices.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Nenhuma voz em pt-BR disponível';
        voiceSelect.appendChild(option);
    }
}

// Chama a função para preencher as vozes disponíveis quando forem carregadas
window.speechSynthesis.onvoiceschanged = listAvailableVoices;

// Função para limpar a lista de últimos chamados
clearListButton.addEventListener('click', function() {
    localStorage.removeItem('lastCalls');
    displayLastCalls();
});

// Adiciona evento ao formulário de submissão
document.getElementById('announcementForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const plate = document.getElementById('plate').value.trim();
    const action = document.getElementById('action').value;
    const selectedVoiceIndex = voiceSelect.value;

    console.log("Formulário enviado com:", { name, plate, action, selectedVoiceIndex });

    // Verifica se todos os campos estão preenchidos
    if (name && plate && action && selectedVoiceIndex !== "") {
        callDriver(name, plate, action, selectedVoiceIndex);

        // Adiciona o chamado ao localStorage
        const selectedVoice = ptBrVoices[selectedVoiceIndex].name; // Obtém o nome da voz
        addLastCall(name, plate, action, selectedVoice); // Passa a voz utilizada
        console.log("Chamado adicionado ao localStorage:", { name, plate, action, selectedVoice });

        // Limpa os campos do formulário após a chamada
        document.getElementById('announcementForm').reset();

        const button = event.target.querySelector('button');
        button.innerHTML = '<i class="fas fa-check"></i> Chamado!';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-bell"></i> Chamar Motorista';
            button.disabled = false;
        }, 3000);
    } else {
        alert('Por favor, preencha todos os campos.');
        console.error("Campos não preenchidos corretamente.");
    }
});

// Chama a função para exibir os últimos chamados ao carregar a página
displayLastCalls();
