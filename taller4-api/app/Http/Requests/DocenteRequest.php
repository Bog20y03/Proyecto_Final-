<?php

namespace App\Http\Requests;

class DocenteRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'documento' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:docentes,documento'],
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'correo' => ['required', 'email', 'max:150', 'unique:docentes,correo'],
            'departamento' => ['required', 'string', 'max:150'],
        ];
    }
}
