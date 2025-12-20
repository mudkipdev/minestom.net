# Dialogs

Dialogs are client-side UI popups you can show to a player for acknowledgements, confirmations, quick navigation (links/menus), or small forms (text/boolean/range/options inputs).

Minestom exposes dialogs via `Player#showDialog(DialogLike)`. You can either:

- Send a dialog inline (the full dialog payload is sent in the packet).
- Register dialogs in the dialog registry and show them by key (smaller payloads, reusable, can be referenced by other dialogs).

## Show a simple confirmation dialog

The most common use case is asking the user to confirm a destructive action.

```java
var metadata = new DialogMetadata(
        Component.text("Reset your progress?"),
        null, // externalTitle
        true, // canCloseWithEscape
        true, // pause
        DialogAfterAction.CLOSE,
        List.of(new DialogBody.PlainMessage(
                Component.text("This cannot be undone."),
                200
        )),
        List.of() // inputs
);

var yes = new DialogActionButton(
        Component.text("Reset"),
        Component.text("Deletes your saved data"),
        150,
        new DialogAction.RunCommand("/progress reset")
);
var no = new DialogActionButton(
        Component.text("Cancel"),
        null,
        150,
        null
);

player.showDialog(new Dialog.Confirmation(metadata, yes, no));
```

`run_command` is typically handled by your normal command pipeline (permissions, validation, etc).

## Chain dialogs / build menus

Dialogs can link to other dialogs using a `show_dialog` action. This works best with registry-backed dialogs so you can reference them by key.

```java
var mainMenuKey = MinecraftServer.getDialogRegistry().register(
        "myserver:main_menu",
        new Dialog.Notice(
                new DialogMetadata(
                        Component.text("Main Menu"),
                        null, true, false, DialogAfterAction.CLOSE,
                        List.of(new DialogBody.PlainMessage(Component.text("Pick an action."), 200)),
                        List.of()
                ),
                new DialogActionButton(
                        Component.text("Server Links"),
                        null,
                        150,
                        new DialogAction.ShowDialog(
                                MinecraftServer.getDialogRegistry().register(
                                        "myserver:server_links",
                                        new Dialog.ServerLinks(
                                                new DialogMetadata(
                                                        Component.text("Links"),
                                                        null, true, false, DialogAfterAction.CLOSE,
                                                        List.of(), List.of()
                                                ),
                                                null,
                                                2,
                                                150
                                        )
                                )
                        )
                )
        )
);

player.showDialog(Dialog.forKey(mainMenuKey));
```

:::alert warning
Registry changes are only sent to clients during the configuration phase. If you register dialogs after a player has joined, they will not automatically receive the new registry entries.

Use `Player#startConfigurationPhase()` if you need to resend registry data to an already connected player.
:::

## Inputs (simple forms)

Dialogs can include inputs in their metadata. Inputs are useful for small “one-shot” parameters like a quantity, a name, or a toggle.

Input `key`s must match `[a-zA-Z0-9_]+` and are intended to be referenced by client-side “dynamic” actions.

```java
var metadata = new DialogMetadata(
        Component.text("Create Warp"),
        null, true, true, DialogAfterAction.CLOSE,
        List.of(),
        List.of(
                new DialogInput.Text(
                        "name",
                        200,
                        Component.text("Warp name"),
                        true,
                        "",
                        32,
                        null
                ),
                new DialogInput.Boolean(
                        "public",
                        Component.text("Public"),
                        true,
                        "true",
                        "false"
                )
        )
);

var create = new DialogActionButton(
        Component.text("Create"),
        null,
        150,
        // The client supports dynamic actions that can incorporate input values.
        // Prefer validating server-side regardless of the client action used.
        new DialogAction.DynamicRunCommand("/warp create {name} {public}")
);

player.showDialog(new Dialog.Notice(metadata, create));
```

## Closing dialogs

Dialogs can be closed by the user (depending on `canCloseWithEscape`). You can also force-close the currently open dialog:

```java
player.closeDialog();
```

## When to use registry-backed dialogs

Prefer registering dialogs when you:

- Show the same dialog to many players.
- Want to reference a dialog from another dialog (`show_dialog`).
- Want to keep the packet payload small (send just a key reference).

Inline dialogs are great for one-off UI (e.g. per-player body text) or prototyping.

