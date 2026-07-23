---
title: Your first server
description: Write, run, and package your first Minestom server.
---

# Your first server

A Minestom server needs four things before a player can join:

1. Initialize the server with `MinecraftServer.init()`.
2. Create an instance, which is the world players will spawn into.
3. Listen for `AsyncPlayerConfigurationEvent` and set that instance as the spawning instance.
4. Start the server on an address and port.

Step three is the one people miss. Without a spawning instance there is nowhere to put the player, so the server starts but connections fail.

::: code-group

```java [Java]
import net.minestom.server.MinecraftServer;
import net.minestom.server.entity.Player;
import net.minestom.server.event.GlobalEventHandler;
import net.minestom.server.event.player.AsyncPlayerConfigurationEvent;
import net.minestom.server.instance.*;
import net.minestom.server.instance.block.Block;
import net.minestom.server.coordinate.Pos;

void main() {
    MinecraftServer server = MinecraftServer.init();

    // Create the instance and give it a flat grass world
    InstanceManager instanceManager = MinecraftServer.getInstanceManager();
    InstanceContainer instanceContainer = instanceManager.createInstanceContainer();
    instanceContainer.setGenerator(unit -> unit.modifier().fillHeight(0, 40, Block.GRASS_BLOCK));

    // Decide where players spawn
    MinecraftServer.getGlobalEventHandler().addListener(AsyncPlayerConfigurationEvent.class, event -> {
        Player player = event.getPlayer();
        event.setSpawningInstance(instanceContainer);
        player.setRespawnPoint(new Pos(0, 42, 0));
    });

    server.start("0.0.0.0", 25565);
}
```

```kotlin [Kotlin]
import net.minestom.server.MinecraftServer
import net.minestom.server.instance.block.Block
import net.minestom.server.coordinate.Pos
import net.minestom.server.event.player.AsyncPlayerConfigurationEvent

fun main() {
    val server = MinecraftServer.init()

    // Create the instance and give it a flat grass world
    val instanceManager = MinecraftServer.getInstanceManager()
    val instanceContainer = instanceManager.createInstanceContainer()
    instanceContainer.setGenerator { unit ->
        unit.modifier().fillHeight(0, 40, Block.GRASS_BLOCK)
    }

    // Decide where players spawn
    MinecraftServer.getGlobalEventHandler().addListener(AsyncPlayerConfigurationEvent::class.java) { event ->
        event.spawningInstance = instanceContainer
        event.player.respawnPoint = Pos(0.0, 42.0, 0.0)
    }

    server.start("0.0.0.0", 25565)
}
```

:::

Run that and you can connect on `localhost`. For more on the two pieces it relies on, see [Instances](/docs/world/instances) and [Events](/docs/feature/events).

## Building the server JAR (Gradle)

Your server needs Minestom at runtime, so it has to be packaged together with its dependencies into a single JAR. The [Shadow](https://gradleup.com/shadow/) plugin does this, and its `shadowJar` task writes the result to `build/libs`.

Shadow reads the entry point from the `application` plugin, so setting `mainClass` there is all it needs. That plugin also gives you `gradle run`, which starts the server straight from source without building a JAR first.

::: code-group

```kts [Gradle (Kotlin)]
plugins {
    application
    id("com.gradleup.shadow") version "9.6.1"
}

group = "org.example"

repositories {
    mavenCentral()
}

dependencies {
    implementation("net.minestom:minestom:<version>")
}

java.toolchain.languageVersion = JavaLanguageVersion.of(25)
application.mainClass = "org.example.Main" // Change this to your main class

tasks {
    build {
        dependsOn(shadowJar)
    }

    shadowJar {
        mergeServiceFiles()
        archiveClassifier = "" // Prevent the -all suffix on the shadowJar file
    }
}
```

```groovy [Gradle (Groovy)]
plugins {
    id 'application'
    id 'com.gradleup.shadow' version '9.6.1'
}

group 'org.example'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'net.minestom:minestom:<version>'
}

java.toolchain.languageVersion = JavaLanguageVersion.of(25)
application.mainClass = 'org.example.Main' // Change this to your main class

tasks {
    build {
        dependsOn shadowJar
    }

    shadowJar {
        mergeServiceFiles()
        archiveClassifier = '' // Prevent the -all suffix on the shadowJar file
    }
}
```

:::

## Building the server JAR (Maven)

Maven does the same job with the [Assembly](https://maven.apache.org/plugins/maven-assembly-plugin/) plugin and its `jar-with-dependencies` descriptor. Running `mvn clean package` writes the JAR to `target`.

```xml
<project>
    <groupId>org.example</groupId>
    <artifactId>Main</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>25</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.minestom</groupId>
            <artifactId>minestom</artifactId>
            <version>version</version> <!-- Change this to the Minestom version you are using -->
        </dependency>
    </dependencies>

    <build>
        <defaultGoal>clean package</defaultGoal>
        <resources>
            <resource>
                <directory>${project.basedir}/src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal> <!-- Prevent dependencies from shading multiple times -->
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>org.example.Main</mainClass> <!-- Change this to your main class -->
                        </manifest>
                    </archive>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                    <appendAssemblyId>false</appendAssemblyId>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```