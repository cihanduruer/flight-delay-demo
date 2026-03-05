# UC-005: Jupyter notebook for predictive modeling

## Goal

Use Jupyter notebooks to build, evaluate, and iterate on a machine learning model that predicts flight arrival delay probability more accurately than the current historical-frequency approach.

## Primary actor

- Data scientist / analyst (or developer with ML interest)

## Preconditions

- The 2013 flight dataset (`data/flights.csv`) is available
- A Python environment with common data science libraries is available (pandas, scikit-learn, matplotlib/plotly, Jupyter)

## Trigger

- Team decides that the historical frequency approach (UC-001) is too coarse and wants to improve predictions using additional features

## Main success scenario

1. Analyst opens a Jupyter notebook in the `notebooks/` directory
2. Analyst explores the dataset (distributions, correlations, missing values)
3. Analyst engineers features beyond weekday + destination airport, such as:
   - Carrier
   - Origin airport
   - Month / season
   - Time of day bucket
   - Route (origin–destination pair)
4. Analyst trains a classification model (e.g., logistic regression, random forest, gradient boosting) with `ArrDel15` as the target
5. Analyst evaluates model performance (accuracy, precision, recall, AUC) against the historical-frequency baseline
6. Analyst exports the trained model artifact (e.g., pickle, joblib, ONNX) for potential integration into the web app

## Success outcome

- A reproducible notebook that documents the modeling process and results
- A trained model that outperforms the baseline historical-frequency approach
- Clear comparison metrics between baseline and model predictions

## Notebook organization

- `notebooks/01-exploration.ipynb` — EDA: data quality, distributions, correlations
- `notebooks/02-feature-engineering.ipynb` — Feature creation and selection
- `notebooks/03-modeling.ipynb` — Model training, tuning, and evaluation
- Additional notebooks can be added as needed (e.g., `04-deep-dive-carriers.ipynb`)

## Integration path (future)

- Once a model is validated, it can be served via:
  - A new API route in the web app that loads the model artifact
  - A separate prediction microservice
- The web app UI can offer a toggle: "Historical frequency" vs. "ML prediction"
- Record the integration decision as a new ADR

## Extensions / alternate flows

- A1: Model does not outperform baseline
  - Document findings in the notebook; do not integrate
  - Consider additional features or different modeling approaches

- A2: Dataset is too small for certain slices
  - Use regularization or hierarchical/Bayesian approaches
  - Document limitations clearly in the notebook

- A3: Real-time features desired (e.g., weather)
  - Record as a separate use case; out of scope for this notebook series

## Constraints

- **Label definition**: use `ArrDel15` (≥ 15 minutes), consistent with ADR-0001
- **Cancelled flights**: exclude rows where `Cancelled == 1`, consistent with ADR-0002
- Notebooks must be reproducible (set random seeds, document library versions)

## Notes

- Notebooks are for experimentation and documentation, not production serving.
- Keep notebooks in `notebooks/` directory, separate from the web application source.
