# MATADATA Pathfinder V2.4 Failure Matrix

| Condition | Required behavior |
|---|---|
| CAPTCHA, identity, signature, or human verification | Stop and wait for JP; never bypass or impersonate. |
| Applicant acknowledgment not personally affirmed by JP | Block Submit. |
| OpenAI origin is not trusted HTTPS | Stop immediately; no data entry or Submit click. |
| Any of the 13 stable field identities is missing or duplicated | Stop before data entry. |
| Field changes during a form rerender | Resolve it again by stable `name`, refill if bounded retries remain, and verify again. |
| Exact field value matches | Accept. |
| Textarea differs only by CRLF/CR versus LF | Accept as line-ending-normalized; record raw and canonical hashes. |
| Textarea contains exactly one additional terminal line break | Accept as single-terminal-linebreak; record raw length delta `+1` and canonical hashes. |
| Textarea contains changed words, spaces, paragraphs, deletion, or more than one extra terminal line break | Reject as substantive mismatch; no Submit click. |
| Browser validation reports an invalid control | Block Submit and report the control. |
| Acknowledgment text changes between stability samples | Block Submit and require JP to review again. |
| Interactive acknowledgment control exists but cannot be positively checked | Block Submit. |
| Official terms text is present with no separate acknowledgment control | Require JP's personal affirmation and three stable text observations. |
| Direct remote tap targets OpenAI's Submit control | Reject the tap. |
| Confirmed-submission lock already exists | Do not start a browser. |
| Submit has already been clicked once in the run | Never click again. |
| Submit click occurs but confirmation is ambiguous | Record confirmation-pending/uncertain state and never retry automatically. |
| Positive confirmation evidence is obtained | Record `SUBMITTED`, `submitClicks: 1`, preserve receipt, and create the cross-run lock. |

V2.3's observed failure occurred before Submit: acknowledgment succeeded, all browser validation was clear, but final field verification saw the funding textarea as 961 characters instead of 960 because of a terminal line break. V2.4 repairs only that non-substantive representation difference and remains strict for all content differences.
