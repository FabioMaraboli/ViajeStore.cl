# 🍟 ViajeStore - Integración de Reseñas

Sistema de reseñas de Google Maps e Instagram implementado con Vercel Serverless Functions.

## 📋 Características

- ✅ **Reseñas de Google Maps** con rating, estrellas y comentarios completos
- ✅ **Posts de Instagram** con imágenes, likes y comentarios
- ✅ **Datos de ejemplo (Mock)** para testing sin APIs
- ✅ **Cache** de 6-12 horas para optimizar rendimiento
- ✅ **Responsive** - funciona perfecto en mobile, tablet y desktop
- ✅ **Serverless** - API keys seguras, nunca expuestas en el frontend

## 🚀 Testing Rápido (Sin APIs)

El sitio **funciona inmediatamente** con datos de ejemplo. Solo abre `index.html` en tu navegador:

```bash
# Opción 1: Doble click en index.html

# Opción 2: Live Server (VSCode)
# Click derecho > Open with Live Server
```

Verás la sección de reseñas con **datos de prueba** antes del footer.

## 🔧 Setup Completo (Con APIs Reales)

### Pre-requisitos

- Node.js 18+ instalado
- Cuenta Google Cloud Platform
- Cuenta Instagram Business
- Cuenta Vercel (gratis)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   copy .env.example .env
   ```

2. Completa las credenciales en `.env`:

#### Google Maps API
   - Ir a [Google Cloud Console](https://console.cloud.google.com)
   - Crear proyecto "ViajeStore"
   - Habilitar "Places API"
   - Crear API Key
   - Buscar tu negocio en Google Maps y copiar Place ID
   - Pegar en `.env`:
     ```
     GOOGLE_MAPS_API_KEY=AIzaSyD_xxxxx...
     GOOGLE_PLACE_ID=ChIJxxxxx...
     ```

#### Instagram Graph API
   - Ir a [Meta for Developers](https://developers.facebook.com)
   - Crear App tipo "Business"
   - Agregar "Instagram Graph API"
   - Generar Access Token (long-lived, 60 días)
   - Obtener Account ID
   - Pegar en `.env`:
     ```
     INSTAGRAM_ACCESS_TOKEN=IGBusiness_xxxxx...
     INSTAGRAM_ACCOUNT_ID=17841407311320059
     ```

### Paso 3: Desarrollo Local

```bash
# Iniciar servidor local con Vercel Dev
vercel dev
```

Abrir: `http://localhost:3000`

Testear endpoints:
- `http://localhost:3000/api/google-reviews`
- `http://localhost:3000/api/instagram-posts`

### Paso 4: Deployment a Producción

```bash
# Deploy a Vercel
vercel

# Configurar variables de entorno en Vercel Dashboard:
# https://vercel.com/tu-proyecto/settings/environment-variables
```

Agregar las mismas variables de `.env` en el dashboard de Vercel.

## 📂 Estructura de Archivos

```
ViajeStore HTML/
├── index.html              # HTML principal con sección reviews
├── css/
│   ├── style.css          # Estilos base existentes
│   └── reviews.css        # ✨ Nuevo: Estilos de reseñas
├── js/
│   ├── main.js            # JavaScript principal existente
│   └── reviews.js         # ✨ Nuevo: Lógica de reseñas
├── api/                   # ✨ Nuevo: Serverless Functions
│   ├── google-reviews.js  # Endpoint Google Maps
│   └── instagram-posts.js # Endpoint Instagram
├── vercel.json            # ✨ Nuevo: Config Vercel
├── package.json           # ✨ Nuevo: Dependencies
├── .env.example           # Template para variables
├── .env                   # Variables reales (NO COMMITEAR)
└── .gitignore             # ✨ Nuevo: Proteger .env
```

## 🎨 Cómo Funciona

### Frontend (reviews.js)

1. Al cargar la página, intenta llamar a `/api/google-reviews`
2. Si la API no está disponible, usa **datos mock automáticamente**
3. Renderiza las tarjetas de reseñas dinámicamente
4. Tabs permiten cambiar entre Google Maps e Instagram

### Backend (Serverless Functions)

1. Recibe petición `GET /api/google-reviews`
2. Verifica cache (6h para Google, 12h para Instagram)
3. Si no hay cache, llama a la API externa con la key secreta
4. Parsea y retorna JSON limpio al frontend
5. El frontend nunca ve las API keys 🔒

## 🔒 Seguridad

- ✅ API Keys **nunca** expuestas en código frontend
- ✅ `.env` en `.gitignore` (no se sube a GitHub)
- ✅ CORS configurado solo para dominios permitidos
- ✅ Cache reduce llamadas a APIs (ahorra costos)
- ✅ Rate limiting en Vercel (100 req/min gratis)

## 📱 Responsive

La sección de reseñas es **completamente responsive**:

- **Desktop (1920px+)**: Grid de 3 columnas
- **Tablet (768px)**: Grid de 2 columnas  
- **Mobile (< 768px)**: 1 columna, stacked vertical

## 🐛 Troubleshooting

### "Las reseñas no cargan"

1. Abre DevTools (F12) > Console
2. Verifica errores
3. Si dice "API not available" → Está usando mock data (normal sin configuración)
4. Si necesitas APIs reales, sigue el Setup Completo

### "Error 500 en /api/google-reviews"

1. Verifica que `.env` existe y tiene todas las variables
2. Verifica que las API keys son válidas
3. Revisa logs: `vercel logs`

### "Instagram token expiró"

Los tokens de Instagram expiran cada 60 días:
1. Generar nuevo token en Meta Developers
2. Actualizar en `.env` local
3. Actualizar en Vercel Dashboard > Environment Variables
4. Redeploy: `vercel --prod`

## 📊 APIs Usadas

- [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)

## 🎯 Próximos Pasos

1. ✅ Estructura básica funcional con mock data
2. ⏳ Configurar APIs reales (necesitas credenciales)
3. ⏳ Deploy a Vercel
4. ⏳ Dominio personalizado (opcional)

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa logs de Vercel: `vercel logs`
3. Verifica que las variables de entorno están correctas

---

**Nota:** El sitio funciona perfectamente con datos de ejemplo sin necesidad de configurar APIs. Las APIs reales son opcionales para mostrar contenido dinámico en producción.
