# Fardarter Drive™ Invoice — DRAFT / NOT A PAYMENT RECEIPT

**State:** `DRAFT_NOT_SENT`  
**Payment due:** not established until a final agreement and issued invoice exist  
**Payment settled:** no  
**Received cash:** $0 unless an external provider confirms `PAID_SETTLED`

## Invoice identity

| Field | Value |
|---|---|
| Draft invoice ID | `FD-INV-...` |
| Agreement reference | [accepted agreement or NONE] |
| Statement-of-work reference | [accepted SOW or NONE] |
| Provider | [verified legal name/address/tax details] |
| Buyer | [verified legal name/address] |
| Issue date | [blank until issued] |
| Due date | [blank until agreed] |
| Currency |  |
| External payment provider | [agreed provider or NONE] |

## Line items

| Description | Quantity | Unit price | Amount |
|---|---:|---:|---:|
| [accepted service only] |  |  |  |

| Total | Amount |
|---|---:|
| Subtotal |  |
| Approved expenses |  |
| Tax, if applicable |  |
| Total due |  |
| Provider-confirmed paid | 0 |
| Refunded | 0 |
| Net settled cash | 0 |

## Evidence and transaction boundary

- This draft does not create a contract, order, capacity reservation, payment obligation, settlement, or work-start authorization.
- Do not include bank account numbers, routing numbers, provider transaction IDs, card data, tax identifiers, buyer personal data, or confidential records in a public repository.
- The issued invoice must match an accepted agreement and scope.
- Only an agreed external provider may execute or confirm payment.
- An invoice status such as sent, viewed, due, pending, or paid-by-screenshot does not establish `PAID_SETTLED`.
- Fardarter Drive horizons are not invoiceable assets, valuations, or achieved revenue.

## Issuance gate

Before changing this document to `ISSUED_NOT_SETTLED`, verify:

- final parties and addresses;
- accepted agreement and SOW;
- exact amount, currency, tax and expense treatment;
- due date and provider;
- cancellation/refund terms;
- private invoice delivery destination;
- authority to issue;
- no sensitive data will enter the public repository.

## Settlement gate

Before recording any received money:

- retrieve provider-confirmed settlement evidence privately;
- verify amount, currency, fees, refunds, disputes, and availability;
- set money state to `PAID_SETTLED` only when supported;
- update the canonical revenue record through a reviewable evidence process;
- preserve a redacted public receipt without provider transaction data.

## Draft receipt

```text
Invoice issued: NO
Payment requested: NO
Payment pending: NO
Payment settled: NO
Gross revenue verified: $0
Net cash verified: $0
Work start authorized: NO
```
