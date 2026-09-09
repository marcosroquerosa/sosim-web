/**
 * Núcleo de Simulação SOsim Web
 * Baseado na Dissertação de Mestrado de Luiz Paulo Maia ( UFRJ / NCE - 2001 )
 */

class Process {
  constructor(pid, priority, maxFrames, type, color) {
    this.pid = pid;
    this.basePriority = parseInt(priority);
    this.dynamicPriority = parseInt(priority);
    this.maxFrames = parseInt(maxFrames);
    this.type = type; // 'CPU', 'IO_1', 'IO_2', 'IO_3'
    this.color = color;
    this.state = 'READY'; // READY, RUNNING, WAITING
    this.quantumUsed = 0;
    
    // Tabela de Páginas do Processo (5 páginas virtuais fixas - Cap 4.8.2)
    this.pageTable = Array.from({ length: 5 }, (_, i) => ({
      vpn: i,
      pfn: null,
      valid: false,
      modified: false
    }));
    this.allocatedFrames = [];
    this.pc = 0; // Program Counter (instruções simuladas)
  }
}

class OSKernel {
  constructor() {
    this.ramSize = 100; // 100 Frames reais (Cap 4.8)
    this.ram = Array(this.ramSize).fill(null);
    this.fpl = Array.from({ length: this.ramSize }, (_, i) => i); // Free Page List
    this.mpl = []; // Modified Page List

    this.processes = [];
    this.readyQueues = Array.from({ length: 16 }, () => []); // 16 Níveis de Prioridade
    this.waitingQueue = [];
    this.runningProcess = null;

    this.isRunning = false;
    this.clockInterval = null;
    this.clockFreq = 1000;
    this.quantum = 3;
    this.preemptionEnabled = true;
    this.dynamicPriorityEnabled = true;
    this.fetchPolicy = 'prepaging';

    this.pidCounter = 1000;
    this.initUI();
  }

  log(msg) {
    const out = document.getElementById('log-output');
    const p = document.createElement('p');
    const timestamp = new Date().toLocaleTimeString();
    p.textContent = `[${timestamp}]${msg}`;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  }

  createProcess(priority, maxFrames, type, color) {
    const pid = this.pidCounter++;
    const proc = new Process(pid, priority, maxFrames, type, color);
    this.processes.push(proc);

    if (this.fetchPolicy === 'prepaging') {
      // Aloca páginas antecipadamente conforme limite de frames
      for (let i = 0; i < proc.maxFrames; i++) {
        this.allocatePage(proc, i);
      }
    }

    this.enqueueReady(proc);
    this.log(`Processo PID ${pid} criado. Prioridade: ${priority}, Tipo:${type}`);
    this.render();
  }

  allocatePage(proc, vpn) {
    if (proc.allocatedFrames.length >= proc.maxFrames) {
      // Política de substituição FIFO Local com Buffer de Páginas (Cap 3.4.7 / 4.8.4)
      const freedVpn = proc.allocatedFrames.shift();
      const pteToFree = proc.pageTable[freedVpn];
      pteToFree.valid = false;
      
      if (pteToFree.modified) {
        this.mpl.push(pteToFree.pfn);
        this.log(`PID ${proc.pid}: VPN${freedVpn} enviada para MPL (Modificada).`);
      } else {
        this.fpl.push(pteToFree.pfn);
      }
      pteToFree.pfn = null;
    }

    if (this.fpl.length === 0) {
      this.flushMPL(); // Libera MPL para FPL quando sem frames livres
    }

    if (this.fpl.length > 0) {
      const pfn = this.fpl.shift();
      proc.pageTable[vpn].pfn = pfn;
      proc.pageTable[vpn].valid = true;
      proc.allocatedFrames.push(vpn);
      this.ram[pfn] = { pid: proc.pid, color: proc.color, modified: false };
    } else {
      this.log(`ERRO: Memória Exaurida! Thrashing detectado.`);
    }
  }

  flushMPL() {
    this.log(`Limpando Lista de Páginas Modificadas (MPL) para FPL.`);
    while (this.mpl.length > 0) {
      const pfn = this.mpl.shift();
      if (this.ram[pfn]) this.ram[pfn].modified = false;
      this.fpl.push(pfn);
    }
  }

