---
title: Explaining every prediction: a diabetes risk model people can trust
date: 2026-09-08
summary: How I paired a tuned Random Forest with SHAP so each risk score comes with its reasons, and why ROC-AUC mattered more than accuracy.
tags: Machine Learning, Research
---

A risk score on its own is a number someone has to take on faith. In healthcare that isn't good enough. A clinician, or a patient, wants to know *why* the model said what it said.

That was the starting point for my paper, [*Diabetes Data Analysis and Machine Learning Based Prediction Model on Streamlit Web App*](https://ijsred.com), published in October 2022. The goal was a prediction model that stays accurate and also explains every prediction it makes.

<div class="figures">
  <div><strong>82%+</strong><span>accuracy</span></div>
  <div><strong>0.87</strong><span>ROC-AUC</span></div>
  <div><strong>1</strong><span>explanation per prediction, via SHAP</span></div>
</div>

## Why accuracy wasn't the headline

Accuracy counts how many predictions land on the right side of a fixed threshold. For a screening tool, the threshold is a policy decision: you might accept more false alarms to miss fewer real cases. So I wanted a measure of how well the model *ranks* risk, independent of where the line gets drawn.

That measure is ROC-AUC. A score of **0.87** means that if you pick one person who has the condition and one who doesn't, at random, the model gives the first a higher risk score 87% of the time. That's the property a screening tool needs.

> [!KEY] The distinction that matters
> Accuracy judges a model at one threshold. ROC-AUC judges how it ranks risk across every threshold, which is what a screening decision actually depends on.

## A Random Forest, tuned honestly

I used a Random Forest: many decision trees, each trained on a different sample of the data, voting together. It handles non-linear relationships between clinical features well and needs little feature scaling.

Its defaults are rarely the best settings, so I tuned it with GridSearchCV. That tries every combination in a grid of hyperparameters and scores each one with cross-validation, so the choice isn't flattered by a lucky split. Here's the shape of that step:

```python
# A minimal sketch of the approach, not the paper's exact code.
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV

grid = {
    "n_estimators": [100, 300, 500],
    "max_depth": [None, 6, 10],
    "min_samples_leaf": [1, 3, 5],
}

search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    grid,
    scoring="roc_auc",   # optimise for ranking, not raw accuracy
    cv=5,
    n_jobs=-1,
)
search.fit(X_train, y_train)
model = search.best_estimator_
```

## Opening the forest with SHAP

A forest of hundreds of trees is accurate but opaque. SHAP (SHapley Additive exPlanations) fixes that. It borrows an idea from game theory: treat each feature as a player and work out how much it contributed to moving one prediction away from the average.

That gives two views:

- **Global:** which features drive risk across the whole population.
- **Local:** for one person, which of their values pushed the score up and which pulled it down.

The local view is the one that builds trust. Instead of "your risk is high", the model can show which specific measurements drove that score.

```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# One person's prediction, broken down feature by feature
shap.plots.waterfall(explainer(X_test)[0])
```

## Putting it in front of people

A model in a notebook helps nobody. I deployed it as a Streamlit web app: enter the values, get a risk estimate, and see the SHAP breakdown behind it. Streamlit made it possible to go from trained model to usable interface without a separate front-end project.

## What carried forward

Two habits from this project still shape how I work:

1. **Pick the metric that matches the decision.** The right metric depends on how the output will be used, not on what's easiest to report.
2. **Ship the explanation with the prediction.** People act on a model they can question, and ignore one they can't.

That second habit is a big part of why I care about explainability in the agentic systems I build now.
