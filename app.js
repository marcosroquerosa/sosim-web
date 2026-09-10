(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const state = {
    clock: 0,
    running: false,
    timer: null,
    nextPid: 1,
    processes: [],
    memory: Array(100).fill(null),
    swap: [],
    timeline: [],
    log: [],
    stats: { created: 0, finished: 0, cpuTicks: 0, context: 0, faults: 0 },
    scheduler: 'rr',
    quantum: 4,
    speed: 650,
    pagePolicy: 'demand',
    dynamicBoost: true
  };

  const labels = {
    ready: 'Pronto', running: 'Executando', blocked: 'Bloqueado',
    suspended: 'Suspenso', terminated: 'Finalizado', new: 'Novo'
  };

  function log(message) {
    state.log.unshift({ t: state.clock, msg: message });
    state.log = state.log.slice(0, 500);
    renderLog();
  }

  function makeProcess(type, priority, frames) {
    const pid = state.nextPid++;
    const p = {
      pid, type, priority: Number(priority), basePriority: Number(priority),
      framesLimit: Number(frames), state: 'ready', cpu: 0,
      quantumUsed: 0, wait: 0, ioTimer: 0, createdAt: state.clock,
      pageFaults: 0, pages: [], frameIds: [], lastRun: -1
    };
    for (let i = 0; i < 5; i++) {
      p.pages.push({ page: i, valid: false, frame: null, inSwap: true });
    }
    allocateFrames(p, Math.min(p.framesLimit, state.pagePolicy === 'prefetch' ? 2 : 1));
    state.processes.push(p);
    state.stats.created++;
    log(`P${pid} criado (${type === 'cpu' ? 'CPU-bound' : 'I/O-bound'}, prioridade ${priority}, ${frames} frames).`);
  }

  function allocateFrames(p, count) {
    for (let i = 0; i < p.pages.length && p.frameIds.length < count; i++) {
      if (p.pages[i].valid) continue;
      const idx = state.memory.findIndex(x => x === null);
      if (idx < 0) break;
      state.memory[idx] = { pid: p.pid, page: i };
      p.frameIds.push(idx);
      p.pages[i].valid = true;
      p.pages[i].frame = idx;
      p.pages[i].inSwap = false;
    }
  }

  function freeFrames(p) {
    p.frameIds.forEach(i => { state.memory[i] = null; });
    p.frameIds = [];
    p.pages.forEach(pg => { pg.valid = false; pg.frame = null; pg.inSwap = true; });
  }

  function chooseReady() {
    const ready = state.processes.filter(p => p.state === 'ready');
    if (!ready.length) return null;

    if (state.scheduler === 'priority' || state.scheduler === 'rr-static' || state.scheduler === 'rr-dynamic') {
      ready.sort((a,b) => {
        const pa = state.scheduler === 'rr-dynamic' ? a.priority + Math.min(a.wait, 10) : a.priority;
        const pb = state.scheduler === 'rr-dynamic' ? b.priority + Math.min(b.wait, 10) : b.priority;
        return pb - pa || a.lastRun - b.lastRun || a.pid - b.pid;
      });
    } else {
      ready.sort((a,b) => a.lastRun - b.lastRun || a.pid - b.pid);
    }
    return ready[0];
  }

  function dispatch() {
    const current = state.processes.find(p => p.state === 'running');
    if (current) return current;

    const next = chooseReady();
    if (!next) return null;
    next.state = 'running';
    next.quantumUsed = 0;
    state.stats.context++;
    log(`Despacho: P${next.pid} entrou na CPU.`);
    return next;
  }

  function pageReference(p) {
    if (!p || !p.frameIds.length) return;
    const page = Math.floor(Math.random() * p.pages.length);
    const pg = p.pages[page];
    if (pg.valid) return;
    state.stats.faults++;
    p.pageFaults++;
    if (p.frameIds.length < p.framesLimit) {
      allocateFrames(p, 1);
      log(`Page fault: P${p.pid}, página ${page} carregada.`);
      return;
    }
    const victimFrame = p.frameIds[Math.floor(Math.random() * p.frameIds.length)];
    const victim = state.memory[victimFrame];
    if (victim) {
      const vp = p.pages.find(x => x.page === victim.page);
      if (vp) { vp.valid = false; vp.frame = null; vp.inSwap = true; }
      p.pages[page].valid = true;
      p.pages[page].frame = victimFrame;
      p.pages[page].inSwap = false;
      state.memory[victimFrame] = { pid: p.pid, page };
      log(`Page fault: P${p.pid}, página ${page} substituída no frame ${victimFrame}.`);
    }
  }

  function tick() {
    state.clock++;
    let current = state.processes.find(p => p.state === 'running');

    if (!current) current = dispatch();

    if (current) {
      current.cpu++;
      current.quantumUsed++;
      current.lastRun = state.clock;
      state.stats.cpuTicks++;
      current.wait = 0;
      pageReference(current);

      if (current.type === 'io' && current.cpu % 3 === 0) {
        current.state = 'blocked';
        current.ioTimer = 3 + Math.floor(Math.random() * 3);
        current.quantumUsed = 0;
        log(`P${current.pid} solicitou I/O e foi bloqueado por ${current.ioTimer} ticks.`);
      } else if (state.scheduler !== 'priority' && current.quantumUsed >= state.quantum) {
        current.state = 'ready';
        current.quantumUsed = 0;
        log(`Quantum de P${current.pid} expirou.`);
      } else if (current.type === 'cpu' && current.cpu >= 25) {
        current.state = 'terminated';
        state.stats.finished++;
        freeFrames(current);
        log(`P${current.pid} finalizado após ${current.cpu} ticks de CPU.`);
      }
    }

    state.processes.forEach(p => {
      if (p.state === 'ready') {
        p.wait++;
        if (state.dynamicBoost && state.scheduler === 'rr-dynamic' && p.wait % 4 === 0) {
          p.priority = Math.min(15, p.priority + 1);
        }
      }
      if (p.state === 'blocked') {
        p.ioTimer--;
        if (p.ioTimer <= 0) {
          p.state = 'ready';
          p.wait = 0;
          log(`P${p.pid} terminou I/O e voltou à fila de prontos.`);
        }
      }
    });

    const after = state.processes.find(p => p.state === 'running');
    if (!after) dispatch();
    state.timeline.push(after ? after.pid : 0);
    if (state.timeline.length > 80) state.timeline.shift();

    renderAll();
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.timer = setInterval(tick, state.speed);
    renderHeader();
  }

  function pause() {
    state.running = false;
    clearInterval(state.timer);
    state.timer = null;
    renderHeader();
  }

  function reset() {
    pause();
    state.clock = 0; state.nextPid = 1; state.processes = [];
    state.memory = Array(100).fill(null); state.swap = []; state.timeline = []; state.log = [];
    state.stats = { created: 0, finished: 0, cpuTicks: 0, context: 0, faults: 0 };
    log('Simulador reiniciado.');
    renderAll();
  }

  function suspend(pid) {
    const p = state.processes.find(x => x.pid === pid);
    if (!p || p.state === 'terminated') return;
    if (p.state === 'running') {
      p.state = 'suspended'; p.quantumUsed = 0;
      log(`P${pid} suspenso durante a execução.`);
    } else if (p.state === 'ready' || p.state === 'blocked') {
      p.state = 'suspended';
      log(`P${pid} suspenso.`);
    }
    renderAll();
  }

  function resume(pid) {
    const p = state.processes.find(x => x.pid === pid);
    if (!p || p.state !== 'suspended') return;
    p.state = 'ready'; p.wait = 0;
    log(`P${pid} retomado e colocado na fila de prontos.`);
    renderAll();
  }

  function kill(pid) {
    const p = state.processes.find(x => x.pid === pid);
    if (!p || p.state === 'terminated') return;
    p.state = 'terminated'; p.quantumUsed = 0; freeFrames(p);
    state.stats.finished++;
    log(`P${pid} finalizado manualmente.`);
    renderAll();
  }

  function showPCB(pid) {
    const p = state.processes.find(x => x.pid === pid);
    if (!p) return;
    $('#pcbTitle').textContent = `P${p.pid}`;
    $('#pcbContent').innerHTML = `
      <div class="pcb-grid">
        <div class="pcb-item"><small>PID</small><b>P${p.pid}</b></div>
        <div class="pcb-item"><small>Estado</small><b>${labels[p.state]}</b></div>
        <div class="pcb-item"><small>Tipo</small><b>${p.type === 'cpu' ? 'CPU-bound' : 'I/O-bound'}</b></div>
        <div class="pcb-item"><small>Prioridade</small><b>${p.priority}</b></div>
        <div class="pcb-item"><small>Tempo de CPU</small><b>${p.cpu} ticks</b></div>
        <div class="pcb-item"><small>Page faults</small><b>${p.pageFaults}</b></div>
        <div class="pcb-item"><small>Frames</small><b>${p.framesLimit}</b></div>
        <div class="pcb-item"><small>Frames físicos</small><b>${p.frameIds.join(', ') || '—'}</b></div>
      </div>
      <div class="pcb-pages">
        <h3>Tabela de páginas</h3>
        <table><thead><tr><th>Página</th><th>Validade</th><th>Frame</th><th>Local</th></tr></thead>
        <tbody>${p.pages.map(pg => `<tr><td>${pg.page}</td><td>${pg.valid ? '1' : '0'}</td><td>${pg.frame ?? '—'}</td><td>${pg.valid ? 'Memória' : 'Swap'}</td></tr>`).join('')}</tbody></table>
      </div>`;
    $('#pcbDialog').showModal();
  }

  function renderHeader() {
    $('#clockValue').textContent = state.clock;
    $('#runningPid').textContent = (state.processes.find(p => p.state === 'running')?.pid ? `P${state.processes.find(p => p.state === 'running').pid}` : '—');
    $('#readyCount').textContent = state.processes.filter(p => p.state === 'ready').length;
    $('#blockedCount').textContent = state.processes.filter(p => p.state === 'blocked').length;
    const badge = $('#runBadge');
    badge.textContent = state.running ? 'EXECUTANDO' : 'PARADA';
    badge.className = `badge ${state.running ? 'running' : 'stopped'}`;
  }

  function renderProcesses() {
    const tbody = $('#processTable');
    tbody.innerHTML = state.processes.length ? state.processes.map(p => `
      <tr>
        <td><b>P${p.pid}</b></td>
        <td>${p.type === 'cpu' ? 'CPU-bound' : 'I/O-bound'}</td>
        <td><span class="state ${p.state}">${labels[p.state]}</span></td>
        <td>${p.priority}</td><td>${p.cpu}</td><td>${p.frameIds.length}/${p.framesLimit}</td>
        <td>${p.wait}</td>
        <td><div class="action-row">
          <button data-action="pcb" data-pid="${p.pid}">PCB</button>
          ${p.state === 'suspended' ? `<button data-action="resume" data-pid="${p.pid}">Prosseguir</button>` : `<button data-action="suspend" data-pid="${p.pid}">Suspender</button>`}
          ${p.state !== 'terminated' ? `<button data-action="kill" data-pid="${p.pid}">Finalizar</button>` : ''}
        </div></td>
      </tr>`).join('') : `<tr><td colspan="8" style="text-align:center;color:#64748b;padding:30px">Nenhum processo criado.</td></tr>`;
  }

  function renderProcessor() {
    const p = state.processes.find(x => x.state === 'running');
    $('#cpuProcess').textContent = p ? `P${p.pid}` : 'IDLE';
    $('#cpuType').textContent = p ? `${p.type === 'cpu' ? 'CPU-bound' : 'I/O-bound'} • ${p.cpu} ticks de CPU` : 'Aguardando processo';
    $('#quantumLeft').textContent = p ? Math.max(0, state.quantum - p.quantumUsed) : '—';
    const names = {rr:'Circular', 'rr-static':'Circular + prioridade estática', 'rr-dynamic':'Circular + prioridade dinâmica', priority:'Por prioridade'};
    $('#policyLabel').textContent = names[state.scheduler];
    renderQueue('#readyQueue', state.processes.filter(p=>p.state==='ready'));
    renderQueue('#blockedQueue', state.processes.filter(p=>p.state==='blocked'));
    renderQueue('#suspendedQueue', state.processes.filter(p=>p.state==='suspended'));
    $('#timeline').innerHTML = state.timeline.map((pid,i) => `<div class="time-cell ${pid ? '' : 'idle'}" title="tick ${state.clock - state.timeline.length + i + 1}">${pid ? 'P'+pid : '—'}</div>`).join('');
  }

  function renderQueue(sel, arr) {
    $(sel).innerHTML = arr.length ? arr.map(p => `<span class="queue-item ${p.state==='running'?'active':''}">P${p.pid} • ${p.priority}</span>`).join('') : `<span style="color:#64748b;font-size:11px">vazia</span>`;
  }

  function renderMemory() {
    const used = state.memory.filter(Boolean).length;
    $('#framesUsed').textContent = `${used} / 100`;
    $('#memoryBar').style.width = `${used}%`;
    $('#memoryGrid').innerHTML = state.memory.map((x,i) => x
      ? `<div class="frame used" title="Frame ${i} • P${x.pid} • página ${x.page}">P${x.pid}<small>${x.page}</small></div>`
      : `<div class="frame" title="Frame ${i}">${i}</div>`).join('');
  }

  function renderPaging() {
    $('#pagingTable').innerHTML = state.processes.filter(p=>p.state!=='terminated').map(p => `
      <div class="page-card">
        <h3>P${p.pid} — ${p.type === 'cpu' ? 'CPU-bound' : 'I/O-bound'}</h3>
        <div class="pages">${p.pages.map(pg => `<div class="page ${pg.valid?'valid':'swap'}">Pág ${pg.page}<br>${pg.valid ? `F${pg.frame}` : 'SWAP'}</div>`).join('')}</div>
      </div>`).join('') || `<div class="page-card">Nenhuma tabela de páginas disponível.</div>`;
  }

  function renderStats() {
    $('#statTicks').textContent = state.clock;
    $('#statCreated').textContent = state.stats.created;
    $('#statFinished').textContent = state.stats.finished;
    $('#statCpu').textContent = state.clock ? `${Math.round(state.stats.cpuTicks/state.clock*100)}%` : '0%';
    $('#statContext').textContent = state.stats.context;
    $('#statFaults').textContent = state.stats.faults;
    const max = Math.max(1, ...state.processes.map(p=>p.cpu));
    $('#cpuChart').innerHTML = state.processes.map(p => `<div class="bar-row"><span>P${p.pid}</span><div class="bar-track"><div class="bar-fill" style="width:${p.cpu/max*100}%"></div></div><b>${p.cpu}</b></div>`).join('') || '<span style="color:#64748b">Crie processos para gerar dados.</span>';
  }

  function renderLog() {
    $('#log').innerHTML = state.log.map(x => `<div class="log-line"><span class="log-time">[t=${x.t}]</span> <span class="log-event">${x.msg}</span></div>`).join('');
  }

  function renderAll() {
    renderHeader(); renderProcesses(); renderProcessor(); renderMemory(); renderPaging(); renderStats(); renderLog();
  }

  function bind() {
    $('#btnStart').onclick = start;
    $('#btnPause').onclick = pause;
    $('#btnStep').onclick = () => { if (!state.running) tick(); };
    $('#btnReset').onclick = reset;
    $('#btnCreate').onclick = () => {
      const type = $('#processType').value;
      const priority = Math.max(0, Math.min(15, Number($('#processPriority').value)));
      const frames = Math.max(1, Math.min(5, Number($('#processFrames').value)));
      const count = Math.max(1, Math.min(10, Number($('#processCount').value)));
      for (let i=0;i<count;i++) makeProcess(type, priority, frames);
      renderAll();
    };
    $('#schedulerPolicy').onchange = e => { state.scheduler = e.target.value; log(`Política de escalonamento alterada.`); renderAll(); };
    $('#quantum').oninput = e => { state.quantum = Number(e.target.value); $('#quantumOut').textContent = `${state.quantum} ticks`; };
    $('#speed').oninput = e => {
      state.speed = Number(e.target.value); $('#speedOut').textContent = `${state.speed} ms/tick`;
      if (state.running) { pause(); start(); }
    };
    $('#pagePolicy').onchange = e => { state.pagePolicy = e.target.value; log(`Política de busca de páginas: ${e.target.value === 'demand' ? 'sob demanda' : 'antecipada'}.`); };
    $('#dynamicBoost').onchange = e => state.dynamicBoost = e.target.checked;
    $('#btnClearLog').onclick = () => { state.log=[]; renderLog(); };
    $('#closePcb').onclick = () => $('#pcbDialog').close();

    document.addEventListener('click', e => {
      const action = e.target.dataset.action;
      const pid = Number(e.target.dataset.pid);
      if (action === 'pcb') showPCB(pid);
      if (action === 'suspend') suspend(pid);
      if (action === 'resume') resume(pid);
      if (action === 'kill') kill(pid);
      const view = e.target.dataset.view;
      if (view) switchView(view);
    });
  }

  function switchView(view) {
    $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  }

  bind();
  log('SOsim Web iniciado. Crie processos para começar.');
  renderAll();
})();
