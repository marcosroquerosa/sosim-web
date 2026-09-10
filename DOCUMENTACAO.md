# SOsim Web

## Simulador Educacional de Sistemas Operacionais

O **SOsim Web** é um simulador educacional desenvolvido para auxiliar no estudo dos principais conceitos de **Sistemas Operacionais**, especialmente gerenciamento de processos, escalonamento de CPU, memória e paginação.

O simulador funciona diretamente no navegador e não necessita de instalação de servidor, banco de dados ou outros componentes.

**Desenvolvimento**: o código-fonte desta reimplementação web foi desenvolvido com auxílio de inteligência artificial generativa (ChatGPT, da OpenAI).

---

# 1. Objetivo do simulador

O SOsim Web permite observar, de forma visual e dinâmica, fenômenos que normalmente ficam ocultos dentro de um sistema operacional.

Entre eles:

* criação e execução de processos;
* mudança de estados dos processos;
* escalonamento da CPU;
* uso de quantum;
* filas de processos;
* bloqueio para operações de entrada e saída;
* suspensão e retomada de processos;
* utilização da memória física;
* paginação;
* page faults;
* utilização do arquivo de paginação;
* trocas de contexto;
* utilização da CPU.

A principal finalidade é **observar o comportamento do sistema operacional durante a execução**, e não reproduzir com precisão o funcionamento de um kernel real.

---

# 2. Como iniciar

O SOsim Web é uma aplicação web estática.

Basta abrir:

```text
https://marcosroquerosa.github.io/sosim-web/
```

em um navegador moderno.

---

# 3. Interface principal

A interface está dividida em duas regiões principais.

## 3.1 Painel lateral

O painel lateral contém os principais controles da simulação:

* informações da simulação;
* criação de processos;
* configuração do escalonador;
* configuração do quantum;
* velocidade da simulação;
* configuração da memória;
* acesso às diferentes visualizações.

## 3.2 Área de trabalho

A área principal apresenta diferentes visualizações:

1. Gerência de Processos;
2. Gerência do Processador;
3. Gerência de Memória;
4. Arquivo de Paginação;
5. Estatísticas;
6. Log.

---

# 4. Controles da simulação

Na parte superior existem quatro controles.

## Iniciar

Inicia a execução automática da simulação.

O relógio da simulação passa a avançar automaticamente.

## Pausar

Interrompe temporariamente a execução automática.

Os processos e seus estados são preservados.

## Tick

Executa **um único passo da simulação**.

Essa opção é especialmente útil em aulas, pois permite ao professor executar a simulação passo a passo.

Por exemplo:

```text
Tick 0
   ↓
Tick 1
   ↓
Tick 2
   ↓
Tick 3
```

A cada tick podem ocorrer mudanças no estado dos processos, escalonamento, consumo de CPU, bloqueios e outros eventos.

## Reiniciar

Remove os processos existentes e retorna a simulação ao estado inicial.

---

# 5. Criando processos

Na seção **Criar processos**, o usuário pode definir:

### Tipo

Existem dois tipos:

* CPU-bound;
* I/O-bound.

### Prioridade

Define a prioridade inicial do processo.

O simulador utiliza valores de:

```text
0 a 15
```

Quanto maior o valor, maior a prioridade.

### Frames

Define a quantidade máxima de frames que podem ser utilizados pelo processo.

O valor pode variar de:

```text
1 a 5 frames
```

### Quantidade

Permite criar vários processos de uma vez.

Por exemplo:

```text
Tipo: CPU-bound
Prioridade: 8
Frames: 3
Quantidade: 4
```

será utilizado para criar:

```text
P1
P2
P3
P4
```

---

# 6. Processos CPU-bound

Um processo **CPU-bound** é aquele que utiliza predominantemente o processador.

No SOsim Web, esses processos permanecem utilizando a CPU até:

* atingir o quantum configurado;
* serem interrompidos pelo escalonador;
* ou atingirem o limite de execução definido pelo simulador.

Isso permite observar o comportamento de processos que precisam de bastante processamento.

---

# 7. Processos I/O-bound

