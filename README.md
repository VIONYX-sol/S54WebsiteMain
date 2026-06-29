# Web Grupo Sofía54 — Astro + Azure Static Web Apps

Sitio web corporativo de **Grupo Sofía54** reconstruido como **web estática en
código** (Astro), pensada para desplegarse en **Azure Static Web Apps** dentro
de la infraestructura de VIONYX.

Sustituye a la versión actual en WordPress + Elementor (alojada en Lugo
Internet). Réplica fiel de colores, estructura, contenido y copys de la web
publicada, con **SEO + GEO** configurados y un **panel de edición** (`/admin`)
para que el contenido se gestione sin tocar código.

---

## 1. Por qué este cambio (resumen de la decisión)

La web actual funciona, pero arrastra tres problemas:

1. **Vídeo lento.** Los `.mp4` de las naves se sirven desde GitHub vía
   `raw.githubusercontent.com`, que **no es un CDN**, no admite *range-requests*
   y limita el *hotlinking*. Es la causa principal de que los vídeos tarden.
2. **Edición pesada.** Subir fotos/vídeos por WordPress + Elementor se atasca,
   y el hosting compartido de Lugo ya va por la mitad de disco (2,4 GB / 5 GB).
3. **Posicionamiento.** El `<title>` y los metadatos actuales son mínimos.

Migrar a estático en Azure resuelve velocidad, infraestructura, SSL, SEO y deja
la web **en un repositorio nuestro** — base sólida sobre la que Spark Markets
puede construir su capa de marketing. La contrapartida (importante y asumida):
**se abandona el editor visual de Elementor**; a partir de aquí el contenido se
edita por el panel `/admin` (CMS) o por código.

> ⚠️ **Decisión de una sola dirección.** WordPress y Azure Static Web Apps son
> mundos distintos: Azure SWA **no ejecuta WordPress**. Una vez se haga el
> *cutover*, volver atrás implica rehacer trabajo. Conviene mantener el sitio
> actual de Lugo intacto hasta validar el nuevo en un entorno de prueba.

---

## 2. Stack y estructura

- **Astro 4** (generador de sitios estáticos) + **@astrojs/sitemap**.
- HTML/CSS/JS estándar. **Sin** jQuery, **sin** dependencia de WordPress.
- Las páginas de **Inicio** y **Nuestras Naves** conservan su HTML/CSS/JS
  original (el sistema de filtros, carrusel y *lightbox* de naves es JS *vanilla*
  ya existente). **Sobre Nosotros** y **Contacto** se han reconstruido con un
  sistema de estilos compartido.

```
sofia54-web/
├── astro.config.mjs          # Config Astro: site, sitemap (prioridades/filtros)
├── staticwebapp.config.json  # Azure SWA: cabeceras de seguridad, caché, rutas
├── .github/workflows/        # CI/CD: despliegue automático a Azure
├── public/
│   ├── admin/                # Panel de edición (Decap CMS) → /admin
│   ├── assets/               # Logos (provisionales en SVG, sustituir por PNG)
│   ├── favicon.svg
│   └── robots.txt
└── src/
    ├── data/
    │   ├── site.ts           # ⭐ FUENTE ÚNICA DE VERDAD (contacto, SEO, CDN...)
    │   └── complejos.json    # ⭐ Catálogo de complejos y naves
    ├── components/           # Seo, Header, Footer
    ├── layouts/Base.astro    # Plantilla común + datos estructurados (schema.org)
    ├── styles/pages.css       # Estilos compartidos de páginas de contenido
    └── pages/                # Una página = un archivo
        ├── index.astro                 # Inicio  (/)
        ├── nuestras-naves.astro        # Naves   (/nuestras-naves/)
        ├── sobre-nosotros.astro        # (/sobre-nosotros/)
        ├── contacto.astro              # (/contacto/)
        ├── aviso-legal.astro           # legal (noindex)
        ├── politica-de-privacidad.astro
        ├── politica-de-cookies.astro
        └── 404.astro
```

**Dos archivos concentran casi todo lo editable:**
`src/data/site.ts` (datos globales y la base de medios) y
`src/data/complejos.json` (las naves). Tocar la web a gran escala = tocar estos
dos.

---

## 3. Arranque en local

Requisitos: **Node.js 20** (o superior) y npm.

```bash
npm install        # instala dependencias
npm run dev        # servidor de desarrollo → http://localhost:4321
npm run build      # genera la web final en /dist
npm run preview    # sirve /dist para revisarla antes de publicar
```

`npm run build` debe terminar con `8 page(s) built` y crear
`dist/sitemap-index.xml`. Si falla, no publicar.

