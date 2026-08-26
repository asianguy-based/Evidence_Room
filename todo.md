# Session-only local cleanup redesign

- [ ] Remove prefilled demo scan counts, pairs, and completed-scan messaging.
- [ ] Create the initial blank state with Choose a local folder, Scan, Mark visible candidates, Recycle, Delete now, and Reset steps.
- [ ] Keep all scan results and selected file handles in memory only.
- [ ] Add separate move-to-recycling-bin and delete-now actions with explicit confirmations.
- [ ] Make recycle, delete, and reset return the main workspace to the initial blank state.
- [ ] Add a current-session activity log that clears on reload/close and never persists.
- [ ] Verify initial, scanned, action-complete, reset, and mobile layouts.
- [ ] Save a new checkpoint.
