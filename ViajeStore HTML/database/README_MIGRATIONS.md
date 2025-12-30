# 🚀 ViajeStore - Guía de Migración

## Archivos SQL (ejecutar en orden)

```
001_core_users.sql          # Usuarios y CRM
002_delivery.sql           # Comida a domicilio
003_tech_services.sql      # Servicios tecnológicos
004_additional_modules.sql # 3D, Marketing, Community, Loyalty
005_triggers_functions.sql # Automatización
```

## Instalación

```bash
# Ejecutar todo
cat *.sql | psql -U postgres -d viajestore

# O uno por uno
psql -U postgres -d viajestore < 001_core_users.sql
psql -U postgres -d viajestore < 002_delivery.sql
# ... etc
```

## 36 Tablas Creadas

**CORE:** users, business_profiles, addresses, payment_methods
**DELIVERY:** products, toppings, discounts, orders, order_items, stock_movements
**TECH:** services, projects, appointments, files, milestones
**3D:** materials, models, printing_orders
**MARKETING:** email_campaigns, whatsapp_messages, birthday_promotions
**COMMUNITY:** groups, votaciones, reviews
**LOYALTY:** transactions, rewards

## Automatización

✅ Auto-genera números: ORD-20250127-001
✅ Reduce stock al vender
✅ Asigna puntos fidelización
✅ Códigos cumpleaños 24h
✅ Actualiza updated_at

## Testing

```sql
\dt              # Ver tablas
\df              # Ver funciones
SELECT * FROM v_low_stock;
```
