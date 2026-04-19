<?php

namespace App\Http\Requests\Book;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('category_id') && $this->input('category_id') === '') {
            $this->merge(['category_id' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'cover' => 'nullable|string|max:16777215',
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'is_adult' => 'boolean',
            'is_draft' => 'boolean',
            'is_published' => 'boolean',
        ];
    }
}

