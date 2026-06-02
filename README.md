# Arc House Scraper

Scripts để cào data từ [community.arc.io](https://community.arc.io) và tạo file Excel để đối chiếu.

## Browser Scripts (chạy trong Console F12)

| File | Mục đích |
|------|----------|
| `archouse_history.js` | Cào lịch sử cá nhân (My Contributions) |
| `arc_video.js` | Cào toàn bộ Video (filter Video) |
| `arc_blog.js` | Cào toàn bộ Blog (filter Blog) |
| `arc_resource.js` | Cào toàn bộ Resource (filter Resource) |
| `arc_external_content.js` | Cào External Content (filter External Content) |

## Cách dùng Browser Scripts

1. Mở trang tương ứng trên Arc House
2. Chọn filter phù hợp
3. Nhấn F12 → Console
4. Copy toàn bộ script → Paste → Enter
5. Script tự scroll + thu thập → hiện overlay Copy
6. Paste vào Excel

## Python Scripts (tạo file Excel)

```bash
pip install openpyxl
python create_excel.py        # Tạo sheet Lịch sử
python add_video_sheet.py     # Thêm sheet Video
python add_blog_sheet.py      # Thêm sheet Blog
python add_resource_sheet.py  # Thêm sheet Resource
python add_external_sheet.py  # Thêm sheet External Content
```

## Output

- `ArcHouse_LichSu.xlsx` — Lịch sử xem/đọc của bạn
- `ArcHouse_Content.xlsx` — Toàn bộ content trên web (4 sheet)
