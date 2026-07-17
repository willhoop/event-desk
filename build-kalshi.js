// Fetches live Kalshi prices server-side (no browser CORS) and writes kalshi.json.
// Run by GitHub Actions on a schedule; the site reads kalshi.json same-origin.
const fs=require("fs");
const EVENTS={nomination:"KXPRESNOMD-28",presidency:"KXPRESPERSON-28",gopnom:"KXPRESNOMR-28"};
function pull(ticker){
  const url="https://api.elections.kalshi.com/trade-api/v2/markets?event_ticker="+ticker+"&limit=500";
  return fetch(url).then(r=>{if(!r.ok)throw new Error(ticker+" "+r.status);return r.json();}).then(j=>{
    const out={};(j.markets||[]).forEach(m=>{
      const n=m.yes_sub_title;if(!n)return;
      const ask=parseFloat(m.yes_ask_dollars),last=parseFloat(m.last_price_dollars);
      const px=(!isNaN(ask)&&ask>0)?ask:last;
      if(!isNaN(px)&&px>0)out[n]=px;
    });return out;
  });
}
Promise.all(Object.values(EVENTS).map(pull)).then(res=>{
  const data={updated:new Date().toISOString()};
  Object.keys(EVENTS).forEach((k,i)=>{data[k]=res[i];});
  fs.writeFileSync("kalshi.json",JSON.stringify(data,null,1));
  console.log("wrote kalshi.json",data.updated,"nom:",Object.keys(data.nomination||{}).length,"pres:",Object.keys(data.presidency||{}).length);
}).catch(e=>{console.error("FAILED",e.message);process.exit(1);});