Um processo **I/O-bound** é caracterizado por alternar entre processamento e operações de entrada/saída.

No simulador, processos desse tipo podem ser bloqueados durante sua execução.

Um exemplo simplificado:

```text
Pronto
   ↓
Executando
   ↓
Bloqueado
   ↓
Pronto
   ↓
Executando
```

Isso permite observar por que um processo bloqueado não deve continuar ocupando a CPU.

---

# 8. Estados dos processos

Os processos podem assumir diferentes estados.

| Estado     | Significado                              |
| ---------- | ---------------------------------------- |
| Novo       | Processo acabou de ser criado            |
| Pronto     | Está aguardando a CPU                    |
| Executando | Está utilizando a CPU                    |
| Bloqueado  | Está aguardando uma operação de I/O      |
| Suspenso   | Foi retirado temporariamente da execução |
| Finalizado | Terminou sua execução                    |

O fluxo mais comum é:

```text
             ┌──────────────┐
             │    PRONTO    │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │  EXECUTANDO  │
             └──────┬───────┘
                    │
             ┌──────┴───────┐
             │              │
             ▼              ▼
       ┌──────────┐   ┌────────────┐
       │BLOQUEADO │   │ FINALIZADO │
       └────┬─────┘   └────────────┘
            │
            ▼
        ┌────────┐
        │ PRONTO │
        └────────┘
```

Um processo também pode ser colocado no estado **Suspenso**.

---

# 9. Gerência de Processos

A tela **Gerência de Processos** apresenta uma tabela com informações dos processos.

As principais colunas são:

| Campo      | Descrição                      |
| ---------- | ------------------------------ |
| PID        | Identificador do processo      |
| Tipo       | CPU-bound ou I/O-bound         |
| Estado     | Estado atual do processo       |
| Prioridade | Prioridade atual               |
| CPU        | Quantidade de ticks utilizados |
| Frames     | Frames utilizados / limite     |
| Fila       | Tempo aproximado de espera     |
| Ações      | Operações disponíveis          |

---

# 10. PID

O **PID (Process Identifier)** é o identificador utilizado pelo sistema para distinguir um processo.

Exemplo:

```text
P1
P2
P3
P4
```

Cada processo possui um PID diferente.

---

# 11. PCB

Ao clicar em **PCB**, o simulador apresenta informações do **Process Control Block — Bloco de Controle de Processo**.

O PCB contém informações necessárias para representar o processo.

No SOsim Web são apresentadas informações como:

* PID;
* estado;
* tipo;
* prioridade;
* tempo de CPU;
* quantidade de page faults;
* frames físicos;
* tabela de páginas.

Uma forma simplificada de visualizar o PCB é:

```text
PCB
├── PID
├── Estado
├── Prioridade
├── Registradores/estado de execução
├── Informações de memória
└── Informações de controle
```

No simulador, o PCB é uma representação didática e não pretende reproduzir todos os campos existentes em um sistema operacional real.

---

# 12. Suspender um processo

A opção **Suspender** retira temporariamente o processo da execução.

Exemplo:

```text
Pronto
  ↓
Suspenso
```

O processo não será escolhido pelo escalonador enquanto estiver suspenso.

Para retornar à execução, utilize:

**Prosseguir**

O processo volta para a fila de processos prontos.

---

# 13. Finalizar um processo

A opção **Finalizar** encerra manualmente o processo.

Quando isso acontece:

```text
Processo → Finalizado
```

Os frames utilizados pelo processo são liberados.

---

# 14. Escalonamento

O escalonador é responsável por escolher qual processo deverá utilizar a CPU.

O SOsim Web possui diferentes políticas.

---

## 14.1 Round Robin

A política **Round Robin** utiliza um quantum.

Exemplo:

```text
Quantum = 4
```

O processo pode executar por até quatro ticks antes de retornar à fila de prontos.

Exemplo:

```text
P1 → CPU → 4 ticks
             ↓
           Pronto

P2 → CPU → 4 ticks
             ↓
           Pronto

P3 → CPU → 4 ticks
```

Esse mecanismo permite compartilhar a CPU entre diversos processos.

---

