const $ = (id) => document.getElementById(id);

const loginView = $('loginView');
const sessionView = $('sessionView');
const form = $('loginForm');
const formError = $('formError');
const submitBtn = $('submitBtn');
const tokenField = $('tokenField');
const meOutput = $('meOutput');

const placeholders = {
  partHead: 'Algoritmo usado na assinatura',
  partBody: 'Quem é você e quando o token expira',
  partSign: 'Prova de que o servidor emitiu este token',
};

let timer = null;

function decodePart(part) {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function showParts(token) {
  const [head, body, sign] = token.split('.');
  $('partHead').textContent = JSON.stringify(decodePart(head));
  $('partBody').textContent = JSON.stringify(decodePart(body));
  $('partSign').textContent = sign;
  document.querySelectorAll('.part').forEach((el) => el.classList.add('filled'));
}

function resetParts() {
  Object.entries(placeholders).forEach(([id, text]) => ($(id).textContent = text));
  document.querySelectorAll('.part').forEach((el) => el.classList.remove('filled'));
}

function startCountdown(token) {
  const { exp } = decodePart(token.split('.')[1]);
  clearInterval(timer);

  const tick = () => {
    const left = exp - Math.floor(Date.now() / 1000);
    if (left <= 0) {
      clearInterval(timer);
      $('countdown').textContent = 'expirado';
      return;
    }
    const m = String(Math.floor(left / 60)).padStart(2, '0');
    const s = String(left % 60).padStart(2, '0');
    $('countdown').textContent = `${m}:${s}`;
  };
  tick();
  timer = setInterval(tick, 1000);
}

function showSession(token) {
  tokenField.value = token;
  showParts(token);
  startCountdown(token);
  meOutput.hidden = true;
  loginView.hidden = true;
  sessionView.hidden = false;
}

function showLogin() {
  clearInterval(timer);
  sessionStorage.removeItem('access_token');
  resetParts();
  $('password').value = '';
  sessionView.hidden = true;
  loginView.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Entrando...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: $('email').value, password: $('password').value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    sessionStorage.setItem('access_token', data.access_token);
    showSession(data.access_token);
  } catch (err) {
    formError.textContent = err.message || 'Não foi possível conectar ao servidor.';
    formError.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Entrar';
  }
});

$('copyBtn').addEventListener('click', async (event) => {
  await navigator.clipboard.writeText(tokenField.value);
  event.target.textContent = 'Token copiado';
  setTimeout(() => (event.target.textContent = 'Copiar token'), 1500);
});

$('meBtn').addEventListener('click', async () => {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` },
  });
  const data = await res.json();
  meOutput.textContent = `${res.status}\n${JSON.stringify(data, null, 2)}`;
  meOutput.classList.toggle('fail', !res.ok);
  meOutput.hidden = false;
});

$('logoutBtn').addEventListener('click', showLogin);

// Restaura a sessão se o token salvo ainda for válido.
const saved = sessionStorage.getItem('access_token');
if (saved) {
  try {
    const { exp } = decodePart(saved.split('.')[1]);
    exp * 1000 > Date.now() ? showSession(saved) : showLogin();
  } catch {
    showLogin();
  }
}
