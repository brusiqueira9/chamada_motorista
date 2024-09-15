const lastCallsList = document.getElementById('lastCalls');
const clearListButton = document.getElementById('clearListButton');
const voiceSelect = document.getElementById('voiceSelect');
const plateInput = document.getElementById('plate');
const nameInput = document.getElementById('name');
const suggestionsContainer = document.getElementById('suggestions');
const fileInput = document.getElementById('uploadFile');

let ptBrVoices = [];
let driversData = []; // Dados de motoristas e placas

console.log("Elementos iniciais capturados:", { lastCallsList, clearListButton, voiceSelect, fileInput });

// Função para exibir os últimos chamados na tela
function displayLastCalls() {
    console.log("Função displayLastCalls chamada");
    const lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
    console.log("Últimos chamados do localStorage:", lastCalls);
    lastCallsList.innerHTML = '';

    lastCalls.forEach(call => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Motorista:</strong> ${call.name}<br>
            <strong>Placa:</strong> ${call.plate}<br>
            <strong>Ação:</strong> ${call.action.charAt(0).toUpperCase() + call.action.slice(1)}<br>
            <strong>Data e Hora:</strong> ${call.timestamp}<br>
            <button onclick="reCall('${call.name}', '${call.plate}', '${call.action}', '${call.voice}')">
                <i class="fas fa-bell"></i> Chamar Novamente
            </button>
        `;
        lastCallsList.appendChild(listItem);
        console.log("Chamado exibido na lista:", call);
    });
}

// Função para formatar a placa no formato XXX-XXXX
function formatPlate(input) {
    console.log("Função formatPlate chamada com input:", input);
    // Remove todos os caracteres que não são letras ou números e transforma em maiúsculas
    input = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Se houver mais de 3 caracteres, insere um hífen após os 3 primeiros
    if (input.length > 3) {
        input = input.slice(0, 3) + '-' + input.slice(3, 7); // Garante que a placa seja no formato XXX-XXXX
    }

    // Limita a placa a no máximo 7 caracteres (XXX-XXXX)
    input = input.slice(0, 8);

    console.log("Placa formatada:", input);
    return input;
}


// Adiciona evento ao campo de entrada da placa
document.getElementById('plate').addEventListener('input', function(event) {
    console.log("Evento input na placa detectado:", event.target.value);
    const formattedPlate = formatPlate(event.target.value);
    event.target.value = formattedPlate;
    console.log("Placa após formatação:", formattedPlate);
});

// Função de autocomplete para sugestões de placa
function showSuggestions(value) {
    console.log("Função showSuggestions chamada com:", value);
    suggestionsContainer.innerHTML = '';
    if (value.length < 3) return; // Mostrar sugestões apenas após 3 caracteres

    const filteredData = driversData.filter(driver => driver.plate.startsWith(value.toUpperCase()));
    filteredData.forEach(driver => {
        const suggestion = document.createElement('div');
        suggestion.classList.add('suggestion-item');
        suggestion.textContent = `${driver.plate} - ${driver.name}`;
        suggestion.addEventListener('click', () => {
            plateInput.value = driver.plate;
            nameInput.value = driver.name;
            suggestionsContainer.innerHTML = ''; // Limpar sugestões após seleção
        });
        suggestionsContainer.appendChild(suggestion);
    });
}

// Função para ler o arquivo Excel e processar os dados de motoristas
function processExcel(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        driversData = jsonData.map(row => ({
            name: row['Nome'],
            plate: row['Placa'].toUpperCase()
        }));
        console.log("Dados de motoristas e placas processados:", driversData);
    };
    reader.readAsArrayBuffer(file);
}

// Evento para carregar o arquivo Excel
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        processExcel(file);
        alert('Arquivo Excel carregado com sucesso!');
    }
});

// Evento de input no campo de placa para mostrar sugestões
plateInput.addEventListener('input', function(event) {
    const formattedPlate = formatPlate(event.target.value);
    event.target.value = formattedPlate;
    showSuggestions(formattedPlate);
});

// Adiciona evento ao campo de entrada da placa
document.getElementById('plate').addEventListener('input', function(event) {
    console.log("Evento input na placa detectado:", event.target.value);
    const formattedPlate = formatPlate(event.target.value);
    event.target.value = formattedPlate;
    console.log("Placa após formatação:", formattedPlate);
});

// Função para adicionar um chamado à lista e armazená-lo no localStorage
function addLastCall(name, plate, action, voice) {
    console.log("Função addLastCall chamada com:", { name, plate, action, voice });
    let lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
    console.log('Chamados antes de adicionar:', lastCalls);

    const timestamp = new Date().toLocaleString();

    const existingCallIndex = lastCalls.findIndex(call => call.name === name && call.plate === plate && call.action === action && call.voice === voice);
    if (existingCallIndex === -1) {
        lastCalls.push({ name, plate, action, voice, timestamp });
        console.log("Chamado adicionado:", { name, plate, action, voice, timestamp });

        if (lastCalls.length > 100) {
            lastCalls.shift();
            console.log("Chamado mais antigo removido (lista excedeu 100 elementos).");
        }

        localStorage.setItem('lastCalls', JSON.stringify(lastCalls));
        console.log('Chamados após adicionar:', lastCalls);
    } else {
        console.log('Chamado já existente, não adicionado novamente.');
    }

    displayLastCalls();
}

// Função para chamar o motorista (com leitura do nome e placa duas vezes)
function callDriver(name, plate, action, selectedVoiceIndex) {
    const plateWithoutDash = plate.replace(/-/g, ''); // Remove o traço da placa

    // Formata a placa para adicionar espaços entre as letras e manter o hífen
    const formattedPlate = plateWithoutDash.replace(/([A-Z]+)/g, (match) => {
        return match.split('').join(' '); // Adiciona espaço entre as letras
    }).replace(/(\d+)/g, (match) => {
        return match.split('').join(' '); // Adiciona espaço entre os números
    }).replace(/ /g, ' ').replace(/(\S{3})(\S)/, '$1-$2'); // Adiciona o hífen após os 3 primeiros caracteres

    const parts = [
        `Atenção!`,
        `Chamada para ${action}.`,
    ];

    const audio = new Audio('assets/toque.mp3');
    audio.play().then(() => {
        audio.onended = () => {
            // Falar partes da chamada
            parts.forEach(part => {
                const speech = new SpeechSynthesisUtterance(part);
                speech.voice = ptBrVoices[selectedVoiceIndex];
                speech.lang = 'pt-BR';
                speech.rate = 0.9;
                window.speechSynthesis.speak(speech);
            });

            // Pronunciar o nome do motorista e a placa duas vezes
            for (let i = 0; i < 2; i++) {
                // Pronunciar "Motorista [nome]"
                const nameSpeech = new SpeechSynthesisUtterance(`Motorista ${name}`);
                nameSpeech.voice = ptBrVoices[selectedVoiceIndex];
                nameSpeech.lang = 'pt-BR';
                nameSpeech.rate = 0.8; // Velocidade da voz
                window.speechSynthesis.speak(nameSpeech);

                // Pronunciar "Placa [placa]"
                const plateSpeech = new SpeechSynthesisUtterance(`Placa ${formattedPlate}`);
                plateSpeech.voice = ptBrVoices[selectedVoiceIndex];
                plateSpeech.lang = 'pt-BR';
                plateSpeech.rate = 0.8; // Velocida da voz
                window.speechSynthesis.speak(plateSpeech);
            }
        };
    }).catch(error => {
        console.error('Erro ao reproduzir o som:', error);
    });
}








// Função para chamar novamente o motorista
function reCall(name, plate, action, voice) {
    console.log("Função reCall chamada com:", { name, plate, action, voice });
    callDriver(name, plate, action, ptBrVoices.findIndex(v => v.name === voice));
}

// Função para listar vozes disponíveis e preenchê-las no select
function listAvailableVoices() {
    console.log("Função listAvailableVoices chamada.");
    const voices = window.speechSynthesis.getVoices();
    console.log("Vozes disponíveis:", voices);

    voiceSelect.innerHTML = '';
    ptBrVoices = voices.filter(voice => voice.lang === 'pt-BR');
    console.log("Vozes em pt-BR:", ptBrVoices);

    ptBrVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang}) ${voice.default ? '(Default)' : ''}`;
        voiceSelect.appendChild(option);
        console.log("Opção adicionada ao select:", option);
    });

    if (ptBrVoices.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Nenhuma voz em pt-BR disponível';
        voiceSelect.appendChild(option);
        console.log("Nenhuma voz pt-BR disponível.");
    }
}

