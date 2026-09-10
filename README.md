# SOsim Web

## Simulador Educacional de Sistemas Operacionais

O **SOsim Web** é uma reimplementação web, independente e de código aberto, de um simulador educacional para o ensino de **Sistemas Operacionais**.

O projeto foi desenvolvido com **HTML, CSS e JavaScript**, funcionando diretamente no navegador e podendo ser hospedado no **GitHub Pages**.

**Desenvolvimento**: o código-fonte desta reimplementação web foi desenvolvido com auxílio de inteligência artificial generativa (ChatGPT, da OpenAI).
---

## Origem e inspiração

Este projeto foi inspirado no **SOsim — Simulador para o Ensino de Sistemas Operacionais**, desenvolvido originalmente pelo professor **Luiz Paulo Maia**, como parte de sua dissertação de mestrado no **Núcleo de Computação Eletrônica da Universidade Federal do Rio de Janeiro (NCE/UFRJ)**, defendida em 2001.

O objetivo do SOsim original era fornecer uma ferramenta educacional que facilitasse o ensino de Sistemas Operacionais, permitindo visualizar de forma animada conceitos como:

* multiprogramação;
* processos;
* mudanças de estado;
* escalonamento;
* gerência do processador;
* memória virtual;
* paginação.

A versão 2.0 do SOsim foi posteriormente integrada ao livro **Arquitetura de Sistemas Operacionais**, de Luiz Paulo Maia e Francisco Bartolomeu Machado. O site oficial também disponibiliza laboratórios associados ao livro.

**Fonte principal de inspiração:**

> Maia, L. P. **SOsim: Simulador para o Ensino de Sistemas Operacionais**. Tese de Mestrado, NCE/UFRJ, 2001.

Site oficial do SOsim:

https://www.training.com.br/sosim/

A página oficial informa as características e a história do projeto original.

---

## Sobre a relação com o SOsim original

O **SOsim Web não é uma conversão do executável original**.

O projeto original foi desenvolvido em **Borland Delphi 7.0** e era executado em versões antigas do Windows. O próprio site oficial informa que, à época, somente o executável estava disponível e que o código-fonte não estava disponibilizado publicamente.

O SOsim Web foi desenvolvido posteriormente como uma **reimplementação independente**, utilizando tecnologias web modernas:

```text
SOsim original
      │
      │ inspiração conceitual
      ▼
SOsim Web
      │
      ├── HTML
      ├── CSS
      └── JavaScript
```

Portanto:

* a **inspiração conceitual e pedagógica** vem do SOsim;
* os conceitos simulados são baseados na mesma área de Sistemas Operacionais;
* algumas funcionalidades foram deliberadamente reproduzidas ou adaptadas;
* a implementação web foi escrita independentemente;
* não foram utilizados arquivos executáveis ou código-fonte do SOsim original.

Este projeto deve ser entendido como uma **reimplementação educacional inspirada no SOsim**, e não como o código-fonte oficial ou uma versão oficial do SOsim.

---

# Funcionalidades

O SOsim Web atualmente permite experimentar os seguintes conceitos.

## Gerência de processos

* criação de processos;
* processos CPU-bound;
* processos I/O-bound;
* PID;
* estados de processos;
* visualização do PCB;
* suspensão;
* retomada;
* finalização;
* filas de processos;
* tempo de CPU;
* prioridade.

## Estados

O simulador representa estados como:

```text
Novo
  ↓
Pronto
  ↓
Executando
  ├──→ Bloqueado
  │       ↓
  │     Pronto
  │
  └──→ Finalizado
```

Também é possível suspender processos.

---

# Gerência do processador

O SOsim Web permite experimentar diferentes políticas de escalonamento:

* Round Robin;
* Circular + prioridade estática;
* Circular + prioridade dinâmica;
* escalonamento por prioridade.

O quantum pode ser configurado pelo usuário.

Também é possível acompanhar:

