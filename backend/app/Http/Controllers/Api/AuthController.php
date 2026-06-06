<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

final class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();


        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id'    => Auth::user()->id,
                'name'  => Auth::user()->name,
                'email' => Auth::user()->email,
                'role'  => Auth::user()->role,
            ],
        ]);
    }
}