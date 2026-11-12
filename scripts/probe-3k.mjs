// Temporär: erkundet die 3K-API für Spielberichte (wird danach wieder entfernt)
const B='https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/';
const H={headers:{Accept:'application/json','User-Agent':'CDA-Website/1.0'}};
const j=async u=>{try{const r=await fetch(u,H);const t=await r.text();return [r.status,t];}catch(e){return ['ERR',e.message];}};
const keys=(o,d=0,p='')=>{if(d>3||!o||typeof o!=='object')return;for(const k of Object.keys(o).slice(0,40)){const v=o[k];console.log(p+k+': '+(Array.isArray(v)?'['+v.length+']':typeof v==='object'&&v?'{}':JSON.stringify(v)?.slice(0,60)));if(v&&typeof v==='object')keys(Array.isArray(v)?v[0]:v,d+1,p+'  ');}};
const [,ph]=await j(B+'event/1408/phase/2101');const phase=JSON.parse(ph);
const r0=phase.rounds[0];const [,rd]=await j(B+`event/1408/phase/2101/round/${r0.id}`);const round=JSON.parse(rd);
const m=round.matches.find(x=>x.statusCd==='FINISH');console.log('=== MATCH keys');keys(m);
const id=m.id;
for(const u of [`event/1408/match/${id}`,`match/${id}`,`event/1408/phase/2101/match/${id}`,`event/1408/phase/2101/round/${r0.id}/match/${id}`,`match/${id}/games`,`event/1408/match/${id}/games`,`event/1408/match/${id}/report`,`event/1408/matchday/${id}`]){const [s,t]=await j(B+u);console.log('###',s,u,t.slice(0,300));}
// Frontend-JS nach API-Pfaden durchsuchen
const [,html]=await j('https://portal.3k-darts.com/frontend/events/10/event/1408/phase/2101/group/40479');
const srcs=[...html.matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);console.log('scripts',srcs);
for(const s of srcs){const [,js]=await j(new URL(s,'https://portal.3k-darts.com/').href);const hits=new Set([...js.matchAll(/["'`]([^"'`]*(?:match|game|leg)[^"'`]{0,60})["'`]/gi)].map(x=>x[1]).filter(x=>x.includes('/')&&x.length<90));console.log('--',s,[...hits].slice(0,80).join('\n'));}