  enqueueReady(proc) {
    proc.state = 'READY';
    proc.quantumUsed = 0;
    this.readyQueues[proc.dynamicPriority].push(proc);
  }

  getHighestPriorityReady() {
    for (let p = 15; p >= 0; p--) {
      if (this.readyQueues[p].length > 0) {
        return this.readyQueues[p].shift();
      }
    }
    return null;
  }

  tick() {
    // Trata Processos em Espera (I/O)
    if (this.waitingQueue.length > 0) {
      const ioProc = this.waitingQueue.shift();
      // Aplica Boost Dinâmico na volta do I/O (Cap 4.7, Tab. 4.5)
      if (this.dynamicPriorityEnabled) {
        let boost = 1;
        if (ioProc.type === 'IO_2') boost = 2;
        if (ioProc.type === 'IO_3') boost = 3;
        ioProc.dynamicPriority = Math.min(15, ioProc.basePriority + boost);
        this.log(`PID ${ioProc.pid} retornou do I/O. Boost de prioridade -> ${ioProc.dynamicPriority}`);
      }
      this.enqueueReady(ioProc);
    }

    // Checa Preempção por Prioridade
    if (this.runningProcess && this.preemptionEnabled) {
      const highestReady = this.getHighestPriorityReady();
      if (highestReady) {
        if (highestReady.dynamicPriority > this.runningProcess.dynamicPriority) {
          this.log(`Preempção por Prioridade: PID ${highestReady.pid} (Prio ${highestReady.dynamicPriority}) desaloja PID${this.runningProcess.pid}`);
          this.enqueueReady(this.runningProcess);
          this.runningProcess = highestReady;
          this.runningProcess.state = 'RUNNING';
        } else {
          // Devolve para a fila se não for maior
          this.readyQueues[highestReady.dynamicPriority].unshift(highestReady);
        }
      }
    }

    // Aloca CPU se ociosa
    if (!this.runningProcess) {
      this.runningProcess = this.getHighestPriorityReady();
      if (this.runningProcess) this.runningProcess.state = 'RUNNING';
    }

    // Execução da instrução do processo corrente
    if (this.runningProcess) {
      const proc = this.runningProcess;
      proc.quantumUsed++;
      proc.pc = (proc.pc + 1) % 5; // Ciclo sobre 5 páginas simuladas

      // Teste de Page Fault na instrução
      if (!proc.pageTable[proc.pc].valid) {
        this.log(`Page Fault (Hardware) no PID ${proc.pid} na página virtual ${proc.pc}`);
        this.allocatePage(proc, proc.pc);
      }

      // Simula alteração de memória na primeira instrução (Cap 4.6.1)
      if (proc.pc === 0) {
        proc.pageTable[0].modified = true;
        const pfn = proc.pageTable[0].pfn;
        if (pfn !== null && this.ram[pfn]) this.ram[pfn].modified = true;
      }

      // Sorteio de I/O em função do perfil
      let generatedIO = false;
      if (proc.type.startsWith('IO')) {
        if (Math.random() < 0.4) { // 40% de chance de solicitar I/O
          generatedIO = true;
        }
      }

      if (generatedIO) {
        this.log(`PID ${proc.pid} solicitou operação de I/O (${proc.type}).`);
        proc.state = 'WAITING';
        this.waitingQueue.push(proc);
        this.runningProcess = null;
      } else if (proc.quantumUsed >= this.quantum) {
        // Preempção por Quantum (Fim de Time-Slice)
        this.log(`Quantum expirado para PID ${proc.pid}. Reescalonando.`);
        // Redução gradual de prioridade ao esgotar quantum (Escalonamento adaptativo)
        if (this.dynamicPriorityEnabled && proc.dynamicPriority > proc.basePriority) {
          proc.dynamicPriority--;
        }
        this.enqueueReady(proc);
        this.runningProcess = null;
      }
    }

    this.render();
  }