// Chama a função para preencher as vozes disponíveis quando forem carregadas
window.speechSynthesis.onvoiceschanged = listAvailableVoices;

// Função para limpar a lista de últimos chamados
clearListButton.addEventListener('click', function() {
    console.log("Botão de limpar lista clicado.");
    localStorage.removeItem('lastCalls');
    displayLastCalls();
});

// Adiciona evento ao formulário de submissão
document.getElementById('announcementForm').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("Formulário de anúncio enviado.");

    const name = document.getElementById('name').value.trim();
    const plate = document.getElementById('plate').value.trim();
    const action = document.getElementById('action').value;
    const selectedVoiceIndex = voiceSelect.value;

    console.log("Dados do formulário:", { name, plate, action, selectedVoiceIndex });

    if (name && plate && action && selectedVoiceIndex !== "") {
        callDriver(name, plate, action, selectedVoiceIndex);

        const selectedVoice = ptBrVoices[selectedVoiceIndex].name;
        addLastCall(name, plate, action, selectedVoice);

        document.getElementById('announcementForm').reset();

        const button = event.target.querySelector('button');
        button.innerHTML = '<i class="fas fa-check"></i> Chamado!';
        button.disabled = true;
        console.log("Botão de chamar desabilitado temporariamente.");

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-bell"></i> Chamar Motorista';
            button.disabled = false;
            console.log("Botão de chamar reabilitado.");
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
    console.log("Botão de exportar PDF clicado.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // A4 profissional

    // Adicionando a logo no topo com ajuste de proporções
    const logoURL = 'assets/logoagrocp.png';
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoURL, 'PNG', 10, 10, logoWidth, logoHeight);
    console.log("Logo adicionada ao PDF.");

    // Definindo margens e espaçamentos
    const marginTop = 30;
    const marginLeft = 20;
    const marginRight = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Título principal do relatório com design impactante
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 104, 55); // Cor padrão #116837
    doc.text("Relatório de Chamadas", pageWidth / 2, marginTop, { align: 'center' });

    // Linha decorativa abaixo do título
    doc.setDrawColor(17, 104, 55); // Cor padrão #116837
    doc.setLineWidth(0.5);
    doc.line(marginLeft, marginTop + 5, pageWidth - marginRight, marginTop + 5);

    // Subtítulo com data e hora de geração
    const now = new Date();
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`, pageWidth / 2, marginTop + 12, { align: 'center' });

    // Verificando histórico de chamadas
    const history = JSON.parse(localStorage.getItem('lastCalls')) || [];
    console.log('Histórico de Chamados:', history);

    if (history.length === 0) {
        alert('Nenhum chamado encontrado no histórico.');
        console.error("Histórico de chamados está vazio.");
        return;
    }

    // Seção de informações gerais com separador
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 104, 55); // Cor padrão #116837
    doc.text("Detalhes do Histórico", marginLeft, marginTop + 25);

    doc.autoTable({
        startY: 50,
        head: [['Data e Hora', 'Motorista', 'Placa', 'Ação']],
        body: history.map(call => [
            call.timestamp, 
            call.name, 
            formatPlate(call.plate),
            call.action.charAt(0).toUpperCase() + call.action.slice(1)
        ]),
        theme: 'grid',
        headStyles: { 
            fillColor: [17, 104, 55], 
            textColor: [255, 255, 255], 
            font: 'helvetica', 
            fontStyle: 'bold' 
        },
        styles: { 
            fillColor: [242, 242, 242], 
            textColor: [100, 100, 100] 
        },
    });
    console.log("Tabela de histórico adicionada ao PDF.");

    // Adicionando rodapé com linha e número da página
    const footerText = 'Relatório gerado automaticamente. Todos os direitos reservados.';
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);

        // Linha separadora no rodapé
        doc.setDrawColor(180, 180, 180);
        doc.line(marginLeft, pageHeight - 20, pageWidth - marginRight, pageHeight - 20);

        // Texto do rodapé
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

        // Número da página
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginRight, pageHeight - 15, { align: 'right' });
        console.log(`Rodapé e número da página ${i} adicionados ao PDF.`);
    }

    // Salvando o arquivo PDF
    doc.save('relatorio_chamadas.pdf');
    console.log("PDF salvo.");
});




//Confirmação de arquivo de upload
document.getElementById('uploadFile').addEventListener('change', function(event) {
    const fileInput = event.target;
    const fileNameElement = document.getElementById('fileName');
    const fileName = fileInput.files.length ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
    
    fileNameElement.textContent = `Arquivo carregado: ${fileName}`;
    
    // Adiciona a classe 'visible' para a animação
    if (!fileNameElement.classList.contains('visible')) {
        fileNameElement.classList.add('visible');
    }
});

