---
layout: page
title: AI Art Generation
description: Exploring creative AI techniques for art generation
img: assets/img/projects/nft.avif
importance: 2
category: fun 
---

## Project Overview
With the rise of GANs, humans are able to generate photorealistic images based on existing source material. With these developments, generating art using AI has been on the rise. Even on the NFT market, projects are advertising with AI-generated art ([example](https://opensea.io/collection/-subtraction-)). This project explores how we can advance the generation of art with GANs and other ConvNet based methods, focusing on inciting creativity rather than just photorealism.

## Technical Implementation
I selected source material (abstract art images in the public domain) and trained a GAN (architecture and training method resembled [StyleGAN2-ADA](https://arxiv.org/abs/2006.06676) by Nvidia) to generate new images. To illustrate that we can combine AI methods to aid in every stage of the art creation process, I generated 64x64 images and pushed them through an upscaling ConvNet to produce 256x256 images. These upscaled images are aesthetically significantly more pleasing, meaning that artists can use this technique to augment their creativity.

## Future Vision
- Train a [StyleGAN3](https://arxiv.org/abs/2106.12423) model on portrait paintings
- Create animations through latent space interpolation
- Develop a platform for non-technical users to train GANs on their inspirational image collections
- Establish AI art as a legitimate new form of artistic expression

## Current Limitations
The main limitation is computational resources. Training GANs is computationally intensive, and current GPU prices make it challenging to acquire the necessary hardware for large-scale experimentation.