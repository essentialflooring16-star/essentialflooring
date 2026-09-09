// Renders public/og-default.jpg, the 1200x630 card that WhatsApp, Facebook and
// X show when someone pastes a link to the site.
//
// The card is the client's own logo on its own anthracite ground, so unlike the
// in-site lockup it carries the brand colours exactly as they are in the file
// he sent, sampled straight out of the previous card:
//   ground #25292C, cream #EFECE3, copper #B5773A, gradient end #C07436.
//
// It draws the same geometry as src/components/BrandLogo.astro, so when the
// lockup changes there, run this again and the preview card follows.
//
//   node scripts/make-og.mjs            writes public/og-default.jpg
//   node scripts/make-og.mjs out.jpg    writes somewhere else
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const out = process.argv[2] ? resolve(process.argv[2]) : resolve(root, 'public/og-default.jpg');

// The credential line at the bottom is left exactly as the previous card had
// it, "Licensed & Insured". That is what the live site says today and what the
// client asked for in writing on 9 September. The local legal commit changes
// the site to "Licensed & Bonded"; if that wording is the one that ships, edit
// the .foot line below to match, or the card and the pages will disagree.
// See docs/LEGAL.md section 2.
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) {
  console.error('Chrome not found at', CHROME);
  process.exit(1);
}

const fontPath = resolve(root, 'node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2');
const fontData = readFileSync(fontPath).toString('base64');

// Everything below is the card. Sizes are in card pixels at 1200x630.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {
  font-family: 'Archivo Card';
  src: url(data:font/woff2;base64,${fontData}) format('woff2-variations');
  font-weight: 100 900;
  font-display: block;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body {
  background: #25292C;
  font-family: 'Archivo Card', Helvetica, Arial, sans-serif;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  -webkit-font-smoothing: antialiased;
}
.lockup { display: inline-block; line-height: 1; }
.planks { display: block; margin-bottom: -30px; margin-left: 2px; }
.word {
  display: block; font-size: 148px; font-weight: 800; text-transform: uppercase;
  letter-spacing: -0.012em; line-height: 1;
  background: linear-gradient(to right, #EFECE3 0%, #EFECE3 56%, #C07436 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.rule-row {
  display: flex; align-items: center; gap: 24px; margin-top: 14px;
  font-size: 30px; font-weight: 600; letter-spacing: 0.42em; text-transform: uppercase;
  color: #B5773A; padding-left: 0.42em;
}
.rule-row .r { flex: 1; height: 2px; background: #8A6338; }
.tag {
  display: block; margin-top: 26px; font-size: 30px; font-weight: 600;
  letter-spacing: 0.075em; text-transform: uppercase; color: #CAC9C4;
  white-space: nowrap; text-align: center; padding-left: 0.075em;
}
.tag .dot { color: #7E8082; padding: 0 4px; }
.foot {
  position: absolute; left: 64px; right: 64px; bottom: 44px;
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: 19px; letter-spacing: 0.01em; color: #949590; font-weight: 500;
}
.foot b { color: #EFECE3; font-weight: 700; }
</style></head><body>
  <div class="lockup" style="margin-bottom:52px">
    <svg class="planks" width="172" height="66" viewBox="0 0 34 13" fill="none">
      <g transform="rotate(-19 17 6.5)">
        <rect x="2" y="3.1" width="24" height="3.1" fill="#EFECE3"/>
        <rect x="8" y="7.4" width="24" height="3.1" fill="#B5773A"/>
      </g>
    </svg>
    <span class="word">Essential</span>
    <span class="rule-row"><span class="r"></span>Flooring<span class="r"></span></span>
    <span class="tag">LVP, Laminate &amp; Vinyl <span class="dot">&#8226;</span> Hardwood Refinishing</span>
  </div>
  <div class="foot">
    <span><b>Licensed &amp; Insured</b> &middot; CSLB #1117565</span>
    <span>Sacramento CA &middot; (916) 425-1361</span>
  </div>
</body></html>`;

const PORT = 9520 + (process.pid % 300);
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--window-size=1200,630',
  `--user-data-dir=/tmp/ef-og-${process.pid}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function targets() {
  for (let i = 0; i < 40; i++) {
    try { return await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); }
    catch { await sleep(250); }
  }
  throw new Error('chrome never came up');
}
const page = (await targets()).find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise(res => {
  const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params }));
});

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html) });
await sleep(2500);
await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
await sleep(400);

const shot = await send('Page.captureScreenshot', {
  format: 'jpeg', quality: 92,
  clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
  captureBeyondViewport: true,
});
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', out);

// Report the measured bands, so a change in the lockup is visible in the log.
const boxes = await send('Runtime.evaluate', {
  expression: `JSON.stringify(['.planks','.word','.rule-row','.tag','.foot'].map(s => {
    const r = document.querySelector(s).getBoundingClientRect();
    return s + ' y ' + Math.round(r.top) + '-' + Math.round(r.bottom) + '  x ' + Math.round(r.left) + '-' + Math.round(r.right);
  }))`, returnByValue: true,
});
console.log(JSON.parse(boxes.result.result.value).join('\n'));

ws.close(); chrome.kill(); process.exit(0);
