const fs=require('fs');const h=fs.readFileSync(__dirname+'/../index.html','utf8');
const m={exports:{}};new Function('module',h.match(/<script id="physics">([\s\S]*?)<\/script>/)[1])(m);
const {makeSim,step,stats,histPos}=m.exports;
function rng(seed){let st=seed*2654435761>>>0||1;return()=>{st^=st<<13;st>>>=0;st^=st>>>17;st^=st<<5;st>>>=0;return st/4294967296;};}
const base={N:200,L:20,R0:1,v0:1,d:0.3,F0:10,tau:0.1,dt:0.001,topo:'torus'};
function clone(s,p){const c=makeSim(Object.assign({},base,p));for(const k of ['x','y','vx','vy'])c[k].set(s[k]);return c;}
Math.random=rng(42);
{const s0=makeSim(base);const a=clone(s0,{delay:'none'}),b=clone(s0,{delay:'const',tdel:0});
 for(let k=0;k<5000;k++){step(a);step(b);}let e=0;for(let i=0;i<a.N;i++)e=Math.max(e,Math.abs(a.x[i]-b.x[i])+Math.abs(a.vx[i]-b.vx[i]));
 console.log('AUDIT t_del=0 vs none after 5000 steps maxDiff',e);}
{Math.random=rng(7);const s=makeSim(Object.assign({},base,{delay:'const',tdel:0.001}));const snaps=[];
 for(let k=0;k<200;k++){snaps.push(Float64Array.from(s.x));step(s);}
 // After 200 steps, head stores position at start of step 199 = snaps[199]
 // 1 step back = snaps[198]
 let e=0;for(let j=0;j<s.N;j++)e=Math.max(e,Math.abs(histPos(s,j,1)[0]-snaps[198][j]));
 console.log('AUDIT histPos 1 step back vs snap maxDiff',e);}
{const s=makeSim({N:1,L:10,R0:1,v0:1,d:0,F0:100,tau:1e9,dt:0.001,topo:'torus',delay:'const',tdel:0.05});
 s.x[0]=5;s.y[0]=5;s.vx[0]=1;s.vy[0]=0;for(let k=0;k<200;k++)step(s);
 console.log('AUDIT single agent speed after delay+repulsion',Math.hypot(s.vx[0],s.vy[0]).toFixed(6),'(expect ~1)');}
{Math.random=rng(1);const s=makeSim(Object.assign({},base,{N:1,L:10,delay:'const',tdel:0.005}));
 s.x[0]=9.999;s.y[0]=5;s.vx[0]=1;s.vy[0]=0;for(let k=0;k<20;k++)step(s);
 console.log('AUDIT wrap interp:',histPos(s,0,0),histPos(s,0,0.5),histPos(s,0,1),'L=',s.p.L);}
function run(dt,tdel,T,seed){Math.random=rng(seed);const L=Math.sqrt(300/500)*30;
 const s=makeSim(Object.assign({},base,{N:300,L,dt,delay:'const',tdel}));
 const n=Math.round(T/dt),nt=Math.round(50/dt);let a=0,c=0;for(let k=0;k<n;k++){step(s);if(k>=nt&&k%10===0){a+=stats(s).phi;c++;}}return a/c;}
console.log('AUDIT dt sens phi(tdel=0.004) dt=1e-3',run(0.001,0.004,150,7).toFixed(4),'dt=5e-4',run(0.0005,0.004,150,7).toFixed(4),'dt=2.5e-4',run(0.00025,0.004,150,7).toFixed(4));
console.log('AUDIT dt sens phi(tdel=0) dt=1e-3',run(0.001,0,100,3).toFixed(4),'dt=5e-4',run(0.0005,0,100,3).toFixed(4));
