---
title: Anatomy of a lead-generation pipeline
date: 2026-09-01
summary: The stages behind a Python and SQL pipeline that produced 3,000+ qualified leads and helped facilitate more than ₹1.4 crore in revenue.
tags: Data Engineering, Business
---

Lead generation sounds like a sales problem. Underneath, it's a data problem: getting from a large, messy pool of possible contacts to a short, trustworthy list that a sales team will actually call.

I built a Python and SQL pipeline for exactly that.

<div class="figures">
  <div><strong>3,000+</strong><span>qualified leads generated</span></div>
  <div><strong>₹1.4Cr+</strong><span>revenue facilitated</span></div>
</div>

This post walks through the general shape of a pipeline like this. The stages are the standard ones. The value comes from being disciplined about each one.

## 1. Collect into one place

Leads arrive from different sources in different formats. The first job is to land them all in one database table with a consistent schema, keeping a record of where each one came from. Without source tracking, you can't tell later which channels are worth the effort.

## 2. Clean and standardise

Names in mixed case, phone numbers with and without country codes, company names spelled three ways. Standardising these fields is unglamorous, and it decides the quality of everything downstream.

## 3. Remove duplicates

The same person often appears several times. SQL window functions make it straightforward to keep the best record for each contact:

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

## 4. Qualify

Not every contact is a lead. Qualification applies the business's rules for who is worth a sales conversation. This is where a pipeline earns its keep: sales teams trust a short list that's reliably good far more than a long one they have to filter themselves.

```python
# Illustrative: rules the sales team agreed on, applied consistently
def is_qualified(lead: dict) -> bool:
    return (
        lead["has_valid_contact"]
        and lead["segment"] in TARGET_SEGMENTS
        and lead["region"] in SERVICE_REGIONS
    )
```

> [!NOTE] Rules first, models later
> Start with explicit rules the sales team agrees on. They're transparent, easy to change, and they give you labelled outcomes you can later use to train a scoring model.

## 5. Hand off, then measure

The qualified list goes to the people who'll act on it. Then comes the part many pipelines skip: tracking what happened to each lead, so the next run can be better than the last. That feedback is what connects a pipeline to revenue rather than just volume.

## The principle underneath

None of these techniques are secret. What makes a pipeline like this pay off is treating it as a product for the sales team: output they can trust, rules they understand, and results reported in the numbers they care about.
