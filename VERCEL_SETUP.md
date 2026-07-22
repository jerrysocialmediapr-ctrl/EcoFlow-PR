# 📋 GUÍA COMPLETA: CONFIGURAR VERCEL PARA ECOFLOW PR

## 🎯 OBJETIVO
Configurar todas las variables de entorno en Vercel para que el sistema de cotizaciones funcione correctamente con ambas URLs (provisional y oficial).

---

## 📌 TABLA DE CONTENIDOS
1. [CONFIGURACIÓN INICIAL](#configuración-inicial)
2. [AGREGAR VARIABLES DE ENTORNO](#agregar-variables-de-entorno)
3. [CONFIGURAR DOMINIO PERSONALIZADO](#configurar-dominio-personalizado)
4. [VERIFICAR CONFIGURACIÓN](#verificar-configuración)
5. [CAMBIAR ENTRE URLs](#cambiar-entre-urls)
6. [SOLUCIONAR PROBLEMAS](#solucionar-problemas)

---

## 🚀 CONFIGURACIÓN INICIAL

### PASO 1: Acceder a Vercel Dashboard

1. Ve a: **https://vercel.com/dashboard**
2. Inicia sesión con tu cuenta (GitHub, GitLab, o email)
3. Busca y selecciona el proyecto: **EcoFlow-PR**

### PASO 2: Navegar a Variables de Entorno

1. En el proyecto EcoFlow-PR, haz clic en **Settings** (engranaje)
2. En el menú lateral izquierdo, selecciona **Environment Variables**
3. Verás un campo para agregar nuevas variables

---

## 🔧 AGREGAR VARIABLES DE ENTORNO

### VARIABLE 1: GAS_TOKEN (Token de Google Apps Script)

**Campo:** `GAS_TOKEN`
**Valor:**
```
PS-CRM-2024-SECURE-TOKEN
```

**Pasos:**
1. En "Environment Variables", haz clic en **"Add New"**
2. Campo de clave: `GAS_TOKEN`
3. Campo de valor: `PS-CRM-2024-SECURE-TOKEN`
4. Selecciona ambientes: ✓ Production ✓ Preview ✓ Development
5. Haz clic en **"Save"**

⚠️ **IMPORTANTE:** Este token es la contraseña para comunicarse con Google Sheets. Mantenlo seguro.

---

### VARIABLE 2: TEST_MODE (Modo de Prueba)

**Opción A - MODO PRUEBA (Recomendado inicialmente):**

| Campo | Valor |
|-------|-------|
| Clave | `TEST_MODE` |
| Valor | `true` |
| Ambientes | ✓ Production ✓ Preview ✓ Development |

**Opción B - MODO PRODUCCIÓN (Para clientes reales):**

| Campo | Valor |
|-------|-------|
| Clave | `TEST_MODE` |
| Valor | `false` |
| Ambientes | ✓ Production ✓ Preview ✓ Development |

**¿Cuándo usar cada uno?**

```
TEST_MODE = true  → Los emails llegan a TEST_EMAIL_RECIPIENT
                     Asunto dice [PRUEBA]
                     Ideal para: Desarrollo y pruebas

TEST_MODE = false → Los emails llegan al cliente
                     Asunto normal
                     Ideal para: Clientes reales en producción
```

---

### VARIABLE 3: TEST_EMAIL_RECIPIENT (Email de Prueba)

**Campo:** `TEST_EMAIL_RECIPIENT`
**Valor:**
```
tu-email@gmail.com
```

**Pasos:**
1. Haz clic en **"Add New"**
2. Campo de clave: `TEST_EMAIL_RECIPIENT`
3. Campo de valor: `tu-email@gmail.com` (reemplaza con tu email real)
4. Selecciona ambientes: ✓ Production ✓ Preview ✓ Development
5. Haz clic en **"Save"**

ℹ️ **NOTA:** Este email solo se usa cuando `TEST_MODE = true`. Es donde recibirás los emails de prueba.

---

### VARIABLE 4: PUBLIC_BASE_URL (URL Base del Sistema)

**OPCIÓN A - URL PROVISIONAL (Vercel):**

| Campo | Valor |
|-------|-------|
| Clave | `PUBLIC_BASE_URL` |
| Valor | `https://jerry.ecoflow-pr.com` |
| Ambientes | ✓ Production ✓ Preview ✓ Development |

**Pasos:**
1. Haz clic en **"Add New"**
2. Campo de clave: `PUBLIC_BASE_URL`
3. Campo de valor: `https://jerry.ecoflow-pr.com`
4. Selecciona ambientes: ✓ Production ✓ Preview ✓ Development
5. Haz clic en **"Save"**

⚠️ **IMPORTANTE:** Sin barra final (`/`). Si pones `https://jerry.ecoflow-pr.com/`, los links en el email no funcionarán.

---

## 🌐 CONFIGURAR DOMINIO PERSONALIZADO

### PASO 1: Preparar el Dominio

Necesitas:
- ✅ Dominio: `jerry.ecoflow-pr.com`
- ✅ Acceso al registrador de dominio (GoDaddy, Namecheap, etc.)
- ✅ Acceso a Vercel (ya tienes)

### PASO 2: Agregar Dominio a Vercel

1. En Vercel, ve al proyecto **EcoFlow-PR**
2. Haz clic en **Settings** (engranaje)
3. En el menú lateral, selecciona **Domains**
4. Haz clic en **"Add"**
5. Ingresa: `jerry.ecoflow-pr.com`
6. Haz clic en **"Continue"**

### PASO 3: Verificar Propiedad del Dominio

Vercel mostrará dos opciones:

**OPCIÓN A - Cambiar Nameservers (RECOMENDADO):**

1. Copia los 4 nameservers que Vercel muestra:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```

2. Ve a tu registrador de dominio (GoDaddy, Namecheap, etc.)

3. Busca **"Nameservers"** o **"DNS Settings"**

4. Reemplaza los nameservers actuales con los de Vercel

5. Guarda los cambios

6. Espera 24-48 horas para propagación

**OPCIÓN B - Agregar Registros DNS:**

Si tu registrador no permite cambiar nameservers:

1. Copia el registro **CNAME** que Vercel muestra:
   ```
   CNAME: alias.vercel.com
   ```

2. Ve a tu registrador de dominio

3. Busca **"DNS Records"** o **"CNAME"**

4. Agrega un nuevo registro:
   - **Tipo:** CNAME
   - **Host:** jerry.ecoflow-pr.com
   - **Value:** alias.vercel.com

5. Guarda y espera 24-48 horas

### PASO 4: Verificar Configuración del Dominio

1. En Vercel, ve a **Settings > Domains**
2. Busca `jerry.ecoflow-pr.com`
3. Cuando sea válido, verás un ✅ verde

### PASO 5: Actualizar PUBLIC_BASE_URL

Cuando el dominio esté activo (✅ verde):

1. Ve a **Settings > Environment Variables**
2. Edita `PUBLIC_BASE_URL`
3. Cambia el valor a:
   ```
   https://jerry.ecoflow-pr.com
   ```
4. Haz clic en **"Save"**
5. Vercel auto-redeploy (espera 5-10 minutos)

---

## ✅ VERIFICAR CONFIGURACIÓN

### Checklist de Vercel

- [ ] ✅ `GAS_TOKEN` = `PS-CRM-2024-SECURE-TOKEN`
- [ ] ✅ `TEST_MODE` = `true` o `false`
- [ ] ✅ `TEST_EMAIL_RECIPIENT` = tu email
- [ ] ✅ `PUBLIC_BASE_URL` = URL correcta (sin barra final)
- [ ] ✅ Todas las variables en ambientes: Production, Preview, Development
- [ ] ✅ El deploy más reciente está listo (sin errores)

### Ver Logs de Vercel

1. Ve a **Deployments**
2. Haz clic en el deploy más reciente
3. Ve a **Logs**
4. Busca líneas que empiezan con `[CONFIG]` o `[PRODUCT_LOOKUP]`
5. Deberías ver tus valores cargados

Ejemplo de logs correctos:
```
[CONFIG] TEST_MODE: true
[CONFIG] TEST_EMAIL: jerrypowersolar@gmail.com
[CONFIG] PUBLIC_BASE_URL: https://jerry.ecoflow-pr.com
[CONFIG] URL válida: true
```

---

## 🔄 CAMBIAR ENTRE URLs

### Escenario 1: De PROVISIONAL a OFICIAL

**Paso 1: Verificar dominio en Vercel**
- Settings > Domains
- Ver que `jerry.ecoflow-pr.com` tenga ✅ verde

**Paso 2: Actualizar PUBLIC_BASE_URL**
- Settings > Environment Variables
- Editar `PUBLIC_BASE_URL`
- Cambiar a: `https://jerry.ecoflow-pr.com`
- Guardar

**Paso 3: Esperar redeploy**
- En Deployments, verás que empieza un nuevo deploy
- Espera a que termine (estará listo en 2-5 minutos)

**Paso 4: Probar**
- Rellenar formulario en `https://jerry.ecoflow-pr.com`
- Verificar que funcione todo

---

### Escenario 2: De OFICIAL a PROVISIONAL (si algo falla)

**Paso 1: Actualizar PUBLIC_BASE_URL**
- Settings > Environment Variables
- Editar `PUBLIC_BASE_URL`
- Cambiar a: `https://jerry.ecoflow-pr.com`
- Guardar

**Paso 2: Esperar redeploy**
- En Deployments, verás nuevo deploy
- Espera a que termine

**Paso 3: Probar**
- Rellenar formulario en `https://jerry.ecoflow-pr.com`
- Verificar que funcione

---

## 🐛 SOLUCIONAR PROBLEMAS

### Problema 1: "El email no llega"

**Checklist:**
- [ ] ¿`TEST_MODE = true`?
- [ ] ¿`TEST_EMAIL_RECIPIENT` es correcto?
- [ ] ¿El email está en Spam/Promociones?
- [ ] ¿`GAS_TOKEN` es exactamente `PS-CRM-2024-SECURE-TOKEN`?
- [ ] ¿`PUBLIC_BASE_URL` está sin barra final?
- [ ] ¿El lead se guardó en Google Sheets?

**Solución:**
1. Revisa Logs en Vercel (Deployments > Logs)
2. Busca líneas con `[EMAIL]` o `[ERROR]`
3. Si ves `❌ Error en generación de PDF`, el problema es el PDF
4. Si ves `❌ GAS sendQuoteEmail falló`, el problema es GAS

---

### Problema 2: "Dominio personalizado no funciona"

**Checklist:**
- [ ] ¿El dominio tiene ✅ en Vercel?
- [ ] ¿Han pasado 24-48 horas desde cambiar DNS?
- [ ] ¿Los nameservers están correctamente configurados?

**Solución:**
1. Ve a: https://mxtoolbox.com/
2. Busca tu dominio: `jerry.ecoflow-pr.com`
3. Verifica que apunte a Vercel
4. Si no, vuelve a revisar DNS en tu registrador

---

### Problema 3: "El formulario no envía"

**Checklist:**
- [ ] ¿Todas las variables de entorno están configuradas?
- [ ] ¿El navegador muestra errores (F12 > Console)?
- [ ] ¿La red permite la conexión (sin firewall)?

**Solución:**
1. Abre F12 (Herramientas del Navegador)
2. Ve a la pestaña "Console"
3. Rellena y envía el formulario
4. Copia el error exacto que aparece
5. Comparte con soporte técnico

---

## 📞 REFERENCIA RÁPIDA

| Variable | Provisional | Oficial |
|----------|-------------|---------|
| `GAS_TOKEN` | PS-CRM-2024-SECURE-TOKEN | PS-CRM-2024-SECURE-TOKEN |
| `TEST_MODE` | true | false |
| `TEST_EMAIL_RECIPIENT` | tu@email.com | tu@email.com |
| `PUBLIC_BASE_URL` | https://jerry.ecoflow-pr.com | https://jerry.ecoflow-pr.com |

---

## ✨ PRÓXIMOS PASOS

1. ✅ Configurar todas las variables en Vercel
2. ✅ Esperar a que Vercel redeploy (2-5 minutos)
3. ✅ Hacer prueba de email (ver guía de pruebas)
4. ✅ Cuando funcione, cambiar `PUBLIC_BASE_URL` a dominio oficial
5. ✅ Configurar DNS del dominio personalizado
6. ✅ Esperar 24-48 horas para propagación
7. ✅ Cambiar a producción (`TEST_MODE = false`)

---

## 🆘 NECESITAS AYUDA?

Si algo no funciona después de seguir esta guía:

1. Toma una captura de pantalla de:
   - ✅ Las variables en Vercel
   - ✅ Los logs de error
   - ✅ El mensaje en el navegador

2. Verifica que:
   - ✅ No haya errores de tipografía
   - ✅ No haya espacios al principio/final
   - ✅ Las URLs no tengan barra final (`/`)

3. Contacta con soporte técnico y comparte:
   - La captura
   - El paso exacto donde falla
   - El log completo del error
