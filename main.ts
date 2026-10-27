<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aifute 7.0</title>
<script src="https://js.puter.com/v2/"></script>
<style>
  /* ... (стили остались точно такими же, я их не трогал) ... */
  :root {
    --bg: #ffffff; --text: #000000;
    --bubble-ai: #f4f4f5; --bubble-user: #000000; --bubble-user-text: #ffffff;
    --border: #e5e5e5; --input-bg: #ffffff; --input-border: #d4d4d4;
    --accent: #ff7a00; --panel-bg: #fafafa; --hover: #f0f0f0;
    --meta: #999999; --error-bg: #ffe8e8; --error-text: #b00000; --error-border: #f3b8b8;
  }
  body.theme-dark {
    --bg: #121212; --text: #ffffff;
    --bubble-ai: #1e1e1e; --bubble-user: #ff7a00; --bubble-user-text: #000000;
    --border: #2a2a2a; --input-bg: #1e1e1e; --input-border: #333333;
    --panel-bg: #1a1a1a; --hover: #2a2a2a;
    --meta: #777777; --error-bg: #3a1a1a; --error-text: #ff8888; --error-border: #5a2a2a;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    display: flex; flex-direction: column;
    height: 100vh; height: 100dvh;
    transition: background 0.2s, color 0.2s;
  }
  header { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); position: relative; }
  .menu-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; width: 34px; }
  .menu-btn:hover { background: var(--hover); }
  .menu-btn span { display: block; height: 2px; background: var(--text); border-radius: 2px; width: 20px; }
  .logo-wrap { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none; }
  .logo { display: inline-block; font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #ff7a00; -webkit-text-stroke: 2px #000; paint-order: stroke fill; user-select: none; position: relative; }
  body.theme-dark .logo { -webkit-text-stroke: 2px #fff; }
  .version { position: absolute; top: -4px; right: -42px; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #ff7a00; -webkit-text-stroke: 0.6px #000; paint-order: stroke fill; user-select: none; white-space: nowrap; }
  body.theme-dark .version { -webkit-text-stroke: 0.6px #fff; }
  .new-chat-btn { background: none; border: none; cursor: pointer; padding: 0; border-radius: 50%; color: var(--accent); font-size: 24px; font-weight: 700; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; line-height: 1; transition: background 0.15s, transform 0.1s; }
  .new-chat-btn:hover { background: var(--hover); }
  .new-chat-btn:active { transform: scale(0.9); }
  .sidebar { position: fixed; top: 0; left: -300px; width: 280px; height: 100vh; height: 100dvh; background: var(--panel-bg); border-right: 1px solid var(--border); z-index: 300; display: flex; flex-direction: column; transition: left 0.3s ease; padding: 16px; overflow-y: auto; }
  .sidebar.open { left: 0; }
  .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .sidebar-title { font-size: 18px; font-weight: 700; }
  .close-btn { background: none; border: none; cursor: pointer; color: var(--text); font-size: 24px; padding: 4px 8px; border-radius: 6px; line-height: 1; }
  .close-btn:hover { background: var(--hover); }
  .accordion { border-radius: 12px; overflow: hidden; margin-bottom: 10px; border: 1px solid var(--border); background: var(--bg); }
  .accordion-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; cursor: pointer; user-select: none; font-size: 14px; font-weight: 600; transition: background 0.15s; }
  .accordion-header:hover { background: var(--hover); }
  .accordion-header .arrow { font-size: 12px; color: var(--meta); transition: transform 0.2s; display: inline-block; }
  .accordion.open .accordion-header .arrow { transform: rotate(90deg); }
  .accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
  .accordion.open .accordion-body { max-height: 5000px; }
  .accordion-content { padding: 8px 14px 14px; }
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; gap: 8px; }
  .settings-row select, .settings-row input[type="text"] { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--input-bg); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; max-width: 140px; }
  .lang-wrapper { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
  .lang-search { padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--input-bg); color: var(--text); font-size: 12px; outline: none; width: 140px; }
  .chat-list { display: flex; flex-direction: column; gap: 4px; }
  .chat-item { padding: 8px 10px; border-radius: 10px; cursor: pointer; font-size: 14px; display: flex; justify-content: space-between; align-items: center; gap: 4px; color: var(--text); }
  .chat-item:hover { background: var(--hover); }
  .chat-item.active { background: var(--accent); color: #000; font-weight: 600; }
  .chat-item .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chat-item .mini-btn { background: none; border: none; cursor: pointer; color: var(--meta); font-size: 13px; padding: 2px 4px; line-height: 1; opacity: 0.6; border-radius: 4px; display: flex; align-items: center; }
  .chat-item .mini-btn:hover { opacity: 1; background: rgba(0,0,0,0.08); }
  .chat-item .mini-btn.del:hover { color: #ff4444; }
  .chat-item.active .mini-btn { color: #000; }
  .chat-item.active .mini-btn:hover { background: rgba(0,0,0,0.15); }
  .chat-item .mini-btn svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 250; display: none; }
  .overlay.show { display: block; }
  #chat { flex: 1; overflow-y: auto; padding: 18px 14px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
  .user-wrap, .ai-wrap { display: flex; flex-direction: column; gap: 3px; max-width: 85%; animation: fadeIn 0.25s ease; }
  .user-wrap { align-self: flex-end; align-items: flex-end; }
  .ai-wrap { align-self: flex-start; align-items: flex-start; }
  .msg { padding: 11px 15px; border-radius: 18px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; font-size: 15px; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .user { background: var(--bubble-user); color: var(--bubble-user-text); border-bottom-right-radius: 6px; }
  .ai { background: var(--bubble-ai); color: var(--text); border-bottom-left-radius: 6px; }
  .msg-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; width: 100%; }
  .msg-actions { display: flex; align-items: center; gap: 2px; }
  .action-btn { background: none; border: none; cursor: pointer; padding: 3px 6px; border-radius: 6px; font-size: 12px; opacity: 0.55; transition: opacity 0.15s, background 0.15s; display: flex; align-items: center; gap: 3px; color: var(--text); font-family: inherit; }
  .action-btn:hover { opacity: 1; background: var(--hover); }
  .action-btn.copied { color: var(--accent); opacity: 1; }
  .action-btn svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .version-switcher { display: flex; align-items: center; gap: 4px; margin-left: auto; font-size: 12px; color: var(--meta); user-select: none; }
  .version-switcher button { background: none; border: none; cursor: pointer; padding: 2px 4px; color: var(--meta); font-size: 14px; line-height: 1; font-family: inherit; }
  .version-switcher button:hover:not(:disabled) { color: var(--accent); }
  .version-switcher button:disabled { opacity: 0.3; cursor: not-allowed; }
  .version-switcher .counter { padding: 0 4px; }
  .reasoning-block { margin-top: 8px; padding: 8px 10px; border-radius: 10px; background: rgba(100, 100, 255, 0.08); border: 1px solid rgba(100, 100, 255, 0.2); font-size: 12px; font-style: italic; color: var(--meta); max-height: 200px; overflow-y: auto; }
  .reasoning-block .reasoning-title { font-weight: 700; color: #6666ff; margin-bottom: 6px; font-style: normal; }
  .sources-block { margin-top: 8px; padding: 8px 10px; border-radius: 10px; background: rgba(255, 122, 0, 0.08); border: 1px solid rgba(255, 122, 0, 0.2); font-size: 12px; }
  .sources-block .src-title { font-weight: 700; color: var(--accent); margin-bottom: 6px; }
  .sources-block a { color: var(--text); text-decoration: none; display: block; padding: 3px 0; opacity: 0.8; line-height: 1.4; }
  .sources-block a:hover { opacity: 1; text-decoration: underline; color: var(--accent); }
  .typing { font-style: italic; color: var(--meta); }
  .error { background: var(--error-bg); color: var(--error-text); border: 1px solid var(--error-border); }
  .toolbar { padding: 8px 14px 0; display: flex; gap: 8px; background: var(--bg); flex-wrap: wrap; }
  .tool-btn { padding: 6px 12px; border-radius: 16px; border: 1.5px solid var(--border); background: var(--input-bg); color: var(--text); font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s; opacity: 0.6; }
  .tool-btn:hover { opacity: 1; }
  .tool-btn.active { background: var(--accent); color: #000; border-color: var(--accent); opacity: 1; }
  footer { padding: 8px 14px 16px; display: flex; align-items: flex-end; gap: 8px; background: var(--bg); }
  #question { flex: 1; padding: 12px 16px; font-size: 16px; border: 1.5px solid var(--input-border); border-radius: 24px; outline: none; background: var(--input-bg); color: var(--text); transition: border-color 0.15s; font-family: inherit; resize: none; min-height: 46px; max-height: 150px; line-height: 1.4; overflow-y: hidden; }
  #question:focus { border-color: var(--accent); }
  #question.edit-mode { border-color: var(--accent); background: rgba(255, 122, 0, 0.08); }
  #send { width: 46px; height: 46px; min-width: 46px; border-radius: 50%; background: var(--accent); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.1s; padding: 0; }
  #send:hover { background: #ff8c1a; }
  #send:active { transform: scale(0.93); }
  #send:disabled { background: #999; cursor: not-allowed; transform: none; }
  #send svg { width: 20px; height: 20px; stroke: #fff; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; fill: none; }
  #send .stop-icon { width: 14px; height: 14px; background: #fff; border-radius: 3px; display: none; }
  #send.stopping .arrow-icon { display: none; }
  #send.stopping .stop-icon { display: block; }
  .toast { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%) translateY(20px); background: #000; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 13px; opacity: 0; pointer-events: none; transition: opacity 0.25s, transform 0.25s; z-index: 400; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
  .modal-bg.show { display: flex; }
  .modal { background: var(--bg); color: var(--text); border-radius: 16px; padding: 20px; max-width: 340px; width: 100%; border: 2px solid var(--border); }
  .modal h3 { font-size: 16px; margin-bottom: 10px; }
  .modal p { font-size: 14px; margin-bottom: 16px; line-height: 1.4; }
  .modal input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1.5px solid var(--input-border); background: var(--input-bg); color: var(--text); font-size: 14px; font-family: inherit; outline: none; margin-bottom: 16px; }
  .modal input:focus { border-color: var(--accent); }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .modal-actions button { padding: 8px 16px; border-radius: 16px; border: 1.5px solid var(--text); font-size: 13px; font-weight: 600; cursor: pointer; background: transparent; color: var(--text); font-family: inherit; }
  .modal-actions .primary { background: var(--accent); color: #000; border-color: var(--accent); }
  .modal-actions .primary:hover { background: #ffa64d; }
  .modal-actions .danger { background: #ff4444; color: #fff; border-color: #ff4444; }
  .modal-actions .danger:hover { background: #cc0000; }
</style>
</head>
<body>

<header>
  <button class="menu-btn" id="menuBtn" aria-label="Меню">
    <span></span><span></span><span></span>
  </button>
  <div class="logo-wrap">
    <span class="logo">Aifute<span class="version">7.0</span></span>
  </div>
  <button class="new-chat-btn" id="newChatBtn" title="Новый чат">+</button>
</header>

<div class="overlay" id="overlay"></div>

<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-title">Меню</div>
    <button class="close-btn" id="closeBtn">×</button>
  </div>
  
  <div class="accordion" id="settingsAccordion">
    <div class="accordion-header" id="settingsHeader">
      <span>⚙️ Настройки</span><span class="arrow">▶</span>
    </div>
    <div class="accordion-body">
      <div class="accordion-content">
        <div class="settings-row">
          <span>Модель</span>
          <select id="modelSelect">
            <option value="openai/gpt-5.6-luna">GPT-5.6 Luna (Puter)</option>
            <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Puter)</option>
            <option value="gemini-3.1-original">Gemini 3.1 (Оригинал)</option>
          </select>
        </div>
        <div class="settings-row">
          <span>Лимит</span>
          <select id="tokenLimitSelect">
            <option value="512">512</option>
            <option value="1024">1024</option>
            <option value="2048">2048</option>
            <option value="4096" selected>4096</option>
            <option value="8192">8192</option>
            <option value="16384">16384</option>
          </select>
        </div>
        <div class="settings-row" style="align-items: flex-start;">
          <span style="padding-top: 6px;">Язык</span>
          <div class="lang-wrapper">
            <input type="text" id="langSearch" class="lang-search" placeholder="Поиск...">
            <select id="langSelect"></select>
          </div>
        </div>
        <div class="settings-row">
          <span>Тема</span>
          <select id="themeSelect">
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="accordion" id="memoryAccordion">
    <div class="accordion-header" id="memoryHeader">
      <span>🧠 Память (<span id="memoryCount">0</span>)</span>
      <span class="arrow">▶</span>
    </div>
    <div class="accordion-body">
      <div class="accordion-content">
        <div class="chat-list" id="memoryList" style="margin-bottom: 10px; max-height: 200px; overflow-y: auto;"></div>
        <button id="clearMemoryBtn" style="width: 100%; padding: 8px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--error-text); cursor: pointer;">Очистить память</button>
      </div>
    </div>
  </div>

  <div class="accordion" id="commandsAccordion">
    <div class="accordion-header" id="commandsHeader">
      <span>🎮 Команды</span><span class="arrow">▶</span>
    </div>
    <div class="accordion-body">
      <div class="accordion-content" style="font-size: 13px; color: var(--meta);">
        /truth<br>/human<br>/stop<br>/off
      </div>
    </div>
  </div>

  <div class="accordion" id="folderAccordion">
    <div class="accordion-header" id="folderHeader">
      <span>📁 Чаты (<span id="chatCount">0</span>/200)</span>
      <span class="arrow">▶</span>
    </div>
    <div class="accordion-body">
      <div class="accordion-content">
        <div class="chat-list" id="chatList"></div>
      </div>
    </div>
  </div>
</aside>

<div id="chat">
  <div class="ai-wrap">
    <div class="msg ai">Привет! Я Aifute 7.0. Теперь 3.1 работает напрямую, а 2.5 и 5.6 через Puter.</div>
  </div>
</div>

<div class="toolbar">
  <button class="tool-btn" id="thinkingBtn" title="Режим раздумий">🤔 Раздумие</button>
  <button class="tool-btn" id="searchBtn" title="Поиск в интернете">🔍 Поиск</button>
  <button class="tool-btn" id="loginBtn" title="Войти в Puter">👤 Войти</button>
</div>

<footer>
  <textarea id="question" placeholder="Спроси что-нибудь..." rows="1"></textarea>
  <button id="send" aria-label="Отправить">
    <svg class="arrow-icon" viewBox="0 0 24 24">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="6 11 12 5 18 11"></polyline>
    </svg>
    <div class="stop-icon"></div>
  </button>
</footer>

<div class="toast" id="toast">Скопировано</div>

<div class="modal-bg" id="modalBg">
  <div class="modal">
    <h3 id="modalTitle">Заголовок</h3>
    <p id="modalText" style="display:none;"></p>
    <input id="modalInput" type="text" style="display:none;">
    <div class="modal-actions">
      <button id="modalCancel">Отмена</button>
      <button id="modalConfirm" class="primary">OK</button>
    </div>
  </div>
</div>

<script>
  const MAX_CHATS = 200;
  const GEMINI_ORIGINAL_KEY = 'AQ.Ab8RN6LSEw3ZaDsfmwZ3nn2Y-3_vLr7sY-M2Cr4AlkT1I8LZtA'; // Твой оригинальный ключ
  const GEMINI_ORIGINAL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

  const LANGUAGES = [
    { code: 'ru', name: 'Русский' }, { code: 'en', name: 'English' }, { code: 'es', name: 'Español' },
    { code: 'zh', name: '中文' }, { code: 'hi', name: 'हिन्दी' }, { code: 'ar', name: 'العربية' },
    { code: 'pt', name: 'Português' }, { code: 'fr', name: 'Français' }, { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }, { code: 'ko', name: '한국어' }, { code: 'tr', name: 'Türkçe' },
    { code: 'uk', name: 'Українська' }, { code: 'it', name: 'Italiano' }, { code: 'pl', name: 'Polski' },
    { code: 'nl', name: 'Nederlands' }, { code: 'vi', name: 'Tiếng Việt' }, { code: 'th', name: 'ไทย' },
    { code: 'id', name: 'Bahasa Indonesia' }, { code: 'he', name: 'עברית' }, { code: 'el', name: 'Ελληνικά' },
    { code: 'cs', name: 'Čeština' }, { code: 'sv', name: 'Svenska' }, { code: 'hu', name: 'Magyar' },
    { code: 'ro', name: 'Română' }, { code: 'bg', name: 'Български' }, { code: 'da', name: 'Dansk' },
    { code: 'fi', name: 'Suomi' }, { code: 'no', name: 'Norsk' }, { code: 'sk', name: 'Slovenčina' },
    { code: 'hr', name: 'Hrvatski' }, { code: 'sr', name: 'Српски' }, { code: 'lt', name: 'Lietuvių' },
    { code: 'lv', name: 'Latviešu' }, { code: 'et', name: 'Eesti' }, { code: 'sl', name: 'Slovenščina' },
    { code: 'fa', name: 'فارسی' }, { code: 'ur', name: 'اردو' }, { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' }, { code: 'te', name: 'తెలుగు' }, { code: 'ml', name: 'മലയാളം' },
    { code: 'kn', name: 'ಕನ್ನಡ' }, { code: 'mr', name: 'मराठी' }, { code: 'gu', name: 'ગુજરાતી' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' }, { code: 'sw', name: 'Kiswahili' }, { code: 'am', name: 'አማርኛ' },
    { code: 'ha', name: 'Hausa' }, { code: 'yo', name: 'Yorùbá' }, { code: 'ig', name: 'Igbo' },
    { code: 'zu', name: 'isiZulu' }, { code: 'af', name: 'Afrikaans' }, { code: 'so', name: 'Soomaali' },
    { code: 'om', name: 'Oromoo' }, { code: 'xh', name: 'isiXhosa' }, { code: 'my', name: 'မြန်မာဘာသာ' },
    { code: 'km', name: 'ភាសាខ្មែរ' }, { code: 'lo', name: 'ພາສາລາວ' }, { code: 'si', name: 'සිංහල' },
    { code: 'ne', name: 'नेपाली' }, { code: 'ka', name: 'ქართული' }, { code: 'hy', name: 'Հայերեն' },
    { code: 'az', name: 'Azərbaycanca' }, { code: 'kk', name: 'Қазақша' }, { code: 'uz', name: "O'zbekcha" },
    { code: 'ky', name: 'Кыргызча' }, { code: 'tg', name: 'Тоҷикӣ' }, { code: 'mn', name: 'Монгол' },
    { code: 'ps', name: 'پښتو' }, { code: 'ku', name: 'Kurdî' }, { code: 'sq', name: 'Shqip' },
    { code: 'mk', name: 'Македонски' }, { code: 'bs', name: 'Bosanski' }, { code: 'mt', name: 'Malti' },
    { code: 'is', name: 'Íslenska' }, { code: 'ga', name: 'Gaeilge' }, { code: 'cy', name: 'Cymraeg' },
    { code: 'gl', name: 'Galego' }, { code: 'eu', name: 'Euskara' }, { code: 'ca', name: 'Català' },
    { code: 'la', name: 'Latina' }, { code: 'eo', name: 'Esperanto' }, { code: 'fy', name: 'Frysk' },
    { code: 'lb', name: 'Lëtzebuergesch' }, { code: 'rm', name: 'Rumantsch' }, { code: 'fo', name: 'Føroyskt' },
    { code: 'kl', name: 'Kalaallisut' }, { code: 'mi', name: 'Te Reo Māori' }, { code: 'sm', name: 'Gagana Samoa' },
    { code: 'to', name: 'Lea Faka-Tonga' }, { code: 'fj', name: 'Na Vosa Vakaviti' }, { code: 'mg', name: 'Malagasy' },
    { code: 'ny', name: 'Chichewa' }, { code: 'rw', name: 'Kinyarwanda' }, { code: 'sn', name: 'chiShona' },
    { code: 'st', name: 'Sesotho' }, { code: 'tn', name: 'Setswana' }, { code: 'tw', name: 'Twi' },
    { code: 'wo', name: 'Wolof' }, { code: 'yi', name: 'ייִדיש' }
  ];

  let chats = [];
  let activeChatId = null;
  let currentAbort = null;
  let editingIndex = -1;
  let thinkingMode = false;
  let searchMode = false;
  let activeCommands = { truth: false, human: false, stop: false };
  let memoryFacts = [];
  let originalEditText = '';

  const chatEl = document.getElementById('chat');
  const input = document.getElementById('question');
  const sendBtn = document.getElementById('send');
  const toast = document.getElementById('toast');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const chatList = document.getElementById('chatList');
  const chatCount = document.getElementById('chatCount');
  const langSelect = document.getElementById('langSelect');
  const langSearch = document.getElementById('langSearch');
  const themeSelect = document.getElementById('themeSelect');
  const modelSelect = document.getElementById('modelSelect');
  const tokenLimitSelect = document.getElementById('tokenLimitSelect');
  const modalBg = document.getElementById('modalBg');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const modalInput = document.getElementById('modalInput');
  const modalConfirm = document.getElementById('modalConfirm');
  const modalCancel = document.getElementById('modalCancel');
  const thinkingBtn = document.getElementById('thinkingBtn');
  const searchBtn = document.getElementById('searchBtn');
  const loginBtn = document.getElementById('loginBtn');
  const memoryList = document.getElementById('memoryList');
  const memoryCount = document.getElementById('memoryCount');
  const clearMemoryBtn = document.getElementById('clearMemoryBtn');

  function renderLanguageList(filter = '') {
    langSelect.innerHTML = '';
    LANGUAGES.filter(l => l.name.toLowerCase().includes(filter.toLowerCase())).forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.name;
      langSelect.appendChild(opt);
    });
  }
  langSearch.addEventListener('input', (e) => renderLanguageList(e.target.value));

  function saveChats() {
    try {
      localStorage.setItem('aifute_chats', JSON.stringify(chats));
      localStorage.setItem('aifute_active', activeChatId || '');
    } catch (e) {}
  }
  function loadChats() {
    try {
      const raw = localStorage.getItem('aifute_chats');
      if (raw) chats = JSON.parse(raw);
    } catch (e) { chats = []; }
  }
  function saveMemory() {
    localStorage.setItem('aifute_memory', JSON.stringify(memoryFacts));
    renderMemory();
  }
  function loadMemory() {
    try {
      const raw = localStorage.getItem('aifute_memory');
      if (raw) memoryFacts = JSON.parse(raw);
    } catch (e) { memoryFacts = []; }
    renderMemory();
  }
  function saveSettings() {
    localStorage.setItem('aifute_lang', langSelect.value);
    localStorage.setItem('aifute_theme', themeSelect.value);
    localStorage.setItem('aifute_model', modelSelect.value);
    localStorage.setItem('aifute_limit', tokenLimitSelect.value);
    localStorage.setItem('aifute_thinking', thinkingMode ? '1' : '0');
    localStorage.setItem('aifute_search', searchMode ? '1' : '0');
  }
  function loadSettings() {
    renderLanguageList();
    const lang = localStorage.getItem('aifute_lang') || 'ru';
    const theme = localStorage.getItem('aifute_theme') || 'light';
    const model = localStorage.getItem('aifute_model') || 'openai/gpt-5.6-luna';
    const limit = localStorage.getItem('aifute_limit') || '4096';
    thinkingMode = localStorage.getItem('aifute_thinking') === '1';
    searchMode = localStorage.getItem('aifute_search') === '1';
    
    langSelect.value = lang;
    if (!langSelect.value) langSelect.value = 'ru';

    themeSelect.value = theme;
    modelSelect.value = model;
    tokenLimitSelect.value = limit;
    applyTheme(theme);
    updateToolButtons();
  }
  function applyTheme(theme) {
    if (theme === 'dark') document.body.classList.add('theme-dark');
    else document.body.classList.remove('theme-dark');
  }
  function updateToolButtons() {
    thinkingBtn.classList.toggle('active', thinkingMode);
    searchBtn.classList.toggle('active', searchMode);
  }

  function addMemory(fact) {
    if (!fact || fact.length < 3) return;
    if (memoryFacts.some(f => f.toLowerCase() === fact.toLowerCase())) return;
    memoryFacts.push(fact);
    saveMemory();
  }
  function renderMemory() {
    memoryList.innerHTML = '';
    memoryCount.textContent = memoryFacts.length;
    memoryFacts.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'chat-item';
      item.style.padding = '6px 10px';
      item.innerHTML = `<span class="title" style="font-size:12px;">${f}</span>`;
      const del = document.createElement('button');
      del.className = 'mini-btn del';
      del.innerHTML = '×';
      del.onclick = () => { memoryFacts.splice(i, 1); saveMemory(); };
      item.appendChild(del);
      memoryList.appendChild(item);
    });
  }
  clearMemoryBtn.addEventListener('click', () => {
    memoryFacts = [];
    saveMemory();
    showToast('Память очищена');
  });

  function processCommand(text) {
    const trimmed = text.trim().toLowerCase();
    if (trimmed === '/truth') { activeCommands.truth = true; activeCommands.human = false; showToast('/truth включён'); return true; }
    if (trimmed === '/human') { activeCommands.human = true; activeCommands.truth = false; showToast('/human включён'); return true; }
    if (trimmed === '/stop') { activeCommands.stop = true; showToast('/stop включён'); return true; }
    if (trimmed === '/off') { activeCommands = { truth: false, human: false, stop: false }; showToast('Все команды выключены'); return true; }
    return false;
  }

  function createNewChat() {
    if (chats.length >= MAX_CHATS) {
      showModal({ title: 'Лимит чатов', text: 'Достигнут максимум — ' + MAX_CHATS + ' чатов.', confirmLabel: 'Понятно', onConfirm: () => {} });
      return null;
    }
    const newChat = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      title: 'Новый чат', messages: []
    };
    chats.push(newChat);
    activeChatId = newChat.id;
    saveChats(); renderChatList(); renderActiveChat();
    return newChat;
  }
  function switchChat(id) {
    if (id === activeChatId) return;
    activeChatId = id;
    editingIndex = -1;
    input.value = '';
    input.style.height = '46px';
    input.classList.remove('edit-mode');
    input.placeholder = 'Спроси что-нибудь...';
    saveChats(); renderChatList(); renderActiveChat(); closeSidebar();
  }
  function deleteChat(id) {
    const idx = chats.findIndex(c => c.id === id);
    if (idx === -1) return;
    chats.splice(idx, 1);
    if (activeChatId === id) activeChatId = chats.length > 0 ? chats[0].id : null;
    saveChats(); renderChatList(); renderActiveChat();
    if (chats.length === 0) createNewChat();
  }
  function renameChat(id, newTitle) {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    chat.title = newTitle.slice(0, 50);
    saveChats(); renderChatList();
  }
  function getActiveChat() { return chats.find(c => c.id === activeChatId); }

  function renderChatList() {
    chatList.innerHTML = '';
    chatCount.textContent = chats.length;
    chats.forEach(c => {
      const item = document.createElement('div');
      item.className = 'chat-item' + (c.id === activeChatId ? ' active' : '');
      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = c.title || 'Без названия';
      item.appendChild(title);
      
      const renameBtn = document.createElement('button');
      renameBtn.className = 'mini-btn';
      renameBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>';
      renameBtn.onclick = (e) => {
        e.stopPropagation();
        showModal({
          title: 'Переименовать', inputValue: c.title || '', confirmLabel: 'Сохранить',
          onConfirm: (val) => { const t = (val || '').trim(); if (t) renameChat(c.id, t); }
        });
      };
      item.appendChild(renameBtn);

      const del = document.createElement('button');
      del.className = 'mini-btn del';
      del.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
      del.onclick = (e) => {
        e.stopPropagation();
        showModal({
          title: 'Удалить?', text: '«' + (c.title || 'Без названия') + '» будет удалён.',
          confirmLabel: 'Удалить', danger: true, onConfirm: () => deleteChat(c.id)
        });
      };
      item.appendChild(del);
      item.onclick = () => switchChat(c.id);
      chatList.appendChild(item);
    });
  }

  function renderActiveChat() {
    chatEl.innerHTML = '';
    const chat = getActiveChat();
    if (!chat || chat.messages.length === 0) {
      const wrap = document.createElement('div');
      wrap.className = 'ai-wrap';
      const div = document.createElement('div');
      div.className = 'msg ai';
      div.textContent = 'Привет! Я Aifute 7.0. Теперь 3.1 работает напрямую, а 2.5 и 5.6 через Puter.';
      wrap.appendChild(div);
      chatEl.appendChild(wrap);
      return;
    }
    chat.messages.forEach((m, i) => {
      renderUserMessage(i);
      if (m.versions[m.activeVersion].ai) renderAIMessage(i);
    });
  }

  function renderUserMessage(index) {
    const chat = getActiveChat();
    const data = chat.messages[index];
    const wrap = document.createElement('div');
    wrap.className = 'user-wrap';
    wrap.dataset.userIndex = index;
    const bubble = document.createElement('div');
    bubble.className = 'msg user';
    bubble.textContent = data.versions[data.activeVersion].user;
    wrap.appendChild(bubble);
    const footer = document.createElement('div');
    footer.className = 'msg-footer';
    footer.appendChild(createActionsBlock(data.versions[data.activeVersion].user, () => startEditing(index), null));
    wrap.appendChild(footer);
    chatEl.appendChild(wrap);
  }

  function renderAIMessage(index) {
    const chat = getActiveChat();
    const data = chat.messages[index];
    const wrap = document.createElement('div');
    wrap.className = 'ai-wrap';
    wrap.dataset.aiIndex = index;
    
    const currentVersion = data.versions[data.activeVersion];
    if (!currentVersion.ai) return;

    const bubble = document.createElement('div');
    bubble.className = 'msg ai';
    bubble.textContent = currentVersion.ai;

    if (currentVersion.reasoning) {
      const rBlock = document.createElement('div');
      rBlock.className = 'reasoning-block';
      rBlock.innerHTML = `<div class="reasoning-title">💭 Размышления:</div><div>${currentVersion.reasoning}</div>`;
      bubble.appendChild(rBlock);
    }

    if (currentVersion.sources && currentVersion.sources.length > 0) {
      const srcBlock = document.createElement('div');
      srcBlock.className = 'sources-block';
      const st = document.createElement('div');
      st.className = 'src-title';
      st.textContent = 'Источники:';
      srcBlock.appendChild(st);
      currentVersion.sources.slice(0, 5).forEach(s => {
        const a = document.createElement('a');
        a.href = s.url || s.link || '#';
        a.target = '_blank';
        a.textContent = s.title || s.name || s.url || 'Источник';
        srcBlock.appendChild(a);
      });
      bubble.appendChild(srcBlock);
    }
    wrap.appendChild(bubble);

    const footer = document.createElement('div');
    footer.className = 'msg-footer';
    footer.appendChild(createActionsBlock(currentVersion.ai, null, () => shareText(currentVersion.ai)));

    if (data.versions.length > 1) {
      const switcher = document.createElement('div');
      switcher.className = 'version-switcher';
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '&#8249;';
      prevBtn.disabled = data.activeVersion === 0;
      prevBtn.onclick = () => {
        if (data.activeVersion > 0) { data.activeVersion--; saveChats(); renderActiveChat(); }
      };
      const counter = document.createElement('span');
      counter.className = 'counter';
      counter.textContent = (data.activeVersion + 1) + ' / ' + data.versions.length;
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '&#8250;';
      nextBtn.disabled = data.activeVersion === data.versions.length - 1;
      nextBtn.onclick = () => {
        if (data.activeVersion < data.versions.length - 1) { data.activeVersion++; saveChats(); renderActiveChat(); }
      };
      switcher.appendChild(prevBtn);
      switcher.appendChild(counter);
      switcher.appendChild(nextBtn);
      footer.appendChild(switcher);
    }
    wrap.appendChild(footer);
    chatEl.appendChild(wrap);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function createActionsBlock(text, onEdit, onShare) {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Копировать</span>';
    copyBtn.onclick = async () => {
      const ok = await copyText(text);
      if (ok) {
        showToast('Скопировано');
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 1200);
      }
    };
    actions.appendChild(copyBtn);
    if (onEdit) {
      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn';
      editBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg><span>Изменить</span>';
      editBtn.onclick = onEdit;
      actions.appendChild(editBtn);
    }
    if (onShare) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'action-btn';
      shareBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg><span>Поделиться</span>';
      shareBtn.onclick = onShare;
      actions.appendChild(shareBtn);
    }
    return actions;
  }

  let toastTimer = null;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) {}
    return false;
  }
  async function shareText(text) {
    if (navigator.share) {
      try { await navigator.share({ text: text }); return true; } catch (e) { return false; }
    } else {
      return await copyText(text);
    }
  }

  let currentModalHandler = null;
  function showModal({ title, text, inputValue, confirmLabel, danger, onConfirm }) {
    modalTitle.textContent = title;
    if (text) { modalText.textContent = text; modalText.style.display = ''; }
    else modalText.style.display = 'none';
    if (inputValue !== undefined) {
      modalInput.value = inputValue; modalInput.style.display = '';
      setTimeout(() => { modalInput.focus(); modalInput.select(); }, 50);
    } else modalInput.style.display = 'none';
    modalConfirm.textContent = confirmLabel || 'OK';
    modalConfirm.className = danger ? 'danger' : 'primary';
    currentModalHandler = onConfirm;
    modalBg.classList.add('show');
  }
  function closeModal() { modalBg.classList.remove('show'); currentModalHandler = null; }
  modalCancel.onclick = closeModal;
  modalConfirm.onclick = () => {
    if (currentModalHandler) {
      const val = modalInput.style.display !== 'none' ? modalInput.value : null;
      currentModalHandler(val);
    }
    closeModal();
  };
  modalBg.onclick = (e) => { if (e.target === modalBg) closeModal(); };

  function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('show'); renderChatList(); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
  document.getElementById('menuBtn').onclick = openSidebar;
  document.getElementById('closeBtn').onclick = closeSidebar;
  overlay.onclick = closeSidebar;
  
  document.getElementById('settingsHeader').onclick = () => document.getElementById('settingsAccordion').classList.toggle('open');
  document.getElementById('memoryHeader').onclick = () => document.getElementById('memoryAccordion').classList.toggle('open');
  document.getElementById('commandsHeader').onclick = () => document.getElementById('commandsAccordion').classList.toggle('open');
  document.getElementById('folderHeader').onclick = () => document.getElementById('folderAccordion').classList.toggle('open');
  
  document.getElementById('newChatBtn').onclick = () => { if (!currentAbort) createNewChat(); };

  thinkingBtn.onclick = () => { thinkingMode = !thinkingMode; updateToolButtons(); saveSettings(); showToast(thinkingMode ? 'Раздумие вкл' : 'Раздумие выкл'); };
  searchBtn.onclick = () => { searchMode = !searchMode; updateToolButtons(); saveSettings(); showToast(searchMode ? 'Поиск вкл' : 'Поиск выкл'); };
  
  loginBtn.onclick = async () => {
    try {
      if (typeof puter !== 'undefined') { await puter.auth.signIn(); showToast('Вход выполнен'); }
    } catch (e) { showToast('Ошибка входа: ' + e.message); }
  };

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
  });

  function startEditing(index) {
    if (currentAbort) return;
    if (editingIndex !== -1) cancelEditing();
    const chat = getActiveChat();
    if (!chat) return;
    editingIndex = index;
    const data = chat.messages[index].versions[chat.messages[index].activeVersion];
    originalEditText = data.user;
    input.value = data.user;
    input.classList.add('edit-mode');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
  }
  function cancelEditing() {
    editingIndex = -1;
    originalEditText = '';
    input.value = '';
    input.classList.remove('edit-mode');
    input.placeholder = 'Спроси что-нибудь...';
    input.style.height = '46px';
  }

  function buildMessages(chat, question) {
    let messages = [];
    if (memoryFacts.length > 0) {
      messages.push({ role: 'system', content: 'Факты о пользователе:\n- ' + memoryFacts.join('\n- ') });
    }
    let cmdPrompt = '';
    if (activeCommands.truth) cmdPrompt += ' Отвечай максимально прямо и жестко.';
    if (activeCommands.human) cmdPrompt += ' Общайся как обычный человек, используй сленг.';
    
    const selectedLang = langSelect.value;
    let langName = 'русском';
    const langObj = LANGUAGES.find(l => l.code === selectedLang);
    if (langObj) langName = langObj.name;
    
    const basePrompt = `Ты Aifute - дружелюбный ассистент. Отвечай на языке: ${langName}.`;
    messages.push({ role: 'system', content: basePrompt + cmdPrompt });

    chat.messages.forEach(m => {
      const v = m.versions[m.activeVersion];
      if (v.user && v.ai) {
        messages.push({ role: 'user', content: v.user });
        messages.push({ role: 'assistant', content: v.ai });
      }
    });

    let q = question;
    if (searchMode) q += '\n\nИщи актуальную информацию в интернете.';
    messages.push({ role: 'user', content: q });
    return messages;
  }

  // === PUTER (2.5 / 5.6) ===
  async function askPuter(question, onChunk, externalSignal) {
    if (typeof puter === 'undefined' || !puter.ai) throw new Error('Puter.js не загружен');
    const chat = getActiveChat();
    const messages = buildMessages(chat, question);
    const options = { model: modelSelect.value, stream: true, max_tokens: parseInt(tokenLimitSelect.value) };
    if (searchMode) options.tools = [{ type: 'web_search' }];

    let fullText = '';
    let reasoningText = '';
    let sources = [];

    const response = await puter.ai.chat(messages, options);
    for await (const part of response) {
      if (externalSignal?.aborted) throw new Error('Остановлено');
      if (part?.reasoning) reasoningText += part.reasoning;
      if (part?.text) { fullText += part.text; if (onChunk) onChunk(part.text, fullText); }
      if (part?.sources) sources = part.sources;
    }
    if (!fullText.trim()) throw new Error('Пустой ответ');
    return { answer: fullText, reasoning: reasoningText, sources };
  }

  // === GEMINI 3.1 (ОРИГИНАЛЬНЫЙ) ===
  async function askGeminiOriginal(question, onChunk, externalSignal) {
    const chat = getActiveChat();
    const messages = buildMessages(chat, question);
    
    // Формат для оригинального Gemini
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(GEMINI_ORIGINAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_ORIGINAL_KEY },
      body: JSON.stringify({
        contents: contents,
        generationConfig: { maxOutputTokens: parseInt(tokenLimitSelect.value) }
      }),
      signal: externalSignal
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error('HTTP ' + response.status + ': ' + err.slice(0, 200));
    }

    const data = await response.json();
    const partsArr = data?.candidates?.[0]?.content?.parts;
    let answer = '';
    if (Array.isArray(partsArr)) {
      for (const p of partsArr) {
        if (typeof p?.text === 'string' && p.text.length > 0) answer += p.text;
      }
    }
    
    if (!answer.trim()) throw new Error('Пустой ответ от Gemini 3.1');
    
    // Имитация стриминга для оригинала
    if (onChunk) onChunk(answer, answer);
    return { answer: answer, reasoning: '', sources: [] };
  }

  function setSendingState(isSending) { sendBtn.classList.toggle('stopping', isSending); }

  async function sendMessage(text) {
    const trimmed = (text || '').trim();
    if (!trimmed || currentAbort) return;

    if (processCommand(trimmed)) {
      input.value = '';
      input.style.height = '46px';
      return;
    }

    if (activeCommands.stop && /хуй|пизд|бля|еба|сук|гондон|долбо/i.test(trimmed)) {
      showToast('Стоп-слово');
      input.value = '';
      input.style.height = '46px';
      return;
    }

    let chat = getActiveChat() || createNewChat();
    if (!chat) return;

    if (editingIndex !== -1) {
      if (trimmed === originalEditText) {
        showToast('Ничего не изменилось');
        return;
      }
      const editIdx = editingIndex;
      const oldMsg = chat.messages[editIdx];
      oldMsg.versions.push({ user: trimmed, ai: '', reasoning: '', sources: [] });
      oldMsg.activeVersion = oldMsg.versions.length - 1;
      
      while (chat.messages.length > editIdx + 1) chat.messages.pop();
      
      cancelEditing();
      saveChats();
      renderActiveChat();
      editingIndex = editIdx;
    } else {
      chat.messages.push({ versions: [{ user: trimmed, ai: '', reasoning: '', sources: [] }], activeVersion: 0 });
      if (chat.messages.length === 1) chat.title = trimmed.slice(0, 30);
      renderUserMessage(chat.messages.length - 1);
      saveChats();
    }

    input.value = '';
    input.style.height = '46px';
    input.focus();

    const idx = chat.messages.length - 1;
    const aiWrap = document.createElement('div');
    aiWrap.className = 'ai-wrap';
    aiWrap.dataset.aiIndex = idx;
    const bubble = document.createElement('div');
    bubble.className = 'msg ai typing';
    bubble.textContent = searchMode ? 'Aifute ищет...' : 'Aifute думает...';
    aiWrap.appendChild(bubble);
    chatEl.appendChild(aiWrap);
    chatEl.scrollTop = chatEl.scrollHeight;

    setSendingState(true);
    currentAbort = new AbortController();
    let firstChunk = false;
    let fullText = '';

    const onChunk = (chunk, full) => {
      if (!firstChunk) { firstChunk = true; bubble.classList.remove('typing'); bubble.textContent = ''; }
      fullText = full;
      bubble.textContent = full;
      const isAtBottom = chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight < 100;
      if (isAtBottom) chatEl.scrollTop = chatEl.scrollHeight;
    };

    try {
      let result;
      const model = modelSelect.value;
      
      if (model === 'gemini-3.1-original') {
         // Оригинальный Gemini
         result = await askGeminiOriginal(trimmed, onChunk, currentAbort.signal);
      } else {
         // Puter (2.5 и 5.6)
         result = await askPuter(trimmed, onChunk, currentAbort.signal);
      }
      
      const targetMsg = chat.messages[idx];
      const targetVer = targetMsg.versions[targetMsg.activeVersion];
      targetVer.ai = result.answer;
      targetVer.reasoning = result.reasoning;
      targetVer.sources = result.sources;
      
      if (memoryFacts.length === 0 || Math.random() > 0.8) {
         if (trimmed.toLowerCase().includes('меня зовут')) addMemory(trimmed);
      }

      saveChats();
      aiWrap.remove();
      renderActiveChat();
    } catch (e) {
      bubble.classList.remove('typing');
      bubble.classList.add('error');
      bubble.textContent = 'Ошибка: ' + e.message;
    } finally {
      currentAbort = null;
      setSendingState(false);
      input.focus();
    }
  }

  function ask() {
    if (editingIndex !== -1) {
       sendMessage(input.value);
    } else {
       if (!input.value.trim()) return;
       sendMessage(input.value);
    }
  }

  sendBtn.onclick = () => { if (currentAbort) currentAbort.abort(); else ask(); };
  
  // Enter теперь просто переносит строку (благодаря textarea).
  // Отправка — только по кнопке.

  loadSettings();
  loadMemory();
  loadChats();
  createNewChat();
  input.focus();
</script>
</body>
</html>
