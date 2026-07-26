<?php

return [
    'name' => env('APP_NAME', 'Fo-lory'),
    'frontend_url' => rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost:3000')), '/'),

    // Beta: kayıt olan kullanıcıların e-postası otomatik onaylanır (OTP akışı atlanır)
    'auto_verify_emails' => (bool) env('AUTO_VERIFY_EMAILS', false),
    'mail_brand_primary' => '#6366f1',
    'mail_brand_accent' => '#0ea5e9',
];
