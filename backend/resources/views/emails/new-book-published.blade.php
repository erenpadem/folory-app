<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yeni Kitap Yayınlandı</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        .book-card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .book-cover {
            width: 100%;
            height: 300px;
            object-fit: cover;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .book-info {
            padding: 24px;
        }
        .book-title {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        .book-author {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 16px;
        }
        .book-description {
            font-size: 15px;
            color: #4b5563;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            opacity: 0.9;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Folory</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Merhaba,
            </div>
            
            <p>
                Takip ettiğiniz yazar <strong>{{ $authorName }}</strong> yeni bir kitap yayınladı!
            </p>
            
            <div class="book-card">
                @if($bookCover)
                    <img src="{{ $bookCover }}" alt="{{ $bookTitle }}" class="book-cover">
                @else
                    <div class="book-cover"></div>
                @endif
                <div class="book-info">
                    <div class="book-title">{{ $bookTitle }}</div>
                    <div class="book-author">{{ $authorName }}</div>
                    @if($bookDescription)
                        <div class="book-description">{{ \Illuminate\Support\Str::limit($bookDescription, 150) }}</div>
                    @endif
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $bookUrl }}" class="button">Kitabı Oku</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Bu e-posta Folory tarafından gönderilmiştir.</p>
            <p>Bildirimleri yönetmek için <a href="{{ config('app.url') }}/settings" style="color: #667eea;">ayarlar</a> sayfasını ziyaret edin.</p>
        </div>
    </div>
</body>
</html>

