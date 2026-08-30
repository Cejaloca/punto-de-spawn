// ============================================================
// Foro PuntoDeSpawn — vista de hilo (foro/post.html)
// ============================================================

var forumPostId = null;
var forumAllComments = [];

document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(window.location.search);
  forumPostId = parseInt(params.get('id'), 10);

  if (!forumPostId) {
    document.getElementById('forum-thread').innerHTML = '<div class="loading">Post no encontrado.</div>';
    return;
  }

  forumInitAuth(function () {
    forumLoadThread();
  });

  window.forumOnAuthChange = forumLoadThread;

  var form = document.getElementById('forum-new-comment-form');
  if (form) form.addEventListener('submit', function (e) { forumSubmitComment(e, null, form); });
});

function forumLoadThread() {
  var client = forumInitClient();
  var container = document.getElementById('forum-thread');
  if (!client || !container) return;

  client.from('forum_posts').select('*, forum_profiles(username, avatar_url)').eq('id', forumPostId).eq('is_deleted', false).single()
    .then(function (res) {
      if (res.error || !res.data) {
        container.innerHTML = '<div class="loading">Este post no existe o fue borrado.</div>';
        return;
      }
      forumRenderPost(res.data);
      forumLoadComments();
    });
}

function forumRenderPost(p) {
  document.title = p.titulo + ' — Foro PuntoDeSpawn';
  var author = (p.forum_profiles && p.forum_profiles.username) || 'Usuario';
  var box = document.getElementById('forum-post-box');

  var afterVotesRender = function (myVote) {
    box.innerHTML =
      '<div class="forum-vote-col">' +
        '<button class="forum-vote-btn' + (myVote === 1 ? ' active-up' : '') + '" id="forum-post-up" aria-label="Votar arriba">▲</button>' +
        '<span class="forum-score" id="forum-post-score">' + p.score + '</span>' +
        '<button class="forum-vote-btn' + (myVote === -1 ? ' active-down' : '') + '" id="forum-post-down" aria-label="Votar abajo">▼</button>' +
      '</div>' +
      '<div class="forum-post-body">' +
        '<div class="post-tags"><span class="tag">' + forumEscapeHtml(p.tag) + '</span></div>' +
        '<h1 class="forum-post-title-full">' + forumEscapeHtml(p.titulo) + '</h1>' +
        '<div class="forum-post-meta">' +
          '<span>' + forumEscapeHtml(author) + '</span> · <span>' + forumTimeAgo(p.created_at) + '</span>' +
        '</div>' +
        '<p class="forum-post-content-full">' + forumEscapeHtml(p.contenido).replace(/\n/g, '<br>') + '</p>' +
      '</div>';

    document.getElementById('forum-post-up').addEventListener('click', function () {
      forumToggleVote('post_id', p.id, 1, forumLoadThread);
    });
    document.getElementById('forum-post-down').addEventListener('click', function () {
      forumToggleVote('post_id', p.id, -1, forumLoadThread);
    });
  };

  if (!forumUser) { afterVotesRender(0); return; }

  var client = forumInitClient();
  client.from('forum_votes').select('value').eq('user_id', forumUser.id).eq('post_id', p.id).maybeSingle()
    .then(function (res) { afterVotesRender(res.data ? res.data.value : 0); });
}

function forumLoadComments() {
  var client = forumInitClient();
  client.from('forum_comments').select('*, forum_profiles(username, avatar_url)').eq('post_id', forumPostId).eq('is_deleted', false).order('created_at', { ascending: true })
    .then(function (res) {
      forumAllComments = res.data || [];
      if (!forumUser) { forumRenderComments({}); return; }
      client.from('forum_votes').select('comment_id, value').eq('user_id', forumUser.id)
        .in('comment_id', forumAllComments.map(function (c) { return c.id; }))
        .then(function (voteRes) {
          var myVotes = {};
          (voteRes.data || []).forEach(function (v) { myVotes[v.comment_id] = v.value; });
          forumRenderComments(myVotes);
        });
    });
}

