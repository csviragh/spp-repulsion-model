# SPP repulsion model

Continuous-time (ODE) self-propelled particle model in 2D, single-file browser simulator.

## Model
- dx_i/dt = v_i
- dv_i/dt = (v0 − |v_i|)/τ · v_i/|v_i| + Σ_j F0·S(r_ij)·e_ij  (e_ij: unit vector from j to i, minimum image)

## Repulsion sigmoid
S(r) = [σ((c−r)/w) − σ((c−R0)/w)] / [σ(c/w) − σ((c−R0)/w)], σ(z)=1/(1+e^−z), c = R0 − d/2, w = d/4.
S = 0 for r ≥ R0; d = 0 → Heaviside Θ(R0 − r). S(0)=1, S(R0)=0; d = R0 → nearly linear.

## Boundaries
- Torus: periodic in x and y.
- Klein bottle: periodic in x; crossing y maps x → L − x, vx → −vx. Distances take the minimum over direct and mirrored images (L − x_j, y_j ± L).

## Numerics
Semi-implicit Euler, adjustable dt, cell list for O(N) neighbor search.

## Controls
N, R0, v0, d, L, τ, F0, dt, topology, start/pause/reset, speed. Live order parameter φ and mean speed.

## Run
Open `index.html` in a browser. Tests: `node test.js`.
