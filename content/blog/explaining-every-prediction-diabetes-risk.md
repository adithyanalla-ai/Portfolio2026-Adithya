---
title: Explainable diabetes prediction with Random Forest and SHAP
date: 2026-09-08
summary: How a tuned Random Forest reached 0.87 ROC-AUC on diabetes risk, why ROC-AUC mattered more than accuracy, and how SHAP explains every prediction.
description: Build an explainable diabetes prediction model: Random Forest tuned with GridSearchCV, 0.87 ROC-AUC, SHAP explanations and a Streamlit app.
keywords: diabetes prediction machine learning, explainable AI healthcare, SHAP values, Random Forest classifier, ROC-AUC explained, GridSearchCV, Streamlit app
tags: Machine Learning, Research
---

A risk score without a reason is a number someone must take on faith. In healthcare, that isn't enough: a clinician or patient needs to know *why* the model reached its answer.

That principle drove my peer-reviewed paper, [*Diabetes Data Analysis and Machine Learning Based Prediction Model on Streamlit Web App*](https://ijsred.com) (IJSRED, October 2022). The goal was a model that predicts diabetes risk accurately and explains each prediction.

<div class="figures">
  <div><strong>82%+</strong><span>accuracy</span></div>
  <div><strong>0.87</strong><span>ROC-AUC</span></div>
  <div><strong>1</strong><span>SHAP explanation per prediction</span></div>
</div>

## Why ROC-AUC mattered more than accuracy

Accuracy counts correct predictions at one fixed threshold. For screening, that threshold is a policy choice: you may accept more false alarms to miss fewer real cases. The model should be judged on how well it *ranks* risk, independent of where the line is drawn.

ROC-AUC measures exactly that. It equals the probability that the model scores a randomly chosen positive case above a randomly chosen negative one:

$$
\text{AUC} = P\big(s(X^{+}) > s(X^{-})\big)
$$

An AUC of $0.87$ means the model ranks a person with diabetes above a person without it in 87% of random pairs. A coin flip scores $0.5$; a perfect ranker scores $1.0$.

> [!KEY] Accuracy versus ROC-AUC
> Accuracy judges a model at one threshold. ROC-AUC judges its ranking across every threshold, which is what a screening decision depends on.

## Tuning a Random Forest with GridSearchCV

A Random Forest trains many decision trees on bootstrapped samples of the data and averages their votes. It captures non-linear interactions between clinical features and needs no feature scaling.

Default hyperparameters are rarely optimal, so I tuned them with GridSearchCV. It scores every combination in a grid using $k$-fold cross-validation, so the winner isn't flattered by one lucky split. The cost is easy to predict. A grid with $a$, $b$ and $c$ values for three parameters, cross-validated over $k$ folds, trains

$$
N_{\text{fits}} = a \cdot b \cdot c \cdot k
$$

models. The sketch below uses a $3 \times 3 \times 3$ grid with 5 folds, so it trains $27 \times 5 = 135$ forests before refitting the best one.

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
    scoring="roc_auc",   # optimise ranking, not raw accuracy
    cv=5,
    n_jobs=-1,
)
search.fit(X_train, y_train)
model = search.best_estimator_
```

Setting `scoring="roc_auc"` matters: the search optimises the metric that matches the decision, not a default.

## How SHAP explains each prediction

Hundreds of trees make an accurate but opaque model. SHAP (SHapley Additive exPlanations) opens it using Shapley values from cooperative game theory. Each feature is a player, and its contribution $\phi_i$ is its average marginal effect across every possible coalition $S$ of the other features $F$:

$$
\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!\,\big(|F| - |S| - 1\big)!}{|F|!}\Big[f\big(S \cup \{i\}\big) - f(S)\Big]
$$

The property that makes SHAP trustworthy is **additivity**. A prediction decomposes exactly into a baseline plus one contribution per feature:

$$
f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i
$$

Here $\phi_0$ is the average prediction across the data. Nothing is hidden in a residual: every point of risk is attributed to a specific input.

That gives two views of the model:

- **Global:** which features drive risk across the population.
- **Local:** for one person, which values raised the score and which lowered it.

The local view builds trust. Instead of "your risk is high", the model shows which measurements produced that score.

```python
import shap

explainer = shap.TreeExplainer(model)      # exact, fast Shapley values for tree models
shap.plots.waterfall(explainer(X_test)[0]) # one person's prediction, feature by feature
```

`TreeExplainer` computes Shapley values exactly for tree ensembles in polynomial time, avoiding the exponential cost of the formula above.

## Deploying the model as a Streamlit app

A model in a notebook helps nobody. I deployed it as a Streamlit web app: enter clinical values, receive a risk estimate and the SHAP breakdown behind it. Streamlit turns a Python script into an interactive interface with no separate front end.

## Two lessons that carried forward

1. **Choose the metric that matches the decision.** How the output will be used defines what "good" means.
2. **Ship the explanation with the prediction.** People act on a model they can question and ignore one they can't.

The second lesson shapes the agentic systems I build today.

## Frequently asked questions

### What does a ROC-AUC of 0.87 mean?

It means the model ranks a randomly chosen person with diabetes above a randomly chosen person without it 87% of the time. A random guess scores 0.5 and a perfect model scores 1.0.

### Why use SHAP for healthcare machine learning?

SHAP attributes each prediction exactly to its input features, so clinicians and patients can see which measurements raised or lowered a risk score. That transparency is essential when a model informs health decisions.

### Why choose a Random Forest for diabetes prediction?

A Random Forest captures non-linear relationships between clinical features, is robust to noise, needs no feature scaling, and works with SHAP's fast TreeExplainer for exact explanations.

### How accurate was the diabetes prediction model?

The tuned Random Forest achieved over 82% accuracy and a ROC-AUC of 0.87, published in a peer-reviewed paper in IJSRED in October 2022.
