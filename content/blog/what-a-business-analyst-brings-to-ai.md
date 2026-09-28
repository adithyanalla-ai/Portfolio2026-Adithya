---
title: What a business analyst brings to an AI team
date: 2026-09-24
summary: Why effective AI work starts with a business decision, not a model, and how A/B testing, cohort analysis and dashboards make AI projects succeed.
description: How business analysis makes AI projects succeed: framing decisions, A/B testing maths, cohort analysis and measuring AI in business outcomes.
keywords: business analyst AI, AI project success, A/B testing sample size, cohort analysis, AI strategy, measuring AI ROI, Power BI dashboards
tags: Business, Career
---

Many teams split the people who decide what to build from the people who build it. I've worked on both sides: marketing analytics, then business analyst and AI engineer at once, now leading AI engineering. This is what the analyst side contributes.

## Start from the decision, not the model

An engineer asks *what can we build?* An analyst asks *which decision are we improving?* The second question produces better AI systems because it defines success before any model exists.

> [!KEY] The analyst's first question
> Which decision does this change, who makes it, and how will we know it improved?

Working with C-suite leaders on strategic decisions taught me that AI projects rarely fail on accuracy. They fail because nobody agreed on the problem they solve.

## A/B testing: proving an AI feature works

At INT360 Design Studio I designed A/B tests to validate creative and channel choices with evidence. The same discipline proves whether an AI feature helps.

A test compares two conversion rates, $\hat p_A$ and $\hat p_B$. The two-proportion $z$-statistic says whether the gap is larger than chance:

$$
z = \frac{\hat p_B - \hat p_A}{\sqrt{\hat p\,(1 - \hat p)\left(\frac{1}{n_A} + \frac{1}{n_B}\right)}}
$$

where $\hat p$ is the pooled rate across both groups. $|z| > 1.96$ is significant at the 5% level.

Before running a test, estimate how many users each group needs. A standard rule of thumb for 80% power at a 5% significance level is:

$$
n \approx \frac{16\, p\,(1 - p)}{\delta^2}
$$

Here $p$ is the baseline rate and $\delta$ the smallest lift worth detecting. Halving $\delta$ quadruples $n$, which is why tests chasing tiny improvements need enormous traffic. Knowing this up front stops teams from calling a result too early.

## Cohort analysis: where averages lie

Averages hide what matters. Cohort analysis groups users by a shared starting point, such as sign-up month, and tracks each group over time. Applied to AI, it reveals where a model performs and where it quietly fails for a segment the average conceals.

## Dashboards that leadership opens

A Power BI dashboard that leaders check every week does more for an AI programme's survival than any model card. It keeps results visible in the terms decision-makers use.

## Measure AI in business units

The numbers I'm asked about most aren't model metrics:

<div class="figures">
  <div><strong>₹1.4Cr+</strong><span>business impact facilitated</span></div>
  <div><strong>3,000+</strong><span>qualified leads generated</span></div>
  <div><strong>20+ hrs</strong><span>staff time automated weekly, across 4 organisations</span></div>
</div>

Each came from systems with real technical depth. They're reported in revenue, leads and hours because those are the units of the people funding the work.

## One person, both roles

When one person hears the business problem, frames it measurably, builds the system and reports the result, nothing is lost in handover documents. It isn't the only team structure. But every AI team inside a business needs someone who thinks like an analyst and has a seat where decisions are made.

> [!TIP] A hiring test
> Ask candidates to explain a model's value without mentioning the model. It quickly shows who thinks in outcomes.

## Frequently asked questions

### Why do AI projects fail?

AI projects most often fail because the business problem was never clearly defined or agreed, not because the model was inaccurate. Framing the decision first defines what success means.

### How many users does an A/B test need?

A common rule of thumb for 80% power at 5% significance is n ≈ 16·p(1−p)/δ² per group, where p is the baseline conversion rate and δ the smallest lift worth detecting. Halving δ quadruples the required sample.

### What does a business analyst do on an AI team?

A business analyst frames the decision the AI should improve, defines success metrics, validates impact with experiments such as A/B tests and cohort analysis, and reports results in business terms like revenue, cost and time saved.
