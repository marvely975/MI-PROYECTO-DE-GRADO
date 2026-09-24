# Jambelí Control

Sistema de control estudiantil de asistencia mediante códigos QR para la Unidad Educativa Jambelí.

## Estado actual

La interfaz de demostración está disponible directamente en `index.html`. Incluye dashboard responsive, navegación entre módulos, modo claro/oscuro, búsqueda y registro de estudiantes en memoria, flujo de escaneo preparado para cámara y confirmaciones visuales. Los datos demo se reinician al recargar.

## Estructura

```text
.
├── index.html              # Prototipo frontend funcional
├── database/schema.sql     # Esquema normalizado MySQL 8+
├── backend/config/         # PDO y variables de entorno
├── backend/middleware/     # Sesiones, autorización y validación
├── backend/api/            # Endpoints PHP de estudiantes y asistencia
├── backend/uploads/        # Fotografías fuera del control de versiones
├── frontend/               # Componentes CSS/JS cuando se extraiga el prototipo
└── docs/                   # Manual técnico y de usuario
```

## Instalación local

1. Requiere PHP 8.1+, MySQL 8+, Apache/Nginx y PDO MySQL.
2. Cree la base de datos con `mysql -u root -p < database/schema.sql`.
3. Copie `backend/config/.env.example` a `backend/config/.env` y configure sus credenciales.
4. Genere el hash del administrador con `password_hash('su-clave', PASSWORD_DEFAULT)` y reemplace el marcador del SQL.
5. Levante el proyecto con `php -S localhost:8000` y abra `http://localhost:8000`.

## Seguridad

El backend debe usar PDO con consultas preparadas, `password_verify`, regeneración de sesión después del login, tokens CSRF, validación de fotografías y autorización por rol. La restricción única `asistencia_diaria` evita duplicados incluso con solicitudes simultáneas.

## Flujo de usuario

1. El administrador crea cursos y registra estudiantes.
2. El sistema asigna un código único `JMB-...` y genera la credencial QR.
3. El docente abre **Escanear QR** y autoriza la cámara.
4. El servidor valida al estudiante y crea una asistencia del día.
5. El dashboard actualiza presentes, tardanzas y faltas; los reportes se exportan a PDF o Excel.

## Dependencias frontend

La demo carga Bootstrap 5.3, Bootstrap Icons y QRCode.js desde CDN. Para producción se recomienda servirlas localmente y conectar `html5-qrcode` en el módulo de asistencia. El backend debe recibir el código validado, no confiar en datos enviados por el navegador y resolver el estudiante en servidor.

## GitHub

```bash
git init
git add .
git commit -m "feat: scaffold Jambeli attendance control"
git branch -M main
git remote add origin https://github.com/USUARIO/jambeli-control.git
git push -u origin main
```

No publiques credenciales, archivos `.env`, fotografías privadas ni respaldos de la base de datos.
