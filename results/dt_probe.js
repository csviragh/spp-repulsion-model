const fs=require('fs');const h=fs.readFileSync(__dirname+'/../index.html','utf8');
const m={exports:{}};new Function('module',h.match(/<script id="physics">([\s\S]*?)<\/script>/)[1])(m);
const {makeSim,step,stats}=m.exports;
function rng(seed){let st=(seed*2654435761)>>>0||1;return()=>{st^=st<<13;st>>>=0;st^=st>>>17;st^=st<<5;st>>>=0;return st/4294967296;};}
const jobs=[];
for(const dt of [0.001,0.0005,0.00025])for(const tdel of [0,0.002,0.004,0.006,0.008,0.01])for(const seed of [1,2,3])
  jobs.push({dt,tdel,seed});
const arg=process.argv[2]|0;const job=jobs[arg];if(!job){console.error('no job',arg,'of',jobs.length);process.exit(1);}
Math.random=rng(job.seed);const N=500,L=30,T=400,Tt=150,dt=job.dt;
const s=makeSim({N,L,R0:1,v0:1,d:0.3,F0:10,tau:0.1,dt,topo:'torus',delay:'const',tdel:job.tdel});
const n=Math.round(T/dt),nt=Math.round(Tt/dt),every=Math.max(1,Math.round(0.02/dt));
let a=0,a2=0,c=0;const series=[];
for(let k=0;k<n;k++){step(s);if(k%every===0){const q=stats(s);series.push(q.phi);if(k>=nt){a+=q.phi;a2+=q.phi*q.phi;c++;}}}
const phi=a/c,chi=N*(a2/c-phi*phi);
// block averages of second half
const post=series.slice(Math.floor(Tt/0.02));const B=8,bs=Math.floor(post.length/B);const blocks=[];
for(let b=0;b<B;b++){let s2=0;for(let i=0;i<bs;i++)s2+=post[b*bs+i];blocks.push(s2/bs);}
const bm=blocks.reduce((u,v)=>u+v,0)/B,bv=blocks.reduce((u,v)=>u+(v-bm)*(v-bm),0)/(B-1);
console.log(JSON.stringify({...job,phi,chi,speed:stats(s).mean,blockMean:bm,blockStd:Math.sqrt(bv/B),blocks,nSeries:series.length}));