# 15. Quantum

O **quantum** é o intervalo máximo de tempo de CPU concedido a um processo antes que ele possa ser retirado da CPU pelo escalonador.

Exemplo:

```text
Quantum = 3

P1 executa:
Tick 1
Tick 2
Tick 3
   ↓
P1 retorna para a fila
```

Um quantum muito pequeno pode aumentar o número de trocas de contexto.

Um quantum muito grande pode fazer o comportamento se aproximar de uma execução menos interativa.

---

# 16. Circular + prioridade estática

Nesta política, os processos possuem prioridades definidas no momento da criação.

A prioridade permanece estável durante a execução.

Exemplo:

```text
P1 → prioridade 5
P2 → prioridade 10
P3 → prioridade 7
```

O escalonador considera essas prioridades para escolher os processos.

---

# 17. Circular + prioridade dinâmica

Nesta modalidade, a prioridade pode ser alterada de acordo com o tempo de espera.

Um processo que permanece aguardando pode receber uma compensação de prioridade.

Isso permite demonstrar um conceito importante:

> processos que esperam durante muito tempo não devem necessariamente permanecer indefinidamente sem receber CPU.

Esse mecanismo é relacionado ao conceito de **aging**.

---

# 18. Escalonamento por prioridade

Na política de prioridade, o escalonador procura executar o processo com maior prioridade.

Por exemplo:

```text
P1 → 5
P2 → 12
P3 → 8
```

A preferência será:

```text
P2 → P3 → P1
```

Uma desvantagem possível dessa abordagem é a **starvation**, quando processos de baixa prioridade permanecem esperando por muito tempo.

---

# 19. Gerência do Processador

A tela **Gerência do Processador** apresenta:

* processo atualmente executando;
* tipo do processo;
* tempo de CPU;
* quantum restante;
* política de escalonamento;
* fila de prontos;
* fila de bloqueados;
* processos suspensos;
* linha do tempo da CPU.

---

# 20. Fila de prontos

A fila de prontos contém processos que:

> estão aptos a executar, mas estão esperando pela CPU.

Exemplo:

```text
CPU: P2

Fila de prontos:

[P1] [P3] [P4]
```

Quando P2 deixar a CPU, um dos processos da fila poderá ser escolhido.

---

# 21. Fila de bloqueados

A fila de bloqueados contém processos que não podem continuar executando naquele momento.

Normalmente isso acontece porque estão aguardando uma operação de entrada/saída.

Exemplo:

```text
CPU
 │
 ▼
P1

Bloqueados:
P2
P3
```

P2 e P3 não competem pela CPU enquanto estiverem bloqueados.

---

# 22. Linha do tempo

A linha do tempo apresenta qual processo utilizou a CPU em cada tick.

Exemplo:

```text
P1 P1 P1 P1 P2 P2 P2 P2 P3 P3
```

Essa visualização permite identificar:

* quantum;
* alternância entre processos;
* ociosidade da CPU;
* trocas de contexto.

---

# 23. Gerência de Memória

A tela **Gerência de Memória** representa a memória física dividida em frames.

O modelo do simulador utiliza:

```text
100 frames
```

Cada frame pode estar:

```text
Livre
```

ou associado a:

```text
PID + página
```

Exemplo:

```text
Frame 0 → P1 / página 0
Frame 1 → P1 / página 1
Frame 2 → P2 / página 0
Frame 3 → livre
```

---

# 24. Frame

Um **frame** é um bloco de tamanho fixo da memória física.

Na paginação:

```text
Memória física
       ↓
┌──────┬──────┬──────┬──────┐
│ F0   │ F1   │ F2   │ F3   │
└──────┴──────┴──────┴──────┘
```

Cada frame pode armazenar uma página de um processo.

---

# 25. Página

Uma **página** é um bloco de tamanho fixo do espaço de endereçamento virtual de um processo.

Existe uma relação:

```text
Página virtual → Frame físico
```

Por exemplo:

```text
Página 0 → Frame 15
Página 1 → Frame 38
Página 2 → Frame 72
```

As páginas não precisam estar armazenadas em frames consecutivos.

