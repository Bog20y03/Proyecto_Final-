# Plataforma de Gestión Universitaria: Cursos, Matrículas, Pagos e Identidad

**Universidad del Tolima · Facultad de Ingeniería · Programa de Ingeniería de Sistemas (IDEAD)**  
**Asignatura:** Arquitectura de Software (Semestre VI - Grupo 04)  
**Autoras:** Yenifer Bogotá Tapiero, Luna Sofia Ospina Rodriguez y Sara Sofia Rodriguez Hernández

---

## Descripción general

Plataforma web y API REST (`/api/v1`) construida en **Laravel 12** bajo una arquitectura **Cliente/Servidor multicapas** para el registro de estudiantes, administración de docentes y catálogo de cursos, inscripción y cancelación de matrículas con control transaccional de cupos, procesamiento de pagos (simulador local, adaptador SOAP 1.2 y pasarela real en pruebas con **Mercado Pago Checkout API**) y autenticación institucional (**JWT HS256** + **OpenID Connect con PKCE**).

---

## Estructura del repositorio

| Ruta | Descripción |
|---|---|
| [`taller4-api/`](taller4-api/) | Aplicación principal Laravel 12 (API REST `/api/v1`, servicios de negocio, adaptadores de pago/identidad e interfaz web en `public/app/`). |
| [`output/pdf/Proyecto_integrador.pdf`](output/pdf/Proyecto_integrador.pdf) | Documento completo del **Proyecto Integrador de Arquitectura de Software (Taller 5)** en formato PDF. |
| [`output/proyecto_integrador/Proyecto_integrador.md`](output/proyecto_integrador/Proyecto_integrador.md) | Fuente Markdown editable del informe arquitectónico (Canvas, 8 RF, 5 RNF, Scrum, arquitectura multicapas, componentes, contratos REST/SOAP, seguridad, monitoreo y guion de sustentación). |
| [`output/proyecto_integrador/Proyecto_integrador.html`](output/proyecto_integrador/Proyecto_integrador.html) | Versión HTML autónoma del informe con diagramas vectoriales integrados. |
| [`output/proyecto_integrador/diagramas/`](output/proyecto_integrador/diagramas/) | Diagramas editables en Mermaid (`.mmd`) y exportados en `.svg` (`arquitectura`, `componentes`, `secuencia`). |
| [`Taller_4_-_API_Cursos_y_Matriculas.postman_collection.json`](Taller_4_-_API_Cursos_y_Matriculas.postman_collection.json) | Colección de Postman con las 56 solicitudes y pruebas automatizadas de contrato. |
| [`gestion.sql`](gestion.sql) | Respaldo SQL base del modelo académico relacional. |

---

## Ejecución rápida

Desde la carpeta `taller4-api`:

```powershell
cd taller4-api
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Abrir en el navegador: **http://127.0.0.1:8000/app/index.html**

### Cuentas de demostración (contraseña: `password123`)

| Rol | Correo | Capacidades principales |
|---|---|---|
| **ADMIN** | `admin@ut.edu.co` | Gestión de estudiantes, docentes, cursos, matrículas, reembolsos, métricas de rendimiento y auditoría. |
| **DOCENTE** | `carlos.rojas@ut.edu.co` | Consulta de cursos asignados (`Mis cursos asignados`), catálogo general y estudiantes matriculados en sus cursos. |
| **ESTUDIANTE** | `ana.martinez@ut.edu.co` | Consulta de oferta académica, inscripción/cancelación de matrículas, órdenes de pago y centro de avisos. |

Para más detalles técnicos de la API y configuración de Mercado Pago, consulta [`taller4-api/README.md`](taller4-api/README.md) y [`taller4-api/MERCADO_PAGO.md`](taller4-api/MERCADO_PAGO.md).
