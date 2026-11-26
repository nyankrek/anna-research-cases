const form = document.querySelector('#unlock-form');
const status = document.querySelector('#unlock-status');
const input = document.querySelector('#case-password');

function decodeBase64(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}

async function unlock(password) {
  const response = await fetch('case.enc.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('The case could not be loaded. Please try again.');
  const payload = await response.json();
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: decodeBase64(payload.salt), iterations: payload.iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const cleartext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodeBase64(payload.iv) },
    key,
    decodeBase64(payload.ciphertext)
  );
  return new TextDecoder().decode(cleartext);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = 'Opening case…';
  try {
    const html = await unlock(input.value);
    document.querySelector('#case-content').innerHTML = html;
    document.querySelector('#case-content').hidden = false;
    document.querySelector('#unlock-screen').hidden = true;
    document.title = 'Customer feedback — Anna Krekova';
    input.value = '';
    window.scrollTo(0, 0);
  } catch (error) {
    status.textContent = error.name === 'OperationError' ? 'That password did not work. Please try again.' : error.message;
    input.select();
  } finally {
    button.disabled = false;
  }
});
