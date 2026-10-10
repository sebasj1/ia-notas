Task Manager — Gestor de tareas/notas

Aplicación web para organizar tareas personales de forma sencilla. Permite crear, editar, completar y eliminar tareas, organizarlas por categorías y filtrarlas según su estado.

🚀 Demo online

Aplicación desplegada:  https://proy-task-manager.netlify.app/

Repositorio:  https://github.com/seba/ias.git
 
📸 Screenshots
1-Inicio de sesión Login
<img width="1296" height="616" alt="image" src="https://github.com/user-attachments/assets/5a9da16d-2d61-424d-9d07-0d320c60503f" />

2-Panel principal de Task Manager
<img width="1352" height="561" alt="image" src="https://github.com/user-attachments/assets/87f7bc72-97aa-4186-aa97-776fbdaa55dc" />


3-Lista de tareas y filtros con notas cargadas
<img width="1341" height="609" alt="image" src="https://github.com/user-attachments/assets/ab5b3bf5-058b-40cb-83ba-2854c6637422" />

 4-Lista de tareas con filtro activado
 <img width="1333" height="612" alt="image" src="https://github.com/user-attachments/assets/dbec5069-8208-49d4-ae3c-f16cedfdb3c9" />


✨ Funcionalidades
Crear nuevas tareas.
Editar y eliminar tareas.
Marcar tareas como completadas.
Organizar tareas por categorías.
Filtrar tareas por estado o categoría.
Validar los datos ingresados.
Mostrar mensajes de error cuando ocurre un problema.

🛠️ Tecnologías utilizadas
React: construcción de la interfaz.
TypeScript: tipado del código.
Tailwind CSS: estilos y diseño adaptable.
shadcn/ui: componentes de interfaz.
Supabase: autenticación, base de datos y almacenamiento.
Vite: servidor de desarrollo y compilación.
Vitest: pruebas automatizadas.

📋 Requisitos previos
Node.js.
Una cuenta de Supabase para habilitar los servicios del backend.

⚙️ Instalación y configuración
1. Clonar el repositorio
git clone https://github.com/seba/ias.git
cd ia-notas

2. Instalar dependencias
npm install

3. Configurar las variables de entorno

Crear un archivo .env en la raíz del proyecto, tomando como referencia .env.example.

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica


Obtener los valores desde la configuración del proyecto en Supabase.

El repositorio incluye un archivo `.env.example` con los nombres de las variables necesarias para configurar la conexión con Supabase.

Para ejecutar el proyecto localmente, crear un archivo `.env` con los valores correspondientes a tu proyecto.

No subir credenciales privadas ni el archivo `.env` al repositorio.

4. Ejecutar en desarrollo
npm run dev


Abrir en el navegador la dirección local que indique Vite, normalmente http://localhost:5173.

5. Generar la versión de producción
npm run build

6. Ejecutar las pruebas
npm run test


Este comando requiere que las pruebas estén configuradas en package.json.


El proyecto utiliza Vitest para ejecutar pruebas automatizadas de validación de tareas.

Las pruebas verifican los siguientes casos:

Aceptación de títulos válidos.
Rechazo de títulos vacíos.
Rechazo de títulos que contienen únicamente espacios en blanco.
Ejecutar las pruebas
npm run test
Resultado obtenido: 3 pruebas aprobadas.

Archivo de pruebas: src/test/task.test.ts.

🚀 Despliegue
La aplicación está desplegada en Netlify y vinculada al repositorio de GitHub.

Para publicar nuevas versiones, se pueden enviar los cambios al repositorio y utilizar la integración de despliegue configurada en Netlify.

URL de producción: https://proy-task-manager.netlify.app/

🔐 Seguridad
Las variables de entorno reales no deben subirse a GitHub.
Las tablas de Supabase deben contar con políticas RLS adecuadas.
Las claves privadas de servicio nunca deben exponerse en el frontend.

👨‍💻 Autor
Proyecto académico de gestión de tareas desarrollado con React, TypeScript y Supabase.
