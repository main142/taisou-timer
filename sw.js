// 体操タイマー：オフライン用の保存。直したら VERSION の数字と、index.html の「版」の表示を上げる
const VERSION='taisou-timer-v17';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
// ブラウザに残っている古いファイルではなく、必ずサーバーから取り直して保存する
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // 画面（index.html）はネットにつながれば最新を出し、つながらないときだけ保存した版を出す
  if(e.request.mode==='navigate'){
    e.respondWith(caches.open(VERSION).then(c=>fetch(e.request,{cache:'no-cache'})
      .then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r;})
      .catch(()=>c.match(e.request,{ignoreSearch:true}).then(h=>h||c.match('./index.html')))));
    return;
  }
  // アイコンなどは保存してある版をすぐ出し、裏で新しい版があれば取っておく
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r;}).catch(()=>hit);
    return hit||net;
  }));
});
