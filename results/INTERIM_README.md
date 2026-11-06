# Interim finite-size / equilibration study (2026-11-06)

## Question
Is the drop of polar order with constant interaction delay a thermodynamic phase transition?

## Completed
- Physics audit of delay implementation (no bug found; simulator unchanged).
- Timestep probe: `dt_probe.js` / `dt_probe.jsonl` (54 runs).
- Long N=500 random grid: t_del=0.003…0.007 step 0.0005, T=1000, Teq=400, dt=5e-4, 6 seeds — `fs_run.js` / `fs_raw.jsonl`.
- Ordered init at t_del=0.005 (3 seeds).
- Figures: `../fs_interim_report.png`, `../fs_interim_trajectories.png`, `interim_phi_tdel.png`, `interim_dt_audit.png`.
- CSV: `interim_N500_long.csv`, `dt_probe_summary.csv`.

## Not completed
- N=1000, N=2000 production grids.
- Binder crossing across sizes.
- dt=2.5e-4 long production runs.

## Qualified conclusion
Sharp finite-N crossover with metastability near t_del≈0.005–0.006 at ρ=500/900, τ=0.1. Not a proven thermodynamic transition without multi-N scaling.
