// Usage : node render.js <page.html> <16x9|9x16> <sortie.mp4> [stills=t1,t2,...]
// Capture image par image (window.render(t)) à 25 i/s puis assemble avec ffmpeg (H.264, yuv420p, faststart, sans audio).
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  let [page_, fmt, out, stillsArg] = process.argv.slice(2); if (stillsArg) stillsArg = stillsArg.replace('stills=', '');
  const W = fmt === '9x16' ? 720 : 1280, H = fmt === '9x16' ? 1280 : 720, FPS = 25;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + path.resolve(page_) + '?fmt=' + fmt);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + f.weight));
  console.log('polices chargées :', fonts.join(', '));
  if (stillsArg) {
    for (const t of stillsArg.split(',')) {
      await page.evaluate(t => window.render(t), parseFloat(t));
      await page.screenshot({ path: `${out}_${t}.png` });
    }
    await browser.close(); return;
  }
  const dur = await page.evaluate(() => window.DURATION);
  const dir = out + '_frames'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    await page.screenshot({ path: `${dir}/f${String(i).padStart(5, '0')}.png` });
  }
  await browser.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/f%05d.png`,
    '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level', '3.1', '-pix_fmt', 'yuv420p',
    '-b:v', '600k', '-maxrate', '900k', '-bufsize', '1800k', '-an', '-movflags', '+faststart', out], { stdio: 'inherit' });
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('OK', out, n, 'images');
})();
