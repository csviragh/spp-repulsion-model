const fs=require('fs');const h=fs.readFileSync(__dirname+'/index.html','utf8');
const code=h.match(/<script id="physics">([\s\S]*?)<\/script>/)[1];const m={exports:{}};new Function('module',code)(m);
const {sphereMap,sphereTangent,makeSim,step,stats,S,disp}=m.exports;
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
for(const topo of ['mobius','sphere']){const s=makeSim({N:1,L:10,R0:1,v0:1,d:0,F0:0,tau:1,dt:0.01,topo});let mj=0,rel=0;
 for(let k=0;k<20000;k++){const px=s.x[0],py=s.y[0];step(s);const [dx,dy]=disp(s.x[0],s.y[0],px,py,10,topo);const jj=Math.hypot(dx,dy);mj=Math.max(mj,jj);rel=Math.max(rel,jj/(Math.hypot(s.vx[0],s.vy[0])*0.01));}
 console.log(topo,'continuity: max per-step jump / (|v|dt):',rel.toFixed(4),'(expect ~1)');}
for(const topo of ['mobius','sphere']){const s=makeSim({N:2000,L:45,R0:1,v0:1,d:0.3,F0:10,tau:1,dt:0.01,topo});const t0=Date.now();for(let i=0;i<300;i++)step(s);
 let bad=0;for(let i=0;i<s.N;i++)if(!isFinite(s.x[i]+s.y[i]+s.vx[i]+s.vy[i])||s.x[i]<0||s.x[i]>=45||s.y[i]<0||s.y[i]>=45)bad++;
 console.log(topo,'N=2000 300 steps',((Date.now()-t0)/300).toFixed(1)+'ms/step, bad:',bad,stats(s));}
// 3 NaN with interaction, both topologies
for(const topo of ['torus','klein']){s=makeSim({N:3000,L:60,R0:1,v0:1,d:0.3,F0:10,tau:1,dt:0.01,topo});const t0=Date.now();for(let i=0;i<300;i++)step(s);
 let bad=0;for(let i=0;i<s.N;i++)if(!isFinite(s.x[i]+s.y[i]+s.vx[i]+s.vy[i])||s.x[i]<0||s.x[i]>=60||s.y[i]<0||s.y[i]>=60)bad++;
 console.log(topo,'N=3000 300 steps',((Date.now()-t0)/300).toFixed(1)+'ms/step, bad:',bad,stats(s));}

let me=0;for(let k=0;k<=1000;k++){const tt=10*k/1000,a=sphereMap(0,tt,10),b=sphereMap(tt,0,10),c=sphereMap(10,tt,10),d=sphereMap(tt,10,10);me=Math.max(me,Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),Math.hypot(c[0]-d[0],c[1]-d[1],c[2]-d[2]));}
console.log('sphereMap glue consistency max err:',me.toExponential(2));
let mc=0;for(let k=0;k<20000;k++){const x=Math.random()*10,y=Math.random()*10,a=Math.random()*7,h=1e-3,X=x+h*Math.cos(a),Y=y+h*Math.sin(a);if(X<0||X>10||Y<0||Y>10)continue;const p=sphereMap(x,y,10),q=sphereMap(X,Y,10);mc=Math.max(mc,Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]));}
console.log('sphereMap local continuity max |df| for |dp|=1e-3:',mc.toExponential(2));
let nn=0;for(let k=0;k<1000;k++){const t3=sphereTangent(Math.random()*10,Math.random()*10,1,0.3,10);if(!t3.every(isFinite))nn++;}console.log('tangent NaNs:',nn);

// Coriolis: speed conserved, curvature sign flips across equator
const cor=(x,y,vx,vy,Om)=>{const s=makeSim({N:1,L:10,R0:1,v0:1,d:0,F0:0,tau:1e12,dt:0.01,topo:'sphere',coriolis:true,Omega:Om});s.x[0]=x;s.y[0]=y;s.vx[0]=vx;s.vy[0]=vy;
 const h0=Math.atan2(vy,vx);let smax=0;for(let k=0;k<20;k++){step(s);smax=Math.max(smax,Math.abs(Math.hypot(s.vx[0],s.vy[0])-Math.hypot(vx,vy)));}
 let dh=Math.atan2(s.vy[0],s.vx[0])-h0;dh=Math.atan2(Math.sin(dh),Math.cos(dh));return {turn:+dh.toFixed(4),speedErr:smax};};
console.log('coriolis north (2,2) dir along level line (1,-1):',cor(2,2,0.7071,-0.7071,1),'expect turn>0 (CCW in square = right on sphere)');
console.log('coriolis south (8,8):',cor(8,8,0.7071,-0.7071,1),'expect turn<0');
console.log('coriolis equator (3,7):',cor(3,7,0.7071,-0.7071,1),'expect turn~0');
{const s=makeSim({N:500,L:20,R0:1,v0:1,d:0,F0:0,tau:1e12,dt:0.01,topo:'sphere',coriolis:true,Omega:2});const sp0=[];for(let i=0;i<500;i++)sp0.push(Math.hypot(s.vx[i],s.vy[i]));for(let k=0;k<5000;k++)step(s);
 let e=0;for(let i=0;i<500;i++)e=Math.max(e,Math.abs(Math.hypot(s.vx[i],s.vy[i])-sp0[i]));console.log('coriolis 500 agents 5000 steps max speed change:',e.toExponential(2));}
// right-turn check in 3D: t_v x t_a should be -n (clockwise from outside) in north
{const x=2,y=2,vx=0.7071,vy=-0.7071,n=sphereMap(x,y,10),a=sphereTangent(x,y,vx,vy,10),b=sphereTangent(x,y,-vy,vx,10);const c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 console.log('3D: (v x a_coriolis)·n in north =',(c[0]*n[0]+c[1]*n[1]+c[2]*n[2]).toFixed(3),'expect <0 (rightward)');}
