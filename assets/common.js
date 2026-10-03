var toastEl = document.getElementById('toast');
var toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
}

var hamburgerBtn = document.getElementById('hamburgerBtn');
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', function () {
    var nav = document.getElementById('mainNav');
    var open = nav.classList.toggle('open');
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

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

var STEPS_CERT = ['Submitted', 'Processing', 'Ready for pickup', 'Completed'];
var STEPS_BOOK = ['Pending', 'Confirmed', 'Completed'];
var STEPS_FEEDBACK = ['New', 'Read', 'Responded'];

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
    rows.push(['Submitted by', rec.requestor_name]);
    rows.push(['Contact number', rec.contact_number]);
  } else if (rec.type === 'booking') {
    rows = [
      ['Service', rec.service_type],
      ['For whom / occasion', rec.subject_name],
      ['Preferred date', rec.preferred_date],
      ['Preferred time', rec.preferred_time]
    ];
    rows.push(['Submitted by', rec.requestor_name]);
    rows.push(['Contact number', rec.contact_number]);
  } else if (rec.type === 'feedback') {
    rows = [
      ['From', rec.full_name || 'Anonymous'],
      ['Contact number', rec.contact_number],
      ['Email', rec.email],
      ['Message', rec.message]
    ];
  }
  return rows;
}

function renderTimeline(rec) {
  var terminal = ['Declined', 'Cancelled', 'Archived'];
  var steps;
  if (terminal.indexOf(rec.status) !== -1) {
    steps = [rec.status];
  } else if (rec.type === 'certificate') {
    steps = STEPS_CERT;
  } else if (rec.type === 'booking') {
    steps = STEPS_BOOK;
  } else {
    steps = STEPS_FEEDBACK;
  }
  var currentIdx = steps.indexOf(rec.status);
  return '<div class="timeline">' + steps.map(function (s, i) {
    var done = currentIdx === -1 ? true : i <= currentIdx;
    return '<div class="tl-step ' + (done ? 'done' : '') + '"><span class="tl-dot"></span><div class="tl-label">' + s + '</div></div>';
  }).join('') + '</div>';
}

function statusOptionsFor(type) {
  if (type === 'certificate') return STEPS_CERT.concat(['Declined']);
  if (type === 'booking') return STEPS_BOOK.concat(['Cancelled']);
  return STEPS_FEEDBACK.concat(['Archived']);
}

var feedbackForm = document.getElementById('feedbackForm');

if (feedbackForm) {

  var feedbackContact = document.getElementById('feedbackContact');
  var feedbackSubmit = document.getElementById('feedbackSubmit');

  if (feedbackContact) {
    feedbackContact.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 11);
    });
  }

  feedbackForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    var full_name = document.getElementById('feedbackName').value.trim();
    var contact_number = document.getElementById('feedbackContact').value.trim();
    var email = document.getElementById('feedbackEmail').value.trim();
    var message = document.getElementById('feedbackMessage').value.trim();

    if (message === '') {
      alert('Please write your feedback.');
      return;
    }

    if (contact_number !== '' && !/^09[0-9]{9}$/.test(contact_number)) {
      alert('Please enter a valid 11-digit Philippine mobile number.');
      return;
    }

    feedbackSubmit.disabled = true;
    feedbackSubmit.textContent = 'Submitting...';

    try {
      var refResult = await sb.rpc('next_ref');
      if (refResult.error) throw refResult.error;

      var result = await sb
        .from('feedback')
        .insert({
          ref: refResult.data,
          full_name: full_name || null,
          contact_number: contact_number || null,
          email: email || null,
          message: message,
          status: 'New',
          history: [{ status: 'New', at: new Date().toISOString() }]
        });

      if (result.error) {
        console.error('Feedback error:', result.error);
        alert('Feedback could not be submitted. Please try again.');
        return;
      }

      feedbackForm.reset();
      window.location.reload();
      
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');

    } finally {
      feedbackSubmit.disabled = false;
      feedbackSubmit.textContent = 'Submit';
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {

    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) {
        return;
    }

    // Get saved theme
    const savedTheme = localStorage.getItem("theme");

    // Apply saved theme
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggle.textContent = "🌙";
    }

    // Toggle theme
    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

            themeToggle.textContent = "☀️";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

        } else {

            localStorage.setItem("theme", "light");

            themeToggle.textContent = "🌙";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

        }

    });

});
