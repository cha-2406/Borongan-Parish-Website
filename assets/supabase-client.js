var SUPABASE_URL = "https://wncwmeumexvgytvndwfb.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_TcWJ5KZrP7uYSdBt9Qqkbg_QcfMepxK";

var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------- database helpers ---------------- */

// Maps the camelCase form fields to the snake_case database columns.
function toRow(type, data) {
  var status = type === 'certificate' ? 'Submitted' : 'Pending';
  return {
    type: type,
    status: status,
    requestor_name: data.requestorName || null,
    contact_number: data.contactNumber || null,
    email: data.email || null,
    certificate_type: data.certificateType || null,
    service_type: data.serviceType || null,
    subject_name: data.subjectName || null,
    sacrament_date: data.sacramentDate || null,
    purpose: data.purpose || null,
    delivery_method: data.deliveryMethod || null,
    preferred_date: data.preferredDate || null,
    preferred_time: data.preferredTime || null,
    notes: data.notes || null,
    history: [{ status: status, at: new Date().toISOString() }]
  };
}

async function createRecord(type, data) {
  var refResult = await sb.rpc('next_ref');
  if (refResult.error) throw refResult.error;
  var ref = refResult.data;
  var row = toRow(type, data);
  row.ref = ref;
  var inserted = await sb.from('requests').insert(row).select().single();
  if (inserted.error) throw inserted.error;
  return inserted.data;
}

async function getRecord(ref) {
  var res = await sb.from('requests').select('*').eq('ref', ref).maybeSingle();
  if (res.error) { console.error(res.error); return null; }
  return res.data;
}

async function loadIndex() {
  var res = await sb.from('requests').select('*').order('created_at', { ascending: false });
  if (res.error) { console.error(res.error); return []; }
  return res.data.map(function (r) {
    return {
      id: r.ref, type: r.type, ref: r.ref,
      name: r.requestor_name,
      subject: r.subject_name || r.service_type || r.certificate_type || '',
      status: r.status, createdAt: r.created_at
    };
  });
}

async function updateStatus(ref, status, note) {
  var rec = await getRecord(ref);
  if (!rec) return null;
  var history = (rec.history || []).concat([{ status: status, at: new Date().toISOString(), note: note || '' }]);
  var res = await sb.from('requests').update({ status: status, history: history }).eq('ref', ref).select().single();
  if (res.error) { console.error(res.error); return null; }
  return res.data;
}
