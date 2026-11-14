<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConsultaRequest;
use App\Http\Requests\CursoRequest;
use App\Http\Resources\CursoResource;
use App\Models\Curso;
use App\Services\CursoService;
use App\Support\CursoCache;
use App\Support\CursoListaPdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CursoController extends Controller
{
    // GET /api/v1/cursos?page&limit&periodo&docenteId&estado
    public function index(ConsultaRequest $request)
    {
        $limit = min(max((int) $request->query('limit', 15), 1), 100);

        // sort=campo,asc|desc  (por defecto nombre,asc)
        $columnas = ['nombre' => 'nombre', 'codigo' => 'codigo', 'creditos' => 'creditos',
            'periodo' => 'periodo', 'estado' => 'estado', 'cupoMaximo' => 'cupo_maximo',
            'cupoDisponible' => 'cupo_disponible'];
        [$campoReq, $dirReq] = array_pad(explode(',', (string) $request->query('sort', 'nombre,asc')), 2, 'asc');
        $campo = $columnas[$campoReq] ?? 'nombre';
        $dir = strtolower($dirReq) === 'desc' ? 'desc' : 'asc';

        $key = 'oferta:'.CursoCache::version().':'.hash('sha256', $request->root().json_encode($request->validated()));
        $cursos = Cache::remember($key, 60, fn () => Curso::with('docente')
            ->when($request->query('periodo'), fn ($q, $v) => $q->where('periodo', $v))
            ->when($request->query('docenteId'), fn ($q, $v) => $q->where('docente_id', $v))
            ->when($request->query('estado'), fn ($q, $v) => $q->where('estado', $v))
            ->orderBy($campo, $dir)
            ->paginate($limit));

        return CursoResource::collection($cursos);
    }

    // GET /api/v1/cursos/{id}
    public function show(Curso $curso)
    {
        return new CursoResource($curso->load('docente'));
    }

    public function store(CursoRequest $request, CursoService $service): JsonResponse
    {
        $curso = $service->guardar($request->validated());

        return (new CursoResource($curso->load('docente')))->response()->setStatusCode(201)
            ->header('Location', url("/api/v1/cursos/{$curso->id}"));
    }

    public function update(CursoRequest $request, Curso $curso, CursoService $service)
    {
        return new CursoResource($service->guardar($request->validated(), $curso)->load('docente'));
    }

    public function patch(CursoRequest $request, Curso $curso, CursoService $service)
    {
        return $this->update($request, $curso, $service);
    }

    public function destroy(Curso $curso, CursoService $service)
    {
        $service->eliminar($curso);

        return response()->noContent();
    }

    // GET /api/v1/cursos/{curso}/lista-pdf
    public function listaPdf(Request $request, Curso $curso)
    {
        $user = $request->user();
        if ($user->rol === 'DOCENTE' && (int) $user->docente_id !== (int) $curso->docente_id) {
            abort(403, 'Solo puedes descargar la lista de tus cursos asignados');
        }

        $curso->load('docente');
        $matriculas = $curso->matriculas()
            ->with('estudiante')
            ->where('estado', 'ACTIVA')
            ->get()
            ->sortBy(fn ($m) => ($m->estudiante?->apellidos ?? '').' '.($m->estudiante?->nombres ?? ''))
            ->values();

        $pdf = CursoListaPdf::generar($curso, $matriculas);
        $filename = 'Lista_Estudiantes_'.preg_replace('/[^A-Za-z0-9_-]/', '_', $curso->codigo.'_'.$curso->periodo).'.pdf';

        DB::table('audit_events')->insert([
            'action' => 'cursos.lista_pdf_descargada',
            'resource' => 'cursos',
            'resource_id' => $curso->id,
            'actor_id' => $user->id,
            'correlation_id' => $request->attributes->get('correlation_id'),
            'properties' => json_encode(['inscritos' => $matriculas->count()]),
            'created_at' => now(),
        ]);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Content-Length' => strlen($pdf),
        ]);
    }
}
