// Yeah, it's basically a template...
function Vec3StorageT(TypedArrayConstructor) {
  'use strict';

  // A constructor for the tempalted storage container
  function Vec3StorageConstructor() {
    // A container for "elements" which each have 3 "members".
    // The primary use case is to store a big array full of x,y,z float triples to be used for webgl

    /** Private local variables **/

    // The size of the storage, counted in number of elements
    var storageCount = Vec3StorageConstructor.SIZE_DEFAULT;

    // The typed storage array itself
    var storage = new Vec3StorageConstructor.TYPED_ARRAY(storageCount * 3);

    // Pointer to the end of the used portion of the storage. Points to one member position past the last stored element
    // Really, this is an index, but that's kind of what pointers are anyway
    var endPtr = 0;

    // Doubles the amount of available storage, copying the existing stored values into the new storage
    function doubleStorage() {
      storageCount *= 2; // The number of elements stored in the container
      var newStorage = new Vec3StorageConstructor.TYPED_ARRAY(storageCount * 3); // The resulting size is the total number of members stored
      newStorage.set(storage); // Does the copy
      storage = newStorage;
    }

    /* The public interface */
    // Roughly the first half of the methods return something other than `this`, and roughly the second half return
    // `this`. The first half tend to be getters, while the second half tend to be setters.
    return {
      // Convenience property, because this is otherwise an anonymous object
      name: 'Vec3Storage',
      // Get a length-3 instance of the underlying typed array. Optionally provide initialization values for it.
      // This is useful for creating temporary storage for the other methods of this class.
      // ([num], [num], [num]) -> TypedArray
      unit: function(val1, val2, val3) {
        if (arguments.length == 3) {
          return new Vec3StorageConstructor.TYPED_ARRAY([val1, val2, val3]);
        }

        return new Vec3StorageConstructor.TYPED_ARRAY(3);
      },
      // Get the size, measured in number of elements, of the storage. Note that this size is 1 / 3 of the total number of members
      // () -> int
      size: function() {
        return endPtr / 3;
      },
      // Get an element at pseudo-index i. The provided index should be between 0 and size(), otherwise behavior is undefined.
      // You have to provide your own 3-member storage as the `out` parameter. (see: the `unit` function) Returns `out`
      // (TypedArray, int) -> TypedArray
      get: function(out, i) {
        i *= 3;
        out[0] = storage[i];
        out[1] = storage[i + 1];
        out[2] = storage[i + 2];
        return out;
      },
      // Remove the last element from the storage, and return it inside `out`. Returns `out`
      // Note: doesn't touch the memory belonging to the last element, just moves the pointer around
      // (TypedArray) -> TypedArray
      pop: function(out) {
        endPtr -= 3; // endPtr points to one position past the last element. Now it points to the last element, which is no longer considered present
        out[0] = storage[endPtr];
        out[1] = storage[endPtr + 1];
        out[2] = storage[endPtr + 2];
        return out;
      },
      // Get a reference to the storage object. You can pass this reference to WebGL functions
      // Note: currently doesn't truncate the storage in any way, so the returned Array will be longer than
      // the number of actual members contained in it.
      // TODO: Add a version of this function which first truncates the storage, and accessor functions which
      // return values needed as arguments to WebGL vertex specification functions
      // () -> TypedArray
      storage: function() {
        return storage;
      },
      // Ensure that this container can store at least `num` elements
      // (Will result in storage for at least num * 3 members being allocated)
      // Don't pass Infinity to this function
      // (int) -> this
      store_at_least: function(num) {
        while (storageCount < num) { doubleStorage(); }
        return this;
      },
      // Wipes the stored data and resets the internal pointer, but doesn't change the available space
      // () -> this
      clear: function() {
        storage.fill(0);
        endPtr = 0;
        return this;
      },
      // Set a value at pseudo-index i in the storage. The index should indicate a member, and be between 0 and size()
      // The set value should be a 3-member element. The available storage isn't checked, so if you add to an index that is
      // greater than size(), it'll just fail silently.
      // (int, TypedArray) -> this
      set: function(i, entry) {
        // Not bounds-checked
        i *= 3;
        storage[i] = entry[0];
        storage[i + 1] = entry[1];
        storage[i + 2] = entry[2];
        endPtr = i >= endPtr ? (i + 3) : endPtr;
        return this;
      },
      // Add one new value to the end of the storage. The value should be a 3-member element.
      // If not enough storage is available for the new value, more storage will be allocated.
      // (TypedArray) -> this
      push: function(entry) {
        if (endPtr >= storage.length) { doubleStorage(); }
        storage[endPtr] = entry[0];
        storage[endPtr + 1] = entry[1];
        storage[endPtr + 2] = entry[2];
        endPtr += 3;
        return this;
      },
      // Append the entire contents of another Vec3Storage instance to this one. This extends the available storage
      // if necessary. Unless I've made a terrible mistake, the other instance shouldn't be mutated.
      // Note: this function doesn't work with a TypedArray.
      // TODO: Add another function which does the same thing but with a TypedArray.
      // (Vec3Storage) -> this
      append: function(other) {
        this.store_at_least(this.size() + other.size());
        var temp = other.unit();
        for (var i = 0, l = other.size(); i < l; ++i) {
          other.get(temp, i);
          storage[endPtr] = temp[0];
          storage[endPtr + 1] = temp[1];
          storage[endPtr + 2] = temp[2];
          endPtr += 3;
        }
        return this;
      },
      // Iterate over each element in the storage, calling predicate for each one.
      // The predicate is passed four values, the x, y, and z values stored for the element,
      // and the pseudo-index of the element. Good for iterations when you don't need to mutate.
      // (function(x, y, z, i)) -> this
      each: function(predicate) {
        // Passes x, y, z, index
        for (var ptr = 0; ptr < endPtr; ptr += 3) {
          predicate(storage[ptr], storage[ptr + 1], storage[ptr + 2], ptr / 3);
        }
        return this;
      },
      // Provide the possibility of mutating the storage using a predicate function invoked on each element.
      // The predicate is passed the storage and a pointer (index) to elements x, y, and z of each element.
      // To mutate, change the values at the provided indices.
      // (function(TypedArray, xi, yi, zi)) -> this
      mutateEach: function(predicate) {
        // Passes the storage and a pointer to each member of the element
        // Mutate the storage to your heart's content, just set storage[ptrA], storage[ptrB], storage[ptrC]
        for (var ptr = 0; ptr < endPtr; ptr += 3) {
          predicate(storage, ptr, ptr + 1, ptr + 2);
        }
        return this;
      }
    };
  }

  Vec3StorageConstructor.TYPED_ARRAY = TypedArrayConstructor; // Stores a reference to the constructor used for creating new storage
  Vec3StorageConstructor.SIZE_DEFAULT = 1024; // Default number of elements to store

  return Vec3StorageConstructor;
}

// Export the template
module.exports.Vec3StorageT = Vec3StorageT;

// Instantiate some useful versions of the template
module.exports.Vec3FStorage = Vec3StorageT(Float32Array); // Floats
module.exports.Vec3DStorage = Vec3StorageT(Float64Array); // Doubles
module.exports.Vec3IStorage = Vec3StorageT(Int32Array); // Ints
module.exports.Vec3UIStorage = Vec3StorageT(Uint32Array); // UInts
