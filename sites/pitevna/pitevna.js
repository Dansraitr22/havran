// PITEVNA - Structured Medical Reports Frontend

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
  fetch('/api/reports')
    .then(res => res.json())
    .then(reports => {
      const list = document.getElementById('report-list');
      if (!list) return;
      list.innerHTML = '';
      if (!reports.length) {
        list.innerHTML = '<i>Žádné pitevní zprávy.</i>';
        return;
      }
      for (const report of reports) {
        list.innerHTML += renderReport(report);
      }
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

window.addEventListener('DOMContentLoaded', function() {
  loadReports();
  setupReportForm();
});