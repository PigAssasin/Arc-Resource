// ============================================================
// ARC HOUSE SCRAPER - Chạy từng script trong Console (F12)
// ============================================================

// ============================================================
// SCRIPT 1: LẤY LỊCH SỬ CỦA BẠN (trang My Contributions)
// Mở trang My Contributions rồi paste đoạn này vào Console
// ============================================================

(function scrapeMyContributions() {
  const results = [];

  // Thử nhiều selector khác nhau để tìm các item trong danh sách
  const items = document.querySelectorAll(
    '[class*="reward"], [class*="contribution"], [class*="activity"], ' +
    '[class*="RewardItem"], [class*="ActivityItem"], ' +
    'li[class*="item"], div[class*="list-item"]'
  );

  // Fallback: tìm theo cấu trúc text "+◇ số"
  const allDivs = Array.from(document.querySelectorAll('div, li'));

  const pointPattern = /\+\s*[◇♦]?\s*\d+/;
  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+(?:st|nd|rd|th)?,\s*\d{4}/i;

  let targetItems = items.length > 0 ? Array.from(items) : [];

  // Nếu không tìm được theo class, tìm theo pattern điểm
  if (targetItems.length === 0) {
    targetItems = allDivs.filter(div => {
      const text = div.innerText || '';
      return pointPattern.test(text) && datePattern.test(text) &&
             text.split('\n').length < 10; // Tránh container lớn
    });
  }

  if (targetItems.length === 0) {
    // Fallback cuối: tìm tất cả row có cấu trúc giống nhau
    const rows = document.querySelectorAll('[class*="row"], [class*="card"], [class*="item"]');
    targetItems = Array.from(rows).filter(el => {
      const t = el.innerText || '';
      return (t.includes('Watch') || t.includes('Read') || t.includes('Daily')) &&
             (t.includes('2025') || t.includes('2026'));
    });
  }

  targetItems.forEach(item => {
    const text = (item.innerText || '').trim();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    let type = '', date = '', title = '', points = '';

    // Tìm type
    if (text.includes('Watch a Video')) type = 'Watch a Video';
    else if (text.includes('Read Content')) type = 'Read Content';
    else if (text.includes('Daily Active')) type = 'Daily Active';
    else type = lines[0] || '';

    // Tìm date
    const dateMatch = text.match(datePattern);
    if (dateMatch) date = dateMatch[0];

    // Tìm điểm
    const pointMatch = text.match(/\+\s*[◇♦]?\s*(\d+)/);
    if (pointMatch) points = pointMatch[1];

    // Tìm title (phần còn lại sau dấu ·)
    const titleMatch = text.match(/·\s*(.+?)(?:\n|\+|$)/);
    if (titleMatch) title = titleMatch[1].trim();
    else {
      // Title là dòng dài nhất không phải date/type/points
      const longLines = lines.filter(l =>
        l.length > 20 && !datePattern.test(l) &&
        !l.match(/Watch|Read|Daily|Active|Video|Content|x\d/) &&
        !l.match(/^\+/)
      );
      title = longLines[0] || '';
    }

    if (type || date || title) {
      results.push({ type, date, title, points });
    }
  });

  // Xuất dạng TSV cho Excel
  if (results.length === 0) {
    console.warn('Không tìm được item nào. Thử chạy scrapeRaw() bên dưới.');
    return;
  }

  const header = 'Loại\tNgày\tTiêu đề\tĐiểm';
  const rows = results.map(r => `${r.type}\t${r.date}\t${r.title}\t${r.points}`);
  const tsv = [header, ...rows].join('\n');

  console.log('=== LỊCH SỬ CỦA BẠN ===');
  console.log(`Tìm được ${results.length} hoạt động\n`);
  console.log(tsv);

  // Copy vào clipboard
  navigator.clipboard.writeText(tsv).then(() => {
    console.log('\n✅ Đã copy vào clipboard! Paste vào Excel (Ctrl+V)');
  }).catch(() => {
    console.log('\n⚠️ Copy thủ công: Bôi đen text ở trên và Ctrl+C');
  });

  return results;
})();


// ============================================================
// SCRIPT 2: LẤY TOÀN BỘ VIDEO & BLOG (trang All Content)
// Mở trang All Content rồi paste đoạn này vào Console
// SCROLL XUỐNG CUỐI TRANG TRƯỚC KHI CHẠY (để load hết content)
// ============================================================

