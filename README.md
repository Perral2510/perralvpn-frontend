# DucAnhVPN Frontend

Frontend tĩnh của DucAnhVPN, dùng để deploy trên Render Static Site hoặc bất kỳ CDN nào. Backend không nằm trong repository này.

## Render Static Site

Tạo một Static Site từ repository `Perral2510/ducanhvpn-frontend` với các thiết lập:

- Build command: để trống hoặc `echo "No build required"`
- Publish directory: `.`
- Branch: `main`

Sau khi deploy, thêm custom domain:

```text
app.perral.dpdns.org
```

File `frontend-config.js` đã trỏ API tới:

```text
https://api.perral.dpdns.org/api
```

Nếu API đổi domain, sửa `frontend-config.js` trước khi deploy lại.

## Chạy local

Có thể chạy frontend bằng bất kỳ static server nào, ví dụ:

```bash
python3 -m http.server 8080
```

Mở `http://127.0.0.1:8080` trong trình duyệt. API production vẫn được gọi tới Cloudflare Tunnel trừ khi sửa `frontend-config.js`.

## Bảo mật

Repository này không chứa backend, `.env`, SQLite database, private key hoặc Tunnel token. CORS và session cookie được backend kiểm soát thông qua origin:

```text
https://app.perral.dpdns.org
```
