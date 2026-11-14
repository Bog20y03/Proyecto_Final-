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

        $logoPath = public_path('app/logo-ut-pdf.z');
        $hasLogo = is_file($logoPath);
        $logoStream = $hasLogo ? file_get_contents($logoPath) : null;

        $totalPaginas = $paginas->count();
        $streams = [];

        $docenteNombre = $curso->docente
            ? trim($curso->docente->nombres.' '.$curso->docente->apellidos)
            : 'Sin asignar';
        $docenteDoc = $curso->docente?->documento ? 'Doc. '.$curso->docente->documento : '';
        $docenteCorreo = $curso->docente?->correo ?? '—';
        $inscritos = $matriculas->count();
        $fechaHoy = now()->timezone('America/Bogota')->format('d/m/Y H:i');

        foreach ($paginas as $idxPagina => $chunk) {
            $s = [];

            // Header with UT Logo on clean white background
            if ($hasLogo) {
                // Draw logo at x=42, y=744, width=96, height=67.4
                $s[] = 'q 96 0 0 67.4 42 744 cm /Im1 Do Q';
                $tx = 152;
            } else {
                $tx = 42;
            }

            // Header titles (clean dark typography, not heavy)
            $s[] = '0.85 0.16 0.17 rg';
            $s[] = "BT /F2 8 Tf {$tx} 796 Td (".self::win1252('UNIVERSIDAD DEL TOLIMA · REGISTRO ACADÉMICO').') Tj ET';

            $s[] = '0.13 0.14 0.16 rg';
            $s[] = "BT /F2 15 Tf {$tx} 777 Td (".self::win1252('Listado de Estudiantes Matriculados').') Tj ET';

            $s[] = '0.45 0.47 0.51 rg';
            $s[] = "BT /F1 9 Tf {$tx} 761 Td (".self::win1252('Reporte académico por asignatura · Generado el '.$fechaHoy).') Tj ET';

            // Subtle thin red accent line + soft gray line under header
            $s[] = '0.937 0.169 0.176 RG 1.2 w';
            $s[] = '42 734 m 160 734 l S';
            $s[] = '0.88 0.89 0.91 RG 0.7 w';
            $s[] = '160 734 m 553.28 734 l S';

            // Well-structured 2-column course metadata card (very soft neutral background)
            $s[] = '0.984 0.986 0.988 rg';
            $s[] = '42 652 511.28 68 re f';
            $s[] = '0.89 0.90 0.92 RG 0.7 w';
            $s[] = '42 652 511.28 68 re S';

            // Vertical divider inside metadata card
            $s[] = '0.91 0.92 0.94 RG 0.6 w';
            $s[] = '335 660 m 335 712 l S';

            // Left column of course metadata
            $s[] = '0.45 0.47 0.51 rg';
            $s[] = 'BT /F2 7.5 Tf 54 704 Td ('.self::win1252('ASIGNATURA').') Tj ET';
            $s[] = '0.13 0.14 0.16 rg';
            $s[] = 'BT /F2 10.5 Tf 54 691 Td ('.self::win1252(self::trunc($curso->codigo.' · '.$curso->nombre, 46)).') Tj ET';

            $s[] = '0.45 0.47 0.51 rg';
            $s[] = 'BT /F2 7.5 Tf 54 675 Td ('.self::win1252('DOCENTE TITULAR').') Tj ET';
            $s[] = '0.20 0.21 0.24 rg';
            $infoDocente = $docenteNombre.($docenteDoc ? " ({$docenteDoc})" : '').' · '.$docenteCorreo;
            $s[] = 'BT /F1 9 Tf 54 662 Td ('.self::win1252(self::trunc($infoDocente, 54)).') Tj ET';

            // Right column of course metadata
            $s[] = '0.45 0.47 0.51 rg';
            $s[] = 'BT /F2 7.5 Tf 348 704 Td ('.self::win1252('PERIODO Y CRÉDITOS').') Tj ET';
            $s[] = '0.13 0.14 0.16 rg';
            $s[] = 'BT /F1 9.5 Tf 348 691 Td ('.self::win1252('Periodo '.$curso->periodo.'   ·   '.$curso->creditos.' créditos académicos').') Tj ET';

            $s[] = '0.45 0.47 0.51 rg';
            $s[] = 'BT /F2 7.5 Tf 348 675 Td ('.self::win1252('ESTUDIANTES INSCRITOS').') Tj ET';
            $s[] = '0.13 0.14 0.16 rg';
            $s[] = 'BT /F1 9.5 Tf 348 662 Td ('.self::win1252($inscritos.' matriculados (Cupo máximo: '.$curso->cupo_maximo.')').') Tj ET';

            // Table Header (soft light neutral gray, clean typography)
            $tableTop = 616;
            $rowH = 24;
            $s[] = '0.949 0.953 0.961 rg';
            $s[] = "42 {$tableTop} 511.28 {$rowH} re f";
            $s[] = '0.84 0.85 0.88 RG 0.7 w';
            $s[] = "42 {$tableTop} 511.28 {$rowH} re S";

            $s[] = '0.28 0.30 0.35 rg';
            $hy = $tableTop + 8;
            $s[] = "BT /F2 8 Tf 50 {$hy} Td (".self::win1252('N.º').') Tj ET';
            $s[] = "BT /F2 8 Tf 80 {$hy} Td (".self::win1252('DOCUMENTO').') Tj ET';
            $s[] = "BT /F2 8 Tf 164 {$hy} Td (".self::win1252('APELLIDOS Y NOMBRES').') Tj ET';
            $s[] = "BT /F2 8 Tf 326 {$hy} Td (".self::win1252('CORREO INSTITUCIONAL').') Tj ET';
            $s[] = "BT /F2 8 Tf 454 {$hy} Td (".self::win1252('PROGRAMA ACADÉMICO').') Tj ET';

            if ($chunk->isEmpty()) {
                $yEmpty = $tableTop - 42;
                $s[] = '1 1 1 rg';
                $s[] = "42 {$yEmpty} 511.28 42 re f";
                $s[] = '0.89 0.90 0.92 RG 0.6 w';
                $s[] = "42 {$yEmpty} 511.28 42 re S";
                $s[] = '0.45 0.47 0.51 rg';
                $s[] = 'BT /F1 9.5 Tf 168 '.($yEmpty + 17).' Td ('.self::win1252('No hay estudiantes con matrícula activa en este curso.').') Tj ET';
            } else {
                $rowIndex = $idxPagina * $filasPorPagina;
                foreach ($chunk as $i => $mat) {
                    $rowIndex++;
                    $y = $tableTop - (($i + 1) * $rowH);

                    if ($i % 2 === 1) {
                        $s[] = '0.988 0.990 0.992 rg';
                        $s[] = "42 {$y} 511.28 {$rowH} re f";
                    }
                    $s[] = '0.91 0.92 0.94 RG 0.5 w';
                    $s[] = "42 {$y} 511.28 {$rowH} re S";

                    $est = $mat->estudiante;
                    $doc = $est?->documento ?? '—';
                    $nombre = $est ? trim($est->apellidos.' '.$est->nombres) : '—';
                    $correo = $est?->correo ?? '—';
                    $prog = $est?->programa ?? '—';

                    $ty = $y + 8;
                    $s[] = '0.42 0.44 0.48 rg';
                    $s[] = "BT /F1 8.5 Tf 50 {$ty} Td (".self::win1252(str_pad((string) $rowIndex, 2, '0', STR_PAD_LEFT)).') Tj ET';

                    $s[] = '0.16 0.17 0.20 rg';
                    $s[] = "BT /F2 8.5 Tf 80 {$ty} Td (".self::win1252(self::trunc($doc, 15)).') Tj ET';
                    $s[] = "BT /F1 8.5 Tf 164 {$ty} Td (".self::win1252(self::trunc($nombre, 32)).') Tj ET';

                    $s[] = '0.32 0.34 0.38 rg';
                    $s[] = "BT /F1 8 Tf 326 {$ty} Td (".self::win1252(self::trunc($correo, 28)).') Tj ET';
                    $s[] = "BT /F1 8 Tf 454 {$ty} Td (".self::win1252(self::trunc($prog, 20)).') Tj ET';
                }
            }

            // Clean Footer (no signature block)
            $s[] = '0.89 0.90 0.92 RG 0.6 w';
            $s[] = '42 56 m 553.28 56 l S';
            $s[] = '0.48 0.50 0.54 rg';
            $s[] = 'BT /F1 8 Tf 42 42 Td ('.self::win1252('Universidad del Tolima · Sistema de Registro Académico').') Tj ET';

            $numPag = $idxPagina + 1;
            $s[] = 'BT /F1 8 Tf 485 42 Td ('.self::win1252("Página {$numPag} de {$totalPaginas}").') Tj ET';

            $streams[] = implode("\n", $s);
        }

        return self::armarPdf($streams, $logoStream);
    }

    private static function armarPdf(array $streams, ?string $logoStream): string
    {
        $objects = [];
        // 1: Catalog, 2: Pages, 3: Font Regular, 4: Font Bold
        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        $objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

        $nextId = 5;
        $logoObjId = null;
        if ($logoStream !== null) {
            $logoObjId = $nextId++;
            $logoLen = strlen($logoStream);
            $objects[$logoObjId] = "<< /Type /XObject /Subtype /Image /Width 400 /Height 281 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length {$logoLen} >>\nstream\n{$logoStream}\nendstream";
        }

        $xObjRef = $logoObjId ? " /XObject << /Im1 {$logoObjId} 0 R >>" : '';

        $kids = [];
        foreach ($streams as $stream) {
            $pageId = $nextId++;
            $contentId = $nextId++;
            $kids[] = "{$pageId} 0 R";
            $len = strlen($stream);
            $objects[$contentId] = "<< /Length {$len} >>\nstream\n{$stream}\nendstream";
            $objects[$pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>{$xObjRef} >> /Contents {$contentId} 0 R >>";
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
