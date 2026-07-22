# 🧪 GUÍA RÁPIDA DE PRUEBA - EMAIL Y COTIZACIÓN

## ⚡ PRUEBA EN 5 MINUTOS

### PASO 1: Verificar Variables en Vercel (1 minuto)

1. Ve a: **https://vercel.com/dashboard**
2. Abre proyecto **EcoFlow-PR**
3. Haz clic en **Settings** → **Environment Variables**
4. Verifica que existan EXACTAMENTE estas 4:

```
✅ GAS_TOKEN = PS-CRM-2024-SECURE-TOKEN
✅ TEST_MODE = true
✅ TEST_EMAIL_RECIPIENT = tu-email@gmail.com
✅ PUBLIC_BASE_URL = https://jerry.ecoflow-pr.com
```

❌ Si falta alguna, AGRÉGALAS AHORA (ver sección "Agregar Variables" abajo)

---

### PASO 2: Script de Prueba (2 minutos)

Abre tu navegador y ve a: **https://jerry.ecoflow-pr.com**

Abre la consola: **Presiona F12** → pestaña **Console**

Copia y pega EXACTAMENTE esto:

```javascript
const testPayload = {
  nombre: "Test Cliente Prueba",
  email: "tu-email-real@gmail.com",
  telefono: "7875551234",
  pueblo: "San Juan",
  producto: "Batería para apartamento (Delta 2 Max)",
  origen: "Test Manual"
};

console.log("📤 Enviando test...");
fetch('/api/lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload)
})
  .then(res => res.json())
  .then(data => {
    console.log("✅ RESPUESTA:", JSON.stringify(data, null, 2));
    if (data.quoteId) console.log("🎉 COTIZACIÓN ID:", data.quoteId);
  })
  .catch(err => console.error("❌ ERROR:", err));
```

Presiona **ENTER**

---

### PASO 3: Verificar Resultado (1 minuto)

En la consola deberías ver:

```
📤 Enviando test...
✅ RESPUESTA: {
  "ok": true,
  "leadId": "L-XXXXX",
  "quoteStatus": "enviada",
  "quoteId": "QXXXXX"
}
🎉 COTIZACIÓN ID: QXXXXX
```

**SI VES ESTO = ✅ ÉXITO!**

---

### PASO 4: Revisar Email (1 minuto)

**En TEST_MODE = true, el email llega a TEST_EMAIL_RECIPIENT**

1. Abre tu email (el que pusiste en TEST_EMAIL_RECIPIENT)
2. Busca el email con asunto: **[PRUEBA] Cotización EcoFlow — DELTA 2 Max**
3. Verifica que incluya:
   - ✅ Tu nombre
   - ✅ Capacidad: 2048Wh (2 kWh)
   - ✅ Horas de uso: Abanico ~40h, Nevera ~13h, TV ~25h, Los 3 ~5h
   - ✅ Dimensiones: 15.2" × 8.1" × 8.8"
   - ✅ Volumen: 1.27 ft³
   - ✅ Peso: 23 kg
   - ✅ Precio: $2,998 USD
   - ✅ 📎 PDF ADJUNTO
   - ✅ Botones "Me interesa" y "No me interesa"

**SI TIENES TODO = ✅ FUNCIONA PERFECTAMENTE!**

---

## 🆘 SI ALGO NO FUNCIONA

### Error 1: "No puedo enviar el formulario"

**Solución:**
1. F12 → Console
2. Busca línea roja (error)
3. Copia el error completo
4. Verifica en Vercel → Deployments → Logs

**Causas comunes:**
- ❌ Falta `PUBLIC_BASE_URL` en Vercel
- ❌ El valor tiene espacio al final: `https://jerry.ecoflow-pr.com/` (con barra)
- ❌ Falta `GAS_TOKEN`

---

### Error 2: "El lead se guarda pero NO llega email"

**Checklist:**
- [ ] ¿`TEST_MODE = true`? (Si es false, va al email del cliente)
- [ ] ¿`TEST_EMAIL_RECIPIENT` es TU email real?
- [ ] ¿Revisar Spam/Promociones?
- [ ] ¿El lead SÍSÍ se guardó en Google Sheets?

**Si el lead NO se guardó:**
- F12 → Console
- Busca error en respuesta
- Verifica `GAS_TOKEN` exacto

**Si el lead SÍ se guardó pero NO email:**
- Vercel → Logs → Busca `[EMAIL]`
- Si ves `[EMAIL] ✅ Cotización enviada`, pero no llega:
  - El problema es GAS (Google Apps Script)
  - Revisar que GAS_TOKEN sea correcto

