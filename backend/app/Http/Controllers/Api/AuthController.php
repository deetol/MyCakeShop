<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

final class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;
        return response()->json([
    'success' => true,
    'message' => 'Registration successful',
    'data' => [
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
        ],
        'token' => $token,
    ],
], 201);
    }

    public function login(LoginRequest $request): JsonResponse
{
$request->authenticate();

$user = Auth::user();
$user->tokens()->delete();
$token = $user->createToken('auth-token')->plainTextToken;

return response()->json([
    'success' => true,
    'message' => 'Login successful',
    'data' => [
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
        ],
        'token' => $token,
    ],
]);

}
public function me(): JsonResponse
{
    $user = Auth::user();

    return response()->json([
        'success' => true,
        'data' => [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ],
    ]);
}
public function logout(): JsonResponse
{
    Auth::user()->currentAccessToken()->delete();

    return response()->json([
        'success' => true,
        'message' => 'Logout successful',
    ]);
}
}