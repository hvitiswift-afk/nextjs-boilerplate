# GRIPLOOM Science Source Rail

GRIPLOOM science intake uses visible source classes, freshness checks, and claim boundaries.

```txt
Read → tag → compare → cite → label uncertainty → publish only sourced summaries.
```

## Sources

### Phys.org

```txt
name: Phys.org
url: https://phys.org/
role: science news and research reporting
status: active source
freshness_use: current science and technology developments
```

Use Phys.org for broad science, physics, astronomy, biology, archaeology, mathematics, economics, and technology reporting.

### IFLScience

```txt
name: IFLScience
url: https://www.iflscience.com/
role: science news, explainers, and popular science features
status: active source
freshness_use: current science stories and explainers
```

Use IFLScience as a popular-science companion source. Treat sensational framing as a reason to cross-check with primary papers, institutions, or additional reporting before making strong claims.

### FTLScience

```txt
name: FTLScience
url: pending
role: requested science source candidate
status: unverified
freshness_use: do not use for factual claims until a canonical source is confirmed
```

FTLScience must stay unverified until a canonical URL, publisher identity, or source record is confirmed.

## Claim rules

1. Do not treat news articles as primary scientific evidence.
2. Prefer primary papers, university releases, agency releases, or journal pages for technical claims.
3. Use Phys.org and IFLScience as discovery rails and summary rails.
4. Mark speculative, early, single-study, or preprint claims clearly.
5. Do not convert collaboration signals into causation.
6. Do not publish medical, legal, financial, or safety advice from popular-science reporting alone.
7. Every science claim that could change with new research needs a date and source.

## GRIPLOOM tags

```txt
SOURCE_DISCOVERY      article points to a research topic
SOURCE_PRIMARY_NEEDED article needs paper/institution cross-check
SOURCE_POPSCI         accessible science explainer
SOURCE_NEWS           current science reporting
SOURCE_UNVERIFIED     requested source exists only as a candidate
```

## Intake receipt fields

```txt
source_name
source_url
source_status
article_title
article_url
article_date
primary_reference_url
claim_type
confidence
uncertainty_note
published_summary
```

## Rule

```txt
Science news opens the gate. Primary evidence carries the beam.
```