Essa é uma das principais vantagens da paginação.

---

# 26. Tabela de páginas

Cada processo possui uma tabela que relaciona suas páginas virtuais com os frames físicos.

Exemplo:

| Página | Válida | Frame |
| ------ | -----: | ----: |
| 0      |      1 |    15 |
| 1      |      1 |    38 |
| 2      |      0 |     — |
| 3      |      0 |     — |

Quando o bit de validade é `1`, a página está na memória.

Quando é `0`, ela está fora da memória física.

---

# 27. Memória virtual

A memória virtual permite que um processo utilize um espaço de endereçamento maior do que a memória física disponível diretamente para ele.

Uma representação simplificada:

```text
Processo
   │
   ▼
Memória virtual
   │
   ├── Página 0
   ├── Página 1
   ├── Página 2
   ├── Página 3
   └── Página 4
          │
          ▼
     Memória física
```

Algumas páginas podem estar na memória física enquanto outras permanecem no arquivo de paginação.

---

# 28. Page Fault

Um **page fault** acontece quando o processo tenta acessar uma página que não está atualmente na memória física.

Exemplo:

```text
Processo acessa página 3
          ↓
Página 3 não está na RAM
          ↓
PAGE FAULT
          ↓
Página precisa ser carregada
```

No simulador, cada ocorrência é contabilizada nas estatísticas.

---

# 29. Arquivo de Paginação

O **arquivo de paginação**, também chamado de swap em determinados sistemas, representa uma área utilizada para armazenar páginas que não estão atualmente na memória física.

No simulador:

```text
RAM
│
├── Página 0
├── Página 1
└── Página 4

SWAP
│
├── Página 2
└── Página 3
```

Quando uma página precisa ser carregada, pode ser necessário retirar outra página da memória.

---

# 30. Paginação sob demanda

Na política **sob demanda**, as páginas são carregadas conforme são necessárias.

A ideia é:

```text
Página necessária?
       │
       ├── Sim → carregar
       │
       └── Não → permanecer fora da RAM
```

Essa abordagem evita carregar antecipadamente páginas que podem nunca ser utilizadas.

---

# 31. Paginação antecipada

Na política **antecipada**, algumas páginas podem ser carregadas antes de serem efetivamente utilizadas.

A ideia é aproveitar a possibilidade de que páginas próximas sejam utilizadas em breve.

Entretanto, isso pode resultar em trabalho desnecessário se as páginas carregadas nunca forem utilizadas.

---

# 32. Estatísticas

A tela de estatísticas apresenta indicadores acumulados durante a simulação.

## Ticks

Número de passos executados pelo relógio da simulação.

## Processos criados

Quantidade total de processos criados.

## Finalizados

Quantidade de processos encerrados.

## Uso da CPU

Estimativa da utilização da CPU durante a simulação.

## Trocas de contexto

Quantidade de mudanças entre processos na CPU.

## Page faults

Quantidade de faltas de página ocorridas.

---

# 33. Log

O log registra eventos importantes da simulação.

Exemplo:

```text
[t=0] SOsim Web iniciado.
[t=0] P1 criado.
[t=1] Despacho: P1 entrou na CPU.
[t=4] Quantum de P1 expirou.
[t=4] P2 entrou na CPU.
[t=7] P2 solicitou I/O.
```

O log é especialmente útil para analisar a sequência dos eventos.

---

# 34. Experimento recomendado para aula

Uma atividade simples consiste em criar três processos:

```text
P1 → CPU-bound
P2 → CPU-bound
P3 → I/O-bound
```

Utilize:

```text
Quantum = 4
```

Depois:

1. Inicie a simulação.
2. Observe a fila de prontos.
3. Observe a CPU.
4. Observe quando P3 é bloqueado.
5. Observe seu retorno para a fila de prontos.
6. Observe as trocas de contexto.
7. Abra o PCB dos processos.
8. Observe a memória.
9. Observe os page faults.
10. Consulte as estatísticas.

### Perguntas para os alunos

