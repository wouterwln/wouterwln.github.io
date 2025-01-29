---
layout: page
title: RxEnvironments.jl
description: A Julia package for designing Active Inference environments
img: assets/img/projects/rxenvs.png
importance: 2
category: work
github: https://github.com/reactivebayes/rxenvironments.jl
related_publications: true
---

## Project Overview

`RxEnvironments.jl` is a Julia package containing all boilerplate code to create reactive environments for control. The package is designed with Active Inference in mind, and therefore models all interaction between agents and environments as communication through a Markov Blanket. Since this communication abstracts away from the actual implementation of agents and environments and instead only focuses on Markov Blankets, we support multi-agent environments out of the box.

## Key Features

- Reactive programming paradigm for environment design
- Built-in support for multi-agent environments
- Markov Blanket-based communication model
- Active Inference-oriented design
- Alternative to OpenAI Gym with unique features

## Advantages Over OpenAI Gym

While OpenAI Gym is more established, RxEnvironments offers several unique advantages:

- Native support for multi-agent scenarios
- Reactive programming paradigm for more flexible control
- Built specifically for Active Inference applications
- Clean abstraction through Markov Blankets

## Future Development

The project is actively maintained with new features being added regularly. Feature requests and contributions are managed through the [GitHub issues page](https://github.com/biaslab/rxenvironments.jl/issues). Users are encouraged to:

- Submit feature requests
- Report bugs
- Contribute through pull requests
- Suggest improvements
