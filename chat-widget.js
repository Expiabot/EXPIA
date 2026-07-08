(function () {
  'use strict';

  var GREETING = "Bonjour ! Je suis l'assistant d'EXPIA. Comment puis-je vous aider ?";
  var SUGGESTIONS = ['Vous faites quoi exactement ?', 'Combien ça coûte ?', 'Vous intervenez sur le Morbihan ?'];
  var history = [];

  var root = document.createElement('div');
  root.id = 'expia-chat';
  root.innerHTML =
    '<button id="expia-launcher" aria-label="Discuter avec l\'assistant">✦ Discuter avec l\'assistant</button>' +
    '<div id="expia-panel" hidden>' +
      '<header id="expia-head">' +
        '<div class="expia-head-info"><strong>Assistant EXPIA</strong><span>● En ligne</span></div>' +
        '<div class="expia-head-actions">' +
          '<button id="expia-lead-btn" type="button">📩 Être recontacté</button>' +
          '<button id="expia-close" type="button" aria-label="Fermer">✕</button>' +
        '</div>' +
      '</header>' +
      '<div id="expia-messages"></div>' +
      '<form id="expia-form">' +
        '<input id="expia-input" type="text" placeholder="Écrire un message…" autocomplete="off" maxlength="2000" />' +
        '<button type="submit" aria-label="Envoyer">➤</button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(root);

  var $ = function (sel) { return root.querySelector(sel); };
  var launcher = $('#expia-launcher');
  var panel = $('#expia-panel');
  var messagesEl = $('#expia-messages');
  var form = $('#expia-form');
  var input = $('#expia-input');
  var started = false;

  function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(role, text) {
    var el = document.createElement('div');
    el.className = 'expia-msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollDown();
    return el;
  }

  function addSuggestions() {
    var wrap = document.createElement('div');
    wrap.className = 'expia-suggestions';
    SUGGESTIONS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s;
      b.onclick = function () { wrap.remove(); send(s); };
      wrap.appendChild(b);
    });
    messagesEl.appendChild(wrap);
    scrollDown();
  }

  function startConversation() {
    if (started) return;
    started = true;
    addMessage('bot', GREETING);
    addSuggestions();
  }

  function send(text) {
    text = (text || '').trim();
    if (!text) return;
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';

    var typing = addMessage('bot', '…');
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.d.error || 'Erreur');
        typing.textContent = res.d.reply;
        history.push({ role: 'assistant', content: res.d.reply });
        scrollDown();
      })
      .catch(function () {
        typing.textContent = "Désolé, une erreur est survenue. Vous pouvez aussi nous écrire à esteban@expia.fr.";
      });
  }

  function showLeadForm() {
    if (root.querySelector('.expia-lead-form')) return;
    var box = document.createElement('div');
    box.className = 'expia-lead-form';
    box.innerHTML =
      '<input class="expia-lead-name" type="text" placeholder="Votre nom" maxlength="100" />' +
      '<input class="expia-lead-contact" type="text" placeholder="Email ou téléphone" maxlength="200" />' +
      '<label><input class="expia-lead-consent" type="checkbox" /> ' +
        'J\'accepte d\'être recontacté par EXPIA (<a href="/mentions-legales.html" target="_blank">mentions légales</a>).</label>' +
      '<button type="button" class="expia-lead-send">Envoyer mes coordonnées</button>';
    messagesEl.appendChild(box);
    scrollDown();

    box.querySelector('.expia-lead-send').onclick = function () {
      var payload = {
        name: box.querySelector('.expia-lead-name').value,
        contact: box.querySelector('.expia-lead-contact').value,
        consent: box.querySelector('.expia-lead-consent').checked,
        message: history.map(function (m) { return m.role + ': ' + m.content; }).join('\n'),
      };
      var btn = box.querySelector('.expia-lead-send');
      btn.disabled = true;
      btn.textContent = 'Envoi…';
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d.error || 'Erreur');
          box.remove();
          addMessage('bot', 'Merci ! Esteban vous recontactera très vite.');
        })
        .catch(function (e) {
          btn.disabled = false;
          btn.textContent = 'Envoyer mes coordonnées';
          addMessage('bot', e.message || 'Envoi impossible, écrivez-nous à esteban@expia.fr.');
        });
    };
  }

  launcher.onclick = function () {
    panel.hidden = false;
    launcher.hidden = true;
    startConversation();
    input.focus();
  };
  $('#expia-close').onclick = function () {
    panel.hidden = true;
    launcher.hidden = false;
  };
  $('#expia-lead-btn').onclick = showLeadForm;
  form.onsubmit = function (e) { e.preventDefault(); send(input.value); };
})();
