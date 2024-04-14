---
layout: post
title: Node Classification in Random Trees
authors: Wouter W. L. Nuijten, Vlado Menkovski
excerpt: Wouter W. L. Nuijten, Vlado Menkovski
modified: 14/04/2024, 13:17:56
tags: [graph neural networks, node classification, markov networks]
comments: false
category: publication
---

**Authors: Wouter W. L. Nuijten, Vlado Menkovski**

**Abstract** 

We propose a method for the classification of objects that are structured as random trees. Our aim is to model a distribution over the node label assignments in settings where the tree data structure is associated with node attributes (typically high dimensional embeddings). The tree topology is not predetermined and none of the label assignments are present during inference. Other methods that produce a distribution over node label assignment in trees (or more generally in graphs) either assume conditional independence of the label assignment, operate on a fixed graph topology, or require part of the node labels to be observed. Our method defines a Markov Network with the corresponding topology of the random tree and an associated Gibbs distribution. We parameterize the Gibbs distribution with a Graph Neural Network that operates on the random tree and the node embeddings. This allows us to estimate the likelihood of node assignments for a given random tree and use MCMC to sample from the distribution of node assignments.
We evaluate our method on the tasks of node classification in trees on the Stanford Sentiment Treebank dataset. Our method outperforms the baselines on this dataset, demonstrating its effectiveness for modeling joint distributions of node labels in random trees.

**[pdf available on ArXiv](https://arxiv.org/abs/2311.12167)**