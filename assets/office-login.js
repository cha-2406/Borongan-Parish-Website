function showOfficeMessage(text) {
  var el = document.getElementById('officeLoginMessage');
  el.textContent = text;
  el.style.display = 'block';
  el.className = 'note-box auth-error';
}

async function renderOfficeGate() {
  var user = await getCurrentUser();
  var lockScreen = document.getElementById('officeLockScreen');
  var signedIn = document.getElementById('officeSignedIn');
  if (user) {
    lockScreen.style.display = 'none';
    signedIn.style.display = 'block';
    var name = (user.user_metadata && user.user_metadata.full_name) || user.email;
    document.getElementById('officeUserName').textContent = name;
  } else {
    lockScreen.style.display = 'block';
    signedIn.style.display = 'none';
  }
}

document.getElementById('officeLoginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  var email = document.getElementById('of-email').value.trim();
  var password = document.getElementById('of-password').value;
  var btn = this.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Logging in…';
  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) {
      showOfficeMessage(res.error.message);
    } else {
      await renderOfficeGate();
    }
  } catch (err) {
    showOfficeMessage('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false; btn.textContent = 'Log in';
  }
});

document.getElementById('officeLogoutBtn').addEventListener('click', logout);

renderOfficeGate();