  toggleSimulation() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.clockInterval = setInterval(() => this.tick(), this.clockFreq);
      this.log("Simulação iniciada.");
    } else {
      clearInterval(this.clockInterval);
      this.log("Simulação pausada.");
    }
  }

  initUI() {
    document.getElementById('btn-toggle-sim').addEventListener('click', () => this.toggleSimulation());
    document.getElementById('clock-freq').addEventListener('change', (e) => {
      this.clockFreq = parseInt(e.target.value);
      if (this.isRunning) {
        clearInterval(this.clockInterval);
        this.clockInterval = setInterval(() => this.tick(), this.clockFreq);
      }
    });

    document.getElementById('quantum-val').addEventListener('change', (e) => {
      this.quantum = parseInt(e.target.value);
    });

    document.getElementById('chk-preemption').addEventListener('change', (e) => {
      this.preemptionEnabled = e.target.checked;
    });

    document.getElementById('chk-dynamic-prio').addEventListener('change', (e) => {
      this.dynamicPriorityEnabled = e.target.checked;
    });

    document.getElementById('fetch-policy').addEventListener('change', (e) => {
      this.fetchPolicy = e.target.value;
    });

    const modal = document.getElementById('modal-process');
    document.getElementById('btn-create-process').addEventListener('click', () => modal.showModal());
    document.getElementById('btn-confirm-process').addEventListener('click', (e) => {
      e.preventDefault();
      const prio = document.getElementById('proc-prio').value;
      const frames = document.getElementById('proc-frames').value;
      const type = document.getElementById('proc-type').value;
      const color = document.getElementById('proc-color').value;
      this.createProcess(prio, frames, type, color);
      modal.close();
    });

    this.renderRamGrid();
    this.renderReadyQueues();
  }

  renderRamGrid() {
    const grid = document.getElementById('ram-grid');
    grid.innerHTML = '';
    for (let i = 0; i < this.ramSize; i++) {
      const cell = document.createElement('div');
      cell.className = 'ram-frame';
      cell.id = `frame-${i}`;
      cell.textContent = i;
      grid.appendChild(cell);
    }
  }

  renderReadyQueues() {
    const container = document.getElementById('ready-queues');
    container.innerHTML = '';
    for (let p = 15; p >= 0; p--) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '5px';
      row.style.marginBottom = '2px';
      row.innerHTML = `<span style="width: 60px;">Prio ${p}:</span><div id="queue-${p}" class="process-slot-group"></div>`;
      container.appendChild(row);
    }
  }

  render() {
    // Renderiza CPU
    const cpuSlot = document.getElementById('cpu-running');
    cpuSlot.innerHTML = '';
    if (this.runningProcess) {
      const node = document.createElement('div');
      node.className = 'process-node';
      node.style.backgroundColor = this.runningProcess.color;
      node.textContent = this.runningProcess.pid;
      cpuSlot.appendChild(node);
    }

    // Renderiza Filas de Pronto
    for (let p = 0; p <= 15; p++) {
      const qDiv = document.getElementById(`queue-${p}`);
      qDiv.innerHTML = '';
      this.readyQueues[p].forEach(proc => {
        const node = document.createElement('div');
        node.className = 'process-node';
        node.style.backgroundColor = proc.color;
        node.textContent = proc.pid;
        qDiv.appendChild(node);
      });
    }

    // Renderiza Fila de Espera
    const waitDiv = document.getElementById('waiting-queue');
    waitDiv.innerHTML = '';
    this.waitingQueue.forEach(proc => {
      const node = document.createElement('div');
      node.className = 'process-node';
      node.style.backgroundColor = proc.color;
      node.textContent = proc.pid;
      waitDiv.appendChild(node);
    });

    // Renderiza RAM e Status de Memória
    document.getElementById('fpl-size').textContent = this.fpl.length;
    document.getElementById('mpl-size').textContent = this.mpl.length;

    for (let i = 0; i < this.ramSize; i++) {
      const cell = document.getElementById(`frame-${i}`);
      const data = this.ram[i];
      if (data && this.fpl.indexOf(i) === -1 && this.mpl.indexOf(i) === -1) {
        cell.style.backgroundColor = data.color;
        cell.classList.toggle('modified', data.modified);
      } else {
        cell.style.backgroundColor = '#2a2a2a';
        cell.classList.remove('modified');
      }
    }
  }
}

// Instanciação do Kernel
window.onload = () => {
  window.kernel = new OSKernel();
};
