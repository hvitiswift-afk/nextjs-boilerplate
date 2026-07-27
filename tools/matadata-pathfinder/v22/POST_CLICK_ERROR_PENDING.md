# Post-click error investigation

The current V2.3 live run reported an error after JP used the new acknowledgment action. This marker intentionally changes the head commit so the earlier commit-bound execution authorization cannot start another live job while the receipt is being collected and repaired.

No conclusion about submission status is recorded here. The active run must finish and its receipt must be inspected before any retry. A replacement runner must preserve exactly-once behavior: if the prior run recorded a Submit click with uncertain confirmation, no automatic retry is permitted.
