import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://gruposofia54.com',
  trailingSlash: 'always',
  build: {
    // Genera /pagina/index.html en lugar de /pagina.html → URLs limpias con barra final,
    // idénticas a la estructura actual de WordPress (/sobre-nosotros/, /contacto/...).
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Prioridades y frecuencia de cambio para SEO
      changefreq: 'monthly',
      lastmod: new Date(),
      // Excluir del sitemap las páginas legales (van con noindex y bloqueadas en
      // robots.txt). Así buscadores no reciben señales contradictorias.
      filter: (page) =>
        !page.includes('/aviso-legal/') &&
        !page.includes('/politica-de-privacidad/') &&
        !page.includes('/politica-de-cookies/'),
      serialize(item) {
        if (item.url === 'https://gruposofia54.com/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/nuestras-naves/')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (
          item.url.includes('/aviso-legal/') ||
          item.url.includes('/politica-')
        ) {
          item.priority = 0.2;
          item.changefreq = 'yearly';
        } else {
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
});
