// Filter "External Content" → F12 → Console → Paste → Enter
(async function () {
  const TYPE = 'External Content';
  const dateRe = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d+(?:st|nd|rd|th)?,?\s*\d{4}/i;
  const collected = new Map();

  function collectNow() {
    // Tim tat ca element co chua SVG con (icon external link) + text dai
    const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
      if (!el.querySelector('svg')) return false;
      if (el.childElementCount > 5) return false;
      const t = (el.innerText || '').trim();
      return t.length > 15 && t.length < 300 && !t.includes('\n\n');
    });

    // Lay element nho nhat (innermost) co chua svg
    const innermost = candidates.filter(el =>
      !candidates.some(other => other !== el && el.contains(other) && other.querySelector('svg'))
    );

    innermost.forEach(el => {
      // Lay text, loai bo phan text cua svg
      const svgs = el.querySelectorAll('svg');
      svgs.forEach(s => s.style.display = 'none');
      const title = (el.innerText || '').trim().replace(/\s+/g, ' ');
      svgs.forEach(s => s.style.display = '');

      if (!title || title.length < 15) return;
      if (collected.has(title)) return;

      // Skip navigation / UI elements
      if (/^(Home|Content|Events|Albums|Search|Latest|Popular|All Tags|Blog|Video|Resource|External|Arc House|Arc Discord)/i.test(title)) return;
      if (/^(Cookies|Manage|Strictly|Performance|Functional|Targeting|#)/i.test(title)) return;

      // Tim date trong parents
      let date = '';
      let p = el.parentElement;
      for (let i = 0; i < 10 && p; i++) {
        const m = (p.innerText || '').match(dateRe);
        if (m) { date = m[0]; break; }
        p = p.parentElement;
      }

      collected.set(title, [0, TYPE, date, title]);
    });
  }

  // Debug: so luong element co svg
  const svgEls = Array.from(document.querySelectorAll('*')).filter(el => el.querySelector('svg') && el.childElementCount <= 5);
  console.log('Elements with SVG:', svgEls.length);

  console.log('Scrolling...');
  const step = Math.floor(window.innerHeight * 0.75);
  let pos = 0, noNewCount = 0, prevSize = 0;

  while (noNewCount < 6) {
    window.scrollTo(0, pos);
    await new Promise(r => setTimeout(r, 1000));
    collectNow();
    const nowSize = collected.size;
    if (nowSize === prevSize) noNewCount++;
    else noNewCount = 0;
    prevSize = nowSize;
    pos += step;
    console.log('pos:', pos, '| items:', nowSize);
    if (pos > document.body.scrollHeight + window.innerHeight * 2) break;
  }

  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 1500));
  collectNow();

  const results = [...collected.values()]
    .filter(r => r[3].length > 20)
    .map((r, i) => { r[0] = i + 1; return r; });

  console.log('Total:', results.length);
  if (!results.length) {
    const svgCount = document.querySelectorAll('svg').length;
    alert('Khong tim duoc. SVG count tren trang: ' + svgCount);
    return;
  }

  const tsv = ['STT\tLoai\tNgay\tTieu de', ...results.map(r => r.join('\t'))].join('\n');

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:999999;display:flex;align-items:center;justify-content:center';
  const bx = document.createElement('div');
  bx.style.cssText = 'background:#fff;border-radius:10px;padding:24px;width:70%;max-width:700px;font-family:Arial';
  const info = document.createElement('div');
  info.textContent = TYPE + ': ' + results.length + ' bai tim duoc';
  info.style.cssText = 'font-size:15px;font-weight:bold;margin-bottom:12px';
  const ta2 = document.createElement('textarea');
  ta2.value = tsv;
  ta2.style.cssText = 'width:100%;height:200px;font:12px monospace;border:1px solid #ccc;border-radius:4px;padding:6px;box-sizing:border-box';
  ta2.readOnly = true;
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;margin-top:12px';
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy → Dan vao Excel';
  copyBtn.style.cssText = 'flex:1;padding:12px;background:#8b5cf6;color:#fff;border:none;border-radius:6px;font-size:15px;cursor:pointer;font-weight:bold';
  copyBtn.onclick = () => { ta2.select(); document.execCommand('copy'); copyBtn.textContent = 'Da copy!'; setTimeout(() => ov.remove(), 2000); };
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Dong';
  closeBtn.style.cssText = 'padding:12px 20px;background:#6b7280;color:#fff;border:none;border-radius:6px;font-size:15px;cursor:pointer';
  closeBtn.onclick = () => ov.remove();
  btnRow.append(copyBtn, closeBtn);
  bx.append(info, ta2, btnRow);
  ov.appendChild(bx);
  document.body.appendChild(ov);
  ta2.select();
})();
