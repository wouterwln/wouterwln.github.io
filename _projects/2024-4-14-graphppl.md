---
layout: distill
title: GraphPPL.jl
description: The probabilistic programming language powering RxInfer.jl
img: assets/img/projects/rxinfer.svg
importance: 1
category: work
related_publications: true
github: https://github.com/reactivebayes/GraphPPL.jl
bibliography: 2024-4-14-graphppl.bib
---

## What is GraphPPL.jl?

I designed and built `GraphPPL.jl` <d-cite key="nuijten_graphppljl_2024"></d-cite>, a general, high-level Domain Specific Language (DSL) for probabilistic programming. It is a backend-agnostic and user-friendly PPL that can be used to specify a wide range of probabilistic models. The engine transforms a series of mathematical statements such as `x ~ Normal(0, 1)` into a factor graph containing the necessary information to perform inference. On top of this engine, `GraphPPL.jl` implements nested model specification: users can compose models hierarchically, treating any submodel as a building block inside a larger model. This makes model specification modular and reusable, which is especially powerful for models with hierarchical structure.

## Powering RxInfer.jl

`RxInfer.jl` <d-cite key="bagaev2023rxinfer"></d-cite> is a Julia package containing a reactive message passing inference engine for factor graphs. Since the 3.0 release, `GraphPPL.jl` is the model specification frontend of `RxInfer.jl`: every model written by an RxInfer user passes through the engine I built. The nested model specification carries over directly, making model specification in `RxInfer.jl` concise, modular, and reusable.
