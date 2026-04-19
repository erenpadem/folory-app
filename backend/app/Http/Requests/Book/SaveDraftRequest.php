<?php

namespace App\Http\Requests\Book;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Empty string from JSON should behave like "no category" (nullable|exists fails on "").
     * Sayfa içeriği: JSON bazen sayı/boolean/nesne gönderir; `string` kuralı yalnızca PHP string kabul eder.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('category_id') && $this->input('category_id') === '') {
            $this->merge(['category_id' => null]);
        }

        $sections = $this->input('sections');
        if (! is_array($sections)) {
            return;
        }

        foreach ($sections as $si => $section) {
            if (! isset($section['pages']) || ! is_array($section['pages'])) {
                continue;
            }
            foreach ($section['pages'] as $pi => $page) {
                if (! is_array($page) || ! array_key_exists('content', $page)) {
                    continue;
                }
                $content = $page['content'];
                if ($content === null) {
                    continue;
                }
                if (is_string($content)) {
                    continue;
                }
                if (is_array($content) || is_object($content)) {
                    $encoded = json_encode($content, JSON_UNESCAPED_UNICODE);
                    $sections[$si]['pages'][$pi]['content'] = $encoded === false ? '' : $encoded;

                    continue;
                }
                // bool, int, float — Laravel `string` kuralı bunları reddeder
                $sections[$si]['pages'][$pi]['content'] = (string) $content;
            }
        }

        $this->merge(['sections' => $sections]);
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'cover' => 'nullable|string|max:16777215',
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'is_adult' => 'boolean',
            'sections' => 'nullable|array',
            'sections.*.id' => 'nullable|integer',
            'sections.*.title' => 'required_with:sections|string|max:255',
            'sections.*.order' => 'nullable|integer|min:0',
            'sections.*.is_visible' => 'boolean',
            'sections.*.pages' => 'nullable|array',
            'sections.*.pages.*.id' => 'nullable|integer',
            'sections.*.pages.*.content' => 'nullable|string',
            'sections.*.pages.*.order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'title.string' => 'Başlık metin olmalıdır.',
            'title.max' => 'Başlık en fazla 255 karakter olabilir.',
            'short_description.string' => 'Kısa açıklama metin olmalıdır.',
            'short_description.max' => 'Kısa açıklama en fazla 500 karakter olabilir.',
            'cover.string' => 'Kapak alanı metin (URL veya veri) olmalıdır.',
            'category_id.required' => 'Kategori seçimi zorunludur.',
            'category_id.exists' => 'Seçilen kategori bulunamadı veya geçersiz.',
            'sections.*.title.required_with' => 'Bölüm eklerken başlık zorunludur.',
            'sections.*.title.string' => 'Bölüm başlığı metin olmalıdır.',
            'sections.*.pages.*.content.string' => 'Sayfa içeriği metin (ör. HTML) olmalıdır; sayı veya ham nesne olarak gönderilemez.',
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'başlık',
            'short_description' => 'kısa açıklama',
            'cover' => 'kapak',
            'sections.*.title' => 'bölüm başlığı',
            'sections.*.pages.*.content' => 'sayfa içeriği',
        ];
    }
}

