# 🏆 RPC SocialStream — MS1: Conector de Base de Datos BOCA

> **Microservicio 1** del sistema **RPC SocialStream**: conexión y extracción de datos en tiempo real desde el juez de programación competitiva BOCA.  
> Proyecto académico — Universidad Francisco de Paula Santander · Ingeniería de Sistemas · 2026

---

## 📌 Descripción

Este repositorio contiene el **Microservicio 1 (MS1)** del sistema RPC SocialStream, cuyo propósito es automatizar la publicación de resultados en tiempo real de la **Red de Programación Competitiva (RPC)**.

MS1 es la única pieza del sistema que interactúa directamente con la base de datos PostgreSQL del juez **BOCA**. Su responsabilidad es:

- Conectarse a PostgreSQL en **modo solo lectura** para proteger la integridad de los datos de competencia.
- Identificar automáticamente la base de datos activa de la competencia mediante el patrón `rpc_YYYY_CC`.
- Extraer las tablas de **envíos**, **equipos** y **problemas**.
- Exponer los datos crudos al resto del sistema a través de un endpoint interno en formato JSON.

> Este aislamiento garantiza que si BOCA cambia su esquema o se reemplaza por otro juez, **solo este microservicio necesita modificarse**.

---

## 🏗️ Arquitectura General del Sistema

```
Administrador
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                Microservicios · Docker Containers        │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │  MS4 · Admin UI  │─────▶│  MS1 · Conector BOCA     │◀──── PostgreSQL BOCA
│  │  Panel + React   │      │  Extrae envíos y equipos  │      (solo lectura)
│  └──────────────────┘      └────────────┬─────────────┘ │
│                                          │                │
│                             ┌────────────▼─────────────┐ │
│                             │  MS2 · Ranking + Render  │ │
│                             │  Calcula ranking → PNG   │ │
│                             └────────────┬─────────────┘ │
│                                          │                │
│  ┌───────────┐              ┌────────────▼─────────────┐ │
│  │ Config DB │◀─────────────│  MS3 · Publicación       │ │
│  └───────────┘              │  Cron cada hora + Facebook│ │
│                             └────────────┬─────────────┘ │
└─────────────────────────────────────────│────────────────┘
                                          ▼
                                  Facebook Graph API
```

---

## 📂 Estructura del Repositorio

```
ProyectoRPC/
├── backend/                  # Lógica del microservicio (Node.js / Python)
├── frontend/                 # Interfaz de administración (React + Vite)
│   └── Dockerfile
├── docker-compose.yml        # Orquestación de contenedores
├── .gitignore
└── package-lock.json
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React · HTML5 · CSS3 · JavaScript |
| **Backend** | Node.js · Python · Django |
| **Base de datos** | PostgreSQL (BOCA) |
| **Contenedores** | Docker · Docker Compose |
| **IDE** | Visual Studio Code |
| **Control de versiones** | Git · GitHub |
| **Host local** | localhost |

---

## ⚙️ Requisitos Previos

- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados.
- [Node.js](https://nodejs.org/) (para desarrollo sin Docker).
- Acceso de red al servidor PostgreSQL del juez BOCA.
- Credenciales de solo lectura para la base de datos de la competencia.

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/TheRealOneAle/ProyectoRPC.git
cd ProyectoRPC
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Conexión a BOCA PostgreSQL
BOCA_HOST=boca-primary.internal.rpc
BOCA_PORT=5432
BOCA_USER=rpc_architect_admin
BOCA_PASSWORD=tu_password_aqui
BOCA_DB_PATTERN=rpc_YYYY_CC

# Puerto del microservicio
MS1_PORT=3001
```

> ⚠️ **Nunca subas el archivo `.env` al repositorio.** Ya está incluido en `.gitignore`.

### 3. Levantar con Docker Compose

```bash
docker-compose up --build
```

El frontend estará disponible en: `http://localhost:5173`

### 4. Ejecución en desarrollo (sin Docker)

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Interna — Endpoints

MS1 expone un endpoint interno consumido por MS2 y MS3:

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/competition/active` | Retorna la competencia activa detectada |
| `GET` | `/api/v1/rankings/raw` | Devuelve los datos crudos de envíos y equipos en JSON |
| `GET` | `/api/v1/health` | Estado del microservicio y conexión a BOCA |

**Ejemplo de respuesta** (`/api/v1/rankings/raw`):

```json
{
  "competition": "rpc_2026_02",
  "timestamp": "2026-04-02T14:32:01Z",
  "teams": [...],
  "problems": [...],
  "submissions": [...]
}
```

---

## 🗃️ Entidades del Dominio

Según el modelo DDD aplicado al proyecto, este microservicio maneja las siguientes entidades:

| Entidad | Descripción |
|---|---|
| `Competencia` | Base de datos activa identificada con el patrón `rpc_YYYY_CC` |
| `Equipo` | Datos de los equipos participantes |
| `Problema` | Problemas del concurso |
| `Envío` | Intentos de solución de cada equipo |

---

## 📋 Historias de Usuario Relacionadas

| ID | Historia | Prioridad | Story Points |
|---|---|---|---|
| HU1 | Conector de Datos BOCA (Postgres) | 🔴 Alta | 5 pts |
| HU4 | Servicio Programado (Cron Scheduler) | 🔴 Alta | 3 pts |

---

## 🗓️ Sprint de Desarrollo

Este microservicio corresponde al **Sprint 1: Conexión con el Juez**.

**Tareas:**
1. Configurar la conexión a PostgreSQL con acceso de solo lectura.
2. Implementar el filtrado de bases de datos usando expresiones regulares (`rpc_YYYY_CC`).
3. Desarrollar el módulo de filtrado por año y concurso.
4. Contenedorización: crear el `Dockerfile` para portabilidad.
5. Pruebas de conexión y validación de datos extraídos.
6. Integrar el Cron Scheduler para ejecuciones autónomas cada hora.

**Hito entregado:** El sistema "despierta" solo y lee datos reales de la competencia sin intervención humana.

---

## 🔒 Consideraciones de Seguridad

- **Solo lectura:** MS1 nunca escribe ni modifica datos en la BD de BOCA.
- **Aislamiento:** Este es el único servicio con acceso directo a BOCA. Cualquier cambio en el juez se gestiona únicamente aquí.
- **Tokens y credenciales:** Se gestionan exclusivamente a través de variables de entorno, nunca en el código fuente.
- **Patrón de descubrimiento:** La identificación de la BD activa usa regex `rpc_YYYY_CC` para evitar conexiones erróneas.

---

## 👥 Autores

| Nombre | Código |
|---|---|
| Jesús Gabriel Torres Daza | 1152351 |
| Alejandro Ovallos Torrado | 1152369 |
| Emerson Amir Vera González | 1152378 |

**Docente:** Ph.D. Fredy Humberto Vera Rivera  
**Universidad Francisco de Paula Santander** — Ingeniería de Sistemas  
**Asignatura:** Desarrollo de Aplicaciones Basadas en Microservicios · Cúcuta, 2026

---

## 📎 Recursos del Proyecto

- 🎨 [Mockups en Figma](https://www.figma.com/design/oalJwrbOUBMqT2XsDDKvM0/Untitled?node-id=11-204&t=WFW2LlG8TEmq99FK-1)
- 📁 [Repositorio GitHub](https://github.com/TheRealOneAle/ProyectoRPC)

---

<p align="center">
  Proyecto académico · Universidad Francisco de Paula Santander · 2026
</p>
