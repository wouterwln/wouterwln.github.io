---
layout: post
title: Using Machine Learning techniques to create art
excerpt: "Using ML for art"
modified: 10/12/2021, 15:35:15
category: blog
---
With the rise of GANs humans are able to generate photorealistic images based of existing source material. With these developments, generating art using AI has been on the rise. Even on the NFT market I've recently seen projects advertising with the fact that they generate art [ref](https://opensea.io/collection/-subtraction-). With this in mind, I want to explore how we can advance the generation of art with GANs and other ConvNet based methods. Instead of generating photorealistic images, I'd rather investigate how to incite creativity in ConvNet based methods, and how we can implement other AI methods to augment our creativity.

## What I did

I selected source material (abstract art images in the public domain) and trained a GAN (architecture and training method resembled [StyleGAN2-ADA](https://arxiv.org/abs/2006.06676) by Nvidia) to generate new images. To illustrate that we can combine AI methods to aid in every stage of the art creation process, I generated 64x64 images and pushed them through an upscaling ConvNet to produce 256x256 images. These upscaled images are aesthetically significantly more pleasing, meaning that artists can use this technique to augment their creativity.
## What I still want to do

- Fully train a [StyleGAN3](https://arxiv.org/abs/2106.12423) model (new architecture by Nvidia) on portrait paintings to generate photorealistic images of oil paintings.
- Linearly interpolate through the latent space of these models to obtain animations
- Eventually, and this is long term vision, create a platform where people with less coding experience upload a collection of images they find inspiring and train a GAN for them. This would allow more people to get into AI art and hopefully establish it more as a new form of art.

## What's keeping me from doing that

Unfortunately, money. Training a GAN is computationally intensive and with the high GPU prices nowadays I can't afford an industry standard GPU to realize this stuff.