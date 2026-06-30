<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kitabınıza Puan Verildi!</title>
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
        .rating-card {
            background-color: #f9f9f9;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        .stars {
            font-size: 32px;
            color: #ffc107;
            margin: 10px 0;
        }
        .rating-score {
            font-size: 24px;
            font-weight: bold;
            color: #2575fc;
            margin: 10px 0;
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
            <h1>{{ config('folory.name') }}</h1>
        </div>
        <div class="content">
            <p>Merhaba,</p>
            <p><strong>{{ $raterName }}</strong> adlı kullanıcı, <strong>"{{ $bookTitle }}"</strong> adlı kitabınıza <strong>{{ $score }}</strong> yıldız puan verdi!</p>
            
            <div class="rating-card">
                <div class="stars">
                    @for($i = 0; $i < $score; $i++)
                        ★
                    @endfor
                    @for($i = $score; $i < 5; $i++)
                        ☆
                    @endfor
                </div>
                <div class="rating-score">{{ $score }} / 5</div>
            </div>

            <p>Puanı görmek ve diğer yorumları okumak için aşağıdaki butona tıklayın:</p>
        </div>
        <div class="button-container">
            <a href="{{ $bookUrl }}" class="button">Kitabı Görüntüle</a>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('folory.name') }}. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>

