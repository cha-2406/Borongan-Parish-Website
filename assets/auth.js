/* ---------------- auth: session helpers ---------------- */
/* Requires assets/supabase-client.js to be loaded first (provides `sb`). */

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
