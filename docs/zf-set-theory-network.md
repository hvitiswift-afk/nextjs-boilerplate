# Zermelo-Fraenkel Set Theory Math Network Connector

This module models Zermelo-Fraenkel set theory as a symbolic network connector.

It is a formal scaffold, not a metaphysical engine. The notation is powerful, but the potato remains a potato.

## Route

```txt
/math-network/zf
```

## Files

```txt
data/zfSetTheory.ts
components/ZFSetTheoryConnector.tsx
app/math-network/zf/page.tsx
docs/zf-set-theory-network.md
```

## Network interpretation

- Nodes represent axioms, relations, and extension points.
- Edges represent definition, construction, dependency, guard behavior, or extension behavior.
- Membership is the primitive relation used to define equality and subset.
- Choice is tracked as an explicit extension point, giving ZFC when added to ZF.

## Core predicates

```txt
x ∈ A
A ⊆ B ⇔ ∀x(x ∈ A → x ∈ B)
A = B ⇔ ∀x(x ∈ A ↔ x ∈ B)
⋃A = {x | ∃y(y ∈ A ∧ x ∈ y)}
P(A) = {x | x ⊆ A}
ZF + AC = ZFC
```

## Included ZF nodes

| Node | Kind | Purpose |
|---|---:|---|
| Extensionality | axiom | Defines set equality by shared membership. |
| Empty Set | axiom | Establishes a set with no members. |
| Pairing | axiom | Allows construction of `{a,b}`. |
| Union | axiom | Flattens a set of sets by one membership layer. |
| Power Set | axiom | Collects all subsets of a set. |
| Separation Schema | axiom | Filters an existing set by a predicate. |
| Replacement Schema | axiom | Maps a set-sized domain to a set-sized image. |
| Infinity | axiom | Gives an inductive set for natural-number construction. |
| Foundation | axiom | Blocks circular or infinitely descending membership chains in standard ZF. |
| Membership | relation | Primitive element relation. |
| Subset | relation | Membership containment relation. |
| Choice Extension | extension | Optional AC extension, forming ZFC. |

## Design rule

The connector should make formal dependencies visible. It should not pretend that set theory is a magical ontology machine. ZF is a language and axiom system for building mathematics with precise rules. No universal-set goblin gets smuggled through the back door.

## Network health

The data file exports `zfNetworkHealth()`, which reports:

```txt
axiomCount
relationCount
extensionCount
edgeCount
meanAxiomWeight
guardEdges
extensionEdges
```

These metrics are not mathematical truth scores. They are UI/system summary measures for the connector diagram.
