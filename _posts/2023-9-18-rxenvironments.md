---
layout: post
title: RxEnvironments.jl, a Julia package for managing control environments
excerpt: "RxEnvironments"
modified: 18/9/2023, 15:35:17
category: blog
---


## What is RxEnvironments.jl?
`RxEnvironments.jl` is a Julia package containing all boilerplate code to create reactive environments for control. The package is designed with Active Inference in mind, and therefore models all interaction between agents and environments as communication through a Markov Blanket. Since this communication abstracts away from the actual implementation of agents and environments and instead only focusses on Markov Blankets, we support multi-agent environments out of the box. I feel the reactive programming paradigm together with the multi-agent possibilities really give `RxEnvironments` an edge over OpenAI Gym, although Gym is obviously better fleshed out.
## What I still want to do
I'm maintaining a set of desired features on the [RxEnvironments Github](https://www.github.com/biaslab/rxenvironments.jl/issues), feel free to add any missing features as issues, or open a pull request with useful features.
 