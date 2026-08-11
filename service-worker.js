const CACHE='uhh-9-4-guardian-development-2026-08-11-b';
const PRECACHE=["./", "./assets/styles.css", "./assets/site.js", "./assets/guardian.js", "./assets/barcode-scanner.js", "./manifest.webmanifest", "./30-day-plan.html", "./404.html", "./about.html", "./additives.html", "./community.html", "./daily-portal.html", "./digestive-conditions.html", "./evidence.html", "./faq.html", "./food-checker.html", "./food-guide.html", "./global-health.html", "./guardian-lab.html", "./guardian-welcome.html", "./gut-health.html", "./index.html", "./ingredient-library.html", "./labels.html", "./learn.html", "./legal.html", "./member-home.html", "./membership.html", "./metabolic-health.html", "./parasites-candida.html", "./privacy.html", "./program.html", "./progress.html", "./refunds.html", "./safety.html", "./start-here.html", "./supplements.html", "./support.html", "./terms.html", "./university.html"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./404.html');
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const req=event.request;
  if (req.method !== 'GET') return;
  const url=new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(req,response.clone()));
    return response;
  })));
});
