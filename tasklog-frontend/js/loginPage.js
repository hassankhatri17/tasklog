// loginPage.js
import { authApi } from './authApi.js';
import { setSession, isLoggedIn } from './authStore.js';
import { validateEmail, validateLoginPassword } from './validate.js';

if (isLoggedIn()) {
  window.location.href = 'index.html';
}

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');

function setFieldError(inputEl, errorEl, message) {
  errorEl.textContent = message || '';
  inputEl.classList.toggle('invalid', Boolean(message));
}

function validateAll() {
  const emailErr = validateEmail(emailInput.value);
  const passErr = validateLoginPassword(passwordInput.value);

  setFieldError(emailInput, document.getElementById('email-error'), emailErr);
  setFieldError(passwordInput, document.getElementById('password-error'), passErr);

  return !emailErr && !passErr;
}

[emailInput, passwordInput].forEach(input => {
  input.addEventListener('blur', validateAll);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  if (!validateAll()) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Logging in…';

  try {
    const result = await authApi.login({
      email: emailInput.value.trim(),
      password: passwordInput.value,
    });
    setSession(result.token, result.user);
    window.location.href = 'index.html';
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';
    formError.textContent = err.message === 'NETWORK'
      ? "Couldn't reach the server. Check your connection and try again."
      : err.message;
    formError.hidden = false;
  }
});
