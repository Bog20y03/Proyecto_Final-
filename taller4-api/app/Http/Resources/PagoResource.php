<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'matriculaId' => $this->matricula_id,
            'valor' => $this->valor, 'moneda' => $this->moneda, 'estado' => $this->estado,
            'proveedor' => $this->proveedor, 'simulado' => in_array($this->proveedor, ['simulado', 'soap_simulado']),
            'requiereRevision' => (bool) $this->requiere_revision,
            'referencia' => $this->referencia, 'fechaCreacion' => $this->created_at?->toIso8601String(),
            'fechaProcesamiento' => $this->procesado_at?->toIso8601String(),
            'matricula' => $this->whenLoaded('matricula', fn () => new MatriculaResource($this->matricula)),
            'transacciones' => $this->whenLoaded('transacciones', fn () => $this->transacciones->map(function ($t) {
                $tsCreated = $t->created_at->copy()->utc()->format('Y-m-d\TH:i:s\Z');
                $tsExpires = $t->created_at->copy()->utc()->addMinutes(5)->format('Y-m-d\TH:i:s\Z');
                $opTag = $t->accion === 'REEMBOLSO' ? 'ReembolsarPagoRequest' : 'RegistrarPagoRequest';
                $soapXml = <<<XML
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
  xmlns:p="urn:universidad:banco:pagos:v1"
  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
  xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
  <s:Header>
    <wsse:Security s:mustUnderstand="true">
      <wsu:Timestamp wsu:Id="TS-{$t->id}">
        <wsu:Created>{$tsCreated}</wsu:Created>
        <wsu:Expires>{$tsExpires}</wsu:Expires>
      </wsu:Timestamp>
    </wsse:Security>
  </s:Header>
  <s:Body wsu:Id="Body-{$t->id}">
    <p:{$opTag}>
      <p:OrdenId>{$this->id}</p:OrdenId>
      <p:Referencia>{$t->referencia}</p:Referencia>
      <p:Valor>{$this->valor}</p:Valor>
      <p:Moneda>{$this->moneda}</p:Moneda>
      <p:EstadoRespuesta>{$t->estado}</p:EstadoRespuesta>
    </p:{$opTag}>
  </s:Body>
</s:Envelope>
XML;

                return [
                    'id' => $t->id,
                    'accion' => $t->accion,
                    'estado' => $t->estado,
                    'referencia' => $t->referencia,
                    'fecha' => $t->created_at->toIso8601String(),
                    'soapXml' => $soapXml,
                ];
            })),
        ];
    }
}
