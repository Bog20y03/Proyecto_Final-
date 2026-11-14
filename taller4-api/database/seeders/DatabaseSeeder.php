<?php

namespace Database\Seeders;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Datos base que usa la colección de Postman (contraseña de todos: password123).
     */
    public function run(): void
    {
        $docente = Docente::firstOrCreate(
            ['correo' => 'carlos.rojas@ut.edu.co'],
            ['nombres' => 'Carlos', 'apellidos' => 'Rojas', 'departamento' => 'Ingeniería de Sistemas']
        );

        $estudiante = Estudiante::firstOrCreate(
            ['documento' => '1000000001'],
            [
                'nombres' => 'Ana',
                'apellidos' => 'Martínez',
                'correo' => 'ana.martinez@ut.edu.co',
                'programa' => 'Ingeniería de Sistemas',
            ]
        );

        User::updateOrCreate(['email' => 'admin@ut.edu.co'], [
            'name' => 'Administrador', 'password' => 'password123', 'rol' => 'ADMIN',
        ]);

        User::updateOrCreate(['email' => 'carlos.rojas@ut.edu.co'], [
            'name' => 'Carlos Rojas', 'password' => 'password123', 'rol' => 'DOCENTE',
            'docente_id' => $docente->id,
        ]);

        User::updateOrCreate(['email' => 'ana.martinez@ut.edu.co'], [
            'name' => 'Ana Martínez', 'password' => 'password123', 'rol' => 'ESTUDIANTE',
            'estudiante_id' => $estudiante->id,
        ]);

        foreach ([
            ['codigo' => 'ARQ-301', 'nombre' => 'Arquitectura de Software', 'creditos' => 3, 'periodo' => '2026-2', 'cupo_maximo' => 35],
            ['codigo' => 'IS-101', 'nombre' => 'Ingeniería de Software', 'creditos' => 3, 'periodo' => '2026-2', 'cupo_maximo' => 30],
            ['codigo' => 'BD-202', 'nombre' => 'Bases de Datos Avanzadas', 'creditos' => 4, 'periodo' => '2026-2', 'cupo_maximo' => 25],
        ] as $curso) {
            Curso::firstOrCreate(
                ['codigo' => $curso['codigo']],
                [
                    'nombre' => $curso['nombre'],
                    'creditos' => $curso['creditos'],
                    'periodo' => $curso['periodo'],
                    'cupo_maximo' => $curso['cupo_maximo'],
                    'cupo_disponible' => $curso['cupo_maximo'],
                    'estado' => 'ABIERTO',
                    'docente_id' => $docente->id,
                ]
            );
        }
    }
}
