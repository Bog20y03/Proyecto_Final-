<?php

namespace App\Services;

use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EstudianteService
{
    public function crear(array $data): Estudiante
    {
        return DB::transaction(function () use ($data) {
            $estudiante = Estudiante::create($data)->refresh();
            User::firstOrCreate(
                ['email' => $estudiante->correo],
                [
                    'name' => trim($estudiante->nombres.' '.$estudiante->apellidos),
                    'password' => $data['password'] ?? 'password123',
                    'rol' => 'ESTUDIANTE',
                    'estudiante_id' => $estudiante->id,
                ]
            );

            return $estudiante;
        }, 3);
    }

    public function eliminar(Estudiante $estudiante): void
    {
        DB::transaction(function () use ($estudiante) {
            $actual = Estudiante::lockForUpdate()->findOrFail($estudiante->id);
            abort_if($actual->matriculas()->where('estado', 'ACTIVA')->exists(), 409, 'El estudiante tiene matrículas activas y no puede eliminarse');
            abort_if($actual->matriculas()->whereHas('pagos')->exists(), 409, 'El estudiante tiene historial financiero y no puede eliminarse');
            $actual->matriculas()->delete();
            User::where('estudiante_id', $actual->id)->where('rol', 'ESTUDIANTE')->delete();
            $actual->delete();
        }, 3);
    }
}
