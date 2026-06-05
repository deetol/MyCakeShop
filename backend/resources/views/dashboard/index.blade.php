@extends('layouts.app')

@section('title', 'Dashboard — ' . config('app.name'))

@section('content')
<div class="min-h-screen bg-gray-50">

    {{-- Navbar --}}
    <nav class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <span class="font-bold text-gray-900 text-lg">
                    {{ config('app.name', 'Laravel App') }}
                </span>
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-600">{{ $user->name }}</span>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit"
                                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm
                                       font-medium text-gray-600 hover:bg-red-50 hover:text-red-600
                                       transition focus:outline-none focus:ring-2 focus:ring-red-500">
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    {{-- Content --}}
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        @if (session('success'))
            <div class="mb-8 rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-700">
                {{ session('success') }}
            </div>
        @endif

        <h2 class="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p class="text-sm text-gray-500 mb-8">Welcome back! Here's your account overview.</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {{-- Account Card --}}
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account</p>
                <p class="text-lg font-bold text-gray-900">{{ $user->name }}</p>
                <p class="text-xs text-gray-500">{{ $user->email }}</p>
            </div>

            {{-- Role Card --}}
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                    {{ $user->isAdmin() ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700' }}">
                    {{ ucfirst($user->role) }}
                </span>
            </div>

            {{-- Member Since Card --}}
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                <p class="text-lg font-bold text-gray-900">{{ $user->created_at->format('M d, Y') }}</p>
                <p class="text-xs text-gray-500">{{ $user->created_at->diffForHumans() }}</p>
            </div>

        </div>

        @if ($user->isAdmin())
            <div class="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-6">
                <h3 class="text-sm font-bold text-purple-800">Admin Access Enabled</h3>
                <p class="mt-1 text-sm text-purple-700">You have administrator privileges.</p>
            </div>
        @endif

    </main>
</div>
@endsection