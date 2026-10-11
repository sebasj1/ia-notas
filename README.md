# Task Manager — Gestor de tareas/notas

Aplicación web para organizar tareas o notas personales de forma sencilla. Permite crear, editar, completar y eliminar tareas, organizarlas por categorías y filtrarlas según su estado.

## 📖 Funcionalidades en detalle

### 🔐 Inicio de sesión
Los usuarios pueden acceder a la aplicación utilizando su correo electrónico y contraseña para gestionar sus propias notas y tareas.

### 📝 Administración de notas y tareas
La aplicación permite realizar las operaciones principales de gestión:
Crear: agregar una nueva nota/tarea.
Consultar: visualizar los elementos guardados.
Editar: actualizar la información de una nota.
Eliminar: borrar elementos que ya no se necesitan.

### 🏷️ Organización y filtros
Las tareas pueden clasificarse mediante categorías para facilitar su organización. También es posible aplicar filtros por fecha y categoría para encontrar información de manera más rápida y eficiente.


## 🚀 Demo online

#### Aplicación desplegada:  https://proy-task-manager.netlify.app/
#### Repositorio:   https://github.com/sebasj1/ia-notas.git

 
## 📸 Screenshots
- Inicio de sesión Login
<img width="1296" height="616" alt="image" src="https://github.com/user-attachments/assets/5a9da16d-2d61-424d-9d07-0d320c60503f" />


- Panel principal de Task Manager
<img width="1352" height="561" alt="image" src="https://github.com/user-attachments/assets/87f7bc72-97aa-4186-aa97-776fbdaa55dc" />


- Lista de tareas y filtros con notas cargadas
<img width="1341" height="609" alt="image" src="https://github.com/user-attachments/assets/ab5b3bf5-058b-40cb-83ba-2854c6637422" />


 - Lista de tareas con filtro activado
 <img width="1333" height="612" alt="image" src="https://github.com/user-attachments/assets/dbec5069-8208-49d4-ae3c-f16cedfdb3c9" />


## ✨ Funcionalidades

- Crear nuevas tareas.
- Editar y eliminar tareas.
- Marcar tareas como completadas.
- Organizar tareas por categorías.
- Filtrar tareas por estado o categoría.
- Validar los datos ingresados.
- Mostrar mensajes de error cuando ocurre un problema.

## 🛠️ Tecnologías utilizadas
- Bolt.new: construccion inicial del prototipo.
- React: construcción de la interfaz.
- TypeScript: tipado del código.
- Tailwind CSS: estilos y diseño adaptable.
- shadcn/ui: componentes de interfaz.
- Supabase: autenticación, base de datos y almacenamiento.
- Vite: servidor de desarrollo y compilación.
- Vitest: pruebas automatizadas.
- Cursor: edición de codigo.


## 📋 Requisitos previos
- Node.js.
- Una cuenta de Supabase para habilitar los servicios del backend o uso de Docker en forma local.

## ⚙️ Instalación y configuración
**1.Clonar el repositorio**
     
git clone  https://github.com/sebasj1/ia-notas.git

cd ia-notas

**2.Instalar dependencias**

npm install

**3.Configurar las variables de entorno**

Crear un archivo .env en la raíz del proyecto, tomando como referencia .env.example.

Obtener los valores  necesarios para configurar la conexión desde el proyecto en Supabase.

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica

**4.Ejecutar en desarrollo**

npm run dev

**5.Generar la versión de producción**

npm run build

**6.Ejecutar las pruebas**

npm run test

El proyecto utiliza Vitest para ejecutar pruebas automatizadas de validación de tareas.

Las **pruebas** verifican los siguientes casos:

- Aceptación de títulos válidos.

- Rechazo de títulos vacíos.

- Rechazo de títulos que contienen únicamente espacios en blanco.

- Ejecutar las pruebas

npm run test

Resultado obtenido: 3 pruebas aprobadas.

Archivo de pruebas: src/test/task.test.ts.


## 🚀 Despliegue
La aplicación está desplegada en Netlify y vinculada al repositorio de GitHub.
**URL de producción**: https://proy-task-manager.netlify.app/


## 🔐 Seguridad
Las variables de entorno reales no deben subirse a GitHub.

Las tablas de Supabase deben contar con políticas RLS adecuadas.

Las claves privadas de servicio nunca deben exponerse en el frontend.


## 👨‍💻 Autor
Desarrollado por Matias Jaramillo.

**Github**: https://github.com/sebasj1/ia-notas.git
