const fs=require('fs');const h=fs.readFileSync(__dirname+'/index.html','utf8');
const code=h.match(/<script id="physics">([\s\S]*?)<\/script>/)[1];const m={exports:{}};new Function('module',code)(m);
const {makeSim,step,stats,S,disp}=m.exports;
// 1 no interaction
let s=makeSim({N:200,L:50,R0:1,v0:1.5,d:0.3,F0:0,tau:1,dt:0.01,topo:'torus'});for(let i=0;i<1500;i++)step(s);
let mx=0;for(let i=0;i<s.N;i++)mx=Math.max(mx,Math.abs(Math.hypot(s.vx[i],s.vy[i])-1.5));console.log('speed max dev from v0:',mx);
// 2 Klein wrap
s=makeSim({N:1,L:10,R0:1,v0:1,d:0,F0:0,tau:1,dt:0.1,topo:'klein'});s.x[0]=3;s.y[0]=9.95;s.vx[0]=0.5;s.vy[0]=Math.sqrt(0.75);step(s);
console.log('klein wrap: x',s.x[0].toFixed(3),'(expect ~6.95) y',s.y[0].toFixed(3),'vx',s.vx[0].toFixed(3));
console.log('klein disp (3,0.2)<-(7,9.9):',disp(3,0.2,7,9.9,10,'klein'),'expect [0,0.3]');
console.log('S(0),S(R0),S(R0/2) d=R0:',S(0,1,1),S(1,1,1),S(0.5,1,1).toFixed(3),' d=0:',S(0.99,1,0),S(1,1,0));
// 3 NaN with interaction, both topologies
for(const topo of ['torus','klein']){s=makeSim({N:3000,L:60,R0:1,v0:1,d:0.3,F0:10,tau:1,dt:0.01,topo});const t0=Date.now();for(let i=0;i<300;i++)step(s);
 let bad=0;for(let i=0;i<s.N;i++)if(!isFinite(s.x[i]+s.y[i]+s.vx[i]+s.vy[i])||s.x[i]<0||s.x[i]>=60||s.y[i]<0||s.y[i]>=60)bad++;
 console.log(topo,'N=3000 300 steps',(Date.now()-t0)+'ms, bad:',bad,stats(s));}
