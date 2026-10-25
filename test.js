const fs=require('fs');const h=fs.readFileSync(__dirname+'/index.html','utf8');
const code=h.match(/<script id="physics">([\s\S]*?)<\/script>/)[1];const m={exports:{}};new Function('module',code)(m);
const {makeSim,step,stats,S,disp}=m.exports;
// 1 no interaction
let s=makeSim({N:200,L:50,R0:1,v0:1.5,d:0.3,F0:0,tau:1,dt:0.01,topo:'torus'});for(let i=0;i<1500;i++)step(s);
let mx=0;for(let i=0;i<s.N;i++)mx=Math.max(mx,Math.abs(Math.hypot(s.vx[i],s.vy[i])-1.5));console.log('speed max dev from v0:',mx);
// 2 Klein (both-axes flip) wrap
const W=(x,y,vx,vy)=>{const s=makeSim({N:1,L:10,R0:1,v0:1,d:0,F0:0,tau:1e9,dt:0.1,topo:'klein'});s.x[0]=x;s.y[0]=y;s.vx[0]=vx;s.vy[0]=vy;step(s);return [s.x[0],s.y[0],s.vx[0],s.vy[0]].map(v=>+v.toFixed(3));};
console.log('cross y top   (3,9.95,v=(.5,1)):',W(3,9.95,.5,1),'expect [6.95,0.05,-0.5,1]');
console.log('cross x right (9.95,3,v=(1,.5)):',W(9.95,3,1,.5),'expect [0.05,6.95,1,-0.5]');
console.log('cross corner  (9.95,9.95,v=(1,1)):',W(9.95,9.95,1,1),'expect [9.95,9.95,-1,-1] (RP2 corner)');
const D=(a,b,c,e)=>disp(a,b,c,e,10,'klein').map(v=>+v.toFixed(3));
console.log('disp across y (3,0.2)<-(7,9.9):',D(3,0.2,7,9.9),'expect [0,0.3]');
console.log('disp across x (0.2,3)<-(9.9,7):',D(0.2,3,9.9,7),'expect [0.3,0]');
console.log('disp corner (0.1,0.1)<-(9.9,9.9):',D(0.1,0.1,9.9,9.9),'expect [0.2,0] (RP2: (9.9,9.9)~(-0.1,0.1))');
console.log('S(0),S(R0),S(R0/2) d=R0:',S(0,1,1),S(1,1,1),S(0.5,1,1).toFixed(3),' d=0:',S(0.99,1,0),S(1,1,0));
const WT=(topo,x,y,vx,vy)=>{const s=makeSim({N:1,L:10,R0:1,v0:1,d:0,F0:0,tau:1e9,dt:0.1,topo});s.x[0]=x;s.y[0]=y;s.vx[0]=vx;s.vy[0]=vy;step(s);return [s.x[0],s.y[0],s.vx[0],s.vy[0]].map(v=>+v.toFixed(3));};
const DT=(topo,a,b,c,e)=>disp(a,b,c,e,10,topo).map(v=>+v.toFixed(3));
console.log('mobius cross x (9.95,3,v=(1,.5)):',WT('mobius',9.95,3,1,.5),'expect [0.05,6.95,1,-0.5]');
console.log('mobius wall y (3,9.95,v=(0,1)):',WT('mobius',3,9.95,0,1),'expect [3,9.95,0,-1]');
console.log('mobius disp across x (0.2,3)<-(9.9,7):',DT('mobius',0.2,3,9.9,7),'expect [0.3,0]');
console.log('mobius disp across y wall (3,0.2)<-(3,9.9):',DT('mobius',3,0.2,3,9.9),'expect [0,-9.7] (no image)');
console.log('sphere cross left (0.05,3,v=(-1,0)):',WT('sphere',0.05,3,-1,0),'expect [3,0.05,0,1]');
console.log('sphere cross bottom (3,0.05,v=(0,-1)):',WT('sphere',3,0.05,0,-1),'expect [0.05,3,1,0]');
console.log('sphere cross right (9.95,3,v=(1,0)):',WT('sphere',9.95,3,1,0),'expect [3,9.95,0,-1]');
console.log('sphere cross top (3,9.95,v=(0,1)):',WT('sphere',3,9.95,0,1),'expect [9.95,3,-1,0]');
console.log('sphere cone corner (0.02,0.02,v=(-1,-1)):',WT('sphere',0.02,0.02,-1,-1),'expect finite, inside');
console.log('sphere disp left~bottom i(0.2,3) j(3,0.1):',DT('sphere',0.2,3,3,0.1),'expect [0.3,0]');
console.log('sphere disp right~top i(9.8,3) j(3,9.9):',DT('sphere',9.8,3,3,9.9),'expect [-0.3,0]');
// continuity: track one agent over long run, check per-step displacement on the manifold stays ~ v*dt
for(const topo of ['mobius','sphere']){const s=makeSim({N:1,L:10,R0:1,v0:1,d:0,F0:0,tau:1,dt:0.01,topo});let mj=0;
 for(let k=0;k<20000;k++){const px=s.x[0],py=s.y[0];step(s);const [dx,dy]=disp(s.x[0],s.y[0],px,py,10,topo);mj=Math.max(mj,Math.hypot(dx,dy));}
 console.log(topo,'continuity: max per-step jump',mj.toFixed(4),'(v0*dt=0.01)');}
for(const topo of ['mobius','sphere']){const s=makeSim({N:2000,L:45,R0:1,v0:1,d:0.3,F0:10,tau:1,dt:0.01,topo});const t0=Date.now();for(let i=0;i<300;i++)step(s);
 let bad=0;for(let i=0;i<s.N;i++)if(!isFinite(s.x[i]+s.y[i]+s.vx[i]+s.vy[i])||s.x[i]<0||s.x[i]>=45||s.y[i]<0||s.y[i]>=45)bad++;
 console.log(topo,'N=2000 300 steps',((Date.now()-t0)/300).toFixed(1)+'ms/step, bad:',bad,stats(s));}
// 3 NaN with interaction, both topologies
for(const topo of ['torus','klein']){s=makeSim({N:3000,L:60,R0:1,v0:1,d:0.3,F0:10,tau:1,dt:0.01,topo});const t0=Date.now();for(let i=0;i<300;i++)step(s);
 let bad=0;for(let i=0;i<s.N;i++)if(!isFinite(s.x[i]+s.y[i]+s.vx[i]+s.vy[i])||s.x[i]<0||s.x[i]>=60||s.y[i]<0||s.y[i]>=60)bad++;
 console.log(topo,'N=3000 300 steps',((Date.now()-t0)/300).toFixed(1)+'ms/step, bad:',bad,stats(s));}
