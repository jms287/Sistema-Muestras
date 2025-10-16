Instituto Tecnológico de Santo Domingo (INTEC)

IDS348-01 – Desarrollo de Aplicaciones Web – 2025 T3
- Rainiero Hernández – 1122719
- Emil Ortega – 1121183
- José Manuel Santana – 1122271

---

# Sistema de Muestras

Sistema de gestión y seguimiento de muestras de laboratorio con flujo de trabajo completo desde la solicitud hasta la certificación (como simulación de DIGEMAPS).

---

## Características principales

- Gestión de muestras: Registro, seguimiento y validación de muestras de laboratorio.
- Sistema de asignaciones: Flujo de trabajo en 3 fases (Registro → Análisis → Evaluación).
- Pruebas de laboratorio: Ejecución y validación de pruebas fisicoquímicas y microbiológicas.
- Roles de usuario: Solicitante, Registrador, Analista, Evaluador, Administrador.
- Trazabilidad completa: Historial de acciones y eventos del sistema.
- Generación de reportes: Exportación de datos a Excel.

---

## Tecnologías utilizadas

### Base de datos
- MySQL
- Stored procedures y funciones

### Backend
- Node.js + Express
- Postman (para pruebas de API)

### Frontend
- React + Vite
- JavaScript ES6+
- HTML y CSS
- ExcelJs

---

## Requisitos del sistema

- Node.js v18+
- MySQL v8.0+
- npm o yarn

---

## Instalación y ejecución

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/jms287/Sistema-Muestras.git
   cd Sistema-Muestras
   ```

2. **Configurar la base de datos**
Crear la base de datos en MySQL e importar las tablas y procedimientos necesarios.

3. **Instalar dependencias**
   ```bash
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

4. **Configurar variables de entorno (.env)**
Colocar parámetros de conexión para backend (db).

5. **Iniciar la aplicación**
   ```bash
   cd backend
   npm run dev
   cd ..\frontend
   npm run dev
   ```

6. La aplicación estará disponible en http://localhost:3000.

---

## Estructura del proyecto

```
Sistema-Muestras/
├── frontend/           # Aplicación React
│   └── src/
│       ├── pantallas/  # Componentes por rol
│       └── utils/      # Utilidades
└── backend/            # API Node.js
    ├── routes/         # Endpoints REST
    └── utils/          # Helpers
```

---

## Flujo de trabajo

El sistema sigue un flujo secuencial y automatizado dividido en tres fases principales:

### Fase 1: Registro
- El encargado de registro registra la solicitud de análisis con la información requerida.
- Se genera un registro inicial con identificador único y metadatos (fecha, empresa, tipo de muestra).
- El encargado de registro confirma que todos los datos sean correctos antes de seguir.

### Fase 2: Análisis
- La muestra es asignada a un analista según su carga de trabajo.
- El analista realiza las pruebas correspondientes (fisicoquímicas, microbiológicas, de etiquetado).
- Los resultados según el tipo de muestra se registran en el sistema.
- El sistema compara los resultados con varias normas y estándares, y mide si el resultado está dentro de los límites.
- El sistema aprueba o rechaza la prueba y declara si la muestra es apta para consumo.

### Fase 3: Evaluación
- Un evaluador revisa y valida los resultados del analista.
- Si los resultados cumplen con criterios y normas, se certifica la muestra.
- Se generan reportes y se habilita la exportación de documentos PDF de Excel.
- El estado final y el historial completo quedan disponibles para el solicitante y auditoría.

**Notas adicionales**
- Todos los cambios quedan registrados en el historial para garantizar trazabilidad completa (usuario, fecha, acción).
- El solicitante puede consultar el estado y recibir notificaciones en cada transición de fase.
- El administrador gestiona usuarios, roles, asignaciones, parámetros de pruebas, normas y configuraciones del sistema.

---

© 2025 [jms287](https://github.com/josesantana), [Miljandro](https://github.com/Miljandro), [Rainiero05](https://github.com/Rainiero05)
