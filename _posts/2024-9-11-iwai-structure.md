---
layout: post
title: Online Structure Learning with Dirichlet Processes through Message Passing
authors: Bart van Erp, Wouter W. L. Nuijten, Bert de Vries
excerpt: Bart van Erp, Wouter W. L. Nuijten, Bert de Vries
modified: 10/09/2024, 16:00:00
tags: [structure learning, dirichlet processes, message passing]
comments: false
category: publication
---

**Authors:  Wouter W. L. Nuijten, Vlado Menkovski**



**Abstract** 

Generative or probabilistic modeling is crucial for developing intelligent agents that can reason about their environment. However, designing these models manually for complex tasks is often infeasible. Structure learning addresses this challenge by automating model creation based on sensory observations, balancing accuracy with complexity. Central to structure learning is Bayesian model comparison, which provides a principled framework for evaluating models based on their evidence. This paper focuses on model expansion and introduces an online message passing procedure using Dirichlet processes, a prominent prior in non-parametric Bayesian methods. Our approach builds on previous work by automating Bayesian model comparison using message passing based on variational free energy minimization. We derive novel message passing update rules to emulate Dirichlet processes, offering a flexible and scalable method for online structure learning. Our method generalizes to arbitrary models and treats structure learning identically to state estimation and parameter learning. The experimental results validate the effectiveness of our approach on an infinite mixture model.

**Published at: [IWAI (International Workshop on Active Inference) 2024](https://iwaiworkshop.github.io/)**

<!-- **[pdf available on ArXiv](https://arxiv.org/abs/2311.12167)** -->