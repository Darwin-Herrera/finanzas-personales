# Mis Finanzas

Aplicación personal para controlar ingresos, gastos mensuales, tarjetas de crédito, retiros de efectivo, pagos fijos y movimientos en Lempiras o Dólares.

## Stack

- React
- Vite
- Supabase
- Recharts
- GitHub Pages

## 1. Requisitos

Instala:

- Node.js 20 o superior
- Visual Studio Code
- Git

## 2. Abrir el proyecto

```bash
cd finanzas-personales
npm install
npm run dev
```

Vite mostrará una dirección similar a:

```text
http://localhost:5173
```

## 3. Crear la base de datos en Supabase

1. Crea una cuenta/proyecto en Supabase.
2. Ve a `SQL Editor`.
3. Copia TODO el archivo:
   `supabase/schema.sql`
4. Ejecútalo.

Esto crea:

- `cards`
- `fixed_payments`
- `transactions`
- políticas RLS para que cada usuario solo vea sus datos.

## 4. Configurar variables

En Supabase:

`Project Settings > API`

Copia:

- Project URL
- anon public key

En la raíz del proyecto crea un archivo llamado `.env`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Nunca subas `.env` a GitHub.

## 5. Registro / login

La aplicación ya incluye autenticación por correo y contraseña.

Si Supabase exige confirmación de correo:

`Authentication > Providers > Email`

Puedes decidir si dejar habilitada o deshabilitada la confirmación, según tu preferencia.

## 6. Lógica de movimientos

Tipos incluidos:

- `Ingreso`
- `Gasto`
- `Retiro de efectivo`
- `Pago fijo`
- `Pago a tarjeta`

IMPORTANTE:

`Pago a tarjeta` NO se suma al gasto general del dashboard, porque pagar la tarjeta no es un gasto nuevo. El gasto ya fue contabilizado cuando registraste cada compra. Esto evita duplicar tus gastos.

## 7. Monedas

Puedes registrar:

- HNL
- USD

Cuando registras USD debes indicar el tipo de cambio utilizado. La aplicación guarda:

- monto original
- moneda original
- tipo de cambio
- equivalente en HNL

El dashboard usa HNL como moneda base.

## 8. Pagos fijos

En `Pagos fijos` puedes guardar plantillas como:

- Internet
- ENEE
- Casa
- Seguro
- Suscripciones

Luego seleccionas un mes y presionas:

`Generar en AAAA-MM`

Así se crea el movimiento del mes sin volver a escribirlo.

## 9. GitHub

Desde la terminal de VS Code:

```bash
git init
git add .
git commit -m "Proyecto inicial Mis Finanzas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/finanzas-personales.git
git push -u origin main
```

## 10. GitHub Pages

Si tu repositorio se llama:

`finanzas-personales`

abre `vite.config.js` y cambia:

```js
base: "/"
```

por:

```js
base: "/finanzas-personales/"
```

Luego:

```bash
npm run deploy
```

En GitHub revisa:

`Settings > Pages`

y selecciona la rama `gh-pages` si no se seleccionó automáticamente.

## Seguridad

La `anon key` de Supabase puede estar en el frontend. La protección real está en RLS.

NO pongas nunca en React:

- `service_role`
- contraseña de la base de datos
- secretos privados

## Siguiente evolución recomendada

Después puedes agregar:

- presupuesto mensual
- alertas de límite por tarjeta
- fecha real de corte y período facturado
- saldo pendiente por tarjeta
- metas de ahorro
- ingresos/salario
- exportación Excel/PDF
- gastos compartidos
- cuotas de compras
- gráficos históricos de 6/12 meses


## Ingresos y restante mensual

Ahora también puedes registrar ingresos como salario, planilla, bonificaciones u otros ingresos.

El dashboard calcula automáticamente:

```text
Restante = Total ingresos - Total gastos
```

Los pagos a tarjeta siguen sin contarse como gasto nuevo para evitar duplicidad.
