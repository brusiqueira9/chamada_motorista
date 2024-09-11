# Chamada de Motorista

Este é um projeto de uma aplicação web que realiza chamadas para motoristas utilizando voz de IA. A aplicação permite ao usuário informar o nome do motorista, a placa do veículo, a ação (carregamento ou descarga) e selecionar uma voz em português do Brasil para fazer o anúncio. Além disso, a aplicação armazena os últimos chamados, permitindo chamá-los novamente com um único clique.

## Funcionalidades

- Entrada do nome do motorista, placa do veículo e tipo de ação (carregamento ou descarga).
- Seleção de diferentes vozes de IA para realizar a chamada.
- Armazenamento dos últimos 100 chamados no `localStorage`.
- Possibilidade de chamar motoristas novamente com base nos chamados anteriores.
- Exibição e gerenciamento dos últimos chamados.
- Efeitos visuais e sonoros para melhorar a experiência do usuário.
- Relatório em PDF de todos as chamadas armazendas no localStorage com os campos Data e Hora, Nome do Motorista, Placa e Ação.

## Tecnologias Utilizadas

- **HTML5**: Estruturação do conteúdo da aplicação.
- **CSS3**: Estilização e layout responsivo, com uso de animações e transições.
- **JavaScript**: Lógica de interação, manipulação do DOM e utilização da API de síntese de fala.
- **Font Awesome**: Ícones visuais no formulário e na interface.
- **LocalStorage**: Armazenamento local dos últimos chamados.
- **jsPDF**: Biblioteca JS usada para geração do relatório de chamadas.

## Como Utilizar

1. Clone este repositório ou faça o download dos arquivos.
2. Abra o arquivo `index.html` em qualquer navegador moderno.
3. Preencha o nome do motorista, a placa do veículo e escolha a ação (carregamento ou descarga).
4. Selecione uma das vozes disponíveis em português do Brasil no dropdown.
5. Clique no botão **"Chamar Motorista"** para ouvir o anúncio.
6. Os últimos 100 chamados serão listados na seção **"Últimos Chamados"**, permitindo chamá-los novamente ou limpar a lista.

## Melhoria de Vozes
Para utilizar vozes mais realistas, como a Microsoft Thalita Online (Natural), certifique-se de que o navegador suporte a API de síntese de fala (SpeechSynthesis).

## Estrutura de Arquivos

Abaixo está a estrutura de diretórios e arquivos do projeto:

├── assets # Pasta com recursos de mídia │ ├── background.jpeg # Imagem de fundo usada no layout │ ├── box-truck.png # Ícone de caminhão usado como favicon │ └── toque.mp3 # Som de alerta antes da chamada de voz ├── css │ └── styles.css # Estilização da interface em CSS ├── js │ └── script.js # Lógica da aplicação em JavaScript ├── index.html # Estrutura principal da aplicação web ├── README.md # Documentação do projeto └── LICENSE # Arquivo de licença do projeto


### Descrição dos Principais Arquivos:

- **assets/**: Contém as mídias (imagens e sons) usadas na aplicação.
  - `background.jpeg`: Imagem de fundo aplicada ao layout.
  - `box-truck.png`: Ícone do caminhão usado como favicon.
  - `toque.mp3`: Som reproduzido antes do anúncio de chamada.

- **css/styles.css**: Arquivo de estilização em CSS responsável pelo layout, cores e responsividade da aplicação.

- **js/script.js**: Arquivo JavaScript que contém a lógica para capturar os dados inseridos no formulário, interagir com a API de síntese de fala, e gerenciar o `localStorage` para armazenar e exibir os últimos chamados.

- **index.html**: Arquivo HTML principal que define a estrutura da aplicação web e integra os arquivos de estilo (CSS) e lógica (JS).

- **README.md**: Este arquivo, contendo a documentação do projeto, instruções de uso, dependências e outras informações importantes.