---

### Error 3: "El PDF no se adjunta"

**Si ves el email pero SIN PDF:**

1. F12 → Console → Script de prueba
2. Busca línea: `[PDF] ✅ PDF generado exitosamente`
3. Si NO aparece:
   - Hay error en generación del PDF
   - Busca línea: `[PDF] ❌ Error`
4. Si APARECE pero NO se adjunta en email:
   - Problema en GAS
   - Verifica que `pdfBase64` se está enviando

---

## ✅ AGREGAR VARIABLES EN VERCEL (SI FALTAN)

### Método 1: Por Dashboard (Recomendado)

1. Ve a: **https://vercel.com/dashboard**
2. Proyecto **EcoFlow-PR** → **Settings** → **Environment Variables**
3. Haz clic en **"Add New"** para cada variable:

**Variable 1:**
- Key: `GAS_TOKEN`
- Value: `PS-CRM-2024-SECURE-TOKEN`
- Environments: ✓ Production ✓ Preview ✓ Development
- **Save**

**Variable 2:**
- Key: `TEST_MODE`
- Value: `true`
- Environments: ✓ Production ✓ Preview ✓ Development
- **Save**

**Variable 3:**
- Key: `TEST_EMAIL_RECIPIENT`
- Value: `tu-email@gmail.com` (TÚ CORREO REAL)
- Environments: ✓ Production ✓ Preview ✓ Development
- **Save**

**Variable 4:**
- Key: `PUBLIC_BASE_URL`
- Value: `https://jerry.ecoflow-pr.com`
- Environments: ✓ Production ✓ Preview ✓ Development
- **Save**

4. Espera a que Vercel redeploy (automático, 2-5 minutos)

---

## 📊 VERIFICAR EN GOOGLE SHEETS

Después de hacer la prueba, verifica que el lead se guardó:

1. Abre tu Google Sheet (Leads)
2. Busca la última fila
3. Deberías ver:
   - **Nombre:** Test Cliente Prueba
   - **Email:** tu-email@gmail.com
   - **Teléfono:** 7875551234
   - **Pueblo:** San Juan
   - **Producto:** Batería para apartamento (Delta 2 Max)
   - **Estado:** Nuevo (o similar)

Si NO aparece:
- Error en `addLead` (GAS)
- Verifica `GAS_TOKEN` en Vercel

---

## 🔄 CAMBIAR A PRODUCCIÓN (Cuando esté listo)

Una vez que TODO funciona y quieras recibir cotizaciones REALES:

### Cambio 1: TEST_MODE

En Vercel → Environment Variables:
- Edita `TEST_MODE`
- Cambiar de: `true`
- A: `false`
- Save

Ahora los emails llegarán al email real del cliente (no a TEST_EMAIL_RECIPIENT)

### Cambio 2: Dominio Oficial (Opcional)

Cuando tengas `jerry.ecoflow-pr.com` configurado:

En Vercel → Environment Variables:
- Edita `PUBLIC_BASE_URL`
- Cambiar de: `https://jerry.ecoflow-pr.com`
- A: `https://jerry.ecoflow-pr.com`
- Save

---

## 🚀 FLUJO COMPLETO DE PRUEBA

```
1. ✅ Configurar variables en Vercel
   ↓
2. ✅ Esperar redeploy (2-5 min)
   ↓
3. ✅ Ir a jerry.ecoflow-pr.com
   ↓
4. ✅ Abrir Console (F12)
   ↓
5. ✅ Pegar script de prueba
   ↓
6. ✅ Presionar ENTER
   ↓
7. ✅ Ver "quoteStatus: enviada" ✅
   ↓
8. ✅ Revisar email en TEST_EMAIL_RECIPIENT
   ↓
9. ✅ Verificar PDF adjunto
   ↓
10. ✅ TODO FUNCIONA! 🎉
```

---

## 📞 CONTACTO SI FALLA

Si después de todo esto sigue sin funcionar:

1. Toma screenshot de:
   - Console del navegador (F12)
   - Variables en Vercel
   - Email que intentaste recibir

2. Verifica que:
   - ✅ No haya typos en variables
   - ✅ No haya espacios antes/después
   - ✅ No haya barra final en URLs

3. Contacta con soporte y comparte:
   - Los screenshots
   - El error exacto
   - El paso donde falla

---

## ⏱️ TIEMPO ESTIMADO

- Configurar variables: 2 minutos
- Esperar redeploy: 5 minutos
- Hacer prueba: 1 minuto
- Recibir email: 1-3 minutos

**TOTAL: 9-11 minutos** ⏰
