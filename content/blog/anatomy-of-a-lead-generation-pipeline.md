---
title: How to build a lead generation data pipeline with Python and SQL
date: 2026-09-01
summary: The five stages behind a Python and SQL pipeline that produced 3,000+ qualified leads and facilitated ₹1.4 crore in revenue, with the funnel maths that governs yield.
description: The five stages of a lead generation data pipeline in Python and SQL: collect, clean, deduplicate, qualify, hand off. With funnel maths.
keywords: lead generation pipeline, data pipeline Python SQL, lead qualification, deduplication SQL, sales funnel conversion, data engineering, B2B lead generation
tags: Data Engineering, Business
---

Lead generation sounds like a sales problem. Underneath, it's a data problem: turning a large, messy pool of contacts into a short, trustworthy list a sales team will call.

I built a Python and SQL pipeline for exactly that.

<div class="figures">
  <div><strong>3,000+</strong><span>qualified leads generated</span></div>
  <div><strong>₹1.4Cr+</strong><span>revenue facilitated</span></div>
</div>

This post walks through the stages of a pipeline like it. The stages are standard. The results come from being disciplined at each one.

## The funnel maths behind lead yield

A pipeline is a chain of filters. If $N_0$ raw contacts enter and stage $i$ passes a fraction $p_i$, the qualified output is:

$$
N_{\text{qualified}} = N_0 \prod_{i=1}^{k} p_i
$$

Yield multiplies, so a weak stage anywhere caps the whole pipeline. Raising one stage's pass rate from 0.5 to 0.6 lifts final output by 20%, whichever stage it is. The practical rule: measure every stage's pass rate, then fix the lowest one first.

## Stage 1: collect into one table

Leads arrive from many sources in many formats. Land them all in one table with a consistent schema, and record each lead's source. Without source tracking, you can't tell later which channels earn their cost.

## Stage 2: clean and standardise fields

Mixed-case names, phone numbers with and without country codes, company names spelled three ways. Standardising these fields is unglamorous, and it determines the quality of everything downstream.

## Stage 3: deduplicate with SQL window functions

The same person often appears several times. A window function keeps the best record per contact in one query:

```sql
-- Illustrative: keep the most complete, most recent record per email
WITH ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(email))
      ORDER BY completeness_score DESC, updated_at DESC
    ) AS rn
  FROM leads_raw
)
SELECT * FROM ranked WHERE rn = 1;
```

Normalising the key with `LOWER(TRIM(...))` matters: without it, `Ana@x.com` and `ana@x.com ` count as different people.

## Stage 4: qualify leads with explicit rules

Not every contact is a lead. Qualification applies the business's rules for who deserves a sales conversation. Sales teams trust a short list that's reliably good far more than a long one they must filter themselves.

```python
# Illustrative: rules agreed with the sales team, applied consistently
def is_qualified(lead: dict) -> bool:
    return (
        lead["has_valid_contact"]
        and lead["segment"] in TARGET_SEGMENTS
        and lead["region"] in SERVICE_REGIONS
    )
```

> [!NOTE] Rules first, models later
> Start with explicit rules the sales team agrees on. They're transparent and easy to change, and the outcomes they produce become labelled data for a scoring model later.

## Stage 5: hand off and close the loop

The qualified list goes to the people who act on it. Then comes the step many pipelines skip: tracking what happened to each lead. That feedback measures each stage's real $p_i$ and ties the pipeline to revenue, not just volume.

## The principle underneath

None of these techniques are secret. A pipeline like this pays off when it's treated as a product for the sales team: output they trust, rules they understand, and results reported in the numbers they care about.

## Frequently asked questions

### What is a lead generation data pipeline?

It's an automated process that collects contacts from multiple sources, cleans and standardises them, removes duplicates, applies qualification rules and delivers a trusted list of sales-ready leads.

### How do you remove duplicate leads in SQL?

Use a window function: partition rows by a normalised key such as LOWER(TRIM(email)), order each group by completeness and recency with ROW_NUMBER(), and keep only the first row per group.

### How can I increase lead pipeline yield?

Qualified output equals raw input multiplied by every stage's pass rate, so measure each stage and improve the weakest one first. A 20% improvement at any single stage raises final output by 20%.
