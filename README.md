Chamada de Motorista

Este é um projeto de uma aplicação web que realiza chamadas para motoristas utilizando voz de IA. A aplicação permite ao usuário informar o nome do motorista, a placa do veículo, a ação (carregamento ou descarga) e selecionar uma voz em português do Brasil para fazer o anúncio. Além disso, a aplicação armazena os últimos chamados, permitindo chamá-los novamente com um único clique.

Funcionalidades
Entrada do nome do motorista, placa do veículo e tipo de ação (carregamento ou descarga).
Seleção de diferentes vozes de IA para realizar a chamada.
Armazenamento dos últimos 10 chamados no localStorage.
Possibilidade de chamar motoristas novamente com base nos chamados anteriores.
Exibição e gerenciamento dos últimos chamados.
Efeitos visuais e sonoros para melhorar a experiência do usuário.

Tecnologias Utilizadas
HTML5: Estruturação do conteúdo da aplicação.
CSS3: Estilização e layout responsivo, com uso de animações e transições.
JavaScript: Lógica de interação, manipulação do DOM e utilização da API de síntese de fala.
Font Awesome: Ícones visuais no formulário e na interface.
LocalStorage: Armazenamento local dos últimos chamados.

Como Utilizar
Clone este repositório ou faça o download dos arquivos.
Abra o arquivo index.html em qualquer navegador moderno.
Preencha o nome do motorista, a placa do veículo e escolha a ação (carregamento ou descarga).
Selecione uma das vozes disponíveis em português do Brasil no dropdown.
Clique no botão "Chamar Motorista" para ouvir o anúncio.
Os últimos 10 chamados serão listados na seção "Últimos Chamados", permitindo chamá-los novamente ou limpar a lista.

Estrutura de Arquivos
├── assets
│   ├── background.jpeg      # Imagem de fundo
│   ├── box-truck.png        # Ícone de caminhão usado como favicon
│   └── toque.mp3            # Som de alerta antes da chamada de voz
├── index.html               # Estrutura principal da aplicação
├── script.js                # Lógica da aplicação em JavaScript
└── styles.css               # Estilização da interface em CSS

Dependências
A aplicação usa a biblioteca de ícones do Font Awesome, que pode ser carregada via CDN no arquivo index.html:

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

Melhoria de Vozes
Para utilizar vozes mais realistas, como a voz Microsoft Thalita Online (Natural), certifique-se de que o navegador suporte a API de síntese de fala (SpeechSynthesis).

Estilização
A aplicação possui um design responsivo e moderno, com uma imagem de fundo, efeitos de transição ao passar o mouse sobre os botões e uma paleta de cores baseada em verde para os elementos interativos.
