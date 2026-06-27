<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = User::where('role', 'customer')
            ->withCount('orders')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%$q%")
                   ->orWhere('email', 'like', "%$q%");
            });
        }

        $perPage = min((int) $request->get('per_page', 15), 50);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'users' => collect($users->items())->map(fn($u) => [
                    'id'          => $u->id,
                    'name'        => $u->name,
                    'email'       => $u->email,
                    'phone'       => $u->phone,
                    'orders_count'=> $u->orders_count,
                    'created_at'  => $u->created_at,
                ]),
                'pagination' => [
                    'total'        => $users->total(),
                    'per_page'     => $users->perPage(),
                    'current_page' => $users->currentPage(),
                    'last_page'    => $users->lastPage(),
                ],
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->load(['orders' => fn($q) => $q->latest()->limit(5)]);
        return $this->successResponse([
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'phone'        => $user->phone,
            'orders_count' => $user->orders()->count(),
            'total_spent'  => $user->orders()->where('payment_status', 'paid')->sum('total'),
            'recent_orders'=> $user->orders->map(fn($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number,
                'status'         => $o->status,
                'payment_status' => $o->payment_status,
                'total'          => $o->total,
                'created_at'     => $o->created_at,
            ]),
            'created_at' => $user->created_at,
        ], 'User retrieved');
    }
}
