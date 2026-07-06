<?php

namespace App\Support;

final class PageContent
{
    public static function hasWrittenContent(?string $html): bool
    {
        if ($html === null || trim($html) === '') {
            return false;
        }

        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text) ?? '';

        return trim($text) !== '';
    }
}
