// // In production, we register a service worker to serve assets from local cache.

// // This lets the app load faster on subsequent visits in production, and gives
// // it offline capabilities. However, it also means that developers (and users)
// // will only see deployed updates on the "N+1" visit to a page, since previously
// // cached resources are updated in the background.

// // To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// // This link also includes instructions on opting out of this behavior.

// const isLocalhost = Boolean(
//   window.location.hostname === "localhost" ||
//     // [::1] is the IPv6 localhost address.
//     window.location.hostname === "[::1]" ||
//     // 127.0.0.1/8 is considered localhost for IPv4.
//     window.location.hostname.match(
//       /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
//     )
// );

// export default function register() {
//   if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
//     // The URL constructor is available in all browsers that support SW.
//     const publicUrl = new URL(process.env.PUBLIC_URL, window.location);
//     if (publicUrl.origin !== window.location.origin) {
//       // Our service worker won't work if PUBLIC_URL is on a different origin
//       // from what our page is served on. This might happen if a CDN is used to
//       // serve assets; see https://github.com/facebookincubator/create-react-app/issues/2374
//       return;
//     }

//     window.addEventListener("load", () => {
//       const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

//       if (isLocalhost) {
//         // This is running on localhost. Lets check if a service worker still exists or not.
//         checkValidServiceWorker(swUrl);
//       } else {
//         // Is not local host. Just register service worker
//         registerValidSW(swUrl);
//       }
//     });
//   }
// }

// function registerValidSW(swUrl) {
//   navigator.serviceWorker
//     .register(swUrl)
//     .then(registration => {
//       registration.onupdatefound = () => {
//         const installingWorker = registration.installing;
//         installingWorker.onstatechange = () => {
//           if (installingWorker.state === "installed") {
//             if (navigator.serviceWorker.controller) {
//               // At this point, the old content will have been purged and
//               // the fresh content will have been added to the cache.
//               // It's the perfect time to display a "New content is
//               // available; please refresh." message in your web app.
//               console.log("New content is available; please refresh.");
//             } else {
//               // At this point, everything has been precached.
//               // It's the perfect time to display a
//               // "Content is cached for offline use." message.
//               console.log("Content is cached for offline use.");
//             }
//           }
//         };
//       };
//     })
//     .catch(error => {
//       console.error("Error during service worker registration:", error);
//     });
// }

// function checkValidServiceWorker(swUrl) {
//   // Check if the service worker can be found. If it can't reload the page.
//   fetch(swUrl)
//     .then(response => {
//       // Ensure service worker exists, and that we really are getting a JS file.
//       if (
//         response.status === 404 ||
//         response.headers.get("content-type").indexOf("javascript") === -1
//       ) {
//         // No service worker found. Probably a different app. Reload the page.
//         navigator.serviceWorker.ready.then(registration => {
//           registration.unregister().then(() => {
//             window.location.reload();
//           });
//         });
//       } else {
//         // Service worker found. Proceed as normal.
//         registerValidSW(swUrl);
//       }
//     })
//     .catch(() => {
//       console.log(
//         "No internet connection found. App is running in offline mode."
//       );
//     });
// }

// export function unregister() {
//   if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.ready.then(registration => {
//       registration.unregister();
//     });
//   }
// }


const FILES_TO_CACHE = [
  '/',
  '/index.js',
  '/index.css',
  '/data.json',
  '/App.js',
  '../public/favicon.ico',
  '../public/manifest.webmanifest',
  '../public/index.html',
  '../public/assets/images/beth.png',
  '../public/assets/images/birdperson.png',
  '../public/assets/images/evilmorty.png',
  '../public/assets/images/geometry.svg',
  '../public/assets/images/gianthead.png',
  '../public/assets/images/goldenford.png',
  '../public/assets/images/jerry.png',
  '../public/assets/images/jessica.png',
  '../public/assets/images/meeseeks.png',
  '../public/assets/images/morty.png',
  '../public/assets/images/mr.png',
  '../public/assets/images/react.svg',
  '../public/assets/images/rick.png',
  '../public/assets/images/summer.png',

];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
window.self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  window.self.skipWaiting();
});

// activate
window.self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  window.self.clients.claim();
});

// fetch
window.self.addEventListener("fetch", function(evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});
