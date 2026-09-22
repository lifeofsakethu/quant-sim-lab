# QuantSim Lab v1.4 — Signal Garden

QuantSim Lab v1.4 turns the paper simulator into a local-first progression game. The new Rookie Quant tutorial teaches observation, manual paper execution, realized-profit missions, and safe algorithm inspection. Gems are earned from tutorial chapters and qualifying profitable closes on selected assets, then spent in the gem shop.

The shop includes SMA and risk statement packs, pre-made bot blueprints, AAPL/SOL access passes, and two inventory boosts reserved for the next scoring expansion. Manual trading remains paper-only: quotes can be nudged locally, positions are held in browser state, and realized P&L is never connected to a broker.

The Python workshop now presents a clear local execution boundary. It evaluates a small deterministic strategy vocabulary in-browser, reports return, drawdown, trade count, and warnings, and persists saved bot names locally. Seven reusable SVG sprites cover the gem currency and item categories.

## Validation

- `pnpm check` passes.
- `pnpm build` passes.
- Removed undefined analytics placeholders from the HTML entry point.
- User progress, positions, trades, unlocked assets, shop purchases, and saved bots persist in `localStorage` under `quantsim-v14`.
