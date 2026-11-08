/* Rebuilds the course calendar from a future date onward, preferring questions that have never been used,
   so newly written questions appear within a couple of days. Dates before --from are never touched.
   Usage: python3 build.py && node tools/extend_schedule.js --from 2026-11-09 --ahead 60 && python3 build.py
   --from must be at least 2 days after today (UK) so nobody's live or next course changes. */
const fs=require('fs'), path=require('path');
const G=require('../.build/game.js');
const arg=(n,d)=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:d;};
const todayUK=new Date().toLocaleDateString("en-CA",{timeZone:"Europe/London"});
const from=arg("--from",G.addDays(todayUK,2)), ahead=+arg("--ahead",60);
if(G.dayIndex(from)-G.dayIndex(todayUK)<2){ console.error("--from must be at least 2 days after today ("+todayUK+")"); process.exit(1); }
const S={}; for(const d of Object.keys(G.SCHEDULE)) if(d<from) S[d]=G.SCHEDULE[d];
const dates=Object.keys(S).sort();
let last=G.addDays(from,-1);
const N=G.dayIndex(todayUK)+ahead-G.dayIndex(last);
const lastUse={}; dates.forEach((d,i)=>S[d].forEach(id=>lastUse[id]=G.dayIndex(d)));
// newest questions (added last) go first among never-used ones
const order={}; [...G.RARE_ALL,...G.PIN_ALL].forEach((x,i)=>order[x.id]=i);
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
function pick(pool,day,count,gaps,famCheck,key){
  for(const gap of gaps){
    const cands=pool.filter(x=>lastUse[x.id]==null||day-lastUse[x.id]>=gap)
      .sort((a,b)=>((lastUse[a.id]??-1e9)-(lastUse[b.id]??-1e9))||((lastUse[a.id]==null&&lastUse[b.id]==null)?(order[b.id]-order[a.id]):0)||(hash(key+a.id)-hash(key+b.id)));
    const out=[], fams=new Set();
    for(const c of cands){ if(famCheck&&fams.has(c.fam)) continue; out.push(c); fams.add(c.fam); if(out.length===count) return out; }
  }
  throw new Error("Not enough questions to fill "+key+" — add more to src/rare.js or src/pins.js");
}
for(let k=0;k<N;k++){
  last=G.addDays(last,1); const day=G.dayIndex(last);
  const themed=G.RARE_ALL.filter(x=>x.theme===last.slice(5));
  const rare=[...themed, ...pick(G.RARE_POOL,day,6-themed.length,[21,14,7],true,last)].slice(0,6);
  const pins=pick(G.PIN_POOL,day,3,[60,30,14],false,last);
  let ri=0,pi=0; S[last]=G.LAYOUT.map(t=>t==="R"?rare[ri++].id:pins[pi++].id);
  S[last].forEach(id=>lastUse[id]=day);
}
const body=Object.keys(S).sort().map(d=>JSON.stringify(d)+":"+JSON.stringify(S[d])).join(",\n");
fs.writeFileSync(path.join(__dirname,'../src/schedule.js'),"/* Fixed course calendar: date -> 9 prompt ids in hole order (R P R R P R R P R).\n   NEVER edit past or current dates. Append new dates with tools/extend_schedule.js. */\nconst SCHEDULE = {"+body+"};\n");
console.log("Schedule now runs to",last);
