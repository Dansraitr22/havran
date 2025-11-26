document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = (typeof window !== 'undefined' && window.SERVER_BASE) ? window.SERVER_BASE : 'https://havran.onrender.com';
  const loginForm = document.getElementById('loginForm');
  const loginScreen = document.getElementById('loginScreen');
  const mainConsole = document.getElementById('mainConsole');
  const loginError = document.getElementById('loginError');
  const searchButton = document.getElementById('searchButton');
  const logoutBtn = document.getElementById('logoutBtn');
  const systemTime = document.getElementById('systemTime');

  // Case database focused on mystical/alien anomalies
  const cases = [
    {
      id: 'A-2097',
      title: 'UNIDENTIFIED AERIAL PHENOMENA CLUSTER',
      type: 'AERIAL ANOMALY',
      status: 'ACTIVE',
      priority: 'HIGH',
      date: '2025-11-20',
      location: 'SECTOR 12 (NORTH RIDGE)',
      officer: 'AGT. K. NOVÁK',
      description: 'Multiple UAP events recorded across Sector 12 within 48h window; radar + visual corroboration.',
      evidence: [
        'Air traffic control logs (3 anomalies)',
        'Thermal signatures at altitude',
        'Civilian video footage (5 sources)',
        'EM interference spikes'
      ],
      suspects: [
        'UNKNOWN — non-terrestrial origin suspected',
        'Potential autonomous probe activity'
      ],
      timeline: [
        '2025-11-18: First anomalous track detected',
        '2025-11-19: Pattern confirmed by ATC',
        '2025-11-20: Field team deployed'
      ],
      notes: 'Maintain low-profile ops. Engage only with passive tracking measures. Liaise with aero authority.'
    },
    {
      id: 'M-4412',
      title: 'RITUAL ACTIVITY — UNLICENSED CONGREGATION',
      type: 'MYSTICAL EVENT',
      status: 'INVESTIGATION',
      priority: 'MEDIUM',
      date: '2025-11-18',
      location: 'OLD QUARRY — EAST CAVERN',
      officer: 'AGT. P. SVOBODA',
      description: 'Reports of nocturnal gatherings with chant-based sequences; residual heat patterns detected.',
      evidence: [
        'Drone thermals — 02:10–03:45 window',
        'Soil disturbances — circle formation',
        'Recovered artifacts (charred symbols)'
      ],
      suspects: [
        'Local group — unidentified membership',
        'External influence — folklore ties'
      ],
      timeline: [
        '2025-11-10: Anonymous tip received',
        '2025-11-16: Surveillance initiated',
        '2025-11-18: First site inspection'
      ],
      notes: 'Advise coordination with municipal police for public safety; no direct confrontation recommended.'
    },
    {
      id: 'X-0311',
      title: 'STRUCTURED LIGHT PHENOMENA — SUBSURFACE',
      type: 'UNKNOWN',
      status: 'REVIEW',
      priority: 'LOW',
      date: '2025-11-15',
      location: 'SUBWAY TUNNEL — LINE B',
      officer: 'AGT. R. ČERNÝ',
      description: 'Patterned light observed in disused tunnel section; no power feeds present.',
      evidence: [
        'Body cam captures (AGT. ČERNÝ)',
        'Magnetic field fluctuations',
        'Signal analysis pending'
      ],
      suspects: [
        'Natural phosphorescence unlikely',
        'Hypothesis: cross-dimensional leakage'
      ],
      timeline: [
        '2025-11-14: Random patrol sighting',
        '2025-11-15: Follow-up inspection',
        '2025-11-15: Area closed for study'
      ],
      notes: 'Do not enter without monitoring equipment; notify research unit if recurrence occurs.'
    }
  ];

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const agentId = document.getElementById('agentId').value;
      const passcode = document.getElementById('passcode').value;
      const clearance = document.getElementById('clearance').value;
      if (agentId === 'agent_k_001' && passcode === 'blackops' && clearance === 'CLEARANCE-7') {
        loginScreen.style.display = 'none';
        mainConsole.style.display = 'block';
        displayCases();
      } else {
        loginError.textContent = '*** ACCESS DENIED *** Vyžadována všechna pole';
        loginError.style.display = 'block';
        setTimeout(()=>{ loginError.style.display='none'; }, 3000);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginScreen.style.display = 'block';
      mainConsole.style.display = 'none';
      loginForm.reset();
    });
  }

  function displayCases() {
    const caseList = document.getElementById('caseList');
    caseList.innerHTML = cases.map(caseItem => `
      <div class="case-item" data-case-id="${caseItem.id}">
        <div class="row">
          <strong>[CASE ${caseItem.id}]</strong>
          <span>${caseItem.date}</span>
        </div>
        <h3>${caseItem.title}</h3>
        <div class="meta">Typ: ${caseItem.type} | Lokace: ${caseItem.location} | Agent: ${caseItem.officer}</div>
        <div class="badges"><span class="status ${caseItem.status.toLowerCase()}">${caseItem.status}</span><span class="priority ${caseItem.priority.toLowerCase()}">${caseItem.priority}</span></div>
        <button class="btn" onclick="viewCaseDetails('${caseItem.id}')">Detail</button>
      </div>
    `).join('');
  }

  window.viewCaseDetails = function(caseId){
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;
    const modal = document.getElementById('caseDetailModal');
    const title = document.getElementById('caseDetailTitle');
    const content = document.getElementById('caseDetailContent');
    title.textContent = `CASE ${caseItem.id} — ${caseItem.title}`;
    content.innerHTML = `
      <div class="block"><table class="kv">
        <tr><td>Číslo spisu</td><td>${caseItem.id}</td></tr>
        <tr><td>Typ</td><td>${caseItem.type}</td></tr>
        <tr><td>Status</td><td>${caseItem.status}</td></tr>
        <tr><td>Priorita</td><td>${caseItem.priority}</td></tr>
        <tr><td>Datum</td><td>${caseItem.date}</td></tr>
        <tr><td>Lokalita</td><td>${caseItem.location}</td></tr>
        <tr><td>Agent</td><td>${caseItem.officer}</td></tr>
      </table></div>
      <div class="block"><h4>Popis</h4><p>${caseItem.description}</p></div>
      <div class="block"><h4>Důkazy</h4><ul>${caseItem.evidence.map(e=>`<li>${e}</li>`).join('')}</ul></div>
      <div class="block"><h4>Subjekty</h4><ul>${caseItem.suspects.map(s=>`<li>${s}</li>`).join('')}</ul></div>
      <div class="block"><h4>Timeline</h4><ul>${caseItem.timeline.map(t=>`<li>${t}</li>`).join('')}</ul></div>
      <div class="block warn"><h4>Poznámky</h4><p>${caseItem.notes}</p></div>
    `;
    modal.style.display = 'block';
  };

  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('keypress', (e)=>{ if (e.key==='Enter') performSearch(); });
  }

  function performSearch(){
    const q = (document.getElementById('searchInput').value||'').toLowerCase();
    const searchResults = document.getElementById('searchResults');
    if (!q) { searchResults.innerHTML = '<p>Vyplňte hledaný výraz.</p>'; return; }
    const results = cases.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.officer.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
    if (results.length) {
      searchResults.innerHTML = results.map(r=>`
        <div class="result-item">
          <strong>[CASE ${r.id}] ${r.title}</strong><br>
          <span class="meta">${r.type} | ${r.location} | ${r.date}</span><br>
          <button class="btn" onclick="viewCaseDetails('${r.id}')">Detail</button>
        </div>
      `).join('');
    } else {
      searchResults.innerHTML = '<p>Žádné záznamy neodpovídají kritériím.</p>';
    }
  }

  function updateSystemTime(){
    if (!systemTime) return;
    const now = new Date();
    const timeStr = now.toLocaleString('cs-CZ', {
      year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit', second:'2-digit'
    });
    systemTime.innerHTML = `<strong>SYSTEM TIME</strong><br>${timeStr} CET`;
  }
  updateSystemTime();
  setInterval(updateSystemTime, 1000);
});
