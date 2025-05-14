import fs from 'fs';
import nunjucks from 'nunjucks';

nunjucks.configure('templates', { autoescape: true });
const prodotti = JSON.parse(fs.readFileSync('data/prodotti.json'));

for (const p of prodotti) {
  const html = nunjucks.render('scheda.njk', { p, lang: 'it' });
  const dir = `dist/${p.slug}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/index.html`, html);
}

const urls = prodotti.map(
  p => `<url><loc>https://laion90.github.io/compara-prodotti/${p.slug}/</loc></url>`
).join('');
fs.writeFileSync('dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
);

console.log('HTML generato:', prodotti.length);
