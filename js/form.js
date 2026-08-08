/* ==========================================================
   Contact form hardening — progressive enhancement only.

   Week 9's break-testing found that Netlify's form endpoint
   returns an intermittent 404: roughly one submission in five,
   at three-second spacing, with no deploy running and well
   under any rate limit. A real person hitting that sees an
   error page and almost certainly never tries again.

   So this intercepts the submit, posts with fetch, and retries
   a failure up to three times before giving up. It is strictly
   an enhancement: with JavaScript disabled the form still does
   a native browser POST exactly as before, because the native
   path is what makes the feature work without me.
   ========================================================== */
(function () {
  const form = document.querySelector('form.contact-form');
  if (!form || !window.fetch) return; // no JS fetch -> native POST still works

  const button = form.querySelector('button[type="submit"]');
  const label = button && button.querySelector('span');
  const original = label ? label.textContent : '';
  const RETRIES = 3;

  const setLabel = (t) => { if (label) label.textContent = t; };

  function showError(message) {
    let box = form.querySelector('.cf-error');
    if (!box) {
      box = document.createElement('p');
      box.className = 'cf-error';
      box.setAttribute('role', 'alert');
      form.insertBefore(box, button);
    }
    box.textContent = message;
  }

  async function post(body, attempt = 1) {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (res.ok) return true;

    // The 404 is transient and undocumented, so retry rather than surface it.
    if (attempt < RETRIES) {
      setLabel(`Retrying (${attempt}/${RETRIES - 1})…`);
      await new Promise((r) => setTimeout(r, 600 * attempt));
      return post(body, attempt + 1);
    }
    return false;
  }

  form.addEventListener('submit', async (e) => {
    // Let the browser do its own validation first; if it fails, do nothing
    // and let the native error bubbles appear.
    if (!form.checkValidity()) return;

    e.preventDefault();
    const body = new URLSearchParams(new FormData(form)).toString();

    button.disabled = true;          // also stops the impatient double-click
    setLabel('Sending…');

    let ok = false;
    try {
      ok = await post(body);
    } catch {
      ok = false;
    }

    if (ok) {
      window.location.href = '/thanks.html';
      return;
    }

    button.disabled = false;
    setLabel(original);
    showError(
      'That did not send — the form service refused it. Please email me directly at ' +
        'farhanmuhammadbashir@gmail.com, or try once more.'
    );
  });
})();
