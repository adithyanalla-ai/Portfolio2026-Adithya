---
title: Aglier: inside an AI tree-climbing fruit-harvesting robot
date: 2026-09-28
summary: How Aglier climbs a trunk, decides which fruit is ripe and picks it in five timed stages, with the claw geometry and cycle-time maths behind the design.
description: Aglier is an AI tree-climbing fruit-harvesting robot. See its components, claw-closure geometry, five-stage harvest cycle and the maths behind them.
keywords: fruit harvesting robot, tree climbing robot, agricultural robotics, harvesting automation, robotic gripper, claw geometry, harvest cycle time, GBNI
tags: Robotics, Research, Agentic AI
image: aglier-fig9
icon: /images/aglier/logo
featured: true
---

Aglier is a robot that climbs a fruit tree, finds ripe fruit with an onboard camera, picks it and drops it into a basket it carries. I am its sole inventor and I'm drafting the patent specification. The figures in this post come from that specification.

This article covers what the robot is made of, how it holds onto a trunk, how long one pick takes, and where AI fits in. The numbers are the representative ranges in the drawings. They show how the design is reasoned, not field-test results.


## What the robot is made of

The annotated view labels every major part with a reference numeral. They group into four jobs:

| Job | Parts |
|---|---|
| **Hold the tree** | Four clamps: upper (30a), second (30b), third (30c), lower (30d) |
| **See** | Camera module with AI (20): wide-angle camera for navigation (21), depth sensor for distance (22), LED illuminator for low light (23) |
| **Pick** | Articulated arm (40), end-effector gripper (80), collection basket (50) |
| **Run** | Main body and control unit (10), battery pack (60), communication module over Wi-Fi, 4G, 5G or LoRa (70) |

Four independent clamps let the robot keep hold of the trunk while it repositions. The depth sensor matters as much as the camera. Knowing that an apple is ripe is useless unless the arm also knows how far away it is.

## How Aglier grips a trunk: the closure-angle equation

Trunks vary in thickness, so a clamp can't close to a fixed position. Each claw pair pivots until its tips touch the bark. FIG. 3 shows the geometry.

![Claw-pair closure geometry around a trunk](fig:aglier-fig3 "FIG. 3: A claw pair closing on a trunk of radius r. Each arm has length L; θ is the closure angle between the claw tips.")

Half of the claw pair forms a right triangle. The claw arm of length $L$ is the hypotenuse, the trunk radius $r$ is the opposite side, and the angle at the pivot is $\theta/2$. So:

$$
r = L \sin\left(\frac{\theta}{2}\right)
\qquad\Longleftrightarrow\qquad
\theta = 2\,\sin^{-1}\!\left(\frac{r}{L}\right)
$$

The relationship works in both directions, which is the useful part:

- **Radius to angle:** given the trunk radius, the controller knows how far to close the claws.
- **Angle to radius:** the joint angle is measurable, so once the claws touch bark the robot can calculate the trunk's radius from it. The drawing labels $r$ as the *sensed* trunk radius for this reason.

Only the ratio $r/L$ matters, so the curve below holds for any claw length:

```chart
{
  "type": "curve",
  "title": "Closure angle needed for each trunk-radius-to-claw-length ratio",
  "caption": "θ = 2·arcsin(r/L). The curve steepens as r approaches L, so small radius errors cause large angle changes near the limit.",
  "curve": "closure-angle",
  "x": { "label": "r / L (trunk radius ÷ claw length)", "min": 0, "max": 1, "ticks": [0, 0.2, 0.4, 0.6, 0.8, 1] },
  "y": { "label": "Closure angle θ", "min": 0, "max": 180, "ticks": [0, 45, 90, 135, 180], "format": "deg" },
  "marks": [0.5, 0.707, 0.866]
}
```

Three reference points make it concrete. A trunk whose radius is half the claw length needs $60^\circ$; at $r/L \approx 0.71$ the claws sit at $90^\circ$; at $r/L \approx 0.87$ they need $120^\circ$.

### Why the steep end of the curve is a design constraint

Differentiating the closure equation shows how sensitive the angle is to radius:

$$
\frac{d\theta}{dr} = \frac{2}{L\sqrt{1 - (r/L)^2}}
$$

As $r/L \to 1$ the denominator goes to zero and the sensitivity grows without bound. Near that limit, a millimetre of sensing error means a large change in claw angle, and the grip gets unreliable. At $r = L$ the claws are fully open ($\theta = 180^\circ$) and the pair can't wrap the trunk at all.

The practical rule follows directly: **choose a claw length well above the largest trunk radius the robot must climb**, so it always works on the flatter part of the curve.

## Six ways to hold onto bark

Bark ranges from smooth to deeply furrowed, so the specification covers six alternative ways to engage it.

![Six alternative bark-engagement mechanisms](fig:aglier-fig5 "FIG. 5: Alternative bark-engagement embodiments, from high-friction claws to pneumatic clamps.")

