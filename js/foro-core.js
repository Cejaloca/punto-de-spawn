// ============================================================
// Foro PuntoDeSpawn — lógica compartida (auth, cliente, helpers)
// Requiere: foro-config.js cargado antes, y el SDK de Supabase
// (@supabase/supabase-js@2 vía CDN) cargado antes que este archivo.
// ============================================================

var forumClient = null;
var forumUser = null;      // sesión actual de auth (o null)
var forumProfile = null;   // fila de forum_profiles del usuario actual

function forumInitClient() {
  if (forumClient) return forumClient;
  if (!window.supabase || SUPABASE_URL.indexOf('TU_PROJECT_URL') !== -1) {
    console.warn('[Foro] Falta configurar SUPABASE_URL / SUPABASE_ANON_KEY en js/foro-config.js');
    return null;
  }
  forumClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return forumClient;
}

function forumEscapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function forumTimeAgo(iso) {
  var diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'recién';
  if (diff < 3600) return Math.floor(diff / 60) + ' min';
  if (diff < 86400) return Math.floor(diff / 3600) + ' h';
  if (diff < 2592000) return Math.floor(diff / 86400) + ' d';
  return new Date(iso).toLocaleDateString('es-AR');
}

function forumRenderAuthBox() {
  var box = document.getElementById('forum-auth-box');
  if (!box) return;

  if (forumUser) {
    var name = (forumProfile && forumProfile.username) || forumUser.email || 'Usuario';
    var avatar = (forumProfile && forumProfile.avatar_url) || '';
    box.innerHTML =
      '<div class="forum-user">' +
        (avatar ? '<img src="' + forumEscapeHtml(avatar) + '" alt="" class="forum-avatar">' : '') +
        '<span class="forum-username">' + forumEscapeHtml(name) + '</span>' +
        '<button class="btn-primary forum-logout-btn" id="forum-logout-btn">Salir</button>' +
      '</div>';
    var logoutBtn = document.getElementById('forum-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', forumSignOut);
  } else {
    box.innerHTML = '<button class="btn-primary" id="forum-login-btn">Iniciar sesión con Google</button>';
    var loginBtn = document.getElementById('forum-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', forumSignInWithGoogle);
  }

  document.querySelectorAll('.forum-requires-auth').forEach(function (el) {
    el.style.display = forumUser ? '' : 'none';
  });
  document.querySelectorAll('.forum-requires-guest').forEach(function (el) {
    el.style.display = forumUser ? 'none' : '';
  });
}

function forumSignInWithGoogle() {
  var client = forumInitClient();
  if (!client) { alert('El foro todavía no está configurado. Volvé más tarde.'); return; }
  client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
}

function forumSignOut() {
  var client = forumInitClient();
  if (!client) return;
  client.auth.signOut().then(function () { window.location.reload(); });
}

// Trae (o crea, vía trigger de DB) el perfil público del usuario logueado
function forumLoadProfile(callback) {
  var client = forumInitClient();
  if (!client || !forumUser) { callback(); return; }
  client.from('forum_profiles').select('*').eq('id', forumUser.id).single()
    .then(function (res) {
      forumProfile = res.data || null;
      callback();
    });
}

// Inicializa sesión + escucha cambios de auth. cb se llama una vez listo.
function forumInitAuth(cb) {
  var client = forumInitClient();
  if (!client) { forumRenderAuthBox(); if (cb) cb(); return; }

  client.auth.getSession().then(function (res) {
    forumUser = res.data.session ? res.data.session.user : null;
    forumLoadProfile(function () {
      forumRenderAuthBox();
      if (cb) cb();
    });
  });

  client.auth.onAuthStateChange(function (event, session) {
    forumUser = session ? session.user : null;
    forumLoadProfile(function () {
      forumRenderAuthBox();
      // Re-renderiza el feed/hilo si la página expone un refresh hook
      if (window.forumOnAuthChange) window.forumOnAuthChange();
    });
  });
}

// Alterna el voto: si ya votaste igual, lo borra (toggle); si votaste distinto, lo actualiza.
function forumToggleVote(targetField, targetId, value, onDone) {
  var client = forumInitClient();
  if (!client) return;
  if (!forumUser) { alert('Iniciá sesión con Google para votar.'); return; }

  var filter = {};
  filter[targetField] = targetId;

  client.from('forum_votes').select('id, value').eq('user_id', forumUser.id).match(filter).maybeSingle()
    .then(function (res) {
      var existing = res.data;
      if (existing && existing.value === value) {
        return client.from('forum_votes').delete().eq('id', existing.id);
      } else if (existing) {
        return client.from('forum_votes').update({ value: value }).eq('id', existing.id);
      } else {
        var row = { user_id: forumUser.id, value: value };
        row[targetField] = targetId;
        return client.from('forum_votes').insert(row);
      }
    })
    .then(function () { if (onDone) onDone(); });
}
