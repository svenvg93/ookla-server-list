const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ookla Server Directory</title>
  <style>
    :root {
      --bg: #0f1117;
      --surface: #1a1d2e;
      --surface-hover: #222540;
      --border: #2e3155;
      --text: #e2e8f0;
      --muted: #8892a4;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --green: #10b981;
      --red: #ef4444;
      --yellow: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    /* ── Header ── */
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 18px 32px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      width: 34px; height: 34px;
      background: var(--accent);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    header h1 { font-size: 1.1rem; font-weight: 700; }
    header p  { font-size: 0.8rem; color: var(--muted); margin-top: 1px; }

    /* ── Main ── */
    .main { max-width: 1440px; margin: 0 auto; padding: 32px; }

    /* ── Search bar ── */
    .search-bar { display: flex; gap: 8px; margin-bottom: 24px; }
    .search-bar input {
      flex: 1;
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 11px 16px; color: var(--text); font-size: 0.95rem; outline: none;
      transition: border-color 0.2s;
    }
    .search-bar input:focus { border-color: var(--accent); }
    .search-bar input::placeholder { color: var(--muted); }

    .btn {
      background: var(--accent); color: #fff; border: none; border-radius: 8px;
      padding: 11px 22px; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s; white-space: nowrap;
    }
    .btn:hover  { background: var(--accent-hover); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Toolbar ── */
    .toolbar {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 14px; flex-wrap: wrap;
    }
    .stats { flex: 1; font-size: 0.83rem; color: var(--muted); }
    .stats strong { color: var(--text); }

    .toolbar select,
    .toolbar input[type="text"] {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; padding: 7px 11px; color: var(--text);
      font-size: 0.83rem; outline: none;
    }
    .toolbar select:focus,
    .toolbar input[type="text"]:focus { border-color: var(--accent); }
    .toolbar input[type="text"]::placeholder { color: var(--muted); }

    .toolbar label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.83rem; color: var(--muted); cursor: pointer;
    }

    /* ── Table ── */
    .table-wrap {
      overflow-x: auto;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }

    thead { background: var(--surface); }
    th {
      padding: 11px 16px; text-align: left;
      font-weight: 600; color: var(--muted);
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;
      cursor: pointer; user-select: none; white-space: nowrap;
      border-bottom: 1px solid var(--border);
    }
    th:hover { color: var(--text); }
    th.sorted { color: var(--accent); }
    th .sort-icon { margin-left: 4px; opacity: 0.4; }
    th.sorted .sort-icon { opacity: 1; }

    td { padding: 10px 16px; border-bottom: 1px solid var(--border); }
    tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: var(--surface-hover); }

    /* ── Cell types ── */
    .cell-id   { color: var(--muted); font-size: 0.77rem; font-variant-numeric: tabular-nums; }
    .cell-dist { color: var(--muted); text-align: right; }
    .flag      { font-size: 1.15em; margin-right: 5px; }

    .host-cell { display: flex; align-items: center; gap: 8px; }
    .host-text {
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.78rem; color: var(--muted);
    }
    .copy-btn {
      background: none; border: 1px solid var(--border); border-radius: 4px;
      padding: 2px 7px; color: var(--muted); font-size: 0.7rem;
      cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0;
    }
    .copy-btn:hover            { border-color: var(--accent); color: var(--accent); }
    .copy-btn.copied           { border-color: var(--green);  color: var(--green); }

    .badge {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 4px;
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em;
    }
    .badge-green { background: rgba(16,185,129,.15); color: var(--green); }
    .badge-red   { background: rgba(239,68,68,.12);  color: var(--red);   }

    .dot-preferred {
      display: inline-block; width: 6px; height: 6px; border-radius: 50%;
      background: var(--yellow); margin-right: 5px; vertical-align: middle;
    }

    /* ── States ── */
    .state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 80px 32px; gap: 14px; color: var(--muted);
      font-size: 0.9rem;
    }
    .state-icon { font-size: 2.2rem; }
    .spinner {
      width: 30px; height: 30px;
      border: 3px solid var(--border); border-top-color: var(--accent);
      border-radius: 50%; animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>

<header>
  <div class="logo">⚡</div>
  <div>
    <h1>Ookla Server Directory</h1>
    <p>Browse Speedtest servers by ISP or operator</p>
  </div>
</header>

<main class="main">

  <div class="search-bar">
    <input id="api-search" type="text"
      placeholder="Enter ISP / operator name (e.g. Orange, Vodafone, Comcast)…" />
    <button class="btn" id="search-btn" onclick="fetchServers()">Search</button>
  </div>

  <div class="toolbar" id="toolbar" style="display:none">
    <div class="stats" id="stats"></div>
    <input type="text" id="filter" placeholder="Filter displayed results…" oninput="applyFilters()" />
    <select id="country-sel" onchange="applyFilters()">
      <option value="">All countries</option>
    </select>
    <label>
      <input type="checkbox" id="https-only" onchange="applyFilters()" />
      HTTPS only
    </label>
  </div>

  <div class="table-wrap" id="table-wrap">
    <div class="state">
      <div class="state-icon">🔍</div>
      <div>Search for an ISP or operator above to load servers</div>
    </div>
  </div>

</main>

<script>
  let allServers = [];
  let sortCol = null, sortDir = 1;

  const COLS = [
    { key: 'id',               label: 'ID' },
    { key: 'country',          label: 'Country' },
    { key: 'name',             label: 'City' },
    { key: 'sponsor',          label: 'Sponsor / ISP' },
    { key: 'host',             label: 'Host' },
    { key: 'distance',         label: 'Distance' },
    { key: 'https_functional', label: 'HTTPS' },
  ];

  function flag(cc) {
    if (!cc || cc.length !== 2) return '';
    return cc.toUpperCase().replace(/./g, c =>
      String.fromCodePoint(0x1F1E0 + c.charCodeAt(0) - 65)
    );
  }

  async function fetchServers() {
    const query = document.getElementById('api-search').value.trim();
    if (!query) return;

    const btn = document.getElementById('search-btn');
    btn.disabled = true;
    btn.textContent = 'Loading…';
    document.getElementById('toolbar').style.display = 'none';
    setState('loading');

    try {
      const res = await fetch('/api/servers?search=' + encodeURIComponent(query));
      const data = await res.json();
      if (!res.ok || data.error) {
        const detail = data.error + (data.preview ? ' — ' + data.preview : '');
        throw new Error(detail);
      }
      if (!Array.isArray(data)) throw new Error('Unexpected response format');
      allServers = data;
      buildCountryFilter();
      applyFilters();
      document.getElementById('toolbar').style.display = 'flex';
    } catch (e) {
      setState('error', e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Search';
    }
  }

  function buildCountryFilter() {
    const countries = [...new Set(allServers.map(s => s.country))].sort();
    const sel = document.getElementById('country-sel');
    sel.innerHTML = '<option value="">All countries</option>';
    countries.forEach(c => {
      const o = document.createElement('option');
      o.value = o.textContent = c;
      sel.appendChild(o);
    });
  }

  function applyFilters() {
    const text      = document.getElementById('filter').value.toLowerCase();
    const country   = document.getElementById('country-sel').value;
    const httpsOnly = document.getElementById('https-only').checked;

    let rows = allServers.filter(s => {
      if (country   && s.country !== country)   return false;
      if (httpsOnly && !s.https_functional)      return false;
      if (text && ![s.id, s.name, s.country, s.cc, s.sponsor, s.host]
                    .join(' ').toLowerCase().includes(text)) return false;
      return true;
    });

    if (sortCol) {
      rows = rows.slice().sort((a, b) => {
        let av = a[sortCol], bv = b[sortCol];
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
      });
    }

    renderTable(rows);
    document.getElementById('stats').innerHTML =
      'Showing <strong>' + rows.length + '</strong> of <strong>' + allServers.length + '</strong> servers';
  }

  function renderTable(rows) {
    if (!rows.length) { setState('empty'); return; }

    const thead = '<thead><tr>' + COLS.map(c => {
      const active = sortCol === c.key;
      const icon   = active ? (sortDir === 1 ? '↑' : '↓') : '↕';
      return '<th class="' + (active ? 'sorted' : '') + '" onclick="sortBy(\'' + c.key + '\')">'
           + c.label + '<span class="sort-icon">' + icon + '</span></th>';
    }).join('') + '</tr></thead>';

    const tbody = '<tbody>' + rows.map(s => {
      const hostEsc = s.host.replace(/'/g, "\\'");
      return '<tr>'
        + '<td class="cell-id">'  + s.id + '</td>'
        + '<td><span class="flag">' + flag(s.cc) + '</span>' + esc(s.country) + '</td>'
        + '<td>'
          + (s.preferred ? '<span class="dot-preferred" title="Preferred server"></span>' : '')
          + esc(s.name)
        + '</td>'
        + '<td>' + esc(s.sponsor) + '</td>'
        + '<td><div class="host-cell">'
          + '<span class="host-text">' + esc(s.host) + '</span>'
          + '<button class="copy-btn" onclick="copyHost(this,\'' + hostEsc + '\')">copy</button>'
        + '</div></td>'
        + '<td class="cell-dist">' + (s.distance != null ? s.distance.toLocaleString() + ' km' : '—') + '</td>'
        + '<td>' + (s.https_functional
            ? '<span class="badge badge-green">HTTPS</span>'
            : '<span class="badge badge-red">HTTP</span>')
        + '</td>'
        + '</tr>';
    }).join('') + '</tbody>';

    document.getElementById('table-wrap').innerHTML =
      '<table>' + thead + tbody + '</table>';
  }

  function sortBy(col) {
    sortDir = (sortCol === col) ? sortDir * -1 : 1;
    sortCol = col;
    applyFilters();
  }

  function copyHost(btn, host) {
    navigator.clipboard.writeText(host).then(() => {
      btn.textContent = 'copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1500);
    });
  }

  function setState(type, msg) {
    const icons = { loading: null, empty: '🤷', error: '⚠️' };
    document.getElementById('table-wrap').innerHTML = type === 'loading'
      ? '<div class="state"><div class="spinner"></div><div>Fetching servers…</div></div>'
      : '<div class="state"><div class="state-icon">' + icons[type] + '</div><div>'
          + (msg ? 'Error: ' + esc(msg) : 'No servers match your filters') + '</div></div>';
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  document.getElementById('api-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchServers();
  });
</script>
</body>
</html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/servers') {
      const search = url.searchParams.get('search') ?? '';
      const ooklaUrl =
        'https://www.speedtest.net/api/js/servers?engine=js&https_functional=true&limit=1000'
        + '&search=' + encodeURIComponent(search);

      try {
        const resp = await fetch(ooklaUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.speedtest.net/',
            'Origin': 'https://www.speedtest.net',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        const body = await resp.text();

        // Validate it looks like JSON before returning
        const trimmed = body.trim();
        if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
          return new Response(
            JSON.stringify({ error: 'Ookla returned non-JSON (status ' + resp.status + ')', preview: trimmed.slice(0, 200) }),
            { status: 502, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(body, {
          status: resp.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
