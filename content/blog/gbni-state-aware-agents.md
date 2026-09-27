---
title: GBNI, briefly: agents that know what state the conversation is in
date: 2026-09-15
summary: The idea behind Generative Brand Narrative Intelligence, my state-aware multimodal agent framework, explained without the paper's formalism.
tags: Agentic AI, Research
---

Most generative systems treat every request as if it were the first. You send a prompt, you get output, and the system forgets. That works for one-off tasks. It works badly for communication, where what you should say depends on what has already happened and how the other side is feeling.

GBNI (Generative Brand Narrative Intelligence) is my answer to that gap. It's a **state-aware multimodal agent framework for emotionally adaptive brand communication**. The formal version is [on SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6845958) (Abstract ID 6845958). This post is the plain-language version.

## The problem with stateless generation

Imagine a brand talking to the same audience over weeks. A stateless generator can match a tone guide. What it can't do is notice that the mood has shifted, that a message landed badly, or that the conversation has moved on. Each output is locally reasonable and globally incoherent.

> [!NOTE] What "state" means here
> State is everything the system carries forward between turns: where the conversation stands, how the audience is responding, and what the brand is trying to achieve. GBNI treats that state as something to model explicitly rather than hoping a prompt captures it.

## Three ideas in the framework

**State-aware.** The agent keeps an explicit picture of the situation and updates it as things happen. Generation is conditioned on that picture, not just on the latest request.

**Multimodal.** Brand communication isn't only text. The framework is designed to work across the forms a brand actually uses, so the narrative holds together whatever the medium.

**Emotionally adaptive.** The goal isn't a single "on-brand" voice applied everywhere. It's a voice that stays recognisably the brand while adjusting to the emotional context it's speaking into.

## From paper to production

This isn't only a research idea. The project's second half, Autonomous Agency Workflows, puts agents to work on real operations.

<div class="figures">
  <div><strong>5</strong><span>autonomous agent pipelines running in production</span></div>
  <div><strong>20+ hrs</strong><span>of staff time recovered every week</span></div>
</div>

GBNI also shows up somewhere less obvious: [Aglier](/#work), the tree-climbing fruit-harvesting robot I'm patenting, carries an onboard GBNI subsystem for state-aware reasoning. An agent that tracks its situation turns out to be useful well beyond marketing.

## Where it's going

The SSRN paper is the first step. I'm expanding it into a 120+ page IEEE paper and a full book manuscript, which will cover the framework in the depth the short paper couldn't.

> [!TIP] Read the source
> The [SSRN abstract](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6845958) is the best place to start if you want the formal definitions. If you're working on stateful or multimodal agents, I'd be glad to [compare notes](/#contact).