---

## 4. Desplegar en Azure Static Web Apps

1. En el **portal de Azure** → *Create resource* → **Static Web App**.
   - Plan: **Free** es suficiente para empezar (incluye SSL y CDN global).
   - Región: la más cercana (p. ej. *West Europe*).
   - *Deployment source*: **GitHub** → autoriza y elige el repo
     `VIONYX-sol/sofia54-web` y la rama `main`.
   - *Build presets*: **Astro** (o *Custom*) con:
     - **App location**: `/`
     - **Output location**: `dist`
2. Azure crea automáticamente el *workflow* de GitHub Actions y el secreto
   `AZURE_STATIC_WEB_APPS_API_TOKEN`. Este repo **ya incluye** su propio
   workflow en `.github/workflows/azure-static-web-apps.yml`; si Azure genera
   otro distinto, conserva **solo uno** para no duplicar despliegues.
3. A partir de ahí, **cada push a `main` publica** y **cada Pull Request genera
   una previsualización** con URL propia (ideal para que Spark revise cambios
   antes de que entren en producción).

---

## 5. Dominio y *cutover* desde Lugo Internet

El dominio `gruposofia54.com` está **registrado en Lugo Internet**. No hace falta
mover el registro; basta con apuntar el DNS a Azure cuando el sitio nuevo esté
validado.

1. En Azure SWA → *Custom domains* → añade `gruposofia54.com` y
   `www.gruposofia54.com`. Azure indica los registros DNS a crear.
2. En el **panel DNS de Lugo Internet**, crea/actualiza esos registros
   (normalmente un `CNAME` para `www` y la validación `TXT`; para el dominio raíz,
   Azure ofrece `ALIAS`/`A` según el caso).
3. Espera la propagación y a que Azure emita el **certificado SSL** (gratuito y
   automático).
4. **Plan de cero caídas:** valida primero en la URL `*.azurestaticapps.net` y en
   una previsualización; haz el cambio de DNS solo cuando todo esté revisado.
   Mantén el WordPress de Lugo encendido unos días por seguridad antes de
   darlo de baja.

---

## 6. Medios (fotos, vídeos, PDFs): el cambio más importante

**Estado actual:** todo el material vive en el repo
`VIONYX-sol/VYX-s54_website-nuestras_naves` y se sirve por
`raw.githubusercontent.com`. La constante que lo controla es `MEDIA_BASE` en
`src/data/site.ts`. Funciona, pero **no es apto para producción a escala** (sin
CDN real, sin SLA, vídeo lento).

**Recomendación (hacer al escalar a las 60+ naves):**

1. **Fotos y PDFs → Azure Blob Storage + Azure CDN** (o Front Door). Sube el
   material respetando la misma estructura de carpetas y cambia **solo**
   `MEDIA_BASE` por la URL del CDN, p. ej.:
   ```ts
   export const MEDIA_BASE = 'https://cdn.gruposofia54.com/complejos/';
   ```
   No hay que tocar nada más: todas las rutas de la web derivan de esa base.
2. **Vídeo → servicio de streaming.** El vídeo `.mp4` directo es el cuello de
   botella aunque esté en CDN. Opciones: **Azure Media** / **Cloudflare Stream**
   / **Bunny Stream** (entregan en *adaptive bitrate*, cargan al instante). Sube
   los vídeos allí y sustituye en `complejos.json` la ruta del `video` por la URL
   del *player*/HLS.

> En el panel `/admin`, las rutas de medios de naves son **texto** (la ruta
> relativa al CDN), no subidas al repo. Así el material pesado nunca engorda el
> repositorio.

---

## 7. Activos pendientes de copiar (rápido pero necesario)

La web usa **logos provisionales en SVG**. Antes de publicar, sustitúyelos por
los oficiales (copiándolos a `public/assets/` con estos nombres exactos):

| Archivo destino                 | Qué es                          | De dónde sale |
|---------------------------------|----------------------------------|---------------|
| `public/assets/logo-azul.svg`   | Logo cabecera (fondo claro)      | Logo oficial del grupo |
| `public/assets/logo-blanco.svg` | Logo pie (fondo oscuro)          | Versión en blanco (la del WordPress: `Logo-PNG-en-BLANCO`) |
| `public/favicon.svg`            | Icono de pestaña                 | Marca |
| `public/assets/og-default.jpg`  | Imagen 1200×630 al compartir en redes | Crear (foto de nave + logo) |

Si prefieres mantener los PNG en lugar de SVG, cópialos con esos nombres
(`.png`) y actualiza las rutas en `BRAND`, dentro de `src/data/site.ts`.

