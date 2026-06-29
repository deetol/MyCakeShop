<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\EnsureTokenIsValid;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| Root Redirect
|--------------------------------------------------------------------------
| Visiting the app root sends users to the dashboard; if they're not logged
| in, the 'auth' middleware on the dashboard route will then redirect them
| to /login automatically. This avoids a dead "404 Not Found" at the root.
*/
Route::get('/', fn () => redirect()->route('dashboard'));

/*
|--------------------------------------------------------------------------
| Guest Routes (Login / Logout)
|--------------------------------------------------------------------------
| These routes are wrapped in the 'guest' middleware so authenticated users
| can't see the login form — they're redirected straight to the dashboard.
|
| Route::get  'login'  → shows the login form          (named: 'login')
| Route::post 'login'  → processes submitted form       (named: 'login.store')
| Route::post 'logout' → destroys the session           (named: 'logout')
|
| Note: The logout route is POST (not GET) deliberately. A GET logout would
| allow malicious sites to log your users out with a simple <img> tag.
| Using POST + CSRF token makes this impossible.
*/
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->name('login.store');
});

// Logout sits outside the 'guest' group because only authenticated users
// can log out, but it doesn't need the full 'auth' group either.
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Dashboard & Protected Pages)
|--------------------------------------------------------------------------
| Everything inside this group requires a valid session. Unauthenticated
| requests are redirected to the named 'login' route automatically by
| Laravel's Authenticate middleware.
|
| As the application grows, add new protected controllers inside this group
| (e.g., profile settings, admin panels) to inherit the auth requirement.
*/
Route::middleware('auth')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
});

Route::middleware(['auth', 'role:admin'])
    ->get('/admin', function () {
        return 'Admin Panel';
    });

// Fallback storage route to serve files directly from app/public
Route::get('/storage-file/{path}', function ($path) {
    $filePath = 'public/' . $path;
    if (!Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
        abort(404);
    }
    return response()->file(storage_path('app/' . $filePath));
})->where('path', '.*');

Route::get('/storage/{path}', function ($path) {
    $filePath = 'public/' . $path;
    if (!Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
        abort(404);
    }
    return response()->file(storage_path('app/' . $filePath));
})->where('path', '.*');