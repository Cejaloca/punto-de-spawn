// ============================================================
// Foro PuntoDeSpawn — feed principal (comunidad.html)
// ============================================================

var forumCurrentTag = 'todos';
var forumCurrentSort = 'created_at';

document.addEventListener('DOMContentLoaded', function () {
  forumInitAuth(function () {
    forumLoadFeed();
  });

  window.forumOnAuthChange = forumLoadFeed;

  document.querySelectorAll('#forum-tag-filters .filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#forum-tag-filters .filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      forumCurrentTag = btn.dataset.tag;
      forumLoadFeed();
    });
  });

  document.querySelectorAll('#forum-sort-filters .filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#forum-sort-filters .filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      forumCurrentSort = btn.dataset.sort;
      forumLoadFeed();
    });
  });

  var form = document.getElementById('forum-new-post-form');
  if (form) form.addEventListener('submit', forumSubmitNewPost);
});

function forumLoadFeed() {
  var client = forumInitClient();
  var container = document.getElementById('forum-feed');
  if (!client || !container) return;

  container.innerHTML = '<div class="loading">Cargando posts...</div>';

  var query = client.from('forum_posts')
    .select('*, forum_profiles(username, avatar_url)')
    .eq('is_deleted', false)
    .order(forumCurrentSort, { ascending: false })
    .limit(50);

  if (forumCurrentTag !== 'todos') query = query.eq('tag', forumCurrentTag);

  query.then(function (res) {
    if (res.error) {
      container.innerHTML = '<div class="loading">No se pudo cargar el foro. Probá de nuevo en un rato.</div>';
      console.error(res.error);
      return;
    }
    var posts = res.data || [];
    if (!posts.length) {
      container.innerHTML = '<div class="loading">Todavía no hay posts en esta categoría. ¡Sé el primero!</div>';
      return;
    }

    if (!forumUser) {
      forumRenderFeed(posts, {});
      return;
    }

    client.from('forum_votes').select('post_id, value').eq('user_id', forumUser.id)
      .in('post_id', posts.map(function (p) { return p.id; }))
      .then(function (voteRes) {
        var myVotes = {};
        (voteRes.data || []).forEach(function (v) { myVotes[v.post_id] = v.value; });
        forumRenderFeed(posts, myVotes);
      });
  });
}

function forumRenderFeed(posts, myVotes) {
  var container = document.getElementById('forum-feed');
  container.innerHTML = posts.map(function (p) {
    var author = (p.forum_profiles && p.forum_profiles.username) || 'Usuario';
    var myVote = myVotes[p.id] || 0;
    return (
      '<article class="forum-post-card" data-tag="' + p.tag + '" data-post-id="' + p.id + '">' +
        '<div class="forum-vote-col">' +
          '<button class="forum-vote-btn' + (myVote === 1 ? ' active-up' : '') + '" data-post-id="' + p.id + '" data-value="1" aria-label="Votar arriba">▲</button>' +
          '<span class="forum-score">' + p.score + '</span>' +
          '<button class="forum-vote-btn' + (myVote === -1 ? ' active-down' : '') + '" data-post-id="' + p.id + '" data-value="-1" aria-label="Votar abajo">▼</button>' +
        '</div>' +
        '<div class="forum-post-body">' +
          '<div class="post-tags"><span class="badge ' + forumTagBadgeClass(p.tag) + '">' + forumTagLabel(p.tag) + '</span></div>' +
          '<a href="foro/post.html?id=' + p.id + '" class="forum-post-title">' + forumEscapeHtml(p.titulo) + '</a>' +
          '<p class="forum-post-excerpt">' + forumEscapeHtml(p.contenido.slice(0, 220)) + (p.contenido.length > 220 ? '…' : '') + '</p>' +
          '<div class="forum-post-meta">' +
            '<span>' + forumEscapeHtml(author) + '</span> · <span>' + forumTimeAgo(p.created_at) + '</span> · ' +
            '<a href="foro/post.html?id=' + p.id + '">' + p.comment_count + ' comentario' + (p.comment_count === 1 ? '' : 's') + '</a>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  container.querySelectorAll('.forum-vote-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var postId = parseInt(btn.dataset.postId, 10);
      var value = parseInt(btn.dataset.value, 10);
      forumToggleVote('post_id', postId, value, forumLoadFeed);
    });
  });
}

function forumSubmitNewPost(e) {
  e.preventDefault();
  var client = forumInitClient();
  if (!client || !forumUser) { alert('Iniciá sesión con Google para publicar.'); return; }

  var titulo = document.getElementById('forum-new-title').value.trim();
  var contenido = document.getElementById('forum-new-content').value.trim();
  var tag = document.getElementById('forum-new-tag').value;

  if (titulo.length < 3) { alert('El título necesita al menos 3 caracteres.'); return; }
  if (!contenido) { alert('Escribí algo en el contenido del post.'); return; }

  var submitBtn = document.getElementById('forum-new-post-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Publicando...';

  client.from('forum_posts').insert({
    user_id: forumUser.id,
    titulo: titulo,
    contenido: contenido,
    tag: tag
  }).then(function (res) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publicar';
    if (res.error) {
      alert('No se pudo publicar: ' + res.error.message);
      return;
    }
    document.getElementById('forum-new-post-form').reset();
    document.getElementById('forum-new-post-form').classList.remove('open');
    forumLoadFeed();
  });
}
