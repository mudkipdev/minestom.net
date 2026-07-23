---
title: When should I use Minestom?
description: The kinds of projects Minestom suits, and the ones it does not.
---

# When should I use Minestom?

Minecraft has grown a lot since its release, and many servers now ignore most of the built-in mechanics in favor of their own gameplay. Those servers still pay for the vanilla features they never use, and often spend more effort working around them than building anything new.

Minestom starts from the other end. You begin with an empty server and add only what your project needs. It makes sense to use Minestom when implementing the features you want takes less work than removing the ones you do not.

## Good fits

- **Performance is a priority.** There is no vanilla overhead to work around, and chunks are ticked across a thread pool rather than a single main thread.
- **Your gameplay is custom.** Minigames, lobbies, KitPVP, and anything else that shares little with survival.
- **You need many worlds at once.** Instances are cheap to create and discard at runtime, which suits per-match maps far better than loading worlds from disk.

## Poor fits

- **You want a vanilla server.** Minestom implements almost none of it, so you would be rebuilding survival from scratch.
- **You rely on existing plugins.** Nothing written for Bukkit, Spigot, Paper, Forge, or Fabric will run.
- **You want to run a server, not write one.** Minestom is aimed at developers, and reaching something playable takes real development time.