1. Qual processo está utilizando a CPU?
2. Qual processo está na fila de prontos?
3. Por que um processo I/O-bound pode ser bloqueado?
4. O que acontece quando o quantum termina?
5. O que representa uma troca de contexto?
6. Qual processo possui maior prioridade?
7. O que acontece quando ocorre um page fault?
8. Qual a diferença entre página e frame?
9. Qual a função do arquivo de paginação?
10. Como o comportamento muda quando o quantum é aumentado?

---

# 35. Glossário

| Termo                               | Definição                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **CPU**                             | Unidade responsável pela execução das instruções dos processos.                                                   |
| **Processo**                        | Programa em execução, acompanhado das informações necessárias para seu gerenciamento.                             |
| **PID**                             | Identificador único utilizado para identificar um processo.                                                       |
| **PCB**                             | Estrutura que armazena informações de controle e estado de um processo.                                           |
| **Thread**                          | Unidade de execução pertencente a um processo.                                                                    |
| **Escalonador**                     | Componente responsável por selecionar processos para utilizar a CPU.                                              |
| **Escalonamento**                   | Processo de decisão sobre qual processo deve executar.                                                            |
| **Quantum**                         | Intervalo de tempo de CPU concedido a um processo antes de uma possível troca.                                    |
| **Round Robin**                     | Algoritmo de escalonamento que distribui a CPU entre processos utilizando um quantum.                             |
| **Prioridade**                      | Valor utilizado para estabelecer preferência entre processos.                                                     |
| **Prioridade estática**             | Prioridade que permanece constante durante a execução.                                                            |
| **Prioridade dinâmica**             | Prioridade que pode mudar durante a execução.                                                                     |
| **Aging**                           | Técnica que aumenta gradualmente a prioridade de processos que esperam muito tempo.                               |
| **Starvation**                      | Situação em que um processo pode esperar indefinidamente para executar.                                           |
| **Troca de contexto**               | Mudança da CPU de um processo para outro, preservando o estado necessário do processo interrompido.               |
| **Processo CPU-bound**              | Processo que passa grande parte do tempo utilizando a CPU.                                                        |
| **Processo I/O-bound**              | Processo que alterna processamento com operações de entrada e saída.                                              |
| **I/O**                             | Entrada e saída de dados, como leitura de arquivos ou comunicação com dispositivos.                               |
| **Pronto**                          | Estado de um processo que pode executar, mas está aguardando a CPU.                                               |
| **Executando**                      | Estado de um processo que está utilizando a CPU.                                                                  |
| **Bloqueado**                       | Estado de um processo que está aguardando algum evento, normalmente uma operação de I/O.                          |
| **Suspenso**                        | Estado de um processo temporariamente retirado da execução.                                                       |
| **Finalizado**                      | Estado de um processo que terminou sua execução.                                                                  |
| **Memória física**                  | Memória RAM efetivamente disponível para armazenar dados e instruções.                                            |
| **Memória virtual**                 | Mecanismo que fornece aos processos um espaço de endereçamento virtual independente da organização física da RAM. |
| **Página**                          | Bloco de tamanho fixo do espaço de endereçamento virtual.                                                         |
| **Frame**                           | Bloco de tamanho fixo da memória física que pode armazenar uma página.                                            |
| **Tabela de páginas**               | Estrutura que relaciona páginas virtuais aos frames físicos.                                                      |
| **Page fault**                      | Falha que ocorre quando uma página necessária não está na memória física.                                         |
| **Swap**                            | Área utilizada para armazenar temporariamente páginas que não estão na memória física.                            |
| **Arquivo de paginação**            | Área ou arquivo utilizado pelo sistema para apoiar o gerenciamento da memória virtual.                            |
| **Paginação**                       | Técnica de gerenciamento de memória que divide memória virtual e física em blocos de tamanho fixo.                |
| **Paginação sob demanda**           | Carregamento de páginas na memória somente quando são necessárias.                                                |
| **Prefetch / paginação antecipada** | Carregamento antecipado de páginas que provavelmente serão utilizadas.                                            |
| **Frame livre**                     | Frame da memória física que não está atualmente ocupado por uma página.                                           |
| **Fila de prontos**                 | Fila contendo processos aptos a executar e aguardando a CPU.                                                      |
| **Fila de bloqueados**              | Conjunto de processos que estão aguardando algum evento ou operação de I/O.                                       |
| **Tick**                            | Um passo discreto do relógio utilizado pelo simulador para representar a passagem do tempo.                       |
| **Clock**                           | Contador de tempo lógico da simulação.                                                                            |
| **Throughput**                      | Quantidade de processos concluídos em determinado intervalo de tempo.                                             |
| **Tempo de espera**                 | Tempo que um processo permanece aguardando para utilizar a CPU.                                                   |
| **Tempo de CPU**                    | Quantidade de tempo que um processo efetivamente utilizou a CPU.                                                  |
| **Utilização da CPU**               | Percentual de tempo em que a CPU esteve ocupada executando processos.                                             |

