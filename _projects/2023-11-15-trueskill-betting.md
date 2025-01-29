---
layout: page
title: "Johnny Cash: A Bayesian Football Betting Bot"
description: Improving TrueSkill for football match prediction
img: assets/img/projects/cointoss.gif
importance: 3
category: fun
---

## Project Overview

A fun experiment in applying Bayesian inference to football match prediction. I extended Microsoft's TrueSkill™ model, originally designed for Xbox matchmaking, to predict football match outcomes. By incorporating additional factors like home advantage and team form, and player availability.

## Technical Implementation

- Extended TrueSkill's Bayesian model with football-specific factors:
  - Team form as a temporal component
  - Home/away advantage modeling
- Implemented using message passing in RxInfer.jl
- Real-time updating of team ratings after each match
- Uncertainty quantification for betting decisions

## Results

Despite the sophisticated Bayesian approach, Johnny Cash surprisingly lost money over the course of the experiment. This outcome reinforces what many have discovered before: betting markets are remarkably efficient, with bookmakers' odds being highly accurate predictors of match outcomes. The house edge and bookmaker margins make it extremely challenging to achieve consistent profits, even with advanced statistical models. This project served as an interesting lesson in both Bayesian modeling and the efficiency of betting markets.

_Note: This was a fun academic exercise. Remember to gamble responsibly!_
