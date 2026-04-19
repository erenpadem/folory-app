<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yorumunuz Beğenildi!</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 15px;
        }
        .like-card {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        .like-icon {
            font-size: 48px;
            color: #ff5722;
            margin: 10px 0;
        }
        .comment-card {
            background-color: #f9f9f9;
            border-left: 4px solid #2575fc;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .comment-card p {
            margin: 5px 0;
        }
        .button-container {
            text-align: center;
            padding: 20px 30px 30px;
        }
        .button {
            display: inline-block;
            background-color: #2575fc;
            color: #ffffff;
            padding: 12px 25px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #1a5bbd;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999999;
            background-color: #f0f0f0;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Folory</h1>
        </div>
        <div class="content">
            <p>Merhaba,</p>
            <p><strong>{{ $likerName }}</strong> adlı kullanıcı, <strong>"{{ $bookTitle }}"</strong> adlı kitaptaki yorumunuzu beğendi!</p>
            
            <div class="like-card">
                <div class="like-icon">❤️</div>
                <p style="font-weight: bold; color: #ff5722; margin: 10px 0;">Yorumunuz beğenildi!</p>
            </div>

            <div class="comment-card">
                <p style="font-weight: bold; color: #2575fc;">Sizin yorumunuz:</p>
                <p>"{{ \Illuminate\Support\Str::limit($commentContent, 150) }}"</p>
            </div>

            <p>Yorumu görmek için aşağıdaki butona tıklayın:</p>
        </div>
        <div class="button-container">
            <a href="{{ $bookUrl }}" class="button">Yorumu Gör</a>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Folory. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>

