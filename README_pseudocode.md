# 🛠️ Implementación - Desarrollador
---
## 🔧 INICIO DE APLICACIÓN
1. **Conexión a Supabase**:
   - Se carga la URL y clave secreta desde un archivo `.env`.
   - Se utiliza la librería `@supabase/supabase-js` para conectarse a la base de datos.
2. **Inicialización de la App React**:
   - Se renderiza una barra lateral con navegación entre módulos.
   - Los módulos disponibles son:
     - `Dashboard`
     - `Hospitals`
     - `Medications`
     - `Patients`
     - `Usage`
3. **Ruteo y Navegación**:
   - Se usa `react-router-dom` para controlar rutas.
   - Ejemplos:
     - Ruta `/` → Carga el componente `Dashboard`.
     - Ruta `/hospitals` → Muestra listado de hospitales.
     - Ruta `/medications` → Muestra medicamentos disponibles.
     - Ruta `/patients` → Lista de pacientes.
     - Ruta `/usage` → Permite visualizar el uso de medicamentos y costos por paciente.

4. **Comportamiento de los Componentes**:
   - Cada módulo:
     - Hace `fetch` de datos desde Supabase.
     - Muestra los resultados en tablas o tarjetas.
     - Permite crear, editar o eliminar registros mediante formularios.
     - Algunos formularios utilizan validación básica con `react-hook-form`.

5. **Validación del Código y Buenas Prácticas**:
   - Se usa `TypeScript` para tipado estatíco.
   - Se ejecuta `ESLint` para mantener la calidad del código.
   - Las consultas a Supabase están tipadas para prevenir errores.

---

## 📦 Tecnologías Utilizadas

- **React** (Frontend UI)
- **TypeScript** (Tipado seguro)
- **Supabase** (Base de datos y API REST en la nube)
- **React Router** (Navegación SPA)
- **Tailwind CSS** (Estilos rápidos y responsivos)
- **ESLint + Prettier** (Formato y calidad de código)
- **Vite** (Compilación rápida y ligera)

---

## 🗃️ Estructura de Carpetas

```plaintext
src/
├── components/       # Componentes reutilizables (cards, tablas, formularios)
├── pages/            # Rutas principales (Dashboard, Hospitals, etc.)
├── supabase/         # Conexión y queries
├── App.tsx           # App principal
├── main.tsx          # Entrada principal
