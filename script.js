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
            <strong>Data e Hora:</strong> ${call.timestamp}<br> <!-- Adicionado campo de data e hora -->
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

    // Captura a data e hora do chamado
    const timestamp = new Date().toLocaleString();

    // Verifica se o chamado já existe para evitar duplicatas
    const existingCallIndex = lastCalls.findIndex(call => call.name === name && call.plate === plate && call.action === action && call.voice === voice);
    if (existingCallIndex === -1) {
        // Adiciona o novo chamado à lista
        lastCalls.push({ name, plate, action, voice, timestamp }); // Adiciona o timestamp

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

// Função para exportar relatório de chamadas em PDF
document.getElementById('exportPdf').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Adiciona logo (opcional)
    const logoURL = 'assets/logoagrocp.png'; // URL da logo
    const logoWidth = 50; 
    const logoHeight = 20;
    doc.addImage(logoURL, 'PNG', 10, 10, logoWidth, logoHeight);

    // Título estilizado
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 104, 55); // Cor do texto
    doc.text("Relatório de Chamadas", 105, 30, { align: 'center' });

    // Subtítulo com data e hora
    const now = new Date();
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100); // Cor do texto do subtítulo
    doc.text(`Relatório gerado em: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, 40, { align: 'center' });

    // Dados do histórico
    const history = JSON.parse(localStorage.getItem('lastCalls')) || []; // Alterado para 'lastCalls'

    // Verifica se os dados estão corretos
    console.log('Histórico de Chamados:', history); // Log para verificar se há dados

    if (history.length === 0) {
        alert('Nenhum chamado encontrado no histórico.');
        return; // Para o processo se não houver chamados
    }

   // Configurações da tabela com bordas e cores
doc.autoTable({
    startY: 50,
    head: [['Data e Hora', 'Motorista', 'Placa', 'Ação']], // Cabeçalho
    body: history.map(call => [
        call.timestamp, // Data e Hora
        call.name, // Motorista
        formatPlate(call.plate), // Placa formatada
        call.action.charAt(0).toUpperCase() + call.action.slice(1) // Ação formatada
    ]),
    theme: 'grid', // Estilo de grid
    headStyles: { 
        fillColor: [17, 104, 55], // Cor verde principal
        textColor: [255, 255, 255], // Cor do texto branco
        font: 'helvetica', 
        fontStyle: 'bold' 
    }, // Estilo do cabeçalho
    styles: { 
        fillColor: [242, 242, 242], // Cor de fundo das células
        textColor: [100, 100, 100] // Cor do texto verde principal
    }, // Estilo das células
});


    // Rodapé
    const footerText = 'Relatório gerado automaticamente. Todos os direitos reservados.';
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100); // Cor do texto do rodapé
        doc.text(footerText, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Salva o PDF
    doc.save('relatorio_chamados.pdf');
});
