var ADMIN_PASSCODE = "Bparish_2026";

function refreshAdminGate() {
  var unlocked = sessionStorage.getItem('boronganOfficeUnlocked') === '1';
  document.getElementById('lockScreen').style.display = unlocked ? 'none' : 'block';
  document.getElementById('adminPanel').style.display = unlocked ? 'block' : 'none';
  if (unlocked) loadAdminTable('all');
}

document.getElementById('lockForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var val = document.getElementById('passcodeInput').value;
  if (val === ADMIN_PASSCODE) {
    sessionStorage.setItem('boronganOfficeUnlocked', '1');
    document.getElementById('lockError').style.display = 'none';
    refreshAdminGate();
  } else {
    document.getElementById('lockError').style.display = 'block';
  }
});

var currentFilter = 'all';
document.getElementById('adminTabs').addEventListener('click', function (e) {
  var btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('#adminTabs .tab-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  currentFilter = btn.getAttribute('data-filter');
  loadAdminTable(currentFilter);
});

async function loadAdminTable(filter) {
  var wrap = document.getElementById('adminTableWrap');
  wrap.innerHTML = '<p style="color:var(--muted)">Loading…</p>';
  var idx = await loadIndex();
  var items = filter === 'all' ? idx : idx.filter(function (i) { return i.type === filter; });
  if (items.length === 0) {
    wrap.innerHTML = '<div class="admin-empty">No submissions yet in this category.</div>';
    return;
  }
  var rowsHtml = items.map(function (i) {
    return '<tr data-id="' + i.id + '">' +
      '<td>' + i.ref + '</td>' +
      '<td>' + (i.type === 'certificate' ? 'Certificate' : 'Booking') + '</td>' +
      '<td>' + (i.name || '—') + '</td>' +
      '<td>' + (i.subject || '—') + '</td>' +
      '<td><span class="status-badge status-' + i.status.replace(/ /g, '-') + '">' + i.status + '</span></td>' +
      '<td>' + new Date(i.createdAt).toLocaleDateString() + '</td>' +
      '<td><button class="link-btn" data-open="' + i.id + '">View</button></td>' +
    '</tr>';
  }).join('');
  wrap.innerHTML =
    '<table class="admin-table">' +
      '<thead><tr><th>Reference</th><th>Type</th><th>Name</th><th>Subject</th><th>Status</th><th>Date</th><th></th></tr></thead>' +
      '<tbody id="adminTbody">' + rowsHtml + '</tbody>' +
    '</table>';

  document.getElementById('adminTbody').addEventListener('click', async function (e) {
    var openBtn = e.target.closest('[data-open]');
    if (!openBtn) return;
    var id = openBtn.getAttribute('data-open');
    var existingExpand = wrap.querySelector('.row-expand[data-for="' + id + '"]');
    if (existingExpand) { existingExpand.remove(); return; }
    wrap.querySelectorAll('.row-expand').forEach(function (r) { r.remove(); });
    var rec = await getRecord(id);
    if (!rec) return;
    var rows = fieldRows(rec);
    var optHtml = statusOptionsFor(rec.type).map(function (s) {
      return '<option value="' + s + '" ' + (s === rec.status ? 'selected' : '') + '>' + s + '</option>';
    }).join('');
    var tr = document.createElement('tr');
    tr.className = 'row-expand';
    tr.setAttribute('data-for', id);
    tr.innerHTML = '<td colspan="7">' +
      '<div class="detail-grid">' +
        rows.map(function (r) { return '<div><div class="k">' + r[0] + '</div><div class="v">' + (r[1] || '—') + '</div></div>'; }).join('') +
        (rec.notes ? '<div style="grid-column:1/-1;"><div class="k">Notes</div><div class="v">' + rec.notes + '</div></div>' : '') +
      '</div>' +
      '<div class="expand-actions">' +
        '<label style="font-size:0.85rem; color:var(--muted);">Update status:</label>' +
        '<select data-status-for="' + id + '">' + optHtml + '</select>' +
        '<button class="btn btn-quiet" data-save="' + id + '" type="button" style="padding:8px 14px;">Save</button>' +
      '</div>' +
    '</td>';
    var targetRow = wrap.querySelector('tr[data-id="' + id + '"]');
    targetRow.parentNode.insertBefore(tr, targetRow.nextSibling);
  });

  wrap.addEventListener('click', async function saveHandler(e) {
    var saveBtn = e.target.closest('[data-save]');
    if (!saveBtn) return;
    var id = saveBtn.getAttribute('data-save');
    var select = wrap.querySelector('[data-status-for="' + id + '"]');
    await updateStatus(id, select.value);
    showToast('Status updated.');
    loadAdminTable(currentFilter);
  });
}

refreshAdminGate();
