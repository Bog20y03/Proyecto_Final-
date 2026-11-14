<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Services\TokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/v1/auth/login
    public function login(LoginRequest $request, TokenService $tokens)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            abort(401, 'Credenciales inválidas');
        }

        return response()->json($tokens->emitir($user));
    }

    // POST /api/v1/auth/password
    public function cambiarPassword(Request $request)
    {
        $data = $request->validate([
            'passwordActual' => ['required', 'string'],
            'passwordNueva' => ['required', 'string', 'min:6', 'max:100'],
            'passwordConfirmacion' => ['required', 'string', 'same:passwordNueva'],
        ]);

        $user = $request->user();
        if (! $user || ! Hash::check($data['passwordActual'], $user->password)) {
            throw ValidationException::withMessages([
                'passwordActual' => ['La contraseña actual no es correcta'],
            ]);
        }

        $user->password = $data['passwordNueva'];
        $user->save();

        DB::table('audit_events')->insert([
            'action' => 'users.password_updated',
            'resource' => 'users',
            'resource_id' => $user->id,
            'actor_id' => $user->id,
            'correlation_id' => $request->attributes->get('correlation_id'),
            'properties' => json_encode([]),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }
}
