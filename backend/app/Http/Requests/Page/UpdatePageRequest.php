<?php

namespace App\Http\Requests\Page;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

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
            'content' => 'sometimes|string',
            'order' => 'sometimes|integer|min:0',
        ];
    }
}

