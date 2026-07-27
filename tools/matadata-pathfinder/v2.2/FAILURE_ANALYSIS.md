# V2.1 Failure Analysis

## Observed result

The V2.1 live run stopped safely with:

```text
status: ERROR
submitClicks: 0
formFilled: false
completed fields: 8
failed field: projectTitle
```

The first eight values were entered and verified. The failure occurred while waiting for a locator carrying a temporary `data-pathfinder-id` assigned during preflight. OpenAI's form had rerendered, replacing the original Project title node and removing that temporary attribute.

## Additional contract error found

V2.1 treated `Project title` and its helper text `One descriptive sentence` as two separate fields. The captured form has only one input named `mkto_cybersecurity_grant_project_title`. V2.2 uses one one-sentence project-title value and enforces unique field identities.

## Acknowledgment finding

The captured form displayed the applicant acknowledgment as terms text below the Submit button. No separate acknowledgment checkbox was present in the captured form-control inventory. V2.2 requires JP's personal affirmation in the Pathfinder panel and supports terms-text-only verification when no separate control exists. If a later form revision introduces an interactive acknowledgment control, the runner must check and positively verify it.

## V2.2 regression requirements

1. No application field may be located by an injected temporary attribute.
2. All 13 expected stable field names must be present and unique.
3. The complete form must survive an artificial full DOM replacement after field eight.
4. Every value must be re-resolved and verified after entry.
5. Every value must pass a final full-form comparison before acknowledgment and before Submit.
6. Acknowledgment text must remain stable across three checks.
7. Direct Submit taps remain blocked and exactly-one controls remain active.
