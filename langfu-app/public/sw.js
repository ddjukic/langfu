if (!self.define) {
  let e,
    a = {};
  const s = (s, c) => (
    (s = new URL(s + '.js', c).href),
    a[s] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const t = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (a[t]) return;
    let n = {};
    const r = (e) => s(e, t),
      b = { module: { uri: t }, exports: n, require: r };
    a[t] = Promise.all(c.map((e) => b[e] || r(e))).then((e) => (i(...e), n));
  };
}
define(['./workbox-c05e7c83'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '0671311d297262e32d99764db41f95ad' },
        {
          url: '/_next/static/Ep2SlqwHtSS_I4ssY3FNY/_buildManifest.js',
          revision: 'f0c02da247ae11c17c11dd56e899692e',
        },
        {
          url: '/_next/static/Ep2SlqwHtSS_I4ssY3FNY/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/2147.4a041f51ca294da0.js', revision: '4a041f51ca294da0' },
        { url: '/_next/static/chunks/2456-f18bdca6ce379cff.js', revision: 'f18bdca6ce379cff' },
        { url: '/_next/static/chunks/3859-800b3a79ffb33dd0.js', revision: '800b3a79ffb33dd0' },
        { url: '/_next/static/chunks/4325-f395876c26b40eab.js', revision: 'f395876c26b40eab' },
        { url: '/_next/static/chunks/4490-e5084ac272d2b3e0.js', revision: 'e5084ac272d2b3e0' },
        { url: '/_next/static/chunks/4587-79c55927f34b6438.js', revision: '79c55927f34b6438' },
        { url: '/_next/static/chunks/4882-7e06ef0fbb371bad.js', revision: '7e06ef0fbb371bad' },
        { url: '/_next/static/chunks/5008.4faeb09620dc43f6.js', revision: '4faeb09620dc43f6' },
        { url: '/_next/static/chunks/5247-5f1088f8f0fc239e.js', revision: '5f1088f8f0fc239e' },
        { url: '/_next/static/chunks/5751-6a617f207fb618b5.js', revision: '6a617f207fb618b5' },
        { url: '/_next/static/chunks/5899e4d3-17bfc75275ccafad.js', revision: '17bfc75275ccafad' },
        { url: '/_next/static/chunks/5b11f4f6-be034c1a79690958.js', revision: 'be034c1a79690958' },
        { url: '/_next/static/chunks/6808-af63fee349eae373.js', revision: 'af63fee349eae373' },
        { url: '/_next/static/chunks/8016-8a5dbbe09579ca25.js', revision: '8a5dbbe09579ca25' },
        { url: '/_next/static/chunks/9902-f8ff02d1cb1a67d9.js', revision: 'f8ff02d1cb1a67d9' },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-9220b9d34f1f29f7.js',
          revision: '9220b9d34f1f29f7',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-5ba39655a7939746.js',
          revision: '5ba39655a7939746',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-9f135a187a513cd6.js',
          revision: '9f135a187a513cd6',
        },
        {
          url: '/_next/static/chunks/app/api/ai/examples/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/ai/topic-package/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/ai/validate-sentence/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/auth/login/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/auth/logout/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/auth/me/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/auth/register/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/auth/token/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/debug/users/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/extract/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/extraction/%5Bid%5D/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/library/add-words/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/library/search/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/library/story/%5Bid%5D/duplicate/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/library/story/%5Bid%5D/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/library/story/%5Bid%5D/translate/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/library/story/bulk-delete/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/library/story/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/progress/update/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/sentences/save/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/settings/update/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/vocabulary/load/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/vocabulary/save-extracted/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/words/track-batch/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/api/words/track/route-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-85436c3dd1cfbc88.js',
          revision: '85436c3dd1cfbc88',
        },
        {
          url: '/_next/static/chunks/app/extract/page-7ca57cbd769ea970.js',
          revision: '7ca57cbd769ea970',
        },
        {
          url: '/_next/static/chunks/app/layout-4b3d197386002a6b.js',
          revision: '4b3d197386002a6b',
        },
        {
          url: '/_next/static/chunks/app/learn/new/page-bbe85b659e4a7396.js',
          revision: 'bbe85b659e4a7396',
        },
        {
          url: '/_next/static/chunks/app/learn/session/page-09964777d88de2fa.js',
          revision: '09964777d88de2fa',
        },
        {
          url: '/_next/static/chunks/app/learn/swipe/page-878a38d7589a9a69.js',
          revision: '878a38d7589a9a69',
        },
        {
          url: '/_next/static/chunks/app/learn/topic/page-2ac68170516482eb.js',
          revision: '2ac68170516482eb',
        },
        {
          url: '/_next/static/chunks/app/library/page-01660d7359cc712d.js',
          revision: '01660d7359cc712d',
        },
        {
          url: '/_next/static/chunks/app/library/story/%5Bid%5D/edit/page-f7e5892a41eb5b34.js',
          revision: 'f7e5892a41eb5b34',
        },
        {
          url: '/_next/static/chunks/app/library/story/%5Bid%5D/page-0a21b71b8b70827c.js',
          revision: '0a21b71b8b70827c',
        },
        {
          url: '/_next/static/chunks/app/library/story/page-44840494b46c149a.js',
          revision: '44840494b46c149a',
        },
        { url: '/_next/static/chunks/app/page-44840494b46c149a.js', revision: '44840494b46c149a' },
        {
          url: '/_next/static/chunks/app/progress/page-179d9ec88a4a12e2.js',
          revision: '179d9ec88a4a12e2',
        },
        {
          url: '/_next/static/chunks/app/settings/page-fd67bbd0e69abbfa.js',
          revision: 'fd67bbd0e69abbfa',
        },
        {
          url: '/_next/static/chunks/app/test-dark-mode/page-0f463f1626d2d162.js',
          revision: '0f463f1626d2d162',
        },
        {
          url: '/_next/static/chunks/app/test-navigation/page-877bda369de577c2.js',
          revision: '877bda369de577c2',
        },
        {
          url: '/_next/static/chunks/app/vocabulary/extracted/page-e2da0b5eb84d4475.js',
          revision: 'e2da0b5eb84d4475',
        },
        {
          url: '/_next/static/chunks/app/vocabulary/load/page-92825e97be39a797.js',
          revision: '92825e97be39a797',
        },
        { url: '/_next/static/chunks/badf541d.dd64c0e9e7357608.js', revision: 'dd64c0e9e7357608' },
        { url: '/_next/static/chunks/c132bf7d-36fa9475654bc129.js', revision: '36fa9475654bc129' },
        { url: '/_next/static/chunks/framework-79c42e3751e3c13a.js', revision: '79c42e3751e3c13a' },
        { url: '/_next/static/chunks/main-app-db340f451cf5ff7f.js', revision: 'db340f451cf5ff7f' },
        { url: '/_next/static/chunks/main-d1d4d7a0dc6bb916.js', revision: 'd1d4d7a0dc6bb916' },
        {
          url: '/_next/static/chunks/pages/_app-8bda9ae4cd12fdf7.js',
          revision: '8bda9ae4cd12fdf7',
        },
        {
          url: '/_next/static/chunks/pages/_error-3213ab1be94495cc.js',
          revision: '3213ab1be94495cc',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/webpack-65509d840ce3fdd9.js', revision: '65509d840ce3fdd9' },
        { url: '/_next/static/css/393168436ca9e75d.css', revision: '393168436ca9e75d' },
        { url: '/_next/static/css/bd42b275431baa4f.css', revision: 'bd42b275431baa4f' },
        {
          url: '/_next/static/media/569ce4b8f30dc480-s.p.woff2',
          revision: 'ef6cefb32024deac234e82f932a95cbd',
        },
        {
          url: '/_next/static/media/747892c23ea88013-s.woff2',
          revision: 'a0761690ccf4441ace5cec893b82d4ab',
        },
        {
          url: '/_next/static/media/8d697b304b401681-s.woff2',
          revision: 'cc728f6c0adb04da0dfcb0fc436a8ae5',
        },
        {
          url: '/_next/static/media/93f479601ee12b01-s.p.woff2',
          revision: 'da83d5f06d825c5ae65b7cca706cb312',
        },
        {
          url: '/_next/static/media/9610d9e46709d722-s.woff2',
          revision: '7b7c0ef93df188a852344fc272fc096b',
        },
        {
          url: '/_next/static/media/ba015fad6dcf6784-s.woff2',
          revision: '8ea4f719af3312a055caf09f34c89a77',
        },
        { url: '/apple-icon-120x120.png', revision: '173e4da5208ebfd51d513bd949e3c5d3' },
        { url: '/apple-icon-152x152.png', revision: 'd39ebf6ce35828e28b4d60873d4aad92' },
        { url: '/apple-icon-167x167.png', revision: 'eb55abc0e7b702b932ef588a4d771dac' },
        { url: '/apple-icon-180x180.png', revision: '72809549bc8ec6bccb5717655e4a888a' },
        { url: '/favicon-16x16.png', revision: '7ebd11cb71b2974fe76d1753e224483a' },
        { url: '/favicon-32x32.png', revision: '4633487f3859b00cd3dae20f45edf028' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/icon-128x128.png', revision: '114dfca4a520b1078351a2c81e09cef1' },
        { url: '/icon-144x144.png', revision: 'aefecb0b157ffc4f28aab7ca30e46eba' },
        { url: '/icon-152x152.png', revision: 'e0a15afaffd3fe31a0278127b50aeae8' },
        { url: '/icon-192x192-maskable.png', revision: '10ea8da57237ac2002b14623fc996b23' },
        { url: '/icon-192x192.png', revision: '8e2a5fa796285084b3d7455d15f21787' },
        { url: '/icon-256x256.png', revision: 'b9362d4044f61d232ffd694341cc4031' },
        { url: '/icon-384x384.png', revision: '6e2ba616a8dfddb8ff35ae0074c76c29' },
        { url: '/icon-512x512-maskable.png', revision: '93cd126794846dabfce42f1245187748' },
        { url: '/icon-512x512.png', revision: 'e8fc72b7d6e624607a4138bad181f65b' },
        { url: '/icon-72x72.png', revision: '7a45b0a541131179a5a970cff288c7c6' },
        { url: '/icon-96x96.png', revision: 'b168d00e605370ffa8eba001fa0dddc0' },
        { url: '/icon.svg', revision: '92f4ecb50b2c73834bd150adbd8e42a2' },
        { url: '/manifest.json', revision: '9c43e46ae9407a5cd0fe2d2e5ba635da' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/offline.html', revision: 'e6bc7749631c344a8e965361d3898577' },
        { url: '/screenshot-desktop-1.png', revision: '6321c8c312fc358d1dae3eb8ceb06fd3' },
        { url: '/screenshot-mobile-1.png', revision: '5afa56988f9a4d263867777b83dc8957' },
        { url: '/screenshot-mobile-2.png', revision: '2ae76557107293621eb486b88d1fe0aa' },
        { url: '/sw-custom.js', revision: '6c6f7acc744e3d55d5a33ee975e51ae8' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: a, event: s, state: c }) =>
              a && 'opaqueredirect' === a.type
                ? new Response(a.body, { status: 200, statusText: 'OK', headers: a.headers })
                : a,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/api\/.*$/i,
      new e.NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /.*/i,
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ));
});
