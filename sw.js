const CACHE_NAME = 'toribio-v1';

self.addEventListener('install', (event) => {
    console.log('Toribio App: Instalado');
});

self.addEventListener('fetch', (event) => {
    // Modo passthrough para asegurar datos siempre reales
    event.respondWith(fetch(event.request));
});
