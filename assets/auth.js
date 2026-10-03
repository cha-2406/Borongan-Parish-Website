async function getCurrentUser() {
  try {
    var res = await sb.auth.getUser();
    return res.data.user || null;
  } catch (e) {
    return null;
  }
}

async function logout() {
  await sb.auth.signOut();
  window.location.reload();
}