---

## 8. Cómo añadir o editar una nave

**Opción A — Panel `/admin` (recomendado para Spark / equipo no técnico).**
Ir a `tudominio/admin`, entrar en *Catálogo de naves → Complejos y naves*,
añadir/editar y guardar. El cambio se convierte en un *commit* y se publica solo.

**Opción B — Por código.** Editar `src/data/complejos.json`: cada complejo
contiene un array `naves`. Añadir una nave = añadir un objeto al array. Las rutas
de `fotos`, `video`, `ficha` y `planos` son **relativas a `MEDIA_BASE`** (solo la
parte final, no la URL completa).

---

## 9. Activar el CMS (`/admin`) — configuración única

El panel usa **Decap CMS** con backend de **GitHub**, que requiere un pequeño
**proxy OAuth** (una sola vez):

- **Para probar en local sin OAuth:** en una terminal `npx decap-server` y en
  otra `npm run dev`; el panel funcionará en `localhost:4321/admin`.
- **Para producción:** despliega un proxy OAuth (puede ser una **Azure
  Function**; encaja con el discurso de "nosotros ponemos la infraestructura") y
  pon su URL en `base_url` dentro de `public/admin/config.yml`. Ajusta también
  `repo:` al nombre real del repositorio.

> *Mejora futura opcional:* migrar el catálogo a **Astro Content Collections**
> (un archivo por complejo) para una edición aún más cómoda en el panel. No es
> necesario para publicar; la versión actual ya es plenamente editable.

---

## 10. SEO y GEO incluidos

- `<title>` y *meta description* únicos por página (`src/components/Seo.astro`).
- **Open Graph** y **Twitter Card** para compartir en redes/WhatsApp.
- **Datos estructurados schema.org** (`RealEstateAgent` + `WebSite`) inyectados
  en todas las páginas desde `Base.astro`, con dirección, teléfono, email y
  **`areaServed`** (Alcobendas, Alcalá de Henares, San Fernando de Henares,
  Leganés, Comunidad de Madrid) → señal **GEO** local.
- `geo.region = ES-MD` en las cabeceras.
- **Sitemap** automático (`/sitemap-index.xml`) con prioridades por página y
  **excluyendo** las páginas legales.
- `robots.txt` apuntando al sitemap y bloqueando las páginas legales.
- URLs limpias con barra final (`/sobre-nosotros/`), idénticas a las actuales →
  no se pierde el posicionamiento ya ganado.

**Pendiente de datos reales para rematar SEO local:** dar de alta / enlazar el
**perfil de Google Business** y, si se desea analítica, añadir Plausible o Azure
Application Insights (y entonces declarar la cookie en la política).

---

## 11. Formulario de contacto

La web es estática (no hay PHP). El formulario de `/contacto/` está preparado
para enviar a un backend definido en `CONTACT_FORM_ENDPOINT` (`src/data/site.ts`):

- **Mientras ese valor esté vacío**, el formulario **igual funciona**: compone el
  mensaje y abre el gestor de correo del usuario hacia `administracion@…`. Nunca
  queda "muerto".
- **Para recibir los envíos como email automático**, pon en
  `CONTACT_FORM_ENDPOINT` la URL de una **Azure Function** o de un servicio tipo
  **Formspree / Web3Forms** (alta en minutos).

Email y teléfono directos están siempre visibles, así que el contacto funciona
desde el primer momento.

---

## 12. Páginas legales — IMPORTANTE

`aviso-legal`, `politica-de-privacidad` y `politica-de-cookies` están creadas con
la **estructura exigida** por la LSSI-CE y el RGPD, pero **con textos de relleno
entre corchetes**. No son textos legales válidos: **deben redactarlos / validarlos
la asesoría jurídica del grupo** antes de publicar. Van marcadas `noindex`.

---

## Resumen de lo que falta para ir a producción

1. Copiar los **logos oficiales** y crear la **imagen OG** (sección 7).
2. **Migrar los medios** a Azure Blob/CDN y el **vídeo** a streaming (sección 6).
3. Crear el recurso **Azure SWA** y conectar el repo (sección 4).
4. **Apuntar el DNS** de Lugo a Azure y emitir SSL (sección 5).
5. Montar el **proxy OAuth** del CMS y, si se quiere, el **backend del
   formulario** (secciones 9 y 11).
6. **Textos legales** definitivos (sección 12).
7. Dar de alta **Google Business** y, opcionalmente, analítica (sección 10).

---

*Hecho por VIONYX para Grupo Sofía54.*
