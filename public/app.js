const socket = io();

// ---- screens ----
const setupScreen = document.getElementById('setup-screen');
const waitingScreen = document.getElementById('waiting-screen');
const chatScreen = document.getElementById('chat-screen');
const waitingText = document.getElementById('waiting-text');

function showScreen(el) {
  [setupScreen, waitingScreen, chatScreen].forEach((s) => s.classList.add('hidden'));
  el.classList.remove('hidden');
}

// ---- setup form ----
const nicknameInput = document.getElementById('nickname');
const languageInput = document.getElementById('language');
const interestsInput = document.getElementById('interests');
const startBtn = document.getElementById('start-btn');
const cancelBtn = document.getElementById('cancel-btn');

let myLanguage = 'en';

startBtn.addEventListener('click', () => {
  myLanguage = languageInput.value;
  socket.emit('find-match', {
    nickname: nicknameInput.value.trim() || 'Stranger',
    language: myLanguage,
    interests: interestsInput.value.trim(),
  });
  showScreen(waitingScreen);
});

cancelBtn.addEventListener('click', () => window.location.reload());

// ---- chat screen ----
const partnerName = document.getElementById('partner-name');
const partnerLang = document.getElementById('partner-lang');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const skipBtn = document.getElementById('skip-btn');
const reportBtn = document.getElementById('report-btn');

// For incoming messages, the server sends both the original text and (if the
// two users have different languages) a translated version. We show the
// translated text as the primary line -- since that's what the reader can
// actually understand -- with the original as a small italic annotation.
function addMessage({ text, who, translated }) {
  const div = document.createElement('div');
  div.className = `msg ${who}`;

  const hasTranslation = translated && translated.ok;
  const primary = who === 'them' && hasTranslation ? translated.text : text;
  div.textContent = primary;

  if (hasTranslation) {
    const t = document.createElement('span');
    t.className = 'translated';
    t.textContent = `original: ${text}`;
    div.appendChild(t);
  }
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.className = 'msg system';
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('chat-message', { text });
  addMessage({ text, who: 'me' });
  messageInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

skipBtn.addEventListener('click', () => {
  messagesEl.innerHTML = '';
  socket.emit('skip');
  showScreen(waitingScreen);
});

reportBtn.addEventListener('click', () => socket.emit('report'));

// ---- socket events ----
socket.on('waiting', () => showScreen(waitingScreen));

socket.on('matched', ({ partner }) => {
  // Show a brief "matched!" moment on the waiting screen before jumping into
  // the chat, instead of instantly swapping screens.
  showScreen(waitingScreen);
  waitingText.textContent = `Matched with ${partner.nickname}! Starting chat…`;

  setTimeout(() => {
    messagesEl.innerHTML = '';
    partnerName.textContent = partner.nickname;
    partnerLang.textContent = partner.language.toUpperCase();
    showScreen(chatScreen);
    addSystemMessage(`You're now chatting with ${partner.nickname}. Say hi!`);

    // reset the waiting text back to its default for next time
    waitingText.textContent = 'Looking for someone to match you with…';
  }, 1500);
});

// The server broadcasts to the whole room, including the sender. To avoid
// double-rendering the sender's own bubble (already added locally in
// sendMessage()), we tag outgoing messages with the sender's socket id and
// only render incoming messages from the *other* participant.
socket.on('chat-message', (payload) => {
  if (payload.fromId === socket.id) return; // this is our own message, already shown
  addMessage({ text: payload.text, who: 'them', translated: payload.translated });
});

socket.on('partner-left', () => {
  addSystemMessage('Your partner has left the chat. Click "Next stranger" to find someone new.');
});

socket.on('moderation-warning', ({ strikeCount, max }) => {
  addSystemMessage(`⚠️ Message flagged for language (${strikeCount}/${max}).`);
});

socket.on('kicked', ({ reason }) => {
  alert(`You were disconnected: ${reason}`);
  window.location.reload();
});

socket.on('report-received', () => addSystemMessage('Report submitted. Thank you.'));
