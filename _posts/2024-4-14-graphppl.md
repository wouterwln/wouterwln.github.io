---
layout: post
title: RxInfer.jl 3.0 powered by GraphPPL
excerpt: "Nested Model specification with next-gen PPL" 
modified: 14/4/2024, 13:17:56
category: blog
---


## What is GraphPPL.jl?
`GraphPPL.jl` is a next-gen PPL that allows a general, high-level, all purpose Domain Specific Language (DSL) for probabilistic programming. It is designed to be a backend-agnostic and user-friendly PPL that can be used to specify a wide range of probabilistic models. The engine transforms a series of mathematical statements such as `x ~ Normal(0, 1)` into a factor graph containing the necessary information to perform inference. Next to this engine, `GraphPPL.jl` contains an implementation of a nested model specification, allowing users to specify models in a hierarchical manner. This allows for a more modular and reusable way of specifying models, and is especially useful for specifying models with a hierarchical structure.
## RxInfer.jl 3.0
`RxInfer.jl` is a Julia package containing an inference engine for factor graphs. With the release of `GraphPPL.jl`, we have decided to integrate the nested model specification of `GraphPPL.jl` into `RxInfer.jl`. This renews the user-interface of `RxInfer.jl` and allows for a more modular and reusable way of specifying models. The renewed `RxInfer.jl` is now powered by `GraphPPL.jl` and mdoel specification is therefore more concise and powerful. 
 