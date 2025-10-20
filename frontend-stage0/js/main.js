// main.js — unobtrusive vanilla JS
// - updates time in ms
// - allows avatar change via URL or file upload (file becomes a blob URL)
// - keeps DOM queries light and guarded

(function () {
  // Elements
  const timeEl = document.querySelector('[data-testid="test-user-time"]');
  const avatarImg = document.querySelector('[data-testid="test-user-avatar"]');
  const avatarUrlInput = document.querySelector('[data-testid="test-avatar-url-input"]');
  const avatarFileInput = document.querySelector('[data-testid="test-avatar-file-input"]');

  // Safety: don't crash if anything missing
  if (!timeEl) return;

  // Update time to Date.now() — show ms and keep it fresh
  function renderTime() {
    // exact ms as a number — tests expect Date.now() or within a reasonable delta
    timeEl.textContent = `Current time (ms): ${Date.now()}`;
  }

  // render immediately and then update once per second
  renderTime();
  const timeInterval = setInterval(renderTime, 1000);

  // Avatar: set from URL input
  if (avatarUrlInput && avatarImg) {
    avatarUrlInput.addEventListener('change', (e) => {
      const val = e.target.value.trim();
      if (!val) return;
      // set to provided URL — assume tests will check src is a URL string
      avatarImg.src = val;
      // update alt to reflect change for accessibility
      avatarImg.alt = `Avatar provided by URL`;
    });

    // also support pressing Enter while focused (submit)
    avatarUrlInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.target.dispatchEvent(new Event('change'));
      }
    });
  }

  // Avatar: set from uploaded file (create object URL)
  if (avatarFileInput && avatarImg) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      // sanity: ensure it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      avatarImg.src = objectUrl;
      avatarImg.alt = `Avatar uploaded by user`;
      // revoke object URL after image loads to free memory
      avatarImg.onload = () => {
        try { URL.revokeObjectURL(objectUrl); } catch (err) { /* ignore */ }
      };
    });
  }

  // Clean up when document unloads (clear interval)
  window.addEventListener('beforeunload', () => {
    clearInterval(timeInterval);
  });
})();
