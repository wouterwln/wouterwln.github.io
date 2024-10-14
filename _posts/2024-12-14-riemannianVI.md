---
layout: post
title: Riemannian Black-Box Variational Inference
authors: Mykola Lukashchuk, Wouter W. L. Nuijten, Dmitry Bagaev, İsmail Şenöz, Bert de Vries
excerpt: Mykola Lukashchuk, Wouter W. L. Nuijten, Dmitry Bagaev, İsmail Şenöz, Bert de Vries 
date: 14/12/2024, 16:00:00
modified: 14/12/2024, 16:00:00
tags: [variational inference, exponential family, optimization]
comments: false
category: publication
---

**Authors:  Mykola Lukashchuk, Wouter W. L. Nuijten, Dmitry Bagaev, İsmail Şenöz, Bert de Vries**



**Abstract** 

We introduce Riemannian Black Box Variational Inference for scenarios lacking gradient information of the model with respect to its parameters. Our method constrains posterior marginals to exponential families, optimizing variational free energy using Riemannian geometry and gradients of the log-partition function. It excels with black-box or nondifferentiable models, where popular methods fail. We demonstrate efficacy through the inference of parameters from the SIR model and the tuning of neural network learning rates. The results show competitive performance with gradient-based (NUTS) and gradient-free (Latent Slice Sampling) methods, achieving better coverage and matching Bayesian optimization with fewer evaluations. This extends variational inference to settings where model gradients are unavailable, improving efficiency and flexibility for real-world applications.

**Presented at: [NeurIPS 2024 workshop on Bayesian Decision-making and Uncertainty](https://gp-seminar-series.github.io/neurips-2024/)**

<!-- **[pdf available on ArXiv](https://arxiv.org/abs/2311.12167)** -->