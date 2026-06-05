<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * RedirectIfAuthenticated — the "guest" middleware.
 *
 * This is the inverse of the 'auth' middleware. Where 'auth' kicks unauthenticated
 * users to the login page, this middleware kicks authenticated users AWAY from
 * guest-only pages (like the login and register forms) to avoid the confusion
 * of seeing a login screen when you're already logged in.
 *
 * Usage: Apply to routes with ->middleware('guest')
 * Laravel registers this alias automatically in bootstrap/app.php (Laravel 11+)
 * or in Kernel.php for earlier versions.
 */
final class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * If the user is already authenticated for any of the provided guards,
     * redirect them to the dashboard. Otherwise, pass the request through.
     *
     * The $guards parameter supports multi-guard applications where different
     * user types (admins, customers) authenticate against different providers.
     * Passing an empty array defaults to the default guard ('web').
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Already authenticated — no need to show the login page
                return redirect()->route('dashboard');
            }
        }

        // Not authenticated — let the request continue to the login view
        return $next($request);
    }
}
