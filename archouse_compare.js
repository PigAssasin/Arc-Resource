// ============================================================
// SCRIPT 3 - SO SÁNH (Chạy sau khi đã có 2 bảng trong Excel)
// Paste script này vào Console khi đang ở trang All Content
// Script sẽ tự động làm cả 2 việc và so sánh
// ============================================================

(async function compareContent() {
  // Bước 1: Lấy lịch sử từ trang My Contributions
  // Mở tab mới My Contributions và lấy dữ liệu
  const myHistory = prompt(
    'BƯỚC 1: Mở trang My Contributions, chạy Script 1, copy kết quả.\n' +
    'Paste danh sách tiêu đề đã xem vào đây (mỗi tiêu đề 1 dòng):\n' +
    '(Bấm Cancel nếu muốn bỏ qua bước này)'
  );

  const watched = new Set(
    (myHistory || '').split('\n')
      .map(l => l.trim().toLowerCase())
      .filter(l => l.length > 5)
  );

  // Bước 2: Quét All Content
  console.log('Đang scroll để load hết content...');
  await new Promise(resolve => {
    let lastH = 0, tries = 0;
    const iv = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      if (document.body.scrollHeight === lastH) {
        if (++tries >= 3) { clearInterval(iv); resolve(); }
      } else { tries = 0; lastH = document.body.scrollHeight; }
    }, 1500);
  });
  window.scrollTo(0, 0);

  const dateRe = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d+(?:st|nd|rd|th)?,?\s*\d{4}/i;

  let items = Array.from(document.querySelectorAll('article'));
  if (items.length < 3) {
    const allEls = Array.from(document.querySelectorAll('div,li'));
    items = allEls.filter(el => {
      const h = el.querySelector('h1,h2,h3,h4');
      return h && dateRe.test(el.innerText || '') && (el.innerText || '').length < 2000;
    }).filter((el, _, arr) => !arr.some(o => o !== el && o.contains(el)));
  }

  const all = [];
  items.forEach((item, idx) => {
    const text = (item.innerText || '').trim();
    const heading = item.querySelector('h1,h2,h3,h4,[class*="title"]');
    const title = (heading?.innerText || '').trim();
    if (!title || title.length < 3) return;

    const dateMatch = text.match(dateRe);
    const date = dateMatch ? dateMatch[0] : '';
    const tags = [...(text.match(/#[\w-]+/g) || [])].join(', ');

    const isWatched = watched.size > 0
      ? [...watched].some(w => title.toLowerCase().includes(w) || w.includes(title.toLowerCase().substring(0, 20)))
      : false;

    all.push({
      stt: idx + 1, date, title, tags,
      status: watched.size > 0 ? (isWatched ? '✅ Đã xem' : '❌ Chưa xem') : '?'
    });
  });

  const missed = all.filter(r => r.status === '❌ Chưa xem');

  const tsv = [
    'STT\tNgày\tTiêu đề\tTags\tTrạng thái',
    ...all.map(r => `${r.stt}\t${r.date}\t${r.title}\t${r.tags}\t${r.status}`)
  ].join('\n');

  const summary = watched.size > 0
    ? `Tổng: ${all.length} | Đã xem: ${all.length - missed.length} | Chưa xem: ${missed.length}`
    : `Tổng: ${all.length} bài (chưa có dữ liệu lịch sử để so sánh)`;

  const fullOutput = summary + '\n\n' + tsv;

  navigator.clipboard.writeText(fullOutput)
    .then(() => alert(`${summary}\n\n✅ Đã copy! Paste vào Excel.`))
    .catch(() => {
      const w = window.open('');
      w.document.write('<pre>' + fullOutput.replace(/</g,'&lt;') + '</pre>');
    });

  console.log(summary);
  if (missed.length > 0) {
    console.log('\n❌ CHƯA XEM:');
    missed.forEach(r => console.log(`  • [${r.date}] ${r.title}`));
  }
})();
