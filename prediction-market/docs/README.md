# Event Desks — Documentation

**Version 1.0.1 · Last updated 2026-07-22**

*This documentation uses ASD-STE100 Simplified Technical English. Sentences are short.
The voice is active. The tense is present. Each sentence gives one instruction.*

This folder holds the technical documentation. The documentation uses the Diátaxis
system. Diátaxis puts each document into one of four groups. Each group answers a
different question.

| Group | It answers | Start here if you |
|---|---|---|
| [Tutorial](tutorial/) | "Teach me." | Are new. You want to run the site. |
| [How-to](how-to/) | "How do I do X?" | Have a task. You know the system. |
| [Reference](reference/) | "What is X?" | Want a fact. You want an exact value. |
| [Explanation](explanation/) | "Why is it like this?" | Want to understand a decision. |

## The other two deliverables

| Document | It contains | Path |
|---|---|---|
| White paper | The technical detail and the math. Each source has a citation. | [`../docs/white-paper.md`](white-paper.md) |
| Slide deck | The same content in plain words. | [`../docs/deck.md`](deck.md) |

## Rule: these documents are living

You must update this documentation in the same pass as a code change. Do not let the
documentation fall behind the build.

Obey these rules for each change:
1. Change the code.
2. Change the white paper, the deck, and these documents.
3. Add a line to [`../CHANGELOG.md`](../CHANGELOG.md).
4. Increase the version. Change the "last updated" date.

Do not delete a prior conclusion. Add the new information. Write what changed. Write why
it changed.

## Contents

### Tutorial
- [Run the site on your computer](tutorial/get-started.md)

### How-to
- [Deploy a change](how-to/deploy.md)
- [Add a new desk](how-to/add-a-desk.md)
- [Refresh the data feeds](how-to/refresh-data.md)
- [Measure the site traffic](how-to/measure-traffic.md)

### Reference
- [Folder structure](reference/structure.md)
- [The pricing functions](reference/pricing-api.md)
- [The field engine](reference/field-api.md)
- [The configuration block](reference/config.md)
- [The design rules](reference/design-rules.md)

### Explanation
- [Why conversion is the key number](explanation/conversion.md)
- [Why we exclude thin markets](explanation/thin-markets.md)
- [Why the build is one file](explanation/single-file.md)
- [Why the Kalshi prices are not live to the minute](explanation/kalshi-delay.md)
