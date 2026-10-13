document.getElementById('trackForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  var val = document.getElementById('trackInput').value.trim().toUpperCase();
  var resultEl = document.getElementById('trackResult');
  resultEl.innerHTML = '<p style="color:var(--muted)">Searching…</p>';
  if (!val) { resultEl.innerHTML = ''; return; }

  var rec = await getRecord(val);
  if (!rec) {
    resultEl.innerHTML = '<div class="note-box"><strong>No request found</strong>We couldn\'t find anything with that reference number. Double-check it and try again, or contact the parish office.</div>';
    return;
  }

  var rows = fieldRows(rec);
  resultEl.innerHTML =
    '<div class="form-card">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">' +
        '<h3 style="margin-bottom:0;">' + rec.ref + '</h3>' +
        '<span class="status-badge status-' + rec.status.replace(/ /g, '-') + '">' + rec.status + '</span>' +
      '</div>' +
      renderTimeline(rec) +
      '<div class="detail-grid">' +
        rows.map(function (r) { return '<div><div class="k">' + r[0] + '</div><div class="v">' + (r[1] || '—') + '</div></div>'; }).join('') +
      '</div>' +
    '</div>';
});
