/**
 * Configuración global de la web de Grupo Sofía54.
 * Fuente única de verdad para datos de contacto, SEO, redes y base de medios.
 *
 * Editar aquí cambia toda la web a la vez (cabecera, pie, datos estructurados, etc.).
 */

export const SITE = {
  name: 'Grupo Sofía54',
  legalName: 'Grupo SOFIA54',
  // Texto que acompaña al <title> de cada página: "Página | Grupo Sofía54"
  titleSuffix: 'Grupo Sofía54',
  url: 'https://gruposofia54.com',
  locale: 'es_ES',
  lang: 'es',

  // Descripción por defecto (se usa si una página no define la suya)
  description:
    'Grupo Sofía54 gestiona y alquila más de 60 naves industriales propias en la Comunidad de Madrid. Más de 40 años de experiencia. Espacios reformados y listos para entrar en Alcobendas, Alcalá de Henares, San Fernando de Henares y Leganés.',

  // Frase de marca (pie de página)
  tagline:
    'SOFIA54 es un grupo empresarial especializado en el alquiler y gestión de naves industriales en la Comunidad de Madrid.',
} as const;

export const CONTACT = {
  address: {
    street: 'Calle Rodríguez San Pedro, 23, Bajo B',
    postalCode: '28015',
    city: 'Madrid',
    region: 'Comunidad de Madrid',
    country: 'ES',
  },
  phone: '+34 914 475 113',
  phoneRaw: '+34914475113',
  email: 'administracion@gruposofia54.com',

  // Contactos directos (página de Contacto)
  team: [
    {
      name: 'Jose Antonio Martín Borregón',
      role: 'Consejero Delegado',
      email: 'jamborregon@gruposofia54.com',
    },
    {
      name: 'Juan Carlos Martín Borregón',
      role: 'Director Comercial y Técnico',
      email: 'jcmartinborregon@gruposofia54.com',
    },
    {
      name: 'Jose Ramón Corregel',
      role: 'Controller',
      email: 'jrcorregel@gruposofia54.com',
    },
    {
      name: 'Patricia Gutierrez',
      role: 'Contabilidad',
      email: 'patriciag@gruposofia54.com',
    },
  ],
} as const;

/**
 * Áreas geográficas que sirve el grupo (GEO / SEO local).
 * Se usan en los datos estructurados (LocalBusiness areaServed) y en contenido.
 */
export const AREAS_SERVED = [
  'Alcobendas',
  'Alcalá de Henares',
  'San Fernando de Henares',
  'Leganés',
  'Comunidad de Madrid',
] as const;

/**
 * BASE DE MEDIOS (imágenes, vídeos, PDFs de fichas y planos).
 *
 * Base actual: material local del repositorio (servido por Azure Static Web Apps).
 * Si en el futuro se migra a CDN externa, basta con cambiar esta constante.
 */
export const MEDIA_BASE =
  '/materialvisual/VYX-s54_website-nuestras_naves-main/Complejos/';

/**
 * Logotipo. Los PNG actuales están en el repo de WordPress; cópialos a /public/assets/.
 * (Ver README → "Activos pendientes de copiar".)
 */
export const BRAND = {
  logoWhite: '/assets/logo-blanco.png',
  logoDark: '/assets/logo-azul.png',
  favicon: '/favicon.png',
  ogImage: '/assets/og-default.jpg', // 1200×630 para compartir en redes (pendiente de crear)
} as const;

/**
 * ENDPOINT DEL FORMULARIO DE CONTACTO.
 *
 * La web es estática (no hay PHP). Para que el formulario envíe correos hay
 * dos caminos recomendados:
 *   1) Azure Functions (Static Web Apps trae funciones gestionadas integradas).
 *   2) Un servicio externo tipo Formspree / Web3Forms (alta en minutos).
 *
 * Pega aquí la URL del endpoint. MIENTRAS ESTÉ VACÍO (''), el formulario
 * funciona igualmente: compone el mensaje y abre el cliente de correo del
 * usuario (mailto:) hacia CONTACT.email. Así nunca queda "muerto".
 */
export const CONTACT_FORM_ENDPOINT = '/api/contact';
