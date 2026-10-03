var SUPABASE_URL = "https://wncwmeumexvgytvndwfb.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_TcWJ5KZrP7uYSdBt9Qqkbg_QcfMepxK";

var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


function tableFor(type) {
  if (type === 'certificate') return 'certificate_requests';
  if (type === 'booking') return 'bookings';
  return 'feedback';
}


function toRow(type, data) {
  var status = type === 'certificate' ? 'Submitted' : 'Pending';
  var row = {
    status: status,
    requestor_name: data.requestorName || null,
    contact_number: data.contactNumber || null,
    email: data.email || null,
    subject_name: data.subjectName || null,
    notes: data.notes || null,
    history: [{ status: status, at: new Date().toISOString() }]
  };
  if (type === 'certificate') {
    row.certificate_type = data.certificateType || null;
    row.sacrament_date = data.sacramentDate || null;
    row.purpose = data.purpose || null;
    row.delivery_method = data.deliveryMethod || null;
  } else {
    row.service_type = data.serviceType || null;
    row.preferred_date = data.preferredDate || null;
    row.preferred_time = data.preferredTime || null;
  }
  return row;
}

async function createRecord(type, data) {
  var refResult = await sb.rpc('next_ref');
  if (refResult.error) throw refResult.error;
  var ref = refResult.data;
  var row = toRow(type, data);
  row.ref = ref;
  var inserted = await sb.from(tableFor(type)).insert(row).select().single();
  if (inserted.error) throw inserted.error;
  var result = inserted.data;
  result.type = type;
  return result;
}


async function getRecord(ref) {
  var res1 = await sb.from('certificate_requests').select('*').eq('ref', ref).maybeSingle();
  if (res1.error) { console.error(res1.error); }
  if (res1.data) { res1.data.type = 'certificate'; return res1.data; }

  var res2 = await sb.from('bookings').select('*').eq('ref', ref).maybeSingle();
  if (res2.error) { console.error(res2.error); }
  if (res2.data) { res2.data.type = 'booking'; return res2.data; }

  var res3 = await sb.from('feedback').select('*').eq('ref', ref).maybeSingle();
  if (res3.error) { console.error(res3.error); return null; }
  if (res3.data) { res3.data.type = 'feedback'; return res3.data; }

  return null;
}


async function loadIndex() {
  var res1 = await sb.from('certificate_requests').select('*').order('created_at', { ascending: false });
  var res2 = await sb.from('bookings').select('*').order('created_at', { ascending: false });
  var res3 = await sb.from('feedback').select('*').order('created_at', { ascending: false });
  if (res1.error) console.error(res1.error);
  if (res2.error) console.error(res2.error);
  if (res3.error) console.error(res3.error);

  var certs = (res1.data || []).map(function (r) {
    return { id: r.ref, type: 'certificate', ref: r.ref, name: r.requestor_name, subject: r.subject_name || r.certificate_type || '', status: r.status, createdAt: r.created_at };
  });
  var books = (res2.data || []).map(function (r) {
    return { id: r.ref, type: 'booking', ref: r.ref, name: r.requestor_name, subject: r.subject_name || r.service_type || '', status: r.status, createdAt: r.created_at };
  });
  var fb = (res3.data || []).map(function (r) {
    return { id: r.ref, type: 'feedback', ref: r.ref, name: r.full_name || 'Anonymous', subject: (r.message || '').slice(0, 60), status: r.status, createdAt: r.created_at };
  });

  var merged = certs.concat(books).concat(fb);
  merged.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  return merged;
}

async function updateStatus(ref, status, note) {
  var rec = await getRecord(ref);
  if (!rec) return null;
  var history = (rec.history || []).concat([{ status: status, at: new Date().toISOString(), note: note || '' }]);
  var res = await sb.from(tableFor(rec.type)).update({ status: status, history: history }).eq('ref', ref).select().single();
  if (res.error) { console.error(res.error); return null; }
  res.data.type = rec.type;
  return res.data;
}