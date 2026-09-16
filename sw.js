const CACHE="judo-timer-web-b1.76";
const CORE=[
  "./",
  "./index.html",
  "./timer_web_b1.76.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install",function(event){
  event.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(CORE);
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate",function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(key){
        return key.indexOf("judo-timer-web-")===0 && key!==CACHE;
      }).map(function(key){ return caches.delete(key); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch",function(event){
  var req=event.request;
  if(req.method!=="GET") return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req).then(function(res){
        var copy=res.clone();
        caches.open(CACHE).then(function(cache){ cache.put("./index.html",copy); }).catch(function(){});
        return res;
      }).catch(function(){ return caches.match("./index.html"); })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function(cached){
      if(cached) return cached;
      return fetch(req).then(function(res){
        if(res && res.ok){
          var copy=res.clone();
          caches.open(CACHE).then(function(cache){ cache.put(req,copy); }).catch(function(){});
        }
        return res;
      });
    })
  );
});
