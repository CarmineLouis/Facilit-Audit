/**
 * FACILIT AUDIT - CORE ENGINE (V8.0)
 * Desenvolvido por: Carmine Louis Carneiro
 * Ajuste: Conversão de Moeda (BRL) e Data Excel
 */

// =============================================================
// 1. CONFIGURAÇÕES - MANTIDO
// =============================================================
const CONFIG = {
  numPointsInicial: 30, limiteCrescimento: 100, distanciaSegmentos: 10,    
  velocidadeSeguimento: 0.4, tamanhoSimbolo: 32, velocidadeSimbolo: 10,     
  limiteParaExplodir: 12, duracaoExplosao: 4000, quantidadeParticulas: 100, 
  velocidadeExplosao: 10, gravidadeFogos: 0.15, tamanhoParticula: 20       
};
const SYMBOLS = ['+', '-', '×', '÷', '√', 'π', '∑', '∫', 'ℝ', '¾', '½', 'Δ', 'θ', 'λ', '∞', '≠', '≡', '∝', '∇', '∃', '∀', '∈', '∉', '∪', '∩', '⊂', '⊃', '⊆', '⊇', '∧', '∨', '¬'];

// =============================================================
// 2. SETUP DE INTERFACE
// =============================================================
const navButtons = document.querySelectorAll('[data-nav]');
const pages = document.querySelectorAll('.page');
const homeOverlay = document.getElementById('home-overlay');
const canvasBg = document.getElementById('bg');
const ctx = canvasBg.getContext('2d', { alpha: false }); 

function navigate(targetId) {
  pages.forEach(p => p.classList.add('hidden')); 
  homeOverlay.classList.add('hidden');           
  if (targetId === 'home') {
    homeOverlay.classList.remove('hidden');      
    canvasBg.style.opacity = "1";                
  } else {
    const targetPage = document.getElementById(targetId);
    if (targetPage) { targetPage.classList.remove('hidden'); canvasBg.style.opacity = "0.2"; }
  }
}
navButtons.forEach(btn => btn.addEventListener('click', () => navigate(btn.getAttribute('data-nav'))));

// =============================================================
// 3. MOTOR DE ANIMAÇÃO (MANTIDO)
// =============================================================
let width, height, points = [], mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let baseHue = 150, hueOffset = 0, rainbowHue = 0, directionForward = true;
let food = { x: 0, y: 0, symbol: '', vx: 0, vy: 0 }, score = 0;
let particles = [], isExploding = false, currentNumPoints = CONFIG.numPointsInicial;

