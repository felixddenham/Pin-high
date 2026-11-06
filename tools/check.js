/* Sanity checks. Run after python3 build.py: node tools/check.js  (exit 1 on failure) */
const G=require('../.build/game.js'); let bad=0; const fail=m=>{console.log("FAIL:",m);bad++;};
const ids=new Set();
for(const r of G.RARE_ALL){ if(ids.has(r.id)) fail("duplicate prompt id "+r.id); ids.add(r.id);
  if(r.a.length<4) fail(r.id+" has fewer than 4 answers");
  const seen=new Map(); r.a.forEach((s,i)=>s.split("|").forEach(k=>{const n=G.norm(k); if(seen.has(n)&&seen.get(n)!==i) fail(r.id+" duplicate answer "+k); seen.set(n,i);})); }
const qs=new Set();
for(const p of G.PIN_ALL){ if(!Number.isFinite(p.ans)) fail(p.id+" answer not a number"); if(p.bands.length!==6) fail(p.id+" needs 6 bands");
  if(qs.has(p.p)) fail("duplicate pin question: "+p.p); qs.add(p.p); }
const dates=Object.keys(G.SCHEDULE).sort(); const lastR={}, lastP={};
dates.forEach(d=>{ const row=G.SCHEDULE[d]; if(row.length!==9) fail(d+" does not have 9 holes");
  row.forEach((id,i)=>{ const x=G.BY_ID[id]; if(!x) return fail(d+" unknown id "+id);
    const want=G.LAYOUT[i]==="R"?"rare":"pin"; if((x.id.startsWith("pin")?"pin":"rare")!==want) fail(d+" hole "+(i+1)+" wrong type "+id);
    const n=G.dayIndex(d), L=want==="rare"?lastR:lastP, gap=want==="rare"?7:14;
    if(L[id]!=null && n-L[id]<gap) fail(`${d}: ${id} repeats after ${n-L[id]} days`); L[id]=n; }); });
const today=new Date().toISOString().slice(0,10), ahead=G.dayIndex(dates[dates.length-1])-G.dayIndex(today);
console.log(`prompts ${G.RARE_ALL.length} · pins ${G.PIN_ALL.length} · schedule ${dates[0]} → ${dates[dates.length-1]} (${ahead} days ahead)`);
if(ahead<14) fail("schedule runs out within 14 days");
if(bad){ console.log(bad+" problem(s)"); process.exit(1);} else console.log("all checks passed");