function forumRenderComments(myVotes) {
  var container = document.getElementById('forum-comments');
  var countEl = document.getElementById('forum-comment-count');
  if (countEl) countEl.textContent = forumAllComments.length;

  if (!forumAllComments.length) {
    container.innerHTML = '<p class="loading">Todavía no hay comentarios. Arrancá la charla.</p>';
    return;
  }

  var byParent = {};
  forumAllComments.forEach(function (c) {
    var key = c.parent_id || 'root';
    byParent[key] = byParent[key] || [];
    byParent[key].push(c);
  });

  function renderLevel(parentKey, depth) {
    var list = byParent[parentKey];
    if (!list) return '';
    return list.map(function (c) {
      var author = (c.forum_profiles && c.forum_profiles.username) || 'Usuario';
      var myVote = myVotes[c.id] || 0;
      return (
        '<div class="forum-comment" style="margin-left:' + Math.min(depth, 6) * 20 + 'px" data-comment-id="' + c.id + '">' +
          '<div class="forum-comment-meta"><strong>' + forumEscapeHtml(author) + '</strong> · ' + forumTimeAgo(c.created_at) + '</div>' +
          '<p class="forum-comment-content">' + forumEscapeHtml(c.contenido).replace(/\n/g, '<br>') + '</p>' +
          '<div class="forum-comment-actions">' +
            '<button class="forum-vote-btn small' + (myVote === 1 ? ' active-up' : '') + '" data-comment-id="' + c.id + '" data-value="1">▲</button>' +
            '<span class="forum-score small">' + c.score + '</span>' +
            '<button class="forum-vote-btn small' + (myVote === -1 ? ' active-down' : '') + '" data-comment-id="' + c.id + '" data-value="-1">▼</button>' +
            '<button class="forum-reply-toggle" data-comment-id="' + c.id + '">Responder</button>' +
          '</div>' +
          '<div class="forum-reply-form-slot" id="reply-slot-' + c.id + '"></div>' +
          renderLevel(c.id, depth + 1) +
        '</div>'
      );
    }).join('');
  }

  container.innerHTML = renderLevel('root', 0);

  container.querySelectorAll('.forum-vote-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var commentId = parseInt(btn.dataset.commentId, 10);
      var value = parseInt(btn.dataset.value, 10);
      forumToggleVote('comment_id', commentId, value, forumLoadComments);
    });
  });

  container.querySelectorAll('.forum-reply-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var commentId = btn.dataset.commentId;
      var slot = document.getElementById('reply-slot-' + commentId);
      if (slot.innerHTML) { slot.innerHTML = ''; return; }
      if (!forumUser) { alert('Iniciá sesión con Google para responder.'); return; }
      slot.innerHTML =
        '<form class="forum-reply-form">' +
          '<textarea class="forum-comment-input" placeholder="Escribí tu respuesta..." required></textarea>' +
          '<button type="submit" class="btn-primary">Responder</button>' +
        '</form>';
      slot.querySelector('form').addEventListener('submit', function (e) {
        forumSubmitComment(e, parseInt(commentId, 10), slot.querySelector('form'));
      });
    });
  });
}

function forumSubmitComment(e, parentId, formEl) {
  e.preventDefault();
  var client = forumInitClient();
  if (!client || !forumUser) { alert('Iniciá sesión con Google para comentar.'); return; }

  var textarea = formEl.querySelector('textarea');
  var contenido = textarea.value.trim();
  if (!contenido) return;

  client.from('forum_comments').insert({
    post_id: forumPostId,
    parent_id: parentId,
    user_id: forumUser.id,
    contenido: contenido
  }).then(function (res) {
    if (res.error) { alert('No se pudo comentar: ' + res.error.message); return; }
    formEl.reset();
    forumLoadComments();
  });
}
