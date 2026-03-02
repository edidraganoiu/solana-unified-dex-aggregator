const escapeHtml = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

export const wrapJsonInHtml = (title: string, jsonData: unknown): string => {
  const jsonString = JSON.stringify(jsonData, null, 2) ?? 'null';
  const escapedJson = escapeHtml(jsonString);
  const jsSafePayload = JSON.stringify(jsonString).replaceAll('</script>', '<\\/script>');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #0b0f19;
        --panel: #111726;
        --line: #263148;
        --text: #e8eefb;
        --muted: #8ea2c4;
        --accent: #4f8bff;
        --success: #38d39f;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, system-ui, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at 8% 12%, rgba(79,139,255,.25), transparent 35%),
          radial-gradient(circle at 92% 88%, rgba(56,211,159,.15), transparent 33%),
          var(--bg);
      }
      .wrap {
        max-width: 1100px;
        margin: 0 auto;
        padding: 28px 16px 36px;
      }
      .back {
        display: inline-block;
        color: var(--muted);
        text-decoration: none;
        margin-bottom: 14px;
      }
      .back:hover { color: var(--text); }
      .card {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: linear-gradient(160deg, rgba(17,23,38,.95), rgba(12,18,30,.98));
        box-shadow: 0 14px 40px rgba(2,8,23,.45);
        overflow: hidden;
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--line);
      }
      h1 {
        margin: 0;
        font-family: 'Space Grotesk', Inter, sans-serif;
        font-size: 1.1rem;
        font-weight: 600;
      }
      .copy {
        border: 1px solid var(--line);
        background: rgba(79,139,255,.14);
        color: #cfe0ff;
        border-radius: 10px;
        padding: 8px 12px;
        font-size: .82rem;
        font-weight: 600;
        cursor: pointer;
      }
      .copy:hover { border-color: #4f8bff; }
      pre {
        margin: 0;
        padding: 16px;
        overflow: auto;
        font-size: .86rem;
        line-height: 1.5;
        color: #dce8ff;
        background: rgba(9,13,23,.75);
      }
      .toast {
        position: fixed;
        right: 16px;
        bottom: 16px;
        background: rgba(56,211,159,.16);
        border: 1px solid rgba(56,211,159,.5);
        color: #c5ffe7;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: .84rem;
        opacity: 0;
        transform: translateY(6px);
        transition: all .18s ease;
      }
      .toast.show {
        opacity: 1;
        transform: translateY(0);
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <a class="back" href="/">&larr; Back to Admin Panel</a>
      <section class="card">
        <header class="head">
          <h1>${escapeHtml(title)}</h1>
          <button class="copy" id="copyBtn" type="button">Copy JSON</button>
        </header>
        <pre id="jsonBlock">${escapedJson}</pre>
      </section>
    </main>
    <div class="toast" id="toast">Copied!</div>
    <script>
      (() => {
        const payload = ${jsSafePayload};
        const btn = document.getElementById('copyBtn');
        const toast = document.getElementById('toast');

        const showToast = () => {
          if (!toast) return;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 950);
        };

        btn?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(payload);
            showToast();
          } catch {
            const el = document.createElement('textarea');
            el.value = payload;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            showToast();
          }
        });
      })();
    </script>
  </body>
</html>`;
};
