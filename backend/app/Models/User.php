<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

final class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass-assignable fields. Note that 'password' is deliberately excluded
     * so it can only be set explicitly, never mass-assigned from request data.
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
    ];

        /**
     * Fields hidden from JSON serialisation — important so passwords and
     * remember tokens never leak into API responses or logs.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Convenience helper to check if the authenticated user is an admin.
     * This keeps the role logic centralised in the model rather than
     * scattered across controllers and views.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
