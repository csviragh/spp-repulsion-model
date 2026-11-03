import json,numpy as np,matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt
R=[json.loads(l) for l in open('raw.jsonl')];T=sorted({r['tdel'] for r in R})
rows=[]
for t in T:
  g=[r for r in R if r['tdel']==t and not r.get('nan')]
  f=lambda k:(np.mean([r[k] for r in g]),np.std([r[k] for r in g]))
  # equilibration: mean phi in first vs second half of post-transient trace
  tr=np.array([r['trace'][100:] for r in g]);h=tr.shape[1]//2
  rows.append([t,len(g),*f('phi'),*f('speed'),*f('chi'),tr[:,:h].mean(),tr[:,h:].mean()])
with open('delay_sweep.csv','w') as o:
  o.write('t_del,seeds,phi_mean,phi_std,speed_mean,speed_std,chi_mean,chi_std,phi_1st_half,phi_2nd_half\n')
  for r in rows:o.write(','.join(f'{v:.5g}' for v in r)+'\n')
A=np.array(rows);fig,ax=plt.subplots(2,1,figsize=(7,8),sharex=True)
ax[0].errorbar(A[:,0],A[:,2],A[:,3],marker='o',capsize=3);ax[0].set_ylabel('order parameter φ');ax[0].axhline(np.sqrt(np.pi/4/500),ls=':',c='gray',label='random-direction level √(π/4N)');ax[0].legend()
ax[0].set_title('SPP repulsion, constant delay, torus, N=500, L=30, τ=0.1, dt=0.001')
ax[1].errorbar(A[:,0],A[:,4],A[:,5],marker='s',c='C1',capsize=3);ax[1].set_ylabel('mean speed',color='C1');ax[1].set_xlabel('t_del')
b=ax[1].twinx();b.errorbar(A[:,0],A[:,6],A[:,7],marker='^',c='C2',capsize=3);b.set_ylabel('χ = N var(φ)',color='C2')
plt.tight_layout();plt.savefig('../delay_sweep.png',dpi=120)
import shutil;shutil.copy('delay_sweep.csv','../delay_sweep.csv');shutil.copy('../delay_sweep.png','delay_sweep.png')
print(open('delay_sweep.csv').read())
