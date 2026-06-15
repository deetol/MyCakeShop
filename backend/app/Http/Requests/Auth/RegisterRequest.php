<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],

        'email' => [
            'nullable',
            'email',
            'max:255',
            'unique:users,email',
            'required_without:phone',
        ],

        'phone' => [
            'nullable',
            'string',
            'max:20',
            'unique:users,phone',
            'required_without:email',
        ],

        'password' => [
            'required',
            'string',
            'min:8',
            'confirmed',
        ],
    ];
}
public function messages(): array
{
    return [
        'email.required_without' => 'Email atau nomor telepon wajib diisi.',
        'phone.required_without' => 'Email atau nomor telepon wajib diisi.',
        'password.confirmed' => 'Konfirmasi password tidak cocok.',
    ];
}
}
