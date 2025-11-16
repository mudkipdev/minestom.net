# Network Buffers
A network buffer is a byte buffer with methods available to conveniently serialize common types. Unlike codecs which work with multiple formats, network buffers are designed for efficient sequential reading and writing of binary data.

```java
NetworkBuffer buffer = NetworkBuffer.resizableBuffer();

// Writing
buffer.write(NetworkBuffer.STRING, "Hello");
buffer.write(NetworkBuffer.VAR_INT, 42);
buffer.write(NetworkBuffer.UUID, playerId);

// Reading
String message = buffer.read(NetworkBuffer.STRING);
int value = buffer.read(NetworkBuffer.VAR_INT);
UUID id = buffer.read(NetworkBuffer.UUID);
```

## Built-in Types
### Primitives
| Type | Java Type | Size | Description |
|------|-----------|------|-------------|
| `BOOLEAN` | `Boolean` | 1 byte | Boolean value |
| `BYTE` | `Byte` | 1 byte | Signed 8-bit integer |
| `SHORT` | `Short` | 2 bytes | Signed 16-bit integer |
| `INT` | `Integer` | 4 bytes | Signed 32-bit integer |
| `LONG` | `Long` | 8 bytes | Signed 64-bit integer |
| `FLOAT` | `Float` | 4 bytes | 32-bit floating point |
| `DOUBLE` | `Double` | 8 bytes | 64-bit floating point |
| `VAR_INT` | `Integer` | 1-5 bytes | Variable-length integer |
| `VAR_LONG` | `Long` | 1-10 bytes | Variable-length long |

Variable-length integers are more space-efficient for small values. Values 0-127 use only 1 byte, while larger values use more bytes as needed.

### Strings and Text
| Type | Java Type | Description |
|------|-----------|-------------|
| `STRING` | `String` | UTF-8 string with VAR_INT length prefix |
| `KEY` | `Key` | Namespaced key (e.g., `minecraft:stone`) |
| `COMPONENT` | `Component` | Adventure text component |
| `NBT` | `BinaryTag` | NBT tag |
| `NBT_COMPOUND` | `CompoundBinaryTag` | NBT compound tag |

### Positions and Vectors
| Type | Java Type | Description |
|------|-----------|-------------|
| `BLOCK_POSITION` | `Point` | Block coordinates encoded as long |
| `POS` | `Pos` | Position with rotation |
| `VECTOR3` | `Point` | Float x, y, z |
| `VECTOR3D` | `Point` | Double x, y, z |

### Arrays and Collections
| Type | Java Type | Description |
|------|-----------|-------------|
| `BYTE_ARRAY` | `byte[]` | Byte array with a length prefix |
| `LONG_ARRAY` | `long[]` | Long array with a length prefix |
| `VAR_INT_ARRAY` | `int[]` | Integer array with VAR_INT elements |
| `VAR_LONG_ARRAY` | `long[]` | Long array with VAR_LONG elements |
| `RAW_BYTES` | `byte[]` | Byte array without a length prefix |

### Other Types
| Type | Java Type | Description |
|------|-----------|-------------|
| `UUID` | `UUID` | UUID stored as two longs |
| `BITSET` | `BitSet` | Java BitSet |
| `INSTANT_MS` | `Instant` | Instant as milliseconds since epoch |

## Transforming Types
Use `.transform()` to convert between a network type and your custom type.

```java
NetworkBuffer.Type<PotionType> POTION_TYPE =
    NetworkBuffer.VAR_INT.transform(
        PotionType::fromId,
        PotionType::id
    );

buffer.write(POTION_TYPE, potionType);
PotionType type = buffer.read(POTION_TYPE);
```

## Enums
Enums can be serialized by ordinal using `NetworkBuffer.Enum()`.

```java
NetworkBuffer.Type<Direction> DIRECTION = NetworkBuffer.Enum(Direction.class);

buffer.write(DIRECTION, Direction.NORTH);
Direction dir = buffer.read(DIRECTION);
```

For EnumSets, use `NetworkBuffer.EnumSet()`:

```java
NetworkBuffer.Type<EnumSet<Feature>> FEATURES = NetworkBuffer.EnumSet(Feature.class);
```

## Optional Types
Any type can be made optional with `.optional()`. Optional values are prefixed with a boolean indicating presence.

```java
NetworkBuffer.Type<@Nullable Component> OPT_COMPONENT =
    NetworkBuffer.COMPONENT.optional();

buffer.write(OPT_COMPONENT, null);
buffer.write(OPT_COMPONENT, someComponent);

Component component = buffer.read(OPT_COMPONENT);
```

## Collections
Use `.list()` to create a list type, or `.map()` for maps with string keys. Both require a maximum size parameter.

```java
NetworkBuffer.Type<List<String>> STRING_LIST =
    NetworkBuffer.STRING.list(Short.MAX_VALUE);

buffer.write(STRING_LIST, List.of("a", "b", "c"));
List<String> strings = buffer.read(STRING_LIST);

NetworkBuffer.Type<Map<String, Integer>> STRING_INT_MAP =
    NetworkBuffer.INT.map(Short.MAX_VALUE);

buffer.write(STRING_INT_MAP, Map.of("health", 20, "armor", 5));
```

