# Vec3Storage

This is kind of a weird one. I wanted to see if I could implement a memory-managed vector-esque dynamic container on top of Javascript's typed arrays. Complete with a "pointer" to unused memory! And it's implemented as a "template" over an arbitrary `TypedArray`...

It's built to have a weird-looking but fast interface, hence everything is a local variable and you have to provide your own `out` storage when calling `get` or `pop`. (See `gl-matrix` for the inspiration here).

It uses a really basic memory-management system that doubles the available storage size whenever it's about to overflow.

(I hope I haven't made an off-by-one error anywhere!)

TODO: accessor functions for the storage to aid compatibility with WebGL functions.
TODO: append-like function that accepts a TypedArray
