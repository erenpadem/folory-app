<?php

namespace App\Http\Requests\Page;

use Illuminate\Foundation\Http\FormRequest;

class StorePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Editor bazen JSON (TipTap) nesnesi gönderir; `string` kuralı yalnızca PHP string kabul eder.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('content')) {
            return;
        }
        $content = $this->input('content');
        if ($content === null) {
            return;
        }
        if (is_string($content)) {
            return;
        }
        if (is_array($content) || is_object($content)) {
            $encoded = json_encode($content, JSON_UNESCAPED_UNICODE);
            $this->merge(['content' => $encoded === false ? '' : $encoded]);

            return;
        }
        $this->merge(['content' => (string) $content]);
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string',
            'order' => 'sometimes|integer|min:0',
        ];
    }
}

