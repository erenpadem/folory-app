<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yorumunuza Cevap Verildi</title>
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
        .message {
            background-color: #f9fafb;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .message p {
            margin-bottom: 10px;
        }
        .book-info {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .book-title {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
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
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 20px 0;
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
                <strong>{{ $replierName }}</strong> yorumunuza cevap verdi.
            </p>
            
            <div class="book-info">
                <div class="book-title">{{ $bookTitle }}</div>
            </div>
            
            <div class="message">
                <p><strong>Sizin yorumunuz:</strong></p>
                <p>{{ $commentContent }}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="message">
                <p><strong>{{ $replierName }}'ın cevabı:</strong></p>
                <p>{{ $replyContent }}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $bookUrl }}" class="button">Kitabı Görüntüle</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Bu e-posta Folory tarafından gönderilmiştir.</p>
            <p>Bildirimleri yönetmek için <a href="{{ config('app.url') }}/settings" style="color: #667eea;">ayarlar</a> sayfasını ziyaret edin.</p>
        </div>
    </div>
</body>
</html>

