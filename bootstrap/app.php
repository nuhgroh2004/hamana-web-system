<?php

use App\Http\Middleware\EnsureModuleAccess;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'module.access' => EnsureModuleAccess::class,
        ]);

        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo('/dashboard');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Untuk XHR / Livewire request: kembalikan 401 JSON agar JS bisa
        // mendeteksi sesi habis dan mengarahkan pengguna ke halaman login,
        // alih-alih menerima HTML redirect yang membuat halaman beku.
        $exceptions->render(function (
            \Illuminate\Auth\AuthenticationException $e,
            \Illuminate\Http\Request $request,
        ) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });

        // Jika form biasa (mis. login) terlanjur mengirim token lama (419),
        // arahkan kembali ke halaman sebelumnya tanpa layar 419 Page Expired.
        $exceptions->render(function (
            \Illuminate\Session\TokenMismatchException $e,
            \Illuminate\Http\Request $request,
        ) {
            if (! $request->expectsJson() && ! $request->ajax()) {
                return back()
                    ->withInput($request->except('password', '_token'))
                    ->withErrors(['email' => 'Sesi halaman diperbarui. Silakan coba lagi.']);
            }
        });
    })->create();
