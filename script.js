const lastCallsList = document.getElementById('lastCalls');
const clearListButton = document.getElementById('clearListButton');
const voiceSelect = document.getElementById('voiceSelect');
let ptBrVoices = [];

console.log("Elementos iniciais capturados:", { lastCallsList, clearListButton, voiceSelect });

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

// Função para chamar o motorista (com leitura letra por letra da placa)
function callDriver(name, plate, action, selectedVoiceIndex) {
    const plateWithoutDash = plate.replace(/-/g, ''); // Remove o traço da placa
    const letters = plateWithoutDash.replace(/[0-9]/g, ''); // Extrai apenas as letras
    const numbers = plateWithoutDash.replace(/[A-Z]/g, ''); // Extrai apenas os números

    const parts = [
        `Atenção!`,
        `Chamada para ${action}.`,
        `Motorista ${name}.`,
    ];

    const audio = new Audio('assets/toque.mp3');
    audio.play().then(() => {
        audio.onended = () => {
            let delay = 0;

            // Falar partes da chamada
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

            // Pronunciar "PLACA" e depois cada letra com intervalo
            const speechPlate = new SpeechSynthesisUtterance('Placa');
            speechPlate.voice = ptBrVoices[selectedVoiceIndex];
            speechPlate.lang = 'pt-BR';
            speechPlate.rate = 0.9;

            setTimeout(() => {
                window.speechSynthesis.speak(speechPlate);
                
                // Atraso adicional para garantir que "PLACA" seja falado antes de iniciar a placa
                setTimeout(() => {
                    let letterDelay = 0;

                    // Pronunciar letras individualmente
                    for (let char of letters) {
                        setTimeout(() => {
                            const charSpeech = new SpeechSynthesisUtterance(char);
                            charSpeech.voice = ptBrVoices[selectedVoiceIndex];
                            charSpeech.lang = 'pt-BR';
                            charSpeech.rate = 0.9;
                            window.speechSynthesis.speak(charSpeech);
                        }, letterDelay);
                        letterDelay += 500; // Atraso de 0.5 segundos entre cada letra
                    }

                    // Pronunciar números em pares após as letras
                    setTimeout(() => {
                        const numberPairs = [];
                        for (let i = 0; i < numbers.length; i += 2) {
                            numberPairs.push(numbers.slice(i, i + 2));
                        }
                        const numbersSpeech = new SpeechSynthesisUtterance(numberPairs.join(' '));
                        numbersSpeech.voice = ptBrVoices[selectedVoiceIndex];
                        numbersSpeech.lang = 'pt-BR';
                        numbersSpeech.rate = 0.9;
                        window.speechSynthesis.speak(numbersSpeech);
                    }, letterDelay); // Atraso após a última letra falada
                }, 500); // Atraso de 0.5 segundos após "PLACA"
            }, delay); // Atraso total para "PLACA" após partes da chamada
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
    const doc = new jsPDF();

    const logoURL = 'assets/logoagrocp.png'; // URL da logo
    const logoWidth = 50; 
    const logoHeight = 20;
    doc.addImage(logoURL, 'PNG', 10, 10, logoWidth, logoHeight);
    console.log("Logo adicionada ao PDF.");

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 104, 55); 
    doc.text("Relatório de Chamadas", 105, 30, { align: 'center' });

    const now = new Date();
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Relatório gerado em: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, 40, { align: 'center' });

    const history = JSON.parse(localStorage.getItem('lastCalls')) || [];
    console.log('Histórico de Chamados:', history);

    if (history.length === 0) {
        alert('Nenhum chamado encontrado no histórico.');
        console.error("Histórico de chamados está vazio.");
        return;
    }

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

    const footerText = 'Relatório gerado automaticamente. Todos os direitos reservados.';
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(footerText, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        console.log(`Rodapé adicionado à página ${i} do PDF.`);
    }

    doc.save('relatorio_chamados.pdf');
    console.log("PDF salvo como 'relatorio_chamados.pdf'.");
});
