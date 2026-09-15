/* ---------------- toast ---------------- */
var toastEl = document.getElementById('toast');
var toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
}

/* ---------------- mobile nav ---------------- */
var hamburgerBtn = document.getElementById('hamburgerBtn');
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', function () {
    var nav = document.getElementById('mainNav');
    var open = nav.classList.toggle('open');
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ---------------- radio chip highlight (certificate / booking forms) ---------------- */
document.querySelectorAll('.radio-group').forEach(function (group) {
  function refresh() {
    group.querySelectorAll('.radio-chip').forEach(function (chip) {
      var input = chip.querySelector('input');
      chip.classList.toggle('checked', input.checked);
    });
  }
  group.addEventListener('change', refresh);
  refresh();
});

/* ---------------- status display helpers (used by track + office pages) ---------------- */
var STEPS_CERT = ['Submitted', 'Processing', 'Ready for pickup', 'Completed'];
var STEPS_BOOK = ['Pending', 'Confirmed', 'Completed'];

function fieldRows(rec) {
  var rows = [];
  if (rec.type === 'certificate') {
    rows = [
      ['Certificate type', rec.certificate_type],
      ['Name on certificate', rec.subject_name],
      ['Approx. date of sacrament', rec.sacrament_date],
      ['Purpose', rec.purpose],
      ['Delivery method', rec.delivery_method]
    ];
  } else {
    rows = [
      ['Service', rec.service_type],
      ['For whom / occasion', rec.subject_name],
      ['Preferred date', rec.preferred_date],
      ['Preferred time', rec.preferred_time]
    ];
  }
  rows.push(['Submitted by', rec.requestor_name]);
  rows.push(['Contact number', rec.contact_number]);
  return rows;
}

function renderTimeline(rec) {
  var steps = rec.status === 'Declined' || rec.status === 'Cancelled' ? [rec.status] :
    (rec.type === 'certificate' ? STEPS_CERT : STEPS_BOOK);
  var currentIdx = steps.indexOf(rec.status);
  return '<div class="timeline">' + steps.map(function (s, i) {
    var done = currentIdx === -1 ? true : i <= currentIdx;
    return '<div class="tl-step ' + (done ? 'done' : '') + '"><span class="tl-dot"></span><div class="tl-label">' + s + '</div></div>';
  }).join('') + '</div>';
}

function statusOptionsFor(type) {
  return type === 'certificate' ? STEPS_CERT.concat(['Declined']) : STEPS_BOOK.concat(['Cancelled']);
}