| Embodiment | How it grips |
|---|---|
| **(A) Claw / friction clamp** | Articulated claw arms with high-friction pads |
| **(B) Microspine array** | Many small spines that catch in bark texture |
| **(C) Hybrid adhesive + microspine foot** | Spines for mechanical grip plus an adhesive layer for extra traction |
| **(D) Continuum / tendon-driven wrap gripper** | Flexible segments that wrap the trunk, opened and closed by a tendon drive |
| **(E) Wheeled / tracked spring-cinch** | Wheels or tracks on the bark, held closed by a spring-cinch mechanism |
| **(F) Pneumatic flexible clamp** | Inflatable bladders pressed against the trunk through an air supply line |

Covering several mechanisms protects the invention against a single design choice. It also reflects reality: no single gripper suits every tree.

## The five-stage harvest cycle, timed

Every fruit goes through the same sequence. FIG. 14 gives a representative time range for each stage and the part of the robot responsible for it.

![Per-fruit harvest cycle timing diagram](fig:aglier-fig14 "FIG. 14: Per-fruit harvest cycle. Timings are illustrative; real durations depend on trunk geometry, fruit position, vision confidence, actuator speed and conditions.")

```chart
{
  "type": "range",
  "title": "Representative time range for each stage of one fruit pick",
  "caption": "Ranges from FIG. 14. The total row adds the stage minimums and maximums.",
  "unit": "s",
  "rows": [
    { "label": "1. Climb / reposition", "min": 2, "max": 5, "note": "clamps 30a–30d" },
    { "label": "2. Vision + AI decision", "min": 0.2, "max": 0.8, "note": "vision / AI module 20" },
    { "label": "3. Arm approach", "min": 0.5, "max": 1.8, "note": "articulated arm 40" },
    { "label": "4. Cut / grasp", "min": 0.5, "max": 2.8, "note": "end-effector" },
    { "label": "5. Transfer / release", "min": 0.5, "max": 1.5, "note": "collection basket 50" }
  ],
  "total": "Full cycle"
}
```

### What the timing budget tells us

Adding the stages gives the cycle-time bounds:

$$
T_{\min} = 2 + 0.2 + 0.5 + 0.5 + 0.5 = 3.7\ \text{s}
\qquad
T_{\max} = 5 + 0.8 + 1.8 + 2.8 + 1.5 = 11.9\ \text{s}
$$

If every fruit needed a full cycle, the implied throughput would be:

$$
\frac{3600\ \text{s/h}}{11.9\ \text{s}} \approx 303
\quad\text{to}\quad
\frac{3600\ \text{s/h}}{3.7\ \text{s}} \approx 973\ \text{fruit per hour}
$$

That's arithmetic on illustrative ranges, not measured performance. It still exposes the design priority. Climbing and repositioning take $2/3.7 \approx 54\%$ of the fastest cycle and $5/11.9 \approx 42\%$ of the slowest, making it the largest single stage in both cases. The AI decision itself is the smallest, at most $0.8$ seconds.

> [!KEY] The engineering takeaway
> The biggest gains come from moving less, not from thinking faster. Every fruit picked from one position skips stage 1 for that fruit.

## Where the AI sits, and where it doesn't

Stage 2 is where AI makes the real-time call. The camera module confirms a fruit is ripe and reachable, and the depth sensor gives the arm its target.

The second role is quieter. Each completed cycle is time-stamped and written to a structured event log. Batch-level records from that log **may later feed an asynchronous GBNI narrative tier**, which turns harvest data into readable summaries. The specification is explicit that this path **does not control the real-time harvest cycle**.

That separation is deliberate. Clamping and cutting must never wait on a language model. Keeping narrative generation off the control loop means a slow or unavailable AI summary can't affect safety or timing. GBNI is my state-aware agent framework; I explain it in [GBNI, briefly](/blog/gbni-state-aware-agents).

## Frequently asked questions

### What is Aglier?

Aglier is an AI-integrated robot that climbs fruit trees and harvests fruit. It grips the trunk with four clamps, uses an AI camera module with a depth sensor to find ripe fruit, and picks it with an articulated arm and gripper into an onboard basket.

### How does a tree-climbing robot grip trunks of different sizes?

Each claw pair pivots until its tips meet the bark. The closure angle follows $\theta = 2\sin^{-1}(r/L)$, where $r$ is the trunk radius and $L$ the claw length. Reading the angle back also lets the robot calculate the trunk's radius.

### How long does Aglier take to pick one fruit?

The specification's representative ranges add up to about 3.7 to 11.9 seconds per fruit across five stages: climb, vision decision, arm approach, cut or grasp, and transfer. These are illustrative; real times depend on the tree and conditions.

### Does the AI control the robot's movements?

The AI camera module makes the real-time ripeness and targeting decision. The GBNI narrative tier only reads batch records from the event log afterwards and never controls the harvest cycle.

### Is Aglier patented?

Adithya Reddy is the sole inventor and is drafting the patent specification. The figures in this article come from that specification.
