---
title: Containerizing my dev environment in infra-lab
date: 2026-10-18
description: From docker build and docker run to a reproducible compose workflow.
type: project
project: infra-lab
tags: [docker, ci-cd, linux]
featured: true
---

The first version of my `infra-lab` had zero containerization. I installed dependencies directly on the host, ran the dev server by hand, and then spent twenty minutes every time I switched machines trying to figure out why the build was failing.

It was the classic "works on my machine" problem, just applied to my own personal projects.

## The "works on my machine" problem

Before Docker, my setup was fragile. I had Python and Node installed globally. If I wanted to test a new version of a package, I risked breaking the host environment. If I accidentally upgraded a system library, my dev server might stop booting entirely.

I realized I wasn't just building a project; I was maintaining a brittle operating system environment just to run the project. That was the moment I decided to containerize the development environment.

## The first attempt: raw Docker

I started simple. I wrote a basic `Dockerfile` that pulled a base image, copied over the requirements, and ran the install command. 

To actually test it, I used the two commands every Docker tutorial starts with:

```bash
docker build -t infra-lab .
docker run -p 8000:8000 infra-lab
```

Two commands, one image, and suddenly the environment was reproducible. It didn't matter what was installed on my host machine; the container had exactly what it needed to run. That alone was a massive improvement.

### The friction with `docker run`

But `docker run` works for a quick check, not a daily workflow. 

Every time I wanted to restart the server, I had to type out the full `docker run` command with all the port mappings. If I wanted to add an environment variable, the command got longer. If I wanted to mount a local volume so I could edit files without rebuilding the image, the command became a mess of flags.

## Leveling up with Docker Compose

I quickly realized I needed a declarative way to manage the container lifecycle. Enter Docker Compose. I created a `compose.yaml` file:

```yaml
services:
  site:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
```

This changed everything. I replaced the raw commands with `docker compose up` and `docker compose down`. 

Because of the volume mount (`.:/app`), the container now re-reads my local files without needing a rebuild. Editing files feels exactly like running a dev server locally, but it's isolated inside the container. 

## What I'd do differently next time

Looking back at the commit history, the migration from raw Docker to Compose was fast, but the initial setup could have been smoother.

- **Start with Compose:** Don't bother with raw `docker run` unless you're just testing a base image. The migration from one to the other is mechanical, but you save a week of typing out flags.
- **Keep the `Dockerfile` minimal:** Every extra layer you add is a future cache invalidation. If a single line of code changes and it forces a full package re-install, your build times will suffer.
- **Don't containerize the CI step:** My GitHub Actions runner already has Node and Python pre-installed. Adding a Docker build to the CI pipeline just to run tests actually slowed things down.

Containerizing the dev environment was the first step in making `infra-lab` actually feel like an engineering project rather than just a folder of scripts.