## Templates
Templates provide a concise way to define serialization for records, supporting up to 20 fields. The template pattern alternates between the type and the getter method reference, ending with the constructor.

```java
record Particle(Point position, int id, float scale) {
    static final NetworkBuffer.Type<Particle> NETWORK_TYPE =
        NetworkBufferTemplate.template(
            NetworkBuffer.BLOCK_POSITION, Particle::position,
            NetworkBuffer.VAR_INT, Particle::id,
            NetworkBuffer.FLOAT, Particle::scale,
            Particle::new
        );
}

buffer.write(Particle.NETWORK_TYPE, particle);
Particle particle = buffer.read(Particle.NETWORK_TYPE);
```

Templates work well with optional fields and nested lists:

```java
record PlayerInfo(
    UUID uuid,
    String name,
    List<Property> properties,
    @Nullable Component displayName,
    int ping
) {
    static final NetworkBuffer.Type<PlayerInfo> NETWORK_TYPE =
        NetworkBufferTemplate.template(
            NetworkBuffer.UUID, PlayerInfo::uuid,
            NetworkBuffer.STRING, PlayerInfo::name,
            Property.NETWORK_TYPE.list(16), PlayerInfo::properties,
            NetworkBuffer.COMPONENT.optional(), PlayerInfo::displayName,
            NetworkBuffer.VAR_INT, PlayerInfo::ping,
            PlayerInfo::new
        );
}
```

## Buffer Management
NetworkBuffer tracks separate read and write positions. You can query these positions, move them, or check how many bytes are available.

```java
long writePos = buffer.writeIndex();
long readPos = buffer.readIndex();
buffer.writeIndex(100);
buffer.readIndex(50);

buffer.advanceWrite(10);
buffer.advanceRead(5);

long readable = buffer.readableBytes();
long writable = buffer.writableBytes();

buffer.clear();
```

## Read/Write at Position
You can read or write at a specific position without changing the current read/write indices.

```java
buffer.writeAt(100, NetworkBuffer.INT, 42);
int value = buffer.readAt(100, NetworkBuffer.INT);
```

## Extract Bytes
Extract a portion of the buffer as a byte array by writing to a temporary buffer.

```java
byte[] bytes = buffer.extractBytes(buf -> {
    buf.write(NetworkBuffer.VAR_INT, 42);
    buf.write(NetworkBuffer.STRING, "test");
});
```

## Fixed-Size Types
Use `FixedRawBytes()` for byte arrays without a length prefix, or `FixedBitSet()` for bitsets of a specific size.

```java
NetworkBuffer.Type<byte[]> BYTES_16 = NetworkBuffer.FixedRawBytes(16);
NetworkBuffer.Type<BitSet> BITSET_64 = NetworkBuffer.FixedBitSet(64);
```

## Either Types
Either types allow serializing one of two possible types, tagged with a boolean to indicate which variant is present.

```java
NetworkBuffer.Type<Either<String, Integer>> STRING_OR_INT = NetworkBuffer.Either(NetworkBuffer.STRING, NetworkBuffer.INT);
buffer.write(STRING_OR_INT, Either.left("hello"));
buffer.write(STRING_OR_INT, Either.right(67));
```

## Custom Packet Example
Here's how to create a custom packet using a template:

```java
record ParticlePacket(
    int particleId,
    Point position,
    Vec velocity,
    List<Integer> data
) implements ServerPacket {
    private static final NetworkBuffer.Type<ParticlePacket> SERIALIZER =
        NetworkBufferTemplate.template(
            NetworkBuffer.VAR_INT, ParticlePacket::particleId,
            NetworkBuffer.VECTOR3D, ParticlePacket::position,
            NetworkBuffer.VECTOR3, ParticlePacket::velocity,
            NetworkBuffer.VAR_INT.list(16), ParticlePacket::data,
            ParticlePacket::new
        );

    @Override
    public void write(NetworkBuffer writer) {
        writer.write(SERIALIZER, this);
    }
}
```

## Version-Specific Serialization
You can create different serializers based on the protocol version to handle changes between Minecraft versions.

```java
record VersionedData(String name, int value, @Nullable String extra) {
    static NetworkBuffer.Type<VersionedData> networkType(int protocolVersion) {
        if (protocolVersion >= 759) {
            return NetworkBufferTemplate.template(
                NetworkBuffer.STRING, VersionedData::name,
                NetworkBuffer.VAR_INT, VersionedData::value,
                NetworkBuffer.STRING.optional(), VersionedData::extra,
                VersionedData::new
            );
        } else {
            return NetworkBufferTemplate.template(
                NetworkBuffer.STRING, VersionedData::name,
                NetworkBuffer.VAR_INT, VersionedData::value,
                (name, value) -> new VersionedData(name, value, null)
            );
        }
    }
}
```
