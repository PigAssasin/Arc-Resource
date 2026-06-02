// ============================================================
// SCRIPT 2 - TOÀN BỘ VIDEO & BLOG
// Mở trang "All Content" → Chọn filter "Video" hoặc "Blog"
// Scroll xuống HẾT trang → F12 → Console → Paste → Enter
// Làm riêng cho từng filter (Video và Blog)
// ============================================================

(async function () {
  // Auto scroll xuống để load hết infinite scroll
  console.log('Đang auto-scroll để load hết content...');
  await new Promise(resolve => {
    let lastH = 0, same = 0;
    const iv = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const h = document.body.scrollHeight;
      if (h === lastH) { if (++same >= 4) { clearInterval(iv); resolve(); } }
      else { same = 0; lastH = h; }
    }, 1200);
  });
  window.scrollTo(0, 0);
  console.log('Scroll xong. Đang quét...');

  const results = [];
  const dateRe = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d+(?:st|nd|rd|th)?,?\s*\d{4}/i;

  // Xác định loại content từ filter đang chọn trên trang
  const activeFilter = document.querySelector(
    '[class*="active"], [class*="selected"], button[aria-selected="true"], [aria-pressed="true"]'
  );
  let contentType = '';
  if (activeFilter) {
    const ft = (activeFilter.innerText || '').trim().toLowerCase();
    if (ft.includes('video')) contentType = 'Video';
    else if (ft.includes('blog')) contentType = 'Blog';
  }
  // Backup: đọc từ URL hoặc dropdown
  if (!contentType) {
    const url = window.location.href.toLowerCase();
    if (url.includes('video')) contentType = 'Video';
    else if (url.includes('blog')) contentType = 'Blog';
  }
  // Thử tìm dropdown filter
  if (!contentType) {
    const selects = document.querySelectorAll('select, [class*="dropdown"], [class*="Dropdown"]');
    selects.forEach(sel => {
      const t = (sel.innerText || sel.value || '').toLowerCase();
      if (t.includes('video')) contentType = 'Video';
      else if (t.includes('blog')) contentType = 'Blog';
    });
  }
  console.log('Content type detected:', contentType || '(unknown - sẽ dùng tên từ trang)');

  // Tìm tất cả link bài viết để xác định danh sách items
  // Cách 1: Tìm qua article tag
  let containers = Array.from(document.querySelectorAll('article'));

  // Cách 2: Tìm qua các div chứa date + title heading
  if (containers.length < 3) {
    const allDivs = Array.from(document.querySelectorAll('div, li, section'));
    containers = allDivs.filter(el => {
      const h = el.querySelector('h1,h2,h3,h4');
      const t = (el.innerText || '');
      return h && dateRe.test(t) && t.length < 3000 && el.children.length >= 2;
    }).filter((el, _, arr) =>
      !arr.some(other => other !== el && other.contains(el))
    );
  }

  // Cách 3: Tìm heading chứa date rồi tìm wrapper
  if (containers.length < 3) {
    // Tìm leaf elements có date pattern
    const dateEls = Array.from(document.querySelectorAll('*')).filter(el => {
      const t = (el.textContent || '').trim();
      return dateRe.test(t) && t.length < 80 && el.childElementCount === 0;
    });
    const wrappers = new Set();
    dateEls.forEach(el => {
      let p = el.parentElement;
      for (let i = 0; i < 6 && p; i++) {
        const h = p.querySelector('h1,h2,h3,h4');
        if (h) { wrappers.add(p); break; }
        p = p.parentElement;
      }
    });
    containers = [...wrappers].filter((el, _, arr) =>
      !arr.some(other => other !== el && other.contains(el))
    );
  }

  console.log('Containers found:', containers.length);

  containers.forEach((item, idx) => {
    const text = (item.innerText || '').trim();
    if (text.length < 10) return;

    // Title từ heading
    const heading = item.querySelector('h1,h2,h3,h4');
    const title = (heading?.innerText || '').trim().replace(/\s+/g, ' ');
    if (!title || title.length < 5) return;

    // Date
    const dateMatch = text.match(dateRe);
    const date = dateMatch ? dateMatch[0] : '';

    // Author: thường là text nhỏ gần date, hoặc tên trước date
    let author = '';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const dateLineIdx = lines.findIndex(l => dateRe.test(l));
    if (dateLineIdx > 0) {
      // Author thường là dòng ngay trước date
      const candidate = lines[dateLineIdx - 1];
      if (candidate && candidate.length < 50 && !candidate.startsWith('#')) {
        author = candidate;
      }
    }

    // Tags
    const tags = [...new Set(text.match(/#[\w-]+/g) || [])].join(', ');

    // URL
    const linkEl = heading?.closest('a') || item.querySelector('a[href*="/post/"],a[href*="/blog/"],a[href*="/video/"],a[href]');
    const url = linkEl?.href || '';

    // Type
    const type = contentType || (url.toLowerCase().includes('video') ? 'Video' : 'Blog');

    // Comments
    const commentMatch = text.match(/(\d+)\s*(?:comment|repl)/i);
    const comments = commentMatch ? commentMatch[1] : '';

    results.push([idx + 1, date, type, title, author, tags, comments, url]);
  });

  if (results.length === 0) {
    alert('Không tìm được bài nào. Kiểm tra đang ở trang All Content và đã scroll xuống hết chưa?');
    return;
  }

  const header = 'STT\tNgày\tLoại\tTiêu đề\tTác giả\tTags\tBình luận\tURL';
  const tsv = [header, ...results.map(r => r.join('\t'))].join('\n');

  navigator.clipboard.writeText(tsv)
    .then(() => alert('✅ Đã copy ' + results.length + ' bài!\nPaste vào Excel (Ctrl+V)'))
    .catch(() => {
      const w = window.open('', '_blank');
      w.document.write('<html><body><pre style="font:13px monospace;padding:20px;white-space:pre">' +
        tsv.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
        '</pre></body></html>');
      w.document.close();
    });

  console.log('[v3] All content:', results.length, 'bài');
  console.table(results.slice(0, 5).map(r => ({
    Ngày: r[1], Loại: r[2], 'Tiêu đề': r[3]
  })));
})();