function spawnFood() {
  food.x = Math.random() * (window.innerWidth - 100) + 50;
  food.y = Math.random() * (window.innerHeight - 100) + 50;
  food.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  food.vx = (Math.random() - 0.5) * CONFIG.velocidadeSimbolo;
  food.vy = (Math.random() - 0.5) * CONFIG.velocidadeSimbolo;
}
function createFireworkExplosion(x, y) {
  isExploding = true; particles = [];
  for (let i = 0; i < CONFIG.quantidadeParticulas; i++) {
    const angle = Math.random() * Math.PI * 2, speed = Math.random() * CONFIG.velocidadeExplosao + 2;
    particles.push({ x, y, symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, hue: Math.random() * 360, size: CONFIG.tamanhoParticula, gravity: CONFIG.gravidadeFogos });
  }
  currentNumPoints = CONFIG.numPointsInicial; score = 0; 
  setTimeout(() => { isExploding = false; points = []; for (let i = 0; i < currentNumPoints; i++) points.push({ x: width/2, y: height/2 }); spawnFood(); }, CONFIG.duracaoExplosao);
}
function resize() { width = canvasBg.width = window.innerWidth; height = canvasBg.height = window.innerHeight; spawnFood(); }
window.addEventListener('resize', resize); resize();
for (let i = 0; i < currentNumPoints; i++) points.push({ x: width/2, y: height/2 });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', e => { if (e.button === 0) directionForward = !directionForward; });
function animate() {
  ctx.fillStyle = '#070b10'; ctx.fillRect(0, 0, width, height);
  hueOffset += 0.8; rainbowHue += 2;
  if (!isExploding) {
    points[0].x += (mouse.x - points[0].x) * CONFIG.velocidadeSeguimento;
    points[0].y += (mouse.y - points[0].y) * CONFIG.velocidadeSeguimento;
    for (let i = 1; i < currentNumPoints; i++) {
      const p = points[i], prev = points[i-1];
      const angle = Math.atan2(p.y - prev.y, p.x - prev.x);
      p.x = prev.x + Math.cos(angle) * CONFIG.distanciaSegmentos;
      p.y = prev.y + Math.sin(angle) * CONFIG.distanciaSegmentos;
    }
    food.x += food.vx; food.y += food.vy;
    if (food.x < 50 || food.x > width-50) food.vx *= -1;
    if (food.y < 50 || food.y > height-50) food.vy *= -1;
    if (Math.hypot(points[0].x - food.x, points[0].y - food.y) < 35) {
      score++; baseHue = Math.random() * 360; spawnFood();
      if (currentNumPoints < CONFIG.limiteCrescimento) { currentNumPoints++; points.push({ ...points[points.length-1] }); }
      if (score >= CONFIG.limiteParaExplodir) createFireworkExplosion(points[0].x, points[0].y);
    }
    ctx.font = `200 ${CONFIG.tamanhoSimbolo}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = `hsl(${rainbowHue}, 100%, 75%)`; ctx.fillText(food.symbol, food.x, food.y);
    for (let i = 0; i < currentNumPoints; i++) {
      const p = points[i], prev = i === 0 ? null : points[i-1];
      let gradIdx = directionForward ? i : (currentNumPoints - i);
      const hue = (baseHue + hueOffset + (gradIdx * (120 / currentNumPoints))) % 360;
      const radius = Math.max(3, 8 - (i * 0.2));
      if (i > 1 && i % 4 === 0 && prev) {
        const angle = Math.atan2(p.y - prev.y, p.x - prev.x);
        const osc = Math.sin(hueOffset * 0.2 + i * 0.5) * 4;
        ctx.beginPath(); ctx.strokeStyle = `hsla(${hue}, 80%, 75%, 0.7)`; ctx.lineWidth = 1; ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(angle+Math.PI/2)*(15+osc), p.y + Math.sin(angle+Math.PI/2)*15); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(angle-Math.PI/2)*(15+osc), p.y + Math.sin(angle-Math.PI/2)*15); ctx.stroke();
      }
      if (i === 0 && points[1]) {
        const ang = Math.atan2(p.y - points[1].y, p.x - points[1].x);
        ctx.beginPath(); ctx.strokeStyle = `hsla(${hue}, 100%, 75%, 0.9)`; ctx.lineWidth = 1.5; ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(ang+0.5)*25, p.y + Math.sin(ang+0.5)*25); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(ang-0.5)*25, p.y + Math.sin(ang-0.5)*25); ctx.stroke();
      }
      if (i === currentNumPoints - 1 && prev) {
        const tailAngle = Math.atan2(p.y - prev.y, p.x - prev.x);
        ctx.beginPath(); ctx.fillStyle = `hsl(${hue}, 90%, 65%)`; ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(tailAngle - 0.5) * 4, p.y + Math.sin(tailAngle - 0.5) * 4); ctx.lineTo(p.x + Math.cos(tailAngle) * 15, p.y + Math.sin(tailAngle) * 15); ctx.lineTo(p.x + Math.cos(tailAngle + 0.5) * 4, p.y + Math.sin(tailAngle + 0.5) * 4); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fillStyle = `hsl(${hue}, 90%, 65%)`; ctx.fill();
    }
  }
  if (isExploding) {
    particles.forEach(p => { p.vx *= 0.98; p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.life -= 0.005; if (p.life > 0) { ctx.font = `200 ${p.size * p.life}px sans-serif`; ctx.fillStyle = `hsla(${(p.hue + rainbowHue)%360}, 100%, 75%, ${p.life})`; ctx.fillText(p.symbol, p.x, p.y); } });
  }
  requestAnimationFrame(animate);
}
animate();

// =============================================================
// 4. LÓGICA DE UPLOAD
// =============================================================
const dropZone = document.getElementById('drop-zone');
const fileInput = document.querySelector('.drop-zone__input');
const auditStatus = document.getElementById('audit-status');
const statusText = document.getElementById('status-text');

dropZone.addEventListener('click', () => fileInput.click());
['dragover', 'dragleave', 'dragend'].forEach(t => dropZone.addEventListener(t, (e) => { e.preventDefault(); if (t === 'dragover') dropZone.classList.add('drop-zone--over'); else dropZone.classList.remove('drop-zone--over'); }));
dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drop-zone--over'); if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', () => { if (fileInput.files.length) handleFileUpload(fileInput.files[0]); });

function handleFileUpload(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  dropZone.classList.add('hidden'); auditStatus.classList.remove('hidden');
  statusText.innerHTML = `MAPEANDO DADOS...`;

  if (ext === 'pdf') {
    setTimeout(() => processAuditData([{ "Data": "22/03/2026", "Descrição": "SALDO INICIAL PDF", "Valor": "1000.00" }], file.name), 1500);
  } else if (ext === 'csv') {
    Papa.parse(file, { header: true, skipEmptyLines: true, complete: (r) => processAuditData(r.data, file.name) });
  } else {
    const reader = new FileReader();
    reader.onload = (e) => processAuditData(XLSX.utils.sheet_to_json(XLSX.read(new Uint8Array(e.target.result), { type: 'array' }).Sheets[XLSX.read(new Uint8Array(e.target.result), { type: 'array' }).SheetNames[0]], { defval: "N/I" }), file.name);
    reader.readAsArrayBuffer(file);
  }
}

function processAuditData(data, fileName) {
  statusText.innerHTML = `✓ DADOS MAPEADOS.`;
  setTimeout(() => renderResultsTable(data, fileName), 1000);
}

// =============================================================
// 5. RENDERIZAÇÃO E FORMATAÇÃO FINANCEIRA
// =============================================================

// Conversor de Data
function formatarDataExcel(valor) {
  if (!valor || valor === "N/I") return "N/I";
  if (!isNaN(valor) && valor > 30000) {
    const data = new Date((valor - 25569) * 86400 * 1000);
    return data.toLocaleDateString('pt-BR');
  }
  return valor;
}

// CONVERSOR DE MOEDA (BRL) - O AJUSTE SOLICITADO
function formatarMoeda(valor) {
  if (!valor || valor === "N/I") return "N/I";
  
  // Limpa o valor para garantir que seja um número (remove R$, espaços, etc)
  let limpo = String(valor).replace(/[R$\s]/g, '').replace(',', '.');
  let numero = parseFloat(limpo);
  
  if (isNaN(numero)) return valor;

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function renderResultsTable(data, fileName) {
  const statusBackup = statusText.innerHTML;
  auditStatus.innerHTML = `<div id="ia-status-container" style="margin-bottom:20px; text-align:center;"><p id="status-text-ia" style="font-size: 0.65rem; letter-spacing: 2px; opacity: 0.7; color: #7cffb0;">${statusBackup}</p></div>`; 

  let banco = fileName.toUpperCase().includes('BRADESCO') ? 'Bradesco' : fileName.toUpperCase().includes('ITAU') ? 'Itaú' : 'N/I';

  const avatarSVG = `<div style="text-align:center; margin-bottom:20px;"><svg width="80" height="80" viewBox="0 0 100 100" style="filter: drop-shadow(0 0 10px rgba(124, 255, 176, 0.6));"><path d="M35 25 L45 45 M65 25 L55 45" stroke="#7cffb0" stroke-width="2" fill="none" /><path d="M50 35 L75 45 L70 75 L50 85 L30 75 L25 45 Z" fill="#070b10" stroke="#7cffb0" stroke-width="2" /><path d="M38 55 L46 60 L40 65 Z M62 55 L54 60 L60 65 Z" fill="#7cffb0" /></svg></div>`;
  
  let html = avatarSVG + `<div style="text-align:center; color:var(--brand); font-size:0.75rem; margin-bottom:20px; letter-spacing: 2px;">CONCILIAÇÃO FINALIZADA</div>`;
  
  html += `<div class="audit-meta fade-in" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px;">
    <div style="background:rgba(255,255,255,0.03); padding:10px; border:1px solid var(--stroke); border-radius:8px;"><span style="display:block; font-size:0.55rem; color:var(--brand); text-transform:uppercase; margin-bottom:4px;">Banco</span><span style="font-size:0.8rem;">${banco}</span></div>
    <div style="background:rgba(255,255,255,0.03); padding:10px; border:1px solid var(--stroke); border-radius:8px;"><span style="display:block; font-size:0.55rem; color:var(--brand); text-transform:uppercase; margin-bottom:4px;">Conta</span><span style="font-size:0.8rem;">N/I</span></div>
    <div style="background:rgba(255,255,255,0.03); padding:10px; border:1px solid var(--stroke); border-radius:8px;"><span style="display:block; font-size:0.55rem; color:var(--brand); text-transform:uppercase; margin-bottom:4px;">Mapeamento</span><span style="font-size:0.8rem;">${data.length} Transações</span></div>
  </div>`;

  html += `<div class="table-container fade-in" id="main-table-container">
    <table style="width:100%; border-collapse:collapse; font-size:0.7rem;">
      <thead><tr style="border-bottom:1px solid var(--stroke); color:var(--brand); text-transform:uppercase;"><th style="padding:10px; text-align:left;">Data</th><th style="padding:10px; text-align:left;">Descrição</th><th style="padding:10px; text-align:left;">Valor</th></tr></thead>
      <tbody>`;
  
  data.forEach(row => {
    const keys = Object.keys(row);
    let dValRaw = row[keys.find(k => k.toLowerCase().includes('data'))] || 'N/I';
    let vValRaw = row[keys.find(k => k.toLowerCase().includes('valor'))] || 'N/I';
    
    const dVal = formatarDataExcel(dValRaw);
    const vVal = formatarMoeda(vValRaw); // APLICAÇÃO DA FORMATAÇÃO R$
    const sVal = row[keys.find(k => k.toLowerCase().includes('desc'))] || 'N/I';
    
    html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.02);"><td style="padding:8px 10px;">${dVal}</td><td style="padding:8px 10px; opacity:0.7;">${sVal}</td><td style="padding:8px 10px;">${vVal}</td></tr>`;
  });

  html += `</tbody></table></div>`;
  html += `<div style="text-align:center; margin-top:20px;"><button id="btn-save-cloud" class="menu-btn" style="border-color:var(--brand); color:var(--brand); font-size:0.6rem; padding: 10px 20px; cursor: pointer;">SALVAR NO CLOUD</button><br><br><a href="#" onclick="location.reload()" style="color:var(--muted); font-size:10px; text-decoration:none;">REINICIAR</a></div>`;

  const container = document.createElement('div');
  container.innerHTML = html;
  auditStatus.appendChild(container);

  realizarAuditoriaIA(data, banco);

  // LOGICA CLOUD
  document.getElementById('btn-save-cloud').addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-cloud');
    if (!window.fbMethods || !window.fbMethods.ready) { alert("Sincronizando... Aguarde."); return; }
    
    btn.innerText = "ENVIANDO..."; btn.disabled = true;
    const { collection, addDoc, db } = window.fbMethods;
    try {
      await addDoc(collection(db, "auditorias"), { banco, timestamp: new Date().toISOString(), transacoes: data });
      btn.innerText = "✓ SALVO"; alert("Protocolo registrado!");
    } catch (e) { btn.innerText = "ERRO"; btn.disabled = false; alert("Falha: " + e.message); }
  });
}

