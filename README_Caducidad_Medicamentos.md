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
```

---

### 2. Consulta de Lotes por Vencimiento Próximo

```sql
SELECT * FROM medication_batches
WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY expiration_date ASC;
```

---

### 3. Validación Antes de Usar Medicamento

```python
def validar_lote_para_uso(lote):
    if lote.expiration_date < date.today():
        raise ValueError("El medicamento está vencido y no puede ser administrado.")
```

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Python (Django) o Node.js (Express)
- **Base de Datos:** PostgreSQL (con extensión `uuid-ossp`)
- **ORM Recomendado:** Django ORM o Sequelize
- **Interfaz Web:** Vue.js o React (para el panel de control de inventario)

---

## 📌 Notas

- Todos los lotes deben tener fecha de vencimiento al momento del ingreso.  
- Las alertas se pueden consumir mediante API o ser automatizadas vía cron/email.

---