(async function scrapeAllContent() {
  console.log('Đang quét toàn bộ content...');

  const results = [];

  // Tìm các bài post/card
  const selectors = [
    'article', '[class*="post"]', '[class*="Post"]',
    '[class*="content-item"]', '[class*="ContentItem"]',
    '[class*="card"]', '[class*="Card"]',
    '[class*="feed-item"]', '[class*="FeedItem"]'
  ];

  let items = [];
  for (const sel of selectors) {
    const found = document.querySelectorAll(sel);
    if (found.length > 2) {
      items = Array.from(found);
      console.log(`Dùng selector: ${sel}, tìm được ${items.length} items`);
      break;
    }
  }

  // Fallback: tìm theo cấu trúc có title và date
  if (items.length === 0) {
    const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+(?:st|nd|rd|th)?,\s*\d{4}/i;
    const allEls = Array.from(document.querySelectorAll('div, li, section'));
    items = allEls.filter(el => {
      const t = el.innerText || '';
      const childCount = el.children.length;
      return datePattern.test(t) && t.length > 50 && t.length < 1000 &&
             childCount >= 2 && childCount <= 15;
    });
    // Loại bỏ elements cha/con của nhau
    items = items.filter((el, i) =>
      !items.some((other, j) => i !== j && other.contains(el))
    );
    console.log(`Fallback: tìm được ${items.length} items`);
  }

  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+(?:st|nd|rd|th)?,\s*\d{4}/i;

  items.forEach((item, idx) => {
    const text = (item.innerText || '').trim();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Date
    const dateMatch = text.match(datePattern);
    const date = dateMatch ? dateMatch[0] : '';

    // Type: tìm trong text hoặc tìm thẻ video/blog
    let type = '';
    if (text.toLowerCase().includes('video')) type = 'Video';
    else if (text.toLowerCase().includes('blog') || text.toLowerCase().includes('whitepaper')) type = 'Blog';

    // Kiểm tra có thẻ video filter không
    const videoEl = item.querySelector('video, [class*="video"], [class*="Video"]');
    if (videoEl) type = 'Video';

    // Title: tìm thẻ h1/h2/h3/h4 hoặc dòng dài nhất
    const headingEl = item.querySelector('h1, h2, h3, h4, [class*="title"], [class*="Title"]');
    let title = '';
    if (headingEl) {
      title = (headingEl.innerText || '').trim();
    } else {
      // Dòng dài nhất (loại trừ date và author)
      const candidates = lines.filter(l =>
        l.length > 15 && !datePattern.test(l) &&
        !l.match(/^#/) && !l.match(/^\d+$/)
      );
      title = candidates[0] || lines[0] || '';
    }

    // Author
    let author = '';
    const authorEl = item.querySelector('[class*="author"], [class*="Author"], [class*="user"], [class*="User"]');
    if (authorEl) author = (authorEl.innerText || '').trim().split('\n')[0];

    // Tags: tìm #hashtag
    const tags = (text.match(/#[\w-]+/g) || []).join(', ');

    // Comments
    const commentMatch = text.match(/(\d+)\s*(?:comments?|💬)/i);
    const comments = commentMatch ? commentMatch[1] : '';

    if (title && title.length > 5) {
      results.push({ stt: idx + 1, date, type, title, author, tags, comments });
    }
  });

  // Xuất TSV
  const header = 'STT\tNgày\tLoại\tTiêu đề\tTác giả\tTags\tBình luận';
  const rows = results.map(r =>
    `${r.stt}\t${r.date}\t${r.type}\t${r.title}\t${r.author}\t${r.tags}\t${r.comments}`
  );
  const tsv = [header, ...rows].join('\n');

  console.log('\n=== TOÀN BỘ CONTENT ===');
  console.log(`Tìm được ${results.length} bài\n`);
  console.log(tsv);

  navigator.clipboard.writeText(tsv).then(() => {
    console.log('\n✅ Đã copy vào clipboard! Paste vào Excel (Ctrl+V)');
  }).catch(() => {
    console.log('\n⚠️ Copy thủ công đoạn text ở trên');
  });

  return results;
})();
