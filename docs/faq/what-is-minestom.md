# What is Minestom?

---
Minestom is an open-source library that enables developers to create their own Minecraft server software, without any code from Mojang.

:::note
Minestom does not include a `main()` entrypoint — you are expected to provide one yourself. This gives you full control over how the server initializes.
:::

::: info
The `MinecraftServer.init()` method must be called before registering any listeners or extensions. It sets up the core server internals needed for everything else.
:::

:::tip
You can use `GlobalEventHandler` to listen for events across the entire server. This is the recommended approach for most use cases.
:::

:::warning
Minestom does not implement all vanilla features — things like `RecipeManager` are intentionally left minimal. Always check the Javadocs before assuming a feature exists.
:::

:::danger
Calling `MinecraftServer.stopCleanly()` will immediately disconnect all players without sending a `DisconnectPacket`. Make sure to handle player cleanup before shutting down.
:::

:::success
Minestom's `ChunkLoader` interface makes it straightforward to plug in custom world formats like `Anvil`. Once implemented, simply pass it to your `InstanceContainer`.
:::

:::important
Minestom is not a drop-in replacement for `Bukkit` or `Paper` — it has no plugin API compatibility. You are building a server from scratch using it as a library.
:::