<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
{
    return [
        'login' => ['required', 'string'],
        'password' => ['required', 'string'],
    ];
}

public function attributes(): array
{
    return [
        'login' => 'Email atau Nomor Telepon',
        'password' => 'Password',
    ];
}

    /**
     * @throws ValidationException
     */
   public function authenticate(): void
{
        $this->ensureIsNotRateLimited();
        $login = $this->input('login');
        $password = $this->input('password');

        $field = filter_var($login, FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'phone';

        if (! Auth::attempt([
            $field => $login,
            'password' => $password,
        ])) {

            RateLimiter::hit($this->throttleKey(), 60);

            throw ValidationException::withMessages([
                'login' => 'Email/nomor telepon atau password salah.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());

}
    /**
     * @throws ValidationException
     */
    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
    'login' => trans('auth.throttle', [
        'seconds' => $seconds,
        'minutes' => ceil($seconds / 60),
    ]),
]);
    }

    protected function throttleKey(): string
{
return Str::lower((string) $this->input('login')) . '|' . $this->ip();
}

}