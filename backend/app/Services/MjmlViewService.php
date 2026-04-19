<?php

namespace App\Services;

use Illuminate\Support\Facades\View;
use Spatie\Mjml\Mjml;

class MjmlViewService
{
    public function render(string $view, array $data = []): string
    {
        $mjml = View::make($view, $data)->render();

        try {
            return Mjml::new()->minify()->toHtml($mjml);
        } catch (\Throwable $e) {
            report($e);
            $code = e($data['otp_code'] ?? $data['code'] ?? '');

            return '<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:24px">'
                .'<p style="font-size:14px;color:#64748b">'.e(config('app.name')).'</p>'
                .'<p style="font-size:28px;font-weight:700;letter-spacing:0.2em">'.$code.'</p></body></html>';
        }
    }
}
