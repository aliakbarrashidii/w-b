
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Project = require('../models/Project');
const PageSeo = require('../models/PageSeo');
const Settings = require('../models/Settings');
const config = require('../config');

const SERVICE_IDS = ['web-design', 'app-design', 'graphic', 'seo', 'ads', 'marketing'];

function staticRoutes() {
  return [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/services', priority: '0.9', changefreq: 'weekly' },
    ...SERVICE_IDS.map(id => ({ path: `/services/${id}`, priority: '0.8', changefreq: 'weekly' })),
    { path: '/portfolio', priority: '0.8', changefreq: 'weekly' },
    ...SERVICE_IDS.map(id => ({ path: `/portfolio/${id}`, priority: '0.7', changefreq: 'weekly' })),
    { path: '/team', priority: '0.6', changefreq: 'monthly' },
    { path: '/packages', priority: '0.8', changefreq: 'weekly' },
    ...SERVICE_IDS.map(id => ({ path: `/packages/${id}`, priority: '0.7', changefreq: 'weekly' })),
    ...SERVICE_IDS.map(id => ({ path: `/calculator/${id}`, priority: '0.6', changefreq: 'monthly' })),
    { path: '/blog', priority: '0.8', changefreq: 'daily' },
    { path: '/projects', priority: '0.7', changefreq: 'weekly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  ];
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [blogs, projects, overrides, settings] = await Promise.all([
      Blog.find({ published: true }).select('_id slug updatedAt createdAt'),
      Project.find({ published: true }).select('_id slug updatedAt createdAt'),
      PageSeo.find(),
      Settings.findOne(),
    ]);

    if (settings && settings.siteIndexable === false) {
      // سایت هنوز در حال توسعه‌ست و نباید ایندکس بشه — سایت‌مپ خالی برگردون
      res.set('Content-Type', 'application/xml');
      return res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n');
    }

    const noindexPaths = new Set(overrides.filter(o => o.noindex).map(o => o.path));
    const now = new Date().toISOString();

    const routes = [
      ...staticRoutes().filter(r => !noindexPaths.has(r.path)),
      ...blogs.map(b => ({ path: `/blog/${b.slug || b._id}`, priority: '0.6', changefreq: 'monthly', lastmod: b.updatedAt || b.createdAt })),
      ...projects.map(p => ({ path: `/projects/${p.slug || p._id}`, priority: '0.6', changefreq: 'monthly', lastmod: p.updatedAt || p.createdAt })),
    ];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${config.siteUrl}${r.path}</loc>
    <lastmod>${r.lastmod ? new Date(r.lastmod).toISOString() : now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
    res.set('Content-Type', 'application/xml');
    res.send(body);
  } catch (e) {
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>' + e.message + '</error>');
  }
});

router.get('/robots.txt', async (req, res) => {
  const settings = await Settings.findOne().catch(() => null);
  const blocked = settings && settings.siteIndexable === false;
  res.set('Content-Type', 'text/plain');
  if (blocked) {
    return res.send('User-agent: *\nDisallow: /\n');
  }
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: ${config.siteUrl}/sitemap.xml
`);
});

module.exports = router;
