// usage: node sweep_run.js tdel seed T Ttrans  -> prints JSON line
const fs=require('fs');const h=fs.readFileSync(__dirname+'/../index.html','utf8');
const m={exports:{}};new Function('module',h.match(/<script id="physics">([\s\S]*?)<\/script>/)[1])(m);
const {makeSim,step,stats}=m.exports;
const [tdel,seed,T,Tt]=process.argv.slice(2).map(Number);
let st=seed*2654435761%4294967296||1;Math.random=()=>{st^=st<<13;st>>>=0;st^=st>>>17;st^=st<<5;st>>>=0;return st/4294967296;};
const dt=0.001,p={N:500,R0:1,v0:1,d:0.3,L:30,F0:10,tau:0.1,dt,topo:'torus',delay:'const',tdel};
const s=makeSim(p);const n=Math.round(T/dt),nt=Math.round(Tt/dt),every=20;let a=0,a2=0,ms=0,c=0;const trace=[];
for(let k=0;k<n;k++){step(s);if(k%every===0){const q=stats(s);if(!isFinite(q.phi)){console.log(JSON.stringify({tdel,seed,nan:true}));process.exit();}
 if(k%1000===0)trace.push(+q.phi.toFixed(4));if(k>=nt){a+=q.phi;a2+=q.phi*q.phi;ms+=q.mean;c++;}}}
const phi=a/c,chi=p.N*(a2/c-phi*phi);
console.log(JSON.stringify({tdel,seed,phi,chi,speed:ms/c,trace}));
