# sb1-9vj128ky

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/Andrewshumeiker/sb1-9vj128ky)
# 💊 Regulación de Caducidad de Medicamentos - Módulo de Inventario

Este módulo permite registrar medicamentos por lote con fecha de expiración, generar alertas automáticas por vencimiento próximo y validar su uso en tiempo real para evitar errores clínicos.

---

## 🚀 Feature Implementada

**Nombre:** Registro y control de caducidad de medicamentos  
**Objetivo:** Prevenir el uso de medicamentos vencidos en instituciones de salud.

---

## 🧱 Estructura de Datos

Tabla `medication_batches`:

| Campo             | Tipo          | Descripción                                |
|------------------|---------------|--------------------------------------------|
| id               | UUID          | Identificador único del lote               |
| medication_id    | UUID (FK)     | Referencia al medicamento base             |
| quantity         | INTEGER       | Cantidad de unidades en el lote            |
| expiration_date  | DATE          | Fecha de vencimiento del lote              |
| hospital_id      | UUID (FK)     | Hospital al que pertenece el lote          |
| created_at       | TIMESTAMP     | Fecha de ingreso del lote al sistema       |

---

## 🔁 Flujos Lógicos

### 1. Registro de Lote

```sql
INSERT INTO medication_batches (
  id, medication_id, quantity, expiration_date, hospital_id
) VALUES (
  uuid_generate_v4(), :medication_id, :quantity, :expiration_date, :hospital_id
);
