// node fs_run.js N tdel seed init Tmax Teq dt
const fs=require('fs');const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const m={exports:{}};new Function('module',html.match(/<script id="physics">([\s\S]*?)<\/script>/)[1])(m);
const {makeSim,step,stats}=m.exports;
const N=+process.argv[2],tdel=+process.argv[3],seed=+process.argv[4],init=process.argv[5]||'random';
const Tmax=+(process.argv[6]||1000),Teq=+(process.argv[7]||400),dt=+(process.argv[8]||0.0005);
const L=30*Math.sqrt(N/500);
let st=(seed*2654435761)>>>0||1;Math.random=()=>{st^=st<<13;st>>>=0;st^=st>>>17;st^=st<<5;st>>>=0;return st/4294967296;};
const s=makeSim({N,L,R0:1,v0:1,d:0.3,F0:10,tau:0.1,dt,topo:'torus',delay:'const',tdel});
if(init==='ordered'){for(let i=0;i<N;i++){s.vx[i]=1;s.vy[i]=0;}}
const n=Math.round(Tmax/dt),nt=Math.round(Teq/dt),every=Math.max(1,Math.round(0.05/dt));
const series=[];let a1=0,a2=0,a4=0,ms=0,c=0;
for(let k=0;k<n;k++){step(s);if(k%every===0){const q=stats(s),ph=q.phi;series.push(ph);
 if(k>=nt){a1+=ph;a2+=ph*ph;a4+=ph*ph*ph*ph;ms+=q.mean;c++;}}}
const m1=a1/c,m2=a2/c,m4=a4/c,chi=N*(m2-m1*m1),U=1-m4/(3*m2*m2);
const mean=a=>a.reduce((u,v)=>u+v,0)/a.length,std=a=>{const mm=mean(a);return Math.sqrt(a.reduce((u,v)=>u+(v-mm)*(v-mm),0)/Math.max(1,a.length-1));};
const post=series.slice(Math.ceil(Teq/0.05));const B=10,bs=Math.floor(post.length/B);
const bphi=[],bchi=[],bU=[];
for(let b=0;b<B;b++){let s1=0,s2=0,s4=0;for(let i=0;i<bs;i++){const p=post[b*bs+i];s1+=p;s2+=p*p;s4+=p*p*p*p;}
 const M1=s1/bs,M2=s2/bs,M4=s4/bs;bphi.push(M1);bchi.push(N*(M2-M1*M1));bU.push(1-M4/(3*M2*M2));}
let tauInt=0.5;const mu=mean(post),varr=post.reduce((u,p)=>u+(p-mu)*(p-mu),0)/post.length||1e-30;
for(let lag=1;lag<Math.min(400,Math.floor(post.length/4));lag++){let cc=0;for(let i=0;i+lag<post.length;i++)cc+=(post[i]-mu)*(post[i+lag]-mu);cc/=(post.length-lag)*varr;if(cc<=0)break;tauInt+=cc;}
const nEff=post.length/(2*tauInt),phiErr=Math.sqrt(varr/Math.max(1,nEff));
const hh=Math.floor(post.length/2),mA=mean(post.slice(0,hh)),mB=mean(post.slice(hh));
// downsample series for storage: every 1.0 time unit
const serOut=[];for(let i=0;i<series.length;i+=Math.round(1/0.05))serOut.push(+series[i].toFixed(5));
console.log(JSON.stringify({N,L:+L.toFixed(4),tdel,seed,init,dt,Tmax,Teq,phi:m1,phi2:m2,phi4:m4,chi,U,speed:ms/c,phiErr,tauInt:tauInt*0.05,nEff,blockPhi:mean(bphi),blockPhiStd:std(bphi)/Math.sqrt(B),blockChi:mean(bchi),blockChiStd:std(bchi)/Math.sqrt(B),blockU:mean(bU),blockUStd:std(bU)/Math.sqrt(B),halfA:mA,halfB:mB,series:serOut}));
