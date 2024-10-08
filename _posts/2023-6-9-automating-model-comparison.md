---
layout: post
title: Automating Model Comparison in Factor Graphs
authors: Bart van Erp, Wouter W.L. Nuijten, Thijs van de Laar, Bert de Vries
excerpt: Bart van Erp, Wouter W.L. Nuijten, Thijs van de Laar, Bert de Vries
modified: 09/06/2023, 15:01:24
tags: [bayesian inference, model comparison, factor graphs]
comments: false
category: publication
---

**Authors:  Bart van Erp, Wouter W.L. Nuijten, Thijs van de Laar, Bert de Vries**

**Abstract** 

Bayesian state and parameter estimation have been automated effectively in the literature, however, this has not yet been the case for model comparison, which therefore still requires error-prone and time-consuming manual derivations. As a result, model comparison is often overlooked and ignored, despite its importance. This paper efficiently automates Bayesian model averaging, selection, and combination by message passing on a Forney-style factor graph with a custom mixture node. Parameter and state inference, and model comparison can then be executed simultaneously using message passing with scale factors. This approach shortens the model design cycle and allows for the straightforward extension to hierarchical and temporal model priors to accommodate for modeling complicated time-varying processes.

**Published in: [MDPI Entropy Special Issue on Probabilistic Models in Machine and Human Learning](https://www.mdpi.com/journal/entropy/special_issues/probabilistic_machine_learning)**

**[Available on arXiv](https://arxiv.org/abs/2306.05965)**