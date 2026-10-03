var certForm = document.getElementById('certForm');

certForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  var fd = new FormData(certForm);
  var data = Object.fromEntries(fd.entries());
  if (!data.requestorName || !data.email || !data.certificateType || !data.subjectName) {
    showToast('Please complete all required fields.');
    return;
  }
  var btn = certForm.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    var rec = await createRecord('certificate', data);
    document.getElementById('certFormWrap').style.display = 'none';
    document.getElementById('certConfirm').style.display = 'block';
    document.getElementById('certRefText').textContent = rec.ref;
    showToast('Certificate request submitted.');
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false; btn.textContent = 'Submit request';
  }
});

const contactNumber = document.getElementById('contactNumber');

contactNumber.addEventListener('input', function () {
    // Remove anything that isn't a number
    this.value = this.value.replace(/\D/g, '');

    // Limit to 11 digits
    this.value = this.value.slice(0, 11);
});

document.getElementById('certCopyBtn').addEventListener('click', function () {
  var text = document.getElementById('certRefText').textContent;
  navigator.clipboard && navigator.clipboard.writeText(text);
  showToast('Reference number copied.');
});

document.getElementById('certAnotherBtn').addEventListener('click', function () {
  certForm.reset();
  document.querySelectorAll('#certForm .radio-chip').forEach(function (c) { c.classList.remove('checked'); });
  document.querySelector('#certForm .radio-chip input').checked = true;
  document.querySelector('#certForm .radio-chip').classList.add('checked');
  document.getElementById('certFormWrap').style.display = 'block';
  document.getElementById('certConfirm').style.display = 'none';
});
