/**
 * Vivitalk embeddable widget — vanilla JS, zero deps.
 * Usage on any site:
 *   <script src="http://YOUR_BACKEND/widget.js" data-chatbot-id="UUID" data-api="http://BACKEND" defer></script>
 */
(function () {
  if (window.__VIVITALK_LOADED__) return;
  window.__VIVITALK_LOADED__ = true;

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var chatbotId = script.getAttribute('data-chatbot-id');
  var apiBase = (script.getAttribute('data-api') || '').replace(/\/$/, '');
  if (!chatbotId || !apiBase) {
    console.error('[Vivitalk] Missing data-chatbot-id or data-api');
    return;
  }

  var sessionId = null;
  var primary = '#7c3aed';
  var name = 'Vivitalk';
  var welcome = '안녕하세요! 무엇을 도와드릴까요?';
  var open = false;

  // ---------------------------------------------------------------
  // CSS
  // ---------------------------------------------------------------
  var css = (
    '.vt-bubble{position:fixed;right:24px;bottom:24px;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.18);background:var(--vt-color);z-index:2147483646;display:flex;align-items:center;justify-content:center;transition:transform .2s}' +
    '.vt-bubble:hover{transform:scale(1.05)}' +
    '.vt-bubble svg{width:28px;height:28px;fill:#fff}' +
    '.vt-panel{position:fixed;right:24px;bottom:96px;width:380px;max-width:calc(100vw - 48px);height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;box-shadow:0 30px 60px rgba(0,0,0,.22);overflow:hidden;display:none;flex-direction:column;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#111}' +
    '.vt-panel.open{display:flex}' +
    '.vt-head{background:var(--vt-color);color:#fff;padding:14px 18px;display:flex;align-items:center;justify-content:space-between}' +
    '.vt-head .t{font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px}' +
    '.vt-head .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.25)}' +
    '.vt-close{background:transparent;border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1}' +
    '.vt-msgs{flex:1;overflow-y:auto;padding:16px;background:linear-gradient(180deg,#fafafa,#fff)}' +
    '.vt-row{display:flex;margin-bottom:10px}' +
    '.vt-row.user{justify-content:flex-end}' +
    '.vt-bub{max-width:80%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word}' +
    '.vt-row.user .vt-bub{background:var(--vt-color);color:#fff;border-bottom-right-radius:4px}' +
    '.vt-row.bot .vt-bub{background:#f1f1f5;color:#111;border-bottom-left-radius:4px}' +
    '.vt-row.bot .vt-src{font-size:11px;color:#666;margin-top:6px}' +
    '.vt-input{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff}' +
    '.vt-input input{flex:1;border:1px solid #e5e5ea;border-radius:999px;padding:10px 14px;outline:none;font-size:14px}' +
    '.vt-input input:focus{border-color:var(--vt-color)}' +
    '.vt-input button{background:var(--vt-color);color:#fff;border:none;border-radius:999px;padding:0 16px;cursor:pointer;font-weight:600;font-size:14px}' +
    '.vt-input button:disabled{opacity:.5;cursor:default}' +
    '.vt-typing{font-size:12px;color:#888;padding:0 16px 8px}' +
    '.vt-foot{font-size:11px;color:#aaa;text-align:center;padding:6px}'
  );

  function injectCss() {
    var s = document.createElement('style');
    s.id = 'vt-css';
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------
  var bubble, panel, msgsEl, inputEl, sendBtn, typingEl;

  function buildDom() {
    bubble = document.createElement('button');
    bubble.className = 'vt-bubble';
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7zm0 4h7v2H7z"/></svg>';
    bubble.onclick = togglePanel;

    panel = document.createElement('div');
    panel.className = 'vt-panel';
    panel.innerHTML =
      '<div class="vt-head"><div class="t"><span class="dot"></span><span class="vt-name">' + escape(name) + '</span></div><button class="vt-close" aria-label="Close">✕</button></div>' +
      '<div class="vt-msgs"></div>' +
      '<div class="vt-typing" style="display:none">답변을 작성하는 중…</div>' +
      '<div class="vt-input"><input type="text" placeholder="메시지를 입력하세요" /><button>전송</button></div>' +
      '<div class="vt-foot">Powered by Vivitalk</div>';

    panel.style.setProperty('--vt-color', primary);
    bubble.style.setProperty('--vt-color', primary);

    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    msgsEl = panel.querySelector('.vt-msgs');
    inputEl = panel.querySelector('.vt-input input');
    sendBtn = panel.querySelector('.vt-input button');
    typingEl = panel.querySelector('.vt-typing');
    panel.querySelector('.vt-close').onclick = togglePanel;
    sendBtn.onclick = send;
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  function escape(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function addMsg(role, text, sources) {
    var row = document.createElement('div');
    row.className = 'vt-row ' + role;
    var bub = document.createElement('div');
    bub.className = 'vt-bub';
    bub.textContent = text;
    row.appendChild(bub);
    if (role === 'bot' && sources && sources.length) {
      var src = document.createElement('div');
      src.className = 'vt-src';
      var names = sources.slice(0, 3).map(function (s) { return s.document_name || s.document_id; });
      src.textContent = '근거: ' + names.join(', ');
      row.appendChild(src);
    }
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function togglePanel() {
    open = !open;
    if (open) {
      panel.classList.add('open');
      setTimeout(function () { inputEl.focus(); }, 50);
    } else {
      panel.classList.remove('open');
    }
  }

  // ---------------------------------------------------------------
  // API
  // ---------------------------------------------------------------
  function fetchInfo() {
    return fetch(apiBase + '/api/v1/widget/' + chatbotId)
      .then(function (r) {
        if (!r.ok) throw new Error('info ' + r.status);
        return r.json();
      });
  }

  function send() {
    var msg = (inputEl.value || '').trim();
    if (!msg) return;
    inputEl.value = '';
    addMsg('user', msg);
    typingEl.style.display = 'block';
    sendBtn.disabled = true;

    fetch(apiBase + '/api/v1/widget/' + chatbotId + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, session_id: sessionId }),
    })
      .then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error(t || ('HTTP ' + r.status)); });
        return r.json();
      })
      .then(function (data) {
        sessionId = data.session_id || sessionId;
        addMsg('bot', data.response, data.sources);
      })
      .catch(function (err) {
        addMsg('bot', '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        console.error('[Vivitalk]', err);
      })
      .then(function () {
        typingEl.style.display = 'none';
        sendBtn.disabled = false;
        inputEl.focus();
      });
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  function boot() {
    injectCss();
    fetchInfo()
      .then(function (info) {
        name = info.name || name;
        welcome = info.welcome_message || welcome;
        primary = info.primary_color || primary;
        buildDom();
        addMsg('bot', welcome);
      })
      .catch(function (err) {
        console.error('[Vivitalk] init failed:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
