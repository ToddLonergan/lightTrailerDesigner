/* main.js
 *
 * Landing page for buildyourowntrailer.com.au
 *
 * Minimal HTML expectation:
 *   <div id="app"></div>
 *   <script src="main.js" defer></script>
 *
 * Optional (recommended):
 *   Create a separate designer page (e.g. /designer.html or /designer/) that loads p5.js + lightTrailerDesigner.js.
 *   This script will try to find that page and redirect. If not found, it falls back to loading lightTrailerDesigner.js
 *   in a modal.
 */

(() => {
  "use strict";

  // --- Config you might want to edit later ---
  const BRAND_NAME = "Build Your Own Trailer";
  const DESIGNER_SCRIPT = "./lightTrailerDesigner.js"; // your existing script
  const DESIGNER_PAGES_TO_TRY = [
    "./designer/",                // folder-style
    "./designer.html",
    "./lightTrailerDesigner/",    // if you already have a folder
    "./lightTrailerDesigner.html"
  ];

  // If your designer needs p5.js and you don't already load it on the designer page,
  // the fallback modal loader will try to load p5 automatically.
  const P5_CDN = "https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js";

  // --- App bootstrap ---
  const root = ensureAppRoot();
  
  const state = {
    route: normaliseRoute(location.hash),
    loggedIn: sessionStorage.getItem("byot_logged_in") === "1",
    modalOpen: false
  };

  const ui = {
    header: null,
    main: null,
    footer: null,
    loginBtn: null,
    navButtons: new Map()
  };

  renderApp();
  window.addEventListener("hashchange", () => {
    state.route = normaliseRoute(location.hash);
    renderMain();
    highlightNav();
  });

  // --- Rendering ---
  function renderApp() {
    root.innerHTML = "";
    ui.header = renderHeader();
    ui.main = document.createElement("main");
    ui.main.className = "byot-main";
    ui.footer = renderFooter();

    root.append(ui.header, ui.main, ui.footer);

    renderMain();
    highlightNav();
  }

  function renderHeader() {
    const header = document.createElement("header");
    header.className = "byot-header";

    const left = document.createElement("div");
    left.className = "byot-header-left";

    // "Login" button (acts like "Launch Designer" + a simple session toggle)
    const loginBtn = document.createElement("button");
    loginBtn.className = "byot-btn byot-btn-primary byot-login";
    loginBtn.type = "button";
    loginBtn.addEventListener("click", async () => {
      if (!state.loggedIn) {
        state.loggedIn = true;
        sessionStorage.setItem("byot_logged_in", "1");
      }
      updateLoginButton();
      await openDesigner();
    });
    ui.loginBtn = loginBtn;

    // Brand
    const brand = document.createElement("a");
    brand.className = "byot-brand";
    brand.href = "#configure";
    brand.innerHTML = `
      <span class="byot-brand-mark" aria-hidden="true">${svgLogo()}</span>
      <span class="byot-brand-text">
        <span class="byot-brand-title">${BRAND_NAME}</span>
        <span class="byot-brand-subtitle">Design • Compliance • Advice</span>
      </span>
    `;

    left.append(loginBtn, brand);

    // Under Construction Notice -  remove when website is finished
    const center = document.createElement("div");
    center.className = "byot-header-center";
    
    const underConstruction = document.createElement("div");
    underConstruction.className = "byot-underconstruction";
    underConstruction.textContent = "🚧 Website still under construction — check back soon. Thanks for visiting! 🚧";

    center.append(underConstruction);

    const right = document.createElement("nav");
    right.className = "byot-nav";
    right.setAttribute("aria-label", "Primary navigation");

    const navItems = [
      { key: "configure", label: "Configure your trailer design" },
      { key: "compliance", label: "Compliance help" },
      { key: "advice", label: "Advice" },
      { key: "contact", label: "Contact Us" }
    ];

    navItems.forEach(item => {
      const btn = document.createElement("a");
      btn.className = "byot-tab";
      btn.href = `#${item.key}`;
      btn.textContent = item.label;
      btn.setAttribute("role", "button");
      ui.navButtons.set(item.key, btn);
      right.append(btn);
    });

    header.append(left, center, right);

    updateLoginButton();
    return header;
  }

  function renderFooter() {
    const footer = document.createElement("footer");
    footer.className = "byot-footer";

    const year = new Date().getFullYear();
    footer.innerHTML = `
      <div class="byot-footer-inner">
        <div class="byot-footer-left">
          <div class="byot-footer-title">${BRAND_NAME}</div>
          <div class="byot-footer-note">
            Built for Australian conditions. <span class="byot-muted">Information on this site is general guidance only.</span>
          </div>
        </div>
        <div class="byot-footer-right">
          <a class="byot-link" href="#contact">Contact</a>
          <span class="byot-dot" aria-hidden="true">•</span>
          <a class="byot-link" href="#advice">Advice</a>
          <span class="byot-dot" aria-hidden="true">•</span>
          <span class="byot-muted">© ${year}</span>
        </div>
      </div>
    `;
    return footer;
  }

  function renderMain() {
    ui.main.innerHTML = "";

    const hero = renderHero();
    ui.main.append(hero);

    switch (state.route) {
      case "configure":
        ui.main.append(renderConfigure());
        break;
      case "compliance":
        ui.main.append(renderCompliance());
        break;
      case "advice":
        ui.main.append(renderAdvice());
        break;
      case "contact":
        ui.main.append(renderContact());
        break;
      default:
        ui.main.append(renderConfigure());
        break;
    }
  }

  function renderHero() {
    const section = document.createElement("section");
    section.className = "byot-hero";

    const card = document.createElement("div");
    card.className = "byot-hero-card";

    const title = document.createElement("h1");
    title.className = "byot-h1";
    title.textContent = "Design smarter. Build safer. Get it compliant.";

    const p = document.createElement("p");
    p.className = "byot-lead";
    p.textContent =
      "A practical toolkit for Australian light trailers — from initial layout and drawbar sizing to compliance checks and build tips.";

    const actions = document.createElement("div");
    actions.className = "byot-actions";

    const cta1 = document.createElement("button");
    cta1.className = "byot-btn byot-btn-primary";
    cta1.type = "button";
    cta1.textContent = "Launch Trailer Designer";
    cta1.addEventListener("click", openDesigner);

    const cta2 = document.createElement("a");
    cta2.className = "byot-btn byot-btn-ghost";
    cta2.href = "#compliance";
    cta2.textContent = "Check an existing trailer";

    actions.append(cta1, cta2);

    const badges = document.createElement("div");
    badges.className = "byot-badges";
    badges.innerHTML = `
      <span class="byot-badge">Light trailers</span>
      <span class="byot-badge">Plan view tooling</span>
      <span class="byot-badge">Compliance guidance</span>
      <span class="byot-badge">Build advice</span>
    `;

    const art = document.createElement("div");
    art.className = "byot-hero-art";
    art.style.backgroundImage = `url("${heroSvgDataUri()}")`;

    card.append(title, p, actions, badges);
    section.append(card, art);
    return section;
  }

  function renderConfigure() {
    const section = document.createElement("section");
    section.className = "byot-section";

    section.innerHTML = `
      <div class="byot-grid">
        <div class="byot-card">
          <h2 class="byot-h2">Configure your trailer design</h2>
          <p class="byot-text">
            Start from a clean plan view and iterate fast. Set dimensions, see proportions,
            and refine your concept before you cut steel.
          </p>

          <ul class="byot-list">
            <li>Quick layout & dimensioning</li>
            <li>Drawbar length + body sizing</li>
            <li>Adjust inputs and visualise instantly</li>
          </ul>

          <div class="byot-actions">
            <button class="byot-btn byot-btn-primary" id="byot-open-designer" type="button">Open Trailer Designer</button>
            <a class="byot-btn byot-btn-ghost" href="#advice">Read build advice</a>
          </div>

          <p class="byot-muted byot-small">
            Tip: If Chrome ever shows weird security messages, try Incognito or fully restart Chrome (background processes can cache old states).
          </p>
        </div>

        <div class="byot-card byot-card-alt">
          <h3 class="byot-h3">What you’ll get</h3>
          <div class="byot-feature">
            <div class="byot-feature-icon">🧰</div>
            <div>
              <div class="byot-feature-title">Practical tools</div>
              <div class="byot-muted">Built for real workshop decisions, not just pretty renders.</div>
            </div>
          </div>

          <div class="byot-feature">
            <div class="byot-feature-icon">📏</div>
            <div>
              <div class="byot-feature-title">Clear dimensions</div>
              <div class="byot-muted">Keep the design readable and repeatable.</div>
            </div>
          </div>

          <div class="byot-feature">
            <div class="byot-feature-icon">✅</div>
            <div>
              <div class="byot-feature-title">Compliance mindset</div>
              <div class="byot-muted">Guidance to help avoid the classic mistakes early.</div>
            </div>
          </div>

          <div class="byot-divider"></div>

          <p class="byot-muted byot-small">
            Want a nicer front page later? Easy — swap this content for cards, blog posts, or a gallery. The structure is the hard part.
          </p>
        </div>
      </div>
    `;

    section.querySelector("#byot-open-designer")?.addEventListener("click", openDesigner);
    return section;
  }

  function renderCompliance() {
    const section = document.createElement("section");
    section.className = "byot-section";

    section.innerHTML = `
      <div class="byot-grid">
        <div class="byot-card">
          <h2 class="byot-h2">Compliance help for pre-existing trailers</h2>
          <p class="byot-text">
            Bought a trailer, inherited one, or rebuilding an older frame? This section helps you sanity-check the basics.
          </p>

          <div class="byot-callout">
            <div class="byot-callout-title">General guidance only</div>
            <div class="byot-muted">
              Compliance requirements can vary. This site provides general pointers — always confirm against the relevant Australian rules and state requirements.
            </div>
          </div>

          <h3 class="byot-h3">Quick checks</h3>
          <ul class="byot-list">
            <li>ATM/GTW basics and common mistakes</li>
            <li>Coupling, safety chains, breakaway (where applicable)</li>
            <li>Lights, reflectors, and general roadworthy items</li>
          </ul>

          <div class="byot-actions">
            <a class="byot-btn byot-btn-primary" href="#contact">Ask a question</a>
            <a class="byot-btn byot-btn-ghost" href="#advice">Read advice</a>
          </div>
        </div>

        <div class="byot-card byot-card-alt">
          <h3 class="byot-h3">Bring these details (if you have them)</h3>
          <ul class="byot-list">
            <li>Trailer type (box, flatbed, camper, etc.)</li>
            <li>Approx dimensions + axle configuration</li>
            <li>Photos of coupling, drawbar, suspension</li>
            <li>Any plate/stamp info, receipts, history</li>
          </ul>

          <div class="byot-divider"></div>

          <p class="byot-muted byot-small">
            If you plan to use this site publicly, consider adding a dedicated compliance page with links to official sources.
          </p>
        </div>
      </div>
    `;
    return section;
  }

  function renderAdvice() {
    const section = document.createElement("section");
    section.className = "byot-section";

    section.innerHTML = `
      <div class="byot-card">
        <h2 class="byot-h2">Advice</h2>
        <p class="byot-text">
          Build tips, “gotchas”, and practical notes. (You can replace these placeholders with real articles anytime.)
        </p>

        <div class="byot-tiles">
          ${tile("Drawbar geometry 101", "How to think about length, angle, and attachment points without overcomplicating it.")}
          ${tile("Weight distribution", "Simple ways to avoid nose-heavy or tail-heavy builds.")}
          ${tile("Wiring + lighting", "Common faults, clean routing, and what to test before you tow.")}
          ${tile("Materials + corrosion", "Paint, galvanising, and what actually survives in the real world.")}
        </div>
      </div>
    `;
    return section;
  }

  function renderContact() {
    const section = document.createElement("section");
    section.className = "byot-section";

    const email = "hello@buildyourowntrailer.com.au"; // change later if you want

    section.innerHTML = `
      <div class="byot-grid">
        <div class="byot-card">
          <h2 class="byot-h2">Contact Us</h2>
          <p class="byot-text">Send a message and I’ll get back to you when I can.</p>

          <form class="byot-form" id="byot-contact-form">
            <label class="byot-label">
              Your name
              <input class="byot-input" name="name" autocomplete="name" required />
            </label>

            <label class="byot-label">
              Your email
              <input class="byot-input" type="email" name="email" autocomplete="email" required />
            </label>

            <label class="byot-label">
              Message
              <textarea class="byot-textarea" name="message" rows="6" required placeholder="Tell me about your trailer, what you’re building, and what you need help with."></textarea>
            </label>

            <div class="byot-actions">
              <button class="byot-btn byot-btn-primary" type="submit">Send</button>
              <button class="byot-btn byot-btn-ghost" id="byot-copy-email" type="button">Copy email</button>
            </div>

            <p class="byot-muted byot-small">
              This form uses your email client (mailto) — no data is stored on the website.
            </p>
          </form>
        </div>

        <div class="byot-card byot-card-alt">
          <h3 class="byot-h3">Direct</h3>
          <p class="byot-text">
            Email: <a class="byot-link" href="mailto:${email}">${email}</a>
          </p>

          <div class="byot-divider"></div>

          <h3 class="byot-h3">What to include</h3>
          <ul class="byot-list">
            <li>Trailer type + intended use</li>
            <li>ATM (target) and axle count</li>
            <li>Any photos or sketches</li>
          </ul>
        </div>
      </div>
    `;

    const form = section.querySelector("#byot-contact-form");
    const copyBtn = section.querySelector("#byot-copy-email");

    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
        toast("Email copied ✅");
      } catch {
        toast("Couldn’t copy (browser blocked clipboard).");
      }
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "");
      const from = String(fd.get("email") || "");
      const msg = String(fd.get("message") || "");

      const subject = encodeURIComponent(`[BYOT] Message from ${name}`);
      const body = encodeURIComponent(`From: ${name} <${from}>\n\n${msg}\n`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });

    return section;
  }

  function tile(title, desc) {
    return `
      <div class="byot-tile">
        <div class="byot-tile-title">${escapeHtml(title)}</div>
        <div class="byot-muted">${escapeHtml(desc)}</div>
      </div>
    `;
  }

  // --- Navigation UI ---
  function highlightNav() {
    for (const [key, el] of ui.navButtons.entries()) {
      el.classList.toggle("is-active", key === state.route);
    }
  }

  function updateLoginButton() {
    if (!ui.loginBtn) return;
    ui.loginBtn.textContent = state.loggedIn ? "Launch Designer" : "Log in";
    ui.loginBtn.title = state.loggedIn ? "Open the trailer designer" : "Log in (simple session) then open designer";
  }

  // --- Designer launching ---
  function openDesigner() {
  window.location.href = "./designer.html";
  };

    // --- Helpers ---
  function ensureAppRoot() {
    let el = document.getElementById("app");
    if (!el) {
      el = document.createElement("div");
      el.id = "app";
      document.body.prepend(el);
    }
    el.classList.add("byot-app");
    return el;
  }

  function normaliseRoute(hash) {
    const raw = (hash || "").replace("#", "").trim().toLowerCase();
    const allowed = new Set(["configure", "compliance", "advice", "contact"]);
    return allowed.has(raw) ? raw : "configure";
  }

  function stripQueryAndHash(pathname) {
    return String(pathname || "").split("?")[0].split("#")[0];
  }

  function toast(message) {
    const t = document.createElement("div");
    t.className = "byot-toast";
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("is-show"), 10);
    setTimeout(() => {
      t.classList.remove("is-show");
      setTimeout(() => t.remove(), 250);
    }, 2200);
  }

  function heroSvgDataUri() {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.20"/>
            <stop offset="1" stop-color="#a78bfa" stop-opacity="0.18"/>
          </linearGradient>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18"/>
          </filter>
        </defs>
        <rect width="1200" height="800" fill="url(#g)"/>
        <circle cx="220" cy="200" r="120" fill="#22c55e" opacity="0.14" filter="url(#blur)"/>
        <circle cx="920" cy="520" r="180" fill="#f97316" opacity="0.10" filter="url(#blur)"/>

        <!-- Simple trailer silhouette -->
        <g transform="translate(170,330)">
          <path d="M0 150 L220 20 L780 20 Q830 20 860 50 L960 150"
                fill="none" stroke="#0b1220" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round"/>
          <rect x="300" y="80" width="460" height="190" rx="18"
                fill="#0b1220" fill-opacity="0.10" stroke="#0b1220" stroke-opacity="0.35" stroke-width="6"/>
          <circle cx="430" cy="280" r="42" fill="#0b1220" fill-opacity="0.14" stroke="#0b1220" stroke-opacity="0.35" stroke-width="6"/>
          <circle cx="650" cy="280" r="42" fill="#0b1220" fill-opacity="0.14" stroke="#0b1220" stroke-opacity="0.35" stroke-width="6"/>
          <path d="M220 20 L180 0" stroke="#0b1220" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
          <path d="M180 0 L160 20" stroke="#0b1220" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
        </g>

        <!-- Subtle grid -->
        <g opacity="0.18" stroke="#0b1220" stroke-width="1">
          ${Array.from({ length: 18 }).map((_, i) => {
            const y = 40 + i * 40;
            return `<line x1="0" y1="${y}" x2="1200" y2="${y}"/>`;
          }).join("")}
          ${Array.from({ length: 28 }).map((_, i) => {
            const x = 40 + i * 40;
            return `<line x1="${x}" y1="0" x2="${x}" y2="800"/>`;
          }).join("")}
        </g>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
  }

  function svgLogo() {
    // Small inline mark
    return `
      <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#22c55e"/>
            <stop offset="1" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        <rect x="3" y="6" width="20" height="14" rx="6" fill="url(#lg)" opacity="0.9"/>
        <circle cx="9" cy="20" r="3" fill="#0b1220" opacity="0.35"/>
        <circle cx="17" cy="20" r="3" fill="#0b1220" opacity="0.35"/>
      </svg>
    `;
  }

  function css() {
    return `
      :root{
        --bg0:#070a12;
        --bg1:#0b1020;
        --card:rgba(255,255,255,0.06);
        --card2:rgba(255,255,255,0.08);
        --stroke:rgba(255,255,255,0.12);
        --text:#eaf0ff;
        --muted:rgba(234,240,255,0.72);
        --accent:#22c55e;
        --accent2:#0ea5e9;
        --danger:#ef4444;
        --shadow: 0 18px 60px rgba(0,0,0,0.45);
      }

      *{ box-sizing:border-box; }
      html,body{ height:100%; }
      body{
        margin:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        color:var(--text);
        background: radial-gradient(1200px 700px at 20% 10%, rgba(14,165,233,0.18), transparent 55%),
                    radial-gradient(900px 600px at 80% 20%, rgba(167,139,250,0.16), transparent 55%),
                    linear-gradient(180deg, var(--bg0), var(--bg1));
      }

      .byot-app{ min-height:100vh; display:flex; flex-direction:column; }

      .byot-header{
        position:sticky; top:0; z-index:30;
        display:flex; align-items:center; justify-content:space-between;
        gap:16px;
        padding:14px 18px;
        background: rgba(7,10,18,0.65);
        backdrop-filter: blur(12px);
        border-bottom:1px solid rgba(255,255,255,0.08);
      }

      .byot-header-left{ display:flex; align-items:center; gap:14px; min-width: 320px; }
      .byot-brand{
        display:flex; align-items:center; gap:10px;
        text-decoration:none; color:var(--text);
      }
      .byot-brand-title{ font-weight:800; letter-spacing:0.2px; }
      .byot-brand-subtitle{ display:block; font-size:12px; color:var(--muted); margin-top:2px; }
      .byot-brand-mark{ display:inline-flex; }

      .byot-nav{
        display:flex; gap:10px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      .byot-tab{
        text-decoration:none;
        color:var(--muted);
        border:1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        padding:10px 12px;
        border-radius: 12px;
        font-size: 13px;
        transition: transform .12s ease, border-color .12s ease, background .12s ease;
        white-space:nowrap;
      }
      .byot-tab:hover{
        transform: translateY(-1px);
        border-color: rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.06);
        color: var(--text);
      }
      .byot-tab.is-active{
        border-color: rgba(34,197,94,0.55);
        background: rgba(34,197,94,0.10);
        color: var(--text);
      }

      .byot-main{ width:min(1100px, 92vw); margin: 26px auto 40px; flex:1; }

      .byot-hero{
        display:grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap:18px;
        align-items:stretch;
        margin-bottom: 18px;
      }
      .byot-hero-card{
        border:1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05);
        border-radius: 22px;
        padding: 22px;
        box-shadow: var(--shadow);
      }
      .byot-hero-art{
        border:1px solid rgba(255,255,255,0.12);
        border-radius: 22px;
        background-size: cover;
        background-position: center;
        box-shadow: var(--shadow);
        min-height: 260px;
      }

      .byot-h1{ margin:0 0 10px; font-size: 34px; line-height:1.12; }
      .byot-h2{ margin:0 0 10px; font-size: 22px; }
      .byot-h3{ margin:0 0 10px; font-size: 16px; }
      .byot-lead{ margin:0 0 16px; color:var(--muted); font-size: 15px; line-height:1.55; }
      .byot-text{ color:var(--muted); line-height:1.65; margin:0 0 14px; }
      .byot-muted{ color:var(--muted); }
      .byot-small{ font-size: 12.5px; line-height: 1.45; }

      .byot-actions{ display:flex; gap:10px; flex-wrap:wrap; margin: 12px 0 8px; }

      .byot-btn{
        border:1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: var(--text);
        padding: 10px 12px;
        border-radius: 14px;
        cursor:pointer;
        font-weight: 700;
        letter-spacing: 0.2px;
        transition: transform .12s ease, background .12s ease, border-color .12s ease;
      }
      .byot-btn:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.20);
      }
      .byot-btn-primary{
        border-color: rgba(34,197,94,0.5);
        background: linear-gradient(135deg, rgba(34,197,94,0.22), rgba(14,165,233,0.16));
      }
      .byot-btn-primary:hover{
        border-color: rgba(34,197,94,0.75);
      }
      .byot-btn-ghost{
        background: transparent;
      }
      .byot-btn-sm{ padding: 8px 10px; border-radius: 12px; font-weight: 700; }

      .byot-login{
        min-width: 110px;
      }

      .byot-badges{ display:flex; flex-wrap:wrap; gap:8px; margin-top: 12px; }
      .byot-badge{
        font-size: 12px;
        color: rgba(234,240,255,0.82);
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        padding: 6px 10px;
        border-radius: 999px;
      }

      .byot-section{ margin-top: 14px; }
      .byot-grid{
        display:grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 16px;
      }
      .byot-card{
        border:1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05);
        border-radius: 22px;
        padding: 18px;
        box-shadow: var(--shadow);
      }
      .byot-card-alt{
        background: rgba(255,255,255,0.04);
      }

      .byot-list{ margin: 8px 0 14px 18px; color: var(--muted); line-height:1.6; }
      .byot-divider{ height:1px; background: rgba(255,255,255,0.10); margin: 14px 0; }

      .byot-feature{ display:flex; gap:10px; align-items:flex-start; padding: 10px 0; }
      .byot-feature-icon{ width: 34px; height: 34px; display:flex; align-items:center; justify-content:center; border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.04);
      }
      .byot-feature-title{ font-weight: 800; margin-bottom: 3px; }

      .byot-callout{
        border:1px solid rgba(255,255,255,0.12);
        background: rgba(239,68,68,0.08);
        border-radius: 18px;
        padding: 12px;
        margin: 10px 0 14px;
      }
      .byot-callout-title{ font-weight: 800; margin-bottom: 6px; }

      .byot-tiles{
        display:grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      .byot-tile{
        border:1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        border-radius: 18px;
        padding: 14px;
      }
      .byot-tile-title{ font-weight: 800; margin-bottom: 6px; }

      .byot-form{ display:flex; flex-direction:column; gap: 12px; }
      .byot-label{ display:flex; flex-direction:column; gap: 6px; font-weight: 700; font-size: 13px; }
      .byot-input, .byot-textarea{
        width:100%;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(0,0,0,0.25);
        color: var(--text);
        outline: none;
      }
      .byot-input:focus, .byot-textarea:focus{
        border-color: rgba(14,165,233,0.55);
        box-shadow: 0 0 0 3px rgba(14,165,233,0.14);
      }

      .byot-link{ color: rgba(168,231,255,0.95); text-decoration: none; }
      .byot-link:hover{ text-decoration: underline; }

      .byot-footer{
        border-top:1px solid rgba(255,255,255,0.08);
        padding: 18px 0 24px;
        background: rgba(0,0,0,0.18);
      }
      .byot-footer-inner{
        width:min(1100px, 92vw);
        margin: 0 auto;
        display:flex; align-items:center; justify-content:space-between; gap: 12px;
      }
      .byot-footer-title{ font-weight: 900; margin-bottom: 4px; }
      .byot-dot{ opacity:0.55; margin: 0 6px; }

      .byot-toast{
        position: fixed;
        left: 50%;
        bottom: 18px;
        transform: translate(-50%, 20px);
        opacity: 0;
        pointer-events: none;
        transition: transform .18s ease, opacity .18s ease;
        border:1px solid rgba(255,255,255,0.16);
        background: rgba(0,0,0,0.55);
        padding: 10px 12px;
        border-radius: 999px;
        box-shadow: var(--shadow);
        z-index: 80;
        font-weight: 800;
      }
      .byot-toast.is-show{
        transform: translate(-50%, 0);
        opacity: 1;
      }

      .byot-modal-overlay{
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.66);
        backdrop-filter: blur(8px);
        display:flex; align-items:center; justify-content:center;
        padding: 16px;
        z-index: 70;
      }
      .byot-modal{
        width: min(1100px, 96vw);
        height: min(760px, 90vh);
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(7,10,18,0.92);
        box-shadow: var(--shadow);
        overflow:hidden;
        display:flex; flex-direction:column;
      }
      .byot-modal-bar{
        display:flex; align-items:center; justify-content:space-between;
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255,255,255,0.10);
      }
      .byot-modal-title{ font-weight: 900; }
      .byot-modal-body{ padding: 14px; overflow:auto; }
      .byot-designer-mount{
        margin-top: 10px;
        border-radius: 18px;
        border: 1px dashed rgba(255,255,255,0.18);
        padding: 10px;
        min-height: 420px;
      }

      @media (max-width: 900px){
        .byot-hero{ grid-template-columns: 1fr; }
        .byot-grid{ grid-template-columns: 1fr; }
        .byot-header{ position: relative; }
        .byot-header-left{ min-width: 0; }
        .byot-nav{ justify-content:flex-start; }
        .byot-tiles{ grid-template-columns: 1fr; }
      }
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cssEscape(s) {
    // enough for our attribute selector usage
    return String(s).replaceAll('"', '\\"');
  }
})();
