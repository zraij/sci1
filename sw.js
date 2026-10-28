/* Service Worker — العلوم الأول الابتدائي (PWA)
   الصفحة تُجلب من الشبكة أولاً (حتى توصل التحديثات فوراً)، والنسخة المحفوظة تُستخدم عند انقطاع الإنترنت.
   صور الكتاب المشفّرة (img/*.bin) تُحفظ على الجهاز أول مرة وتُقرأ منه بعدها (سريع وبدون إنترنت).
   ملفات الحسابات (users.json) وطلبات Google وأي رابط خارجي لا تُخزَّن أبداً. */
const VER = 'mvsa84fh';
const CACHE = 'sci1-pwa-' + VER, IMG = 'sci1-img-v1';
const SHELL = ['./', './index.html', './install.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('sci1-pwa-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const base = new URL('./', self.location).pathname;
  if (!url.pathname.startsWith(base)) return;
  if (url.pathname.endsWith('users.json') || url.pathname.endsWith('admin.html')) return;
  if (url.pathname.startsWith(base + 'img/')) {
    const key = url.pathname + '?v=' + (url.searchParams.get('v') || '');
    e.respondWith(caches.open(IMG).then(c => c.match(key).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(key, res.clone()); return res; }))));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
