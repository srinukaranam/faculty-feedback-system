// Minimal shared script for the Faculty Feedback System
// Provides lightweight helpers and prevents missing-script 404s from templates.

document.addEventListener('DOMContentLoaded', function() {
  // Small accessibility helper: add focus-visible class when keyboard navigating
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('using-keyboard');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);

  // Safe global fetch wrapper that returns JSON or null on failure
  window.safeFetchJson = async function(url, opts) {
    try {
      const res = await fetch(url, opts);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('safeFetchJson error', err);
      return null;
    }
  }
});

// Export nothing; file just provides helpers and stops 404 logs.
