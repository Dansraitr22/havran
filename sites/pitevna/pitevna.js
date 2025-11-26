// PITEVNA - Structured Medical Reports Frontend

// Login credentials from hacknet
const VALID_USER = 'dr_mortis';
const VALID_PASS = 'autopsy2025';

// Handle login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginScreen = document.getElementById('loginScreen');
  const mainContent = document.getElementById('mainContent');
  const loginError = document.getElementById('loginError');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('pitevnaUser').value;
      const pass = document.getElementById('pitevnaPass').value;
      
      if (user === VALID_USER && pass === VALID_PASS) {
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        loadReports();
        setupReportForm();
      } else {
        loginError.textContent = 'Neplatné přihlašovací údaje';
        loginError.style.display = 'block';
        setTimeout(() => { loginError.style.display = 'none'; }, 3000);
      }
    });
  }
});

function renderReport(report) {
  return `<div style="border:1px solid #ccc; padding:12px; margin-bottom:18px; max-width:600px;">
    <strong>Pitevní zpráva</strong><br>
    <b>Identifikace zemřelého:</b><br>
    Jméno: ${report.deceasedName}<br>
    Věk: ${report.deceasedAge}<br>
    Pohlaví: ${report.deceasedSex}<br>
    <b>Datum a čas pitvy:</b><br>
    Datum: ${report.date}<br>
    Čas: ${report.time}<br>
    <b>Pitevní lékař:</b><br>
    Jméno: ${report.doctor}<br>
    Specializace: ${report.specialization}<br>
    <b>Pitevní nález:</b><br>
    <u>Vnější vyšetření:</u><br>${report.externalExam.replace(/\n/g, '<br>')}<br>
    <u>Vnitřní vyšetření:</u><br>${report.internalExam.replace(/\n/g, '<br>')}<br>
    <b>Závěr:</b><br>${report.conclusion.replace(/\n/g, '<br>')}<br>
    <b>Další doporučení:</b><br>${(report.recommendation || '').replace(/\n/g, '<br>')}
  </div>`;
}

function loadReports() {
  const list = document.getElementById('report-list');
  if (!list) return;
  const API = (window.SERVER_BASE ? `${window.SERVER_BASE}/api/reports` : '/api/reports');
  fetch(API)
    .then(res => {
      if (!res.ok) throw new Error('API not available');
      return res.json();
    })
    .catch(() => {
      // Fallback to static JSON if API is not reachable
      return fetch('./reports.json').then(r => r.json()).catch(() => []);
    })
    .then(reports => {
      list.innerHTML = '';
      if (!reports || !reports.length) {
        list.innerHTML = '<i>Žádné pitevní zprávy.</i>';
        return;
      }
      for (const report of reports) {
        list.innerHTML += renderReport(report);
      }
    })
    .catch(() => {
      list.innerHTML = '<i>Zprávy nelze načíst.</i>';
    });
}

function setupReportForm() {
  const form = document.getElementById('report-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(() => {
        form.reset();
        loadReports();
      });
  });
}

// Removed duplicate window.addEventListener - login handler now in DOMContentLoaded at top