---

# 36. Limitações do simulador

O SOsim Web deve ser utilizado como **ferramenta didática**, e não como uma implementação de um sistema operacional real.

Alguns mecanismos são simplificados.

Por exemplo:

* o comportamento de I/O é simulado;
* os page faults são gerados pelo modelo do simulador;
* a substituição de páginas é simplificada;
* o PCB não contém todos os elementos de um PCB real;
* as prioridades e algoritmos não representam necessariamente implementações específicas de Linux, Windows ou outro sistema;
* o conceito de swap é representado visualmente, não correspondendo diretamente ao funcionamento de uma partição ou arquivo de swap real.

Portanto, os resultados devem ser interpretados como **experimentos controlados para aprendizagem**.

---

# 37. Conceitos que podem ser estudados com o SOsim Web

O simulador pode ser utilizado para trabalhar, entre outros, os seguintes conteúdos:

### Processos

```text
Programa
   ↓
Processo
   ↓
PCB
   ↓
Estados
```

### Escalonamento

```text
Processos prontos
       ↓
  Escalonador
       ↓
      CPU
       ↓
Troca de contexto
```

### Threads

```text
Processo
 ├── Thread 1
 ├── Thread 2
 └── Thread 3
```

### Memória

```text
Processo
   ↓
Memória virtual
   ↓
Páginas
   ↓
Tabela de páginas
   ↓
Frames físicos
```

### Memória virtual

```text
Acesso à página
       ↓
Está na RAM?
   ┌───┴───┐
  SIM     NÃO
   │       │
   │    Page Fault
   │       ↓
   │   Carregar página
   │       ↓
   └──→ Executar
```

---

# 38. Resumo dos principais conceitos

O SOsim Web pode ser compreendido a partir de quatro componentes principais:

```text
                 SOsim Web
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   Processos     Processador     Memória
       │             │             │
       │         Escalonador    Paginação
       │             │             │
       ▼             ▼             ▼
    Estados       Quantum       Páginas
    PCB           Prioridade    Frames
    Threads       Round Robin   Page Fault
```

A integração desses mecanismos permite observar uma das principais funções de um sistema operacional:

> **gerenciar os recursos do computador e permitir que múltiplos processos sejam executados de maneira organizada, eficiente e controlada.**

---

# 39. Uso recomendado pelo professor

Para uma disciplina de Sistemas Operacionais, o simulador pode ser utilizado em três níveis.

## Nível 1 — Observação

O aluno cria processos e observa:

* estados;
* filas;
* CPU;
* quantum.

## Nível 2 — Experimentação

O aluno altera:

* quantum;
* prioridades;
* tipo de processo;
* quantidade de frames;
* política de escalonamento.

Depois compara os resultados.

## Nível 3 — Análise

O aluno deve explicar, com base nos dados observados:

* por que determinado processo executou primeiro;
* por que ocorreu uma troca de contexto;
* por que um processo foi bloqueado;
* como o quantum afetou o escalonamento;
* quando ocorreu um page fault;
* como as páginas foram distribuídas nos frames;
* quais processos apresentaram maior tempo de espera.

Esse terceiro nível é o mais importante pedagogicamente, pois transforma o simulador de uma simples demonstração visual em uma **ferramenta de experimentação sobre Sistemas Operacionais**.
