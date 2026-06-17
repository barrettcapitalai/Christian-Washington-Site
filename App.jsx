import { useState, useEffect } from "react";

/**
 * CHRISTIAN WASHINGTON — NIL site
 * RB · #23 · San Diego State Aztecs
 * ---------------------------------------------------------------------------
 * THEME: San Diego State colors — Scarlet #A6192E + Black + White.
 *        The whole identity flows from --accent (scarlet). Swap it per athlete.
 *
 * WHAT'S REAL vs. PLACEHOLDER:
 *  - FOOTBALL data (stats, bio, roster facts) = pulled from public sources, real.
 *  - PERSONAL/BRAND fields (major, GPA, interests, audience numbers, partners,
 *    shop products, contact) = marked "[ add ... ]" — fill with real info.
 *  - PHOTOS = placeholder slots. Drop in your own licensed photography.
 *
 * LIVE DATA: getLiveStats() / getLiveNews() return promises so you can swap in
 *  real fetch() calls (a sports-stats provider + a news/RSS feed) without
 *  touching the components.
 *
 * SHOP: products live in ATHLETE.shop — each item takes an affiliate URL.
 *  Keep the affiliate disclosure visible (FTC requires clear disclosure).
 * ---------------------------------------------------------------------------
 */

const ATHLETE = {
  firstName: "Christian",
  lastName: "Washington",
  number: "23",
  position: "Running Back",
  sport: "Football",
  team: "San Diego State Aztecs",
  classYear: "Junior",
  height: "5'10\"",
  weight: "205 lb",
  hometown: "San Diego, CA",
  highSchool: "Helix High (La Mesa)",
  tagline:
    "A hometown back built for the AztecFAST era — explosive in the open field, and just getting started in San Diego.",
  bio: "Christian is back where it started. A San Diego native out of Helix High — the same program that sent Reggie Bush and Alex Smith to the league — he returned home to SDSU after stops at New Mexico and Coastal Carolina. He's an all-purpose threat: a downhill runner, a pass-catcher out of the backfield, and one of the conference's most dangerous kick returners, with a 100-yard return touchdown and All-Mountain West honors already on his resume.",

  // ── [ FILL IN — not public ] ──────────────────────────────────────────────
  major: "[ add major ]",
  minor: "[ add minor ]",
  gpa: "[ - ]",
  gradYear: "[ year ]",
  ambition:
    "[ Add Christian's goals off the field — what he's studying toward and what he wants to build after football. ]",
  interests: [
    { label: "[ add interest ]", note: "[ short detail fans would love ]" },
    { label: "[ add interest ]", note: "[ short detail ]" },
    { label: "[ add interest ]", note: "[ short detail ]" },
    { label: "[ add interest ]", note: "[ short detail ]" },
  ],
  audience: [
    { label: "Total following", value: "[ add ]" },
    { label: "Avg. engagement", value: "[ add ]" },
    { label: "Audience 18-24", value: "[ add ]" },
    { label: "Reach / month", value: "[ add ]" },
  ],
  partners: ["[ partner ]", "[ partner ]", "[ partner ]"],
  contactEmail: "booking@youragency.com",

  // ── SHOP — drop in real partner products + affiliate links ────────────────
  shop: [
    { brand: "[ Brand ]", product: "[ Product name ]", price: "$00", url: "#" },
    { brand: "[ Brand ]", product: "[ Product name ]", price: "$00", url: "#" },
    { brand: "[ Brand ]", product: "[ Product name ]", price: "$00", url: "#" },
  ],
};

// ── SAMPLE DATA SOURCES — swap bodies for real fetch() calls ──────────────────
function getLiveStats() {
  // Reads the cache populated daily by netlify/functions/update-stats.mjs.
  return fetch("/.netlify/functions/get-stats")
    .then((r) => r.json())
    .catch(() => ({ scope: "Stats unavailable", line: [], lastGame: null }));
}

function getLiveNews() {
  return fetch("/.netlify/functions/get-news")
    .then((r) => r.json())
    .catch(() => []);
}


