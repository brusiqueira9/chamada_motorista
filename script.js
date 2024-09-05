const lastCallsList = document.getElementById('lastCalls');
const clearListButton = document.getElementById('clearListButton');

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
            <button onclick="reCall('${call.name}', '${call.plate}', '${call.action}')">
                <i class="fas fa-bell"></i> Chamar Novamente
            </button>
        `;
        lastCallsList.appendChild(listItem);
    });
}

// Chama a função para exibir os últimos chamados ao carregar a página
displayLastCalls();

// Função para formatar a placa
function formatPlate(input) {
    // Remove caracteres que não são letras ou números
    input = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Adiciona o formato "XXX-XX 99"
    if (input.length > 3) {
        input = input.slice(0, 3) + '-' + input.slice(3);
    }
    
    // Se a entrada for maior que 7, formata para "XXX-XX 99"
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

document.getElementById('announcementForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const plate = document.getElementById('plate').value.trim();
    const action = document.getElementById('action').value;

    if (name && plate && action) {
        callDriver(name, plate, action); // Chama a função para fazer a chamada

        // Limpa os campos do formulário após a chamada
        document.getElementById('announcementForm').reset();

        // Adiciona o chamado ao localStorage
        addLastCall(name, plate, action);

        // Feedback visual
        const button = event.target.querySelector('button');
        button.innerHTML = '<i class="fas fa-check"></i> Chamado!'; // Ícone de sucesso
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-bell"></i> Chamar Motorista';
            button.disabled = false;
        }, 3000); // Redefine o botão após 3 segundos
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});

// Função para adicionar um chamado à lista e armazená-lo no localStorage
function addLastCall(name, plate, action) {
    const lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];

    // Adiciona o novo chamado
    lastCalls.push({ name, plate, action });

    // Limita a 10 últimos chamados
    if (lastCalls.length > 10) {
        lastCalls.shift(); // Remove o primeiro se exceder 10
    }

    // Atualiza o localStorage
    localStorage.setItem('lastCalls', JSON.stringify(lastCalls));

    // Atualiza a lista na tela
    displayLastCalls();
}

// Função para chamar novamente o motorista
function reCall(name, plate, action) {
    callDriver(name, plate, action); // Chama automaticamente ao clicar no botão
}

// Função para chamar o motorista
function callDriver(name, plate, action) {
    const message = `Atenção! Chamada para ${action}, motorista ${name}. Placa ${plate}.`;

    // Quebrando a mensagem em partes para adicionar pausas
    const parts = [
        `Atenção!`,
        `Chamada para ${action}.`,
        `Motorista ${name}.`,
        `Placa ${plate}.`
    ];

    // Reproduz o som de atenção
    const audio = new Audio('assets/toque.mp3'); 
    audio.play().then(() => {
        audio.onended = () => {
            // Som foi reproduzido, agora executa as partes da mensagem
            let delay = 0; // Inicializa o atraso
            parts.forEach(part => {
                setTimeout(() => {
                    const speech = new SpeechSynthesisUtterance(part);
                    speech.lang = 'pt-BR';
                    speech.rate = 0.9; // Ajuste a velocidade aqui
                    window.speechSynthesis.speak(speech);
                }, delay);
                delay += 2000; // Aumenta o atraso (2000 ms = 2 segundos)
            });
        };
    }).catch(error => {
        console.error('Erro ao reproduzir o som:', error);
    });
}

// Função para limpar a lista de últimos chamados
clearListButton.addEventListener('click', function() {
    localStorage.removeItem('lastCalls'); // Remove os últimos chamados do localStorage
    displayLastCalls(); // Atualiza a lista na tela
});
