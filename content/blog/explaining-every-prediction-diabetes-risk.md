---
title: Explainable diabetes prediction with Random Forest and SHAP
date: 2026-09-08
updated: 2026-10-12
summary: How a tuned Random Forest reached 0.87 ROC-AUC on diabetes risk, why ROC-AUC mattered more than accuracy, and how SHAP explains every prediction.
description: Build an explainable diabetes prediction model: Random Forest tuned with GridSearchCV, 0.87 ROC-AUC, SHAP explanations and a Streamlit app.
keywords: diabetes prediction machine learning, explainable AI healthcare, SHAP values, Random Forest classifier, ROC-AUC explained, GridSearchCV, Streamlit app
tags: Machine Learning, Research
---

Explainable diabetes prediction means using a machine-learning model that estimates a person's diabetes risk and also shows which inputs produced that estimate. In my peer-reviewed study, a tuned Random Forest reached over 82% accuracy and a ROC-AUC of 0.87, and SHAP attributes each prediction to the measurements behind it. The model runs as an interactive Streamlit web app.

> [!CAUTION] Medical disclaimer
> This article is for education only. It describes a research model and is not medical advice or a diagnosis. For questions about your own health, talk to a qualified clinician.

<div class="figures">
  <div><strong>82%+</strong><span>accuracy</span></div>
  <div><strong>0.87</strong><span>ROC-AUC</span></div>
  <div><strong>1</strong><span>SHAP explanation per prediction</span></div>
</div>

<!--
TODO (Adithya): checklist for this post. Nothing below is shown to readers; each item is a gap that needs your real data.
- [PLACEHOLDER] Dataset: name, source, licence, number of records, number of features, class balance, and the population it describes.
- [PLACEHOLDER] Evaluation: how the data was split (train/test or cross-validation), the number of test records, and the exact metric values from the paper.
- [PLACEHOLDER] Extra metrics: confusion matrix, sensitivity (recall), specificity and precision at the threshold used in the app.
- [PLACEHOLDER] Baselines: any other models you compared, with their scores. Leave out if the paper has none.
- [PLACEHOLDER] Best GridSearchCV hyperparameters actually selected.
- [PLACEHOLDER] Screenshots: app input form, a prediction with its SHAP breakdown, and the global SHAP summary plot.
  To add one: resize it to 800 and 1600 wide WebP (see docs/DEVELOPMENT.md), register it in lib/figures.ts with its width, height and
  descriptive alt text, then write ![short label](fig:your-key "Caption") here. Plain image links are rejected at build time so that
  every image keeps explicit dimensions and alt text.
- [PLACEHOLDER] Direct link to the paper (DOI or article URL), the live app and the code repository, if public.
-->

## The problem: a risk score needs a reason

A risk score without a reason is a number someone must take on faith. In healthcare, that isn't enough: a clinician or patient needs to know *why* the model reached its answer.

That principle drove my peer-reviewed paper, [*Diabetes Data Analysis and Machine Learning Based Prediction Model on Streamlit Web App*](https://ijsred.com) (IJSRED, October 2022). The goal was a model that predicts diabetes risk accurately and explains each prediction. The same work is summarised on the [Diabetes Risk Prediction project page](/projects/diabetes-risk-prediction-web-app).

<!-- TODO: add the dataset description here (see checklist above). Do not state a dataset name or size until confirmed. -->

## The approach: a tuned Random Forest

The model is a Random Forest, which trains many decision trees on bootstrapped samples of the data and averages their votes. It captures non-linear interactions between clinical features and needs no feature scaling.

### Why ROC-AUC mattered more than accuracy

Accuracy counts correct predictions at one fixed threshold. For screening, that threshold is a policy choice: you may accept more false alarms to miss fewer real cases. The model should be judged on how well it *ranks* risk, independent of where the line is drawn.

ROC-AUC measures exactly that. It equals the probability that the model scores a randomly chosen positive case above a randomly chosen negative one:

$$
\text{AUC} = P\big(s(X^{+}) > s(X^{-})\big)
$$

An AUC of $0.87$ means the model ranks a person with diabetes above a person without it in 87% of random pairs. A coin flip scores $0.5$; a perfect ranker scores $1.0$.

> [!KEY] Accuracy versus ROC-AUC
> Accuracy judges a model at one threshold. ROC-AUC judges its ranking across every threshold, which is what a screening decision depends on.

### Tuning with GridSearchCV

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

<!-- TODO: replace the example grid above with the grid and the selected hyperparameters you actually used, or keep the "sketch" wording. -->

## How each prediction is explained with SHAP

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

<!-- TODO: add the SHAP waterfall and summary-plot screenshots, plus one sentence on the top features the model actually found (only from your real output). -->

## The Streamlit app

A model in a notebook helps nobody. I deployed it as a Streamlit web app: enter clinical values, receive a risk estimate and the SHAP breakdown behind it. Streamlit turns a Python script into an interactive interface with no separate front end.

<!-- TODO: add app screenshots and, if public, the live app and code links (see checklist above). -->

## Results

The tuned Random Forest achieved:

- **Accuracy:** over 82%.
- **ROC-AUC:** 0.87, so it ranks a person with diabetes above a person without it in 87% of random pairs.
- **Explanation:** one SHAP breakdown for every prediction.

These are the figures reported in the peer-reviewed paper (IJSRED, October 2022).

<!-- TODO: add the dataset, split, test-set size, confusion matrix, sensitivity and specificity from the paper. Do not add numbers that are not in the paper. -->

## Limitations

- **Not a diagnostic tool.** It is research software built to show how an explainable risk model works. It cannot diagnose diabetes or replace a clinician.
- **Ranking is not calibration.** A ROC-AUC of 0.87 says the model orders people well. It does not say a predicted risk of, say, 30% matches a true 30% chance.
- **Explanations describe the model, not causes.** SHAP shows which inputs moved this model's score. A feature that raises the score is not thereby a cause of diabetes.
- **Reported figures come from one study.** Results depend on the dataset used and may differ for other populations.

<!-- TODO: state the dataset's population and size, and whether you validated on data from a different source. Add or drop the last bullet accordingly. -->

## What's next

Two lessons from this work carried forward:

1. **Choose the metric that matches the decision.** How the output will be used defines what "good" means.
2. **Ship the explanation with the prediction.** People act on a model they can question and ignore one they can't.

The second lesson shapes the agentic systems I build today; see [what I'm building in 2026](/blog/what-im-building-in-2026) and the [GBNI framework](/projects/gbni-generative-brand-narrative-intelligence).

<!-- TODO: add any concrete next steps for the diabetes model itself (for example external validation or calibration) only once you decide to do them. -->

## Frequently asked questions

### What does a ROC-AUC of 0.87 mean?

It means the model ranks a randomly chosen person with diabetes above a randomly chosen person without it 87% of the time. A random guess scores 0.5 and a perfect model scores 1.0.

### Why use SHAP for healthcare machine learning?

SHAP attributes each prediction exactly to its input features, so clinicians and patients can see which measurements raised or lowered a risk score. That transparency is essential when a model informs health decisions.

### Why choose a Random Forest for diabetes prediction?

A Random Forest captures non-linear relationships between clinical features, is robust to noise, needs no feature scaling, and works with SHAP's fast TreeExplainer for exact explanations.

### How accurate was the diabetes prediction model?

The tuned Random Forest achieved over 82% accuracy and a ROC-AUC of 0.87, published in a peer-reviewed paper in IJSRED in October 2022.
