<?php

namespace App\Support;

use App\Models\Curso;
use Illuminate\Support\Collection;

class CursoListaPdf
{
    private static function win1252(string $text): string
    {
        $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $text);
        if ($converted === false) {
            $converted = $text;
        }

        return str_replace(['\\', '(', ')', "\r", "\n"], ['\\\\', '\\(', '\\)', ' ', ' '], $converted);
    }

    private static function trunc(string $text, int $max): string
    {
        $text = trim($text);
        if (mb_strlen($text, 'UTF-8') <= $max) {
            return $text;
        }

        return mb_substr($text, 0, $max - 1, 'UTF-8').'...';
    }

    public static function generar(Curso $curso, Collection $matriculas): string
    {
        // A4 Portrait: 595.28 x 841.89 pt
        $filasPorPagina = 20;
        $paginas = $matriculas->chunk($filasPorPagina);
        if ($paginas->isEmpty()) {
            $paginas = collect([collect([])]);
        }

        $totalPaginas = $paginas->count();
        $streams = [];

        foreach ($paginas as $idxPagina => $chunk) {
            $s = [];

            // Header institutional red bar
            $s[] = '0.937 0.169 0.176 rg';
            $s[] = '0 828 595.28 14 re f';

            // Header dark bar
            $s[] = '0.118 0.118 0.141 rg';
            $s[] = '36 760 523.28 54 re f';

            // Header text
            $s[] = '1 1 1 rg';
            $s[] = 'BT /F2 14 Tf 50 792 Td ('.self::win1252('UNIVERSIDAD DEL TOLIMA · REGISTRO ACADÉMICO').') Tj ET';
            $s[] = '0.988 0.647 0.647 rg';
            $s[] = 'BT /F1 9.5 Tf 50 774 Td ('.self::win1252('LISTADO OFICIAL DE ESTUDIANTES MATRICULADOS Y CONTROL DE ASISTENCIA').') Tj ET';

            // Course metadata box
            $s[] = '0.973 0.976 0.980 rg';
            $s[] = '36 686 523.28 64 re f';
            $s[] = '0.88 0.89 0.91 RG 0.8 w';
            $s[] = '36 686 523.28 64 re S';

            // Red left accent on metadata box
            $s[] = '0.937 0.169 0.176 rg';
            $s[] = '36 686 4 64 re f';

            $docenteNombre = $curso->docente
                ? ($curso->docente->nombres.' '.$curso->docente->apellidos.($curso->docente->documento ? ' (Doc. '.$curso->docente->documento.')' : ''))
                : 'Sin asignar';
            $docenteCorreo = $curso->docente?->correo ?? '';
            $inscritos = $matriculas->count();
            $fechaHoy = now()->timezone('America/Bogota')->format('d/m/Y H:i');

            $s[] = '0.15 0.15 0.18 rg';
            $s[] = 'BT /F2 10.5 Tf 48 733 Td ('.self::win1252('Asignatura: '.$curso->codigo.' - '.$curso->nombre).') Tj ET';
            $s[] = 'BT /F1 9 Tf 48 716 Td ('.self::win1252('Docente titular: '.$docenteNombre.($docenteCorreo ? ' · '.$docenteCorreo : '')).') Tj ET';
            $s[] = 'BT /F1 9 Tf 48 700 Td ('.self::win1252('Periodo: '.$curso->periodo.'   |   Créditos: '.$curso->creditos.'   |   Estudiantes matriculados: '.$inscritos.' / '.$curso->cupo_maximo.'   |   Fecha: '.$fechaHoy).') Tj ET';

            // Table Header
            $tableTop = 668;
            $rowH = 22;
            $s[] = '0.118 0.118 0.141 rg';
            $s[] = "36 {$tableTop} 523.28 {$rowH} re f";

            $s[] = '1 1 1 rg';
            $hy = $tableTop + 7;
            $s[] = "BT /F2 8.5 Tf 42 {$hy} Td (".self::win1252('#').') Tj ET';
            $s[] = "BT /F2 8.5 Tf 64 {$hy} Td (".self::win1252('DOCUMENTO').') Tj ET';
            $s[] = "BT /F2 8.5 Tf 136 {$hy} Td (".self::win1252('ESTUDIANTE (APELLIDOS Y NOMBRES)').') Tj ET';
            $s[] = "BT /F2 8.5 Tf 292 {$hy} Td (".self::win1252('CORREO INSTITUCIONAL').') Tj ET';
            $s[] = "BT /F2 8.5 Tf 422 {$hy} Td (".self::win1252('PROGRAMA').') Tj ET';
            $s[] = "BT /F2 8.5 Tf 514 {$hy} Td (".self::win1252('FIRMA').') Tj ET';

            if ($chunk->isEmpty()) {
                $yEmpty = $tableTop - 36;
                $s[] = '0.99 0.99 0.99 rg';
                $s[] = "36 {$yEmpty} 523.28 36 re f";
                $s[] = '0.88 0.89 0.91 RG 0.6 w';
                $s[] = "36 {$yEmpty} 523.28 36 re S";
                $s[] = '0.45 0.45 0.50 rg';
                $s[] = 'BT /F1 9.5 Tf 165 '.($yEmpty + 14).' Td ('.self::win1252('No hay estudiantes con matrícula activa en este curso.').') Tj ET';
            } else {
                $rowIndex = $idxPagina * $filasPorPagina;
                foreach ($chunk as $i => $mat) {
                    $rowIndex++;
                    $y = $tableTop - (($i + 1) * $rowH);

                    if ($i % 2 === 1) {
                        $s[] = '0.976 0.980 0.984 rg';
                        $s[] = "36 {$y} 523.28 {$rowH} re f";
                    }
                    $s[] = '0.89 0.90 0.92 RG 0.5 w';
                    $s[] = "36 {$y} 523.28 {$rowH} re S";

                    $est = $mat->estudiante;
                    $doc = $est?->documento ?? '—';
                    $nombre = $est ? ($est->apellidos.' '.$est->nombres) : '—';
                    $correo = $est?->correo ?? '—';
                    $prog = $est?->programa ?? '—';

                    $ty = $y + 7;
                    $s[] = '0.15 0.15 0.18 rg';
                    $s[] = "BT /F1 8.5 Tf 42 {$ty} Td (".self::win1252((string) $rowIndex).') Tj ET';
                    $s[] = "BT /F2 8.5 Tf 64 {$ty} Td (".self::win1252(self::trunc($doc, 14)).') Tj ET';
                    $s[] = "BT /F1 8.5 Tf 136 {$ty} Td (".self::win1252(self::trunc($nombre, 30)).') Tj ET';
                    $s[] = "BT /F1 8 Tf 292 {$ty} Td (".self::win1252(self::trunc($correo, 28)).') Tj ET';
                    $s[] = "BT /F1 8 Tf 422 {$ty} Td (".self::win1252(self::trunc($prog, 20)).') Tj ET';

                    // Signature line inside cell
                    $s[] = '0.78 0.79 0.82 RG 0.5 w';
                    $lineY = $y + 5;
                    $s[] = "510 {$lineY} m 553 {$lineY} l S";
                }
            }

            // Footer signature and page number
            $s[] = '0.75 0.76 0.79 RG 0.7 w';
            $s[] = '36 86 m 220 86 l S';
            $s[] = '0.25 0.25 0.30 rg';
            $s[] = 'BT /F2 8.5 Tf 36 73 Td ('.self::win1252('Firma del Docente Titular').') Tj ET';
            $s[] = '0.45 0.45 0.50 rg';
            $s[] = 'BT /F1 8 Tf 36 61 Td ('.self::win1252($docenteNombre).') Tj ET';

            $numPag = $idxPagina + 1;
            $s[] = 'BT /F1 8 Tf 390 61 Td ('.self::win1252("Universidad del Tolima · Página {$numPag} de {$totalPaginas}").') Tj ET';

            $streams[] = implode("\n", $s);
        }

        return self::armarPdf($streams);
    }

    private static function armarPdf(array $streams): string
    {
        $objects = [];
        // 1: Catalog, 2: Pages, 3: Font Regular, 4: Font Bold
        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        $objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

        $kids = [];
        $nextId = 5;
        foreach ($streams as $stream) {
            $pageId = $nextId++;
            $contentId = $nextId++;
            $kids[] = "{$pageId} 0 R";
            $len = strlen($stream);
            $objects[$contentId] = "<< /Length {$len} >>\nstream\n{$stream}\nendstream";
            $objects[$pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {$contentId} 0 R >>";
        }

        $count = count($kids);
        $kidsStr = implode(' ', $kids);
        $objects[2] = "<< /Type /Pages /Kids [ {$kidsStr} ] /Count {$count} >>";
        ksort($objects);

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [];
        foreach ($objects as $id => $body) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $totalObjs = count($objects) + 1;
        $pdf .= "xref\n0 {$totalObjs}\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i < $totalObjs; $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size {$totalObjs} /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }
}
