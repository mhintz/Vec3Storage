// Yeah, it's basically a template...
function Vec3StorageT(TypedArrayConstructor) {
  'use strict';

  function Vec3StorageConstructor() {
    // Elements each store 3 members
    var storageCount = Vec3StorageConstructor.SIZE_DEFAULT; // The size of the storage, counted in number of elements
    var storage = new Vec3StorageConstructor.TYPED_ARRAY(storageCount * 3); // The typed storage itself
    var endPtr = 0; // Pointer to the end of the used portion of the storage. Points to one member position past the last stored element

    // Doubles the amount of available storage, copying the existing stored values into the new storage
    function doubleStorage() {
      storageCount *= 2;
      var newStorage = new Vec3StorageConstructor.TYPED_ARRAY(storageCount * 3);
      newStorage.set(storage);
      storage = newStorage;
    }

    return {
      name: 'Vec3Storage',
      unit: function(val1, val2, val3) {
        var retUnit = new Vec3StorageConstructor.TYPED_ARRAY(3);
        if (arguments.length == 3) {
          retUnit[0] = val1;
          retUnit[1] = val2;
          retUnit[2] = val3;
        }
        return retUnit;
      },
      size: function() {
        return endPtr / 3;
      },
      get: function(out, i) {
        i *= 3;
        out[0] = storage[i];
        out[1] = storage[i + 1];
        out[2] = storage[i + 2];
        return out;
      },
      pop: function(out) {
        endPtr -= 3; // endPtr points to one position past the last element. Now it points to the last element, which is no longer considered present
        out[0] = storage[endPtr];
        out[1] = storage[endPtr + 1];
        out[2] = storage[endPtr + 2];
        return out;
      },
      store_at_least: function(num) {
        while (storageCount < num) { doubleStorage(); }
        return this;
      },
      clear: function() {
        storage.fill(0);
        endPtr = 0;
        return this;
      },
      set: function(i, entry) {
        // Not bounds-checked
        i *= 3;
        storage[i] = entry[0];
        storage[i + 1] = entry[1];
        storage[i + 2] = entry[2];
        endPtr = i >= endPtr ? (i + 3) : endPtr;
        return this;
      },
      push: function(entry) {
        if (endPtr >= storage.length) { doubleStorage(); }
        storage[endPtr] = entry[0];
        storage[endPtr + 1] = entry[1];
        storage[endPtr + 2] = entry[2];
        endPtr += 3;
        return this;
      },
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
      each: function(predicate) {
        for (var ptr = 0; ptr < endPtr; ptr += 3) {
          // Passes x, y, z, index
          predicate(storage[ptr], storage[ptr + 1], storage[ptr + 2], ptr / 3);
        }
        return this;
      },
      mutateEach: function(predicate) {
        // Passes the storage and a pointer to each member of the element
        // Mutate the storage to your heart's content, just set storage[ptrA], storage[ptrB], storage[ptrC] 
        for (var ptr = 0; ptr < endPtr; ptr += 3) {
          predicate(storage, ptr, ptr + 1, ptr + 2);
        }
      }
    };
  }

  Vec3StorageConstructor.TYPED_ARRAY = TypedArrayConstructor; // Stores a reference to the constructor it should use for creating storage
  Vec3StorageConstructor.SIZE_DEFAULT = 1024; // Default number of elements to store

  return Vec3StorageConstructor;
}

module.exports.Vec3StorageT = Vec3StorageT;
module.exports.Vec3FStorage = Vec3StorageT(Float32Array); // Floats
module.exports.Vec3DStorage = Vec3StorageT(Float64Array); // Doubles
module.exports.Vec3IStorage = Vec3StorageT(Int32Array); // Ints
module.exports.Vec3UIStorage = Vec3StorageT(Uint32Array); // UInts