// =============================================================
// 6. IA (RESILIENTE)
// =============================================================
async function realizarAuditoriaIA(dados, banco) {
  const statusIA = document.getElementById('status-text-ia');
  if (!statusIA) return;
  if (!window.fbMethods || !window.fbMethods.ready) { setTimeout(() => realizarAuditoriaIA(dados, banco), 1000); return; }

  statusIA.innerHTML = `🤖 GEMINI 3 FLASH ANALISANDO...`;
  try {
    const result = await window.fbMethods.modelIA.generateContent(`Analise brevemente este extrato: ${JSON.stringify(dados.slice(0, 10))}`);
    const card = document.createElement('div');
    card.style.cssText = `background:rgba(124,255,176,0.05); border:1px solid var(--brand); border-radius:8px; padding:15px; margin-bottom:20px; font-size:0.75rem; color:#fff; box-shadow: 0 0 15px rgba(124,255,176,0.1);`;
    card.innerHTML = `<div style="color:var(--brand); font-weight:bold; margin-bottom:10px;">🤖 INSIGHTS DO AUDITOR DIGITAL</div><div>${result.response.text()}</div>`;
    document.getElementById('main-table-container').prepend(card);
    statusIA.innerHTML = `✓ INSIGHTS GERADOS.`;
  } catch (e) { statusIA.innerHTML = `⚠️ IA INDISPONÍVEL.`; }
}
