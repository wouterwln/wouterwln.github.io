---
layout: post
title: Reactive Environments for Active Inference Agents with RxEnvironments.jl
authors: Wouter W. L. Nuijten, Bert de Vries
excerpt: Wouter W. L. Nuijten, Bert de Vries
modified: 11/09/2024, 13:20:00
tags: [markov blankets, rxenvironments, active inference]
comments: false
category: publication
---

**Authors:  Wouter W. L. Nuijten, Bert de Vries**

**Abstract** 

Active Inference is a framework that emphasizes the interaction between agents and their environment. While the framework has seen significant advancements in the development of agents, the environmental models are often borrowed from reinforcement learning problems, which may not fully capture the complexity of multi-agent interactions or allow complex, conditional communication. This paper introduces Reactive Environments, a comprehensive paradigm that facilitates complex multi-agent communication. In this paradigm, both agents and environments are defined as entities encapsulated by boundaries with interfaces. This setup facilitates a robust framework for communication in nonequilibrium-Steady-State systems, allowing for complex interactions and information exchange. We present a Julia package RxEnvironments.jl, which is a specific implementation of Reactive Environments, where we utilize a Reactive Programming style for efficient implementation. The flexibility of this paradigm is demonstrated through its application to several complex, multi-agent environments. These case studies highlight the potential of Reactive Environments in modeling sophisticated systems of interacting agents.

**Published at: [IWAI (International Workshop on Active Inference) 2024](https://iwaiworkshop.github.io/)**

<!-- **[pdf available on ArXiv](https://arxiv.org/abs/2311.12167)** -->