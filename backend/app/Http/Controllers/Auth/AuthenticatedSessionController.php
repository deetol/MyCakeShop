<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

/**
 * AuthenticatedSessionController handles the complete session lifecycle:
 * rendering the login form, processing credentials, and destroying the session.
 *
 * Following the single-responsibility principle, this controller does NOT
 * contain any validation logic — that lives in LoginRequest. The controller
 * only orchestrates: show form → process → redirect.
 */
final class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     *
     * The 'guest' middleware (configured in routes) prevents already-
     * authenticated users from seeing this page, so we don't need an
     * additional Auth::check() guard here.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     *
     * Laravel's FormRequest dependency injection means:
     * 1. The request is validated before this method body executes.
     * 2. $request->authenticate() then checks credentials and rate limits.
     * 3. Session regeneration prevents session fixation attacks — a critical
     *    security step that must happen AFTER authentication but BEFORE redirect.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // authenticate() either succeeds silently or throws a ValidationException
        // which Laravel automatically converts to a redirect-back with errors.
        $request->authenticate();

        // Regenerate the session ID to prevent session fixation attacks.
        // This is a critical security step: without it, an attacker who planted
        // a known session ID could hijack the newly authenticated session.
        $request->session()->regenerate();

        // Flash a success message that the dashboard can display.
        // Using session()->flash() ensures the message only lives for one request.
        session()->flash('success', 'Welcome back, ' . Auth::user()->name . '!');

        // intended() redirects to the originally-requested URL (if the user was
        // bounced to /login by the auth middleware), or falls back to /dashboard.
        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session (Logout).
     *
     * The three steps below are the canonical Laravel logout sequence.
     * Skipping any one of them can leave residual auth state in the session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // 1. Clear the auth guard's in-memory user state
        Auth::logout();

        // 2. Invalidate the session to remove all session data
        $request->session()->invalidate();

        // 3. Regenerate the CSRF token to prevent cross-site request forgery
        //    using the now-invalidated old token
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->with('status', 'You have been successfully logged out.');
    }
}