export default function App() {
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [newsIdx, setNewsIdx] = useState(0);
  const [sinceUpdate, setSinceUpdate] = useState(0);

  useEffect(() => {
    getLiveStats().then(setStats);
    getLiveNews().then(setNews);
  }, []);

  useEffect(() => {
    if (!news.length) return;
    const rot = setInterval(() => setNewsIdx((i) => (i + 1) % news.length), 5000);
    const tick = setInterval(() => setSinceUpdate((s) => s + 1), 1000);
    return () => {
      clearInterval(rot);
      clearInterval(tick);
    };
  }, [news.length]);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced, stats, news]);

  const initials = ATHLETE.firstName[0] + ATHLETE.lastName[0];

  return (
    <div className="nil-root">
      <style>{CSS}</style>

      {/* NAV */}
      <header className="nav">
        <a className="mark" href="#top">
          <span className="mark__mono">{ATHLETE.number}</span>
          <span className="mark__name">{ATHLETE.lastName.toUpperCase()}</span>
        </a>
        <nav className="nav__links">
          <a href="#live">Live</a>
          <a href="#off">Off the field</a>
          <a href="#shop">Shop</a>
          <a href="#brands">For brands</a>
        </nav>
        <a className="btn btn--solid" href="#brands">
          Work with {ATHLETE.firstName}
        </a>
      </header>

      {/* HERO */}
      <section id="top" className="hero">
        <div className="hero__copy" data-reveal>
          <p className="eyebrow">
            {ATHLETE.position} · #{ATHLETE.number} · {ATHLETE.team}
          </p>
          <h1 className="hero__name">
            {ATHLETE.firstName}
            <span className="hero__last">{ATHLETE.lastName}</span>
          </h1>
          <p className="hero__tag">{ATHLETE.tagline}</p>
          <div className="hero__cta">
            <a className="btn btn--solid" href="#brands">
              Partnership inquiries
            </a>
            <a className="btn btn--ghost" href="#live">
              See the tape
            </a>
          </div>
        </div>

        <div className="hero__cover" data-reveal>
          <div className="cover">
            <div className="cover__num">{ATHLETE.number}</div>
            <div className="cover__mono">{initials}</div>
            <span className="cover__hint">Drop in athlete photography</span>
          </div>
          <dl className="spec">
            <Spec k="HT" v={ATHLETE.height} />
            <Spec k="WT" v={ATHLETE.weight} />
            <Spec k="POS" v={ATHLETE.position} />
            <Spec k="CLASS" v={ATHLETE.classYear} />
            <Spec k="HOME" v={ATHLETE.hometown} />
            <Spec k="PREP" v={ATHLETE.highSchool} />
          </dl>
        </div>
      </section>

      {/* LIVE BAND */}
      <section id="live" className="live">
        <div className="live__head">
          <h2 className="sect__title sect__title--light">On the field</h2>
          <span className="live__status">
            <span className="dot" />
            {stats?.updatedAt
              ? `Updated ${new Date(stats.updatedAt).toLocaleDateString()}`
              : "Auto-updated daily"}
          </span>
        </div>

        <div className="live__grid">
          <div className="statsheet" data-reveal>
            <p className="statsheet__label">
              {stats ? stats.scope : "Loading stats…"}
            </p>
            <div className="statsheet__row">
              {stats?.line.map((s) => (
                <div className="stat" key={s.label}>
                  <span className="stat__v">{s.value}</span>
                  <span className="stat__k">{s.label}</span>
                </div>
              ))}
            </div>
            {stats?.lastGame && (
              <div className="highlight">
                <span className="highlight__head">
                  <span className={`pill pill--${stats.lastGame.result}`}>
                    {stats.lastGame.result}
                  </span>
                  {stats.lastGame.score}
                </span>
                <span className="highlight__detail">
                  Last game · {stats.lastGame.date}
                </span>
              </div>
            )}
          </div>

          <div className="feed" data-reveal>
            <p className="feed__label">Latest</p>
            {news.length > 0 && (
              <a className="feed__lead" href={news[newsIdx].url} target="_blank" rel="noopener noreferrer">
                <span className="feed__tag">{news[newsIdx].tag}</span>
                <span className="feed__title">{news[newsIdx].title}</span>
                <span className="feed__meta">
                  {news[newsIdx].source} · {news[newsIdx].date}
                </span>
              </a>
            )}
            <ul className="feed__list">
              {news
                .filter((_, i) => i !== newsIdx)
                .slice(0, 3)
                .map((n) => (
                                    <li key={n.title}>
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", gap: ".8rem", color: "inherit", textDecoration: "none", flex: 1 }}
                    >
                      <span className="feed__tag feed__tag--sm">{n.tag}</span>
                      <span>{n.title}</span>
                    </a>
                  </li>

                ))}
            </ul>
          </div>
        </div>
      </section>

      {/* OFF THE FIELD */}
      <section id="off" className="off">
        <div className="off__intro" data-reveal>
          <h2 className="sect__title">Off the field</h2>
          <p className="off__bio">{ATHLETE.bio}</p>
        </div>

        <div className="off__cols">
          <div className="card card--study" data-reveal>
            <p className="card__eyebrow">In the classroom</p>
            <p className="card__major">{ATHLETE.major}</p>
            <p className="card__minor">Minor · {ATHLETE.minor}</p>
            <dl className="ministats">
              <div>
                <dt>GPA</dt>
                <dd>{ATHLETE.gpa}</dd>
              </div>
              <div>
                <dt>Class of</dt>
                <dd>{ATHLETE.gradYear}</dd>
              </div>
            </dl>
            <p className="card__ambition">{ATHLETE.ambition}</p>
          </div>

          <div className="card card--interests" data-reveal>
            <p className="card__eyebrow">Away from the game</p>
            <ul className="interests">
              {ATHLETE.interests.map((it, i) => (
                <li key={i}>
                  <span className="interests__idx">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="interests__label">{it.label}</span>
                  <span className="interests__note">{it.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="shop">
        <div className="shop__head" data-reveal>
          <h2 className="sect__title">Shop {ATHLETE.firstName}'s picks</h2>
          <p className="shop__lede">
            Gear and products from the brands {ATHLETE.firstName} partners with.
            Every purchase supports him directly.
          </p>
        </div>

        <div className="shop__grid">
          {ATHLETE.shop.map((p, i) => (
            <a
              className="product"
              key={i}
              href={p.url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              data-reveal
            >
              <div className="product__img">
                <span className="product__hint">Product image</span>
              </div>
              <div className="product__body">
                <span className="product__brand">{p.brand}</span>
                <span className="product__name">{p.product}</span>
                <span className="product__row">
                  <span className="product__price">{p.price}</span>
                  <span className="product__cta">Shop now →</span>
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="shop__disclosure" data-reveal>
          Some links are affiliate links. {ATHLETE.firstName} may earn a
          commission on purchases made through them, at no extra cost to you.
        </p>
      </section>

      {/* FOR BRANDS */}
      <section id="brands" className="brands">
        <div className="brands__pitch" data-reveal>
          <h2 className="sect__title sect__title--light">For brands</h2>
          <p className="brands__lede">
            {ATHLETE.firstName} reaches a young, San Diego-rooted audience that
            trusts his taste. Here's the picture, and how to start a conversation.
          </p>
        </div>

        <div className="audience" data-reveal>
          {ATHLETE.audience.map((a) => (
            <div className="aud" key={a.label}>
              <span className="aud__v">{a.value}</span>
              <span className="aud__k">{a.label}</span>
            </div>
          ))}
        </div>

        <div className="partners" data-reveal>
          <p className="partners__label">Recent partners</p>
          <div className="partners__row">
            {ATHLETE.partners.map((p, i) => (
              <span className="partner" key={i}>
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="cta-band" data-reveal>
          <p className="cta-band__line">Have a campaign in mind?</p>
          <a className="btn btn--solid btn--lg" href={`mailto:${ATHLETE.contactEmail}`}>
            Start a partnership
          </a>
        </div>
      </section>

      <footer className="foot">
        <span className="foot__name">
          {ATHLETE.firstName} {ATHLETE.lastName} · #{ATHLETE.number} ·{" "}
          {ATHLETE.team}
        </span>
        <span className="foot__contact">{ATHLETE.contactEmail}</span>
      </footer>
    </div>
  );
}

function Spec({ k, v }) {
  return (
    <div className="spec__item">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

.nil-root{
  /* ── San Diego State identity — one accent token themes the whole site ── */
  --accent:#A6192E;          /* SDSU Scarlet (PMS 200) */
  --accent-deep:#5E0F1C;     /* darker scarlet for the cover gradient */

  --paper:#F2F0EB;
  --panel:#E7E4DC;
  --ink:#121212;             /* SDSU Black */
  --ink-soft:#3A3A38;
  --stone:#797469;
  --line:#D6D2C8;

  --serif:'Fraunces',Georgia,serif;
  --sans:'Inter',system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,monospace;

  background:var(--paper);color:var(--ink);font-family:var(--sans);
  -webkit-font-smoothing:antialiased;line-height:1.5;
}
.nil-root *{box-sizing:border-box;margin:0;padding:0;}
.nil-root a{color:inherit;text-decoration:none;}
.nil-root :focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px;}

[data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease;}
[data-reveal].is-in{opacity:1;transform:none;}
@media (prefers-reduced-motion: reduce){[data-reveal]{opacity:1;transform:none;transition:none;}}

.eyebrow{font-family:var(--mono);font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--stone);}

.btn{display:inline-flex;align-items:center;font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;padding:.78em 1.3em;border:1px solid var(--ink);transition:.18s ease;white-space:nowrap;}
.btn--solid{background:var(--ink);color:var(--paper);}
.btn--solid:hover{background:var(--accent);border-color:var(--accent);}
.btn--ghost:hover{background:var(--ink);color:var(--paper);}
.btn--lg{font-size:.8rem;padding:1.05em 1.8em;}

.sect__title{font-family:var(--serif);font-weight:600;font-size:clamp(1.9rem,4vw,3rem);letter-spacing:-.01em;line-height:1;}
.sect__title--light{color:var(--paper);}

/* NAV */
.nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:2rem;padding:1rem clamp(1.2rem,5vw,4rem);background:rgba(242,240,235,.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.mark{display:flex;align-items:baseline;gap:.5rem;}
.mark__mono{font-family:var(--mono);font-size:.8rem;color:var(--accent);font-weight:700;}
.mark__name{font-family:var(--serif);font-weight:800;letter-spacing:.02em;}
.nav__links{margin-left:auto;display:flex;gap:1.6rem;font-family:var(--mono);font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);}
.nav__links a:hover{color:var(--accent);}
.nav .btn{margin-left:.4rem;}
@media (max-width:820px){.nav__links{display:none;}}

/* HERO */
.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(2rem,5vw,5rem);align-items:center;padding:clamp(3rem,8vw,7rem) clamp(1.2rem,5vw,4rem) clamp(3rem,6vw,5rem);max-width:1320px;margin:0 auto;}
.hero__name{font-family:var(--serif);font-weight:800;line-height:.86;letter-spacing:-.03em;font-size:clamp(3rem,11vw,8rem);margin:.7rem 0 0;}
.hero__last{display:block;color:var(--accent);}
.hero__tag{font-family:var(--serif);font-style:italic;font-weight:400;font-size:clamp(1.05rem,2vw,1.45rem);color:var(--ink-soft);max-width:34ch;margin:1.6rem 0 2.2rem;}
.hero__cta{display:flex;gap:.8rem;flex-wrap:wrap;}
.hero__cover{display:flex;gap:1rem;}
.cover{position:relative;flex:1;aspect-ratio:3/4;overflow:hidden;background:radial-gradient(120% 90% at 70% 10%, var(--accent) 0%, var(--accent-deep) 40%, #0B0B0B 100%);display:flex;align-items:flex-end;justify-content:flex-start;}
.cover__num{position:absolute;top:-.18em;right:.04em;font-family:var(--serif);font-weight:800;font-size:13rem;line-height:1;color:rgba(255,255,255,.10);}
.cover__mono{font-family:var(--mono);font-weight:700;color:var(--paper);font-size:2.4rem;letter-spacing:.06em;padding:1.2rem;mix-blend-mode:screen;}
.cover__hint{position:absolute;left:1.2rem;top:1.2rem;font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.6);border:1px dashed rgba(255,255,255,.4);padding:.4em .6em;}
.spec{display:flex;flex-direction:column;justify-content:flex-end;border-left:1px solid var(--line);}
.spec__item{padding:.55rem .9rem;border-bottom:1px solid var(--line);}
.spec__item:first-child{border-top:1px solid var(--line);}
.spec dt{font-family:var(--mono);font-size:.6rem;letter-spacing:.16em;color:var(--stone);}
.spec dd{font-size:.84rem;font-weight:500;margin-top:.1rem;}
@media (max-width:860px){.hero{grid-template-columns:1fr;}.hero__cover{max-width:480px;}.cover__num{font-size:9rem;}}

/* LIVE BAND */
.live{background:#0B0B0B;color:var(--paper);padding:clamp(3rem,6vw,5rem) clamp(1.2rem,5vw,4rem);}
.live__head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;max-width:1320px;margin:0 auto 2.2rem;flex-wrap:wrap;}
.live__status{font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#B9B3A6;display:flex;align-items:center;gap:.5rem;}
.dot{width:8px;height:8px;border-radius:50%;background:var(--accent);animation:pulse 1.8s infinite;}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(166,25,46,.6);}70%{box-shadow:0 0 0 9px rgba(166,25,46,0);}100%{box-shadow:0 0 0 0 rgba(166,25,46,0);}}
@media (prefers-reduced-motion: reduce){.dot{animation:none;}}
.live__grid{display:grid;grid-template-columns:1.3fr 1fr;gap:clamp(1.5rem,4vw,3.5rem);max-width:1320px;margin:0 auto;}
.statsheet__label,.feed__label{font-family:var(--mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:#8C8678;margin-bottom:1.1rem;}
.statsheet__row{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12);}
.stat{background:#0B0B0B;padding:1.1rem 1rem;display:flex;flex-direction:column;gap:.25rem;}
.stat__v{font-family:var(--serif);font-weight:600;font-size:1.9rem;line-height:1;}
.stat__k{font-family:var(--mono);font-size:.58rem;letter-spacing:.14em;color:#8C8678;}
.highlight{display:flex;flex-direction:column;gap:.3rem;margin-top:1.3rem;border-left:3px solid var(--accent);padding-left:1rem;}
.highlight__head{font-family:var(--serif);font-weight:600;font-size:1.15rem;}
.highlight__detail{font-family:var(--mono);font-size:.7rem;letter-spacing:.06em;color:#B9B3A6;text-transform:uppercase;}
.highlight__head{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;}
.pill{font-family:var(--mono);font-weight:700;font-size:.7rem;width:1.9em;height:1.9em;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;}
.pill--W{background:var(--accent);color:#fff;}
.pill--L{background:#5b574c;color:#fff;}
.pill--T{background:#8C8678;color:#111;}
.feed__lead{display:block;border-top:1px solid rgba(255,255,255,.18);padding-top:1rem;}
.feed__tag{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);}
.feed__tag--sm{color:#8C8678;min-width:5.4em;display:inline-block;}
.feed__title{display:block;font-family:var(--serif);font-size:1.3rem;line-height:1.2;margin:.4rem 0;}
.feed__lead:hover .feed__title{text-decoration:underline;text-underline-offset:3px;}
.feed__meta{font-family:var(--mono);font-size:.66rem;color:#8C8678;}
.feed__list{list-style:none;margin-top:1.2rem;display:flex;flex-direction:column;}
.feed__list li{display:flex;gap:.8rem;padding:.85rem 0;border-top:1px solid rgba(255,255,255,.12);font-size:.88rem;color:#D8D3C7;}
@media (max-width:760px){.live__grid{grid-template-columns:1fr;}}

/* OFF THE FIELD */
.off{max-width:1320px;margin:0 auto;padding:clamp(3.5rem,7vw,6rem) clamp(1.2rem,5vw,4rem);}
.off__intro{max-width:64ch;margin-bottom:3rem;}
.off__bio{font-family:var(--serif);font-weight:400;font-size:clamp(1.1rem,2vw,1.5rem);line-height:1.45;margin-top:1.3rem;color:var(--ink-soft);}
.off__cols{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;}
.card{background:var(--panel);border:1px solid var(--line);padding:clamp(1.6rem,3vw,2.4rem);}
.card__eyebrow{font-family:var(--mono);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--stone);}
.card--study .card__major{font-family:var(--serif);font-weight:600;font-size:1.7rem;margin:.9rem 0 .2rem;}
.card--study .card__minor{color:var(--ink-soft);font-size:.92rem;}
.ministats{display:flex;gap:2.5rem;margin:1.5rem 0;}
.ministats dt{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;color:var(--stone);}
.ministats dd{font-family:var(--serif);font-weight:600;font-size:1.6rem;}
.card__ambition{font-size:.96rem;line-height:1.55;color:var(--ink-soft);border-top:1px solid var(--line);padding-top:1.2rem;}
.interests{list-style:none;margin-top:1.3rem;}
.interests li{display:grid;grid-template-columns:auto 1fr;gap:.2rem 1rem;padding:1rem 0;border-top:1px solid var(--line);}
.interests li:first-child{border-top:none;padding-top:.3rem;}
.interests__idx{grid-row:span 2;font-family:var(--mono);font-size:.72rem;color:var(--accent);padding-top:.3rem;}
.interests__label{font-family:var(--serif);font-weight:600;font-size:1.2rem;}
.interests__note{font-size:.88rem;color:var(--ink-soft);}
@media (max-width:760px){.off__cols{grid-template-columns:1fr;}}

/* SHOP */
.shop{max-width:1320px;margin:0 auto;padding:clamp(3rem,6vw,5rem) clamp(1.2rem,5vw,4rem);}
.shop__head{max-width:60ch;margin-bottom:2.6rem;}
.shop__lede{margin-top:1rem;color:var(--ink-soft);font-size:1.02rem;line-height:1.55;}
.shop__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;}
.product{display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);transition:.18s ease;}
.product:hover{border-color:var(--accent);transform:translateY(-3px);}
.product__img{aspect-ratio:4/3;background:linear-gradient(135deg,#E0DCD2,#D2CDC2);display:flex;align-items:center;justify-content:center;}
.product__hint{font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--stone);border:1px dashed var(--stone);padding:.4em .6em;}
.product__body{padding:1.1rem 1.2rem 1.3rem;display:flex;flex-direction:column;gap:.3rem;}
.product__brand{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);}
.product__name{font-family:var(--serif);font-weight:600;font-size:1.15rem;}
.product__row{display:flex;align-items:baseline;justify-content:space-between;margin-top:.5rem;}
.product__price{font-weight:600;}
.product__cta{font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);}
.product:hover .product__cta{color:var(--accent);}
.shop__disclosure{margin-top:1.8rem;font-family:var(--mono);font-size:.66rem;letter-spacing:.04em;color:var(--stone);max-width:60ch;line-height:1.6;}
@media (max-width:820px){.shop__grid{grid-template-columns:1fr 1fr;}}
@media (max-width:540px){.shop__grid{grid-template-columns:1fr;}}

/* FOR BRANDS */
.brands{background:#0B0B0B;color:var(--paper);padding:clamp(3.5rem,7vw,6rem) clamp(1.2rem,5vw,4rem);}
.brands>*{max-width:1320px;margin-left:auto;margin-right:auto;}
.brands__pitch{max-width:60ch;}
.brands__lede{font-size:clamp(1rem,1.6vw,1.2rem);line-height:1.55;color:#CFC9BC;margin-top:1.2rem;}
.audience{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.14);margin:2.8rem auto;}
.aud{background:#0B0B0B;padding:1.6rem 1.2rem;display:flex;flex-direction:column;gap:.4rem;}
.aud__v{font-family:var(--serif);font-weight:600;font-size:clamp(1.6rem,4vw,2.6rem);line-height:1;color:var(--paper);}
.aud__k{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:#8C8678;}
.partners__label{font-family:var(--mono);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#8C8678;margin-bottom:1rem;}
.partners__row{display:flex;flex-wrap:wrap;gap:.7rem;}
.partner{font-family:var(--serif);font-size:1.05rem;padding:.5em 1em;border:1px solid rgba(255,255,255,.2);color:#E4DFD3;}
.cta-band{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;margin-top:3rem;border-top:1px solid rgba(255,255,255,.18);padding-top:2.5rem;}
.cta-band__line{font-family:var(--serif);font-weight:500;font-size:clamp(1.4rem,3vw,2.2rem);}
@media (max-width:760px){.audience{grid-template-columns:repeat(2,1fr);}}

/* FOOTER */
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1.6rem clamp(1.2rem,5vw,4rem);font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;color:var(--stone);text-transform:uppercase;}
`;
