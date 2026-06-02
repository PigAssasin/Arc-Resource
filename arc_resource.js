// Chọn filter "Resource" → F12 → Console → Paste → Enter (KHÔNG cần scroll trước)
(async function () {
  const TYPE = 'Resource';
  const URL_PATTERN = '/home/resources/';

  const dateRe = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d+(?:st|nd|rd|th)?,?\s*\d{4}/i;
  const collected = new Map();

  function collectNow() {
    document.querySelectorAll('a[href*="' + URL_PATTERN + '"]').forEach(link => {
      if (collected.has(link.href)) return;
      const title = (link.innerText || '').trim().replace(/\s+/g, ' ');
      if (!title || title.length < 5) return;

      let box = link.parentElement;
      for (let i = 0; i < 10; i++) {
        if (!box) break;
        if (dateRe.test(box.innerText || '')) break;
        box = box.parentElement;
      }

      const text = box ? (box.innerText || '').trim() : '';
      const dateMatch = text.match(dateRe);
      const date = dateMatch ? dateMatch[0] : '';

      collected.set(link.href, [0, TYPE, date, title, link.href]);
    });
  }

  console.log('Bat dau scroll + collect...');
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

  const results = [...collected.values()].map((r, i) => { r[0] = i + 1; return r; });
  console.log('Total:', results.length);
  if (!results.length) { alert('Khong tim duoc Resource nao!'); return; }

  const tsv = ['STT\tLoai\tNgay\tTieu de\tURL', ...results.map(r => r.join('\t'))].join('\n');

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:999999;display:flex;align-items:center;justify-content:center';
  const box2 = document.createElement('div');
  box2.style.cssText = 'background:#fff;border-radius:10px;padding:24px;width:70%;max-width:700px;font-family:Arial';
  const info = document.createElement('div');
  info.textContent = TYPE + ': ' + results.length + ' bai da tim duoc';
  info.style.cssText = 'font-size:16px;font-weight:bold;margin-bottom:12px';
  const ta2 = document.createElement('textarea');
  ta2.value = tsv;
  ta2.style.cssText = 'width:100%;height:180px;font:12px monospace;border:1px solid #ccc;border-radius:4px;padding:6px;box-sizing:border-box';
  ta2.readOnly = true;
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;margin-top:12px';
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy (dan vao Excel)';
  copyBtn.style.cssText = 'flex:1;padding:12px;background:#f59e0b;color:#fff;border:none;border-radius:6px;font-size:15px;cursor:pointer;font-weight:bold';
  copyBtn.onclick = () => { ta2.select(); document.execCommand('copy'); copyBtn.textContent = 'Da copy!'; setTimeout(() => ov.remove(), 2000); };
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Dong';
  closeBtn.style.cssText = 'padding:12px 20px;background:#6b7280;color:#fff;border:none;border-radius:6px;font-size:15px;cursor:pointer';
  closeBtn.onclick = () => ov.remove();
  btnRow.append(copyBtn, closeBtn);
  box2.append(info, ta2, btnRow);
  ov.appendChild(box2);
  document.body.appendChild(ov);
  ta2.select();
})();
