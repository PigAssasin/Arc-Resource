// ============================================================
// ARC HOUSE - Cào lịch sử cá nhân (My Contributions)
// Hướng dẫn: Xem README tại https://github.com/PigAssasin/Arc-Resource
// ============================================================

(function () {
  const results = [];
  const dateRe = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d+(?:st|nd|rd|th)?,?\s*\d{4}/i;
  const typeKw = ['Watch a Video', 'Read Content', 'Daily Active'];

  const typeEls = Array.from(document.querySelectorAll('*')).filter(el => {
    const t = (el.textContent || '').trim();
    return typeKw.includes(t) && el.childElementCount === 0;
  });

  if (typeEls.length === 0) {
    alert('Khong tim duoc du lieu!\nHay dam bao:\n1. Dang o trang My Contributions\n2. Da scroll xuong het trang');
    return;
  }

  const seen = new Set();
  typeEls.forEach(typeEl => {
    const type = (typeEl.textContent || '').trim();
    let row = typeEl.parentElement;
    for (let i = 0; i < 10; i++) {
      if (!row) break;
      if (dateRe.test(row.innerText || '')) break;
      row = row.parentElement;
    }
    if (!row || seen.has(row)) return;
    seen.add(row);

    const text = (row.innerText || '').trim();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const dateMatch = text.match(dateRe);
    const date = dateMatch ? dateMatch[0] : '';

    let title = '';
    const dotMatch = text.match(/[·•]\s*(.{10,})/);
    if (dotMatch) title = dotMatch[1].split('\n')[0].trim();
    else {
      const candidates = lines.filter(l =>
        l.length > 15 && !dateRe.test(l) &&
        !typeKw.some(k => l.includes(k)) && !/^[\+x\d]/.test(l)
      );
      title = candidates[0] || '';
    }

    if (date || title) results.push([type, date, title]);
  });

  if (!results.length) { alert('Khong parse duoc du lieu.'); return; }

  const tsv = ['Loai\tNgay\tTieu de', ...results.map(r => r.join('\t'))].join('\n');

  // Hien overlay de copy
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:999999;display:flex;align-items:center;justify-content:center';
  const bx = document.createElement('div');
  bx.style.cssText = 'background:#fff;border-radius:12px;padding:28px;width:75%;max-width:750px;font-family:Arial';
  const h = document.createElement('div');
  h.innerHTML = '<b style="font-size:16px">Tim duoc ' + results.length + ' hoat dong</b><br><small style="color:#666">Nhan Copy roi Paste vao Excel (Ctrl+V)</small>';
  h.style.marginBottom = '14px';
  const ta = document.createElement('textarea');
  ta.value = tsv;
  ta.style.cssText = 'width:100%;height:220px;font:12px monospace;border:1px solid #ddd;border-radius:6px;padding:8px;box-sizing:border-box';
  ta.readOnly = true;
  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;gap:10px;margin-top:14px';
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy tat ca';
  copyBtn.style.cssText = 'flex:1;padding:12px;background:#1E3A5F;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;font-weight:bold';
  copyBtn.onclick = () => {
    ta.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Da copy! Mo Excel dan Ctrl+V';
    copyBtn.style.background = '#22c55e';
    setTimeout(() => ov.remove(), 2500);
  };
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Dong';
  closeBtn.style.cssText = 'padding:12px 20px;background:#6b7280;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer';
  closeBtn.onclick = () => ov.remove();
  row2.append(copyBtn, closeBtn);
  bx.append(h, ta, row2);
  ov.appendChild(bx);
  document.body.appendChild(ov);
  ta.select();
})();
