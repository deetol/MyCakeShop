<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

/**
 * DashboardController serves the protected main area of the application.
 *
 * This controller is intentionally minimal — its only responsibility is to
 * pass the authenticated user's data to the view. Business-specific dashboard
 * data (stats, charts, etc.) would be added here as the app grows.
 */
final class DashboardController extends Controller
{
    /**
     * Display the dashboard view.
     *
     * Access to this method is already restricted by the 'auth' middleware
     * configured in routes/web.php, so Auth::user() is always non-null here.
     * We type-hint the Request even though it's unused to keep the signature
     * consistent and allow future middleware/request injection if needed.
     */
    public function index(Request $request): View
    {
        return view('dashboard.index', [
            'user' => Auth::user(),
        ]);
    }
}