* processo atualmente executando;
* quantum restante;
* fila de prontos;
* fila de bloqueados;
* processos suspensos;
* trocas de contexto;
* linha do tempo da CPU.

---

# Gerência de memória

O modelo utiliza uma memória física simulada com:

```text
100 frames
```

Cada processo pode utilizar uma quantidade configurável de frames, com limite de cinco frames.

O simulador apresenta:

* frames livres;
* frames ocupados;
* processo associado ao frame;
* página armazenada no frame;
* utilização da memória.

---

# Memória virtual

O simulador apresenta uma representação simplificada de memória virtual baseada em paginação.

São simulados:

* páginas;
* frames;
* tabela de páginas;
* páginas válidas;
* páginas armazenadas no arquivo de paginação;
* page faults;
* paginação sob demanda;
* paginação antecipada;
* substituição local simplificada.

---

# Arquivo de paginação

O simulador também apresenta uma representação didática do **arquivo de paginação / swap**.

Uma página pode estar:

```text
Memória física
      ou
Arquivo de paginação
```

A movimentação entre esses espaços permite visualizar conceitos relacionados à memória virtual.

---

# Execução passo a passo

Uma das características importantes para utilização em sala de aula é o botão:

**Tick**

Cada acionamento executa um passo da simulação.

Isso permite ao professor demonstrar, por exemplo:

```text
Tick 0
   ↓
P1 executa
   ↓
Tick 1
   ↓
P1 executa
   ↓
Tick 2
   ↓
Quantum
   ↓
P2 executa
```

Esse recurso permite acompanhar o funcionamento do escalonador de maneira controlada.

---

# Estatísticas

O sistema apresenta informações como:

* quantidade de ticks;
* processos criados;
* processos finalizados;
* utilização da CPU;
* trocas de contexto;
* page faults;
* tempo de CPU por processo.

---

# Log

O simulador registra eventos importantes da execução.

Exemplo:

```text
[t=0] P1 criado.
[t=1] P1 entrou na CPU.
[t=4] Quantum de P1 expirou.
[t=4] P2 entrou na CPU.
[t=7] P2 solicitou I/O.
```

O log permite reconstruir a sequência de eventos da simulação.

---

# Tecnologias

O SOsim Web foi desenvolvido utilizando apenas tecnologias web padrão:

```text
HTML5
CSS3
JavaScript
```

Não são necessários:

* banco de dados;
* servidor;
* PHP;
* Python;
* Node.js;
* bibliotecas externas.

Consequentemente, o projeto pode ser executado diretamente no navegador.

---

# Executando localmente

Clone o repositório:

```bash
git clone https://github.com/marcosroquerosa/sosim-web.git
```

Entre na pasta:

```bash
cd sosim-web
```

Uma alternativa simples é abrir diretamente:

```text
index.html
```

Também é possível utilizar um servidor HTTP local:

```bash
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000
```

---

# Publicando no GitHub Pages

O projeto foi estruturado para funcionar como um site estático.

No GitHub:

```text
Repository
    ↓
Settings
    ↓
Pages
    ↓
Deploy from a branch
    ↓
main
    ↓
/ (root)
```

Após a publicação, o GitHub Pages disponibilizará o endereço do projeto.

---

# Estrutura do projeto

```text
sosim-web/
│
├── index.html
├── styles.css
├── app.js
├── README.md
├── DOCUMENTACAO.md
└── LICENSE
```

### `index.html`

Define a estrutura da interface.

### `styles.css`

Contém o estilo visual da aplicação.

### `app.js`

Contém o mecanismo de simulação:

* processos;
* escalonamento;
* CPU;
* memória;
* paginação;
* estatísticas;
* log.

### `README.md`

Documentação introdutória e informações sobre o projeto.

### `DOCUMENTACAO.md`

Manual detalhado de utilização e glossário de Sistemas Operacionais.

---

# Finalidade educacional

