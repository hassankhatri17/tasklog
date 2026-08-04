// signupPage.js
import { authApi } from './authApi.js';
import { setSession, isLoggedIn } from './authStore.js';
import { validateName, validateEmail, validateSignupPassword, validateConfirmPassword } from './validate.js';

// If already logged in, no reason to see the signup page again.
if (isLoggedIn()) {
  window.location.href = 'index.html';
}

const form = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');

function setFieldError(inputEl, errorEl, message) {
  errorEl.textContent = message || '';
  inputEl.classList.toggle('invalid', Boolean(message));
}

function validateAll() {
  const nameErr = validateName(nameInput.value);
  const emailErr = validateEmail(emailInput.value);
  const passErr = validateSignupPassword(passwordInput.value);
  const confirmErr = passErr ? null : validateConfirmPassword(passwordInput.value, confirmInput.value);

  setFieldError(nameInput, document.getElementById('name-error'), nameErr);
  setFieldError(emailInput, document.getElementById('email-error'), emailErr);
  setFieldError(passwordInput, document.getElementById('password-error'), passErr);
  setFieldError(confirmInput, document.getElementById('confirm-error'), confirmErr);

  return !nameErr && !emailErr && !passErr && !confirmErr;
}

[nameInput, emailInput, passwordInput, confirmInput].forEach(input => {
  input.addEventListener('blur', validateAll);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  if (!validateAll()) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Creating account…';

  try {
    const result = await authApi.signup({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
    });
    setSession(result.token, result.user);
    window.location.href = 'index.html';
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
    formError.textContent = err.message === 'NETWORK'
      ? "Couldn't reach the server. Check your connection and try again."
      : err.message;
    formError.hidden = false;
  }
});
