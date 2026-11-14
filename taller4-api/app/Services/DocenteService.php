<?php

namespace App\Services;

use App\Models\Docente;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DocenteService
{
    public function crear(array $data): Docente
    {
        return DB::transaction(function () use ($data) {
            $docente = Docente::create($data);
            User::firstOrCreate(
                ['email' => $docente->correo],
                [
                    'name' => trim($docente->nombres.' '.$docente->apellidos),
                    'password' => $data['password'] ?? 'password123',
                    'rol' => 'DOCENTE',
                    'docente_id' => $docente->id,
                ]
            );

            return $docente;
        }, 3);
    }

    public function eliminar(Docente $docente): void
    {
        DB::transaction(function () use ($docente) {
            $actual = Docente::lockForUpdate()->findOrFail($docente->id);
            abort_if($actual->cursos()->exists(), 409, 'El docente tiene cursos asignados y no puede eliminarse');
            User::where('docente_id', $actual->id)->where('rol', 'DOCENTE')->delete();
            $actual->delete();
        }, 3);
    }
}
