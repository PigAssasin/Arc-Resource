// ============================================================
// SCRIPT 1 - LỊCH SỬ CỦA BẠN (v3)
// Mở trang "My Contributions" → Scroll xuống hết → F12 → Console → Paste → Enter
// ============================================================

(function () {
  const results = [];
  const dateRe = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d+(?:st|nd|rd|th)?,?\s*\d{4}/i;
  const typeKw = ['Watch a Video', 'Read Content', 'Daily Active'];

  // Tìm tất cả leaf element có text chính xác là type keyword
  const typeEls = Array.from(document.querySelectorAll('*')).filter(el => {
    const t = (el.textContent || '').trim();
    return typeKw.includes(t) && el.childElementCount === 0;
  });

  console.log('[v3] Type elements found:', typeEls.length);

  if (typeEls.length === 0) {
    alert('Không tìm được. Thử scroll xuống hết rồi chạy lại.');
    return;
  }

  const seen = new Set();

  typeEls.forEach(typeEl => {
    const type = (typeEl.textContent || '').trim();

    // Đi lên để tìm row container (phải chứa date)
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

    // Date: tìm dòng chứa date
    const dateMatch = text.match(dateRe);
    const date = dateMatch ? dateMatch[0] : '';

    // Title: nằm sau "Date ·" trên cùng dòng
    let title = '';
    const dateLine = lines.find(l => dateRe.test(l));
    if (dateLine) {
      // "May 31st, 2026 · The Arc developer experience..."
      const afterDot = dateLine.replace(dateRe, '').replace(/^\s*[·•\-]\s*/, '').trim();
      if (afterDot.length > 3) title = afterDot;
    }

    // Points: tìm dòng là số thuần (đứng sau dòng "+")
    let points = '';
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i] === '+' && /^\d+$/.test(lines[i + 1])) {
        points = lines[i + 1];
        break;
      }
    }
    // Fallback: tìm số nhỏ bất kỳ
    if (!points) {
      const numLine = lines.find(l => /^\d{1,3}$/.test(l));
      points = numLine || '';
    }

    results.push([type, date, title, points]);
  });

  if (results.length === 0) {
    alert('Tìm được type elements nhưng không parse được row. Xem Console.');
    console.log('[DEBUG] typeEls[0] parent chain:');
    let p = typeEls[0]?.parentElement;
    for (let i = 0; i < 8 && p; i++) {
      console.log(i, p.tagName, p.className.substring(0, 60), '|', (p.innerText||'').substring(0, 100));
      p = p.parentElement;
    }
    return;
  }

  const tsv = [
    'Loại\tNgày\tTiêu đề\tĐiểm',
    ...results.map(r => r.join('\t'))
  ].join('\n');

  navigator.clipboard.writeText(tsv)
    .then(() => alert('✅ Đã copy ' + results.length + ' dòng!\nPaste vào Excel (Ctrl+V)'))
    .catch(() => {
      const w = window.open('', '_blank');
      w.document.write('<html><body><pre style="font:14px monospace;padding:20px">' +
        tsv.replace(/&/g,'&amp;').replace(/</g,'&lt;') +
        '</pre></body></html>');
      w.document.close();
    });

  console.log('[v3] Done:', results.length, 'rows');
  console.table(results.slice(0, 10).map(r => ({
    Loại: r[0], Ngày: r[1], 'Tiêu đề': r[2], Điểm: r[3]
  })));
})();
