const CACHE="judo-timer-web-b1.73";
const CORE=[
  "./",
  "./index.html",
  "./timer_web_b1.73.html",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(key=>key.startsWith("judo-timer-web-") && key!==CACHE)
            .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET") return;

  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req)
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put("./index.html",copy)).catch(()=>{});
          return res;
        })
        .catch(()=>caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const refresh=fetch(req).then(res=>{
        if(res && res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>cached);

      return cached || refresh;
    })
  );
});
