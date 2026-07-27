# MATADATA Pathfinder V2.2 failure and recovery matrix

| Condition | V2.2 behavior | Submit clicks permitted |
|---|---|---:|
| Primary public link fails | Use the independently created, health-checked fallback link | 0 until all gates pass |
| Slow or metered mobile data | Use the low-bandwidth URL; unchanged screens return HTTP 304 | 0 until all gates pass |
| Page refresh after token removal | Secure same-site cookie restores the same-browser session | Unchanged |
| Stale screenshot or delayed tap | Unknown revision or screen token is rejected | 0 |
| OpenAI human verification appears | Only JP’s live taps are forwarded | 0 |
| Form leaves trusted OpenAI HTTPS origin | Runner terminates `UNTRUSTED_ORIGIN` | 0 |
| Form labels or controls change | Runner terminates `FORM_STRUCTURE_CHANGED` before entry or submission | 0 |
| Browser validation remains incomplete | Runner terminates `VALIDATION_ERROR` | 0 |
| Visual acknowledgment box does not paint | Dedicated panel displays the current official DOM text | 0 until JP affirms |
| Acknowledgment text changes | Hash mismatch rejects the stale panel | 0 |
| Underlying acknowledgment toggles or is unstable | Three-sample verification fails and returns to acknowledgment state | 0 |
| Browser page crashes or disconnects | Heartbeat and event evidence are preserved; runner terminates fail-closed | 0 additional clicks |
| Primary tunnel dies mid-session | Same browser may switch to the fallback URL; state remains in the single browser process | Unchanged |
| Authorization marker belongs to an older commit | Live job is skipped because the marker does not match the current head SHA | 0 |
| Submit click errors synchronously | `SUBMISSION_REJECTED`; no retry | Exactly 1 attempted |
| Submit click succeeds but confirmation is ambiguous | `SUBMIT_CLICKED_CONFIRMATION_PENDING`; no retry | Exactly 1 |
| Candidate application response is HTTP 4xx/5xx | Submission is not recorded as confirmed; no retry | Exactly 1 |
| Positive multi-signal confirmation is observed | `SUBMITTED`; receipt and repository-wide lock are produced | Exactly 1 |
| A confirmed lock already exists | Browser is never started | 0 |
