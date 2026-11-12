// Temporär: erkundet die 3K-API für Spielberichte (wird danach wieder entfernt)
const B='https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/';
const H={headers:{Accept:'application/json','User-Agent':'CDA-Website/1.0'}};
const drop=new Set(['event','phase','round','group','teamSeason','club','playingVenue','address']);
const strip=(o,d=0)=>{if(Array.isArray(o))return o.slice(0,2).map(x=>strip(x,d+1));if(!o||typeof o!=='object')return o;const r={};for(const[k,v]of Object.entries(o)){if(drop.has(k))continue;if(v===null)continue;r[k]=d>6?'…':strip(v,d+1);}return r;};
const rep=await (await fetch(B+'event/1408/match/1723289/report',H)).json();
console.log('LEN',rep.length);
console.log(JSON.stringify(strip(rep[0]),null,1).slice(0,6000));
console.log('---- DOUBLE?');const dbl=rep.find(x=>JSON.stringify(x).includes('&'))||rep[rep.length-1];console.log(JSON.stringify(strip(dbl),null,1).slice(0,3000));
console.log('---- summary each');for(const g of rep)console.log(Object.keys(g).join(','));
