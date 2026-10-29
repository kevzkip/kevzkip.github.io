---
title: Why I dropped MkDocs for raw Markdown
date: 2026-10-16
description: Simpler builds, no config, and a clearer separation between content and tooling.
type: Notes
tags: [tooling, markdown, ci-cd]
featured: true
---

I started my infra-lab docs with MkDocs because it looked like the "right" way to publish Markdown. But the moment I tried to wire it into a GitHub Action, I ran into the same friction every time: another config file to maintain, another dependency to pin, another upgrade that broke my theme.

So I dropped it.

## What changed

Raw Markdown in a `_posts/` folder, a tiny build script, and GitHub Actions. That's the whole stack now.

The build step does one thing: read Markdown, render HTML. No themes, no plugins, no `mkdocs.yml`. If I want to change the output, I change a template — not a framework.

## What I kept

- Markdown as the single source of truth.
- Git as the editor. Every change is a diff, every post is a commit.
- Static HTML as the output. Fast, portable, and it works on any host.

## What I lost

- Search, sidebar navigation, and versioned docs. All of which I wasn't using anyway.

The lesson: pick the tool that matches the size of the problem, not the size of the ecosystem.