O SOsim Web foi desenvolvido principalmente para utilização em disciplinas de:

* Sistemas Operacionais;
* Arquitetura de Computadores;
* Organização de Computadores;
* Fundamentos de Sistemas Operacionais;
* cursos de Tecnologia da Informação;
* cursos de Ciência da Computação.

A proposta é permitir que o estudante observe experimentalmente conceitos que normalmente são apresentados apenas de maneira teórica.

---

# Exemplo de atividade

O professor pode solicitar:

1. Criar dois processos CPU-bound.
2. Criar um processo I/O-bound.
3. Configurar quantum igual a 4.
4. Iniciar a simulação.
5. Observar a fila de prontos.
6. Observar o processo executando.
7. Identificar uma troca de contexto.
8. Observar o bloqueio do processo I/O-bound.
9. Observar seu retorno à fila de prontos.
10. Consultar o PCB.
11. Observar a utilização da memória.
12. Identificar page faults.
13. Alterar o quantum.
14. Repetir o experimento.
15. Comparar os resultados.

---

# Referências e créditos

## SOsim — Simulador para o Ensino de Sistemas Operacionais

**Autor:** Luiz Paulo Maia

**Instituição:** Núcleo de Computação Eletrônica — Universidade Federal do Rio de Janeiro (NCE/UFRJ)

**Ano:** 2001

**Site oficial:**

https://www.training.com.br/sosim/

O site oficial apresenta a história, características, materiais didáticos e versões do SOsim.

---

## Arquitetura de Sistemas Operacionais

MAIA, Luiz Paulo; MACHADO, Francisco Bartolomeu.

**Arquitetura de Sistemas Operacionais.** 4. ed. Rio de Janeiro: LTC, 2007.

O próprio site do SOsim informa que a versão 2.0 foi integrada ao livro e que os laboratórios apresentados na obra utilizam o simulador.

---

## Trabalhos relacionados ao SOsim

MAIA, L. P.; MACHADO, F. B.; PACHECO, A. **A Constructivist Framework for Operating Systems Education: A Pedagogic Proposal Using the SOsim.** 10th Annual Conference on Innovation and Technology in Computer Science Education (ITiCSE), 2005.

MACHADO, F. B.; MAIA, L. P. **Um Framework Construtivista no Aprendizado de Sistemas Operacionais — Uma Proposta Pedagógica com o Uso do Simulador SOsim.** XII Workshop de Educação em Computação (WEI), Sociedade Brasileira de Computação, 2004.

MAIA, L. P.; PACHECO, A. C. **A Simulator Supporting Lectures on Operating Systems.** 33rd ASEE/IEEE Frontiers in Education Conference, 2003.

---

# Créditos da reimplementação Web

**SOsim Web**

Reimplementação educacional para ambiente web.

Tecnologias:

```text
HTML5
CSS3
JavaScript
GitHub Pages
```

O projeto não é uma distribuição oficial do SOsim original e não deve ser confundido com o software desenvolvido originalmente por Luiz Paulo Maia.

A referência ao SOsim original é feita exclusivamente para reconhecer sua contribuição como **inspiração conceitual, pedagógica e funcional** para esta reimplementação.

---

# Licença

A licença deste repositório deve ser interpretada em conjunto com os créditos e referências ao SOsim original.

O SOsim Web é uma implementação independente.

Antes de redistribuir ou incorporar elementos específicos do software original, sua documentação, código, imagens ou outros materiais protegidos, verifique as respectivas condições de licença e direitos autorais.

---

# Aviso

**SOsim Web é um projeto educacional independente.**

Não possui vínculo oficial, comercial ou institucional com os autores do SOsim original, com a UFRJ, com o NCE/UFRJ, com a editora LTC ou com qualquer outra instituição relacionada ao projeto original.

A finalidade desta implementação é preservar e ampliar, em uma plataforma web moderna, o valor pedagógico da simulação de Sistemas Operacionais.
