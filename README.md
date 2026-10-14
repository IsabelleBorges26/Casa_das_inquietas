# Casa das Inquietas

**Casa das Inquietas** é um pequeno jogo 2D de exploração, aventura e leve terror psicológico. O jogo ocorre em uma perspectiva *top-down* onde o jogador controla uma boneca viva presa em um quarto de brinquedos estranhos.

## Descrição do Conceito
O jogador acorda em um quarto. Os brinquedos ao redor parecem imóveis, mas alguns guardam segredos. O objetivo principal é encontrar as pistas pelo quarto, solucionar o enigma da caixinha de música, resgatar a chave e escapar. Tudo isso sem ser pego por dois brinquedos que têm comportamentos de vigia: um que patrulha e outro sensível a ruídos.

## Funcionalidades Implementadas
1. **Fase Completa (O Quarto)**: Cenário explorável com colisões físicas (paredes e móveis).
2. **Sistema de Inimigos**: 
   - **Patrulheiro**: Percorre pontos específicos no mapa e detecta a boneca visualmente.
   - **Ouvinte**: Reage aos sons (como ler bilhetes em voz alta ou o som da caixinha de música).
3. **Mecânicas de Interação**: Possibilidade de ler bilhetes, se esconder em guarda-roupas, e interagir com objetos.
4. **Enigma (Caixinha de Música)**: Um quebra-cabeça de sequência de cores.
5. **Inventário**: Mostra os itens coletados.
6. **Responsividade**: Adaptação para navegadores de desktop e celular (D-Pad virtual na tela).

## Tecnologias Utilizadas
- **JavaScript (Vanilla/ES6)**
- **Phaser 3**: Framework de jogos 2D responsável por física, renderização e input.
- **Vite**: Bundler para o desenvolvimento local e criação do build de produção.

## Requisitos para Execução
- Node.js (versão 14+ recomendada)
- NPM

## Instruções de Instalação
1. Abra o terminal.
2. Navegue até a pasta do projeto (`casa-das-inquietas`).
3. Instale as dependências:
   ```bash
   npm install
   ```

## Comandos para Iniciar o Projeto
Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
Isso abrirá o servidor (normalmente na porta `3000` ou `5173`). Basta abrir a URL indicada no navegador.

## Instruções para Gerar o Build
Para gerar a versão otimizada de produção:
```bash
npm run build
```
Os arquivos finais ficarão na pasta `dist/`.

## Controles
### Computador
- **W, A, S, D** ou **Setas do Teclado**: Movimentar a boneca.
- **E** ou **Espaço**: Interagir com objetos próximos.
- **ESC**: Menu/Cancelar (se aplicável).

### Celular
- **D-Pad Virtual**: Na parte inferior esquerda da tela para movimento.
- **Botão de AÇÃO**: Na parte inferior direita para interação.

## Estrutura do Projeto
```
casa-das-inquietas/
├── index.html
├── package.json
├── vite.config.js
├── public/
├── src/
│   ├── main.js
│   ├── config.js
│   ├── scenes/
│   │   ├── BootScene.js (Geração de Sprites Provisórios)
│   │   ├── MenuScene.js
│   │   ├── BedroomScene.js
│   │   └── UIScene.js
│   ├── entities/
│   │   ├── Doll.js
│   │   └── toys/
│   │       ├── PatrolToy.js
│   │       └── NoiseToy.js
│   └── styles/
│       └── game.css
└── README.md
```

## Guia de Customização e Expansão

### Como adicionar novos sprites
Abra o arquivo `src/scenes/BootScene.js`. Atualmente, os sprites são gerados via código (Graphics do Phaser) para evitar dependência de arquivos externos no MVP. Para usar imagens reais, comente as funções `createGraphics` e, no método `preload`, carregue as imagens:
```javascript
this.load.image('doll', 'assets/images/characters/doll.png');
// Certifique-se de colocar as imagens na pasta public/assets/...
```

### Como ajustar as cores
As cores estão centralizadas no arquivo `src/config.js` na constante `COLORS`. A paleta segue a recomendação do design document: rosa chiclete, vermelho cereja, azul piscina, amarelo manteiga, verde menta e berinjela escuro.

### Como alterar a dificuldade dos inimigos
- **Brinquedo Patrulheiro**: Em `src/entities/toys/PatrolToy.js`, ajuste os atributos `this.speed` (velocidade normal) e `this.chaseSpeed` (velocidade de perseguição). O alcance de visão pode ser alterado em `this.visionRange`.
- **Brinquedo Sensível a Ruídos**: Em `src/entities/toys/NoiseToy.js`, os ajustes seguem a mesma lógica nos atributos de velocidade. O raio de percepção do som é parametrizado em `BedroomScene.js` (função `emitNoise`).

### Como adicionar novos objetos interativos
No arquivo `src/scenes/BedroomScene.js`, no método `create`, utilize a função `this.addInteractable`:
```javascript
const myNewItem = this.physics.add.staticSprite(x, y, 'minha_textura');
this.addInteractable(myNewItem, 'Mensagem ao interagir!', () => {
    // Ação ao interagir
});
```

## Limitações Conhecidas
- O joystick de celular utiliza botões simples D-Pad para não depender de plugins externos pesados na primeira fase, o que significa movimento apenas em 8 direções.
- Os recursos gráficos e sonoros baseiam-se em geração processual ou estão implícitos e precisam de arquivos .png ou .mp3 reais em uma etapa posterior de refinamento estético.

## Créditos
Desenvolvido como projeto original para demonstração de capacidades em desenvolvimento de jogos 2D utilizando Phaser e Vite.


## Melhorias desta versão

- Três alas jogáveis com sequências de cores diferentes e pistas próprias.
- Cinco bilhetes em cada ala; a ordem correta das cores é descoberta pelas pistas.
- Layouts com móveis, posições de pistas, patrulhas e atmosfera diferentes por ala.
- O botão **Jogar** solicita tela cheia; também é possível alternar com **F** ou pelo botão ⛶ durante a partida.
- A música ambiente e os sons da caixinha são mantidos.

## Executar localmente

Instale o Node.js e execute `npm install` e depois `npm run dev`.

## Controles

- **WASD** ou **setas**: movimentar.
- **E** ou **Espaço**: interagir.
- **Shift**: correr.
- **Esc**: pausar.
- **F**: tela cheia.
