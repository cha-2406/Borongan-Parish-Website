var bookForm = document.getElementById('bookForm');

bookForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  var fd = new FormData(bookForm);
  var data = Object.fromEntries(fd.entries());
  if (!data.requestorName || !data.email || !data.serviceType || !data.preferredDate) {
    showToast('Please complete all required fields.');
    return;
  }
  var btn = bookForm.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    var rec = await createRecord('booking', data);
    document.getElementById('bookFormWrap').style.display = 'none';
    document.getElementById('bookConfirm').style.display = 'block';
    document.getElementById('bookRefText').textContent = rec.ref;
    showToast('Booking submitted.');
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false; btn.textContent = 'Submit booking';
  }
});

document.getElementById('bookCopyBtn').addEventListener('click', function () {
  var text = document.getElementById('bookRefText').textContent;
  navigator.clipboard && navigator.clipboard.writeText(text);
  showToast('Reference number copied.');
});

document.getElementById('bookAnotherBtn').addEventListener('click', function () {
  bookForm.reset();
  document.getElementById('bookFormWrap').style.display = 'block';
  document.getElementById('bookConfirm').style.display = 'none';
});
