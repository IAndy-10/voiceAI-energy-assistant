var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/events/events.js
var require_events = __commonJS({
  "node_modules/events/events.js"(exports, module) {
    "use strict";
    var R2 = typeof Reflect === "object" ? Reflect : null;
    var ReflectApply = R2 && typeof R2.apply === "function" ? R2.apply : function ReflectApply2(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };
    var ReflectOwnKeys;
    if (R2 && typeof R2.ownKeys === "function") {
      ReflectOwnKeys = R2.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target);
      };
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning);
    }
    var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
      return value !== value;
    };
    function EventEmitter() {
      EventEmitter.init.call(this);
    }
    module.exports = EventEmitter;
    module.exports.once = once;
    EventEmitter.EventEmitter = EventEmitter;
    EventEmitter.prototype._events = void 0;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = void 0;
    var defaultMaxListeners = 10;
    function checkListener(listener) {
      if (typeof listener !== "function") {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }
    Object.defineProperty(EventEmitter, "defaultMaxListeners", {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
        }
        defaultMaxListeners = arg;
      }
    });
    EventEmitter.init = function() {
      if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      }
      this._maxListeners = this._maxListeners || void 0;
    };
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n2) {
      if (typeof n2 !== "number" || n2 < 0 || NumberIsNaN(n2)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n2 + ".");
      }
      this._maxListeners = n2;
      return this;
    };
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }
    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };
    EventEmitter.prototype.emit = function emit(type) {
      var args = [];
      for (var i2 = 1; i2 < arguments.length; i2++) args.push(arguments[i2]);
      var doError = type === "error";
      var events = this._events;
      if (events !== void 0)
        doError = doError && events.error === void 0;
      else if (!doError)
        return false;
      if (doError) {
        var er2;
        if (args.length > 0)
          er2 = args[0];
        if (er2 instanceof Error) {
          throw er2;
        }
        var err = new Error("Unhandled error." + (er2 ? " (" + er2.message + ")" : ""));
        err.context = er2;
        throw err;
      }
      var handler = events[type];
      if (handler === void 0)
        return false;
      if (typeof handler === "function") {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i2 = 0; i2 < len; ++i2)
          ReflectApply(listeners[i2], this, args);
      }
      return true;
    };
    function _addListener(target, type, listener, prepend) {
      var m2;
      var events;
      var existing;
      checkListener(listener);
      events = target._events;
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null);
        target._eventsCount = 0;
      } else {
        if (events.newListener !== void 0) {
          target.emit(
            "newListener",
            type,
            listener.listener ? listener.listener : listener
          );
          events = target._events;
        }
        existing = events[type];
      }
      if (existing === void 0) {
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === "function") {
          existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
        m2 = _getMaxListeners(target);
        if (m2 > 0 && existing.length > m2 && !existing.warned) {
          existing.warned = true;
          var w2 = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          w2.name = "MaxListenersExceededWarning";
          w2.emitter = target;
          w2.type = type;
          w2.count = existing.length;
          ProcessEmitWarning(w2);
        }
      }
      return target;
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }
    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: void 0, target, type, listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }
    EventEmitter.prototype.once = function once2(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i2, originalListener;
      checkListener(listener);
      events = this._events;
      if (events === void 0)
        return this;
      list = events[type];
      if (list === void 0)
        return this;
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit("removeListener", type, list.listener || listener);
        }
      } else if (typeof list !== "function") {
        position = -1;
        for (i2 = list.length - 1; i2 >= 0; i2--) {
          if (list[i2] === listener || list[i2].listener === listener) {
            originalListener = list[i2].listener;
            position = i2;
            break;
          }
        }
        if (position < 0)
          return this;
        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }
        if (list.length === 1)
          events[type] = list[0];
        if (events.removeListener !== void 0)
          this.emit("removeListener", type, originalListener || listener);
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events, i2;
      events = this._events;
      if (events === void 0)
        return this;
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else
            delete events[type];
        }
        return this;
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i2 = 0; i2 < keys.length; ++i2) {
          key = keys[i2];
          if (key === "removeListener") continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
        return this;
      }
      listeners = events[type];
      if (typeof listeners === "function") {
        this.removeListener(type, listeners);
      } else if (listeners !== void 0) {
        for (i2 = listeners.length - 1; i2 >= 0; i2--) {
          this.removeListener(type, listeners[i2]);
        }
      }
      return this;
    };
    function _listeners(target, type, unwrap) {
      var events = target._events;
      if (events === void 0)
        return [];
      var evlistener = events[type];
      if (evlistener === void 0)
        return [];
      if (typeof evlistener === "function")
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
      return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };
    EventEmitter.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };
    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };
    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;
      if (events !== void 0) {
        var evlistener = events[type];
        if (typeof evlistener === "function") {
          return 1;
        } else if (evlistener !== void 0) {
          return evlistener.length;
        }
      }
      return 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n2) {
      var copy = new Array(n2);
      for (var i2 = 0; i2 < n2; ++i2)
        copy[i2] = arr[i2];
      return copy;
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i2 = 0; i2 < ret.length; ++i2) {
        ret[i2] = arr[i2].listener || arr[i2];
      }
      return ret;
    }
    function once(emitter, name) {
      return new Promise(function(resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }
        function resolver() {
          if (typeof emitter.removeListener === "function") {
            emitter.removeListener("error", errorListener);
          }
          resolve([].slice.call(arguments));
        }
        ;
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== "error") {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === "function") {
        eventTargetAgnosticAddListener(emitter, "error", handler, flags);
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === "function") {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }
  }
});

// node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS({
  "node_modules/lodash/_listCacheClear.js"(exports, module) {
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    module.exports = listCacheClear;
  }
});

// node_modules/lodash/eq.js
var require_eq = __commonJS({
  "node_modules/lodash/eq.js"(exports, module) {
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    module.exports = eq;
  }
});

// node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS({
  "node_modules/lodash/_assocIndexOf.js"(exports, module) {
    var eq = require_eq();
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    module.exports = assocIndexOf;
  }
});

// node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS({
  "node_modules/lodash/_listCacheDelete.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    var arrayProto = Array.prototype;
    var splice = arrayProto.splice;
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    module.exports = listCacheDelete;
  }
});

// node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS({
  "node_modules/lodash/_listCacheGet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    module.exports = listCacheGet;
  }
});

// node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS({
  "node_modules/lodash/_listCacheHas.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    module.exports = listCacheHas;
  }
});

// node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS({
  "node_modules/lodash/_listCacheSet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    module.exports = listCacheSet;
  }
});

// node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS({
  "node_modules/lodash/_ListCache.js"(exports, module) {
    var listCacheClear = require_listCacheClear();
    var listCacheDelete = require_listCacheDelete();
    var listCacheGet = require_listCacheGet();
    var listCacheHas = require_listCacheHas();
    var listCacheSet = require_listCacheSet();
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    module.exports = ListCache;
  }
});

// node_modules/lodash/_stackClear.js
var require_stackClear = __commonJS({
  "node_modules/lodash/_stackClear.js"(exports, module) {
    var ListCache = require_ListCache();
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    module.exports = stackClear;
  }
});

// node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS({
  "node_modules/lodash/_stackDelete.js"(exports, module) {
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    module.exports = stackDelete;
  }
});

// node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS({
  "node_modules/lodash/_stackGet.js"(exports, module) {
    function stackGet(key) {
      return this.__data__.get(key);
    }
    module.exports = stackGet;
  }
});

// node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS({
  "node_modules/lodash/_stackHas.js"(exports, module) {
    function stackHas(key) {
      return this.__data__.has(key);
    }
    module.exports = stackHas;
  }
});

// node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS({
  "node_modules/lodash/_freeGlobal.js"(exports, module) {
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    module.exports = freeGlobal;
  }
});

// node_modules/lodash/_root.js
var require_root = __commonJS({
  "node_modules/lodash/_root.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    module.exports = root;
  }
});

// node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS({
  "node_modules/lodash/_Symbol.js"(exports, module) {
    var root = require_root();
    var Symbol2 = root.Symbol;
    module.exports = Symbol2;
  }
});

// node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS({
  "node_modules/lodash/_getRawTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var nativeObjectToString = objectProto.toString;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e2) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    module.exports = getRawTag;
  }
});

// node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS({
  "node_modules/lodash/_objectToString.js"(exports, module) {
    var objectProto = Object.prototype;
    var nativeObjectToString = objectProto.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    module.exports = objectToString;
  }
});

// node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS({
  "node_modules/lodash/_baseGetTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var getRawTag = require_getRawTag();
    var objectToString = require_objectToString();
    var nullTag = "[object Null]";
    var undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    module.exports = baseGetTag;
  }
});

// node_modules/lodash/isObject.js
var require_isObject = __commonJS({
  "node_modules/lodash/isObject.js"(exports, module) {
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    module.exports = isObject;
  }
});

// node_modules/lodash/isFunction.js
var require_isFunction = __commonJS({
  "node_modules/lodash/isFunction.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObject = require_isObject();
    var asyncTag = "[object AsyncFunction]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var proxyTag = "[object Proxy]";
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    module.exports = isFunction;
  }
});

// node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS({
  "node_modules/lodash/_coreJsData.js"(exports, module) {
    var root = require_root();
    var coreJsData = root["__core-js_shared__"];
    module.exports = coreJsData;
  }
});

// node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS({
  "node_modules/lodash/_isMasked.js"(exports, module) {
    var coreJsData = require_coreJsData();
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    })();
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    module.exports = isMasked;
  }
});

// node_modules/lodash/_toSource.js
var require_toSource = __commonJS({
  "node_modules/lodash/_toSource.js"(exports, module) {
    var funcProto = Function.prototype;
    var funcToString = funcProto.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e2) {
        }
        try {
          return func + "";
        } catch (e2) {
        }
      }
      return "";
    }
    module.exports = toSource;
  }
});

// node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS({
  "node_modules/lodash/_baseIsNative.js"(exports, module) {
    var isFunction = require_isFunction();
    var isMasked = require_isMasked();
    var isObject = require_isObject();
    var toSource = require_toSource();
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    module.exports = baseIsNative;
  }
});

// node_modules/lodash/_getValue.js
var require_getValue = __commonJS({
  "node_modules/lodash/_getValue.js"(exports, module) {
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    module.exports = getValue;
  }
});

// node_modules/lodash/_getNative.js
var require_getNative = __commonJS({
  "node_modules/lodash/_getNative.js"(exports, module) {
    var baseIsNative = require_baseIsNative();
    var getValue = require_getValue();
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    module.exports = getNative;
  }
});

// node_modules/lodash/_Map.js
var require_Map = __commonJS({
  "node_modules/lodash/_Map.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Map2 = getNative(root, "Map");
    module.exports = Map2;
  }
});

// node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS({
  "node_modules/lodash/_nativeCreate.js"(exports, module) {
    var getNative = require_getNative();
    var nativeCreate = getNative(Object, "create");
    module.exports = nativeCreate;
  }
});

// node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS({
  "node_modules/lodash/_hashClear.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    module.exports = hashClear;
  }
});

// node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS({
  "node_modules/lodash/_hashDelete.js"(exports, module) {
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = hashDelete;
  }
});

// node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS({
  "node_modules/lodash/_hashGet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    module.exports = hashGet;
  }
});

// node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS({
  "node_modules/lodash/_hashHas.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    module.exports = hashHas;
  }
});

// node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS({
  "node_modules/lodash/_hashSet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    module.exports = hashSet;
  }
});

// node_modules/lodash/_Hash.js
var require_Hash = __commonJS({
  "node_modules/lodash/_Hash.js"(exports, module) {
    var hashClear = require_hashClear();
    var hashDelete = require_hashDelete();
    var hashGet = require_hashGet();
    var hashHas = require_hashHas();
    var hashSet = require_hashSet();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    module.exports = Hash;
  }
});

// node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS({
  "node_modules/lodash/_mapCacheClear.js"(exports, module) {
    var Hash = require_Hash();
    var ListCache = require_ListCache();
    var Map2 = require_Map();
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    module.exports = mapCacheClear;
  }
});

// node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS({
  "node_modules/lodash/_isKeyable.js"(exports, module) {
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    module.exports = isKeyable;
  }
});

// node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS({
  "node_modules/lodash/_getMapData.js"(exports, module) {
    var isKeyable = require_isKeyable();
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    module.exports = getMapData;
  }
});

// node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS({
  "node_modules/lodash/_mapCacheDelete.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = mapCacheDelete;
  }
});

// node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS({
  "node_modules/lodash/_mapCacheGet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    module.exports = mapCacheGet;
  }
});

// node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS({
  "node_modules/lodash/_mapCacheHas.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    module.exports = mapCacheHas;
  }
});

// node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS({
  "node_modules/lodash/_mapCacheSet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    module.exports = mapCacheSet;
  }
});

// node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS({
  "node_modules/lodash/_MapCache.js"(exports, module) {
    var mapCacheClear = require_mapCacheClear();
    var mapCacheDelete = require_mapCacheDelete();
    var mapCacheGet = require_mapCacheGet();
    var mapCacheHas = require_mapCacheHas();
    var mapCacheSet = require_mapCacheSet();
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    module.exports = MapCache;
  }
});

// node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS({
  "node_modules/lodash/_stackSet.js"(exports, module) {
    var ListCache = require_ListCache();
    var Map2 = require_Map();
    var MapCache = require_MapCache();
    var LARGE_ARRAY_SIZE = 200;
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    module.exports = stackSet;
  }
});

// node_modules/lodash/_Stack.js
var require_Stack = __commonJS({
  "node_modules/lodash/_Stack.js"(exports, module) {
    var ListCache = require_ListCache();
    var stackClear = require_stackClear();
    var stackDelete = require_stackDelete();
    var stackGet = require_stackGet();
    var stackHas = require_stackHas();
    var stackSet = require_stackSet();
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    module.exports = Stack;
  }
});

// node_modules/lodash/_arrayEach.js
var require_arrayEach = __commonJS({
  "node_modules/lodash/_arrayEach.js"(exports, module) {
    function arrayEach(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    module.exports = arrayEach;
  }
});

// node_modules/lodash/_defineProperty.js
var require_defineProperty = __commonJS({
  "node_modules/lodash/_defineProperty.js"(exports, module) {
    var getNative = require_getNative();
    var defineProperty = (function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e2) {
      }
    })();
    module.exports = defineProperty;
  }
});

// node_modules/lodash/_baseAssignValue.js
var require_baseAssignValue = __commonJS({
  "node_modules/lodash/_baseAssignValue.js"(exports, module) {
    var defineProperty = require_defineProperty();
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    module.exports = baseAssignValue;
  }
});

// node_modules/lodash/_assignValue.js
var require_assignValue = __commonJS({
  "node_modules/lodash/_assignValue.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var eq = require_eq();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    module.exports = assignValue;
  }
});

// node_modules/lodash/_copyObject.js
var require_copyObject = __commonJS({
  "node_modules/lodash/_copyObject.js"(exports, module) {
    var assignValue = require_assignValue();
    var baseAssignValue = require_baseAssignValue();
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    module.exports = copyObject;
  }
});

// node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS({
  "node_modules/lodash/_baseTimes.js"(exports, module) {
    function baseTimes(n2, iteratee) {
      var index = -1, result = Array(n2);
      while (++index < n2) {
        result[index] = iteratee(index);
      }
      return result;
    }
    module.exports = baseTimes;
  }
});

// node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS({
  "node_modules/lodash/isObjectLike.js"(exports, module) {
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    module.exports = isObjectLike;
  }
});

// node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS({
  "node_modules/lodash/_baseIsArguments.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    module.exports = baseIsArguments;
  }
});

// node_modules/lodash/isArguments.js
var require_isArguments = __commonJS({
  "node_modules/lodash/isArguments.js"(exports, module) {
    var baseIsArguments = require_baseIsArguments();
    var isObjectLike = require_isObjectLike();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    module.exports = isArguments;
  }
});

// node_modules/lodash/isArray.js
var require_isArray = __commonJS({
  "node_modules/lodash/isArray.js"(exports, module) {
    var isArray = Array.isArray;
    module.exports = isArray;
  }
});

// node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS({
  "node_modules/lodash/stubFalse.js"(exports, module) {
    function stubFalse() {
      return false;
    }
    module.exports = stubFalse;
  }
});

// node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS({
  "node_modules/lodash/isBuffer.js"(exports, module) {
    var root = require_root();
    var stubFalse = require_stubFalse();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var isBuffer = nativeIsBuffer || stubFalse;
    module.exports = isBuffer;
  }
});

// node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS({
  "node_modules/lodash/_isIndex.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    module.exports = isIndex;
  }
});

// node_modules/lodash/isLength.js
var require_isLength = __commonJS({
  "node_modules/lodash/isLength.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    module.exports = isLength;
  }
});

// node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS({
  "node_modules/lodash/_baseIsTypedArray.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isLength = require_isLength();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    module.exports = baseIsTypedArray;
  }
});

// node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS({
  "node_modules/lodash/_baseUnary.js"(exports, module) {
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    module.exports = baseUnary;
  }
});

// node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS({
  "node_modules/lodash/_nodeUtil.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e2) {
      }
    })();
    module.exports = nodeUtil;
  }
});

// node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS({
  "node_modules/lodash/isTypedArray.js"(exports, module) {
    var baseIsTypedArray = require_baseIsTypedArray();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    module.exports = isTypedArray;
  }
});

// node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS({
  "node_modules/lodash/_arrayLikeKeys.js"(exports, module) {
    var baseTimes = require_baseTimes();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isIndex = require_isIndex();
    var isTypedArray = require_isTypedArray();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = arrayLikeKeys;
  }
});

// node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS({
  "node_modules/lodash/_isPrototype.js"(exports, module) {
    var objectProto = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    module.exports = isPrototype;
  }
});

// node_modules/lodash/_overArg.js
var require_overArg = __commonJS({
  "node_modules/lodash/_overArg.js"(exports, module) {
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    module.exports = overArg;
  }
});

// node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS({
  "node_modules/lodash/_nativeKeys.js"(exports, module) {
    var overArg = require_overArg();
    var nativeKeys = overArg(Object.keys, Object);
    module.exports = nativeKeys;
  }
});

// node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS({
  "node_modules/lodash/_baseKeys.js"(exports, module) {
    var isPrototype = require_isPrototype();
    var nativeKeys = require_nativeKeys();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeys;
  }
});

// node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS({
  "node_modules/lodash/isArrayLike.js"(exports, module) {
    var isFunction = require_isFunction();
    var isLength = require_isLength();
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    module.exports = isArrayLike;
  }
});

// node_modules/lodash/keys.js
var require_keys = __commonJS({
  "node_modules/lodash/keys.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeys = require_baseKeys();
    var isArrayLike = require_isArrayLike();
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    module.exports = keys;
  }
});

// node_modules/lodash/_baseAssign.js
var require_baseAssign = __commonJS({
  "node_modules/lodash/_baseAssign.js"(exports, module) {
    var copyObject = require_copyObject();
    var keys = require_keys();
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }
    module.exports = baseAssign;
  }
});

// node_modules/lodash/_nativeKeysIn.js
var require_nativeKeysIn = __commonJS({
  "node_modules/lodash/_nativeKeysIn.js"(exports, module) {
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = nativeKeysIn;
  }
});

// node_modules/lodash/_baseKeysIn.js
var require_baseKeysIn = __commonJS({
  "node_modules/lodash/_baseKeysIn.js"(exports, module) {
    var isObject = require_isObject();
    var isPrototype = require_isPrototype();
    var nativeKeysIn = require_nativeKeysIn();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeysIn;
  }
});

// node_modules/lodash/keysIn.js
var require_keysIn = __commonJS({
  "node_modules/lodash/keysIn.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeysIn = require_baseKeysIn();
    var isArrayLike = require_isArrayLike();
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    module.exports = keysIn;
  }
});

// node_modules/lodash/_baseAssignIn.js
var require_baseAssignIn = __commonJS({
  "node_modules/lodash/_baseAssignIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var keysIn = require_keysIn();
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn(source), object);
    }
    module.exports = baseAssignIn;
  }
});

// node_modules/lodash/_cloneBuffer.js
var require_cloneBuffer = __commonJS({
  "node_modules/lodash/_cloneBuffer.js"(exports, module) {
    var root = require_root();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    module.exports = cloneBuffer;
  }
});

// node_modules/lodash/_copyArray.js
var require_copyArray = __commonJS({
  "node_modules/lodash/_copyArray.js"(exports, module) {
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    module.exports = copyArray;
  }
});

// node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS({
  "node_modules/lodash/_arrayFilter.js"(exports, module) {
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    module.exports = arrayFilter;
  }
});

// node_modules/lodash/stubArray.js
var require_stubArray = __commonJS({
  "node_modules/lodash/stubArray.js"(exports, module) {
    function stubArray() {
      return [];
    }
    module.exports = stubArray;
  }
});

// node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS({
  "node_modules/lodash/_getSymbols.js"(exports, module) {
    var arrayFilter = require_arrayFilter();
    var stubArray = require_stubArray();
    var objectProto = Object.prototype;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    module.exports = getSymbols;
  }
});

// node_modules/lodash/_copySymbols.js
var require_copySymbols = __commonJS({
  "node_modules/lodash/_copySymbols.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbols = require_getSymbols();
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }
    module.exports = copySymbols;
  }
});

// node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS({
  "node_modules/lodash/_arrayPush.js"(exports, module) {
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    module.exports = arrayPush;
  }
});

// node_modules/lodash/_getPrototype.js
var require_getPrototype = __commonJS({
  "node_modules/lodash/_getPrototype.js"(exports, module) {
    var overArg = require_overArg();
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    module.exports = getPrototype;
  }
});

// node_modules/lodash/_getSymbolsIn.js
var require_getSymbolsIn = __commonJS({
  "node_modules/lodash/_getSymbolsIn.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var getPrototype = require_getPrototype();
    var getSymbols = require_getSymbols();
    var stubArray = require_stubArray();
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };
    module.exports = getSymbolsIn;
  }
});

// node_modules/lodash/_copySymbolsIn.js
var require_copySymbolsIn = __commonJS({
  "node_modules/lodash/_copySymbolsIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbolsIn = require_getSymbolsIn();
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }
    module.exports = copySymbolsIn;
  }
});

// node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS({
  "node_modules/lodash/_baseGetAllKeys.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var isArray = require_isArray();
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    module.exports = baseGetAllKeys;
  }
});

// node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS({
  "node_modules/lodash/_getAllKeys.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbols = require_getSymbols();
    var keys = require_keys();
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    module.exports = getAllKeys;
  }
});

// node_modules/lodash/_getAllKeysIn.js
var require_getAllKeysIn = __commonJS({
  "node_modules/lodash/_getAllKeysIn.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbolsIn = require_getSymbolsIn();
    var keysIn = require_keysIn();
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
    }
    module.exports = getAllKeysIn;
  }
});

// node_modules/lodash/_DataView.js
var require_DataView = __commonJS({
  "node_modules/lodash/_DataView.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var DataView2 = getNative(root, "DataView");
    module.exports = DataView2;
  }
});

// node_modules/lodash/_Promise.js
var require_Promise = __commonJS({
  "node_modules/lodash/_Promise.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Promise2 = getNative(root, "Promise");
    module.exports = Promise2;
  }
});

// node_modules/lodash/_Set.js
var require_Set = __commonJS({
  "node_modules/lodash/_Set.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Set2 = getNative(root, "Set");
    module.exports = Set2;
  }
});

// node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS({
  "node_modules/lodash/_WeakMap.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var WeakMap2 = getNative(root, "WeakMap");
    module.exports = WeakMap2;
  }
});

// node_modules/lodash/_getTag.js
var require_getTag = __commonJS({
  "node_modules/lodash/_getTag.js"(exports, module) {
    var DataView2 = require_DataView();
    var Map2 = require_Map();
    var Promise2 = require_Promise();
    var Set2 = require_Set();
    var WeakMap2 = require_WeakMap();
    var baseGetTag = require_baseGetTag();
    var toSource = require_toSource();
    var mapTag = "[object Map]";
    var objectTag = "[object Object]";
    var promiseTag = "[object Promise]";
    var setTag = "[object Set]";
    var weakMapTag = "[object WeakMap]";
    var dataViewTag = "[object DataView]";
    var dataViewCtorString = toSource(DataView2);
    var mapCtorString = toSource(Map2);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set2);
    var weakMapCtorString = toSource(WeakMap2);
    var getTag = baseGetTag;
    if (DataView2 && getTag(new DataView2(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    module.exports = getTag;
  }
});

// node_modules/lodash/_initCloneArray.js
var require_initCloneArray = __commonJS({
  "node_modules/lodash/_initCloneArray.js"(exports, module) {
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function initCloneArray(array) {
      var length = array.length, result = new array.constructor(length);
      if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    module.exports = initCloneArray;
  }
});

// node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS({
  "node_modules/lodash/_Uint8Array.js"(exports, module) {
    var root = require_root();
    var Uint8Array2 = root.Uint8Array;
    module.exports = Uint8Array2;
  }
});

// node_modules/lodash/_cloneArrayBuffer.js
var require_cloneArrayBuffer = __commonJS({
  "node_modules/lodash/_cloneArrayBuffer.js"(exports, module) {
    var Uint8Array2 = require_Uint8Array();
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    module.exports = cloneArrayBuffer;
  }
});

// node_modules/lodash/_cloneDataView.js
var require_cloneDataView = __commonJS({
  "node_modules/lodash/_cloneDataView.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    module.exports = cloneDataView;
  }
});

// node_modules/lodash/_cloneRegExp.js
var require_cloneRegExp = __commonJS({
  "node_modules/lodash/_cloneRegExp.js"(exports, module) {
    var reFlags = /\w*$/;
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    module.exports = cloneRegExp;
  }
});

// node_modules/lodash/_cloneSymbol.js
var require_cloneSymbol = __commonJS({
  "node_modules/lodash/_cloneSymbol.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }
    module.exports = cloneSymbol;
  }
});

// node_modules/lodash/_cloneTypedArray.js
var require_cloneTypedArray = __commonJS({
  "node_modules/lodash/_cloneTypedArray.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    module.exports = cloneTypedArray;
  }
});

// node_modules/lodash/_initCloneByTag.js
var require_initCloneByTag = __commonJS({
  "node_modules/lodash/_initCloneByTag.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    var cloneDataView = require_cloneDataView();
    var cloneRegExp = require_cloneRegExp();
    var cloneSymbol = require_cloneSymbol();
    var cloneTypedArray = require_cloneTypedArray();
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);
        case boolTag:
        case dateTag:
          return new Ctor(+object);
        case dataViewTag:
          return cloneDataView(object, isDeep);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag:
          return cloneTypedArray(object, isDeep);
        case mapTag:
          return new Ctor();
        case numberTag:
        case stringTag:
          return new Ctor(object);
        case regexpTag:
          return cloneRegExp(object);
        case setTag:
          return new Ctor();
        case symbolTag:
          return cloneSymbol(object);
      }
    }
    module.exports = initCloneByTag;
  }
});

// node_modules/lodash/_baseCreate.js
var require_baseCreate = __commonJS({
  "node_modules/lodash/_baseCreate.js"(exports, module) {
    var isObject = require_isObject();
    var objectCreate = Object.create;
    var baseCreate = /* @__PURE__ */ (function() {
      function object() {
      }
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    })();
    module.exports = baseCreate;
  }
});

// node_modules/lodash/_initCloneObject.js
var require_initCloneObject = __commonJS({
  "node_modules/lodash/_initCloneObject.js"(exports, module) {
    var baseCreate = require_baseCreate();
    var getPrototype = require_getPrototype();
    var isPrototype = require_isPrototype();
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    module.exports = initCloneObject;
  }
});

// node_modules/lodash/_baseIsMap.js
var require_baseIsMap = __commonJS({
  "node_modules/lodash/_baseIsMap.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var mapTag = "[object Map]";
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag;
    }
    module.exports = baseIsMap;
  }
});

// node_modules/lodash/isMap.js
var require_isMap = __commonJS({
  "node_modules/lodash/isMap.js"(exports, module) {
    var baseIsMap = require_baseIsMap();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsMap = nodeUtil && nodeUtil.isMap;
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
    module.exports = isMap;
  }
});

// node_modules/lodash/_baseIsSet.js
var require_baseIsSet = __commonJS({
  "node_modules/lodash/_baseIsSet.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var setTag = "[object Set]";
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag;
    }
    module.exports = baseIsSet;
  }
});

// node_modules/lodash/isSet.js
var require_isSet = __commonJS({
  "node_modules/lodash/isSet.js"(exports, module) {
    var baseIsSet = require_baseIsSet();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsSet = nodeUtil && nodeUtil.isSet;
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
    module.exports = isSet;
  }
});

// node_modules/lodash/_baseClone.js
var require_baseClone = __commonJS({
  "node_modules/lodash/_baseClone.js"(exports, module) {
    var Stack = require_Stack();
    var arrayEach = require_arrayEach();
    var assignValue = require_assignValue();
    var baseAssign = require_baseAssign();
    var baseAssignIn = require_baseAssignIn();
    var cloneBuffer = require_cloneBuffer();
    var copyArray = require_copyArray();
    var copySymbols = require_copySymbols();
    var copySymbolsIn = require_copySymbolsIn();
    var getAllKeys = require_getAllKeys();
    var getAllKeysIn = require_getAllKeysIn();
    var getTag = require_getTag();
    var initCloneArray = require_initCloneArray();
    var initCloneByTag = require_initCloneByTag();
    var initCloneObject = require_initCloneObject();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isMap = require_isMap();
    var isObject = require_isObject();
    var isSet = require_isSet();
    var keys = require_keys();
    var keysIn = require_keysIn();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_FLAT_FLAG = 2;
    var CLONE_SYMBOLS_FLAG = 4;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== void 0) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || isFunc && !object) {
          result = isFlat || isFunc ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      stack || (stack = new Stack());
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key2) {
          result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
      }
      var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
      var props = isArr ? void 0 : keysFunc(value);
      arrayEach(props || value, function(subValue, key2) {
        if (props) {
          key2 = subValue;
          subValue = value[key2];
        }
        assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
      return result;
    }
    module.exports = baseClone;
  }
});

// node_modules/lodash/cloneDeep.js
var require_cloneDeep = __commonJS({
  "node_modules/lodash/cloneDeep.js"(exports, module) {
    var baseClone = require_baseClone();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_SYMBOLS_FLAG = 4;
    function cloneDeep(value) {
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
    }
    module.exports = cloneDeep;
  }
});

// node_modules/@pipecat-ai/client-js/dist/index.module.js
var import_events = __toESM(require_events());

// node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i2 = 0; i2 < 256; ++i2) {
  byteToHex.push((i2 + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = { randomUUID };

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i2 = 0; i2 < 16; ++i2) {
      buf[offset + i2] = rnds[i2];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// node_modules/bowser/bowser.mjs
var BROWSER_ALIASES_MAP = {
  AmazonBot: "amazonbot",
  "Amazon Silk": "amazon_silk",
  "Android Browser": "android",
  BaiduSpider: "baiduspider",
  Bada: "bada",
  BingCrawler: "bingcrawler",
  Brave: "brave",
  BlackBerry: "blackberry",
  "ChatGPT-User": "chatgpt_user",
  Chrome: "chrome",
  ClaudeBot: "claudebot",
  Chromium: "chromium",
  Diffbot: "diffbot",
  DuckDuckBot: "duckduckbot",
  DuckDuckGo: "duckduckgo",
  Electron: "electron",
  Epiphany: "epiphany",
  FacebookExternalHit: "facebookexternalhit",
  Firefox: "firefox",
  Focus: "focus",
  Generic: "generic",
  "Google Search": "google_search",
  Googlebot: "googlebot",
  GPTBot: "gptbot",
  "HeyTap Browser": "heytap",
  "Internet Explorer": "ie",
  InternetArchiveCrawler: "internetarchivecrawler",
  "K-Meleon": "k_meleon",
  Ladybird: "ladybird",
  LibreWolf: "librewolf",
  Linespider: "linespider",
  Maxthon: "maxthon",
  "Meta-ExternalAds": "meta_externalads",
  "Meta-ExternalAgent": "meta_externalagent",
  "Meta-ExternalFetcher": "meta_externalfetcher",
  "Meta-WebIndexer": "meta_webindexer",
  "Microsoft Edge": "edge",
  "MZ Browser": "mz",
  "NAVER Whale Browser": "naver",
  "OAI-SearchBot": "oai_searchbot",
  Omgilibot: "omgilibot",
  Opera: "opera",
  "Opera Coast": "opera_coast",
  "Pale Moon": "pale_moon",
  PerplexityBot: "perplexitybot",
  "Perplexity-User": "perplexity_user",
  PhantomJS: "phantomjs",
  PingdomBot: "pingdombot",
  Puffin: "puffin",
  QQ: "qq",
  QQLite: "qqlite",
  QupZilla: "qupzilla",
  Roku: "roku",
  Safari: "safari",
  Sailfish: "sailfish",
  "Samsung Internet for Android": "samsung_internet",
  SlackBot: "slackbot",
  SeaMonkey: "seamonkey",
  Sleipnir: "sleipnir",
  "Sogou Browser": "sogou",
  Swing: "swing",
  Tizen: "tizen",
  "UC Browser": "uc",
  "Vivo Browser": "vivo",
  Vivaldi: "vivaldi",
  "WebOS Browser": "webos",
  WeChat: "wechat",
  YahooSlurp: "yahooslurp",
  "Yandex Browser": "yandex",
  YandexBot: "yandexbot",
  YouBot: "youbot"
};
var BROWSER_MAP = {
  amazonbot: "AmazonBot",
  amazon_silk: "Amazon Silk",
  android: "Android Browser",
  baiduspider: "BaiduSpider",
  bada: "Bada",
  bingcrawler: "BingCrawler",
  blackberry: "BlackBerry",
  brave: "Brave",
  chatgpt_user: "ChatGPT-User",
  chrome: "Chrome",
  claudebot: "ClaudeBot",
  chromium: "Chromium",
  diffbot: "Diffbot",
  duckduckbot: "DuckDuckBot",
  duckduckgo: "DuckDuckGo",
  edge: "Microsoft Edge",
  electron: "Electron",
  epiphany: "Epiphany",
  facebookexternalhit: "FacebookExternalHit",
  firefox: "Firefox",
  focus: "Focus",
  generic: "Generic",
  google_search: "Google Search",
  googlebot: "Googlebot",
  gptbot: "GPTBot",
  heytap: "HeyTap Browser",
  ie: "Internet Explorer",
  internetarchivecrawler: "InternetArchiveCrawler",
  k_meleon: "K-Meleon",
  ladybird: "Ladybird",
  librewolf: "LibreWolf",
  linespider: "Linespider",
  maxthon: "Maxthon",
  meta_externalads: "Meta-ExternalAds",
  meta_externalagent: "Meta-ExternalAgent",
  meta_externalfetcher: "Meta-ExternalFetcher",
  meta_webindexer: "Meta-WebIndexer",
  mz: "MZ Browser",
  naver: "NAVER Whale Browser",
  oai_searchbot: "OAI-SearchBot",
  omgilibot: "Omgilibot",
  opera: "Opera",
  opera_coast: "Opera Coast",
  pale_moon: "Pale Moon",
  perplexitybot: "PerplexityBot",
  perplexity_user: "Perplexity-User",
  phantomjs: "PhantomJS",
  pingdombot: "PingdomBot",
  puffin: "Puffin",
  qq: "QQ Browser",
  qqlite: "QQ Browser Lite",
  qupzilla: "QupZilla",
  roku: "Roku",
  safari: "Safari",
  sailfish: "Sailfish",
  samsung_internet: "Samsung Internet for Android",
  seamonkey: "SeaMonkey",
  slackbot: "SlackBot",
  sleipnir: "Sleipnir",
  sogou: "Sogou Browser",
  swing: "Swing",
  tizen: "Tizen",
  uc: "UC Browser",
  vivo: "Vivo Browser",
  vivaldi: "Vivaldi",
  webos: "WebOS Browser",
  wechat: "WeChat",
  yahooslurp: "YahooSlurp",
  yandex: "Yandex Browser",
  yandexbot: "YandexBot",
  youbot: "YouBot"
};
var PLATFORMS_MAP = {
  bot: "bot",
  desktop: "desktop",
  mobile: "mobile",
  tablet: "tablet",
  tv: "tv"
};
var OS_MAP = {
  Android: "Android",
  Bada: "Bada",
  BlackBerry: "BlackBerry",
  ChromeOS: "Chrome OS",
  HarmonyOS: "HarmonyOS",
  iOS: "iOS",
  Linux: "Linux",
  MacOS: "macOS",
  PlayStation4: "PlayStation 4",
  Roku: "Roku",
  Tizen: "Tizen",
  WebOS: "WebOS",
  Windows: "Windows",
  WindowsPhone: "Windows Phone"
};
var ENGINE_MAP = {
  Blink: "Blink",
  EdgeHTML: "EdgeHTML",
  Gecko: "Gecko",
  LibWeb: "LibWeb",
  Presto: "Presto",
  Trident: "Trident",
  WebKit: "WebKit"
};
var Utils = /* @__PURE__ */ (function() {
  function Utils2() {
  }
  Utils2.getFirstMatch = function getFirstMatch(regexp, ua2) {
    var match = ua2.match(regexp);
    return match && match.length > 0 && match[1] || "";
  };
  Utils2.getSecondMatch = function getSecondMatch(regexp, ua2) {
    var match = ua2.match(regexp);
    return match && match.length > 1 && match[2] || "";
  };
  Utils2.matchAndReturnConst = function matchAndReturnConst(regexp, ua2, _const) {
    if (regexp.test(ua2)) return _const;
  };
  Utils2.isFirefoxOnIpad = function isFirefoxOnIpad(ua2) {
    var macIndex = ua2.indexOf("Macintosh");
    if (macIndex === -1) return false;
    var fxiosIndex = ua2.indexOf(" FxiOS", macIndex + 9);
    return fxiosIndex !== -1 && ua2.indexOf("/", fxiosIndex + 6) !== -1;
  };
  Utils2.getWindowsVersionName = function getWindowsVersionName(version) {
    switch (version) {
      case "NT":
        return "NT";
      case "XP":
        return "XP";
      case "NT 5.0":
        return "2000";
      case "NT 5.1":
        return "XP";
      case "NT 5.2":
        return "2003";
      case "NT 6.0":
        return "Vista";
      case "NT 6.1":
        return "7";
      case "NT 6.2":
        return "8";
      case "NT 6.3":
        return "8.1";
      case "NT 10.0":
        return "10";
      default:
        return;
    }
  };
  Utils2.getMacOSVersionName = function getMacOSVersionName(version) {
    var v2 = version.split(".").splice(0, 2).map(function(s2) {
      return parseInt(s2, 10) || 0;
    });
    v2.push(0);
    var major = v2[0];
    var minor = v2[1];
    if (major === 10) switch (minor) {
      case 5:
        return "Leopard";
      case 6:
        return "Snow Leopard";
      case 7:
        return "Lion";
      case 8:
        return "Mountain Lion";
      case 9:
        return "Mavericks";
      case 10:
        return "Yosemite";
      case 11:
        return "El Capitan";
      case 12:
        return "Sierra";
      case 13:
        return "High Sierra";
      case 14:
        return "Mojave";
      case 15:
        return "Catalina";
      default:
        return;
    }
    switch (major) {
      case 11:
        return "Big Sur";
      case 12:
        return "Monterey";
      case 13:
        return "Ventura";
      case 14:
        return "Sonoma";
      case 15:
        return "Sequoia";
      default:
        return;
    }
  };
  Utils2.getAndroidVersionName = function getAndroidVersionName(version) {
    var v2 = version.split(".").splice(0, 2).map(function(s2) {
      return parseInt(s2, 10) || 0;
    });
    v2.push(0);
    if (v2[0] === 1 && v2[1] < 5) return void 0;
    if (v2[0] === 1 && v2[1] < 6) return "Cupcake";
    if (v2[0] === 1 && v2[1] >= 6) return "Donut";
    if (v2[0] === 2 && v2[1] < 2) return "Eclair";
    if (v2[0] === 2 && v2[1] === 2) return "Froyo";
    if (v2[0] === 2 && v2[1] > 2) return "Gingerbread";
    if (v2[0] === 3) return "Honeycomb";
    if (v2[0] === 4 && v2[1] < 1) return "Ice Cream Sandwich";
    if (v2[0] === 4 && v2[1] < 4) return "Jelly Bean";
    if (v2[0] === 4 && v2[1] >= 4) return "KitKat";
    if (v2[0] === 5) return "Lollipop";
    if (v2[0] === 6) return "Marshmallow";
    if (v2[0] === 7) return "Nougat";
    if (v2[0] === 8) return "Oreo";
    if (v2[0] === 9) return "Pie";
  };
  Utils2.getVersionPrecision = function getVersionPrecision(version) {
    return version.split(".").length;
  };
  Utils2.compareVersions = function compareVersions(versionA, versionB, isLoose) {
    if (isLoose === void 0) isLoose = false;
    var versionAPrecision = Utils2.getVersionPrecision(versionA);
    var versionBPrecision = Utils2.getVersionPrecision(versionB);
    var precision = Math.max(versionAPrecision, versionBPrecision);
    var lastPrecision = 0;
    var chunks = Utils2.map([versionA, versionB], function(version) {
      var delta = precision - Utils2.getVersionPrecision(version);
      var _version = version + new Array(delta + 1).join(".0");
      return Utils2.map(_version.split("."), function(chunk) {
        return new Array(20 - chunk.length).join("0") + chunk;
      }).reverse();
    });
    if (isLoose) lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision);
    precision -= 1;
    while (precision >= lastPrecision) {
      if (chunks[0][precision] > chunks[1][precision]) return 1;
      if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === lastPrecision) return 0;
        precision -= 1;
      } else if (chunks[0][precision] < chunks[1][precision]) return -1;
    }
  };
  Utils2.map = function map(arr, iterator) {
    var result = [];
    var i2;
    if (Array.prototype.map) return Array.prototype.map.call(arr, iterator);
    for (i2 = 0; i2 < arr.length; i2 += 1) result.push(iterator(arr[i2]));
    return result;
  };
  Utils2.find = function find(arr, predicate) {
    var i2;
    var l2;
    if (Array.prototype.find) return Array.prototype.find.call(arr, predicate);
    for (i2 = 0, l2 = arr.length; i2 < l2; i2 += 1) {
      var value = arr[i2];
      if (predicate(value, i2)) return value;
    }
  };
  Utils2.assign = function assign(obj) {
    var result = obj;
    var i2;
    var l2;
    for (var _len = arguments.length, assigners = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) assigners[_key - 1] = arguments[_key];
    if (Object.assign) return Object.assign.apply(Object, [obj].concat(assigners));
    var _loop = function _loop2() {
      var assigner = assigners[i2];
      if (typeof assigner === "object" && assigner !== null) Object.keys(assigner).forEach(function(key) {
        result[key] = assigner[key];
      });
    };
    for (i2 = 0, l2 = assigners.length; i2 < l2; i2 += 1) _loop();
    return obj;
  };
  Utils2.getBrowserAlias = function getBrowserAlias(browserName) {
    return BROWSER_ALIASES_MAP[browserName];
  };
  Utils2.getBrowserTypeByAlias = function getBrowserTypeByAlias(browserAlias) {
    return BROWSER_MAP[browserAlias] || "";
  };
  return Utils2;
})();
var commonVersionIdentifier = /version\/(\d+(\.?_?\d+)+)/i;
var browsersList = [{
  test: [/gptbot/i],
  describe: function describe(ua2) {
    var browser = {
      name: "GPTBot"
    };
    var version = Utils.getFirstMatch(/gptbot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/chatgpt-user/i],
  describe: function describe2(ua2) {
    var browser = {
      name: "ChatGPT-User"
    };
    var version = Utils.getFirstMatch(/chatgpt-user\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/oai-searchbot/i],
  describe: function describe3(ua2) {
    var browser = {
      name: "OAI-SearchBot"
    };
    var version = Utils.getFirstMatch(/oai-searchbot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/claudebot/i, /claude-web/i, /claude-user/i, /claude-searchbot/i],
  describe: function describe4(ua2) {
    var browser = {
      name: "ClaudeBot"
    };
    var version = Utils.getFirstMatch(/(?:claudebot|claude-web|claude-user|claude-searchbot)\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/omgilibot/i, /webzio-extended/i],
  describe: function describe5(ua2) {
    var browser = {
      name: "Omgilibot"
    };
    var version = Utils.getFirstMatch(/(?:omgilibot|webzio-extended)\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/diffbot/i],
  describe: function describe6(ua2) {
    var browser = {
      name: "Diffbot"
    };
    var version = Utils.getFirstMatch(/diffbot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/perplexitybot/i],
  describe: function describe7(ua2) {
    var browser = {
      name: "PerplexityBot"
    };
    var version = Utils.getFirstMatch(/perplexitybot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/perplexity-user/i],
  describe: function describe8(ua2) {
    var browser = {
      name: "Perplexity-User"
    };
    var version = Utils.getFirstMatch(/perplexity-user\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/youbot/i],
  describe: function describe9(ua2) {
    var browser = {
      name: "YouBot"
    };
    var version = Utils.getFirstMatch(/youbot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/meta-webindexer/i],
  describe: function describe10(ua2) {
    var browser = {
      name: "Meta-WebIndexer"
    };
    var version = Utils.getFirstMatch(/meta-webindexer\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/meta-externalads/i],
  describe: function describe11(ua2) {
    var browser = {
      name: "Meta-ExternalAds"
    };
    var version = Utils.getFirstMatch(/meta-externalads\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/meta-externalagent/i],
  describe: function describe12(ua2) {
    var browser = {
      name: "Meta-ExternalAgent"
    };
    var version = Utils.getFirstMatch(/meta-externalagent\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/meta-externalfetcher/i],
  describe: function describe13(ua2) {
    var browser = {
      name: "Meta-ExternalFetcher"
    };
    var version = Utils.getFirstMatch(/meta-externalfetcher\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/googlebot/i],
  describe: function describe14(ua2) {
    var browser = {
      name: "Googlebot"
    };
    var version = Utils.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/linespider/i],
  describe: function describe15(ua2) {
    var browser = {
      name: "Linespider"
    };
    var version = Utils.getFirstMatch(/(?:linespider)(?:-[-\w]{1,64})?[\s/](\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/amazonbot/i],
  describe: function describe16(ua2) {
    var browser = {
      name: "AmazonBot"
    };
    var version = Utils.getFirstMatch(/amazonbot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/bingbot/i],
  describe: function describe17(ua2) {
    var browser = {
      name: "BingCrawler"
    };
    var version = Utils.getFirstMatch(/bingbot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/baiduspider/i],
  describe: function describe18(ua2) {
    var browser = {
      name: "BaiduSpider"
    };
    var version = Utils.getFirstMatch(/baiduspider\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/duckduckbot/i],
  describe: function describe19(ua2) {
    var browser = {
      name: "DuckDuckBot"
    };
    var version = Utils.getFirstMatch(/duckduckbot\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/ia_archiver/i],
  describe: function describe20(ua2) {
    var browser = {
      name: "InternetArchiveCrawler"
    };
    var version = Utils.getFirstMatch(/ia_archiver\/(\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/facebookexternalhit/i, /facebookcatalog/i],
  describe: function describe21() {
    return {
      name: "FacebookExternalHit"
    };
  }
}, {
  test: [/slackbot/i, /slack-imgProxy/i],
  describe: function describe22(ua2) {
    var browser = {
      name: "SlackBot"
    };
    var version = Utils.getFirstMatch(/(?:slackbot|slack-imgproxy)(?:-[-\w]{1,64})?[\s/](\d+(\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/yahoo!?[\s/]*slurp/i],
  describe: function describe23() {
    return {
      name: "YahooSlurp"
    };
  }
}, {
  test: [/yandexbot/i, /yandexmobilebot/i],
  describe: function describe24() {
    return {
      name: "YandexBot"
    };
  }
}, {
  test: [/pingdom/i],
  describe: function describe25() {
    return {
      name: "PingdomBot"
    };
  }
}, {
  test: [/opera/i],
  describe: function describe26(ua2) {
    var browser = {
      name: "Opera"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/opr\/|opios/i],
  describe: function describe27(ua2) {
    var browser = {
      name: "Opera"
    };
    var version = Utils.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/SamsungBrowser/i],
  describe: function describe28(ua2) {
    var browser = {
      name: "Samsung Internet for Android"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/Whale/i],
  describe: function describe29(ua2) {
    var browser = {
      name: "NAVER Whale Browser"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/PaleMoon/i],
  describe: function describe30(ua2) {
    var browser = {
      name: "Pale Moon"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:PaleMoon)[\s/](\d+(?:\.\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/HeyTapBrowser/i],
  describe: function describe31(ua2) {
    var browser = {
      name: "HeyTap Browser"
    };
    var version = Utils.getFirstMatch(/(?:HeyTapBrowser)[\s/](\d+(?:\.\d+)*)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/VivoBrowser/i],
  describe: function describe32(ua2) {
    var browser = {
      name: "Vivo Browser"
    };
    var version = Utils.getFirstMatch(/(?:VivoBrowser)[\s/](\d+(?:\.\d+)*)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/MZBrowser/i],
  describe: function describe33(ua2) {
    var browser = {
      name: "MZ Browser"
    };
    var version = Utils.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/focus/i],
  describe: function describe34(ua2) {
    var browser = {
      name: "Focus"
    };
    var version = Utils.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/swing/i],
  describe: function describe35(ua2) {
    var browser = {
      name: "Swing"
    };
    var version = Utils.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/coast/i],
  describe: function describe36(ua2) {
    var browser = {
      name: "Opera Coast"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/opt\/\d+(?:.?_?\d+)+/i],
  describe: function describe37(ua2) {
    var browser = {
      name: "Opera Touch"
    };
    var version = Utils.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/yabrowser/i],
  describe: function describe38(ua2) {
    var browser = {
      name: "Yandex Browser"
    };
    var version = Utils.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/ucbrowser/i],
  describe: function describe39(ua2) {
    var browser = {
      name: "UC Browser"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/Maxthon|mxios/i],
  describe: function describe40(ua2) {
    var browser = {
      name: "Maxthon"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/epiphany/i],
  describe: function describe41(ua2) {
    var browser = {
      name: "Epiphany"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/puffin/i],
  describe: function describe42(ua2) {
    var browser = {
      name: "Puffin"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/sleipnir/i],
  describe: function describe43(ua2) {
    var browser = {
      name: "Sleipnir"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/k-meleon/i],
  describe: function describe44(ua2) {
    var browser = {
      name: "K-Meleon"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/micromessenger/i],
  describe: function describe45(ua2) {
    var browser = {
      name: "WeChat"
    };
    var version = Utils.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/qqbrowser/i],
  describe: function describe46(ua2) {
    var browser = {
      name: /qqbrowserlite/i.test(ua2) ? "QQ Browser Lite" : "QQ Browser"
    };
    var version = Utils.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/msie|trident/i],
  describe: function describe47(ua2) {
    var browser = {
      name: "Internet Explorer"
    };
    var version = Utils.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/\sedg\//i],
  describe: function describe48(ua2) {
    var browser = {
      name: "Microsoft Edge"
    };
    var version = Utils.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/edg([ea]|ios)\//i],
  describe: function describe49(ua2) {
    var browser = {
      name: "Microsoft Edge"
    };
    var version = Utils.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: function test(parser) {
    if (parser.hasBrand("Vivaldi")) return true;
    return parser.test(/vivaldi/i);
  },
  describe: function describe50(ua2, parser) {
    var browser = {
      name: "Vivaldi"
    };
    if (parser) {
      var hintsVersion = parser.getBrandVersion("Vivaldi");
      if (hintsVersion) {
        browser.version = hintsVersion;
        return browser;
      }
    }
    var version = Utils.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/seamonkey/i],
  describe: function describe51(ua2) {
    var browser = {
      name: "SeaMonkey"
    };
    var version = Utils.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/sailfish/i],
  describe: function describe52(ua2) {
    var browser = {
      name: "Sailfish"
    };
    var version = Utils.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/silk/i],
  describe: function describe53(ua2) {
    var browser = {
      name: "Amazon Silk"
    };
    var version = Utils.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/phantom/i],
  describe: function describe54(ua2) {
    var browser = {
      name: "PhantomJS"
    };
    var version = Utils.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/slimerjs/i],
  describe: function describe55(ua2) {
    var browser = {
      name: "SlimerJS"
    };
    var version = Utils.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
  describe: function describe56(ua2) {
    var browser = {
      name: "BlackBerry"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/(web|hpw)[o0]s/i],
  describe: function describe57(ua2) {
    var browser = {
      name: "WebOS Browser"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2) || Utils.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/bada/i],
  describe: function describe58(ua2) {
    var browser = {
      name: "Bada"
    };
    var version = Utils.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/tizen/i],
  describe: function describe59(ua2) {
    var browser = {
      name: "Tizen"
    };
    var version = Utils.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/qupzilla/i],
  describe: function describe60(ua2) {
    var browser = {
      name: "QupZilla"
    };
    var version = Utils.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/librewolf/i],
  describe: function describe61(ua2) {
    var browser = {
      name: "LibreWolf"
    };
    var version = Utils.getFirstMatch(/(?:librewolf)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/firefox|iceweasel|fxios/i],
  describe: function describe62(ua2) {
    var browser = {
      name: "Firefox"
    };
    var version = Utils.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/electron/i],
  describe: function describe63(ua2) {
    var browser = {
      name: "Electron"
    };
    var version = Utils.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/sogoumobilebrowser/i, /metasr/i, /se 2\.[x]/i],
  describe: function describe64(ua2) {
    var browser = {
      name: "Sogou Browser"
    };
    var sogouMobileVersion = Utils.getFirstMatch(/(?:sogoumobilebrowser)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    var chromiumVersion = Utils.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua2);
    var seVersion = Utils.getFirstMatch(/se ([\d.]+)x/i, ua2);
    var version = sogouMobileVersion || chromiumVersion || seVersion;
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/MiuiBrowser/i],
  describe: function describe65(ua2) {
    var browser = {
      name: "Miui"
    };
    var version = Utils.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: function test2(parser) {
    if (parser.hasBrand("DuckDuckGo")) return true;
    return parser.test(/\sDdg\/[\d.]+$/i);
  },
  describe: function describe66(ua2, parser) {
    var browser = {
      name: "DuckDuckGo"
    };
    if (parser) {
      var hintsVersion = parser.getBrandVersion("DuckDuckGo");
      if (hintsVersion) {
        browser.version = hintsVersion;
        return browser;
      }
    }
    var uaVersion = Utils.getFirstMatch(/\sDdg\/([\d.]+)$/i, ua2);
    if (uaVersion) browser.version = uaVersion;
    return browser;
  }
}, {
  test: function test3(parser) {
    return parser.hasBrand("Brave");
  },
  describe: function describe67(ua2, parser) {
    var browser = {
      name: "Brave"
    };
    if (parser) {
      var hintsVersion = parser.getBrandVersion("Brave");
      if (hintsVersion) {
        browser.version = hintsVersion;
        return browser;
      }
    }
    return browser;
  }
}, {
  test: [/chromium/i],
  describe: function describe68(ua2) {
    var browser = {
      name: "Chromium"
    };
    var version = Utils.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, ua2) || Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/ladybird/i],
  describe: function describe69(ua2) {
    var browser = {
      name: "Ladybird"
    };
    var version = Utils.getFirstMatch(/ladybird\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/chrome|crios|crmo/i],
  describe: function describe70(ua2) {
    var browser = {
      name: "Chrome"
    };
    var version = Utils.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/GSA/i],
  describe: function describe71(ua2) {
    var browser = {
      name: "Google Search"
    };
    var version = Utils.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: function test4(parser) {
    var notLikeAndroid = !parser.test(/like android/i);
    var butAndroid = parser.test(/android/i);
    return notLikeAndroid && butAndroid;
  },
  describe: function describe72(ua2) {
    var browser = {
      name: "Android Browser"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/playstation 4/i],
  describe: function describe73(ua2) {
    var browser = {
      name: "PlayStation 4"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/safari|applewebkit/i],
  describe: function describe74(ua2) {
    var browser = {
      name: "Safari"
    };
    var version = Utils.getFirstMatch(commonVersionIdentifier, ua2);
    if (version) browser.version = version;
    return browser;
  }
}, {
  test: [/.*/i],
  describe: function describe75(ua2) {
    var regexp = ua2.search("\\(") !== -1 ? /^(.*)\/([^/]*)[ \t]\((.*)/ : /^(.*)\/([^/]*) /;
    return {
      name: Utils.getFirstMatch(regexp, ua2),
      version: Utils.getSecondMatch(regexp, ua2)
    };
  }
}];
var parser_os_default = [{
  test: [/Roku\/DVP/],
  describe: function describe76(ua2) {
    var version = Utils.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, ua2);
    return {
      name: OS_MAP.Roku,
      version
    };
  }
}, {
  test: [/windows phone/i],
  describe: function describe77(ua2) {
    var version = Utils.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, ua2);
    return {
      name: OS_MAP.WindowsPhone,
      version
    };
  }
}, {
  test: [/windows /i],
  describe: function describe78(ua2) {
    var version = Utils.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, ua2);
    var versionName = Utils.getWindowsVersionName(version);
    return {
      name: OS_MAP.Windows,
      version,
      versionName
    };
  }
}, {
  test: function test5(parser) {
    return Utils.isFirefoxOnIpad(parser.getUA());
  },
  describe: function describe79(ua2) {
    var result = {
      name: OS_MAP.iOS
    };
    var version = Utils.getSecondMatch(/(Version\/)(\d[\d.]+)/, ua2);
    if (version) result.version = version;
    return result;
  }
}, {
  test: [/macintosh/i],
  describe: function describe80(ua2) {
    var version = Utils.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, ua2).replace(/[_\s]/g, ".");
    var versionName = Utils.getMacOSVersionName(version);
    var os2 = {
      name: OS_MAP.MacOS,
      version
    };
    if (versionName) os2.versionName = versionName;
    return os2;
  }
}, {
  test: [/(ipod|iphone|ipad)/i],
  describe: function describe81(ua2) {
    var version = Utils.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, ua2).replace(/[_\s]/g, ".");
    return {
      name: OS_MAP.iOS,
      version
    };
  }
}, {
  test: [/OpenHarmony/i],
  describe: function describe82(ua2) {
    var version = Utils.getFirstMatch(/OpenHarmony\s+(\d+(\.\d+)*)/i, ua2);
    return {
      name: OS_MAP.HarmonyOS,
      version
    };
  }
}, {
  test: function test6(parser) {
    var notLikeAndroid = !parser.test(/like android/i);
    var butAndroid = parser.test(/android/i);
    return notLikeAndroid && butAndroid;
  },
  describe: function describe83(ua2) {
    var version = Utils.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, ua2);
    var versionName = Utils.getAndroidVersionName(version);
    var os2 = {
      name: OS_MAP.Android,
      version
    };
    if (versionName) os2.versionName = versionName;
    return os2;
  }
}, {
  test: [/(web|hpw)[o0]s/i],
  describe: function describe84(ua2) {
    var version = Utils.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, ua2);
    var os2 = {
      name: OS_MAP.WebOS
    };
    if (version && version.length) os2.version = version;
    return os2;
  }
}, {
  test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
  describe: function describe85(ua2) {
    var version = Utils.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, ua2) || Utils.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, ua2) || Utils.getFirstMatch(/\bbb(\d+)/i, ua2);
    return {
      name: OS_MAP.BlackBerry,
      version
    };
  }
}, {
  test: [/bada/i],
  describe: function describe86(ua2) {
    var version = Utils.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, ua2);
    return {
      name: OS_MAP.Bada,
      version
    };
  }
}, {
  test: [/tizen/i],
  describe: function describe87(ua2) {
    var version = Utils.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, ua2);
    return {
      name: OS_MAP.Tizen,
      version
    };
  }
}, {
  test: [/linux/i],
  describe: function describe88() {
    return {
      name: OS_MAP.Linux
    };
  }
}, {
  test: [/CrOS/],
  describe: function describe89() {
    return {
      name: OS_MAP.ChromeOS
    };
  }
}, {
  test: [/PlayStation 4/],
  describe: function describe90(ua2) {
    var version = Utils.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, ua2);
    return {
      name: OS_MAP.PlayStation4,
      version
    };
  }
}];
var parser_platforms_default = [{
  test: [/googlebot/i],
  describe: function describe91() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Google"
    };
  }
}, {
  test: [/linespider/i],
  describe: function describe92() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Line"
    };
  }
}, {
  test: [/amazonbot/i],
  describe: function describe93() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Amazon"
    };
  }
}, {
  test: [/gptbot/i],
  describe: function describe94() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "OpenAI"
    };
  }
}, {
  test: [/chatgpt-user/i],
  describe: function describe95() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "OpenAI"
    };
  }
}, {
  test: [/oai-searchbot/i],
  describe: function describe96() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "OpenAI"
    };
  }
}, {
  test: [/baiduspider/i],
  describe: function describe97() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Baidu"
    };
  }
}, {
  test: [/bingbot/i],
  describe: function describe98() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Bing"
    };
  }
}, {
  test: [/duckduckbot/i],
  describe: function describe99() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "DuckDuckGo"
    };
  }
}, {
  test: [/claudebot/i, /claude-web/i, /claude-user/i, /claude-searchbot/i],
  describe: function describe100() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Anthropic"
    };
  }
}, {
  test: [/omgilibot/i, /webzio-extended/i],
  describe: function describe101() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Webz.io"
    };
  }
}, {
  test: [/diffbot/i],
  describe: function describe102() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Diffbot"
    };
  }
}, {
  test: [/perplexitybot/i],
  describe: function describe103() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Perplexity AI"
    };
  }
}, {
  test: [/perplexity-user/i],
  describe: function describe104() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Perplexity AI"
    };
  }
}, {
  test: [/youbot/i],
  describe: function describe105() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "You.com"
    };
  }
}, {
  test: [/ia_archiver/i],
  describe: function describe106() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Internet Archive"
    };
  }
}, {
  test: [/meta-webindexer/i],
  describe: function describe107() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Meta"
    };
  }
}, {
  test: [/meta-externalads/i],
  describe: function describe108() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Meta"
    };
  }
}, {
  test: [/meta-externalagent/i],
  describe: function describe109() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Meta"
    };
  }
}, {
  test: [/meta-externalfetcher/i],
  describe: function describe110() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Meta"
    };
  }
}, {
  test: [/facebookexternalhit/i, /facebookcatalog/i],
  describe: function describe111() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Meta"
    };
  }
}, {
  test: [/slackbot/i, /slack-imgProxy/i],
  describe: function describe112() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Slack"
    };
  }
}, {
  test: [/yahoo/i],
  describe: function describe113() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Yahoo"
    };
  }
}, {
  test: [/yandexbot/i, /yandexmobilebot/i],
  describe: function describe114() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Yandex"
    };
  }
}, {
  test: [/pingdom/i],
  describe: function describe115() {
    return {
      type: PLATFORMS_MAP.bot,
      vendor: "Pingdom"
    };
  }
}, {
  test: [/huawei/i],
  describe: function describe116(ua2) {
    var model = Utils.getFirstMatch(/(can-l01)/i, ua2) && "Nova";
    var platform = {
      type: PLATFORMS_MAP.mobile,
      vendor: "Huawei"
    };
    if (model) platform.model = model;
    return platform;
  }
}, {
  test: [/nexus\s*(?:7|8|9|10).*/i],
  describe: function describe117() {
    return {
      type: PLATFORMS_MAP.tablet,
      vendor: "Nexus"
    };
  }
}, {
  test: [/ipad/i],
  describe: function describe118() {
    return {
      type: PLATFORMS_MAP.tablet,
      vendor: "Apple",
      model: "iPad"
    };
  }
}, {
  test: function test7(parser) {
    return Utils.isFirefoxOnIpad(parser.getUA());
  },
  describe: function describe119() {
    return {
      type: PLATFORMS_MAP.tablet,
      vendor: "Apple",
      model: "iPad"
    };
  }
}, {
  test: [/kftt build/i],
  describe: function describe120() {
    return {
      type: PLATFORMS_MAP.tablet,
      vendor: "Amazon",
      model: "Kindle Fire HD 7"
    };
  }
}, {
  test: [/silk/i],
  describe: function describe121() {
    return {
      type: PLATFORMS_MAP.tablet,
      vendor: "Amazon"
    };
  }
}, {
  test: [/tablet(?! pc)/i],
  describe: function describe122() {
    return {
      type: PLATFORMS_MAP.tablet
    };
  }
}, {
  test: function test8(parser) {
    var iDevice = parser.test(/ipod|iphone/i);
    var likeIDevice = parser.test(/like (ipod|iphone)/i);
    return iDevice && !likeIDevice;
  },
  describe: function describe123(ua2) {
    var model = Utils.getFirstMatch(/(ipod|iphone)/i, ua2);
    return {
      type: PLATFORMS_MAP.mobile,
      vendor: "Apple",
      model
    };
  }
}, {
  test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
  describe: function describe124() {
    return {
      type: PLATFORMS_MAP.mobile,
      vendor: "Nexus"
    };
  }
}, {
  test: [/Nokia/i],
  describe: function describe125(ua2) {
    var model = Utils.getFirstMatch(/Nokia\s+([0-9]+(\.[0-9]+)?)/i, ua2);
    var platform = {
      type: PLATFORMS_MAP.mobile,
      vendor: "Nokia"
    };
    if (model) platform.model = model;
    return platform;
  }
}, {
  test: [/[^-]mobi/i],
  describe: function describe126() {
    return {
      type: PLATFORMS_MAP.mobile
    };
  }
}, {
  test: function test9(parser) {
    return parser.getBrowserName(true) === "blackberry";
  },
  describe: function describe127() {
    return {
      type: PLATFORMS_MAP.mobile,
      vendor: "BlackBerry"
    };
  }
}, {
  test: function test10(parser) {
    return parser.getBrowserName(true) === "bada";
  },
  describe: function describe128() {
    return {
      type: PLATFORMS_MAP.mobile
    };
  }
}, {
  test: function test11(parser) {
    return parser.getBrowserName() === "windows phone";
  },
  describe: function describe129() {
    return {
      type: PLATFORMS_MAP.mobile,
      vendor: "Microsoft"
    };
  }
}, {
  test: function test12(parser) {
    var osMajorVersion = Number(String(parser.getOSVersion()).split(".")[0]);
    return parser.getOSName(true) === "android" && osMajorVersion >= 3;
  },
  describe: function describe130() {
    return {
      type: PLATFORMS_MAP.tablet
    };
  }
}, {
  test: function test13(parser) {
    return parser.getOSName(true) === "android";
  },
  describe: function describe131() {
    return {
      type: PLATFORMS_MAP.mobile
    };
  }
}, {
  test: [/smart-?tv|smarttv/i],
  describe: function describe132() {
    return {
      type: PLATFORMS_MAP.tv
    };
  }
}, {
  test: [/netcast/i],
  describe: function describe133() {
    return {
      type: PLATFORMS_MAP.tv
    };
  }
}, {
  test: function test14(parser) {
    return parser.getOSName(true) === "macos";
  },
  describe: function describe134() {
    return {
      type: PLATFORMS_MAP.desktop,
      vendor: "Apple"
    };
  }
}, {
  test: function test15(parser) {
    return parser.getOSName(true) === "windows";
  },
  describe: function describe135() {
    return {
      type: PLATFORMS_MAP.desktop
    };
  }
}, {
  test: function test16(parser) {
    return parser.getOSName(true) === "linux";
  },
  describe: function describe136() {
    return {
      type: PLATFORMS_MAP.desktop
    };
  }
}, {
  test: function test17(parser) {
    return parser.getOSName(true) === "playstation 4";
  },
  describe: function describe137() {
    return {
      type: PLATFORMS_MAP.tv
    };
  }
}, {
  test: function test18(parser) {
    return parser.getOSName(true) === "roku";
  },
  describe: function describe138() {
    return {
      type: PLATFORMS_MAP.tv
    };
  }
}];
var parser_engines_default = [{
  test: function test19(parser) {
    return parser.getBrowserName(true) === "microsoft edge";
  },
  describe: function describe139(ua2) {
    if (/\sedg\//i.test(ua2)) return {
      name: ENGINE_MAP.Blink
    };
    var version = Utils.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, ua2);
    return {
      name: ENGINE_MAP.EdgeHTML,
      version
    };
  }
}, {
  test: function test20(parser) {
    return parser.getBrowserName(true) === "ladybird";
  },
  describe: function describe140() {
    return {
      name: ENGINE_MAP.LibWeb
    };
  }
}, {
  test: [/trident/i],
  describe: function describe141(ua2) {
    var engine = {
      name: ENGINE_MAP.Trident
    };
    var version = Utils.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) engine.version = version;
    return engine;
  }
}, {
  test: function test21(parser) {
    return parser.test(/presto/i);
  },
  describe: function describe142(ua2) {
    var engine = {
      name: ENGINE_MAP.Presto
    };
    var version = Utils.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) engine.version = version;
    return engine;
  }
}, {
  test: function test22(parser) {
    var isGecko = parser.test(/gecko/i);
    var likeGecko = parser.test(/like gecko/i);
    return isGecko && !likeGecko;
  },
  describe: function describe143(ua2) {
    var engine = {
      name: ENGINE_MAP.Gecko
    };
    var version = Utils.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) engine.version = version;
    return engine;
  }
}, {
  test: [/(apple)?webkit\/537\.36/i],
  describe: function describe144() {
    return {
      name: ENGINE_MAP.Blink
    };
  }
}, {
  test: [/(apple)?webkit/i],
  describe: function describe145(ua2) {
    var engine = {
      name: ENGINE_MAP.WebKit
    };
    var version = Utils.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, ua2);
    if (version) engine.version = version;
    return engine;
  }
}];
var Parser = /* @__PURE__ */ (function() {
  function Parser2(UA, skipParsingOrHints, clientHints) {
    if (skipParsingOrHints === void 0) skipParsingOrHints = false;
    if (clientHints === void 0) clientHints = null;
    if (UA === void 0 || UA === null || UA === "") throw new Error("UserAgent parameter can't be empty");
    this._ua = UA;
    var skipParsing = false;
    if (typeof skipParsingOrHints === "boolean") {
      skipParsing = skipParsingOrHints;
      this._hints = clientHints;
    } else if (skipParsingOrHints != null && typeof skipParsingOrHints === "object") this._hints = skipParsingOrHints;
    else this._hints = null;
    this.parsedResult = {};
    if (skipParsing !== true) this.parse();
  }
  var _proto = Parser2.prototype;
  _proto.getHints = function getHints() {
    return this._hints;
  };
  _proto.hasBrand = function hasBrand(brandName) {
    if (!this._hints || !Array.isArray(this._hints.brands)) return false;
    var brandLower = brandName.toLowerCase();
    return this._hints.brands.some(function(b2) {
      return b2.brand && b2.brand.toLowerCase() === brandLower;
    });
  };
  _proto.getBrandVersion = function getBrandVersion(brandName) {
    if (!this._hints || !Array.isArray(this._hints.brands)) return;
    var brandLower = brandName.toLowerCase();
    var brand = Utils.find(this._hints.brands, function(b2) {
      return b2.brand && b2.brand.toLowerCase() === brandLower;
    });
    return brand ? brand.version : void 0;
  };
  _proto.getUA = function getUA() {
    return this._ua;
  };
  _proto.test = function test23(regex) {
    return regex.test(this._ua);
  };
  _proto.parseBrowser = function parseBrowser() {
    var _this = this;
    this.parsedResult.browser = {};
    var browserDescriptor = Utils.find(browsersList, function(_browser) {
      if (typeof _browser.test === "function") return _browser.test(_this);
      if (Array.isArray(_browser.test)) return _browser.test.some(function(condition) {
        return _this.test(condition);
      });
      throw new Error("Browser's test function is not valid");
    });
    if (browserDescriptor) this.parsedResult.browser = browserDescriptor.describe(this.getUA(), this);
    return this.parsedResult.browser;
  };
  _proto.getBrowser = function getBrowser() {
    if (this.parsedResult.browser) return this.parsedResult.browser;
    return this.parseBrowser();
  };
  _proto.getBrowserName = function getBrowserName(toLowerCase) {
    if (toLowerCase) return String(this.getBrowser().name).toLowerCase() || "";
    return this.getBrowser().name || "";
  };
  _proto.getBrowserVersion = function getBrowserVersion() {
    return this.getBrowser().version;
  };
  _proto.getOS = function getOS() {
    if (this.parsedResult.os) return this.parsedResult.os;
    return this.parseOS();
  };
  _proto.parseOS = function parseOS() {
    var _this2 = this;
    this.parsedResult.os = {};
    var os2 = Utils.find(parser_os_default, function(_os) {
      if (typeof _os.test === "function") return _os.test(_this2);
      if (Array.isArray(_os.test)) return _os.test.some(function(condition) {
        return _this2.test(condition);
      });
      throw new Error("Browser's test function is not valid");
    });
    if (os2) this.parsedResult.os = os2.describe(this.getUA());
    return this.parsedResult.os;
  };
  _proto.getOSName = function getOSName(toLowerCase) {
    var name = this.getOS().name;
    if (toLowerCase) return String(name).toLowerCase() || "";
    return name || "";
  };
  _proto.getOSVersion = function getOSVersion() {
    return this.getOS().version;
  };
  _proto.getPlatform = function getPlatform() {
    if (this.parsedResult.platform) return this.parsedResult.platform;
    return this.parsePlatform();
  };
  _proto.getPlatformType = function getPlatformType(toLowerCase) {
    if (toLowerCase === void 0) toLowerCase = false;
    var type = this.getPlatform().type;
    if (toLowerCase) return String(type).toLowerCase() || "";
    return type || "";
  };
  _proto.parsePlatform = function parsePlatform() {
    var _this3 = this;
    this.parsedResult.platform = {};
    var platform = Utils.find(parser_platforms_default, function(_platform) {
      if (typeof _platform.test === "function") return _platform.test(_this3);
      if (Array.isArray(_platform.test)) return _platform.test.some(function(condition) {
        return _this3.test(condition);
      });
      throw new Error("Browser's test function is not valid");
    });
    if (platform) this.parsedResult.platform = platform.describe(this.getUA());
    return this.parsedResult.platform;
  };
  _proto.getEngine = function getEngine() {
    if (this.parsedResult.engine) return this.parsedResult.engine;
    return this.parseEngine();
  };
  _proto.getEngineName = function getEngineName(toLowerCase) {
    if (toLowerCase) return String(this.getEngine().name).toLowerCase() || "";
    return this.getEngine().name || "";
  };
  _proto.parseEngine = function parseEngine() {
    var _this4 = this;
    this.parsedResult.engine = {};
    var engine = Utils.find(parser_engines_default, function(_engine) {
      if (typeof _engine.test === "function") return _engine.test(_this4);
      if (Array.isArray(_engine.test)) return _engine.test.some(function(condition) {
        return _this4.test(condition);
      });
      throw new Error("Browser's test function is not valid");
    });
    if (engine) this.parsedResult.engine = engine.describe(this.getUA());
    return this.parsedResult.engine;
  };
  _proto.parse = function parse2() {
    this.parseBrowser();
    this.parseOS();
    this.parsePlatform();
    this.parseEngine();
    return this;
  };
  _proto.getResult = function getResult() {
    return Utils.assign({}, this.parsedResult);
  };
  _proto.satisfies = function satisfies(checkTree) {
    var _this5 = this;
    var platformsAndOSes = {};
    var platformsAndOSCounter = 0;
    var browsers = {};
    var browsersCounter = 0;
    Object.keys(checkTree).forEach(function(key) {
      var currentDefinition = checkTree[key];
      if (typeof currentDefinition === "string" || Array.isArray(currentDefinition)) {
        browsers[key] = currentDefinition;
        browsersCounter += 1;
      } else if (typeof currentDefinition === "object") {
        platformsAndOSes[key] = currentDefinition;
        platformsAndOSCounter += 1;
      }
    });
    if (platformsAndOSCounter > 0) {
      var platformsAndOSNames = Object.keys(platformsAndOSes);
      var OSMatchingDefinition = Utils.find(platformsAndOSNames, function(name) {
        return _this5.isOS(name);
      });
      if (OSMatchingDefinition) {
        var osResult = this.satisfies(platformsAndOSes[OSMatchingDefinition]);
        if (osResult !== void 0) return osResult;
      }
      var platformMatchingDefinition = Utils.find(platformsAndOSNames, function(name) {
        return _this5.isPlatform(name);
      });
      if (platformMatchingDefinition) {
        var platformResult = this.satisfies(platformsAndOSes[platformMatchingDefinition]);
        if (platformResult !== void 0) return platformResult;
      }
    }
    if (browsersCounter > 0) {
      var browserNames = Object.keys(browsers);
      var matchingDefinition = Utils.find(browserNames, function(name) {
        return _this5.isBrowser(name, true);
      });
      if (matchingDefinition !== void 0) return this.compareVersions(browsers[matchingDefinition]);
    }
  };
  _proto.isBrowser = function isBrowser(browserName, includingAlias) {
    if (includingAlias === void 0) includingAlias = false;
    var defaultBrowserName = this.getBrowserName().toLowerCase();
    var browserNameLower = browserName.toLowerCase();
    var alias = Utils.getBrowserTypeByAlias(browserNameLower);
    if (includingAlias && alias) browserNameLower = alias.toLowerCase();
    return browserNameLower === defaultBrowserName;
  };
  _proto.compareVersions = function compareVersions(versionsOrVersion) {
    var _this6 = this;
    if (typeof versionsOrVersion === "string") return this.compareVersion(versionsOrVersion);
    return versionsOrVersion.some(function(version) {
      return _this6.compareVersion(version);
    });
  };
  _proto.compareVersion = function compareVersion(version) {
    var expectedResults = [0];
    var comparableVersion = version;
    var isLoose = false;
    var currentBrowserVersion = this.getBrowserVersion();
    if (typeof currentBrowserVersion !== "string") return;
    if (version[0] === ">" || version[0] === "<") {
      comparableVersion = version.substr(1);
      if (version[1] === "=") {
        isLoose = true;
        comparableVersion = version.substr(2);
      } else expectedResults = [];
      if (version[0] === ">") expectedResults.push(1);
      else expectedResults.push(-1);
    } else if (version[0] === "=") comparableVersion = version.substr(1);
    else if (version[0] === "~") {
      isLoose = true;
      comparableVersion = version.substr(1);
    }
    return expectedResults.indexOf(Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose)) > -1;
  };
  _proto.isOS = function isOS(osName) {
    return this.getOSName(true) === String(osName).toLowerCase();
  };
  _proto.isPlatform = function isPlatform(platformType) {
    return this.getPlatformType(true) === String(platformType).toLowerCase();
  };
  _proto.isEngine = function isEngine(engineName) {
    return this.getEngineName(true) === String(engineName).toLowerCase();
  };
  _proto.is = function is2(anything, includingAlias) {
    if (includingAlias === void 0) includingAlias = false;
    return this.isBrowser(anything, includingAlias) || this.isOS(anything) || this.isPlatform(anything);
  };
  _proto.some = function some(anythings) {
    var _this7 = this;
    if (anythings === void 0) anythings = [];
    return anythings.some(function(anything) {
      return _this7.is(anything);
    });
  };
  return Parser2;
})();
function _defineProperties(e2, r2) {
  for (var t2 = 0; t2 < r2.length; t2++) {
    var o2 = r2[t2];
    o2.enumerable = o2.enumerable || false, o2.configurable = true, "value" in o2 && (o2.writable = true), Object.defineProperty(e2, _toPropertyKey(o2.key), o2);
  }
}
function _createClass(e2, r2, t2) {
  return r2 && _defineProperties(e2.prototype, r2), t2 && _defineProperties(e2, t2), Object.defineProperty(e2, "prototype", {
    writable: false
  }), e2;
}
function _toPropertyKey(t2) {
  var i2 = _toPrimitive(t2, "string");
  return "symbol" == typeof i2 ? i2 : i2 + "";
}
function _toPrimitive(t2, r2) {
  if ("object" != typeof t2 || !t2) return t2;
  var e2 = t2[Symbol.toPrimitive];
  if (void 0 !== e2) {
    var i2 = e2.call(t2, r2 || "default");
    if ("object" != typeof i2) return i2;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r2 ? String : Number)(t2);
}
var Bowser = /* @__PURE__ */ (function() {
  function Bowser2() {
  }
  Bowser2.getParser = function getParser2(UA, skipParsingOrHints, clientHints) {
    if (skipParsingOrHints === void 0) skipParsingOrHints = false;
    if (clientHints === void 0) clientHints = null;
    if (typeof UA !== "string") throw new Error("UserAgent should be a string");
    return new Parser(UA, skipParsingOrHints, clientHints);
  };
  Bowser2.parse = function parse2(UA, clientHints) {
    if (clientHints === void 0) clientHints = null;
    return new Parser(UA, clientHints).getResult();
  };
  return _createClass(Bowser2, null, [{
    key: "BROWSER_MAP",
    get: function get() {
      return BROWSER_MAP;
    }
  }, {
    key: "ENGINE_MAP",
    get: function get() {
      return ENGINE_MAP;
    }
  }, {
    key: "OS_MAP",
    get: function get() {
      return OS_MAP;
    }
  }, {
    key: "PLATFORMS_MAP",
    get: function get() {
      return PLATFORMS_MAP;
    }
  }]);
})();
var parse = Bowser.parse;
var getParser = Bowser.getParser;

// node_modules/@pipecat-ai/client-js/dist/index.module.js
function $parcel$exportWildcard(dest, source) {
  Object.keys(source).forEach(function(key) {
    if (key === "default" || key === "__esModule" || Object.prototype.hasOwnProperty.call(dest, key)) {
      return;
    }
    Object.defineProperty(dest, key, {
      enumerable: true,
      get: function get() {
        return source[key];
      }
    });
  });
  return dest;
}
function $parcel$export(e2, n2, v2, s2) {
  Object.defineProperty(e2, n2, { get: v2, set: s2, enumerable: true, configurable: true });
}
function $parcel$interopDefault(a2) {
  return a2 && a2.__esModule ? a2.default : a2;
}
var $05fa7b586184a19c$exports = {};
var $4a4f32f44a93ea38$exports = {};
$parcel$export($4a4f32f44a93ea38$exports, "A11ySnapshotStreamer", () => $4a4f32f44a93ea38$export$d1b25383c8328718);
var $490ce42ff92ff39b$var$MAX_DEPTH = 10;
var $490ce42ff92ff39b$var$MAX_NODES = 200;
var $490ce42ff92ff39b$var$MAX_CHILDREN_PER_NODE = 50;
var $490ce42ff92ff39b$var$NAME_MAX = 100;
var $490ce42ff92ff39b$var$MAX_SELECT_OPTIONS = 20;
var $490ce42ff92ff39b$var$SELECTION_TEXT_MAX = 2e3;
var $490ce42ff92ff39b$var$refMap = /* @__PURE__ */ new WeakMap();
var $490ce42ff92ff39b$var$WeakRefCtor = typeof WeakRef === "undefined" ? void 0 : WeakRef;
var $490ce42ff92ff39b$var$refToElement = /* @__PURE__ */ new Map();
var $490ce42ff92ff39b$var$refCounter = 0;
function $490ce42ff92ff39b$var$getRef(el) {
  const existing = $490ce42ff92ff39b$var$refMap.get(el);
  if (existing) return existing;
  const ref = `e${++$490ce42ff92ff39b$var$refCounter}`;
  $490ce42ff92ff39b$var$refMap.set(el, ref);
  $490ce42ff92ff39b$var$refToElement.set(ref, $490ce42ff92ff39b$var$WeakRefCtor ? new $490ce42ff92ff39b$var$WeakRefCtor(el) : el);
  return ref;
}
function $490ce42ff92ff39b$export$792dfd553abe8e9a(ref) {
  const entry = $490ce42ff92ff39b$var$refToElement.get(ref);
  if (!entry) return null;
  const el = "deref" in entry ? entry.deref() : entry;
  if (!el) {
    $490ce42ff92ff39b$var$refToElement.delete(ref);
    return null;
  }
  if (!el.isConnected) {
    $490ce42ff92ff39b$var$refToElement.delete(ref);
    return null;
  }
  return el;
}
function $490ce42ff92ff39b$export$5174ac1454ce16bc(el) {
  return $490ce42ff92ff39b$var$refMap.get(el) ?? null;
}
var $490ce42ff92ff39b$var$EXCLUDED_TAGS = /* @__PURE__ */ new Set([
  "script",
  "style",
  "link",
  "meta",
  "noscript",
  "template"
]);
function $490ce42ff92ff39b$var$isExcluded(el) {
  if ($490ce42ff92ff39b$var$EXCLUDED_TAGS.has(el.tagName.toLowerCase())) return true;
  if (el.getAttribute("aria-hidden") === "true") return true;
  if (el.hasAttribute("data-a11y-exclude")) return true;
  if (el.hidden) return true;
  if (el instanceof HTMLElement && el.offsetParent === null && el.tagName !== "BODY") {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return true;
  }
  return false;
}
var $490ce42ff92ff39b$var$INTERACTIVE_ROLES = /* @__PURE__ */ new Set([
  "button",
  "link",
  "checkbox",
  "radio",
  "textbox",
  "combobox",
  "switch",
  "menuitem",
  "tab"
]);
var $490ce42ff92ff39b$var$LEAF_ROLES = /* @__PURE__ */ new Set([
  ...$490ce42ff92ff39b$var$INTERACTIVE_ROLES,
  "heading",
  "img"
]);
function $490ce42ff92ff39b$var$hasAccessibleName(el) {
  if (el.hasAttribute("aria-label")) return true;
  if (el.hasAttribute("aria-labelledby")) return true;
  if ((el.textContent ?? "").trim().length > 0) return true;
  return false;
}
function $490ce42ff92ff39b$var$getRole(el) {
  const explicit = el.getAttribute("role");
  if (explicit) return explicit;
  const tag = el.tagName.toLowerCase();
  switch (tag) {
    case "main":
    case "nav":
    case "header":
    case "aside":
    case "footer":
      return tag;
    case "article":
    case "section":
      return $490ce42ff92ff39b$var$hasAccessibleName(el) ? "region" : null;
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return "heading";
    case "a":
      return el.hasAttribute("href") ? "link" : null;
    case "button":
      return "button";
    case "input": {
      const type = el.type;
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      if (type === "submit" || type === "button" || type === "reset") return "button";
      if (type === "hidden") return null;
      return "textbox";
    }
    case "select":
      return "combobox";
    case "textarea":
      return "textbox";
    case "label":
      return null;
    // consumed by its associated input
    case "img":
      return el.getAttribute("alt") !== null ? "img" : null;
    case "p":
      return "paragraph";
    case "ul":
    case "ol":
      return "list";
    case "li":
      return "listitem";
    case "table":
      return "table";
    case "tr":
      return "row";
    case "th":
      return "columnheader";
    case "td":
      return "cell";
    default:
      if (el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby") || el.hasAttribute("tabindex")) return "generic";
      return null;
  }
}
function $490ce42ff92ff39b$var$collapseWhitespace(s2) {
  return s2.replace(/\s+/g, " ").trim();
}
function $490ce42ff92ff39b$var$truncate(s2, max = $490ce42ff92ff39b$var$NAME_MAX) {
  const collapsed = $490ce42ff92ff39b$var$collapseWhitespace(s2);
  if (collapsed.length <= max) return collapsed;
  return collapsed.slice(0, max - 1) + "\u2026";
}
function $490ce42ff92ff39b$var$resolveLabelledBy(el) {
  const ids = el.getAttribute("aria-labelledby");
  if (!ids) return void 0;
  const parts = [];
  for (const id of ids.split(/\s+/)) {
    if (!id) continue;
    const target = el.ownerDocument.getElementById(id);
    if (target) parts.push($490ce42ff92ff39b$var$collectAccessibleText(target));
  }
  const joined = parts.filter(Boolean).join(" ");
  return joined || void 0;
}
function $490ce42ff92ff39b$var$collectAccessibleText(el) {
  const parts = [];
  for (let i2 = 0; i2 < el.childNodes.length; i2++) {
    const child = el.childNodes[i2];
    if (child.nodeType === 3) {
      const t2 = (child.textContent ?? "").trim();
      if (t2) parts.push(t2);
    } else if (child.nodeType === 1) {
      const childEl = child;
      if ($490ce42ff92ff39b$var$EXCLUDED_TAGS.has(childEl.tagName.toLowerCase())) continue;
      if (childEl.getAttribute("aria-hidden") === "true") continue;
      const sub = $490ce42ff92ff39b$var$collectAccessibleText(childEl);
      if (sub) parts.push(sub);
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
function $490ce42ff92ff39b$var$getName(el, role) {
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return $490ce42ff92ff39b$var$truncate(ariaLabel);
  const labelled = $490ce42ff92ff39b$var$resolveLabelledBy(el);
  if (labelled) return $490ce42ff92ff39b$var$truncate(labelled);
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") {
    const id = el.getAttribute("id");
    if (id) {
      const labels = el.ownerDocument.getElementsByTagName("label");
      for (let i2 = 0; i2 < labels.length; i2++) {
        if (labels[i2].htmlFor === id && labels[i2].textContent) return $490ce42ff92ff39b$var$truncate(labels[i2].textContent ?? "");
      }
    }
    const wrappingLabel = el.closest("label");
    if (wrappingLabel?.textContent) return $490ce42ff92ff39b$var$truncate(wrappingLabel.textContent);
    const placeholder = el.getAttribute("placeholder");
    if (placeholder) return $490ce42ff92ff39b$var$truncate(placeholder);
    return void 0;
  }
  if (tag === "img") {
    const alt = el.getAttribute("alt");
    return alt ? $490ce42ff92ff39b$var$truncate(alt) : void 0;
  }
  if ($490ce42ff92ff39b$var$LEAF_ROLES.has(role) || role === "paragraph") {
    const text = $490ce42ff92ff39b$var$collectAccessibleText(el);
    return text ? $490ce42ff92ff39b$var$truncate(text) : void 0;
  }
  return void 0;
}
function $490ce42ff92ff39b$var$getValue(el) {
  if (el instanceof HTMLInputElement) {
    if (el.type === "password") return void 0;
    if (el.type === "checkbox" || el.type === "radio" || el.type === "hidden") return void 0;
    return el.value || void 0;
  }
  if (el instanceof HTMLTextAreaElement) return el.value || void 0;
  if (el instanceof HTMLSelectElement) {
    const selected = el.selectedOptions[0];
    const text = selected?.text?.trim();
    if (text) return text;
    return el.value || void 0;
  }
  return void 0;
}
function $490ce42ff92ff39b$var$getState(el) {
  const state = [];
  if (el.ownerDocument.activeElement === el) state.push("focused");
  if (el.getAttribute("aria-expanded") === "true") state.push("expanded");
  if (el.getAttribute("aria-selected") === "true") state.push("selected");
  if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") state.push("disabled");
  const ariaChecked = el.getAttribute("aria-checked");
  if (ariaChecked === "true") state.push("checked");
  if (el instanceof HTMLInputElement) {
    if ((el.type === "checkbox" || el.type === "radio") && el.checked) {
      if (!state.includes("checked")) state.push("checked");
    }
  }
  return state;
}
function $490ce42ff92ff39b$var$isOffscreen(el) {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return true;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  if (rect.bottom <= 0) return true;
  if (rect.top >= viewportHeight) return true;
  if (rect.right <= 0) return true;
  if (rect.left >= viewportWidth) return true;
  return false;
}
function $490ce42ff92ff39b$var$getLevel(el, role) {
  if (role !== "heading") return void 0;
  const tag = el.tagName.toLowerCase();
  const m2 = tag.match(/^h([1-6])$/);
  if (m2) return parseInt(m2[1], 10);
  const aria = el.getAttribute("aria-level");
  if (aria) {
    const parsed = parseInt(aria, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return void 0;
}
function $490ce42ff92ff39b$var$getAriaIntAttr(el, name) {
  const raw = el.getAttribute(name);
  if (!raw) return void 0;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) return void 0;
  return parsed;
}
function $490ce42ff92ff39b$var$walk(el, depth, budget, opts, inheritSkipTextNodes = false) {
  if ($490ce42ff92ff39b$var$isExcluded(el)) return [];
  if (budget.count >= $490ce42ff92ff39b$var$MAX_NODES) return [];
  if (depth > $490ce42ff92ff39b$var$MAX_DEPTH) {
    budget.count++;
    return [
      {
        ref: $490ce42ff92ff39b$var$getRef(el),
        role: "ellipsis",
        name: "<truncated: max depth>"
      }
    ];
  }
  const role = $490ce42ff92ff39b$var$getRole(el);
  if (role === null)
    return $490ce42ff92ff39b$var$walkChildren(el, depth, budget, opts, {
      skipTextNodes: inheritSkipTextNodes
    });
  budget.count++;
  const node = {
    ref: $490ce42ff92ff39b$var$getRef(el),
    role
  };
  const name = $490ce42ff92ff39b$var$getName(el, role);
  if (name) node.name = name;
  const value = $490ce42ff92ff39b$var$getValue(el);
  if (value !== void 0) node.value = value;
  const state = $490ce42ff92ff39b$var$getState(el);
  if (opts.trackViewport && $490ce42ff92ff39b$var$isOffscreen(el)) state.push("offscreen");
  if (state.length) node.state = state;
  const level = $490ce42ff92ff39b$var$getLevel(el, role);
  if (level !== void 0) node.level = level;
  const colcount = $490ce42ff92ff39b$var$getAriaIntAttr(el, "aria-colcount");
  if (colcount !== void 0) node.colcount = colcount;
  const rowcount = $490ce42ff92ff39b$var$getAriaIntAttr(el, "aria-rowcount");
  if (rowcount !== void 0) node.rowcount = rowcount;
  if (!$490ce42ff92ff39b$var$LEAF_ROLES.has(role)) {
    const skipTextNodes = role === "paragraph";
    const children = $490ce42ff92ff39b$var$walkChildren(el, depth + 1, budget, opts, {
      skipTextNodes
    });
    if (children.length > 0) {
      if (children.length > $490ce42ff92ff39b$var$MAX_CHILDREN_PER_NODE) {
        const kept = children.slice(0, $490ce42ff92ff39b$var$MAX_CHILDREN_PER_NODE);
        kept.push({
          ref: `${node.ref}.more`,
          role: "ellipsis",
          name: `${children.length - $490ce42ff92ff39b$var$MAX_CHILDREN_PER_NODE} more`
        });
        node.children = kept;
      } else node.children = children;
    }
  } else if (el instanceof HTMLSelectElement) {
    const options = $490ce42ff92ff39b$var$collectSelectOptions(el, budget, node.ref);
    if (options.length > 0) node.children = options;
  }
  return [
    node
  ];
}
function $490ce42ff92ff39b$var$collectSelectOptions(select, budget, parentRef) {
  const out = [];
  const all = select.options;
  let emitted = 0;
  for (let i2 = 0; i2 < all.length; i2++) {
    if (budget.count >= $490ce42ff92ff39b$var$MAX_NODES) break;
    const opt = all[i2];
    if (opt.hidden) continue;
    if (opt.getAttribute("aria-hidden") === "true") continue;
    if (emitted >= $490ce42ff92ff39b$var$MAX_SELECT_OPTIONS) {
      budget.count++;
      out.push({
        ref: `${parentRef}.more`,
        role: "ellipsis",
        name: `${all.length - emitted} more`
      });
      break;
    }
    budget.count++;
    emitted++;
    const text = (opt.text || opt.value || "").trim();
    const optNode = {
      ref: $490ce42ff92ff39b$var$getRef(opt),
      role: "option",
      name: $490ce42ff92ff39b$var$truncate(text)
    };
    const state = [];
    if (opt.selected) state.push("selected");
    if (opt.disabled) state.push("disabled");
    if (state.length) optNode.state = state;
    out.push(optNode);
  }
  return out;
}
function $490ce42ff92ff39b$var$walkChildren(el, depth, budget, opts, childOpts = {}) {
  const out = [];
  for (let i2 = 0; i2 < el.childNodes.length; i2++) {
    const child = el.childNodes[i2];
    if (child.nodeType === 3) {
      if (childOpts.skipTextNodes) continue;
      const text = $490ce42ff92ff39b$var$collapseWhitespace(child.textContent ?? "");
      if (text) {
        if (budget.count >= $490ce42ff92ff39b$var$MAX_NODES) break;
        budget.count++;
        out.push({
          ref: "",
          role: "text",
          name: $490ce42ff92ff39b$var$truncate(text)
        });
      }
    } else if (child.nodeType === 1) {
      const nodes = $490ce42ff92ff39b$var$walk(child, depth, budget, opts, childOpts.skipTextNodes);
      for (const n2 of nodes) out.push(n2);
      if (budget.count >= $490ce42ff92ff39b$var$MAX_NODES) break;
    }
  }
  return out;
}
function $490ce42ff92ff39b$var$findRefBearingAncestor(start) {
  let el = start;
  while (el) {
    if (el.getAttribute("aria-hidden") === "true" || el.hasAttribute("data-a11y-exclude")) return null;
    if ($490ce42ff92ff39b$var$refMap.has(el)) return el;
    el = el.parentElement;
  }
  return null;
}
function $490ce42ff92ff39b$var$clampSelectionText(text) {
  if (text.length <= $490ce42ff92ff39b$var$SELECTION_TEXT_MAX) return text;
  return text.slice(0, $490ce42ff92ff39b$var$SELECTION_TEXT_MAX - 1) + "\u2026";
}
function $490ce42ff92ff39b$export$e702c6c416f7c8de() {
  if (typeof document === "undefined") return null;
  const active = document.activeElement;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    const start = active.selectionStart;
    const end = active.selectionEnd;
    if (start !== null && end !== null && start !== end) {
      const ref2 = $490ce42ff92ff39b$var$refMap.get(active);
      if (!ref2) return null;
      const text2 = active.value.slice(start, end);
      if (!text2) return null;
      return {
        ref: ref2,
        text: $490ce42ff92ff39b$var$clampSelectionText(text2),
        start_offset: start,
        end_offset: end
      };
    }
  }
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const text = sel.toString();
  if (!text) return null;
  const range = sel.getRangeAt(0);
  let common = range.commonAncestorContainer;
  while (common && common.nodeType !== 1) common = common.parentNode;
  const anchor = $490ce42ff92ff39b$var$findRefBearingAncestor(common);
  if (!anchor) return null;
  const ref = $490ce42ff92ff39b$var$refMap.get(anchor);
  if (!ref) return null;
  return {
    ref,
    text: $490ce42ff92ff39b$var$clampSelectionText(text)
  };
}
function $490ce42ff92ff39b$export$326b5f56ac5b6149(root, options = {}) {
  const el = root ?? (typeof document !== "undefined" ? document.body : null);
  if (!el) return {
    root: {
      ref: "e0",
      role: "generic"
    },
    captured_at: Date.now()
  };
  const opts = {
    trackViewport: options.trackViewport ?? true
  };
  const budget = {
    count: 0
  };
  const children = $490ce42ff92ff39b$var$walkChildren(el, 0, budget, opts);
  const selection = $490ce42ff92ff39b$export$e702c6c416f7c8de();
  return {
    root: {
      ref: $490ce42ff92ff39b$var$getRef(el),
      role: "generic",
      ...children.length > 0 ? {
        children
      } : {}
    },
    captured_at: Date.now(),
    ...selection ? {
      selection
    } : {}
  };
}
var $4a4f32f44a93ea38$export$d1b25383c8328718 = class {
  constructor(emitSnapshot, options = {}) {
    this.running = false;
    this.emitSnapshot = emitSnapshot;
    this.debounceMs = options.debounceMs ?? 300;
    this.trackViewport = options.trackViewport ?? true;
    this.logSnapshots = options.logSnapshots ?? false;
  }
  /**
   * Begin streaming. Safe to call multiple times; subsequent calls
   * are no-ops until `stop()` runs.
   */
  start() {
    if (this.running) return;
    if (typeof document === "undefined") return;
    this.running = true;
    this.schedule();
    this.observer = new MutationObserver(() => this.schedule());
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "role",
        "aria-label",
        "aria-labelledby",
        "aria-expanded",
        "aria-selected",
        "aria-checked",
        "aria-disabled",
        "aria-level",
        "aria-hidden",
        "aria-colcount",
        "aria-rowcount",
        "data-a11y-exclude",
        "disabled",
        "hidden",
        "tabindex",
        "href"
      ]
    });
    this.focusHandler = () => this.schedule();
    document.addEventListener("focusin", this.focusHandler);
    document.addEventListener("focusout", this.focusHandler);
    this.scrollEndHandler = () => this.schedule();
    window.addEventListener("scrollend", this.scrollEndHandler, {
      capture: true
    });
    this.resizeHandler = () => this.schedule();
    window.addEventListener("resize", this.resizeHandler);
    this.visibilityHandler = () => {
      if (document.visibilityState === "visible") this.schedule();
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);
    this.selectionHandler = () => this.schedule();
    document.addEventListener("selectionchange", this.selectionHandler);
    this.formHandler = () => this.schedule();
    document.addEventListener("input", this.formHandler, {
      capture: true
    });
    document.addEventListener("change", this.formHandler, {
      capture: true
    });
  }
  /** Stop streaming. Safe to call before `start()` or multiple times. */
  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.timer !== void 0) {
      clearTimeout(this.timer);
      this.timer = void 0;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = void 0;
    }
    if (typeof document !== "undefined") {
      if (this.focusHandler) {
        document.removeEventListener("focusin", this.focusHandler);
        document.removeEventListener("focusout", this.focusHandler);
      }
      if (this.visibilityHandler) document.removeEventListener("visibilitychange", this.visibilityHandler);
      if (this.selectionHandler) document.removeEventListener("selectionchange", this.selectionHandler);
      if (this.formHandler) {
        document.removeEventListener("input", this.formHandler, {
          capture: true
        });
        document.removeEventListener("change", this.formHandler, {
          capture: true
        });
      }
    }
    if (typeof window !== "undefined") {
      if (this.scrollEndHandler) window.removeEventListener("scrollend", this.scrollEndHandler, {
        capture: true
      });
      if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler);
    }
    this.focusHandler = void 0;
    this.scrollEndHandler = void 0;
    this.resizeHandler = void 0;
    this.visibilityHandler = void 0;
    this.selectionHandler = void 0;
    this.formHandler = void 0;
  }
  schedule() {
    if (!this.running) return;
    if (this.timer !== void 0) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.emit(), this.debounceMs);
  }
  emit() {
    this.timer = void 0;
    if (!this.running) return;
    try {
      const snapshot = (0, $490ce42ff92ff39b$export$326b5f56ac5b6149)(void 0, {
        trackViewport: this.trackViewport
      });
      this.emitSnapshot(snapshot);
      if (this.logSnapshots) {
        const nodeCount = $4a4f32f44a93ea38$var$countNodes(snapshot.root);
        const estTokens = Math.round(JSON.stringify(snapshot).length / 4);
        console.groupCollapsed(`[A11ySnapshotStreamer] emit: ${nodeCount} nodes, ~${estTokens} tokens`);
        console.log("snapshot:", snapshot);
        console.groupEnd();
      }
    } catch {
    }
  }
};
function $4a4f32f44a93ea38$var$countNodes(node) {
  let count = 1;
  const kids = node.children;
  if (kids) for (const child of kids) count += $4a4f32f44a93ea38$var$countNodes(child);
  return count;
}
var $364c127d152b1085$exports = {};
$parcel$export($364c127d152b1085$exports, "PipecatClient", () => $364c127d152b1085$export$8f7f86a77535f7a3);
var $e3bad9cc25e327f7$exports = {};
$e3bad9cc25e327f7$exports = JSON.parse('{"name":"@pipecat-ai/client-js","version":"1.15.0","license":"BSD-2-Clause","main":"dist/index.js","module":"dist/index.module.js","types":"dist/index.d.ts","source":"index.ts","repository":{"type":"git","url":"git+https://github.com/pipecat-ai/pipecat-client-web.git"},"exports":{".":{"types":"./dist/index.d.ts","import":"./dist/index.module.js","require":"./dist/index.js"}},"files":["dist","package.json","README.md"],"scripts":{"build":"jest --silent --passWithNoTests && parcel build --no-cache","dev":"parcel watch","lint":"eslint . --report-unused-disable-directives --max-warnings 0","test":"jest"},"jest":{"preset":"ts-jest","testEnvironment":"jsdom","setupFilesAfterEnv":["<rootDir>/tests/jest.setup.ts"]},"devDependencies":{"@jest/globals":"^30.5.2","@types/clone-deep":"^4.0.4","@types/jest":"^30.0.0","eslint":"^9.11.1","eslint-config-prettier":"^9.1.0","eslint-plugin-simple-import-sort":"^12.1.1","jest":"^30.5.2","jest-environment-jsdom":"^30.5.2","ts-jest":"^29.4.14","whatwg-fetch":"^3.6.20"},"dependencies":{"@types/events":"^3.0.3","bowser":"^2.11.0","clone-deep":"^4.0.1","events":"^3.3.0","typed-emitter":"^2.1.0","uuid":"^11.1.1"}}');
var $fc3f408bb0b1f921$exports = {};
$parcel$export($fc3f408bb0b1f921$exports, "findElementByRef", () => $490ce42ff92ff39b$export$792dfd553abe8e9a);
$parcel$export($fc3f408bb0b1f921$exports, "findRefForElement", () => $490ce42ff92ff39b$export$5174ac1454ce16bc);
$parcel$export($fc3f408bb0b1f921$exports, "serializeSelection", () => $490ce42ff92ff39b$export$e702c6c416f7c8de);
$parcel$export($fc3f408bb0b1f921$exports, "snapshotDocument", () => $490ce42ff92ff39b$export$326b5f56ac5b6149);
var $6396333126da0e76$exports = {};
$parcel$export($6396333126da0e76$exports, "TransportStateEnum", () => $6396333126da0e76$export$8f2038d3679a1d9b);
var $6396333126da0e76$export$8f2038d3679a1d9b;
(function(TransportStateEnum) {
  TransportStateEnum["DISCONNECTED"] = "disconnected";
  TransportStateEnum["INITIALIZING"] = "initializing";
  TransportStateEnum["INITIALIZED"] = "initialized";
  TransportStateEnum["AUTHENTICATING"] = "authenticating";
  TransportStateEnum["AUTHENTICATED"] = "authenticated";
  TransportStateEnum["CONNECTING"] = "connecting";
  TransportStateEnum["CONNECTED"] = "connected";
  TransportStateEnum["READY"] = "ready";
  TransportStateEnum["DISCONNECTING"] = "disconnecting";
  TransportStateEnum["ERROR"] = "error";
})($6396333126da0e76$export$8f2038d3679a1d9b || ($6396333126da0e76$export$8f2038d3679a1d9b = {}));
var $db6391dc7d757577$exports = {};
$parcel$export($db6391dc7d757577$exports, "RTVIError", () => $db6391dc7d757577$export$59b4786f333aac02);
$parcel$export($db6391dc7d757577$exports, "ConnectionTimeoutError", () => $db6391dc7d757577$export$c67992fa684a81a6);
$parcel$export($db6391dc7d757577$exports, "StartBotError", () => $db6391dc7d757577$export$e7544ab812238a61);
$parcel$export($db6391dc7d757577$exports, "TransportStartError", () => $db6391dc7d757577$export$e0624a511a2c4e9);
$parcel$export($db6391dc7d757577$exports, "InvalidTransportParamsError", () => $db6391dc7d757577$export$b6ce555ea7f95fba);
$parcel$export($db6391dc7d757577$exports, "BotNotReadyError", () => $db6391dc7d757577$export$885fb96b850e8fbb);
$parcel$export($db6391dc7d757577$exports, "BotAlreadyStartedError", () => $db6391dc7d757577$export$cc240eab14fa4f50);
$parcel$export($db6391dc7d757577$exports, "UnsupportedFeatureError", () => $db6391dc7d757577$export$bd0820eb8444fcd9);
$parcel$export($db6391dc7d757577$exports, "MessageTooLargeError", () => $db6391dc7d757577$export$78e1011ee1942cf6);
$parcel$export($db6391dc7d757577$exports, "DeviceError", () => $db6391dc7d757577$export$64c9f614187c1e59);
var $db6391dc7d757577$export$59b4786f333aac02 = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};
var $db6391dc7d757577$export$c67992fa684a81a6 = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(message) {
    super(message ?? "Bot did not enter ready state within the specified timeout period.");
  }
};
var $db6391dc7d757577$export$e7544ab812238a61 = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(message, status) {
    super(message ?? `Failed to connect / invalid auth bundle from base url`, status ?? 500);
    this.error = "invalid-request-error";
  }
};
var $db6391dc7d757577$export$e0624a511a2c4e9 = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(message) {
    super(message ?? "Unable to connect to transport");
  }
};
var $db6391dc7d757577$export$b6ce555ea7f95fba = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(message) {
    super(message ?? "Invalid transport connection parameters");
  }
};
var $db6391dc7d757577$export$885fb96b850e8fbb = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(message) {
    super(message ?? "Attempt to call action on transport when not in 'ready' state.");
  }
};
var $db6391dc7d757577$export$cc240eab14fa4f50 = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(message) {
    super(message ?? "Pipecat client has already been started. Please call disconnect() before starting again.");
  }
};
var $db6391dc7d757577$export$bd0820eb8444fcd9 = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(feature, source, message) {
    let msg = `${feature} not supported${message ? `: ${message}` : ""}`;
    if (source) msg = `${source} does not support ${feature}${message ? `: ${message}` : ""}`;
    super(msg);
    this.feature = feature;
  }
};
var $db6391dc7d757577$export$78e1011ee1942cf6 = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(message) {
    super(message ?? "Message size exceeds the maximum allowed limit for transport.");
  }
};
var $db6391dc7d757577$export$64c9f614187c1e59 = class extends $db6391dc7d757577$export$59b4786f333aac02 {
  constructor(devices, type, message, details) {
    super(message ?? `Device error for ${devices.join(", ")}: ${type}`);
    this.devices = devices;
    this.type = type;
    this.details = details;
  }
};
var $c1b4da4af54f4fa1$exports = {};
$parcel$export($c1b4da4af54f4fa1$exports, "RTVIEvent", () => $c1b4da4af54f4fa1$export$6b4624d233c61fcb);
var $c1b4da4af54f4fa1$export$6b4624d233c61fcb;
(function(RTVIEvent) {
  RTVIEvent["Connected"] = "connected";
  RTVIEvent["Disconnected"] = "disconnected";
  RTVIEvent["TransportStateChanged"] = "transportStateChanged";
  RTVIEvent["BotStarted"] = "botStarted";
  RTVIEvent["BotConnected"] = "botConnected";
  RTVIEvent["BotReady"] = "botReady";
  RTVIEvent["BotDisconnected"] = "botDisconnected";
  RTVIEvent["Error"] = "error";
  RTVIEvent["ServerMessage"] = "serverMessage";
  RTVIEvent["ServerResponse"] = "serverResponse";
  RTVIEvent["MessageError"] = "messageError";
  RTVIEvent["UICommand"] = "uiCommand";
  RTVIEvent["UIJobGroup"] = "uiJobGroup";
  RTVIEvent["Metrics"] = "metrics";
  RTVIEvent["BotStartedSpeaking"] = "botStartedSpeaking";
  RTVIEvent["BotStoppedSpeaking"] = "botStoppedSpeaking";
  RTVIEvent["UserStartedSpeaking"] = "userStartedSpeaking";
  RTVIEvent["UserStoppedSpeaking"] = "userStoppedSpeaking";
  RTVIEvent["UserMuteStarted"] = "userMuteStarted";
  RTVIEvent["UserMuteStopped"] = "userMuteStopped";
  RTVIEvent["UserTranscript"] = "userTranscript";
  RTVIEvent["UserInput"] = "userInput";
  RTVIEvent["BotOutput"] = "botOutput";
  RTVIEvent["BotTranscript"] = "botTranscript";
  RTVIEvent["UserLlmText"] = "userLlmText";
  RTVIEvent["BotLlmText"] = "botLlmText";
  RTVIEvent["BotLlmStarted"] = "botLlmStarted";
  RTVIEvent["BotLlmStopped"] = "botLlmStopped";
  RTVIEvent["LLMFunctionCall"] = "llmFunctionCall";
  RTVIEvent["LLMFunctionCallStarted"] = "llmFunctionCallStarted";
  RTVIEvent["LLMFunctionCallInProgress"] = "llmFunctionCallInProgress";
  RTVIEvent["LLMFunctionCallStopped"] = "llmFunctionCallStopped";
  RTVIEvent["BotLlmSearchResponse"] = "botLlmSearchResponse";
  RTVIEvent["BotTtsText"] = "botTtsText";
  RTVIEvent["BotTtsStarted"] = "botTtsStarted";
  RTVIEvent["BotTtsStopped"] = "botTtsStopped";
  RTVIEvent["SttRawText"] = "sttRawText";
  RTVIEvent["LlmRawText"] = "llmRawText";
  RTVIEvent["TtsRawText"] = "ttsRawText";
  RTVIEvent["ParticipantConnected"] = "participantConnected";
  RTVIEvent["ParticipantLeft"] = "participantLeft";
  RTVIEvent["TrackStarted"] = "trackStarted";
  RTVIEvent["TrackStopped"] = "trackStopped";
  RTVIEvent["ScreenTrackStarted"] = "screenTrackStarted";
  RTVIEvent["ScreenTrackStopped"] = "screenTrackStopped";
  RTVIEvent["ScreenShareError"] = "screenShareError";
  RTVIEvent["LocalAudioLevel"] = "localAudioLevel";
  RTVIEvent["RemoteAudioLevel"] = "remoteAudioLevel";
  RTVIEvent["AvailableCamsUpdated"] = "availableCamsUpdated";
  RTVIEvent["AvailableMicsUpdated"] = "availableMicsUpdated";
  RTVIEvent["AvailableSpeakersUpdated"] = "availableSpeakersUpdated";
  RTVIEvent["CamUpdated"] = "camUpdated";
  RTVIEvent["MicUpdated"] = "micUpdated";
  RTVIEvent["SpeakerUpdated"] = "speakerUpdated";
  RTVIEvent["DeviceError"] = "deviceError";
  RTVIEvent["MediaStateUpdated"] = "mediaStateUpdated";
  RTVIEvent["MediaSupportUpdated"] = "mediaSupportUpdated";
  RTVIEvent["UnsupportedFeature"] = "unsupportedFeature";
})($c1b4da4af54f4fa1$export$6b4624d233c61fcb || ($c1b4da4af54f4fa1$export$6b4624d233c61fcb = {}));
var $c0d10c4690969999$exports = {};
$parcel$export($c0d10c4690969999$exports, "RTVI_PROTOCOL_VERSION", () => $c0d10c4690969999$export$7bdaf0e0d661a8f5);
$parcel$export($c0d10c4690969999$exports, "RTVI_MESSAGE_LABEL", () => $c0d10c4690969999$export$882b13c7fda338f5);
$parcel$export($c0d10c4690969999$exports, "RTVIMessageType", () => $c0d10c4690969999$export$38b3db05cbf0e240);
$parcel$export($c0d10c4690969999$exports, "BotOutputType", () => $c0d10c4690969999$export$f4155fe65a9ed99f);
$parcel$export($c0d10c4690969999$exports, "TextType", () => $c0d10c4690969999$export$a61816c1105a5bb3);
$parcel$export($c0d10c4690969999$exports, "AggregationType", () => $c0d10c4690969999$export$fa4739a8a27f18c0);
$parcel$export($c0d10c4690969999$exports, "MimeTypeMapping", () => $c0d10c4690969999$export$bd91f890380b07f1);
$parcel$export($c0d10c4690969999$exports, "setAboutClient", () => $c0d10c4690969999$export$e4036f9b8ddb7379);
$parcel$export($c0d10c4690969999$exports, "RTVIMessage", () => $c0d10c4690969999$export$69aa9ab0334b212);
var $c0d10c4690969999$export$7bdaf0e0d661a8f5 = "2.2.0";
var $c0d10c4690969999$export$882b13c7fda338f5 = "rtvi-ai";
var $c0d10c4690969999$export$38b3db05cbf0e240;
(function(RTVIMessageType) {
  RTVIMessageType["CLIENT_READY"] = "client-ready";
  RTVIMessageType["DISCONNECT_BOT"] = "disconnect-bot";
  RTVIMessageType["CLIENT_MESSAGE"] = "client-message";
  RTVIMessageType["SEND_TEXT"] = "send-text";
  RTVIMessageType["SEND_FILE"] = "send-file";
  RTVIMessageType["DTMF"] = "dtmf";
  RTVIMessageType["UI_EVENT"] = "ui-event";
  RTVIMessageType["UI_SNAPSHOT"] = "ui-snapshot";
  RTVIMessageType["UI_CANCEL_JOB_GROUP"] = "ui-cancel-job-group";
  RTVIMessageType["APPEND_TO_CONTEXT"] = "append-to-context";
  RTVIMessageType["BOT_READY"] = "bot-ready";
  RTVIMessageType["ERROR"] = "error";
  RTVIMessageType["METRICS"] = "metrics";
  RTVIMessageType["SERVER_MESSAGE"] = "server-message";
  RTVIMessageType["SERVER_RESPONSE"] = "server-response";
  RTVIMessageType["ERROR_RESPONSE"] = "error-response";
  RTVIMessageType["APPEND_TO_CONTEXT_RESULT"] = "append-to-context-result";
  RTVIMessageType["UI_COMMAND"] = "ui-command";
  RTVIMessageType["UI_JOB_GROUP"] = "ui-job-group";
  RTVIMessageType["USER_STARTED_SPEAKING"] = "user-started-speaking";
  RTVIMessageType["USER_STOPPED_SPEAKING"] = "user-stopped-speaking";
  RTVIMessageType["BOT_STARTED_SPEAKING"] = "bot-started-speaking";
  RTVIMessageType["BOT_STOPPED_SPEAKING"] = "bot-stopped-speaking";
  RTVIMessageType["USER_MUTE_STARTED"] = "user-mute-started";
  RTVIMessageType["USER_MUTE_STOPPED"] = "user-mute-stopped";
  RTVIMessageType["USER_TRANSCRIPTION"] = "user-transcription";
  RTVIMessageType["USER_INPUT"] = "user-input";
  RTVIMessageType["BOT_OUTPUT"] = "bot-output";
  RTVIMessageType["BOT_TRANSCRIPTION"] = "bot-transcription";
  RTVIMessageType["USER_LLM_TEXT"] = "user-llm-text";
  RTVIMessageType["BOT_LLM_TEXT"] = "bot-llm-text";
  RTVIMessageType["BOT_LLM_STARTED"] = "bot-llm-started";
  RTVIMessageType["BOT_LLM_STOPPED"] = "bot-llm-stopped";
  RTVIMessageType["LLM_FUNCTION_CALL"] = "llm-function-call";
  RTVIMessageType["LLM_FUNCTION_CALL_STARTED"] = "llm-function-call-started";
  RTVIMessageType["LLM_FUNCTION_CALL_IN_PROGRESS"] = "llm-function-call-in-progress";
  RTVIMessageType["LLM_FUNCTION_CALL_STOPPED"] = "llm-function-call-stopped";
  RTVIMessageType["LLM_FUNCTION_CALL_RESULT"] = "llm-function-call-result";
  RTVIMessageType["BOT_LLM_SEARCH_RESPONSE"] = "bot-llm-search-response";
  RTVIMessageType["BOT_TTS_TEXT"] = "bot-tts-text";
  RTVIMessageType["BOT_TTS_STARTED"] = "bot-tts-started";
  RTVIMessageType["BOT_TTS_STOPPED"] = "bot-tts-stopped";
  RTVIMessageType["STT_RAW_TEXT"] = "stt-raw-text";
  RTVIMessageType["LLM_RAW_TEXT"] = "llm-raw-text";
  RTVIMessageType["TTS_RAW_TEXT"] = "tts-raw-text";
})($c0d10c4690969999$export$38b3db05cbf0e240 || ($c0d10c4690969999$export$38b3db05cbf0e240 = {}));
var $c0d10c4690969999$export$f4155fe65a9ed99f;
(function(BotOutputType) {
  BotOutputType["BACKCHANNEL"] = "backchannel";
  BotOutputType["SENTENCE"] = "sentence";
  BotOutputType["TOKEN"] = "token";
  BotOutputType["WORD"] = "word";
})($c0d10c4690969999$export$f4155fe65a9ed99f || ($c0d10c4690969999$export$f4155fe65a9ed99f = {}));
var $c0d10c4690969999$export$a61816c1105a5bb3 = $c0d10c4690969999$export$f4155fe65a9ed99f;
var $c0d10c4690969999$export$fa4739a8a27f18c0 = $c0d10c4690969999$export$f4155fe65a9ed99f;
var $c0d10c4690969999$export$bd91f890380b07f1 = {
  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  // Documents
  pdf: "application/pdf",
  csv: "text/csv",
  txt: "text/plain",
  md: "text/markdown",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  json: "application/json",
  html: "text/html",
  css: "text/css",
  javascript: "application/javascript",
  // Media
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  aac: "audio/aac",
  mp4: "video/mp4",
  webm: "video/webm",
  avi: "video/x-msvideo"
};
var $c0d10c4690969999$var$_aboutClient;
function $c0d10c4690969999$export$e4036f9b8ddb7379(about) {
  if ($c0d10c4690969999$var$_aboutClient) $c0d10c4690969999$var$_aboutClient = {
    ...$c0d10c4690969999$var$_aboutClient,
    ...about
  };
  else
    $c0d10c4690969999$var$_aboutClient = about;
}
var $c0d10c4690969999$export$69aa9ab0334b212 = class _$c0d10c4690969999$export$69aa9ab0334b212 {
  constructor(type, data, id) {
    this.label = $c0d10c4690969999$export$882b13c7fda338f5;
    this.type = type;
    this.data = data;
    this.id = id || (0, v4_default)().slice(0, 8);
  }
  // Outbound message types
  static clientReady() {
    return new _$c0d10c4690969999$export$69aa9ab0334b212($c0d10c4690969999$export$38b3db05cbf0e240.CLIENT_READY, {
      version: $c0d10c4690969999$export$7bdaf0e0d661a8f5,
      about: $c0d10c4690969999$var$_aboutClient || {
        library: (0, $e3bad9cc25e327f7$exports.name),
        library_version: (0, $e3bad9cc25e327f7$exports.version)
      }
    });
  }
  static disconnectBot() {
    return new _$c0d10c4690969999$export$69aa9ab0334b212($c0d10c4690969999$export$38b3db05cbf0e240.DISCONNECT_BOT, {});
  }
  static error(message, fatal = false) {
    return new _$c0d10c4690969999$export$69aa9ab0334b212($c0d10c4690969999$export$38b3db05cbf0e240.ERROR, {
      error: message,
      message,
      fatal
    });
  }
};
var $8cb304fe1f0e04ef$exports = {};
$parcel$exportWildcard($fc3f408bb0b1f921$exports, $6396333126da0e76$exports);
$parcel$exportWildcard($fc3f408bb0b1f921$exports, $db6391dc7d757577$exports);
$parcel$exportWildcard($fc3f408bb0b1f921$exports, $c1b4da4af54f4fa1$exports);
$parcel$exportWildcard($fc3f408bb0b1f921$exports, $c0d10c4690969999$exports);
$parcel$exportWildcard($fc3f408bb0b1f921$exports, $8cb304fe1f0e04ef$exports);
function $c68ef2498d1a7177$export$f1586721024c4dab(_target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    if (this.state === "ready") return originalMethod.apply(this, args);
    else throw new (0, $db6391dc7d757577$export$885fb96b850e8fbb)(`Attempt to call ${propertyKey.toString()} when transport not in ready state. Await connect() first.`);
  };
  return descriptor;
}
function $c68ef2498d1a7177$export$ebc0d747cf8770bc(_target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  const states = [
    "authenticating",
    "connecting",
    "connected",
    "ready"
  ];
  descriptor.value = function(...args) {
    if (states.includes(this.state)) throw new (0, $db6391dc7d757577$export$cc240eab14fa4f50)(`Attempt to call ${propertyKey.toString()} when client already started. Please call disconnect() before starting again.`);
    else return originalMethod.apply(this, args);
  };
  return descriptor;
}
var $769bb602511974a1$exports = {};
$parcel$export($769bb602511974a1$exports, "MessageDispatcher", () => $769bb602511974a1$export$e9a960646cc432aa);
var $e0900798b6cc045b$exports = {};
$parcel$export($e0900798b6cc045b$exports, "LogLevel", () => $e0900798b6cc045b$export$243e62d78d3b544d);
$parcel$export($e0900798b6cc045b$exports, "logger", () => $e0900798b6cc045b$export$af88d00dbe7f521);
var $e0900798b6cc045b$export$243e62d78d3b544d;
(function(LogLevel) {
  LogLevel[LogLevel["NONE"] = 0] = "NONE";
  LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
  LogLevel[LogLevel["WARN"] = 2] = "WARN";
  LogLevel[LogLevel["INFO"] = 3] = "INFO";
  LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
})($e0900798b6cc045b$export$243e62d78d3b544d || ($e0900798b6cc045b$export$243e62d78d3b544d = {}));
var $e0900798b6cc045b$var$Logger = class _$e0900798b6cc045b$var$Logger {
  constructor() {
    this.level = $e0900798b6cc045b$export$243e62d78d3b544d.DEBUG;
  }
  static getInstance() {
    if (!_$e0900798b6cc045b$var$Logger.instance) _$e0900798b6cc045b$var$Logger.instance = new _$e0900798b6cc045b$var$Logger();
    return _$e0900798b6cc045b$var$Logger.instance;
  }
  setLevel(level) {
    this.level = level;
  }
  debug(...args) {
    if (this.level >= $e0900798b6cc045b$export$243e62d78d3b544d.DEBUG) console.debug(...args);
  }
  info(...args) {
    if (this.level >= $e0900798b6cc045b$export$243e62d78d3b544d.INFO) console.info(...args);
  }
  warn(...args) {
    if (this.level >= $e0900798b6cc045b$export$243e62d78d3b544d.WARN) console.warn(...args);
  }
  error(...args) {
    if (this.level >= $e0900798b6cc045b$export$243e62d78d3b544d.ERROR) console.error(...args);
  }
};
var $e0900798b6cc045b$export$af88d00dbe7f521 = $e0900798b6cc045b$var$Logger.getInstance();
var $769bb602511974a1$export$e9a960646cc432aa = class {
  constructor(sendMethod) {
    this._queue = new Array();
    this._gcInterval = void 0;
    this._queue = [];
    this._sendMethod = sendMethod;
  }
  disconnect() {
    this.clearQueue("Disconnected before response was received");
    clearInterval(this._gcInterval);
    this._gcInterval = void 0;
  }
  dispatch(message_data, type = (0, $c0d10c4690969999$export$38b3db05cbf0e240).CLIENT_MESSAGE, timeout = 1e4) {
    if (!this._gcInterval)
      this._gcInterval = setInterval(() => {
        this._gc();
      }, 2e3);
    const message = new (0, $c0d10c4690969999$export$69aa9ab0334b212)(type, message_data);
    const promise = new Promise((resolve, reject) => {
      this._queue.push({
        message,
        timestamp: Date.now(),
        timeout,
        resolve,
        reject
      });
    });
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[MessageDispatcher] dispatch", message);
    try {
      this._sendMethod(message);
    } catch (e2) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).error("[MessageDispatcher] Error sending message", e2);
      return Promise.reject(e2);
    }
    this._gc();
    return promise;
  }
  clearQueue(reason = "Request cleared before response was received") {
    this._queue.forEach((msg) => {
      msg.reject(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).ERROR_RESPONSE, {
        error: reason,
        msgType: msg.message.data?.t,
        data: msg.message.data?.d,
        fatal: false
      }));
    });
    this._queue = [];
  }
  _resolveReject(message, resolve = true) {
    const queuedMessage = this._queue.find((msg) => msg.message.id === message.id);
    if (queuedMessage) {
      if (resolve) {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[MessageDispatcher] Resolve", message);
        queuedMessage.resolve(message);
      } else {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[MessageDispatcher] Reject", message);
        queuedMessage.reject(message);
      }
      this._queue = this._queue.filter((msg) => msg.message.id !== message.id);
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[MessageDispatcher] Queue", this._queue);
    }
    return message;
  }
  resolve(message) {
    return this._resolveReject(message, true);
  }
  reject(message) {
    return this._resolveReject(message, false);
  }
  _gc() {
    const expired = [];
    this._queue = this._queue.filter((msg) => {
      const isValid = Date.now() - msg.timestamp < msg.timeout;
      if (!isValid) expired.push(msg);
      return isValid;
    });
    expired.forEach((msg) => {
      if (msg.message.type === (0, $c0d10c4690969999$export$38b3db05cbf0e240).CLIENT_MESSAGE) msg.reject(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).ERROR_RESPONSE, {
        error: "Timed out waiting for response",
        msgType: msg.message.data.t,
        data: msg.message.data.d,
        fatal: false
      }));
    });
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[MessageDispatcher] GC", this._queue);
  }
};
function $2c5dde0c5bd6f5d0$export$84ac7cc1f1135f74(transport, bot) {
  const combine = (...values) => {
    if (values.includes(false)) return false;
    if (values.every((value) => value === true)) return true;
    return void 0;
  };
  return {
    mic: combine(transport.mic, bot?.audio_in),
    cam: combine(transport.cam, bot?.video_in),
    screenShare: combine(transport.screenShare, bot?.video_in, bot?.screen_in),
    botAudio: combine(transport.botAudio, bot?.audio_out),
    botVideo: combine(transport.botVideo, bot?.video_out)
  };
}
var $d0e914667cc5346b$exports = {};
$parcel$export($d0e914667cc5346b$exports, "isAPIRequest", () => $d0e914667cc5346b$export$2dd7ca293b2783);
$parcel$export($d0e914667cc5346b$exports, "makeRequest", () => $d0e914667cc5346b$export$699251e5611cc6db);
function $d0e914667cc5346b$export$2dd7ca293b2783(value) {
  if (typeof value === "object" && value !== null && Object.keys(value).includes("endpoint")) {
    const endpoint = value["endpoint"];
    return typeof endpoint === "string" || endpoint instanceof URL || typeof Request !== "undefined" && endpoint instanceof Request;
  }
  return false;
}
async function $d0e914667cc5346b$export$699251e5611cc6db(cxnOpts, abortController) {
  if (!abortController) abortController = new AbortController();
  let handshakeTimeout;
  return new Promise((resolve, reject) => {
    (async () => {
      if (cxnOpts.timeout) handshakeTimeout = setTimeout(async () => {
        abortController.abort();
        reject(new Error("Timed out"));
      }, cxnOpts.timeout);
      let request;
      if (typeof Request !== "undefined" && cxnOpts.endpoint instanceof Request) {
        request = new Request(cxnOpts.endpoint, {
          signal: abortController.signal
        });
        if (cxnOpts.requestData) (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("[Pipecat Client] requestData in APIRequest is ignored when endpoint is a Request object");
        if (cxnOpts.headers) (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("[Pipecat Client] headers in APIRequest is ignored when endpoint is a Request object");
      } else request = new Request(cxnOpts.endpoint, {
        method: "POST",
        mode: "cors",
        headers: new Headers({
          "Content-Type": "application/json",
          ...Object.fromEntries((cxnOpts.headers ?? new Headers()).entries())
        }),
        body: JSON.stringify(cxnOpts.requestData),
        signal: abortController.signal
      });
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`[Pipecat Client] Fetching from ${request.url}`);
      fetch(request).then((res) => {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`[Pipecat Client] Received response from ${request.url}`, res);
        if (!res.ok) {
          reject(res);
          return;
        }
        return res.json();
      }).then((data) => {
        resolve(data);
      }).catch((err) => {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).error(`[Pipecat Client] Error fetching: ${err}`);
        reject(err);
      }).finally(() => {
        if (handshakeTimeout) clearTimeout(handshakeTimeout);
      });
    })();
  });
}
var $7ef5cee66c377f4d$exports = {};
$parcel$export($7ef5cee66c377f4d$exports, "Transport", () => $7ef5cee66c377f4d$export$86495b081fef8e52);
$parcel$export($7ef5cee66c377f4d$exports, "TransportWrapper", () => $7ef5cee66c377f4d$export$82b6ede160a64a3c);
var $7ef5cee66c377f4d$export$86495b081fef8e52 = class {
  constructor() {
    this._state = "disconnected";
    this._maxMessageSize = 65536;
  }
  /**
   * Establishes a connection with the remote server. This is the main entry
   * point for the transport to start sending and receiving media and messages.
   * This is called from PipecatClient.connect() and should not be called directly.
   * @param connectParams - This type will ultimately be defned by the transport
   * implementation. It is used to pass connection parameters to the transport.
   */
  connect(connectParams) {
    this._abortController = new AbortController();
    let validatedParams = connectParams;
    try {
      validatedParams = this._validateConnectionParams(connectParams);
    } catch (e2) {
      throw new (0, $db6391dc7d757577$export$59b4786f333aac02)(`Invalid connection params: ${e2.message}. Please check your connection params and try again.`);
    }
    return this._connect(validatedParams);
  }
  /**
   * Allow the transports to determine how the bot was started.
   */
  get startBotParams() {
    return this._startBotParams;
  }
  /**
   * Set the parameters used to start the bot.
   * @param startBotParams
   */
  set startBotParams(startBotParams) {
    if (typeof Request !== "undefined" && startBotParams.endpoint instanceof Request) {
      this._startBotParams = {
        ...startBotParams,
        endpoint: startBotParams.endpoint.clone()
      };
      return;
    }
    this._startBotParams = startBotParams;
  }
  /**
   * The raw response from the start-bot endpoint, stored alongside
   * startBotParams by PipecatClient.startBot() and cleared on disconnect.
   * Consumers parse what they need from it lazily (e.g. the advertised
   * fileUploadUrl); its shape is backend-specific and not part of the RTVI
   * contract.
   */
  get startBotResponse() {
    return this._startBotResponse;
  }
  set startBotResponse(response) {
    this._startBotResponse = response;
  }
  /**
   * Disconnects the transport from the remote server. This is called from
   * PipecatClient.disconnect() and should not be called directly.
   */
  disconnect() {
    if (this._abortController) this._abortController.abort();
    return this._disconnect();
  }
  /**
   * Maximum size, in bytes, of a single message that this transport will attempt
   * to send. Callers should ensure that any outbound {@link RTVIMessage} payloads
   * do not exceed this limit to avoid transport or server errors.
   */
  get maxMessageSize() {
    return this._maxMessageSize;
  }
  /**
   * The media this transport, in this environment, can carry. Known before
   * connecting. Transports override this; the default rules nothing out.
   */
  get mediaSupport() {
    return {};
  }
};
var $7ef5cee66c377f4d$export$82b6ede160a64a3c = class {
  constructor(transport) {
    this._transport = transport;
    this._proxy = new Proxy(this._transport, {
      get: (target, prop, receiver) => {
        if (typeof target[prop] === "function") {
          let errMsg;
          switch (String(prop)) {
            // Disable methods that modify the lifecycle of the call. These operations
            // should be performed via the Pipecat client in order to keep state in sync.
            case "initialize":
              errMsg = `Direct calls to initialize() are disabled and used internally by the PipecatClient.`;
              break;
            case "initDevices":
              errMsg = `Direct calls to initDevices() are disabled. Please use the PipecatClient.initDevices() wrapper or let PipecatClient.connect() call it for you.`;
              break;
            case "sendReadyMessage":
              errMsg = `Direct calls to sendReadyMessage() are disabled and used internally by the PipecatClient.`;
              break;
            case "connect":
              errMsg = `Direct calls to connect() are disabled. Please use the PipecatClient.connect() wrapper.`;
              break;
            case "disconnect":
              errMsg = `Direct calls to disconnect() are disabled. Please use the PipecatClient.disconnect() wrapper.`;
              break;
          }
          if (errMsg) return () => {
            throw new Error(errMsg);
          };
          return (...args) => {
            return target[prop](...args);
          };
        }
        return Reflect.get(target, prop, receiver);
      }
    });
  }
  get proxy() {
    return this._proxy;
  }
};
var $dfd757760e36925b$exports = {};
$parcel$export($dfd757760e36925b$exports, "learnAboutClient", () => $dfd757760e36925b$export$7eb7b0a641098f31);
$parcel$export($dfd757760e36925b$exports, "messageSizeWithinLimit", () => $dfd757760e36925b$export$48f8227f1e7323f5);
function $dfd757760e36925b$export$7eb7b0a641098f31() {
  let about = {
    library: (0, $e3bad9cc25e327f7$exports.name),
    library_version: (0, $e3bad9cc25e327f7$exports.version),
    platform_details: {}
  };
  let navAgentInfo = null;
  if (window?.navigator?.userAgent) try {
    navAgentInfo = (0, Bowser).parse(window.navigator.userAgent);
  } catch (_2) {
  }
  if (navAgentInfo?.browser?.name) about.platform_details.browser = navAgentInfo.browser.name;
  if (navAgentInfo?.browser?.name === "Safari" && !navAgentInfo.browser.version) about.platform_details.browser_version = "Web View";
  else if (navAgentInfo?.browser?.version) about.platform_details.browser_version = navAgentInfo.browser.version;
  if (navAgentInfo?.platform?.type) about.platform_details.platform_type = navAgentInfo.platform.type;
  if (navAgentInfo?.engine?.name) about.platform_details.engine = navAgentInfo.engine.name;
  if (navAgentInfo?.os) {
    about.platform = navAgentInfo.os.name;
    about.platform_version = navAgentInfo.os.version;
  }
  return about;
}
function $dfd757760e36925b$export$48f8227f1e7323f5(message, maxSize) {
  const getSizeInBytes = (obj) => {
    const jsonString = JSON.stringify(obj);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);
    return bytes.length;
  };
  const size = getSizeInBytes(message);
  return size <= maxSize;
}
var $364c127d152b1085$var$__decorate = function(decorators, target, key, desc) {
  var c2 = arguments.length, r2 = c2 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d2;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r2 = Reflect.decorate(decorators, target, key, desc);
  else for (var i2 = decorators.length - 1; i2 >= 0; i2--) if (d2 = decorators[i2]) r2 = (c2 < 3 ? d2(r2) : c2 > 3 ? d2(target, key, r2) : d2(target, key)) || r2;
  return c2 > 3 && r2 && Object.defineProperty(target, key, r2), r2;
};
function $364c127d152b1085$var$deviceErrorReasonFromType(type) {
  switch (type) {
    case "in-use":
      return "already-in-use";
    case "permissions":
      return "blocked";
    case "not-found":
      return "not-found";
    case "undefined-mediadevices":
      return "not-supported";
    case "constraints":
      return "invalid-constraints";
    case "unknown":
    default:
      return "unknown";
  }
}
var $364c127d152b1085$var$RTVIEventEmitter = class extends (0, import_events.default) {
};
var $364c127d152b1085$export$8f7f86a77535f7a3 = class extends $364c127d152b1085$var$RTVIEventEmitter {
  constructor(options) {
    super();
    this._functionCallCallbacks = {};
    this._botTranscriptionWarned = false;
    this._llmFunctionCallWarned = false;
    this._botVersion = [
      0,
      0,
      0
    ];
    this._mediaState = {
      mic: {
        state: "uninitialized"
      },
      cam: {
        state: "uninitialized"
      }
    };
    (0, $c0d10c4690969999$export$e4036f9b8ddb7379)((0, $dfd757760e36925b$export$7eb7b0a641098f31)());
    this._transport = options.transport;
    this._transportWrapper = new (0, $7ef5cee66c377f4d$export$82b6ede160a64a3c)(this._transport);
    this._disconnectOnBotDisconnect = options.disconnectOnBotDisconnect ?? true;
    const wrappedCallbacks = {
      ...options.callbacks,
      onMessageError: (message) => {
        options?.callbacks?.onMessageError?.(message);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).MessageError, message);
      },
      onError: (message) => {
        options?.callbacks?.onError?.(message);
        try {
          this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).Error, message);
        } catch (e2) {
          if (e2 instanceof Error && e2.message.includes("Unhandled error")) {
            if (!options?.callbacks?.onError) (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("No onError callback registered to handle error", message);
          } else (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("Could not emit error", message, e2);
        }
        const data = message.data;
        if (data?.fatal) {
          (0, $e0900798b6cc045b$export$af88d00dbe7f521).error("Fatal error reported. Disconnecting...");
          this.disconnect();
        }
      },
      onConnected: () => {
        options?.callbacks?.onConnected?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).Connected);
      },
      onDisconnected: () => {
        options?.callbacks?.onDisconnected?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).Disconnected);
      },
      onTransportStateChanged: (state) => {
        options?.callbacks?.onTransportStateChanged?.(state);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).TransportStateChanged, state);
        if (state === "ready") this._flushPendingUISnapshot();
      },
      onParticipantJoined: (p2) => {
        options?.callbacks?.onParticipantJoined?.(p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).ParticipantConnected, p2);
      },
      onParticipantLeft: (p2) => {
        options?.callbacks?.onParticipantLeft?.(p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).ParticipantLeft, p2);
      },
      onTrackStarted: (track2, p2) => {
        options?.callbacks?.onTrackStarted?.(track2, p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).TrackStarted, track2, p2);
      },
      onTrackStopped: (track2, p2) => {
        options?.callbacks?.onTrackStopped?.(track2, p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).TrackStopped, track2, p2);
      },
      onScreenTrackStarted: (track2, p2) => {
        options?.callbacks?.onScreenTrackStarted?.(track2, p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).ScreenTrackStarted, track2, p2);
      },
      onScreenTrackStopped: (track2, p2) => {
        options?.callbacks?.onScreenTrackStopped?.(track2, p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).ScreenTrackStopped, track2, p2);
      },
      onScreenShareError: (errorMessage) => {
        options?.callbacks?.onScreenShareError?.(errorMessage);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).ScreenShareError, errorMessage);
      },
      onUnsupportedFeature: (error) => {
        options?.callbacks?.onUnsupportedFeature?.(error);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UnsupportedFeature, error);
      },
      onAvailableCamsUpdated: (cams) => {
        options?.callbacks?.onAvailableCamsUpdated?.(cams);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).AvailableCamsUpdated, cams);
      },
      onAvailableMicsUpdated: (mics) => {
        options?.callbacks?.onAvailableMicsUpdated?.(mics);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).AvailableMicsUpdated, mics);
      },
      onAvailableSpeakersUpdated: (speakers) => {
        options?.callbacks?.onAvailableSpeakersUpdated?.(speakers);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).AvailableSpeakersUpdated, speakers);
      },
      onCamUpdated: (cam) => {
        if (cam?.deviceId) this._markDeviceGranted("cam");
        options?.callbacks?.onCamUpdated?.(cam);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).CamUpdated, cam);
      },
      onMicUpdated: (mic) => {
        if (mic?.deviceId) this._markDeviceGranted("mic");
        options?.callbacks?.onMicUpdated?.(mic);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).MicUpdated, mic);
      },
      onSpeakerUpdated: (speaker) => {
        options?.callbacks?.onSpeakerUpdated?.(speaker);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).SpeakerUpdated, speaker);
      },
      onDeviceError: (error) => {
        this._classifyAndApplyDeviceError(error);
        options?.callbacks?.onDeviceError?.(error);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).DeviceError, error);
      },
      onBotStarted: (botResponse) => {
        options?.callbacks?.onBotStarted?.(botResponse);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotStarted, botResponse);
      },
      onBotConnected: (p2) => {
        options?.callbacks?.onBotConnected?.(p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotConnected, p2);
      },
      onBotReady: (botReadyData) => {
        options?.callbacks?.onBotReady?.(botReadyData);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotReady, botReadyData);
      },
      onBotDisconnected: (p2) => {
        options?.callbacks?.onBotDisconnected?.(p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotDisconnected, p2);
        if (this._disconnectOnBotDisconnect) {
          (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("Bot disconnected. Disconnecting client...");
          this.disconnect();
        }
      },
      onUserStartedSpeaking: () => {
        options?.callbacks?.onUserStartedSpeaking?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UserStartedSpeaking);
      },
      onUserStoppedSpeaking: () => {
        options?.callbacks?.onUserStoppedSpeaking?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UserStoppedSpeaking);
      },
      onBotStartedSpeaking: () => {
        options?.callbacks?.onBotStartedSpeaking?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotStartedSpeaking);
      },
      onBotStoppedSpeaking: () => {
        options?.callbacks?.onBotStoppedSpeaking?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotStoppedSpeaking);
      },
      onRemoteAudioLevel: (level, p2) => {
        options?.callbacks?.onRemoteAudioLevel?.(level, p2);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).RemoteAudioLevel, level, p2);
      },
      onLocalAudioLevel: (level) => {
        options?.callbacks?.onLocalAudioLevel?.(level);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).LocalAudioLevel, level);
      },
      onUserMuteStarted: () => {
        options?.callbacks?.onUserMuteStarted?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UserMuteStarted);
      },
      onUserMuteStopped: () => {
        options?.callbacks?.onUserMuteStopped?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UserMuteStopped);
      },
      onUserTranscript: (data) => {
        options?.callbacks?.onUserTranscript?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UserTranscript, data);
      },
      onUserInput: (data) => {
        options?.callbacks?.onUserInput?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UserInput, data);
      },
      onBotOutput: (data) => {
        options?.callbacks?.onBotOutput?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotOutput, data);
      },
      onBotTranscript: (text) => {
        const hasSubscriber = !!options?.callbacks?.onBotTranscript || this.listenerCount((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotTranscript) > 0;
        if (hasSubscriber && !this._botTranscriptionWarned) {
          (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("[Pipecat Client] Bot transcription is deprecated. Please use the onBotOutput instead.");
          this._botTranscriptionWarned = true;
        }
        options?.callbacks?.onBotTranscript?.(text);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotTranscript, text);
      },
      onBotLlmText: (text) => {
        options?.callbacks?.onBotLlmText?.(text);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotLlmText, text);
      },
      onBotLlmStarted: () => {
        options?.callbacks?.onBotLlmStarted?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotLlmStarted);
      },
      onBotLlmStopped: () => {
        options?.callbacks?.onBotLlmStopped?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotLlmStopped);
      },
      onBotTtsText: (text) => {
        options?.callbacks?.onBotTtsText?.(text);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotTtsText, text);
      },
      onSttRawText: (data) => {
        options?.callbacks?.onSttRawText?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).SttRawText, data);
      },
      onLlmRawText: (data) => {
        options?.callbacks?.onLlmRawText?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).LlmRawText, data);
      },
      onTtsRawText: (data) => {
        options?.callbacks?.onTtsRawText?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).TtsRawText, data);
      },
      onBotTtsStarted: () => {
        options?.callbacks?.onBotTtsStarted?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotTtsStarted);
      },
      onBotTtsStopped: () => {
        options?.callbacks?.onBotTtsStopped?.();
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotTtsStopped);
      }
    };
    this._options = {
      ...options,
      callbacks: wrappedCallbacks,
      enableMic: options.enableMic ?? true,
      enableCam: options.enableCam ?? false,
      enableScreenShare: options.enableScreenShare ?? false
    };
    this._initialize();
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[Pipecat Client] Initialized", this.version);
  }
  setLogLevel(level) {
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).setLevel(level);
  }
  // ------ Transport methods
  /**
   * Initialize local media devices.
   *
   * Drives MediaState transitions: both mic and cam move to 'initializing' on
   * entry. On success, each device moves to 'granted' only if the transport
   * reports it as acquired (via onMicUpdated / onCamUpdated with a real
   * deviceId); otherwise that device falls back to 'uninitialized'. On
   * failure the in-flight DeviceError (if any) classifies the affected
   * device(s) per-device; anything still at 'initializing' falls back to
   * 'unknown'. The original error is always re-thrown.
   *
   * Calling this again after a failure is the recovery path — a second call
   * re-enters 'initializing' and reclassifies. There is no separate
   * retryDevices() method.
   */
  async initDevices() {
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[Pipecat Client] Initializing devices...");
    this._setMediaState({
      mic: {
        state: "initializing"
      },
      cam: {
        state: "initializing"
      }
    });
    try {
      await this._transport.initDevices();
      this._resolveLingeringInitializing({
        state: "uninitialized"
      });
    } catch (error) {
      this._resolveLingeringInitializing({
        state: "error",
        reason: "unknown"
      });
      throw error;
    } finally {
      await this._enrichFromPermissionsAPI();
    }
  }
  /**
   * After the transport's initDevices() resolves or rejects, any device
   * still at 'initializing' didn't receive a 'granted' upgrade from
   * onMicUpdated / onCamUpdated and wasn't classified by a DeviceError
   * (which would have moved it to 'error'). Apply the supplied fallback so
   * it doesn't linger.
   *
   * On success, fallback is 'uninitialized' (the transport simply didn't
   * speak to that device — e.g. daily-js skipping cam under
   * startVideoOff: true). On failure, fallback is an 'unknown' error (we
   * know something went wrong but can't pin it on this device).
   */
  _resolveLingeringInitializing(fallback) {
    const patch = {};
    for (const kind of [
      "mic",
      "cam"
    ]) if (this._mediaState[kind].state === "initializing") patch[kind] = fallback;
    if (Object.keys(patch).length > 0) this._setMediaState(patch);
  }
  /**
   * Upgrade a device to 'granted'. Called from the wrapped onMicUpdated /
   * onCamUpdated when the transport reports an actual selected device.
   * Allowed from any state — a previously errored device (e.g. 'not-found'
   * because the cam was unplugged) can recover when the device reappears
   * on a subsequent initDevices() call.
   */
  _markDeviceGranted(kind) {
    if (this._mediaState[kind].state !== "granted") this._setMediaState({
      [kind]: {
        state: "granted"
      }
    });
  }
  /**
   * startBot() is a method that initiates the bot by posting to a specified endpoint
   * that optionally returns connection parameters for establishing a transport session.
   * @param startBotParams
   * @returns Promise that resolves to TransportConnectionParams or unknown
   */
  async startBot(startBotParams) {
    if (this.needsInit()) await this.initDevices();
    this._transport.state = "authenticating";
    this._transport.startBotParams = startBotParams;
    this._abortController = new AbortController();
    let response;
    try {
      response = await (0, $d0e914667cc5346b$export$699251e5611cc6db)(startBotParams, this._abortController);
    } catch (e2) {
      let errMsg = "An unknown error occurred while starting the bot.";
      let status;
      if (e2 instanceof Response) {
        const errResp = await e2.json();
        errMsg = errResp.info ?? errResp.detail ?? e2.statusText;
        status = e2.status;
      } else if (e2 instanceof Error) errMsg = e2.message;
      this._options.callbacks?.onError?.(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).ERROR_RESPONSE, {
        message: errMsg,
        fatal: true
      }));
      throw new $db6391dc7d757577$export$e7544ab812238a61(errMsg, status);
    }
    this._transport.state = "authenticated";
    this._transport.startBotResponse = response;
    this._options.callbacks?.onBotStarted?.(response);
    return response;
  }
  /**
   * The `connect` function establishes a transport session and awaits a
   * bot-ready signal, handling various connection states and errors.
   * @param {TransportConnectionParams} [connectParams] -
   * The `connectParams` parameter in the `connect` method should be of type
   * `TransportConnectionParams`. This parameter is passed to the transport
   * for establishing a transport session.
   * NOTE: `connectParams` as type `ConnectionEndpoint` IS NOW DEPRECATED. If you
   * want to authenticate and connect to a bot in one step, use
   * `startBotAndConnect()` instead.
   * @returns The `connect` method returns a Promise that resolves to an unknown value.
   */
  async connect(connectParams) {
    if (connectParams && (0, $d0e914667cc5346b$export$2dd7ca293b2783)(connectParams)) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("Calling connect with an API endpoint is deprecated. Use startBotAndConnect() instead.");
      return this.startBotAndConnect(connectParams);
    }
    return new Promise((resolve, reject) => {
      (async () => {
        this._connectResolve = resolve;
        if (this.needsInit()) await this.initDevices();
        try {
          await this._transport.connect(connectParams);
          await this._transport.sendReadyMessage();
        } catch (e2) {
          this.disconnect();
          reject(e2);
          return;
        }
      })();
    });
  }
  async startBotAndConnect(startBotParams) {
    const connectionParams = await this.startBot(startBotParams);
    return this.connect(connectionParams);
  }
  /**
   * Disconnect the voice client from the transport
   * Reset / reinitialize transport and abort any pending requests
   */
  async disconnect() {
    this.stopUISnapshotStream();
    this._botVersion = [
      0,
      0,
      0
    ];
    this._transport.startBotResponse = void 0;
    this._setBotCapabilities(void 0);
    await this._transport.disconnect();
    this._messageDispatcher.disconnect();
  }
  /**
   * The _initialize function performs internal set up of the transport and
   * message dispatcher.
   */
  _initialize() {
    this._transport.initialize(this._options, this.handleMessage.bind(this));
    this._messageDispatcher = new (0, $769bb602511974a1$export$e9a960646cc432aa)(this._sendMessage.bind(this));
  }
  /**
   * Set the bot's capabilities and emit MediaSupportUpdated if that changes
   * mediaSupport. The callback always receives a fresh object.
   */
  _setBotCapabilities(capabilities) {
    const previous = this.mediaSupport;
    this._botCapabilities = capabilities;
    const next = this.mediaSupport;
    const keys = Object.keys({
      ...previous,
      ...next
    });
    if (keys.every((key) => previous[key] === next[key])) return;
    this._options.callbacks?.onMediaSupportChanged?.(this.mediaSupport);
    this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).MediaSupportUpdated, this.mediaSupport);
  }
  /**
   * Apply a partial MediaState patch and emit MediaStateUpdated if the patch
   * actually changes anything. The callback always receives a fresh object.
   */
  _setMediaState(patch) {
    const next = {
      ...this._mediaState,
      ...patch
    };
    if (this._statusEquals(next.mic, this._mediaState.mic) && this._statusEquals(next.cam, this._mediaState.cam)) return;
    this._mediaState = next;
    this._options.callbacks?.onMediaStateChanged?.(this.mediaState);
    this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).MediaStateUpdated, this.mediaState);
  }
  /**
   * Structural equality for two DeviceStatus values. Distinct error
   * statuses (different `reason` or `details`) are treated as distinct so a
   * status update fires when the underlying error changes, even if `state`
   * was already 'error'.
   */
  _statusEquals(a2, b2) {
    if (a2.state !== b2.state) return false;
    if (a2.state === "error" && b2.state === "error") return a2.reason === b2.reason && a2.details === b2.details;
    return true;
  }
  /**
   * Map a DeviceError onto a partial MediaState patch and apply it. Mirrors
   * daily-react's camera-error classifier — affected devices flip to an
   * `'error'` status carrying the reason and the original error payload.
   */
  _classifyAndApplyDeviceError(error) {
    const status = {
      state: "error",
      reason: $364c127d152b1085$var$deviceErrorReasonFromType(error.type),
      details: error.details
    };
    const patch = {};
    if (error.devices.includes("mic")) patch.mic = status;
    if (error.devices.includes("cam")) patch.cam = status;
    if (Object.keys(patch).length === 0) return;
    this._setMediaState(patch);
  }
  /**
   * Permissions API enrichment, run AFTER the transport's initDevices()
   * resolves. By that point the prompt (if any) has been dismissed, and the
   * Permissions API's `denied` answer is authoritative — it overrides any
   * under-reported DeviceError.
   *
   * Concrete case worth flagging: on a page where the user previously
   * blocked permissions, daily-js's `camera-error` only names whichever
   * device the transport tried first when re-initializing — even though
   * both are blocked. Re-querying here catches the missing one. Worth a
   * follow-up daily-js ticket.
   *
   * Silently no-ops where the API is unavailable (Safari, some mobile
   * browsers) or throws on an unsupported descriptor.
   */
  async _enrichFromPermissionsAPI() {
    const permissions = globalThis.navigator?.permissions;
    if (!permissions?.query) return;
    const query = permissions.query.bind(permissions);
    const patch = {};
    await Promise.all([
      "mic",
      "cam"
    ].map(async (kind) => {
      try {
        const result = await query({
          name: kind === "mic" ? "microphone" : "camera"
        });
        if (result.state === "denied") patch[kind] = {
          state: "error",
          reason: "blocked"
        };
      } catch {
      }
    }));
    if (Object.keys(patch).length > 0) this._setMediaState(patch);
  }
  /**
   * Internal wrapper around the transport's sendMessage method
   */
  _sendMessage(message) {
    if (!(0, $dfd757760e36925b$export$48f8227f1e7323f5)(message, this._transport.maxMessageSize)) {
      const msg = `Message data too large. Max size is ${this._transport.maxMessageSize}`;
      this._options.callbacks?.onError?.((0, $c0d10c4690969999$export$69aa9ab0334b212).error(msg, false));
      throw new $db6391dc7d757577$export$78e1011ee1942cf6(msg);
    }
    try {
      this._transport.sendMessage(message);
    } catch (error) {
      if (error instanceof Error) this._options.callbacks?.onError?.((0, $c0d10c4690969999$export$69aa9ab0334b212).error(error.message, false));
      else this._options.callbacks?.onError?.((0, $c0d10c4690969999$export$69aa9ab0334b212).error("Unknown error sending message", false));
      throw error;
    }
  }
  /**
   * Get the current state of the transport
   */
  get connected() {
    return [
      "connected",
      "ready"
    ].includes(this._transport.state);
  }
  get transport() {
    return this._transportWrapper.proxy;
  }
  get state() {
    return this._transport.state;
  }
  /**
   * Per-device device state (mic, cam). Independent of transport state.
   *
   * Updated by initDevices() and DeviceError events. Returns a snapshot — to
   * track changes, subscribe to RTVIEvent.MediaStateUpdated or pass an
   * onMediaStateChanged callback in the client constructor.
   */
  get mediaState() {
    return {
      mic: {
        ...this._mediaState.mic
      },
      cam: {
        ...this._mediaState.cam
      }
    };
  }
  /**
   * Whether initDevices() still has work to do. Returns true if any device
   * the caller opted into (enableMic / enableCam) is still 'uninitialized'.
   * Devices the caller opted out of are not considered — they stay
   * 'uninitialized' by design and must not gate the implicit init.
   *
   * Used internally by connect() / startBot() to decide whether to drive an
   * implicit initDevices(); exposed publicly so consumers (e.g. step 3's
   * useMediaState hook) can branch on the same logic.
   */
  needsInit() {
    if (this._options.enableMic !== false && this._mediaState.mic.state === "uninitialized") return true;
    if (this._options.enableCam !== false && this._mediaState.cam.state === "uninitialized") return true;
    return false;
  }
  get version() {
    return (0, /* @__PURE__ */ $parcel$interopDefault($e3bad9cc25e327f7$exports)).version;
  }
  /**
   * What the bot does in this session, from its `bot-ready` message.
   *
   * Undefined before `bot-ready`, after disconnecting, and for bots that don't
   * send capabilities (RTVI protocol older than 2.2.0). Within the object, a
   * missing field means the bot can't tell.
   */
  get botCapabilities() {
    return this._botCapabilities;
  }
  /**
   * Whether each kind of media can flow in this session, combining what the
   * transport supports with the bot's capabilities. Before `bot-ready` it
   * reflects only the transport. `false` rules a kind of media out; a missing
   * or `undefined` value means it isn't ruled out. Returns a snapshot — to
   * track changes, subscribe to RTVIEvent.MediaSupportUpdated or pass an
   * onMediaSupportChanged callback in the client constructor.
   */
  get mediaSupport() {
    return (0, $2c5dde0c5bd6f5d0$export$84ac7cc1f1135f74)(this._transport.mediaSupport ?? {}, this._botCapabilities);
  }
  // ------ Device methods
  async getAllMics() {
    return await this._transport.getAllMics();
  }
  async getAllCams() {
    return await this._transport.getAllCams();
  }
  async getAllSpeakers() {
    return await this._transport.getAllSpeakers();
  }
  get selectedMic() {
    return this._transport.selectedMic;
  }
  get selectedCam() {
    try {
      return this._transport.selectedCam;
    } catch (e2) {
      if (e2 instanceof $db6391dc7d757577$export$bd0820eb8444fcd9) {
        this._options.callbacks?.onUnsupportedFeature?.(e2);
        return {};
      }
      throw e2;
    }
  }
  get selectedSpeaker() {
    return this._transport.selectedSpeaker;
  }
  updateMic(micId) {
    this._transport.updateMic(micId);
  }
  updateCam(camId) {
    this._transport.updateCam(camId);
  }
  updateSpeaker(speakerId) {
    this._transport.updateSpeaker(speakerId);
  }
  enableMic(enable) {
    this._transport.enableMic(enable);
  }
  get isMicEnabled() {
    return this._transport.isMicEnabled;
  }
  enableCam(enable) {
    try {
      this._transport.enableCam(enable);
    } catch (e2) {
      if (e2 instanceof $db6391dc7d757577$export$bd0820eb8444fcd9) this._options.callbacks?.onUnsupportedFeature?.(e2);
      else throw e2;
    }
  }
  get isCamEnabled() {
    return this._transport.isCamEnabled;
  }
  tracks() {
    return this._transport.tracks();
  }
  enableScreenShare(enable) {
    try {
      return this._transport.enableScreenShare(enable);
    } catch (e2) {
      if (e2 instanceof $db6391dc7d757577$export$bd0820eb8444fcd9) this._options.callbacks?.onUnsupportedFeature?.(e2);
      else throw e2;
    }
  }
  get isSharingScreen() {
    return this._transport.isSharingScreen;
  }
  // ------ Messages
  /**
   * Directly send a message to the bot via the transport.
   * Do not await a response.
   * @param msgType - a string representing the message type
   * @param data - a dictionary of data to send with the message
   */
  sendClientMessage(msgType, data) {
    this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).CLIENT_MESSAGE, {
      t: msgType,
      d: data
    }));
  }
  /**
   * Send a named UI event to the server as a first-class RTVI
   * `ui-event` message.
   *
   * @param event - App-defined event.
   * @param payload - App-defined payload. Optional.
   */
  sendUIEvent(event, payload) {
    const data = {
      event,
      payload
    };
    this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).UI_EVENT, data));
  }
  /**
   * Send DTMF tones to the server as first-class RTVI `dtmf` messages.
   *
   * Accepts a single key or a sequence of keys (e.g. "123#"). Bots on
   * RTVI protocol 2.1.0+ receive the keys as a single message; 2.0.x
   * bots receive one legacy `{button}` message per key. Bots older than
   * 2.0.0 don't support DTMF at all.
   *
   * @param dtmf - The DTMF key(s) to send (0-9, *, or #).
   */
  sendDTMF(dtmf) {
    if (!/^[0-9*#]+$/.test(dtmf)) throw new $db6391dc7d757577$export$59b4786f333aac02(`Invalid DTMF sequence "${dtmf}". Only 0-9, * and # are allowed.`);
    if (this._botVersion[0] < 2) throw new $db6391dc7d757577$export$bd0820eb8444fcd9("DTMF", "bot", "requires RTVI protocol 2.0.0+");
    const buttons = [
      ...dtmf
    ];
    if (this._botVersion[0] === 2 && this._botVersion[1] < 1) for (const button of buttons) this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).DTMF, {
      button
    }));
    else {
      const data = {
        buttons
      };
      this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).DTMF, data));
    }
  }
  /**
   * Start streaming UI snapshots to the server as
   * first-class `ui-snapshot` RTVI messages.
   *
   * Calling this again replaces any existing managed streamer with
   * the new options.
   */
  startUISnapshotStream(options = {}) {
    this.stopUISnapshotStream();
    this._uiSnapshotStreamer = new (0, $4a4f32f44a93ea38$export$d1b25383c8328718)((snapshot) => {
      if (this.state !== "ready") {
        this._pendingUISnapshot = snapshot;
        return;
      }
      this._sendUISnapshot(snapshot);
    }, options);
    this._uiSnapshotStreamer.start();
  }
  /**
   * Stop the managed UI snapshot stream, if one is active.
   */
  stopUISnapshotStream() {
    this._uiSnapshotStreamer?.stop();
    this._uiSnapshotStreamer = void 0;
    this._pendingUISnapshot = void 0;
  }
  _sendUISnapshot(snapshot) {
    const data = {
      tree: snapshot
    };
    this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).UI_SNAPSHOT, data));
  }
  _flushPendingUISnapshot() {
    if (!this._pendingUISnapshot || this.state !== "ready") return;
    const snapshot = this._pendingUISnapshot;
    this._pendingUISnapshot = void 0;
    this._sendUISnapshot(snapshot);
  }
  /**
   * Ask the server to cancel an in-flight UI job group.
   *
   * @param jobId - Shared job identifier of the group to cancel.
   * @param reason - Optional human-readable reason logged on the server.
   */
  cancelUIJobGroup(jobId, reason) {
    const payload = {
      job_id: jobId
    };
    if (reason !== void 0) payload.reason = reason;
    this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).UI_CANCEL_JOB_GROUP, payload));
  }
  /**
   * Directly send a message to the bot via the transport.
   * Wait for and return the response.
   * @param msgType - a string representing the message type
   * @param data - a dictionary of data to send with the message
   * @param timeout - optional timeout in milliseconds for the response
   */
  async sendClientRequest(msgType, data, timeout) {
    const msgData = {
      t: msgType,
      d: data
    };
    const response = await this._messageDispatcher.dispatch(msgData, (0, $c0d10c4690969999$export$38b3db05cbf0e240).CLIENT_MESSAGE, timeout);
    const ret_data = response.data;
    return ret_data.d;
  }
  registerFunctionCallHandler(functionName, callback) {
    this._functionCallCallbacks[functionName] = callback;
  }
  unregisterFunctionCallHandler(functionName) {
    delete this._functionCallCallbacks[functionName];
  }
  unregisterAllFunctionCallHandlers() {
    this._functionCallCallbacks = {};
  }
  async appendToContext(context) {
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("appendToContext() is deprecated. Use sendText() instead.");
    await this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).APPEND_TO_CONTEXT, {
      role: context.role,
      content: context.content,
      run_immediately: context.run_immediately
    }));
    return true;
  }
  /**
   * Sends text to the bot as if the user typed it.
   *
   * @returns The id of the send-text message. A bot of RTVI 2.2.0 or later
   * with user input turned on acknowledges it with a `user-input` message of
   * type `chat` that carries this id as `msg_id`.
   */
  async sendText(content, options = {}) {
    const message = new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).SEND_TEXT, {
      content,
      options
    });
    await this._sendMessage(message);
    return message.id;
  }
  async sendFile(file, content, options = {}) {
    this._assertBotSupportsSendFile();
    const rawMime = file instanceof File ? file.type : file.format.toLowerCase();
    const mimeType = rawMime in (0, $c0d10c4690969999$export$bd91f890380b07f1) ? (0, $c0d10c4690969999$export$bd91f890380b07f1)[rawMime] : rawMime;
    const resolved = file instanceof File ? await this._resolveBrowserFile(file, mimeType) : await this._resolveRTVIFile(file, mimeType);
    await this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).SEND_FILE, {
      file: resolved,
      content,
      options
    }));
  }
  _assertBotSupportsSendFile() {
    if (this._botVersion[0] < 2 || this._botVersion[0] === 2 && this._botVersion[1] < 2) throw new $db6391dc7d757577$export$bd0820eb8444fcd9("sendFile", "bot", "requires RTVI protocol 2.2.0+");
  }
  _resolveBrowserFile(file, mimeType) {
    const estimatedEncodedSize = Math.ceil(file.size * 1.37) + 1e3;
    if (estimatedEncodedSize > this._transport.maxMessageSize) return this._uploadFile(file);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new $db6391dc7d757577$export$59b4786f333aac02("Could not read file data"));
      reader.onload = async (e2) => {
        try {
          if (!e2.target?.result) throw new $db6391dc7d757577$export$59b4786f333aac02("Could not read file data");
          const dataUrl = e2.target.result;
          const base64Data = dataUrl.split(",")[1] ?? dataUrl;
          resolve({
            name: file.name,
            format: mimeType,
            source: {
              type: "bytes",
              bytes: base64Data
            }
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  }
  async _resolveRTVIFile(file, mimeType) {
    const normalized = {
      ...file,
      format: mimeType
    };
    if (normalized.source.type !== "bytes") return normalized;
    const estimatedSize = normalized.source.bytes.length + 1e3;
    if (estimatedSize <= this._transport.maxMessageSize) return normalized;
    const byteString = atob(normalized.source.bytes.split(",")[1] || normalized.source.bytes);
    const ab = new ArrayBuffer(byteString.length);
    const ia2 = new Uint8Array(ab);
    for (let i2 = 0; i2 < byteString.length; i2++) ia2[i2] = byteString.charCodeAt(i2);
    const blob = new Blob([
      ab
    ], {
      type: mimeType
    });
    const uploadable = new File([
      blob
    ], file.name || "uploaded_file", {
      type: mimeType
    });
    return this._uploadFile(uploadable);
  }
  /**
   * Parse the file-upload endpoint advertised by the start-bot response,
   * tolerating both the camelCase key the pipecat runner and Pipecat Cloud
   * return and a snake_case variant. Not part of the RTVI contract — a
   * backend that doesn't support uploads simply doesn't advertise one.
   */
  get _advertisedFileUploadUrl() {
    const response = this._transport.startBotResponse;
    if (!response || typeof response !== "object") return void 0;
    const record = response;
    const url = record.fileUploadUrl ?? record.file_upload_url;
    return typeof url === "string" ? url : void 0;
  }
  /**
   * Upload a file to the uploads endpoint the start-bot response advertised
   * or, failing that, the fileUploadEndpoint client option. Called by
   * sendFile() when a file is too large to send inline; the returned
   * RTVIFile carries the url source the send-file message then uses.
   * @param file - The File to upload
   * @returns Promise resolving to RTVIFile with name, format, and FileUrl source
   */
  async _uploadFile(file) {
    const endpoint = this._advertisedFileUploadUrl ?? this._options.fileUploadEndpoint;
    if (!endpoint) throw new $db6391dc7d757577$export$59b4786f333aac02("Unable to determine upload URL: the start-bot response did not advertise a fileUploadUrl and no fileUploadEndpoint is set in PipecatClientOptions (file uploads may be disabled on the server)");
    const startBotParams = this._transport.startBotParams;
    let headers;
    let timeout;
    let base;
    if (startBotParams) {
      timeout = startBotParams.timeout;
      if (typeof Request !== "undefined" && startBotParams.endpoint instanceof Request) {
        headers = new Headers(startBotParams.endpoint.headers);
        base = startBotParams.endpoint.url;
      } else {
        headers = startBotParams.headers;
        base = startBotParams.endpoint?.toString();
      }
    }
    let uploadUrl;
    try {
      uploadUrl = new URL(endpoint, base).toString();
    } catch {
      throw new $db6391dc7d757577$export$59b4786f333aac02(`Unable to resolve upload URL "${endpoint}"` + (base ? ` against "${base}"` : " without a startBot endpoint"));
    }
    const formData = new FormData();
    formData.append("file", file);
    const request = new Request(uploadUrl, {
      method: "POST",
      mode: "cors",
      body: formData,
      headers: headers ? Object.fromEntries(headers.entries()) : void 0
    });
    const response = await (0, $d0e914667cc5346b$export$699251e5611cc6db)({
      endpoint: request,
      timeout
    }, this._abortController);
    return response;
  }
  /**
   * Disconnects the bot, but keeps the session alive
   */
  disconnectBot() {
    this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).DISCONNECT_BOT, {}));
  }
  handleMessage(ev) {
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[RTVI Message]", ev);
    switch (ev.type) {
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_READY: {
        const data = ev.data;
        const botVersion = data.version ? data.version.split(".").map(Number) : [
          0,
          0,
          0
        ];
        this._botVersion = botVersion;
        this._setBotCapabilities(data.capabilities);
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`[Pipecat Client] Bot is ready. Version: ${data.version}`);
        if (this._botVersion[0] < 2) (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn(`[Pipecat Client] Bot protocol version ${data.version} is older than this client (${0, $c0d10c4690969999$export$7bdaf0e0d661a8f5}). Compatibility issues may occur.`);
        this._connectResolve?.(ev.data);
        this._options.callbacks?.onBotReady?.(ev.data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).ERROR:
        this._options.callbacks?.onError?.(ev);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).SERVER_RESPONSE:
        this._messageDispatcher.resolve(ev);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).ERROR_RESPONSE: {
        const resp = this._messageDispatcher.reject(ev);
        this._options.callbacks?.onMessageError?.(resp);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).USER_STARTED_SPEAKING:
        this._options.callbacks?.onUserStartedSpeaking?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).USER_STOPPED_SPEAKING:
        this._options.callbacks?.onUserStoppedSpeaking?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_STARTED_SPEAKING:
        this._options.callbacks?.onBotStartedSpeaking?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_STOPPED_SPEAKING:
        this._options.callbacks?.onBotStoppedSpeaking?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).USER_MUTE_STARTED:
        this._options.callbacks?.onUserMuteStarted?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).USER_MUTE_STOPPED:
        this._options.callbacks?.onUserMuteStopped?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).USER_TRANSCRIPTION: {
        const TranscriptData = ev.data;
        this._options.callbacks?.onUserTranscript?.(TranscriptData);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).USER_LLM_TEXT: {
        const llmTextData = ev.data;
        this._options.callbacks?.onUserLlmText?.(llmTextData);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UserLlmText, llmTextData);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).USER_INPUT:
        this._options.callbacks?.onUserInput?.(ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_OUTPUT: {
        const data = ev.data;
        const outputType = data.output_type ?? data.text_type ?? data.aggregated_by;
        data.output_type ?? (data.output_type = outputType);
        data.text_type ?? (data.text_type = outputType);
        data.aggregated_by ?? (data.aggregated_by = outputType);
        this._options.callbacks?.onBotOutput?.(data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_TRANSCRIPTION:
        this._options.callbacks?.onBotTranscript?.(ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_LLM_TEXT:
        this._options.callbacks?.onBotLlmText?.(ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_LLM_STARTED:
        this._options.callbacks?.onBotLlmStarted?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_LLM_STOPPED:
        this._options.callbacks?.onBotLlmStopped?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_TTS_TEXT:
        this._options.callbacks?.onBotTtsText?.(ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_TTS_STARTED:
        this._options.callbacks?.onBotTtsStarted?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_TTS_STOPPED:
        this._options.callbacks?.onBotTtsStopped?.();
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).STT_RAW_TEXT:
        this._options.callbacks?.onSttRawText?.(ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).LLM_RAW_TEXT:
        this._options.callbacks?.onLlmRawText?.(ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).TTS_RAW_TEXT:
        this._options.callbacks?.onTtsRawText?.(ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).METRICS:
        this._options.callbacks?.onMetrics?.(ev.data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).Metrics, ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).SERVER_MESSAGE:
        this._options.callbacks?.onServerMessage?.(ev.data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).ServerMessage, ev.data);
        break;
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).UI_COMMAND: {
        const data = ev.data;
        this._options.callbacks?.onUICommand?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UICommand, data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).UI_JOB_GROUP: {
        const data = ev.data;
        this._options.callbacks?.onUIJobGroup?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).UIJobGroup, data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).LLM_FUNCTION_CALL_STARTED: {
        const data = ev.data;
        this._options.callbacks?.onLLMFunctionCallStarted?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).LLMFunctionCallStarted, data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).LLM_FUNCTION_CALL_IN_PROGRESS: {
        const data = ev.data;
        this._maybeTriggerFunctionCallCallback(data);
        this._options.callbacks?.onLLMFunctionCallInProgress?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).LLMFunctionCallInProgress, data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).LLM_FUNCTION_CALL_STOPPED: {
        const data = ev.data;
        this._options.callbacks?.onLLMFunctionCallStopped?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).LLMFunctionCallStopped, data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).LLM_FUNCTION_CALL: {
        const data = ev.data;
        const inProgressData = {
          function_name: data.function_name,
          tool_call_id: data.tool_call_id,
          arguments: data.args
        };
        this._maybeTriggerFunctionCallCallback(inProgressData);
        if (this._options.callbacks?.onLLMFunctionCall) {
          if (!this._llmFunctionCallWarned) {
            (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("[Pipecat Client] onLLMFunctionCall is deprecated. Please use onLLMFunctionCallInProgress instead.");
            this._llmFunctionCallWarned = true;
          }
        }
        this._options.callbacks?.onLLMFunctionCall?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).LLMFunctionCall, data);
        break;
      }
      case (0, $c0d10c4690969999$export$38b3db05cbf0e240).BOT_LLM_SEARCH_RESPONSE: {
        const data = ev.data;
        this._options.callbacks?.onBotLlmSearchResponse?.(data);
        this.emit((0, $c1b4da4af54f4fa1$export$6b4624d233c61fcb).BotLlmSearchResponse, data);
        break;
      }
      default:
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[Pipecat Client] Unrecognized message type", ev.type);
        break;
    }
  }
  _maybeTriggerFunctionCallCallback(data) {
    if (!data.function_name) return;
    const fc2 = this._functionCallCallbacks[data.function_name];
    if (fc2) {
      const params = {
        functionName: data.function_name ?? "",
        arguments: data.arguments ?? {}
      };
      fc2(params).then((result) => {
        if (result == void 0) return;
        this._sendMessage(new (0, $c0d10c4690969999$export$69aa9ab0334b212)((0, $c0d10c4690969999$export$38b3db05cbf0e240).LLM_FUNCTION_CALL_RESULT, {
          function_name: data.function_name,
          tool_call_id: data.tool_call_id,
          arguments: data.arguments ?? {},
          result
        }));
      }).catch((error) => {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).error("Error in function call callback", error);
      });
    }
  }
};
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$ebc0d747cf8770bc)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "startBot", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$ebc0d747cf8770bc)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "connect", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$ebc0d747cf8770bc)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "startBotAndConnect", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "sendClientMessage", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "sendUIEvent", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "sendDTMF", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "cancelUIJobGroup", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "sendClientRequest", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "appendToContext", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "sendText", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "sendFile", null);
$364c127d152b1085$var$__decorate([
  (0, $c68ef2498d1a7177$export$f1586721024c4dab)
], $364c127d152b1085$export$8f7f86a77535f7a3.prototype, "disconnectBot", null);
$parcel$exportWildcard($05fa7b586184a19c$exports, $4a4f32f44a93ea38$exports);
$parcel$exportWildcard($05fa7b586184a19c$exports, $364c127d152b1085$exports);
$parcel$exportWildcard($05fa7b586184a19c$exports, $769bb602511974a1$exports);
$parcel$exportWildcard($05fa7b586184a19c$exports, $e0900798b6cc045b$exports);
$parcel$exportWildcard($05fa7b586184a19c$exports, $d0e914667cc5346b$exports);
$parcel$exportWildcard($05fa7b586184a19c$exports, $7ef5cee66c377f4d$exports);
$parcel$exportWildcard($05fa7b586184a19c$exports, $dfd757760e36925b$exports);

// node_modules/@daily-co/daily-js/dist/daily-esm.js
function e(e2, t2) {
  if (!(e2 instanceof t2)) throw new TypeError("Cannot call a class as a function");
}
function t(e2) {
  return t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
    return typeof e3;
  } : function(e3) {
    return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
  }, t(e2);
}
function n(e2) {
  var n2 = (function(e3, n3) {
    if ("object" != t(e3) || !e3) return e3;
    var r2 = e3[Symbol.toPrimitive];
    if (void 0 !== r2) {
      var i2 = r2.call(e3, n3 || "default");
      if ("object" != t(i2)) return i2;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === n3 ? String : Number)(e3);
  })(e2, "string");
  return "symbol" == t(n2) ? n2 : n2 + "";
}
function r(e2, t2) {
  for (var r2 = 0; r2 < t2.length; r2++) {
    var i2 = t2[r2];
    i2.enumerable = i2.enumerable || false, i2.configurable = true, "value" in i2 && (i2.writable = true), Object.defineProperty(e2, n(i2.key), i2);
  }
}
function i(e2, t2, n2) {
  return t2 && r(e2.prototype, t2), n2 && r(e2, n2), Object.defineProperty(e2, "prototype", { writable: false }), e2;
}
function o(e2, n2) {
  if (n2 && ("object" == t(n2) || "function" == typeof n2)) return n2;
  if (void 0 !== n2) throw new TypeError("Derived constructors may only return object or undefined");
  return (function(e3) {
    if (void 0 === e3) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e3;
  })(e2);
}
function a(e2) {
  return a = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e3) {
    return e3.__proto__ || Object.getPrototypeOf(e3);
  }, a(e2);
}
function s(e2, t2) {
  return s = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e3, t3) {
    return e3.__proto__ = t3, e3;
  }, s(e2, t2);
}
function c(e2, t2) {
  if ("function" != typeof t2 && null !== t2) throw new TypeError("Super expression must either be null or a function");
  e2.prototype = Object.create(t2 && t2.prototype, { constructor: { value: e2, writable: true, configurable: true } }), Object.defineProperty(e2, "prototype", { writable: false }), t2 && s(e2, t2);
}
function l(e2, t2, r2) {
  return (t2 = n(t2)) in e2 ? Object.defineProperty(e2, t2, { value: r2, enumerable: true, configurable: true, writable: true }) : e2[t2] = r2, e2;
}
function u(e2, t2, n2, r2, i2, o2, a2) {
  try {
    var s2 = e2[o2](a2), c2 = s2.value;
  } catch (e3) {
    return void n2(e3);
  }
  s2.done ? t2(c2) : Promise.resolve(c2).then(r2, i2);
}
function d(e2) {
  return function() {
    var t2 = this, n2 = arguments;
    return new Promise(function(r2, i2) {
      var o2 = e2.apply(t2, n2);
      function a2(e3) {
        u(o2, r2, i2, a2, s2, "next", e3);
      }
      function s2(e3) {
        u(o2, r2, i2, a2, s2, "throw", e3);
      }
      a2(void 0);
    });
  };
}
function h(e2, t2) {
  if (null == e2) return {};
  var n2, r2, i2 = (function(e3, t3) {
    if (null == e3) return {};
    var n3 = {};
    for (var r3 in e3) if ({}.hasOwnProperty.call(e3, r3)) {
      if (-1 !== t3.indexOf(r3)) continue;
      n3[r3] = e3[r3];
    }
    return n3;
  })(e2, t2);
  if (Object.getOwnPropertySymbols) {
    var o2 = Object.getOwnPropertySymbols(e2);
    for (r2 = 0; r2 < o2.length; r2++) n2 = o2[r2], -1 === t2.indexOf(n2) && {}.propertyIsEnumerable.call(e2, n2) && (i2[n2] = e2[n2]);
  }
  return i2;
}
function p(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
function f(e2, t2) {
  if (e2) {
    if ("string" == typeof e2) return p(e2, t2);
    var n2 = {}.toString.call(e2).slice(8, -1);
    return "Object" === n2 && e2.constructor && (n2 = e2.constructor.name), "Map" === n2 || "Set" === n2 ? Array.from(e2) : "Arguments" === n2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2) ? p(e2, t2) : void 0;
  }
}
function v(e2, t2) {
  return (function(e3) {
    if (Array.isArray(e3)) return e3;
  })(e2) || (function(e3, t3) {
    var n2 = null == e3 ? null : "undefined" != typeof Symbol && e3[Symbol.iterator] || e3["@@iterator"];
    if (null != n2) {
      var r2, i2, o2, a2, s2 = [], c2 = true, l2 = false;
      try {
        if (o2 = (n2 = n2.call(e3)).next, 0 === t3) {
          if (Object(n2) !== n2) return;
          c2 = false;
        } else for (; !(c2 = (r2 = o2.call(n2)).done) && (s2.push(r2.value), s2.length !== t3); c2 = true) ;
      } catch (e4) {
        l2 = true, i2 = e4;
      } finally {
        try {
          if (!c2 && null != n2.return && (a2 = n2.return(), Object(a2) !== a2)) return;
        } finally {
          if (l2) throw i2;
        }
      }
      return s2;
    }
  })(e2, t2) || f(e2, t2) || (function() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  })();
}
function g(e2) {
  return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
}
var m;
var y = { exports: {} };
var b = (function() {
  if (m) return y.exports;
  m = 1;
  var e2, t2 = "object" == typeof Reflect ? Reflect : null, n2 = t2 && "function" == typeof t2.apply ? t2.apply : function(e3, t3, n3) {
    return Function.prototype.apply.call(e3, t3, n3);
  };
  e2 = t2 && "function" == typeof t2.ownKeys ? t2.ownKeys : Object.getOwnPropertySymbols ? function(e3) {
    return Object.getOwnPropertyNames(e3).concat(Object.getOwnPropertySymbols(e3));
  } : function(e3) {
    return Object.getOwnPropertyNames(e3);
  };
  var r2 = Number.isNaN || function(e3) {
    return e3 != e3;
  };
  function i2() {
    i2.init.call(this);
  }
  y.exports = i2, y.exports.once = function(e3, t3) {
    return new Promise(function(n3, r3) {
      function i3(n4) {
        e3.removeListener(t3, o3), r3(n4);
      }
      function o3() {
        "function" == typeof e3.removeListener && e3.removeListener("error", i3), n3([].slice.call(arguments));
      }
      f2(e3, t3, o3, { once: true }), "error" !== t3 && (function(e4, t4, n4) {
        "function" == typeof e4.on && f2(e4, "error", t4, n4);
      })(e3, i3, { once: true });
    });
  }, i2.EventEmitter = i2, i2.prototype._events = void 0, i2.prototype._eventsCount = 0, i2.prototype._maxListeners = void 0;
  var o2 = 10;
  function a2(e3) {
    if ("function" != typeof e3) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e3);
  }
  function s2(e3) {
    return void 0 === e3._maxListeners ? i2.defaultMaxListeners : e3._maxListeners;
  }
  function c2(e3, t3, n3, r3) {
    var i3, o3, c3, l3;
    if (a2(n3), void 0 === (o3 = e3._events) ? (o3 = e3._events = /* @__PURE__ */ Object.create(null), e3._eventsCount = 0) : (void 0 !== o3.newListener && (e3.emit("newListener", t3, n3.listener ? n3.listener : n3), o3 = e3._events), c3 = o3[t3]), void 0 === c3) c3 = o3[t3] = n3, ++e3._eventsCount;
    else if ("function" == typeof c3 ? c3 = o3[t3] = r3 ? [n3, c3] : [c3, n3] : r3 ? c3.unshift(n3) : c3.push(n3), (i3 = s2(e3)) > 0 && c3.length > i3 && !c3.warned) {
      c3.warned = true;
      var u3 = new Error("Possible EventEmitter memory leak detected. " + c3.length + " " + String(t3) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u3.name = "MaxListenersExceededWarning", u3.emitter = e3, u3.type = t3, u3.count = c3.length, l3 = u3, console && console.warn && console.warn(l3);
    }
    return e3;
  }
  function l2() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  function u2(e3, t3, n3) {
    var r3 = { fired: false, wrapFn: void 0, target: e3, type: t3, listener: n3 }, i3 = l2.bind(r3);
    return i3.listener = n3, r3.wrapFn = i3, i3;
  }
  function d2(e3, t3, n3) {
    var r3 = e3._events;
    if (void 0 === r3) return [];
    var i3 = r3[t3];
    return void 0 === i3 ? [] : "function" == typeof i3 ? n3 ? [i3.listener || i3] : [i3] : n3 ? (function(e4) {
      for (var t4 = new Array(e4.length), n4 = 0; n4 < t4.length; ++n4) t4[n4] = e4[n4].listener || e4[n4];
      return t4;
    })(i3) : p2(i3, i3.length);
  }
  function h2(e3) {
    var t3 = this._events;
    if (void 0 !== t3) {
      var n3 = t3[e3];
      if ("function" == typeof n3) return 1;
      if (void 0 !== n3) return n3.length;
    }
    return 0;
  }
  function p2(e3, t3) {
    for (var n3 = new Array(t3), r3 = 0; r3 < t3; ++r3) n3[r3] = e3[r3];
    return n3;
  }
  function f2(e3, t3, n3, r3) {
    if ("function" == typeof e3.on) r3.once ? e3.once(t3, n3) : e3.on(t3, n3);
    else {
      if ("function" != typeof e3.addEventListener) throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof e3);
      e3.addEventListener(t3, function i3(o3) {
        r3.once && e3.removeEventListener(t3, i3), n3(o3);
      });
    }
  }
  return Object.defineProperty(i2, "defaultMaxListeners", { enumerable: true, get: function() {
    return o2;
  }, set: function(e3) {
    if ("number" != typeof e3 || e3 < 0 || r2(e3)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e3 + ".");
    o2 = e3;
  } }), i2.init = function() {
    void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  }, i2.prototype.setMaxListeners = function(e3) {
    if ("number" != typeof e3 || e3 < 0 || r2(e3)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e3 + ".");
    return this._maxListeners = e3, this;
  }, i2.prototype.getMaxListeners = function() {
    return s2(this);
  }, i2.prototype.emit = function(e3) {
    for (var t3 = [], r3 = 1; r3 < arguments.length; r3++) t3.push(arguments[r3]);
    var i3 = "error" === e3, o3 = this._events;
    if (void 0 !== o3) i3 = i3 && void 0 === o3.error;
    else if (!i3) return false;
    if (i3) {
      var a3;
      if (t3.length > 0 && (a3 = t3[0]), a3 instanceof Error) throw a3;
      var s3 = new Error("Unhandled error." + (a3 ? " (" + a3.message + ")" : ""));
      throw s3.context = a3, s3;
    }
    var c3 = o3[e3];
    if (void 0 === c3) return false;
    if ("function" == typeof c3) n2(c3, this, t3);
    else {
      var l3 = c3.length, u3 = p2(c3, l3);
      for (r3 = 0; r3 < l3; ++r3) n2(u3[r3], this, t3);
    }
    return true;
  }, i2.prototype.addListener = function(e3, t3) {
    return c2(this, e3, t3, false);
  }, i2.prototype.on = i2.prototype.addListener, i2.prototype.prependListener = function(e3, t3) {
    return c2(this, e3, t3, true);
  }, i2.prototype.once = function(e3, t3) {
    return a2(t3), this.on(e3, u2(this, e3, t3)), this;
  }, i2.prototype.prependOnceListener = function(e3, t3) {
    return a2(t3), this.prependListener(e3, u2(this, e3, t3)), this;
  }, i2.prototype.removeListener = function(e3, t3) {
    var n3, r3, i3, o3, s3;
    if (a2(t3), void 0 === (r3 = this._events)) return this;
    if (void 0 === (n3 = r3[e3])) return this;
    if (n3 === t3 || n3.listener === t3) 0 === --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : (delete r3[e3], r3.removeListener && this.emit("removeListener", e3, n3.listener || t3));
    else if ("function" != typeof n3) {
      for (i3 = -1, o3 = n3.length - 1; o3 >= 0; o3--) if (n3[o3] === t3 || n3[o3].listener === t3) {
        s3 = n3[o3].listener, i3 = o3;
        break;
      }
      if (i3 < 0) return this;
      0 === i3 ? n3.shift() : (function(e4, t4) {
        for (; t4 + 1 < e4.length; t4++) e4[t4] = e4[t4 + 1];
        e4.pop();
      })(n3, i3), 1 === n3.length && (r3[e3] = n3[0]), void 0 !== r3.removeListener && this.emit("removeListener", e3, s3 || t3);
    }
    return this;
  }, i2.prototype.off = i2.prototype.removeListener, i2.prototype.removeAllListeners = function(e3) {
    var t3, n3, r3;
    if (void 0 === (n3 = this._events)) return this;
    if (void 0 === n3.removeListener) return 0 === arguments.length ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : void 0 !== n3[e3] && (0 === --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : delete n3[e3]), this;
    if (0 === arguments.length) {
      var i3, o3 = Object.keys(n3);
      for (r3 = 0; r3 < o3.length; ++r3) "removeListener" !== (i3 = o3[r3]) && this.removeAllListeners(i3);
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if ("function" == typeof (t3 = n3[e3])) this.removeListener(e3, t3);
    else if (void 0 !== t3) for (r3 = t3.length - 1; r3 >= 0; r3--) this.removeListener(e3, t3[r3]);
    return this;
  }, i2.prototype.listeners = function(e3) {
    return d2(this, e3, true);
  }, i2.prototype.rawListeners = function(e3) {
    return d2(this, e3, false);
  }, i2.listenerCount = function(e3, t3) {
    return "function" == typeof e3.listenerCount ? e3.listenerCount(t3) : h2.call(e3, t3);
  }, i2.prototype.listenerCount = h2, i2.prototype.eventNames = function() {
    return this._eventsCount > 0 ? e2(this._events) : [];
  }, y.exports;
})();
var _ = g(b);
var w = Object.prototype.hasOwnProperty;
function k(e2, t2, n2) {
  for (n2 of e2.keys()) if (S(n2, t2)) return n2;
}
function S(e2, t2) {
  var n2, r2, i2;
  if (e2 === t2) return true;
  if (e2 && t2 && (n2 = e2.constructor) === t2.constructor) {
    if (n2 === Date) return e2.getTime() === t2.getTime();
    if (n2 === RegExp) return e2.toString() === t2.toString();
    if (n2 === Array) {
      if ((r2 = e2.length) === t2.length) for (; r2-- && S(e2[r2], t2[r2]); ) ;
      return -1 === r2;
    }
    if (n2 === Set) {
      if (e2.size !== t2.size) return false;
      for (r2 of e2) {
        if ((i2 = r2) && "object" == typeof i2 && !(i2 = k(t2, i2))) return false;
        if (!t2.has(i2)) return false;
      }
      return true;
    }
    if (n2 === Map) {
      if (e2.size !== t2.size) return false;
      for (r2 of e2) {
        if ((i2 = r2[0]) && "object" == typeof i2 && !(i2 = k(t2, i2))) return false;
        if (!S(r2[1], t2.get(i2))) return false;
      }
      return true;
    }
    if (n2 === ArrayBuffer) e2 = new Uint8Array(e2), t2 = new Uint8Array(t2);
    else if (n2 === DataView) {
      if ((r2 = e2.byteLength) === t2.byteLength) for (; r2-- && e2.getInt8(r2) === t2.getInt8(r2); ) ;
      return -1 === r2;
    }
    if (ArrayBuffer.isView(e2)) {
      if ((r2 = e2.byteLength) === t2.byteLength) for (; r2-- && e2[r2] === t2[r2]; ) ;
      return -1 === r2;
    }
    if (!n2 || "object" == typeof e2) {
      for (n2 in r2 = 0, e2) {
        if (w.call(e2, n2) && ++r2 && !w.call(t2, n2)) return false;
        if (!(n2 in t2) || !S(e2[n2], t2[n2])) return false;
      }
      return Object.keys(t2).length === r2;
    }
  }
  return e2 != e2 && t2 != t2;
}
var M = { AmazonBot: "amazonbot", "Amazon Silk": "amazon_silk", "Android Browser": "android", BaiduSpider: "baiduspider", Bada: "bada", BingCrawler: "bingcrawler", Brave: "brave", BlackBerry: "blackberry", "ChatGPT-User": "chatgpt_user", Chrome: "chrome", ClaudeBot: "claudebot", Chromium: "chromium", Diffbot: "diffbot", DuckDuckBot: "duckduckbot", DuckDuckGo: "duckduckgo", Electron: "electron", Epiphany: "epiphany", FacebookExternalHit: "facebookexternalhit", Firefox: "firefox", Focus: "focus", Generic: "generic", "Google Search": "google_search", Googlebot: "googlebot", GPTBot: "gptbot", "Internet Explorer": "ie", InternetArchiveCrawler: "internetarchivecrawler", "K-Meleon": "k_meleon", LibreWolf: "librewolf", Linespider: "linespider", Maxthon: "maxthon", "Meta-ExternalAds": "meta_externalads", "Meta-ExternalAgent": "meta_externalagent", "Meta-ExternalFetcher": "meta_externalfetcher", "Meta-WebIndexer": "meta_webindexer", "Microsoft Edge": "edge", "MZ Browser": "mz", "NAVER Whale Browser": "naver", "OAI-SearchBot": "oai_searchbot", Omgilibot: "omgilibot", Opera: "opera", "Opera Coast": "opera_coast", "Pale Moon": "pale_moon", PerplexityBot: "perplexitybot", "Perplexity-User": "perplexity_user", PhantomJS: "phantomjs", PingdomBot: "pingdombot", Puffin: "puffin", QQ: "qq", QQLite: "qqlite", QupZilla: "qupzilla", Roku: "roku", Safari: "safari", Sailfish: "sailfish", "Samsung Internet for Android": "samsung_internet", SlackBot: "slackbot", SeaMonkey: "seamonkey", Sleipnir: "sleipnir", "Sogou Browser": "sogou", Swing: "swing", Tizen: "tizen", "UC Browser": "uc", Vivaldi: "vivaldi", "WebOS Browser": "webos", WeChat: "wechat", YahooSlurp: "yahooslurp", "Yandex Browser": "yandex", YandexBot: "yandexbot", YouBot: "youbot" };
var E = { amazonbot: "AmazonBot", amazon_silk: "Amazon Silk", android: "Android Browser", baiduspider: "BaiduSpider", bada: "Bada", bingcrawler: "BingCrawler", blackberry: "BlackBerry", brave: "Brave", chatgpt_user: "ChatGPT-User", chrome: "Chrome", claudebot: "ClaudeBot", chromium: "Chromium", diffbot: "Diffbot", duckduckbot: "DuckDuckBot", duckduckgo: "DuckDuckGo", edge: "Microsoft Edge", electron: "Electron", epiphany: "Epiphany", facebookexternalhit: "FacebookExternalHit", firefox: "Firefox", focus: "Focus", generic: "Generic", google_search: "Google Search", googlebot: "Googlebot", gptbot: "GPTBot", ie: "Internet Explorer", internetarchivecrawler: "InternetArchiveCrawler", k_meleon: "K-Meleon", librewolf: "LibreWolf", linespider: "Linespider", maxthon: "Maxthon", meta_externalads: "Meta-ExternalAds", meta_externalagent: "Meta-ExternalAgent", meta_externalfetcher: "Meta-ExternalFetcher", meta_webindexer: "Meta-WebIndexer", mz: "MZ Browser", naver: "NAVER Whale Browser", oai_searchbot: "OAI-SearchBot", omgilibot: "Omgilibot", opera: "Opera", opera_coast: "Opera Coast", pale_moon: "Pale Moon", perplexitybot: "PerplexityBot", perplexity_user: "Perplexity-User", phantomjs: "PhantomJS", pingdombot: "PingdomBot", puffin: "Puffin", qq: "QQ Browser", qqlite: "QQ Browser Lite", qupzilla: "QupZilla", roku: "Roku", safari: "Safari", sailfish: "Sailfish", samsung_internet: "Samsung Internet for Android", seamonkey: "SeaMonkey", slackbot: "SlackBot", sleipnir: "Sleipnir", sogou: "Sogou Browser", swing: "Swing", tizen: "Tizen", uc: "UC Browser", vivaldi: "Vivaldi", webos: "WebOS Browser", wechat: "WeChat", yahooslurp: "YahooSlurp", yandex: "Yandex Browser", yandexbot: "YandexBot", youbot: "YouBot" };
var C = { bot: "bot", desktop: "desktop", mobile: "mobile", tablet: "tablet", tv: "tv" };
var T = { Android: "Android", Bada: "Bada", BlackBerry: "BlackBerry", ChromeOS: "Chrome OS", HarmonyOS: "HarmonyOS", iOS: "iOS", Linux: "Linux", MacOS: "macOS", PlayStation4: "PlayStation 4", Roku: "Roku", Tizen: "Tizen", WebOS: "WebOS", Windows: "Windows", WindowsPhone: "Windows Phone" };
var O = { Blink: "Blink", EdgeHTML: "EdgeHTML", Gecko: "Gecko", Presto: "Presto", Trident: "Trident", WebKit: "WebKit" };
var P = class _P {
  static getFirstMatch(e2, t2) {
    const n2 = t2.match(e2);
    return n2 && n2.length > 0 && n2[1] || "";
  }
  static getSecondMatch(e2, t2) {
    const n2 = t2.match(e2);
    return n2 && n2.length > 1 && n2[2] || "";
  }
  static matchAndReturnConst(e2, t2, n2) {
    if (e2.test(t2)) return n2;
  }
  static getWindowsVersionName(e2) {
    switch (e2) {
      case "NT":
        return "NT";
      case "XP":
      case "NT 5.1":
        return "XP";
      case "NT 5.0":
        return "2000";
      case "NT 5.2":
        return "2003";
      case "NT 6.0":
        return "Vista";
      case "NT 6.1":
        return "7";
      case "NT 6.2":
        return "8";
      case "NT 6.3":
        return "8.1";
      case "NT 10.0":
        return "10";
      default:
        return;
    }
  }
  static getMacOSVersionName(e2) {
    const t2 = e2.split(".").splice(0, 2).map((e3) => parseInt(e3, 10) || 0);
    t2.push(0);
    const n2 = t2[0], r2 = t2[1];
    if (10 === n2) switch (r2) {
      case 5:
        return "Leopard";
      case 6:
        return "Snow Leopard";
      case 7:
        return "Lion";
      case 8:
        return "Mountain Lion";
      case 9:
        return "Mavericks";
      case 10:
        return "Yosemite";
      case 11:
        return "El Capitan";
      case 12:
        return "Sierra";
      case 13:
        return "High Sierra";
      case 14:
        return "Mojave";
      case 15:
        return "Catalina";
      default:
        return;
    }
    switch (n2) {
      case 11:
        return "Big Sur";
      case 12:
        return "Monterey";
      case 13:
        return "Ventura";
      case 14:
        return "Sonoma";
      case 15:
        return "Sequoia";
      default:
        return;
    }
  }
  static getAndroidVersionName(e2) {
    const t2 = e2.split(".").splice(0, 2).map((e3) => parseInt(e3, 10) || 0);
    if (t2.push(0), !(1 === t2[0] && t2[1] < 5)) return 1 === t2[0] && t2[1] < 6 ? "Cupcake" : 1 === t2[0] && t2[1] >= 6 ? "Donut" : 2 === t2[0] && t2[1] < 2 ? "Eclair" : 2 === t2[0] && 2 === t2[1] ? "Froyo" : 2 === t2[0] && t2[1] > 2 ? "Gingerbread" : 3 === t2[0] ? "Honeycomb" : 4 === t2[0] && t2[1] < 1 ? "Ice Cream Sandwich" : 4 === t2[0] && t2[1] < 4 ? "Jelly Bean" : 4 === t2[0] && t2[1] >= 4 ? "KitKat" : 5 === t2[0] ? "Lollipop" : 6 === t2[0] ? "Marshmallow" : 7 === t2[0] ? "Nougat" : 8 === t2[0] ? "Oreo" : 9 === t2[0] ? "Pie" : void 0;
  }
  static getVersionPrecision(e2) {
    return e2.split(".").length;
  }
  static compareVersions(e2, t2, n2 = false) {
    const r2 = _P.getVersionPrecision(e2), i2 = _P.getVersionPrecision(t2);
    let o2 = Math.max(r2, i2), a2 = 0;
    const s2 = _P.map([e2, t2], (e3) => {
      const t3 = o2 - _P.getVersionPrecision(e3), n3 = e3 + new Array(t3 + 1).join(".0");
      return _P.map(n3.split("."), (e4) => new Array(20 - e4.length).join("0") + e4).reverse();
    });
    for (n2 && (a2 = o2 - Math.min(r2, i2)), o2 -= 1; o2 >= a2; ) {
      if (s2[0][o2] > s2[1][o2]) return 1;
      if (s2[0][o2] === s2[1][o2]) {
        if (o2 === a2) return 0;
        o2 -= 1;
      } else if (s2[0][o2] < s2[1][o2]) return -1;
    }
  }
  static map(e2, t2) {
    const n2 = [];
    let r2;
    if (Array.prototype.map) return Array.prototype.map.call(e2, t2);
    for (r2 = 0; r2 < e2.length; r2 += 1) n2.push(t2(e2[r2]));
    return n2;
  }
  static find(e2, t2) {
    let n2, r2;
    if (Array.prototype.find) return Array.prototype.find.call(e2, t2);
    for (n2 = 0, r2 = e2.length; n2 < r2; n2 += 1) {
      const r3 = e2[n2];
      if (t2(r3, n2)) return r3;
    }
  }
  static assign(e2, ...t2) {
    const n2 = e2;
    let r2, i2;
    if (Object.assign) return Object.assign(e2, ...t2);
    for (r2 = 0, i2 = t2.length; r2 < i2; r2 += 1) {
      const e3 = t2[r2];
      if ("object" == typeof e3 && null !== e3) {
        Object.keys(e3).forEach((t3) => {
          n2[t3] = e3[t3];
        });
      }
    }
    return e2;
  }
  static getBrowserAlias(e2) {
    return M[e2];
  }
  static getBrowserTypeByAlias(e2) {
    return E[e2] || "";
  }
};
var A = /version\/(\d+(\.?_?\d+)+)/i;
var x = [{ test: [/gptbot/i], describe(e2) {
  const t2 = { name: "GPTBot" }, n2 = P.getFirstMatch(/gptbot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/chatgpt-user/i], describe(e2) {
  const t2 = { name: "ChatGPT-User" }, n2 = P.getFirstMatch(/chatgpt-user\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/oai-searchbot/i], describe(e2) {
  const t2 = { name: "OAI-SearchBot" }, n2 = P.getFirstMatch(/oai-searchbot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/claudebot/i, /claude-web/i, /claude-user/i, /claude-searchbot/i], describe(e2) {
  const t2 = { name: "ClaudeBot" }, n2 = P.getFirstMatch(/(?:claudebot|claude-web|claude-user|claude-searchbot)\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/omgilibot/i, /webzio-extended/i], describe(e2) {
  const t2 = { name: "Omgilibot" }, n2 = P.getFirstMatch(/(?:omgilibot|webzio-extended)\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/diffbot/i], describe(e2) {
  const t2 = { name: "Diffbot" }, n2 = P.getFirstMatch(/diffbot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/perplexitybot/i], describe(e2) {
  const t2 = { name: "PerplexityBot" }, n2 = P.getFirstMatch(/perplexitybot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/perplexity-user/i], describe(e2) {
  const t2 = { name: "Perplexity-User" }, n2 = P.getFirstMatch(/perplexity-user\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/youbot/i], describe(e2) {
  const t2 = { name: "YouBot" }, n2 = P.getFirstMatch(/youbot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/meta-webindexer/i], describe(e2) {
  const t2 = { name: "Meta-WebIndexer" }, n2 = P.getFirstMatch(/meta-webindexer\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/meta-externalads/i], describe(e2) {
  const t2 = { name: "Meta-ExternalAds" }, n2 = P.getFirstMatch(/meta-externalads\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/meta-externalagent/i], describe(e2) {
  const t2 = { name: "Meta-ExternalAgent" }, n2 = P.getFirstMatch(/meta-externalagent\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/meta-externalfetcher/i], describe(e2) {
  const t2 = { name: "Meta-ExternalFetcher" }, n2 = P.getFirstMatch(/meta-externalfetcher\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/googlebot/i], describe(e2) {
  const t2 = { name: "Googlebot" }, n2 = P.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/linespider/i], describe(e2) {
  const t2 = { name: "Linespider" }, n2 = P.getFirstMatch(/(?:linespider)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/amazonbot/i], describe(e2) {
  const t2 = { name: "AmazonBot" }, n2 = P.getFirstMatch(/amazonbot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/bingbot/i], describe(e2) {
  const t2 = { name: "BingCrawler" }, n2 = P.getFirstMatch(/bingbot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/baiduspider/i], describe(e2) {
  const t2 = { name: "BaiduSpider" }, n2 = P.getFirstMatch(/baiduspider\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/duckduckbot/i], describe(e2) {
  const t2 = { name: "DuckDuckBot" }, n2 = P.getFirstMatch(/duckduckbot\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/ia_archiver/i], describe(e2) {
  const t2 = { name: "InternetArchiveCrawler" }, n2 = P.getFirstMatch(/ia_archiver\/(\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/facebookexternalhit/i, /facebookcatalog/i], describe: () => ({ name: "FacebookExternalHit" }) }, { test: [/slackbot/i, /slack-imgProxy/i], describe(e2) {
  const t2 = { name: "SlackBot" }, n2 = P.getFirstMatch(/(?:slackbot|slack-imgproxy)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/yahoo!?[\s/]*slurp/i], describe: () => ({ name: "YahooSlurp" }) }, { test: [/yandexbot/i, /yandexmobilebot/i], describe: () => ({ name: "YandexBot" }) }, { test: [/pingdom/i], describe: () => ({ name: "PingdomBot" }) }, { test: [/opera/i], describe(e2) {
  const t2 = { name: "Opera" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/opr\/|opios/i], describe(e2) {
  const t2 = { name: "Opera" }, n2 = P.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/SamsungBrowser/i], describe(e2) {
  const t2 = { name: "Samsung Internet for Android" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/Whale/i], describe(e2) {
  const t2 = { name: "NAVER Whale Browser" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/PaleMoon/i], describe(e2) {
  const t2 = { name: "Pale Moon" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:PaleMoon)[\s/](\d+(?:\.\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/MZBrowser/i], describe(e2) {
  const t2 = { name: "MZ Browser" }, n2 = P.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/focus/i], describe(e2) {
  const t2 = { name: "Focus" }, n2 = P.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/swing/i], describe(e2) {
  const t2 = { name: "Swing" }, n2 = P.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/coast/i], describe(e2) {
  const t2 = { name: "Opera Coast" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/opt\/\d+(?:.?_?\d+)+/i], describe(e2) {
  const t2 = { name: "Opera Touch" }, n2 = P.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/yabrowser/i], describe(e2) {
  const t2 = { name: "Yandex Browser" }, n2 = P.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/ucbrowser/i], describe(e2) {
  const t2 = { name: "UC Browser" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/Maxthon|mxios/i], describe(e2) {
  const t2 = { name: "Maxthon" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/epiphany/i], describe(e2) {
  const t2 = { name: "Epiphany" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/puffin/i], describe(e2) {
  const t2 = { name: "Puffin" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/sleipnir/i], describe(e2) {
  const t2 = { name: "Sleipnir" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/k-meleon/i], describe(e2) {
  const t2 = { name: "K-Meleon" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/micromessenger/i], describe(e2) {
  const t2 = { name: "WeChat" }, n2 = P.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/qqbrowser/i], describe(e2) {
  const t2 = { name: /qqbrowserlite/i.test(e2) ? "QQ Browser Lite" : "QQ Browser" }, n2 = P.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/msie|trident/i], describe(e2) {
  const t2 = { name: "Internet Explorer" }, n2 = P.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/\sedg\//i], describe(e2) {
  const t2 = { name: "Microsoft Edge" }, n2 = P.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/edg([ea]|ios)/i], describe(e2) {
  const t2 = { name: "Microsoft Edge" }, n2 = P.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/vivaldi/i], describe(e2) {
  const t2 = { name: "Vivaldi" }, n2 = P.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/seamonkey/i], describe(e2) {
  const t2 = { name: "SeaMonkey" }, n2 = P.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/sailfish/i], describe(e2) {
  const t2 = { name: "Sailfish" }, n2 = P.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/silk/i], describe(e2) {
  const t2 = { name: "Amazon Silk" }, n2 = P.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/phantom/i], describe(e2) {
  const t2 = { name: "PhantomJS" }, n2 = P.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/slimerjs/i], describe(e2) {
  const t2 = { name: "SlimerJS" }, n2 = P.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe(e2) {
  const t2 = { name: "BlackBerry" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/(web|hpw)[o0]s/i], describe(e2) {
  const t2 = { name: "WebOS Browser" }, n2 = P.getFirstMatch(A, e2) || P.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/bada/i], describe(e2) {
  const t2 = { name: "Bada" }, n2 = P.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/tizen/i], describe(e2) {
  const t2 = { name: "Tizen" }, n2 = P.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/qupzilla/i], describe(e2) {
  const t2 = { name: "QupZilla" }, n2 = P.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/librewolf/i], describe(e2) {
  const t2 = { name: "LibreWolf" }, n2 = P.getFirstMatch(/(?:librewolf)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/firefox|iceweasel|fxios/i], describe(e2) {
  const t2 = { name: "Firefox" }, n2 = P.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/electron/i], describe(e2) {
  const t2 = { name: "Electron" }, n2 = P.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/sogoumobilebrowser/i, /metasr/i, /se 2\.[x]/i], describe(e2) {
  const t2 = { name: "Sogou Browser" }, n2 = P.getFirstMatch(/(?:sogoumobilebrowser)[\s/](\d+(\.?_?\d+)+)/i, e2), r2 = P.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e2), i2 = P.getFirstMatch(/se ([\d.]+)x/i, e2), o2 = n2 || r2 || i2;
  return o2 && (t2.version = o2), t2;
} }, { test: [/MiuiBrowser/i], describe(e2) {
  const t2 = { name: "Miui" }, n2 = P.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: (e2) => !!e2.hasBrand("DuckDuckGo") || e2.test(/\sDdg\/[\d.]+$/i), describe(e2, t2) {
  const n2 = { name: "DuckDuckGo" };
  if (t2) {
    const e3 = t2.getBrandVersion("DuckDuckGo");
    if (e3) return n2.version = e3, n2;
  }
  const r2 = P.getFirstMatch(/\sDdg\/([\d.]+)$/i, e2);
  return r2 && (n2.version = r2), n2;
} }, { test: (e2) => e2.hasBrand("Brave"), describe(e2, t2) {
  const n2 = { name: "Brave" };
  if (t2) {
    const e3 = t2.getBrandVersion("Brave");
    if (e3) return n2.version = e3, n2;
  }
  return n2;
} }, { test: [/chromium/i], describe(e2) {
  const t2 = { name: "Chromium" }, n2 = P.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, e2) || P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/chrome|crios|crmo/i], describe(e2) {
  const t2 = { name: "Chrome" }, n2 = P.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/GSA/i], describe(e2) {
  const t2 = { name: "Google Search" }, n2 = P.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test(e2) {
  const t2 = !e2.test(/like android/i), n2 = e2.test(/android/i);
  return t2 && n2;
}, describe(e2) {
  const t2 = { name: "Android Browser" }, n2 = P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/playstation 4/i], describe(e2) {
  const t2 = { name: "PlayStation 4" }, n2 = P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/safari|applewebkit/i], describe(e2) {
  const t2 = { name: "Safari" }, n2 = P.getFirstMatch(A, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/.*/i], describe(e2) {
  const t2 = -1 !== e2.search("\\(") ? /^(.*)\/(.*)[ \t]\((.*)/ : /^(.*)\/(.*) /;
  return { name: P.getFirstMatch(t2, e2), version: P.getSecondMatch(t2, e2) };
} }];
var j = [{ test: [/Roku\/DVP/], describe(e2) {
  const t2 = P.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, e2);
  return { name: T.Roku, version: t2 };
} }, { test: [/windows phone/i], describe(e2) {
  const t2 = P.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, e2);
  return { name: T.WindowsPhone, version: t2 };
} }, { test: [/windows /i], describe(e2) {
  const t2 = P.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, e2), n2 = P.getWindowsVersionName(t2);
  return { name: T.Windows, version: t2, versionName: n2 };
} }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe(e2) {
  const t2 = { name: T.iOS }, n2 = P.getSecondMatch(/(Version\/)(\d[\d.]+)/, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/macintosh/i], describe(e2) {
  const t2 = P.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, e2).replace(/[_\s]/g, "."), n2 = P.getMacOSVersionName(t2), r2 = { name: T.MacOS, version: t2 };
  return n2 && (r2.versionName = n2), r2;
} }, { test: [/(ipod|iphone|ipad)/i], describe(e2) {
  const t2 = P.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, e2).replace(/[_\s]/g, ".");
  return { name: T.iOS, version: t2 };
} }, { test: [/OpenHarmony/i], describe(e2) {
  const t2 = P.getFirstMatch(/OpenHarmony\s+(\d+(\.\d+)*)/i, e2);
  return { name: T.HarmonyOS, version: t2 };
} }, { test(e2) {
  const t2 = !e2.test(/like android/i), n2 = e2.test(/android/i);
  return t2 && n2;
}, describe(e2) {
  const t2 = P.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, e2), n2 = P.getAndroidVersionName(t2), r2 = { name: T.Android, version: t2 };
  return n2 && (r2.versionName = n2), r2;
} }, { test: [/(web|hpw)[o0]s/i], describe(e2) {
  const t2 = P.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, e2), n2 = { name: T.WebOS };
  return t2 && t2.length && (n2.version = t2), n2;
} }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe(e2) {
  const t2 = P.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, e2) || P.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, e2) || P.getFirstMatch(/\bbb(\d+)/i, e2);
  return { name: T.BlackBerry, version: t2 };
} }, { test: [/bada/i], describe(e2) {
  const t2 = P.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, e2);
  return { name: T.Bada, version: t2 };
} }, { test: [/tizen/i], describe(e2) {
  const t2 = P.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, e2);
  return { name: T.Tizen, version: t2 };
} }, { test: [/linux/i], describe: () => ({ name: T.Linux }) }, { test: [/CrOS/], describe: () => ({ name: T.ChromeOS }) }, { test: [/PlayStation 4/], describe(e2) {
  const t2 = P.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, e2);
  return { name: T.PlayStation4, version: t2 };
} }];
var I = [{ test: [/googlebot/i], describe: () => ({ type: C.bot, vendor: "Google" }) }, { test: [/linespider/i], describe: () => ({ type: C.bot, vendor: "Line" }) }, { test: [/amazonbot/i], describe: () => ({ type: C.bot, vendor: "Amazon" }) }, { test: [/gptbot/i], describe: () => ({ type: C.bot, vendor: "OpenAI" }) }, { test: [/chatgpt-user/i], describe: () => ({ type: C.bot, vendor: "OpenAI" }) }, { test: [/oai-searchbot/i], describe: () => ({ type: C.bot, vendor: "OpenAI" }) }, { test: [/baiduspider/i], describe: () => ({ type: C.bot, vendor: "Baidu" }) }, { test: [/bingbot/i], describe: () => ({ type: C.bot, vendor: "Bing" }) }, { test: [/duckduckbot/i], describe: () => ({ type: C.bot, vendor: "DuckDuckGo" }) }, { test: [/claudebot/i, /claude-web/i, /claude-user/i, /claude-searchbot/i], describe: () => ({ type: C.bot, vendor: "Anthropic" }) }, { test: [/omgilibot/i, /webzio-extended/i], describe: () => ({ type: C.bot, vendor: "Webz.io" }) }, { test: [/diffbot/i], describe: () => ({ type: C.bot, vendor: "Diffbot" }) }, { test: [/perplexitybot/i], describe: () => ({ type: C.bot, vendor: "Perplexity AI" }) }, { test: [/perplexity-user/i], describe: () => ({ type: C.bot, vendor: "Perplexity AI" }) }, { test: [/youbot/i], describe: () => ({ type: C.bot, vendor: "You.com" }) }, { test: [/ia_archiver/i], describe: () => ({ type: C.bot, vendor: "Internet Archive" }) }, { test: [/meta-webindexer/i], describe: () => ({ type: C.bot, vendor: "Meta" }) }, { test: [/meta-externalads/i], describe: () => ({ type: C.bot, vendor: "Meta" }) }, { test: [/meta-externalagent/i], describe: () => ({ type: C.bot, vendor: "Meta" }) }, { test: [/meta-externalfetcher/i], describe: () => ({ type: C.bot, vendor: "Meta" }) }, { test: [/facebookexternalhit/i, /facebookcatalog/i], describe: () => ({ type: C.bot, vendor: "Meta" }) }, { test: [/slackbot/i, /slack-imgProxy/i], describe: () => ({ type: C.bot, vendor: "Slack" }) }, { test: [/yahoo/i], describe: () => ({ type: C.bot, vendor: "Yahoo" }) }, { test: [/yandexbot/i, /yandexmobilebot/i], describe: () => ({ type: C.bot, vendor: "Yandex" }) }, { test: [/pingdom/i], describe: () => ({ type: C.bot, vendor: "Pingdom" }) }, { test: [/huawei/i], describe(e2) {
  const t2 = P.getFirstMatch(/(can-l01)/i, e2) && "Nova", n2 = { type: C.mobile, vendor: "Huawei" };
  return t2 && (n2.model = t2), n2;
} }, { test: [/nexus\s*(?:7|8|9|10).*/i], describe: () => ({ type: C.tablet, vendor: "Nexus" }) }, { test: [/ipad/i], describe: () => ({ type: C.tablet, vendor: "Apple", model: "iPad" }) }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: () => ({ type: C.tablet, vendor: "Apple", model: "iPad" }) }, { test: [/kftt build/i], describe: () => ({ type: C.tablet, vendor: "Amazon", model: "Kindle Fire HD 7" }) }, { test: [/silk/i], describe: () => ({ type: C.tablet, vendor: "Amazon" }) }, { test: [/tablet(?! pc)/i], describe: () => ({ type: C.tablet }) }, { test(e2) {
  const t2 = e2.test(/ipod|iphone/i), n2 = e2.test(/like (ipod|iphone)/i);
  return t2 && !n2;
}, describe(e2) {
  const t2 = P.getFirstMatch(/(ipod|iphone)/i, e2);
  return { type: C.mobile, vendor: "Apple", model: t2 };
} }, { test: [/nexus\s*[0-6].*/i, /galaxy nexus/i], describe: () => ({ type: C.mobile, vendor: "Nexus" }) }, { test: [/Nokia/i], describe(e2) {
  const t2 = P.getFirstMatch(/Nokia\s+([0-9]+(\.[0-9]+)?)/i, e2), n2 = { type: C.mobile, vendor: "Nokia" };
  return t2 && (n2.model = t2), n2;
} }, { test: [/[^-]mobi/i], describe: () => ({ type: C.mobile }) }, { test: (e2) => "blackberry" === e2.getBrowserName(true), describe: () => ({ type: C.mobile, vendor: "BlackBerry" }) }, { test: (e2) => "bada" === e2.getBrowserName(true), describe: () => ({ type: C.mobile }) }, { test: (e2) => "windows phone" === e2.getBrowserName(), describe: () => ({ type: C.mobile, vendor: "Microsoft" }) }, { test(e2) {
  const t2 = Number(String(e2.getOSVersion()).split(".")[0]);
  return "android" === e2.getOSName(true) && t2 >= 3;
}, describe: () => ({ type: C.tablet }) }, { test: (e2) => "android" === e2.getOSName(true), describe: () => ({ type: C.mobile }) }, { test: [/smart-?tv|smarttv/i], describe: () => ({ type: C.tv }) }, { test: [/netcast/i], describe: () => ({ type: C.tv }) }, { test: (e2) => "macos" === e2.getOSName(true), describe: () => ({ type: C.desktop, vendor: "Apple" }) }, { test: (e2) => "windows" === e2.getOSName(true), describe: () => ({ type: C.desktop }) }, { test: (e2) => "linux" === e2.getOSName(true), describe: () => ({ type: C.desktop }) }, { test: (e2) => "playstation 4" === e2.getOSName(true), describe: () => ({ type: C.tv }) }, { test: (e2) => "roku" === e2.getOSName(true), describe: () => ({ type: C.tv }) }];
var L = [{ test: (e2) => "microsoft edge" === e2.getBrowserName(true), describe(e2) {
  if (/\sedg\//i.test(e2)) return { name: O.Blink };
  const t2 = P.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, e2);
  return { name: O.EdgeHTML, version: t2 };
} }, { test: [/trident/i], describe(e2) {
  const t2 = { name: O.Trident }, n2 = P.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: (e2) => e2.test(/presto/i), describe(e2) {
  const t2 = { name: O.Presto }, n2 = P.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test(e2) {
  const t2 = e2.test(/gecko/i), n2 = e2.test(/like gecko/i);
  return t2 && !n2;
}, describe(e2) {
  const t2 = { name: O.Gecko }, n2 = P.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/(apple)?webkit\/537\.36/i], describe: () => ({ name: O.Blink }) }, { test: [/(apple)?webkit/i], describe(e2) {
  const t2 = { name: O.WebKit }, n2 = P.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }];
var D = class {
  constructor(e2, t2 = false, n2 = null) {
    if (null == e2 || "" === e2) throw new Error("UserAgent parameter can't be empty");
    this._ua = e2;
    let r2 = false;
    "boolean" == typeof t2 ? (r2 = t2, this._hints = n2) : this._hints = null != t2 && "object" == typeof t2 ? t2 : null, this.parsedResult = {}, true !== r2 && this.parse();
  }
  getHints() {
    return this._hints;
  }
  hasBrand(e2) {
    if (!this._hints || !Array.isArray(this._hints.brands)) return false;
    const t2 = e2.toLowerCase();
    return this._hints.brands.some((e3) => e3.brand && e3.brand.toLowerCase() === t2);
  }
  getBrandVersion(e2) {
    if (!this._hints || !Array.isArray(this._hints.brands)) return;
    const t2 = e2.toLowerCase(), n2 = this._hints.brands.find((e3) => e3.brand && e3.brand.toLowerCase() === t2);
    return n2 ? n2.version : void 0;
  }
  getUA() {
    return this._ua;
  }
  test(e2) {
    return e2.test(this._ua);
  }
  parseBrowser() {
    this.parsedResult.browser = {};
    const e2 = P.find(x, (e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (Array.isArray(e3.test)) return e3.test.some((e4) => this.test(e4));
      throw new Error("Browser's test function is not valid");
    });
    return e2 && (this.parsedResult.browser = e2.describe(this.getUA(), this)), this.parsedResult.browser;
  }
  getBrowser() {
    return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
  }
  getBrowserName(e2) {
    return e2 ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
  }
  getBrowserVersion() {
    return this.getBrowser().version;
  }
  getOS() {
    return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
  }
  parseOS() {
    this.parsedResult.os = {};
    const e2 = P.find(j, (e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (Array.isArray(e3.test)) return e3.test.some((e4) => this.test(e4));
      throw new Error("Browser's test function is not valid");
    });
    return e2 && (this.parsedResult.os = e2.describe(this.getUA())), this.parsedResult.os;
  }
  getOSName(e2) {
    const { name: t2 } = this.getOS();
    return e2 ? String(t2).toLowerCase() || "" : t2 || "";
  }
  getOSVersion() {
    return this.getOS().version;
  }
  getPlatform() {
    return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
  }
  getPlatformType(e2 = false) {
    const { type: t2 } = this.getPlatform();
    return e2 ? String(t2).toLowerCase() || "" : t2 || "";
  }
  parsePlatform() {
    this.parsedResult.platform = {};
    const e2 = P.find(I, (e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (Array.isArray(e3.test)) return e3.test.some((e4) => this.test(e4));
      throw new Error("Browser's test function is not valid");
    });
    return e2 && (this.parsedResult.platform = e2.describe(this.getUA())), this.parsedResult.platform;
  }
  getEngine() {
    return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
  }
  getEngineName(e2) {
    return e2 ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
  }
  parseEngine() {
    this.parsedResult.engine = {};
    const e2 = P.find(L, (e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (Array.isArray(e3.test)) return e3.test.some((e4) => this.test(e4));
      throw new Error("Browser's test function is not valid");
    });
    return e2 && (this.parsedResult.engine = e2.describe(this.getUA())), this.parsedResult.engine;
  }
  parse() {
    return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
  }
  getResult() {
    return P.assign({}, this.parsedResult);
  }
  satisfies(e2) {
    const t2 = {};
    let n2 = 0;
    const r2 = {};
    let i2 = 0;
    if (Object.keys(e2).forEach((o2) => {
      const a2 = e2[o2];
      "string" == typeof a2 ? (r2[o2] = a2, i2 += 1) : "object" == typeof a2 && (t2[o2] = a2, n2 += 1);
    }), n2 > 0) {
      const e3 = Object.keys(t2), n3 = P.find(e3, (e4) => this.isOS(e4));
      if (n3) {
        const e4 = this.satisfies(t2[n3]);
        if (void 0 !== e4) return e4;
      }
      const r3 = P.find(e3, (e4) => this.isPlatform(e4));
      if (r3) {
        const e4 = this.satisfies(t2[r3]);
        if (void 0 !== e4) return e4;
      }
    }
    if (i2 > 0) {
      const e3 = Object.keys(r2), t3 = P.find(e3, (e4) => this.isBrowser(e4, true));
      if (void 0 !== t3) return this.compareVersion(r2[t3]);
    }
  }
  isBrowser(e2, t2 = false) {
    const n2 = this.getBrowserName().toLowerCase();
    let r2 = e2.toLowerCase();
    const i2 = P.getBrowserTypeByAlias(r2);
    return t2 && i2 && (r2 = i2.toLowerCase()), r2 === n2;
  }
  compareVersion(e2) {
    let t2 = [0], n2 = e2, r2 = false;
    const i2 = this.getBrowserVersion();
    if ("string" == typeof i2) return ">" === e2[0] || "<" === e2[0] ? (n2 = e2.substr(1), "=" === e2[1] ? (r2 = true, n2 = e2.substr(2)) : t2 = [], ">" === e2[0] ? t2.push(1) : t2.push(-1)) : "=" === e2[0] ? n2 = e2.substr(1) : "~" === e2[0] && (r2 = true, n2 = e2.substr(1)), t2.indexOf(P.compareVersions(i2, n2, r2)) > -1;
  }
  isOS(e2) {
    return this.getOSName(true) === String(e2).toLowerCase();
  }
  isPlatform(e2) {
    return this.getPlatformType(true) === String(e2).toLowerCase();
  }
  isEngine(e2) {
    return this.getEngineName(true) === String(e2).toLowerCase();
  }
  is(e2, t2 = false) {
    return this.isBrowser(e2, t2) || this.isOS(e2) || this.isPlatform(e2);
  }
  some(e2 = []) {
    return e2.some((e3) => this.is(e3));
  }
};
var N = class {
  static getParser(e2, t2 = false, n2 = null) {
    if ("string" != typeof e2) throw new Error("UserAgent should be a string");
    return new D(e2, t2, n2);
  }
  static parse(e2, t2 = null) {
    return new D(e2, t2).getResult();
  }
  static get BROWSER_MAP() {
    return E;
  }
  static get ENGINE_MAP() {
    return O;
  }
  static get OS_MAP() {
    return T;
  }
  static get PLATFORMS_MAP() {
    return C;
  }
};
function F(e2) {
  return (function(e3) {
    if (Array.isArray(e3)) return p(e3);
  })(e2) || (function(e3) {
    if ("undefined" != typeof Symbol && null != e3[Symbol.iterator] || null != e3["@@iterator"]) return Array.from(e3);
  })(e2) || f(e2) || (function() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  })();
}
function B() {
  return Date.now() + Math.random().toString();
}
function R() {
  throw new Error("Method must be implemented in subclass");
}
var U = ["daily.co", "dailywebrtc.com", "dailywebrtc.net"];
var V = null;
function J() {
  return V;
}
function $(e2) {
  (null === e2 || U.includes(e2)) && (V = e2);
}
function q(e2) {
  try {
    var t2 = new URL(e2).hostname;
    return U.find(function(e3) {
      return t2 === e3 || t2.endsWith(".".concat(e3));
    }) || null;
  } catch (e3) {
    return null;
  }
}
function z(e2, t2) {
  return null != t2 && t2.proxyUrl ? t2.proxyUrl + ("/" === t2.proxyUrl.slice(-1) ? "" : "/") + e2.substring(8) : e2;
}
function W(e2, t2) {
  var n2 = U.find(function(t3) {
    return e2.includes(t3);
  });
  return n2 ? e2.replace(n2, t2) : e2;
}
function G(e2) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null != V ? V : U[0];
  if (null != e2 && e2.callObjectBundleUrlOverride) return console.warn("The callObjectBundleUrlOverride property is deprecated and will be removed. Please use bundlePathOverride instead. When providing a bundlePathOverride, the URL should point to the directory containing all Daily bundles (call-machine-object-bundle.js and audio-processor-bundle.js)."), W(e2.callObjectBundleUrlOverride, t2);
  var n2 = (function(e3) {
    var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null != V ? V : U[0];
    if (t3 && "" !== t3.trim() || (t3 = null != V ? V : U[0]), null != e3 && e3.bundlePathOverride) {
      var n3 = W(e3.bundlePathOverride, t3);
      return n3.endsWith("/") ? n3.slice(0, -1) : n3;
    }
    if (null != e3 && e3.callObjectBundleUrlOverride) {
      var r2 = W(e3.callObjectBundleUrlOverride, t3), i2 = r2.substring(0, r2.lastIndexOf("/"));
      return i2.endsWith("/") ? i2.slice(0, -1) : i2;
    }
    var o2 = z("https://c.".concat(t3, "/call-machine/versioned/", "0.94.0", "/static"), e3);
    return o2.endsWith("/") ? o2.slice(0, -1) : o2;
  })(e2, t2) + "/call-machine-object-bundle.js";
  return n2;
}
function H(e2) {
  var t2 = (null == e2 ? void 0 : e2.bundlePathOverride) || (null == e2 ? void 0 : e2.callObjectBundleUrlOverride);
  return !(!t2 || U.some(function(e3) {
    return t2.includes(e3);
  })) || Boolean((null == e2 ? void 0 : e2.proxyUrl) || (function() {
    try {
      return "undefined" != typeof localStorage && "1" === localStorage.getItem("daily:disable-base-domain-fallback");
    } catch (e3) {
      return false;
    }
  })());
}
function Q(e2) {
  try {
    var t2, n2 = null != e2 ? e2 : window.location.hostname;
    return null !== (t2 = U.find(function(e3) {
      return n2 === e3 || n2.endsWith(".".concat(e3));
    })) && void 0 !== t2 ? t2 : null;
  } catch (e3) {
    return null;
  }
}
function Y(e2, t2) {
  var n2, r2 = q(e2);
  if (!r2 || H(t2)) return [e2];
  var i2 = null !== (n2 = null != V ? V : Q()) && void 0 !== n2 ? n2 : U[0];
  return (i2 === U[0] ? U : [i2].concat(F(U.filter(function(e3) {
    return e3 !== i2;
  })))).map(function(t3) {
    return t3 === r2 ? e2 : (function(e3, t4, n3) {
      try {
        var r3 = new URL(e3);
        return r3.hostname.endsWith(".".concat(t4)) ? r3.hostname = r3.hostname.slice(0, -t4.length) + n3 : r3.hostname === t4 && (r3.hostname = n3), r3.toString();
      } catch (t5) {
        return e3;
      }
    })(e2, r2, t3);
  });
}
function K(e2) {
  try {
    new URL(e2);
  } catch (e3) {
    return false;
  }
  return true;
}
var X = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__;
var Z = "8.55.2";
var ee = globalThis;
function te(e2, t2, n2) {
  const r2 = n2 || ee, i2 = r2.__SENTRY__ = r2.__SENTRY__ || {}, o2 = i2[Z] = i2[Z] || {};
  return o2[e2] || (o2[e2] = t2());
}
var ne = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__;
var re = ["debug", "info", "warn", "error", "log", "assert", "trace"];
var ie = {};
function oe(e2) {
  if (!("console" in ee)) return e2();
  const t2 = ee.console, n2 = {}, r2 = Object.keys(ie);
  r2.forEach((e3) => {
    const r3 = ie[e3];
    n2[e3] = t2[e3], t2[e3] = r3;
  });
  try {
    return e2();
  } finally {
    r2.forEach((e3) => {
      t2[e3] = n2[e3];
    });
  }
}
var ae = te("logger", function() {
  let e2 = false;
  const t2 = { enable: () => {
    e2 = true;
  }, disable: () => {
    e2 = false;
  }, isEnabled: () => e2 };
  return ne ? re.forEach((n2) => {
    t2[n2] = (...t3) => {
      e2 && oe(() => {
        ee.console[n2](`Sentry Logger [${n2}]:`, ...t3);
      });
    };
  }) : re.forEach((e3) => {
    t2[e3] = () => {
    };
  }), t2;
});
var se = "?";
var ce = /\(error: (.*)\)/;
var le = /captureMessage|captureException/;
function ue(e2) {
  return e2[e2.length - 1] || {};
}
var de = "<anonymous>";
function he(e2) {
  try {
    return e2 && "function" == typeof e2 && e2.name || de;
  } catch (e3) {
    return de;
  }
}
function pe(e2) {
  const t2 = e2.exception;
  if (t2) {
    const e3 = [];
    try {
      return t2.values.forEach((t3) => {
        t3.stacktrace.frames && e3.push(...t3.stacktrace.frames);
      }), e3;
    } catch (e4) {
      return;
    }
  }
}
var fe = {};
var ve = {};
function ge(e2, t2) {
  fe[e2] = fe[e2] || [], fe[e2].push(t2);
}
function me(e2, t2) {
  if (!ve[e2]) {
    ve[e2] = true;
    try {
      t2();
    } catch (t3) {
      ne && ae.error(`Error while instrumenting ${e2}`, t3);
    }
  }
}
function ye(e2, t2) {
  const n2 = e2 && fe[e2];
  if (n2) for (const r2 of n2) try {
    r2(t2);
  } catch (t3) {
    ne && ae.error(`Error while triggering instrumentation handler.
Type: ${e2}
Name: ${he(r2)}
Error:`, t3);
  }
}
var be = null;
function _e() {
  be = ee.onerror, ee.onerror = function(e2, t2, n2, r2, i2) {
    return ye("error", { column: r2, error: i2, line: n2, msg: e2, url: t2 }), !!be && be.apply(this, arguments);
  }, ee.onerror.__SENTRY_INSTRUMENTED__ = true;
}
var we = null;
function ke() {
  we = ee.onunhandledrejection, ee.onunhandledrejection = function(e2) {
    return ye("unhandledrejection", e2), !we || we.apply(this, arguments);
  }, ee.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}
function Se() {
  return Me(ee), ee;
}
function Me(e2) {
  const t2 = e2.__SENTRY__ = e2.__SENTRY__ || {};
  return t2.version = t2.version || Z, t2[Z] = t2[Z] || {};
}
var Ee = Object.prototype.toString;
function Ce(e2) {
  switch (Ee.call(e2)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return true;
    default:
      return Ne(e2, Error);
  }
}
function Te(e2, t2) {
  return Ee.call(e2) === `[object ${t2}]`;
}
function Oe(e2) {
  return Te(e2, "ErrorEvent");
}
function Pe(e2) {
  return Te(e2, "DOMError");
}
function Ae(e2) {
  return Te(e2, "String");
}
function xe(e2) {
  return "object" == typeof e2 && null !== e2 && "__sentry_template_string__" in e2 && "__sentry_template_values__" in e2;
}
function je(e2) {
  return null === e2 || xe(e2) || "object" != typeof e2 && "function" != typeof e2;
}
function Ie(e2) {
  return Te(e2, "Object");
}
function Le(e2) {
  return "undefined" != typeof Event && Ne(e2, Event);
}
function De(e2) {
  return Boolean(e2 && e2.then && "function" == typeof e2.then);
}
function Ne(e2, t2) {
  try {
    return e2 instanceof t2;
  } catch (e3) {
    return false;
  }
}
function Fe(e2) {
  return !("object" != typeof e2 || null === e2 || !e2.__isVue && !e2._isVue);
}
var Be = ee;
function Re(e2, t2 = {}) {
  if (!e2) return "<unknown>";
  try {
    let n2 = e2;
    const r2 = 5, i2 = [];
    let o2 = 0, a2 = 0;
    const s2 = " > ", c2 = s2.length;
    let l2;
    const u2 = Array.isArray(t2) ? t2 : t2.keyAttrs, d2 = !Array.isArray(t2) && t2.maxStringLength || 80;
    for (; n2 && o2++ < r2 && (l2 = Ue(n2, u2), !("html" === l2 || o2 > 1 && a2 + i2.length * c2 + l2.length >= d2)); ) i2.push(l2), a2 += l2.length, n2 = n2.parentNode;
    return i2.reverse().join(s2);
  } catch (e3) {
    return "<unknown>";
  }
}
function Ue(e2, t2) {
  const n2 = e2, r2 = [];
  if (!n2 || !n2.tagName) return "";
  if (Be.HTMLElement && n2 instanceof HTMLElement && n2.dataset) {
    if (n2.dataset.sentryComponent) return n2.dataset.sentryComponent;
    if (n2.dataset.sentryElement) return n2.dataset.sentryElement;
  }
  r2.push(n2.tagName.toLowerCase());
  const i2 = t2 && t2.length ? t2.filter((e3) => n2.getAttribute(e3)).map((e3) => [e3, n2.getAttribute(e3)]) : null;
  if (i2 && i2.length) i2.forEach((e3) => {
    r2.push(`[${e3[0]}="${e3[1]}"]`);
  });
  else {
    n2.id && r2.push(`#${n2.id}`);
    const e3 = n2.className;
    if (e3 && Ae(e3)) {
      const t3 = e3.split(/\s+/);
      for (const e4 of t3) r2.push(`.${e4}`);
    }
  }
  const o2 = ["aria-label", "type", "name", "title", "alt"];
  for (const e3 of o2) {
    const t3 = n2.getAttribute(e3);
    t3 && r2.push(`[${e3}="${t3}"]`);
  }
  return r2.join("");
}
function Ve(e2, t2 = 0) {
  return "string" != typeof e2 || 0 === t2 || e2.length <= t2 ? e2 : `${e2.slice(0, t2)}...`;
}
function Je(e2, t2) {
  if (!Array.isArray(e2)) return "";
  const n2 = [];
  for (let t3 = 0; t3 < e2.length; t3++) {
    const r2 = e2[t3];
    try {
      Fe(r2) ? n2.push("[VueViewModel]") : n2.push(String(r2));
    } catch (e3) {
      n2.push("[value cannot be serialized]");
    }
  }
  return n2.join(t2);
}
function $e(e2, t2, n2 = false) {
  return !!Ae(e2) && (Te(t2, "RegExp") ? t2.test(e2) : !!Ae(t2) && (n2 ? e2 === t2 : e2.includes(t2)));
}
function qe(e2, t2 = [], n2 = false) {
  return t2.some((t3) => $e(e2, t3, n2));
}
function ze(e2, t2, n2) {
  if (!(t2 in e2)) return;
  const r2 = e2[t2], i2 = n2(r2);
  "function" == typeof i2 && Ge(i2, r2);
  try {
    e2[t2] = i2;
  } catch (n3) {
    ne && ae.log(`Failed to replace method "${t2}" in object`, e2);
  }
}
function We(e2, t2, n2) {
  try {
    Object.defineProperty(e2, t2, { value: n2, writable: true, configurable: true });
  } catch (n3) {
    ne && ae.log(`Failed to add non-enumerable property "${t2}" to object`, e2);
  }
}
function Ge(e2, t2) {
  try {
    const n2 = t2.prototype || {};
    e2.prototype = t2.prototype = n2, We(e2, "__sentry_original__", t2);
  } catch (e3) {
  }
}
function He(e2) {
  return e2.__sentry_original__;
}
function Qe(e2) {
  if (Ce(e2)) return { message: e2.message, name: e2.name, stack: e2.stack, ...Ke(e2) };
  if (Le(e2)) {
    const t2 = { type: e2.type, target: Ye(e2.target), currentTarget: Ye(e2.currentTarget), ...Ke(e2) };
    return "undefined" != typeof CustomEvent && Ne(e2, CustomEvent) && (t2.detail = e2.detail), t2;
  }
  return e2;
}
function Ye(e2) {
  try {
    return t2 = e2, "undefined" != typeof Element && Ne(t2, Element) ? Re(e2) : Object.prototype.toString.call(e2);
  } catch (e3) {
    return "<unknown>";
  }
  var t2;
}
function Ke(e2) {
  if ("object" == typeof e2 && null !== e2) {
    const t2 = {};
    for (const n2 in e2) Object.prototype.hasOwnProperty.call(e2, n2) && (t2[n2] = e2[n2]);
    return t2;
  }
  return {};
}
function Xe(e2) {
  return Ze(e2, /* @__PURE__ */ new Map());
}
function Ze(e2, t2) {
  if ((function(e3) {
    if (!Ie(e3)) return false;
    try {
      const t3 = Object.getPrototypeOf(e3).constructor.name;
      return !t3 || "Object" === t3;
    } catch (e4) {
      return true;
    }
  })(e2)) {
    const n2 = t2.get(e2);
    if (void 0 !== n2) return n2;
    const r2 = {};
    t2.set(e2, r2);
    for (const n3 of Object.getOwnPropertyNames(e2)) void 0 !== e2[n3] && (r2[n3] = Ze(e2[n3], t2));
    return r2;
  }
  if (Array.isArray(e2)) {
    const n2 = t2.get(e2);
    if (void 0 !== n2) return n2;
    const r2 = [];
    return t2.set(e2, r2), e2.forEach((e3) => {
      r2.push(Ze(e3, t2));
    }), r2;
  }
  return e2;
}
function et() {
  return Date.now() / 1e3;
}
var tt = (function() {
  const { performance: e2 } = ee;
  if (!e2 || !e2.now) return et;
  const t2 = Date.now() - e2.now(), n2 = null == e2.timeOrigin ? t2 : e2.timeOrigin;
  return () => (n2 + e2.now()) / 1e3;
})();
function nt() {
  const e2 = ee, t2 = e2.crypto || e2.msCrypto;
  let n2 = () => 16 * Math.random();
  try {
    if (t2 && t2.randomUUID) return t2.randomUUID().replace(/-/g, "");
    t2 && t2.getRandomValues && (n2 = () => {
      const e3 = new Uint8Array(1);
      return t2.getRandomValues(e3), e3[0];
    });
  } catch (e3) {
  }
  return ("10000000100040008000" + 1e11).replace(/[018]/g, (e3) => (e3 ^ (15 & n2()) >> e3 / 4).toString(16));
}
function rt(e2) {
  return e2.exception && e2.exception.values ? e2.exception.values[0] : void 0;
}
function it(e2) {
  const { message: t2, event_id: n2 } = e2;
  if (t2) return t2;
  const r2 = rt(e2);
  return r2 ? r2.type && r2.value ? `${r2.type}: ${r2.value}` : r2.type || r2.value || n2 || "<unknown>" : n2 || "<unknown>";
}
function ot(e2, t2, n2) {
  const r2 = e2.exception = e2.exception || {}, i2 = r2.values = r2.values || [], o2 = i2[0] = i2[0] || {};
  o2.value || (o2.value = t2 || ""), o2.type || (o2.type = n2 || "Error");
}
function at(e2, t2) {
  const n2 = rt(e2);
  if (!n2) return;
  const r2 = n2.mechanism;
  if (n2.mechanism = { type: "generic", handled: true, ...r2, ...t2 }, t2 && "data" in t2) {
    const e3 = { ...r2 && r2.data, ...t2.data };
    n2.mechanism.data = e3;
  }
}
function st(e2) {
  if ((function(e3) {
    try {
      return e3.__sentry_captured__;
    } catch (e4) {
    }
  })(e2)) return true;
  try {
    We(e2, "__sentry_captured__", true);
  } catch (e3) {
  }
  return false;
}
var ct;
function lt(e2) {
  return new dt((t2) => {
    t2(e2);
  });
}
function ut(e2) {
  return new dt((t2, n2) => {
    n2(e2);
  });
}
(() => {
  const { performance: e2 } = ee;
  if (!e2 || !e2.now) return;
  const t2 = 36e5, n2 = e2.now(), r2 = Date.now(), i2 = e2.timeOrigin ? Math.abs(e2.timeOrigin + n2 - r2) : t2, o2 = i2 < t2, a2 = e2.timing && e2.timing.navigationStart, s2 = "number" == typeof a2 ? Math.abs(a2 + n2 - r2) : t2;
  (o2 || s2 < t2) && (i2 <= s2 && e2.timeOrigin);
})(), (function(e2) {
  e2[e2.PENDING = 0] = "PENDING";
  e2[e2.RESOLVED = 1] = "RESOLVED";
  e2[e2.REJECTED = 2] = "REJECTED";
})(ct || (ct = {}));
var dt = class _dt {
  constructor(e2) {
    _dt.prototype.__init.call(this), _dt.prototype.__init2.call(this), _dt.prototype.__init3.call(this), _dt.prototype.__init4.call(this), this._state = ct.PENDING, this._handlers = [];
    try {
      e2(this._resolve, this._reject);
    } catch (e3) {
      this._reject(e3);
    }
  }
  then(e2, t2) {
    return new _dt((n2, r2) => {
      this._handlers.push([false, (t3) => {
        if (e2) try {
          n2(e2(t3));
        } catch (e3) {
          r2(e3);
        }
        else n2(t3);
      }, (e3) => {
        if (t2) try {
          n2(t2(e3));
        } catch (e4) {
          r2(e4);
        }
        else r2(e3);
      }]), this._executeHandlers();
    });
  }
  catch(e2) {
    return this.then((e3) => e3, e2);
  }
  finally(e2) {
    return new _dt((t2, n2) => {
      let r2, i2;
      return this.then((t3) => {
        i2 = false, r2 = t3, e2 && e2();
      }, (t3) => {
        i2 = true, r2 = t3, e2 && e2();
      }).then(() => {
        i2 ? n2(r2) : t2(r2);
      });
    });
  }
  __init() {
    this._resolve = (e2) => {
      this._setResult(ct.RESOLVED, e2);
    };
  }
  __init2() {
    this._reject = (e2) => {
      this._setResult(ct.REJECTED, e2);
    };
  }
  __init3() {
    this._setResult = (e2, t2) => {
      this._state === ct.PENDING && (De(t2) ? t2.then(this._resolve, this._reject) : (this._state = e2, this._value = t2, this._executeHandlers()));
    };
  }
  __init4() {
    this._executeHandlers = () => {
      if (this._state === ct.PENDING) return;
      const e2 = this._handlers.slice();
      this._handlers = [], e2.forEach((e3) => {
        e3[0] || (this._state === ct.RESOLVED && e3[1](this._value), this._state === ct.REJECTED && e3[2](this._value), e3[0] = true);
      });
    };
  }
};
function ht(e2) {
  const t2 = tt(), n2 = { sid: nt(), init: true, timestamp: t2, started: t2, duration: 0, status: "ok", errors: 0, ignoreDuration: false, toJSON: () => (function(e3) {
    return Xe({ sid: `${e3.sid}`, init: e3.init, started: new Date(1e3 * e3.started).toISOString(), timestamp: new Date(1e3 * e3.timestamp).toISOString(), status: e3.status, errors: e3.errors, did: "number" == typeof e3.did || "string" == typeof e3.did ? `${e3.did}` : void 0, duration: e3.duration, abnormal_mechanism: e3.abnormal_mechanism, attrs: { release: e3.release, environment: e3.environment, ip_address: e3.ipAddress, user_agent: e3.userAgent } });
  })(n2) };
  return e2 && pt(n2, e2), n2;
}
function pt(e2, t2 = {}) {
  if (t2.user && (!e2.ipAddress && t2.user.ip_address && (e2.ipAddress = t2.user.ip_address), e2.did || t2.did || (e2.did = t2.user.id || t2.user.email || t2.user.username)), e2.timestamp = t2.timestamp || tt(), t2.abnormal_mechanism && (e2.abnormal_mechanism = t2.abnormal_mechanism), t2.ignoreDuration && (e2.ignoreDuration = t2.ignoreDuration), t2.sid && (e2.sid = 32 === t2.sid.length ? t2.sid : nt()), void 0 !== t2.init && (e2.init = t2.init), !e2.did && t2.did && (e2.did = `${t2.did}`), "number" == typeof t2.started && (e2.started = t2.started), e2.ignoreDuration) e2.duration = void 0;
  else if ("number" == typeof t2.duration) e2.duration = t2.duration;
  else {
    const t3 = e2.timestamp - e2.started;
    e2.duration = t3 >= 0 ? t3 : 0;
  }
  t2.release && (e2.release = t2.release), t2.environment && (e2.environment = t2.environment), !e2.ipAddress && t2.ipAddress && (e2.ipAddress = t2.ipAddress), !e2.userAgent && t2.userAgent && (e2.userAgent = t2.userAgent), "number" == typeof t2.errors && (e2.errors = t2.errors), t2.status && (e2.status = t2.status);
}
function ft() {
  return nt();
}
function vt() {
  return nt().substring(16);
}
function gt(e2, t2, n2 = 2) {
  if (!t2 || "object" != typeof t2 || n2 <= 0) return t2;
  if (e2 && t2 && 0 === Object.keys(t2).length) return e2;
  const r2 = { ...e2 };
  for (const e3 in t2) Object.prototype.hasOwnProperty.call(t2, e3) && (r2[e3] = gt(r2[e3], t2[e3], n2 - 1));
  return r2;
}
var mt = "_sentrySpan";
function yt(e2, t2) {
  t2 ? We(e2, mt, t2) : delete e2[mt];
}
function bt(e2) {
  return e2[mt];
}
var _t = class __t {
  constructor() {
    this._notifyingListeners = false, this._scopeListeners = [], this._eventProcessors = [], this._breadcrumbs = [], this._attachments = [], this._user = {}, this._tags = {}, this._extra = {}, this._contexts = {}, this._sdkProcessingMetadata = {}, this._propagationContext = { traceId: ft(), spanId: vt() };
  }
  clone() {
    const e2 = new __t();
    return e2._breadcrumbs = [...this._breadcrumbs], e2._tags = { ...this._tags }, e2._extra = { ...this._extra }, e2._contexts = { ...this._contexts }, this._contexts.flags && (e2._contexts.flags = { values: [...this._contexts.flags.values] }), e2._user = this._user, e2._level = this._level, e2._session = this._session, e2._transactionName = this._transactionName, e2._fingerprint = this._fingerprint, e2._eventProcessors = [...this._eventProcessors], e2._requestSession = this._requestSession, e2._attachments = [...this._attachments], e2._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, e2._propagationContext = { ...this._propagationContext }, e2._client = this._client, e2._lastEventId = this._lastEventId, yt(e2, bt(this)), e2;
  }
  setClient(e2) {
    this._client = e2;
  }
  setLastEventId(e2) {
    this._lastEventId = e2;
  }
  getClient() {
    return this._client;
  }
  lastEventId() {
    return this._lastEventId;
  }
  addScopeListener(e2) {
    this._scopeListeners.push(e2);
  }
  addEventProcessor(e2) {
    return this._eventProcessors.push(e2), this;
  }
  setUser(e2) {
    return this._user = e2 || { email: void 0, id: void 0, ip_address: void 0, username: void 0 }, this._session && pt(this._session, { user: e2 }), this._notifyScopeListeners(), this;
  }
  getUser() {
    return this._user;
  }
  getRequestSession() {
    return this._requestSession;
  }
  setRequestSession(e2) {
    return this._requestSession = e2, this;
  }
  setTags(e2) {
    return this._tags = { ...this._tags, ...e2 }, this._notifyScopeListeners(), this;
  }
  setTag(e2, t2) {
    return this._tags = { ...this._tags, [e2]: t2 }, this._notifyScopeListeners(), this;
  }
  setExtras(e2) {
    return this._extra = { ...this._extra, ...e2 }, this._notifyScopeListeners(), this;
  }
  setExtra(e2, t2) {
    return this._extra = { ...this._extra, [e2]: t2 }, this._notifyScopeListeners(), this;
  }
  setFingerprint(e2) {
    return this._fingerprint = e2, this._notifyScopeListeners(), this;
  }
  setLevel(e2) {
    return this._level = e2, this._notifyScopeListeners(), this;
  }
  setTransactionName(e2) {
    return this._transactionName = e2, this._notifyScopeListeners(), this;
  }
  setContext(e2, t2) {
    return null === t2 ? delete this._contexts[e2] : this._contexts[e2] = t2, this._notifyScopeListeners(), this;
  }
  setSession(e2) {
    return e2 ? this._session = e2 : delete this._session, this._notifyScopeListeners(), this;
  }
  getSession() {
    return this._session;
  }
  update(e2) {
    if (!e2) return this;
    const t2 = "function" == typeof e2 ? e2(this) : e2, [n2, r2] = t2 instanceof wt ? [t2.getScopeData(), t2.getRequestSession()] : Ie(t2) ? [e2, e2.requestSession] : [], { tags: i2, extra: o2, user: a2, contexts: s2, level: c2, fingerprint: l2 = [], propagationContext: u2 } = n2 || {};
    return this._tags = { ...this._tags, ...i2 }, this._extra = { ...this._extra, ...o2 }, this._contexts = { ...this._contexts, ...s2 }, a2 && Object.keys(a2).length && (this._user = a2), c2 && (this._level = c2), l2.length && (this._fingerprint = l2), u2 && (this._propagationContext = u2), r2 && (this._requestSession = r2), this;
  }
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._requestSession = void 0, this._session = void 0, yt(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: ft() }), this._notifyScopeListeners(), this;
  }
  addBreadcrumb(e2, t2) {
    const n2 = "number" == typeof t2 ? t2 : 100;
    if (n2 <= 0) return this;
    const r2 = { timestamp: et(), ...e2 };
    return this._breadcrumbs.push(r2), this._breadcrumbs.length > n2 && (this._breadcrumbs = this._breadcrumbs.slice(-n2), this._client && this._client.recordDroppedEvent("buffer_overflow", "log_item")), this._notifyScopeListeners(), this;
  }
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }
  clearBreadcrumbs() {
    return this._breadcrumbs = [], this._notifyScopeListeners(), this;
  }
  addAttachment(e2) {
    return this._attachments.push(e2), this;
  }
  clearAttachments() {
    return this._attachments = [], this;
  }
  getScopeData() {
    return { breadcrumbs: this._breadcrumbs, attachments: this._attachments, contexts: this._contexts, tags: this._tags, extra: this._extra, user: this._user, level: this._level, fingerprint: this._fingerprint || [], eventProcessors: this._eventProcessors, propagationContext: this._propagationContext, sdkProcessingMetadata: this._sdkProcessingMetadata, transactionName: this._transactionName, span: bt(this) };
  }
  setSDKProcessingMetadata(e2) {
    return this._sdkProcessingMetadata = gt(this._sdkProcessingMetadata, e2, 2), this;
  }
  setPropagationContext(e2) {
    return this._propagationContext = { spanId: vt(), ...e2 }, this;
  }
  getPropagationContext() {
    return this._propagationContext;
  }
  captureException(e2, t2) {
    const n2 = t2 && t2.event_id ? t2.event_id : nt();
    if (!this._client) return ae.warn("No client configured on scope - will not capture exception!"), n2;
    const r2 = new Error("Sentry syntheticException");
    return this._client.captureException(e2, { originalException: e2, syntheticException: r2, ...t2, event_id: n2 }, this), n2;
  }
  captureMessage(e2, t2, n2) {
    const r2 = n2 && n2.event_id ? n2.event_id : nt();
    if (!this._client) return ae.warn("No client configured on scope - will not capture message!"), r2;
    const i2 = new Error(e2);
    return this._client.captureMessage(e2, t2, { originalException: e2, syntheticException: i2, ...n2, event_id: r2 }, this), r2;
  }
  captureEvent(e2, t2) {
    const n2 = t2 && t2.event_id ? t2.event_id : nt();
    return this._client ? (this._client.captureEvent(e2, { ...t2, event_id: n2 }, this), n2) : (ae.warn("No client configured on scope - will not capture event!"), n2);
  }
  _notifyScopeListeners() {
    this._notifyingListeners || (this._notifyingListeners = true, this._scopeListeners.forEach((e2) => {
      e2(this);
    }), this._notifyingListeners = false);
  }
};
var wt = _t;
var kt = class {
  constructor(e2, t2) {
    let n2, r2;
    n2 = e2 || new wt(), r2 = t2 || new wt(), this._stack = [{ scope: n2 }], this._isolationScope = r2;
  }
  withScope(e2) {
    const t2 = this._pushScope();
    let n2;
    try {
      n2 = e2(t2);
    } catch (e3) {
      throw this._popScope(), e3;
    }
    return De(n2) ? n2.then((e3) => (this._popScope(), e3), (e3) => {
      throw this._popScope(), e3;
    }) : (this._popScope(), n2);
  }
  getClient() {
    return this.getStackTop().client;
  }
  getScope() {
    return this.getStackTop().scope;
  }
  getIsolationScope() {
    return this._isolationScope;
  }
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }
  _pushScope() {
    const e2 = this.getScope().clone();
    return this._stack.push({ client: this.getClient(), scope: e2 }), e2;
  }
  _popScope() {
    return !(this._stack.length <= 1) && !!this._stack.pop();
  }
};
function St() {
  const e2 = Me(Se());
  return e2.stack = e2.stack || new kt(te("defaultCurrentScope", () => new wt()), te("defaultIsolationScope", () => new wt()));
}
function Mt(e2) {
  return St().withScope(e2);
}
function Et(e2, t2) {
  const n2 = St();
  return n2.withScope(() => (n2.getStackTop().scope = e2, t2(e2)));
}
function Ct(e2) {
  return St().withScope(() => e2(St().getIsolationScope()));
}
function Tt(e2) {
  const t2 = Me(e2);
  return t2.acs ? t2.acs : { withIsolationScope: Ct, withScope: Mt, withSetScope: Et, withSetIsolationScope: (e3, t3) => Ct(t3), getCurrentScope: () => St().getScope(), getIsolationScope: () => St().getIsolationScope() };
}
function Ot() {
  return Tt(Se()).getCurrentScope();
}
function Pt() {
  return Tt(Se()).getIsolationScope();
}
function At() {
  return Ot().getClient();
}
function xt(e2) {
  const t2 = e2.getPropagationContext(), { traceId: n2, spanId: r2, parentSpanId: i2 } = t2;
  return Xe({ trace_id: n2, span_id: r2, parent_span_id: i2 });
}
function jt(e2) {
  const t2 = e2._sentryMetrics;
  if (!t2) return;
  const n2 = {};
  for (const [, [e3, r2]] of t2) {
    (n2[e3] || (n2[e3] = [])).push(Xe(r2));
  }
  return n2;
}
var It = /^sentry-/;
function Lt(e2) {
  const t2 = (function(e3) {
    if (!e3 || !Ae(e3) && !Array.isArray(e3)) return;
    if (Array.isArray(e3)) return e3.reduce((e4, t3) => {
      const n3 = Dt(t3);
      return Object.entries(n3).forEach(([t4, n4]) => {
        e4[t4] = n4;
      }), e4;
    }, {});
    return Dt(e3);
  })(e2);
  if (!t2) return;
  const n2 = Object.entries(t2).reduce((e3, [t3, n3]) => {
    if (t3.match(It)) {
      e3[t3.slice(7)] = n3;
    }
    return e3;
  }, {});
  return Object.keys(n2).length > 0 ? n2 : void 0;
}
function Dt(e2) {
  return e2.split(",").map((e3) => e3.split("=").map((e4) => decodeURIComponent(e4.trim()))).reduce((e3, [t2, n2]) => (t2 && n2 && (e3[t2] = n2), e3), {});
}
var Nt = false;
function Ft(e2) {
  const { spanId: t2, traceId: n2, isRemote: r2 } = e2.spanContext();
  return Xe({ parent_span_id: r2 ? t2 : Ut(e2).parent_span_id, span_id: r2 ? vt() : t2, trace_id: n2 });
}
function Bt(e2) {
  return "number" == typeof e2 ? Rt(e2) : Array.isArray(e2) ? e2[0] + e2[1] / 1e9 : e2 instanceof Date ? Rt(e2.getTime()) : tt();
}
function Rt(e2) {
  return e2 > 9999999999 ? e2 / 1e3 : e2;
}
function Ut(e2) {
  if ((function(e3) {
    return "function" == typeof e3.getSpanJSON;
  })(e2)) return e2.getSpanJSON();
  try {
    const { spanId: t2, traceId: n2 } = e2.spanContext();
    if ((function(e3) {
      const t3 = e3;
      return !!(t3.attributes && t3.startTime && t3.name && t3.endTime && t3.status);
    })(e2)) {
      const { attributes: r2, startTime: i2, name: o2, endTime: a2, parentSpanId: s2, status: c2 } = e2;
      return Xe({ span_id: t2, trace_id: n2, data: r2, description: o2, parent_span_id: s2, start_timestamp: Bt(i2), timestamp: Bt(a2) || void 0, status: Vt(c2), op: r2["sentry.op"], origin: r2["sentry.origin"], _metrics_summary: jt(e2) });
    }
    return { span_id: t2, trace_id: n2 };
  } catch (e3) {
    return {};
  }
}
function Vt(e2) {
  if (e2 && 0 !== e2.code) return 1 === e2.code ? "ok" : e2.message || "unknown_error";
}
function Jt(e2) {
  return e2._sentryRootSpan || e2;
}
function $t() {
  Nt || (oe(() => {
    console.warn("[Sentry] Deprecation warning: Returning null from `beforeSendSpan` will be disallowed from SDK version 9.0.0 onwards. The callback will only support mutating spans. To drop certain spans, configure the respective integrations directly.");
  }), Nt = true);
}
var qt = "production";
function zt(e2, t2) {
  const n2 = t2.getOptions(), { publicKey: r2 } = t2.getDsn() || {}, i2 = Xe({ environment: n2.environment || qt, release: n2.release, public_key: r2, trace_id: e2 });
  return t2.emit("createDsc", i2), i2;
}
function Wt(e2) {
  const t2 = At();
  if (!t2) return {};
  const n2 = Jt(e2), r2 = n2._frozenDsc;
  if (r2) return r2;
  const i2 = n2.spanContext().traceState, o2 = i2 && i2.get("sentry.dsc"), a2 = o2 && Lt(o2);
  if (a2) return a2;
  const s2 = zt(e2.spanContext().traceId, t2), c2 = Ut(n2), l2 = c2.data || {}, u2 = l2["sentry.sample_rate"];
  null != u2 && (s2.sample_rate = `${u2}`);
  const d2 = l2["sentry.source"], h2 = c2.description;
  return "url" !== d2 && h2 && (s2.transaction = h2), (function(e3) {
    if ("boolean" == typeof __SENTRY_TRACING__ && !__SENTRY_TRACING__) return false;
    const t3 = At(), n3 = e3 || t3 && t3.getOptions();
    return !!n3 && (n3.enableTracing || "tracesSampleRate" in n3 || "tracesSampler" in n3);
  })() && (s2.sampled = String((function(e3) {
    const { traceFlags: t3 } = e3.spanContext();
    return 1 === t3;
  })(n2))), t2.emit("createDsc", s2, n2), s2;
}
var Gt = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Ht(e2, t2 = false) {
  const { host: n2, path: r2, pass: i2, port: o2, projectId: a2, protocol: s2, publicKey: c2 } = e2;
  return `${s2}://${c2}${t2 && i2 ? `:${i2}` : ""}@${n2}${o2 ? `:${o2}` : ""}/${r2 ? `${r2}/` : r2}${a2}`;
}
function Qt(e2) {
  return { protocol: e2.protocol, publicKey: e2.publicKey || "", pass: e2.pass || "", host: e2.host, port: e2.port || "", path: e2.path || "", projectId: e2.projectId };
}
function Yt(e2) {
  const t2 = "string" == typeof e2 ? (function(e3) {
    const t3 = Gt.exec(e3);
    if (!t3) return void oe(() => {
      console.error(`Invalid Sentry Dsn: ${e3}`);
    });
    const [n2, r2, i2 = "", o2 = "", a2 = "", s2 = ""] = t3.slice(1);
    let c2 = "", l2 = s2;
    const u2 = l2.split("/");
    if (u2.length > 1 && (c2 = u2.slice(0, -1).join("/"), l2 = u2.pop()), l2) {
      const e4 = l2.match(/^\d+/);
      e4 && (l2 = e4[0]);
    }
    return Qt({ host: o2, pass: i2, path: c2, projectId: l2, port: a2, protocol: n2, publicKey: r2 });
  })(e2) : Qt(e2);
  if (t2 && (function(e3) {
    if (!ne) return true;
    const { port: t3, projectId: n2, protocol: r2 } = e3;
    return !(["protocol", "publicKey", "host", "projectId"].find((t4) => !e3[t4] && (ae.error(`Invalid Sentry Dsn: ${t4} missing`), true)) || (n2.match(/^\d+$/) ? /* @__PURE__ */ (function(e4) {
      return "http" === e4 || "https" === e4;
    })(r2) ? t3 && isNaN(parseInt(t3, 10)) && (ae.error(`Invalid Sentry Dsn: Invalid port ${t3}`), 1) : (ae.error(`Invalid Sentry Dsn: Invalid protocol ${r2}`), 1) : (ae.error(`Invalid Sentry Dsn: Invalid projectId ${n2}`), 1)));
  })(t2)) return t2;
}
function Kt(e2, t2 = 100, n2 = 1 / 0) {
  try {
    return Zt("", e2, t2, n2);
  } catch (e3) {
    return { ERROR: `**non-serializable** (${e3})` };
  }
}
function Xt(e2, t2 = 3, n2 = 102400) {
  const r2 = Kt(e2, t2);
  return i2 = r2, (function(e3) {
    return ~-encodeURI(e3).split(/%..|./).length;
  })(JSON.stringify(i2)) > n2 ? Xt(e2, t2 - 1, n2) : r2;
  var i2;
}
function Zt(e2, t2, n2 = 1 / 0, r2 = 1 / 0, i2 = /* @__PURE__ */ (function() {
  const e3 = "function" == typeof WeakSet, t3 = e3 ? /* @__PURE__ */ new WeakSet() : [];
  return [function(n3) {
    if (e3) return !!t3.has(n3) || (t3.add(n3), false);
    for (let e4 = 0; e4 < t3.length; e4++) if (t3[e4] === n3) return true;
    return t3.push(n3), false;
  }, function(n3) {
    if (e3) t3.delete(n3);
    else for (let e4 = 0; e4 < t3.length; e4++) if (t3[e4] === n3) {
      t3.splice(e4, 1);
      break;
    }
  }];
})()) {
  const [o2, a2] = i2;
  if (null == t2 || ["boolean", "string"].includes(typeof t2) || "number" == typeof t2 && Number.isFinite(t2)) return t2;
  const s2 = (function(e3, t3) {
    try {
      if ("domain" === e3 && t3 && "object" == typeof t3 && t3._events) return "[Domain]";
      if ("domainEmitter" === e3) return "[DomainEmitter]";
      if ("undefined" != typeof global && t3 === global) return "[Global]";
      if ("undefined" != typeof window && t3 === window) return "[Window]";
      if ("undefined" != typeof document && t3 === document) return "[Document]";
      if (Fe(t3)) return "[VueViewModel]";
      if (Ie(n3 = t3) && "nativeEvent" in n3 && "preventDefault" in n3 && "stopPropagation" in n3) return "[SyntheticEvent]";
      if ("number" == typeof t3 && !Number.isFinite(t3)) return `[${t3}]`;
      if ("function" == typeof t3) return `[Function: ${he(t3)}]`;
      if ("symbol" == typeof t3) return `[${String(t3)}]`;
      if ("bigint" == typeof t3) return `[BigInt: ${String(t3)}]`;
      const r3 = (function(e4) {
        const t4 = Object.getPrototypeOf(e4);
        return t4 ? t4.constructor.name : "null prototype";
      })(t3);
      return /^HTML(\w*)Element$/.test(r3) ? `[HTMLElement: ${r3}]` : `[object ${r3}]`;
    } catch (e4) {
      return `**non-serializable** (${e4})`;
    }
    var n3;
  })(e2, t2);
  if (!s2.startsWith("[object ")) return s2;
  if (t2.__sentry_skip_normalization__) return t2;
  const c2 = "number" == typeof t2.__sentry_override_normalization_depth__ ? t2.__sentry_override_normalization_depth__ : n2;
  if (0 === c2) return s2.replace("object ", "");
  if (o2(t2)) return "[Circular ~]";
  const l2 = t2;
  if (l2 && "function" == typeof l2.toJSON) try {
    return Zt("", l2.toJSON(), c2 - 1, r2, i2);
  } catch (e3) {
  }
  const u2 = Array.isArray(t2) ? [] : {};
  let d2 = 0;
  const h2 = Qe(t2);
  for (const e3 in h2) {
    if (!Object.prototype.hasOwnProperty.call(h2, e3)) continue;
    if (d2 >= r2) {
      u2[e3] = "[MaxProperties ~]";
      break;
    }
    const t3 = h2[e3];
    u2[e3] = Zt(e3, t3, c2 - 1, r2, i2), d2++;
  }
  return a2(t2), u2;
}
function en(e2, t2 = []) {
  return [e2, t2];
}
function tn(e2, t2) {
  const [n2, r2] = e2;
  return [n2, [...r2, t2]];
}
function nn(e2, t2) {
  const n2 = e2[1];
  for (const e3 of n2) {
    if (t2(e3, e3[0].type)) return true;
  }
  return false;
}
function rn(e2) {
  return ee.__SENTRY__ && ee.__SENTRY__.encodePolyfill ? ee.__SENTRY__.encodePolyfill(e2) : new TextEncoder().encode(e2);
}
function on(e2) {
  const [t2, n2] = e2;
  let r2 = JSON.stringify(t2);
  function i2(e3) {
    "string" == typeof r2 ? r2 = "string" == typeof e3 ? r2 + e3 : [rn(r2), e3] : r2.push("string" == typeof e3 ? rn(e3) : e3);
  }
  for (const e3 of n2) {
    const [t3, n3] = e3;
    if (i2(`
${JSON.stringify(t3)}
`), "string" == typeof n3 || n3 instanceof Uint8Array) i2(n3);
    else {
      let e4;
      try {
        e4 = JSON.stringify(n3);
      } catch (t4) {
        e4 = JSON.stringify(Kt(n3));
      }
      i2(e4);
    }
  }
  return "string" == typeof r2 ? r2 : (function(e3) {
    const t3 = e3.reduce((e4, t4) => e4 + t4.length, 0), n3 = new Uint8Array(t3);
    let r3 = 0;
    for (const t4 of e3) n3.set(t4, r3), r3 += t4.length;
    return n3;
  })(r2);
}
function an(e2) {
  const t2 = "string" == typeof e2.data ? rn(e2.data) : e2.data;
  return [Xe({ type: "attachment", length: t2.length, filename: e2.filename, content_type: e2.contentType, attachment_type: e2.attachmentType }), t2];
}
var sn = { session: "session", sessions: "session", attachment: "attachment", transaction: "transaction", event: "error", client_report: "internal", user_report: "default", profile: "profile", profile_chunk: "profile", replay_event: "replay", replay_recording: "replay", check_in: "monitor", feedback: "feedback", span: "span", statsd: "metric_bucket", raw_security: "security" };
function cn(e2) {
  return sn[e2];
}
function ln(e2) {
  if (!e2 || !e2.sdk) return;
  const { name: t2, version: n2 } = e2.sdk;
  return { name: t2, version: n2 };
}
function un(e2, t2, n2, r2) {
  const i2 = ln(n2), o2 = e2.type && "replay_event" !== e2.type ? e2.type : "event";
  !(function(e3, t3) {
    t3 && (e3.sdk = e3.sdk || {}, e3.sdk.name = e3.sdk.name || t3.name, e3.sdk.version = e3.sdk.version || t3.version, e3.sdk.integrations = [...e3.sdk.integrations || [], ...t3.integrations || []], e3.sdk.packages = [...e3.sdk.packages || [], ...t3.packages || []]);
  })(e2, n2 && n2.sdk);
  const a2 = (function(e3, t3, n3, r3) {
    const i3 = e3.sdkProcessingMetadata && e3.sdkProcessingMetadata.dynamicSamplingContext;
    return { event_id: e3.event_id, sent_at: (/* @__PURE__ */ new Date()).toISOString(), ...t3 && { sdk: t3 }, ...!!n3 && r3 && { dsn: Ht(r3) }, ...i3 && { trace: Xe({ ...i3 }) } };
  })(e2, i2, r2, t2);
  delete e2.sdkProcessingMetadata;
  return en(a2, [[{ type: o2 }, e2]]);
}
function dn(e2, t2, n2, r2 = 0) {
  return new dt((i2, o2) => {
    const a2 = e2[r2];
    if (null === t2 || "function" != typeof a2) i2(t2);
    else {
      const s2 = a2({ ...t2 }, n2);
      X && a2.id && null === s2 && ae.log(`Event processor "${a2.id}" dropped event`), De(s2) ? s2.then((t3) => dn(e2, t3, n2, r2 + 1).then(i2)).then(null, o2) : dn(e2, s2, n2, r2 + 1).then(i2).then(null, o2);
    }
  });
}
var hn;
var pn;
var fn;
function vn(e2, t2) {
  const { fingerprint: n2, span: r2, breadcrumbs: i2, sdkProcessingMetadata: o2 } = t2;
  !(function(e3, t3) {
    const { extra: n3, tags: r3, user: i3, contexts: o3, level: a2, transactionName: s2 } = t3, c2 = Xe(n3);
    c2 && Object.keys(c2).length && (e3.extra = { ...c2, ...e3.extra });
    const l2 = Xe(r3);
    l2 && Object.keys(l2).length && (e3.tags = { ...l2, ...e3.tags });
    const u2 = Xe(i3);
    u2 && Object.keys(u2).length && (e3.user = { ...u2, ...e3.user });
    const d2 = Xe(o3);
    d2 && Object.keys(d2).length && (e3.contexts = { ...d2, ...e3.contexts });
    a2 && (e3.level = a2);
    s2 && "transaction" !== e3.type && (e3.transaction = s2);
  })(e2, t2), r2 && (function(e3, t3) {
    e3.contexts = { trace: Ft(t3), ...e3.contexts }, e3.sdkProcessingMetadata = { dynamicSamplingContext: Wt(t3), ...e3.sdkProcessingMetadata };
    const n3 = Jt(t3), r3 = Ut(n3).description;
    r3 && !e3.transaction && "transaction" === e3.type && (e3.transaction = r3);
  })(e2, r2), (function(e3, t3) {
    e3.fingerprint = e3.fingerprint ? Array.isArray(e3.fingerprint) ? e3.fingerprint : [e3.fingerprint] : [], t3 && (e3.fingerprint = e3.fingerprint.concat(t3));
    e3.fingerprint && !e3.fingerprint.length && delete e3.fingerprint;
  })(e2, n2), (function(e3, t3) {
    const n3 = [...e3.breadcrumbs || [], ...t3];
    e3.breadcrumbs = n3.length ? n3 : void 0;
  })(e2, i2), (function(e3, t3) {
    e3.sdkProcessingMetadata = { ...e3.sdkProcessingMetadata, ...t3 };
  })(e2, o2);
}
function gn(e2, t2) {
  const { extra: n2, tags: r2, user: i2, contexts: o2, level: a2, sdkProcessingMetadata: s2, breadcrumbs: c2, fingerprint: l2, eventProcessors: u2, attachments: d2, propagationContext: h2, transactionName: p2, span: f2 } = t2;
  mn(e2, "extra", n2), mn(e2, "tags", r2), mn(e2, "user", i2), mn(e2, "contexts", o2), e2.sdkProcessingMetadata = gt(e2.sdkProcessingMetadata, s2, 2), a2 && (e2.level = a2), p2 && (e2.transactionName = p2), f2 && (e2.span = f2), c2.length && (e2.breadcrumbs = [...e2.breadcrumbs, ...c2]), l2.length && (e2.fingerprint = [...e2.fingerprint, ...l2]), u2.length && (e2.eventProcessors = [...e2.eventProcessors, ...u2]), d2.length && (e2.attachments = [...e2.attachments, ...d2]), e2.propagationContext = { ...e2.propagationContext, ...h2 };
}
function mn(e2, t2, n2) {
  e2[t2] = gt(e2[t2], n2, 1);
}
function yn(e2, t2, n2, r2, i2, o2) {
  const { normalizeDepth: a2 = 3, normalizeMaxBreadth: s2 = 1e3 } = e2, c2 = { ...t2, event_id: t2.event_id || n2.event_id || nt(), timestamp: t2.timestamp || et() }, l2 = n2.integrations || e2.integrations.map((e3) => e3.name);
  !(function(e3, t3) {
    const { environment: n3, release: r3, dist: i3, maxValueLength: o3 = 250 } = t3;
    e3.environment = e3.environment || n3 || qt, !e3.release && r3 && (e3.release = r3);
    !e3.dist && i3 && (e3.dist = i3);
    e3.message && (e3.message = Ve(e3.message, o3));
    const a3 = e3.exception && e3.exception.values && e3.exception.values[0];
    a3 && a3.value && (a3.value = Ve(a3.value, o3));
    const s3 = e3.request;
    s3 && s3.url && (s3.url = Ve(s3.url, o3));
  })(c2, e2), (function(e3, t3) {
    t3.length > 0 && (e3.sdk = e3.sdk || {}, e3.sdk.integrations = [...e3.sdk.integrations || [], ...t3]);
  })(c2, l2), i2 && i2.emit("applyFrameMetadata", t2), void 0 === t2.type && (function(e3, t3) {
    const n3 = (function(e4) {
      const t4 = ee._sentryDebugIds;
      if (!t4) return {};
      const n4 = Object.keys(t4);
      return fn && n4.length === pn || (pn = n4.length, fn = n4.reduce((n5, r3) => {
        hn || (hn = {});
        const i3 = hn[r3];
        if (i3) n5[i3[0]] = i3[1];
        else {
          const i4 = e4(r3);
          for (let e5 = i4.length - 1; e5 >= 0; e5--) {
            const o3 = i4[e5], a3 = o3 && o3.filename, s3 = t4[r3];
            if (a3 && s3) {
              n5[a3] = s3, hn[r3] = [a3, s3];
              break;
            }
          }
        }
        return n5;
      }, {})), fn;
    })(t3);
    try {
      e3.exception.values.forEach((e4) => {
        e4.stacktrace.frames.forEach((e5) => {
          n3 && e5.filename && (e5.debug_id = n3[e5.filename]);
        });
      });
    } catch (e4) {
    }
  })(c2, e2.stackParser);
  const u2 = (function(e3, t3) {
    if (!t3) return e3;
    const n3 = e3 ? e3.clone() : new wt();
    return n3.update(t3), n3;
  })(r2, n2.captureContext);
  n2.mechanism && at(c2, n2.mechanism);
  const d2 = i2 ? i2.getEventProcessors() : [], h2 = te("globalScope", () => new wt()).getScopeData();
  if (o2) {
    gn(h2, o2.getScopeData());
  }
  if (u2) {
    gn(h2, u2.getScopeData());
  }
  const p2 = [...n2.attachments || [], ...h2.attachments];
  p2.length && (n2.attachments = p2), vn(c2, h2);
  return dn([...d2, ...h2.eventProcessors], c2, n2).then((e3) => (e3 && (function(e4) {
    const t3 = {};
    try {
      e4.exception.values.forEach((e5) => {
        e5.stacktrace.frames.forEach((e6) => {
          e6.debug_id && (e6.abs_path ? t3[e6.abs_path] = e6.debug_id : e6.filename && (t3[e6.filename] = e6.debug_id), delete e6.debug_id);
        });
      });
    } catch (e5) {
    }
    if (0 === Object.keys(t3).length) return;
    e4.debug_meta = e4.debug_meta || {}, e4.debug_meta.images = e4.debug_meta.images || [];
    const n3 = e4.debug_meta.images;
    Object.entries(t3).forEach(([e5, t4]) => {
      n3.push({ type: "sourcemap", code_file: e5, debug_id: t4 });
    });
  })(e3), "number" == typeof a2 && a2 > 0 ? (function(e4, t3, n3) {
    if (!e4) return null;
    const r3 = { ...e4, ...e4.breadcrumbs && { breadcrumbs: e4.breadcrumbs.map((e5) => ({ ...e5, ...e5.data && { data: Kt(e5.data, t3, n3) } })) }, ...e4.user && { user: Kt(e4.user, t3, n3) }, ...e4.contexts && { contexts: Kt(e4.contexts, t3, n3) }, ...e4.extra && { extra: Kt(e4.extra, t3, n3) } };
    e4.contexts && e4.contexts.trace && r3.contexts && (r3.contexts.trace = e4.contexts.trace, e4.contexts.trace.data && (r3.contexts.trace.data = Kt(e4.contexts.trace.data, t3, n3)));
    e4.spans && (r3.spans = e4.spans.map((e5) => ({ ...e5, ...e5.data && { data: Kt(e5.data, t3, n3) } })));
    e4.contexts && e4.contexts.flags && r3.contexts && (r3.contexts.flags = Kt(e4.contexts.flags, 3, n3));
    return r3;
  })(e3, a2, s2) : e3));
}
function bn(e2) {
  if (e2) return (function(e3) {
    return e3 instanceof wt || "function" == typeof e3;
  })(e2) || (function(e3) {
    return Object.keys(e3).some((e4) => _n.includes(e4));
  })(e2) ? { captureContext: e2 } : e2;
}
var _n = ["user", "level", "extra", "contexts", "tags", "fingerprint", "requestSession", "propagationContext"];
function wn(e2, t2) {
  return Ot().captureEvent(e2, t2);
}
function kn(e2) {
  const t2 = At(), n2 = Pt(), r2 = Ot(), { release: i2, environment: o2 = qt } = t2 && t2.getOptions() || {}, { userAgent: a2 } = ee.navigator || {}, s2 = ht({ release: i2, environment: o2, user: r2.getUser() || n2.getUser(), ...a2 && { userAgent: a2 }, ...e2 }), c2 = n2.getSession();
  return c2 && "ok" === c2.status && pt(c2, { status: "exited" }), Sn(), n2.setSession(s2), r2.setSession(s2), s2;
}
function Sn() {
  const e2 = Pt(), t2 = Ot(), n2 = t2.getSession() || e2.getSession();
  n2 && (function(e3, t3) {
    let n3 = {};
    t3 ? n3 = { status: t3 } : "ok" === e3.status && (n3 = { status: "exited" }), pt(e3, n3);
  })(n2), Mn(), e2.setSession(), t2.setSession();
}
function Mn() {
  const e2 = Pt(), t2 = Ot(), n2 = At(), r2 = t2.getSession() || e2.getSession();
  r2 && n2 && n2.captureSession(r2);
}
function En(e2 = false) {
  e2 ? Sn() : Mn();
}
function Cn(e2, t2, n2) {
  return t2 || `${(function(e3) {
    return `${(function(e4) {
      const t3 = e4.protocol ? `${e4.protocol}:` : "", n3 = e4.port ? `:${e4.port}` : "";
      return `${t3}//${e4.host}${n3}${e4.path ? `/${e4.path}` : ""}/api/`;
    })(e3)}${e3.projectId}/envelope/`;
  })(e2)}?${(function(e3, t3) {
    const n3 = { sentry_version: "7" };
    return e3.publicKey && (n3.sentry_key = e3.publicKey), t3 && (n3.sentry_client = `${t3.name}/${t3.version}`), new URLSearchParams(n3).toString();
  })(e2, n2)}`;
}
var Tn = [];
function On(e2, t2) {
  for (const n2 of t2) n2 && n2.afterAllSetup && n2.afterAllSetup(e2);
}
function Pn(e2, t2, n2) {
  if (n2[t2.name]) X && ae.log(`Integration skipped because it was already installed: ${t2.name}`);
  else {
    if (n2[t2.name] = t2, -1 === Tn.indexOf(t2.name) && "function" == typeof t2.setupOnce && (t2.setupOnce(), Tn.push(t2.name)), t2.setup && "function" == typeof t2.setup && t2.setup(e2), "function" == typeof t2.preprocessEvent) {
      const n3 = t2.preprocessEvent.bind(t2);
      e2.on("preprocessEvent", (t3, r2) => n3(t3, r2, e2));
    }
    if ("function" == typeof t2.processEvent) {
      const n3 = t2.processEvent.bind(t2), r2 = Object.assign((t3, r3) => n3(t3, r3, e2), { id: t2.name });
      e2.addEventProcessor(r2);
    }
    X && ae.log(`Integration installed: ${t2.name}`);
  }
}
var An = class extends Error {
  constructor(e2, t2 = "warn") {
    super(e2), this.message = e2, this.logLevel = t2;
  }
};
var xn = "Not capturing exception because it's already been captured.";
var jn = class {
  constructor(e2) {
    if (this._options = e2, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], e2.dsn ? this._dsn = Yt(e2.dsn) : X && ae.warn("No DSN provided, client will not send events."), this._dsn) {
      const t3 = Cn(this._dsn, e2.tunnel, e2._metadata ? e2._metadata.sdk : void 0);
      this._transport = e2.transport({ tunnel: this._options.tunnel, recordDroppedEvent: this.recordDroppedEvent.bind(this), ...e2.transportOptions, url: t3 });
    }
    const t2 = ["enableTracing", "tracesSampleRate", "tracesSampler"].find((t3) => t3 in e2 && null == e2[t3]);
    t2 && oe(() => {
      console.warn(`[Sentry] Deprecation warning: \`${t2}\` is set to undefined, which leads to tracing being enabled. In v9, a value of \`undefined\` will result in tracing being disabled.`);
    });
  }
  captureException(e2, t2, n2) {
    const r2 = nt();
    if (st(e2)) return X && ae.log(xn), r2;
    const i2 = { event_id: r2, ...t2 };
    return this._process(this.eventFromException(e2, i2).then((e3) => this._captureEvent(e3, i2, n2))), i2.event_id;
  }
  captureMessage(e2, t2, n2, r2) {
    const i2 = { event_id: nt(), ...n2 }, o2 = xe(e2) ? e2 : String(e2), a2 = je(e2) ? this.eventFromMessage(o2, t2, i2) : this.eventFromException(e2, i2);
    return this._process(a2.then((e3) => this._captureEvent(e3, i2, r2))), i2.event_id;
  }
  captureEvent(e2, t2, n2) {
    const r2 = nt();
    if (t2 && t2.originalException && st(t2.originalException)) return X && ae.log(xn), r2;
    const i2 = { event_id: r2, ...t2 }, o2 = (e2.sdkProcessingMetadata || {}).capturedSpanScope;
    return this._process(this._captureEvent(e2, i2, o2 || n2)), i2.event_id;
  }
  captureSession(e2) {
    "string" != typeof e2.release ? X && ae.warn("Discarded session because of missing or non-string release") : (this.sendSession(e2), pt(e2, { init: false }));
  }
  getDsn() {
    return this._dsn;
  }
  getOptions() {
    return this._options;
  }
  getSdkMetadata() {
    return this._options._metadata;
  }
  getTransport() {
    return this._transport;
  }
  flush(e2) {
    const t2 = this._transport;
    return t2 ? (this.emit("flush"), this._isClientDoneProcessing(e2).then((n2) => t2.flush(e2).then((e3) => n2 && e3))) : lt(true);
  }
  close(e2) {
    return this.flush(e2).then((e3) => (this.getOptions().enabled = false, this.emit("close"), e3));
  }
  getEventProcessors() {
    return this._eventProcessors;
  }
  addEventProcessor(e2) {
    this._eventProcessors.push(e2);
  }
  init() {
    (this._isEnabled() || this._options.integrations.some(({ name: e2 }) => e2.startsWith("Spotlight"))) && this._setupIntegrations();
  }
  getIntegrationByName(e2) {
    return this._integrations[e2];
  }
  addIntegration(e2) {
    const t2 = this._integrations[e2.name];
    Pn(this, e2, this._integrations), t2 || On(this, [e2]);
  }
  sendEvent(e2, t2 = {}) {
    this.emit("beforeSendEvent", e2, t2);
    let n2 = un(e2, this._dsn, this._options._metadata, this._options.tunnel);
    for (const e3 of t2.attachments || []) n2 = tn(n2, an(e3));
    const r2 = this.sendEnvelope(n2);
    r2 && r2.then((t3) => this.emit("afterSendEvent", e2, t3), null);
  }
  sendSession(e2) {
    const t2 = (function(e3, t3, n2, r2) {
      const i2 = ln(n2);
      return en({ sent_at: (/* @__PURE__ */ new Date()).toISOString(), ...i2 && { sdk: i2 }, ...!!r2 && t3 && { dsn: Ht(t3) } }, ["aggregates" in e3 ? [{ type: "sessions" }, e3] : [{ type: "session" }, e3.toJSON()]]);
    })(e2, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(t2);
  }
  recordDroppedEvent(e2, t2, n2) {
    if (this._options.sendClientReports) {
      const r2 = "number" == typeof n2 ? n2 : 1, i2 = `${e2}:${t2}`;
      X && ae.log(`Recording outcome: "${i2}"${r2 > 1 ? ` (${r2} times)` : ""}`), this._outcomes[i2] = (this._outcomes[i2] || 0) + r2;
    }
  }
  on(e2, t2) {
    const n2 = this._hooks[e2] = this._hooks[e2] || [];
    return n2.push(t2), () => {
      const e3 = n2.indexOf(t2);
      e3 > -1 && n2.splice(e3, 1);
    };
  }
  emit(e2, ...t2) {
    const n2 = this._hooks[e2];
    n2 && n2.forEach((e3) => e3(...t2));
  }
  sendEnvelope(e2) {
    return this.emit("beforeEnvelope", e2), this._isEnabled() && this._transport ? this._transport.send(e2).then(null, (e3) => (X && ae.error("Error while sending envelope:", e3), e3)) : (X && ae.error("Transport disabled"), lt({}));
  }
  _setupIntegrations() {
    const { integrations: e2 } = this._options;
    this._integrations = (function(e3, t2) {
      const n2 = {};
      return t2.forEach((t3) => {
        t3 && Pn(e3, t3, n2);
      }), n2;
    })(this, e2), On(this, e2);
  }
  _updateSessionFromEvent(e2, t2) {
    let n2 = "fatal" === t2.level, r2 = false;
    const i2 = t2.exception && t2.exception.values;
    if (i2) {
      r2 = true;
      for (const e3 of i2) {
        const t3 = e3.mechanism;
        if (t3 && false === t3.handled) {
          n2 = true;
          break;
        }
      }
    }
    const o2 = "ok" === e2.status;
    (o2 && 0 === e2.errors || o2 && n2) && (pt(e2, { ...n2 && { status: "crashed" }, errors: e2.errors || Number(r2 || n2) }), this.captureSession(e2));
  }
  _isClientDoneProcessing(e2) {
    return new dt((t2) => {
      let n2 = 0;
      const r2 = setInterval(() => {
        0 == this._numProcessing ? (clearInterval(r2), t2(true)) : (n2 += 1, e2 && n2 >= e2 && (clearInterval(r2), t2(false)));
      }, 1);
    });
  }
  _isEnabled() {
    return false !== this.getOptions().enabled && void 0 !== this._transport;
  }
  _prepareEvent(e2, t2, n2 = Ot(), r2 = Pt()) {
    const i2 = this.getOptions(), o2 = Object.keys(this._integrations);
    return !t2.integrations && o2.length > 0 && (t2.integrations = o2), this.emit("preprocessEvent", e2, t2), e2.type || r2.setLastEventId(e2.event_id || t2.event_id), yn(i2, e2, t2, n2, this, r2).then((e3) => {
      if (null === e3) return e3;
      e3.contexts = { trace: xt(n2), ...e3.contexts };
      const t3 = (function(e4, t4) {
        const n3 = t4.getPropagationContext();
        return n3.dsc || zt(n3.traceId, e4);
      })(this, n2);
      return e3.sdkProcessingMetadata = { dynamicSamplingContext: t3, ...e3.sdkProcessingMetadata }, e3;
    });
  }
  _captureEvent(e2, t2 = {}, n2) {
    return this._processEvent(e2, t2, n2).then((e3) => e3.event_id, (e3) => {
      X && (e3 instanceof An && "log" === e3.logLevel ? ae.log(e3.message) : ae.warn(e3));
    });
  }
  _processEvent(e2, t2, n2) {
    const r2 = this.getOptions(), { sampleRate: i2 } = r2, o2 = Ln(e2), a2 = In(e2), s2 = e2.type || "error", c2 = `before send for type \`${s2}\``, l2 = void 0 === i2 ? void 0 : (function(e3) {
      if ("boolean" == typeof e3) return Number(e3);
      const t3 = "string" == typeof e3 ? parseFloat(e3) : e3;
      if (!("number" != typeof t3 || isNaN(t3) || t3 < 0 || t3 > 1)) return t3;
      X && ae.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(e3)} of type ${JSON.stringify(typeof e3)}.`);
    })(i2);
    if (a2 && "number" == typeof l2 && Math.random() > l2) return this.recordDroppedEvent("sample_rate", "error", e2), ut(new An(`Discarding event because it's not included in the random sample (sampling rate = ${i2})`, "log"));
    const u2 = "replay_event" === s2 ? "replay" : s2, d2 = (e2.sdkProcessingMetadata || {}).capturedSpanIsolationScope;
    return this._prepareEvent(e2, t2, n2, d2).then((n3) => {
      if (null === n3) throw this.recordDroppedEvent("event_processor", u2, e2), new An("An event processor returned `null`, will not send event.", "log");
      if (t2.data && true === t2.data.__sentry__) return n3;
      const i3 = (function(e3, t3, n4, r3) {
        const { beforeSend: i4, beforeSendTransaction: o3, beforeSendSpan: a3 } = t3;
        if (In(n4) && i4) return i4(n4, r3);
        if (Ln(n4)) {
          if (n4.spans && a3) {
            const t4 = [];
            for (const r4 of n4.spans) {
              const n5 = a3(r4);
              n5 ? t4.push(n5) : ($t(), e3.recordDroppedEvent("before_send", "span"));
            }
            n4.spans = t4;
          }
          if (o3) {
            if (n4.spans) {
              const e4 = n4.spans.length;
              n4.sdkProcessingMetadata = { ...n4.sdkProcessingMetadata, spanCountBeforeProcessing: e4 };
            }
            return o3(n4, r3);
          }
        }
        return n4;
      })(this, r2, n3, t2);
      return (function(e3, t3) {
        const n4 = `${t3} must return \`null\` or a valid event.`;
        if (De(e3)) return e3.then((e4) => {
          if (!Ie(e4) && null !== e4) throw new An(n4);
          return e4;
        }, (e4) => {
          throw new An(`${t3} rejected with ${e4}`);
        });
        if (!Ie(e3) && null !== e3) throw new An(n4);
        return e3;
      })(i3, c2);
    }).then((r3) => {
      if (null === r3) {
        if (this.recordDroppedEvent("before_send", u2, e2), o2) {
          const t3 = 1 + (e2.spans || []).length;
          this.recordDroppedEvent("before_send", "span", t3);
        }
        throw new An(`${c2} returned \`null\`, will not send event.`, "log");
      }
      const i3 = n2 && n2.getSession();
      if (!o2 && i3 && this._updateSessionFromEvent(i3, r3), o2) {
        const e3 = (r3.sdkProcessingMetadata && r3.sdkProcessingMetadata.spanCountBeforeProcessing || 0) - (r3.spans ? r3.spans.length : 0);
        e3 > 0 && this.recordDroppedEvent("before_send", "span", e3);
      }
      const a3 = r3.transaction_info;
      if (o2 && a3 && r3.transaction !== e2.transaction) {
        const e3 = "custom";
        r3.transaction_info = { ...a3, source: e3 };
      }
      return this.sendEvent(r3, t2), r3;
    }).then(null, (e3) => {
      if (e3 instanceof An) throw e3;
      throw this.captureException(e3, { data: { __sentry__: true }, originalException: e3 }), new An(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${e3}`);
    });
  }
  _process(e2) {
    this._numProcessing++, e2.then((e3) => (this._numProcessing--, e3), (e3) => (this._numProcessing--, e3));
  }
  _clearOutcomes() {
    const e2 = this._outcomes;
    return this._outcomes = {}, Object.entries(e2).map(([e3, t2]) => {
      const [n2, r2] = e3.split(":");
      return { reason: n2, category: r2, quantity: t2 };
    });
  }
  _flushOutcomes() {
    X && ae.log("Flushing outcomes...");
    const e2 = this._clearOutcomes();
    if (0 === e2.length) return void (X && ae.log("No outcomes to send"));
    if (!this._dsn) return void (X && ae.log("No dsn provided, will not send outcomes"));
    X && ae.log("Sending outcomes:", e2);
    const t2 = (n2 = e2, en((r2 = this._options.tunnel && Ht(this._dsn)) ? { dsn: r2 } : {}, [[{ type: "client_report" }, { timestamp: i2 || et(), discarded_events: n2 }]]));
    var n2, r2, i2;
    this.sendEnvelope(t2);
  }
};
function In(e2) {
  return void 0 === e2.type;
}
function Ln(e2) {
  return "transaction" === e2.type;
}
function Dn(e2) {
  const t2 = [];
  function n2(e3) {
    return t2.splice(t2.indexOf(e3), 1)[0] || Promise.resolve(void 0);
  }
  return { $: t2, add: function(r2) {
    if (!(void 0 === e2 || t2.length < e2)) return ut(new An("Not adding Promise because buffer limit was reached."));
    const i2 = r2();
    return -1 === t2.indexOf(i2) && t2.push(i2), i2.then(() => n2(i2)).then(null, () => n2(i2).then(null, () => {
    })), i2;
  }, drain: function(e3) {
    return new dt((n3, r2) => {
      let i2 = t2.length;
      if (!i2) return n3(true);
      const o2 = setTimeout(() => {
        e3 && e3 > 0 && n3(false);
      }, e3);
      t2.forEach((e4) => {
        lt(e4).then(() => {
          --i2 || (clearTimeout(o2), n3(true));
        }, r2);
      });
    });
  } };
}
function Nn(e2, { statusCode: t2, headers: n2 }, r2 = Date.now()) {
  const i2 = { ...e2 }, o2 = n2 && n2["x-sentry-rate-limits"], a2 = n2 && n2["retry-after"];
  if (o2) for (const e3 of o2.trim().split(",")) {
    const [t3, n3, , , o3] = e3.split(":", 5), a3 = parseInt(t3, 10), s2 = 1e3 * (isNaN(a3) ? 60 : a3);
    if (n3) for (const e4 of n3.split(";")) "metric_bucket" === e4 && o3 && !o3.split(";").includes("custom") || (i2[e4] = r2 + s2);
    else i2.all = r2 + s2;
  }
  else a2 ? i2.all = r2 + (function(e3, t3 = Date.now()) {
    const n3 = parseInt(`${e3}`, 10);
    if (!isNaN(n3)) return 1e3 * n3;
    const r3 = Date.parse(`${e3}`);
    return isNaN(r3) ? 6e4 : r3 - t3;
  })(a2, r2) : 429 === t2 && (i2.all = r2 + 6e4);
  return i2;
}
function Fn(e2, t2, n2 = Dn(e2.bufferSize || 64)) {
  let r2 = {};
  return { send: function(i2) {
    const o2 = [];
    if (nn(i2, (t3, n3) => {
      const i3 = cn(n3);
      if ((function(e3, t4, n4 = Date.now()) {
        return (function(e4, t5) {
          return e4[t5] || e4.all || 0;
        })(e3, t4) > n4;
      })(r2, i3)) {
        const r3 = Bn(t3, n3);
        e2.recordDroppedEvent("ratelimit_backoff", i3, r3);
      } else o2.push(t3);
    }), 0 === o2.length) return lt({});
    const a2 = en(i2[0], o2), s2 = (t3) => {
      nn(a2, (n3, r3) => {
        const i3 = Bn(n3, r3);
        e2.recordDroppedEvent(t3, cn(r3), i3);
      });
    };
    return n2.add(() => t2({ body: on(a2) }).then((e3) => (void 0 !== e3.statusCode && (e3.statusCode < 200 || e3.statusCode >= 300) && X && ae.warn(`Sentry responded with status code ${e3.statusCode} to sent event.`), r2 = Nn(r2, e3), e3), (e3) => {
      throw s2("network_error"), e3;
    })).then((e3) => e3, (e3) => {
      if (e3 instanceof An) return X && ae.error("Skipped sending event because buffer is full."), s2("queue_overflow"), lt({});
      throw e3;
    });
  }, flush: (e3) => n2.drain(e3) };
}
function Bn(e2, t2) {
  if ("event" === t2 || "transaction" === t2) return Array.isArray(e2) ? e2[1] : void 0;
}
var Rn = 100;
function Un(e2, t2) {
  const n2 = At(), r2 = Pt();
  if (!n2) return;
  const { beforeBreadcrumb: i2 = null, maxBreadcrumbs: o2 = Rn } = n2.getOptions();
  if (o2 <= 0) return;
  const a2 = { timestamp: et(), ...e2 }, s2 = i2 ? oe(() => i2(a2, t2)) : a2;
  null !== s2 && (n2.emit && n2.emit("beforeAddBreadcrumb", s2, t2), r2.addBreadcrumb(s2, o2));
}
var Vn;
var Jn = /* @__PURE__ */ new WeakMap();
var $n = () => ({ name: "FunctionToString", setupOnce() {
  Vn = Function.prototype.toString;
  try {
    Function.prototype.toString = function(...e2) {
      const t2 = He(this), n2 = Jn.has(At()) && void 0 !== t2 ? t2 : this;
      return Vn.apply(n2, e2);
    };
  } catch (e2) {
  }
}, setup(e2) {
  Jn.set(e2, true);
} });
var qn = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/, /^ResizeObserver loop completed with undelivered notifications.$/, /^Cannot redefine property: googletag$/, /^Can't find variable: gmo$/, "undefined is not an object (evaluating 'a.L')", `can't redefine non-configurable property "solana"`, "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)", "Can't find variable: _AutofillCallbackHandler", /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/, /^Java exception was raised during method invocation$/];
var zn = (e2 = {}) => ({ name: "InboundFilters", processEvent(t2, n2, r2) {
  const i2 = r2.getOptions(), o2 = (function(e3 = {}, t3 = {}) {
    return { allowUrls: [...e3.allowUrls || [], ...t3.allowUrls || []], denyUrls: [...e3.denyUrls || [], ...t3.denyUrls || []], ignoreErrors: [...e3.ignoreErrors || [], ...t3.ignoreErrors || [], ...e3.disableErrorDefaults ? [] : qn], ignoreTransactions: [...e3.ignoreTransactions || [], ...t3.ignoreTransactions || []], ignoreInternal: void 0 === e3.ignoreInternal || e3.ignoreInternal };
  })(e2, i2);
  return (function(e3, t3) {
    if (t3.ignoreInternal && (function(e4) {
      try {
        return "SentryError" === e4.exception.values[0].type;
      } catch (e5) {
      }
      return false;
    })(e3)) return X && ae.warn(`Event dropped due to being internal Sentry Error.
Event: ${it(e3)}`), true;
    if ((function(e4, t4) {
      if (e4.type || !t4 || !t4.length) return false;
      return (function(e5) {
        const t5 = [];
        e5.message && t5.push(e5.message);
        let n3;
        try {
          n3 = e5.exception.values[e5.exception.values.length - 1];
        } catch (e6) {
        }
        n3 && n3.value && (t5.push(n3.value), n3.type && t5.push(`${n3.type}: ${n3.value}`));
        return t5;
      })(e4).some((e5) => qe(e5, t4));
    })(e3, t3.ignoreErrors)) return X && ae.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${it(e3)}`), true;
    if ((function(e4) {
      if (e4.type) return false;
      if (!e4.exception || !e4.exception.values || 0 === e4.exception.values.length) return false;
      return !e4.message && !e4.exception.values.some((e5) => e5.stacktrace || e5.type && "Error" !== e5.type || e5.value);
    })(e3)) return X && ae.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${it(e3)}`), true;
    if ((function(e4, t4) {
      if ("transaction" !== e4.type || !t4 || !t4.length) return false;
      const n3 = e4.transaction;
      return !!n3 && qe(n3, t4);
    })(e3, t3.ignoreTransactions)) return X && ae.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${it(e3)}`), true;
    if ((function(e4, t4) {
      if (!t4 || !t4.length) return false;
      const n3 = Wn(e4);
      return !!n3 && qe(n3, t4);
    })(e3, t3.denyUrls)) return X && ae.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${it(e3)}.
Url: ${Wn(e3)}`), true;
    if (!(function(e4, t4) {
      if (!t4 || !t4.length) return true;
      const n3 = Wn(e4);
      return !n3 || qe(n3, t4);
    })(e3, t3.allowUrls)) return X && ae.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${it(e3)}.
Url: ${Wn(e3)}`), true;
    return false;
  })(t2, o2) ? null : t2;
} });
function Wn(e2) {
  try {
    let t2;
    try {
      t2 = e2.exception.values[0].stacktrace.frames;
    } catch (e3) {
    }
    return t2 ? (function(e3 = []) {
      for (let t3 = e3.length - 1; t3 >= 0; t3--) {
        const n2 = e3[t3];
        if (n2 && "<anonymous>" !== n2.filename && "[native code]" !== n2.filename) return n2.filename || null;
      }
      return null;
    })(t2) : null;
  } catch (t2) {
    return X && ae.error(`Cannot extract url for event ${it(e2)}`), null;
  }
}
function Gn(e2, t2, n2 = 250, r2, i2, o2, a2) {
  if (!(o2.exception && o2.exception.values && a2 && Ne(a2.originalException, Error))) return;
  const s2 = o2.exception.values.length > 0 ? o2.exception.values[o2.exception.values.length - 1] : void 0;
  var c2, l2;
  s2 && (o2.exception.values = (c2 = Hn(e2, t2, i2, a2.originalException, r2, o2.exception.values, s2, 0), l2 = n2, c2.map((e3) => (e3.value && (e3.value = Ve(e3.value, l2)), e3))));
}
function Hn(e2, t2, n2, r2, i2, o2, a2, s2) {
  if (o2.length >= n2 + 1) return o2;
  let c2 = [...o2];
  if (Ne(r2[i2], Error)) {
    Qn(a2, s2);
    const o3 = e2(t2, r2[i2]), l2 = c2.length;
    Yn(o3, i2, l2, s2), c2 = Hn(e2, t2, n2, r2[i2], i2, [o3, ...c2], o3, l2);
  }
  return Array.isArray(r2.errors) && r2.errors.forEach((r3, o3) => {
    if (Ne(r3, Error)) {
      Qn(a2, s2);
      const l2 = e2(t2, r3), u2 = c2.length;
      Yn(l2, `errors[${o3}]`, u2, s2), c2 = Hn(e2, t2, n2, r3, i2, [l2, ...c2], l2, u2);
    }
  }), c2;
}
function Qn(e2, t2) {
  e2.mechanism = e2.mechanism || { type: "generic", handled: true }, e2.mechanism = { ...e2.mechanism, ..."AggregateError" === e2.type && { is_exception_group: true }, exception_id: t2 };
}
function Yn(e2, t2, n2, r2) {
  e2.mechanism = e2.mechanism || { type: "generic", handled: true }, e2.mechanism = { ...e2.mechanism, type: "chained", source: t2, exception_id: n2, parent_id: r2 };
}
function Kn(e2) {
  if (!e2) return {};
  const t2 = e2.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!t2) return {};
  const n2 = t2[6] || "", r2 = t2[8] || "";
  return { host: t2[4], path: t2[5], protocol: t2[2], search: n2, hash: r2, relative: t2[5] + n2 + r2 };
}
function Xn() {
  "console" in ee && re.forEach(function(e2) {
    e2 in ee.console && ze(ee.console, e2, function(t2) {
      return ie[e2] = t2, function(...t3) {
        ye("console", { args: t3, level: e2 });
        const n2 = ie[e2];
        n2 && n2.apply(ee.console, t3);
      };
    });
  });
}
function Zn(e2) {
  return "warn" === e2 ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(e2) ? e2 : "log";
}
var er = () => {
  let e2;
  return { name: "Dedupe", processEvent(t2) {
    if (t2.type) return t2;
    try {
      if ((function(e3, t3) {
        if (!t3) return false;
        if ((function(e4, t4) {
          const n2 = e4.message, r2 = t4.message;
          if (!n2 && !r2) return false;
          if (n2 && !r2 || !n2 && r2) return false;
          if (n2 !== r2) return false;
          if (!nr(e4, t4)) return false;
          if (!tr(e4, t4)) return false;
          return true;
        })(e3, t3)) return true;
        if ((function(e4, t4) {
          const n2 = rr(t4), r2 = rr(e4);
          if (!n2 || !r2) return false;
          if (n2.type !== r2.type || n2.value !== r2.value) return false;
          if (!nr(e4, t4)) return false;
          if (!tr(e4, t4)) return false;
          return true;
        })(e3, t3)) return true;
        return false;
      })(t2, e2)) return X && ae.warn("Event dropped due to being a duplicate of previously captured event."), null;
    } catch (e3) {
    }
    return e2 = t2;
  } };
};
function tr(e2, t2) {
  let n2 = pe(e2), r2 = pe(t2);
  if (!n2 && !r2) return true;
  if (n2 && !r2 || !n2 && r2) return false;
  if (r2.length !== n2.length) return false;
  for (let e3 = 0; e3 < r2.length; e3++) {
    const t3 = r2[e3], i2 = n2[e3];
    if (t3.filename !== i2.filename || t3.lineno !== i2.lineno || t3.colno !== i2.colno || t3.function !== i2.function) return false;
  }
  return true;
}
function nr(e2, t2) {
  let n2 = e2.fingerprint, r2 = t2.fingerprint;
  if (!n2 && !r2) return true;
  if (n2 && !r2 || !n2 && r2) return false;
  try {
    return !(n2.join("") !== r2.join(""));
  } catch (e3) {
    return false;
  }
}
function rr(e2) {
  return e2.exception && e2.exception.values && e2.exception.values[0];
}
function ir(e2) {
  return void 0 === e2 ? void 0 : e2 >= 400 && e2 < 500 ? "warning" : e2 >= 500 ? "error" : void 0;
}
var or = ee;
function ar(e2) {
  return e2 && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e2.toString());
}
function sr() {
  if ("string" == typeof EdgeRuntime) return true;
  if (!(function() {
    if (!("fetch" in or)) return false;
    try {
      return new Headers(), new Request("http://www.example.com"), new Response(), true;
    } catch (e3) {
      return false;
    }
  })()) return false;
  if (ar(or.fetch)) return true;
  let e2 = false;
  const t2 = or.document;
  if (t2 && "function" == typeof t2.createElement) try {
    const n2 = t2.createElement("iframe");
    n2.hidden = true, t2.head.appendChild(n2), n2.contentWindow && n2.contentWindow.fetch && (e2 = ar(n2.contentWindow.fetch)), t2.head.removeChild(n2);
  } catch (e3) {
    ne && ae.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", e3);
  }
  return e2;
}
function cr(e2, t2) {
  const n2 = "fetch";
  ge(n2, e2), me(n2, () => (function(e3, t3 = false) {
    if (t3 && !sr()) return;
    ze(ee, "fetch", function(t4) {
      return function(...n3) {
        const r2 = new Error(), { method: i2, url: o2 } = (function(e4) {
          if (0 === e4.length) return { method: "GET", url: "" };
          if (2 === e4.length) {
            const [t6, n4] = e4;
            return { url: ur(t6), method: lr(n4, "method") ? String(n4.method).toUpperCase() : "GET" };
          }
          const t5 = e4[0];
          return { url: ur(t5), method: lr(t5, "method") ? String(t5.method).toUpperCase() : "GET" };
        })(n3), a2 = { args: n3, fetchData: { method: i2, url: o2 }, startTimestamp: 1e3 * tt(), virtualError: r2 };
        return e3 || ye("fetch", { ...a2 }), t4.apply(ee, n3).then(async (t5) => (e3 ? e3(t5) : ye("fetch", { ...a2, endTimestamp: 1e3 * tt(), response: t5 }), t5), (e4) => {
          throw ye("fetch", { ...a2, endTimestamp: 1e3 * tt(), error: e4 }), Ce(e4) && void 0 === e4.stack && (e4.stack = r2.stack, We(e4, "framesToPop", 1)), e4;
        });
      };
    });
  })(void 0, t2));
}
function lr(e2, t2) {
  return !!e2 && "object" == typeof e2 && !!e2[t2];
}
function ur(e2) {
  return "string" == typeof e2 ? e2 : e2 ? lr(e2, "url") ? e2.url : e2.toString ? e2.toString() : "" : "";
}
var dr = ee;
var hr = ee;
var pr = 0;
function fr() {
  return pr > 0;
}
function vr(e2, t2 = {}) {
  if (!/* @__PURE__ */ (function(e3) {
    return "function" == typeof e3;
  })(e2)) return e2;
  try {
    const t3 = e2.__sentry_wrapped__;
    if (t3) return "function" == typeof t3 ? t3 : e2;
    if (He(e2)) return e2;
  } catch (t3) {
    return e2;
  }
  const n2 = function(...n3) {
    try {
      const r2 = n3.map((e3) => vr(e3, t2));
      return e2.apply(this, r2);
    } catch (e3) {
      throw pr++, setTimeout(() => {
        pr--;
      }), (function(...e4) {
        const t3 = Tt(Se());
        if (2 === e4.length) {
          const [n4, r2] = e4;
          return n4 ? t3.withSetScope(n4, r2) : t3.withScope(r2);
        }
        t3.withScope(e4[0]);
      })((r2) => {
        var i2, o2;
        r2.addEventProcessor((e4) => (t2.mechanism && (ot(e4, void 0, void 0), at(e4, t2.mechanism)), e4.extra = { ...e4.extra, arguments: n3 }, e4)), i2 = e3, Ot().captureException(i2, bn(o2));
      }), e3;
    }
  };
  try {
    for (const t3 in e2) Object.prototype.hasOwnProperty.call(e2, t3) && (n2[t3] = e2[t3]);
  } catch (e3) {
  }
  Ge(n2, e2), We(e2, "__sentry_wrapped__", n2);
  try {
    Object.getOwnPropertyDescriptor(n2, "name").configurable && Object.defineProperty(n2, "name", { get: () => e2.name });
  } catch (e3) {
  }
  return n2;
}
var gr = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__;
function mr(e2, t2) {
  const n2 = _r(e2, t2), r2 = { type: Sr(t2), value: Mr(t2) };
  return n2.length && (r2.stacktrace = { frames: n2 }), void 0 === r2.type && "" === r2.value && (r2.value = "Unrecoverable error caught"), r2;
}
function yr(e2, t2, n2, r2) {
  const i2 = At(), o2 = i2 && i2.getOptions().normalizeDepth, a2 = (function(e3) {
    for (const t3 in e3) if (Object.prototype.hasOwnProperty.call(e3, t3)) {
      const n3 = e3[t3];
      if (n3 instanceof Error) return n3;
    }
    return;
  })(t2), s2 = { __serialized__: Xt(t2, o2) };
  if (a2) return { exception: { values: [mr(e2, a2)] }, extra: s2 };
  const c2 = { exception: { values: [{ type: Le(t2) ? t2.constructor.name : r2 ? "UnhandledRejection" : "Error", value: Tr(t2, { isUnhandledRejection: r2 }) }] }, extra: s2 };
  if (n2) {
    const t3 = _r(e2, n2);
    t3.length && (c2.exception.values[0].stacktrace = { frames: t3 });
  }
  return c2;
}
function br(e2, t2) {
  return { exception: { values: [mr(e2, t2)] } };
}
function _r(e2, t2) {
  const n2 = t2.stacktrace || t2.stack || "", r2 = (function(e3) {
    if (e3 && wr.test(e3.message)) return 1;
    return 0;
  })(t2), i2 = (function(e3) {
    if ("number" == typeof e3.framesToPop) return e3.framesToPop;
    return 0;
  })(t2);
  try {
    return e2(n2, r2, i2);
  } catch (e3) {
  }
  return [];
}
var wr = /Minified React error #\d+;/i;
function kr(e2) {
  return "undefined" != typeof WebAssembly && void 0 !== WebAssembly.Exception && e2 instanceof WebAssembly.Exception;
}
function Sr(e2) {
  const t2 = e2 && e2.name;
  if (!t2 && kr(e2)) {
    return e2.message && Array.isArray(e2.message) && 2 == e2.message.length ? e2.message[0] : "WebAssembly.Exception";
  }
  return t2;
}
function Mr(e2) {
  const t2 = e2 && e2.message;
  return t2 ? t2.error && "string" == typeof t2.error.message ? t2.error.message : kr(e2) && Array.isArray(e2.message) && 2 == e2.message.length ? e2.message[1] : t2 : "No error message";
}
function Er(e2, t2, n2, r2, i2) {
  let o2;
  if (Oe(t2) && t2.error) {
    return br(e2, t2.error);
  }
  if (Pe(t2) || Te(t2, "DOMException")) {
    const i3 = t2;
    if ("stack" in t2) o2 = br(e2, t2);
    else {
      const t3 = i3.name || (Pe(i3) ? "DOMError" : "DOMException"), a2 = i3.message ? `${t3}: ${i3.message}` : t3;
      o2 = Cr(e2, a2, n2, r2), ot(o2, a2);
    }
    return "code" in i3 && (o2.tags = { ...o2.tags, "DOMException.code": `${i3.code}` }), o2;
  }
  if (Ce(t2)) return br(e2, t2);
  if (Ie(t2) || Le(t2)) {
    return o2 = yr(e2, t2, n2, i2), at(o2, { synthetic: true }), o2;
  }
  return o2 = Cr(e2, t2, n2, r2), ot(o2, `${t2}`, void 0), at(o2, { synthetic: true }), o2;
}
function Cr(e2, t2, n2, r2) {
  const i2 = {};
  if (r2 && n2) {
    const r3 = _r(e2, n2);
    r3.length && (i2.exception = { values: [{ value: t2, stacktrace: { frames: r3 } }] }), at(i2, { synthetic: true });
  }
  if (xe(t2)) {
    const { __sentry_template_string__: e3, __sentry_template_values__: n3 } = t2;
    return i2.logentry = { message: e3, params: n3 }, i2;
  }
  return i2.message = t2, i2;
}
function Tr(e2, { isUnhandledRejection: t2 }) {
  const n2 = (function(e3, t3 = 40) {
    const n3 = Object.keys(Qe(e3));
    n3.sort();
    const r3 = n3[0];
    if (!r3) return "[object has no keys]";
    if (r3.length >= t3) return Ve(r3, t3);
    for (let e4 = n3.length; e4 > 0; e4--) {
      const r4 = n3.slice(0, e4).join(", ");
      if (!(r4.length > t3)) return e4 === n3.length ? r4 : Ve(r4, t3);
    }
    return "";
  })(e2), r2 = t2 ? "promise rejection" : "exception";
  if (Oe(e2)) return `Event \`ErrorEvent\` captured as ${r2} with message \`${e2.message}\``;
  if (Le(e2)) {
    return `Event \`${(function(e3) {
      try {
        const t3 = Object.getPrototypeOf(e3);
        return t3 ? t3.constructor.name : void 0;
      } catch (e4) {
      }
    })(e2)}\` (type=${e2.type}) captured as ${r2}`;
  }
  return `Object captured as ${r2} with keys: ${n2}`;
}
var Or = class extends jn {
  constructor(e2) {
    const t2 = { parentSpanIsAlwaysRootSpan: true, ...e2 };
    !(function(e3, t3, n2 = [t3], r2 = "npm") {
      const i2 = e3._metadata || {};
      i2.sdk || (i2.sdk = { name: `sentry.javascript.${t3}`, packages: n2.map((e4) => ({ name: `${r2}:@sentry/${e4}`, version: Z })), version: Z }), e3._metadata = i2;
    })(t2, "browser", ["browser"], hr.SENTRY_SDK_SOURCE || "npm"), super(t2), t2.sendClientReports && hr.document && hr.document.addEventListener("visibilitychange", () => {
      "hidden" === hr.document.visibilityState && this._flushOutcomes();
    });
  }
  eventFromException(e2, t2) {
    return (function(e3, t3, n2, r2) {
      const i2 = Er(e3, t3, n2 && n2.syntheticException || void 0, r2);
      return at(i2), i2.level = "error", n2 && n2.event_id && (i2.event_id = n2.event_id), lt(i2);
    })(this._options.stackParser, e2, t2, this._options.attachStacktrace);
  }
  eventFromMessage(e2, t2 = "info", n2) {
    return (function(e3, t3, n3 = "info", r2, i2) {
      const o2 = Cr(e3, t3, r2 && r2.syntheticException || void 0, i2);
      return o2.level = n3, r2 && r2.event_id && (o2.event_id = r2.event_id), lt(o2);
    })(this._options.stackParser, e2, t2, n2, this._options.attachStacktrace);
  }
  captureUserFeedback(e2) {
    if (!this._isEnabled()) return void (gr && ae.warn("SDK not enabled, will not capture user feedback."));
    const t2 = (function(e3, { metadata: t3, tunnel: n2, dsn: r2 }) {
      const i2 = { event_id: e3.event_id, sent_at: (/* @__PURE__ */ new Date()).toISOString(), ...t3 && t3.sdk && { sdk: { name: t3.sdk.name, version: t3.sdk.version } }, ...!!n2 && !!r2 && { dsn: Ht(r2) } }, o2 = /* @__PURE__ */ (function(e4) {
        return [{ type: "user_report" }, e4];
      })(e3);
      return en(i2, [o2]);
    })(e2, { metadata: this.getSdkMetadata(), dsn: this.getDsn(), tunnel: this.getOptions().tunnel });
    this.sendEnvelope(t2);
  }
  _prepareEvent(e2, t2, n2) {
    return e2.platform = e2.platform || "javascript", super._prepareEvent(e2, t2, n2);
  }
};
var Pr = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__;
var Ar = ee;
var xr;
var jr;
var Ir;
var Lr;
function Dr() {
  if (!Ar.document) return;
  const e2 = ye.bind(null, "dom"), t2 = Nr(e2, true);
  Ar.document.addEventListener("click", t2, false), Ar.document.addEventListener("keypress", t2, false), ["EventTarget", "Node"].forEach((t3) => {
    const n2 = Ar[t3], r2 = n2 && n2.prototype;
    r2 && r2.hasOwnProperty && r2.hasOwnProperty("addEventListener") && (ze(r2, "addEventListener", function(t4) {
      return function(n3, r3, i2) {
        if ("click" === n3 || "keypress" == n3) try {
          const r4 = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, o2 = r4[n3] = r4[n3] || { refCount: 0 };
          if (!o2.handler) {
            const r5 = Nr(e2);
            o2.handler = r5, t4.call(this, n3, r5, i2);
          }
          o2.refCount++;
        } catch (e3) {
        }
        return t4.call(this, n3, r3, i2);
      };
    }), ze(r2, "removeEventListener", function(e3) {
      return function(t4, n3, r3) {
        if ("click" === t4 || "keypress" == t4) try {
          const n4 = this.__sentry_instrumentation_handlers__ || {}, i2 = n4[t4];
          i2 && (i2.refCount--, i2.refCount <= 0 && (e3.call(this, t4, i2.handler, r3), i2.handler = void 0, delete n4[t4]), 0 === Object.keys(n4).length && delete this.__sentry_instrumentation_handlers__);
        } catch (e4) {
        }
        return e3.call(this, t4, n3, r3);
      };
    }));
  });
}
function Nr(e2, t2 = false) {
  return (n2) => {
    if (!n2 || n2._sentryCaptured) return;
    const r2 = (function(e3) {
      try {
        return e3.target;
      } catch (e4) {
        return null;
      }
    })(n2);
    if ((function(e3, t3) {
      return "keypress" === e3 && (!t3 || !t3.tagName || "INPUT" !== t3.tagName && "TEXTAREA" !== t3.tagName && !t3.isContentEditable);
    })(n2.type, r2)) return;
    We(n2, "_sentryCaptured", true), r2 && !r2._sentryId && We(r2, "_sentryId", nt());
    const i2 = "keypress" === n2.type ? "input" : n2.type;
    if (!(function(e3) {
      if (e3.type !== jr) return false;
      try {
        if (!e3.target || e3.target._sentryId !== Ir) return false;
      } catch (e4) {
      }
      return true;
    })(n2)) {
      e2({ event: n2, name: i2, global: t2 }), jr = n2.type, Ir = r2 ? r2._sentryId : void 0;
    }
    clearTimeout(xr), xr = Ar.setTimeout(() => {
      Ir = void 0, jr = void 0;
    }, 1e3);
  };
}
function Fr(e2) {
  const t2 = "history";
  ge(t2, e2), me(t2, Br);
}
function Br() {
  if (!(function() {
    const e3 = dr.chrome, t3 = e3 && e3.app && e3.app.runtime, n2 = "history" in dr && !!dr.history.pushState && !!dr.history.replaceState;
    return !t3 && n2;
  })()) return;
  const e2 = Ar.onpopstate;
  function t2(e3) {
    return function(...t3) {
      const n2 = t3.length > 2 ? t3[2] : void 0;
      if (n2) {
        const e4 = Lr, t4 = String(n2);
        Lr = t4;
        ye("history", { from: e4, to: t4 });
      }
      return e3.apply(this, t3);
    };
  }
  Ar.onpopstate = function(...t3) {
    const n2 = Ar.location.href, r2 = Lr;
    Lr = n2;
    if (ye("history", { from: r2, to: n2 }), e2) try {
      return e2.apply(this, t3);
    } catch (e3) {
    }
  }, ze(Ar.history, "pushState", t2), ze(Ar.history, "replaceState", t2);
}
var Rr = {};
function Ur(e2) {
  Rr[e2] = void 0;
}
var Vr = "__sentry_xhr_v3__";
function Jr() {
  if (!Ar.XMLHttpRequest) return;
  const e2 = XMLHttpRequest.prototype;
  e2.open = new Proxy(e2.open, { apply(e3, t2, n2) {
    const r2 = new Error(), i2 = 1e3 * tt(), o2 = Ae(n2[0]) ? n2[0].toUpperCase() : void 0, a2 = (function(e4) {
      if (Ae(e4)) return e4;
      try {
        return e4.toString();
      } catch (e5) {
      }
      return;
    })(n2[1]);
    if (!o2 || !a2) return e3.apply(t2, n2);
    t2[Vr] = { method: o2, url: a2, request_headers: {} }, "POST" === o2 && a2.match(/sentry_key/) && (t2.__sentry_own_request__ = true);
    const s2 = () => {
      const e4 = t2[Vr];
      if (e4 && 4 === t2.readyState) {
        try {
          e4.status_code = t2.status;
        } catch (e5) {
        }
        ye("xhr", { endTimestamp: 1e3 * tt(), startTimestamp: i2, xhr: t2, virtualError: r2 });
      }
    };
    return "onreadystatechange" in t2 && "function" == typeof t2.onreadystatechange ? t2.onreadystatechange = new Proxy(t2.onreadystatechange, { apply: (e4, t3, n3) => (s2(), e4.apply(t3, n3)) }) : t2.addEventListener("readystatechange", s2), t2.setRequestHeader = new Proxy(t2.setRequestHeader, { apply(e4, t3, n3) {
      const [r3, i3] = n3, o3 = t3[Vr];
      return o3 && Ae(r3) && Ae(i3) && (o3.request_headers[r3.toLowerCase()] = i3), e4.apply(t3, n3);
    } }), e3.apply(t2, n2);
  } }), e2.send = new Proxy(e2.send, { apply(e3, t2, n2) {
    const r2 = t2[Vr];
    if (!r2) return e3.apply(t2, n2);
    void 0 !== n2[0] && (r2.body = n2[0]);
    return ye("xhr", { startTimestamp: 1e3 * tt(), xhr: t2 }), e3.apply(t2, n2);
  } });
}
function $r(e2, t2 = (function(e3) {
  const t3 = Rr[e3];
  if (t3) return t3;
  let n2 = Ar[e3];
  if (ar(n2)) return Rr[e3] = n2.bind(Ar);
  const r2 = Ar.document;
  if (r2 && "function" == typeof r2.createElement) try {
    const t4 = r2.createElement("iframe");
    t4.hidden = true, r2.head.appendChild(t4);
    const i2 = t4.contentWindow;
    i2 && i2[e3] && (n2 = i2[e3]), r2.head.removeChild(t4);
  } catch (t4) {
    Pr && ae.warn(`Could not create sandbox iframe for ${e3} check, bailing to window.${e3}: `, t4);
  }
  return n2 ? Rr[e3] = n2.bind(Ar) : n2;
})("fetch")) {
  let n2 = 0, r2 = 0;
  return Fn(e2, function(i2) {
    const o2 = i2.body.length;
    n2 += o2, r2++;
    const a2 = { body: i2.body, method: "POST", referrerPolicy: "origin", headers: e2.headers, keepalive: n2 <= 6e4 && r2 < 15, ...e2.fetchOptions };
    if (!t2) return Ur("fetch"), ut("No fetch implementation available");
    try {
      return t2(e2.url, a2).then((e3) => (n2 -= o2, r2--, { statusCode: e3.status, headers: { "x-sentry-rate-limits": e3.headers.get("X-Sentry-Rate-Limits"), "retry-after": e3.headers.get("Retry-After") } }));
    } catch (e3) {
      return Ur("fetch"), n2 -= o2, r2--, ut(e3);
    }
  });
}
function qr(e2, t2, n2, r2) {
  const i2 = { filename: e2, function: "<anonymous>" === t2 ? se : t2, in_app: true };
  return void 0 !== n2 && (i2.lineno = n2), void 0 !== r2 && (i2.colno = r2), i2;
}
var zr = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;
var Wr = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
var Gr = /\((\S*)(?::(\d+))(?::(\d+))\)/;
var Hr = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
var Qr = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
var Yr = (function(...e2) {
  const t2 = e2.sort((e3, t3) => e3[0] - t3[0]).map((e3) => e3[1]);
  return (e3, n2 = 0, r2 = 0) => {
    const i2 = [], o2 = e3.split("\n");
    for (let e4 = n2; e4 < o2.length; e4++) {
      const n3 = o2[e4];
      if (n3.length > 1024) continue;
      const a2 = ce.test(n3) ? n3.replace(ce, "$1") : n3;
      if (!a2.match(/\S*Error: /)) {
        for (const e5 of t2) {
          const t3 = e5(a2);
          if (t3) {
            i2.push(t3);
            break;
          }
        }
        if (i2.length >= 50 + r2) break;
      }
    }
    return (function(e4) {
      if (!e4.length) return [];
      const t3 = Array.from(e4);
      /sentryWrapped/.test(ue(t3).function || "") && t3.pop();
      t3.reverse(), le.test(ue(t3).function || "") && (t3.pop(), le.test(ue(t3).function || "") && t3.pop());
      return t3.slice(0, 50).map((e5) => ({ ...e5, filename: e5.filename || ue(t3).filename, function: e5.function || se }));
    })(i2.slice(r2));
  };
})(...[[30, (e2) => {
  const t2 = zr.exec(e2);
  if (t2) {
    const [, e3, n3, r2] = t2;
    return qr(e3, se, +n3, +r2);
  }
  const n2 = Wr.exec(e2);
  if (n2) {
    if (n2[2] && 0 === n2[2].indexOf("eval")) {
      const e4 = Gr.exec(n2[2]);
      e4 && (n2[2] = e4[1], n2[3] = e4[2], n2[4] = e4[3]);
    }
    const [e3, t3] = Kr(n2[1] || se, n2[2]);
    return qr(t3, e3, n2[3] ? +n2[3] : void 0, n2[4] ? +n2[4] : void 0);
  }
}], [50, (e2) => {
  const t2 = Hr.exec(e2);
  if (t2) {
    if (t2[3] && t2[3].indexOf(" > eval") > -1) {
      const e4 = Qr.exec(t2[3]);
      e4 && (t2[1] = t2[1] || "eval", t2[3] = e4[1], t2[4] = e4[2], t2[5] = "");
    }
    let e3 = t2[3], n2 = t2[1] || se;
    return [n2, e3] = Kr(n2, e3), qr(e3, n2, t2[4] ? +t2[4] : void 0, t2[5] ? +t2[5] : void 0);
  }
}]]);
var Kr = (e2, t2) => {
  const n2 = -1 !== e2.indexOf("safari-extension"), r2 = -1 !== e2.indexOf("safari-web-extension");
  return n2 || r2 ? [-1 !== e2.indexOf("@") ? e2.split("@")[0] : se, n2 ? `safari-extension:${t2}` : `safari-web-extension:${t2}`] : [e2, t2];
};
var Xr = 1024;
var Zr = (e2 = {}) => {
  const t2 = { console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true, ...e2 };
  return { name: "Breadcrumbs", setup(e3) {
    var n2;
    t2.console && (function(e4) {
      const t3 = "console";
      ge(t3, e4), me(t3, Xn);
    })(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (At() !== e4) return;
        const n3 = { category: "console", data: { arguments: t3.args, logger: "console" }, level: Zn(t3.level), message: Je(t3.args, " ") };
        if ("assert" === t3.level) {
          if (false !== t3.args[0]) return;
          n3.message = `Assertion failed: ${Je(t3.args.slice(1), " ") || "console.assert"}`, n3.data.arguments = t3.args.slice(1);
        }
        Un(n3, { input: t3.args, level: t3.level });
      };
    })(e3)), t2.dom && (n2 = /* @__PURE__ */ (function(e4, t3) {
      return function(n3) {
        if (At() !== e4) return;
        let r2, i2, o2 = "object" == typeof t3 ? t3.serializeAttribute : void 0, a2 = "object" == typeof t3 && "number" == typeof t3.maxStringLength ? t3.maxStringLength : void 0;
        a2 && a2 > Xr && (gr && ae.warn(`\`dom.maxStringLength\` cannot exceed 1024, but a value of ${a2} was configured. Sentry will use 1024 instead.`), a2 = Xr), "string" == typeof o2 && (o2 = [o2]);
        try {
          const e5 = n3.event, t4 = (function(e6) {
            return !!e6 && !!e6.target;
          })(e5) ? e5.target : e5;
          r2 = Re(t4, { keyAttrs: o2, maxStringLength: a2 }), i2 = (function(e6) {
            if (!Be.HTMLElement) return null;
            let t5 = e6;
            for (let e7 = 0; e7 < 5; e7++) {
              if (!t5) return null;
              if (t5 instanceof HTMLElement) {
                if (t5.dataset.sentryComponent) return t5.dataset.sentryComponent;
                if (t5.dataset.sentryElement) return t5.dataset.sentryElement;
              }
              t5 = t5.parentNode;
            }
            return null;
          })(t4);
        } catch (e5) {
          r2 = "<unknown>";
        }
        if (0 === r2.length) return;
        const s2 = { category: `ui.${n3.name}`, message: r2 };
        i2 && (s2.data = { "ui.component_name": i2 }), Un(s2, { event: n3.event, name: n3.name, global: n3.global });
      };
    })(e3, t2.dom), ge("dom", n2), me("dom", Dr)), t2.xhr && (function(e4) {
      ge("xhr", e4), me("xhr", Jr);
    })(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (At() !== e4) return;
        const { startTimestamp: n3, endTimestamp: r2 } = t3, i2 = t3.xhr[Vr];
        if (!n3 || !r2 || !i2) return;
        const { method: o2, url: a2, status_code: s2, body: c2 } = i2, l2 = { method: o2, url: a2, status_code: s2 }, u2 = { xhr: t3.xhr, input: c2, startTimestamp: n3, endTimestamp: r2 };
        Un({ category: "xhr", data: l2, type: "http", level: ir(s2) }, u2);
      };
    })(e3)), t2.fetch && cr(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (At() !== e4) return;
        const { startTimestamp: n3, endTimestamp: r2 } = t3;
        if (r2 && (!t3.fetchData.url.match(/sentry_key/) || "POST" !== t3.fetchData.method)) if (t3.error) {
          Un({ category: "fetch", data: t3.fetchData, level: "error", type: "http" }, { data: t3.error, input: t3.args, startTimestamp: n3, endTimestamp: r2 });
        } else {
          const e5 = t3.response, i2 = { ...t3.fetchData, status_code: e5 && e5.status }, o2 = { input: t3.args, response: e5, startTimestamp: n3, endTimestamp: r2 };
          Un({ category: "fetch", data: i2, type: "http", level: ir(i2.status_code) }, o2);
        }
      };
    })(e3)), t2.history && Fr(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (At() !== e4) return;
        let n3 = t3.from, r2 = t3.to;
        const i2 = Kn(hr.location.href);
        let o2 = n3 ? Kn(n3) : void 0;
        const a2 = Kn(r2);
        o2 && o2.path || (o2 = i2), i2.protocol === a2.protocol && i2.host === a2.host && (r2 = a2.relative), i2.protocol === o2.protocol && i2.host === o2.host && (n3 = o2.relative), Un({ category: "navigation", data: { from: n3, to: r2 } });
      };
    })(e3)), t2.sentry && e3.on("beforeSendEvent", /* @__PURE__ */ (function(e4) {
      return function(t3) {
        At() === e4 && Un({ category: "sentry." + ("transaction" === t3.type ? "transaction" : "event"), event_id: t3.event_id, level: t3.level, message: it(t3) }, { event: t3 });
      };
    })(e3));
  } };
};
var ei = ["EventTarget", "Window", "Node", "ApplicationCache", "AudioTrackList", "BroadcastChannel", "ChannelMergerNode", "CryptoOperation", "EventSource", "FileReader", "HTMLUnknownElement", "IDBDatabase", "IDBRequest", "IDBTransaction", "KeyOperation", "MediaController", "MessagePort", "ModalWindow", "Notification", "SVGElementInstance", "Screen", "SharedWorker", "TextTrack", "TextTrackCue", "TextTrackList", "WebSocket", "WebSocketWorker", "Worker", "XMLHttpRequest", "XMLHttpRequestEventTarget", "XMLHttpRequestUpload"];
var ti = (e2 = {}) => {
  const t2 = { XMLHttpRequest: true, eventTarget: true, requestAnimationFrame: true, setInterval: true, setTimeout: true, ...e2 };
  return { name: "BrowserApiErrors", setupOnce() {
    t2.setTimeout && ze(hr, "setTimeout", ni), t2.setInterval && ze(hr, "setInterval", ni), t2.requestAnimationFrame && ze(hr, "requestAnimationFrame", ri), t2.XMLHttpRequest && "XMLHttpRequest" in hr && ze(XMLHttpRequest.prototype, "send", ii);
    const e3 = t2.eventTarget;
    if (e3) {
      (Array.isArray(e3) ? e3 : ei).forEach(oi);
    }
  } };
};
function ni(e2) {
  return function(...t2) {
    const n2 = t2[0];
    return t2[0] = vr(n2, { mechanism: { data: { function: he(e2) }, handled: false, type: "instrument" } }), e2.apply(this, t2);
  };
}
function ri(e2) {
  return function(t2) {
    return e2.apply(this, [vr(t2, { mechanism: { data: { function: "requestAnimationFrame", handler: he(e2) }, handled: false, type: "instrument" } })]);
  };
}
function ii(e2) {
  return function(...t2) {
    const n2 = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((e3) => {
      e3 in n2 && "function" == typeof n2[e3] && ze(n2, e3, function(t3) {
        const n3 = { mechanism: { data: { function: e3, handler: he(t3) }, handled: false, type: "instrument" } }, r2 = He(t3);
        return r2 && (n3.mechanism.data.handler = he(r2)), vr(t3, n3);
      });
    }), e2.apply(this, t2);
  };
}
function oi(e2) {
  const t2 = hr[e2], n2 = t2 && t2.prototype;
  n2 && n2.hasOwnProperty && n2.hasOwnProperty("addEventListener") && (ze(n2, "addEventListener", function(t3) {
    return function(n3, r2, i2) {
      try {
        "function" == typeof r2.handleEvent && (r2.handleEvent = vr(r2.handleEvent, { mechanism: { data: { function: "handleEvent", handler: he(r2), target: e2 }, handled: false, type: "instrument" } }));
      } catch (e3) {
      }
      return t3.apply(this, [n3, vr(r2, { mechanism: { data: { function: "addEventListener", handler: he(r2), target: e2 }, handled: false, type: "instrument" } }), i2]);
    };
  }), ze(n2, "removeEventListener", function(e3) {
    return function(t3, n3, r2) {
      try {
        const i2 = n3.__sentry_wrapped__;
        i2 && e3.call(this, t3, i2, r2);
      } catch (e4) {
      }
      return e3.call(this, t3, n3, r2);
    };
  }));
}
var ai = () => ({ name: "BrowserSession", setupOnce() {
  void 0 !== hr.document ? (kn({ ignoreDuration: true }), En(), Fr(({ from: e2, to: t2 }) => {
    void 0 !== e2 && e2 !== t2 && (kn({ ignoreDuration: true }), En());
  })) : gr && ae.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
} });
var si = (e2 = {}) => {
  const t2 = { onerror: true, onunhandledrejection: true, ...e2 };
  return { name: "GlobalHandlers", setupOnce() {
    Error.stackTraceLimit = 50;
  }, setup(e3) {
    t2.onerror && (!(function(e4) {
      !(function(e5) {
        const t3 = "error";
        ge(t3, e5), me(t3, _e);
      })((t3) => {
        const { stackParser: n2, attachStacktrace: r2 } = li();
        if (At() !== e4 || fr()) return;
        const { msg: i2, url: o2, line: a2, column: s2, error: c2 } = t3, l2 = (function(e5, t4, n3, r3) {
          const i3 = e5.exception = e5.exception || {}, o3 = i3.values = i3.values || [], a3 = o3[0] = o3[0] || {}, s3 = a3.stacktrace = a3.stacktrace || {}, c3 = s3.frames = s3.frames || [], l3 = r3, u2 = n3, d2 = Ae(t4) && t4.length > 0 ? t4 : (function() {
            try {
              return Be.document.location.href;
            } catch (e6) {
              return "";
            }
          })();
          0 === c3.length && c3.push({ colno: l3, filename: d2, function: se, in_app: true, lineno: u2 });
          return e5;
        })(Er(n2, c2 || i2, void 0, r2, false), o2, a2, s2);
        l2.level = "error", wn(l2, { originalException: c2, mechanism: { handled: false, type: "onerror" } });
      });
    })(e3), ci("onerror")), t2.onunhandledrejection && (!(function(e4) {
      !(function(e5) {
        const t3 = "unhandledrejection";
        ge(t3, e5), me(t3, ke);
      })((t3) => {
        const { stackParser: n2, attachStacktrace: r2 } = li();
        if (At() !== e4 || fr()) return;
        const i2 = (function(e5) {
          if (je(e5)) return e5;
          try {
            if ("reason" in e5) return e5.reason;
            if ("detail" in e5 && "reason" in e5.detail) return e5.detail.reason;
          } catch (e6) {
          }
          return e5;
        })(t3), o2 = je(i2) ? { exception: { values: [{ type: "UnhandledRejection", value: `Non-Error promise rejection captured with value: ${String(i2)}` }] } } : Er(n2, i2, void 0, r2, true);
        o2.level = "error", wn(o2, { originalException: i2, mechanism: { handled: false, type: "onunhandledrejection" } });
      });
    })(e3), ci("onunhandledrejection"));
  } };
};
function ci(e2) {
  gr && ae.log(`Global Handler attached: ${e2}`);
}
function li() {
  const e2 = At();
  return e2 && e2.getOptions() || { stackParser: () => [], attachStacktrace: false };
}
var ui = () => ({ name: "HttpContext", preprocessEvent(e2) {
  if (!hr.navigator && !hr.location && !hr.document) return;
  const t2 = e2.request && e2.request.url || hr.location && hr.location.href, { referrer: n2 } = hr.document || {}, { userAgent: r2 } = hr.navigator || {}, i2 = { ...e2.request && e2.request.headers, ...n2 && { Referer: n2 }, ...r2 && { "User-Agent": r2 } }, o2 = { ...e2.request, ...t2 && { url: t2 }, headers: i2 };
  e2.request = o2;
} });
var di = (e2 = {}) => {
  const t2 = e2.limit || 5, n2 = e2.key || "cause";
  return { name: "LinkedErrors", preprocessEvent(e3, r2, i2) {
    const o2 = i2.getOptions();
    Gn(mr, o2.stackParser, o2.maxValueLength, n2, t2, e3, r2);
  } };
};
var hi = "new";
var pi = "loading";
var fi = "loaded";
var vi = "joining-meeting";
var gi = "joined-meeting";
var mi = "left-meeting";
var yi = "error";
var Mi = "playable";
var Ei = "unknown";
var Ci = "full";
var Pi = "base";
var Ni = "no-room";
var Bi = "end-of-life";
var Ui = "connection-error";
var Qi = "iframe-ready-for-launch-config";
var Yi = "iframe-launch-config";
var Ki = "theme-updated";
var Xi = "loading";
var Zi = "load-attempt-failed";
var eo = "loaded";
var to = "started-camera";
var no = "camera-error";
var ro = "joining-meeting";
var io = "joined-meeting";
var oo = "left-meeting";
var ao = "participant-joined";
var so = "participant-updated";
var co = "participant-left";
var lo = "participant-counts-updated";
var uo = "access-state-updated";
var ho = "meeting-session-summary-updated";
var po = "meeting-session-state-updated";
var vo = "waiting-participant-added";
var go = "waiting-participant-updated";
var mo = "waiting-participant-removed";
var yo = "track-started";
var bo = "track-stopped";
var _o = "transcription-started";
var wo = "transcription-stopped";
var ko = "transcription-error";
var So = "recording-started";
var Mo = "recording-stopped";
var Eo = "recording-stats";
var Co = "recording-error";
var To = "recording-upload-completed";
var Oo = "recording-data";
var Po = "app-message";
var Ao = "transcription-message";
var xo = "remote-media-player-started";
var jo = "remote-media-player-updated";
var Io = "remote-media-player-stopped";
var Lo = "local-screen-share-started";
var Do = "local-screen-share-stopped";
var No = "local-screen-share-canceled";
var Fo = "active-speaker-change";
var Bo = "active-speaker-mode-change";
var Ro = "network-quality-change";
var Uo = "network-connection";
var Vo = "cpu-load-change";
var Jo = "face-counts-updated";
var $o = "fullscreen";
var qo = "exited-fullscreen";
var zo = "live-streaming-started";
var Wo = "live-streaming-updated";
var Go = "live-streaming-stopped";
var Ho = "live-streaming-error";
var Qo = "lang-updated";
var Yo = "receive-settings-updated";
var Ko = "input-settings-updated";
var Xo = "nonfatal-error";
var Zo = "error";
var ea = 4096;
var ta = 102400;
var na = "iframe-call-message";
var ra = "local-screen-start";
var ia = "daily-method-update-live-streaming-endpoints";
var oa = "transmit-log";
var aa = "daily-custom-track";
var sa = { NONE: "none", BGBLUR: "background-blur", BGIMAGE: "background-image", FACE_DETECTION: "face-detection" };
var ca = { NONE: "none", NOISE_CANCELLATION: "noise-cancellation" };
var la = { PLAY: "play", PAUSE: "pause" };
var ua = "daily";
var da = "signalwire";
var ha = ["jpg", "png", "jpeg"];
var pa = "add-endpoints";
var fa = "remove-endpoints";
var va = "sip-call-transfer";
function ga() {
  return !ma() && "undefined" != typeof window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : "";
}
function ma() {
  return "undefined" != typeof navigator && navigator.product && "ReactNative" === navigator.product;
}
function ya() {
  return navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
}
function ba() {
  return !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) && ((function(e2, t2) {
    if (!e2 || !t2) return true;
    switch (e2) {
      case "Chrome":
        return t2.major >= 75;
      case "Safari":
        return RTCRtpTransceiver.prototype.hasOwnProperty("currentDirection") && !(13 === t2.major && 0 === t2.minor && 0 === t2.point);
      case "Firefox":
        return t2.major >= 67;
    }
    return true;
  })(Aa(), xa()) || ma());
}
function _a() {
  if (ma()) return false;
  if (!document) return false;
  var e2 = document.createElement("iframe");
  return !!e2.requestFullscreen || !!e2.webkitRequestFullscreen;
}
var wa = "none";
var ka = "software";
var Sa = "hardware";
var Ma = (function() {
  try {
    var e2, t2 = document.createElement("canvas"), n2 = false;
    (e2 = t2.getContext("webgl2", { failIfMajorPerformanceCaveat: true })) || (n2 = true, e2 = t2.getContext("webgl2"));
    var r2 = null != e2;
    return t2.remove(), r2 ? n2 ? ka : Sa : wa;
  } catch (e3) {
    return wa;
  }
})();
function Ea() {
  var e2 = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
  return !ma() && (Ma !== wa && (e2 ? (function() {
    if (Pa()) return false;
    return ["Chrome", "Firefox"].includes(Aa());
  })() : (function() {
    if (Pa()) return false;
    var e3 = Aa();
    if ("Safari" === e3) {
      var t2 = Da();
      if (t2.major < 15 || 15 === t2.major && t2.minor < 4) return false;
    }
    if ("Chrome" === e3) {
      return ja().major >= 77;
    }
    if ("Firefox" === e3) {
      return Na().major >= 97;
    }
    return ["Chrome", "Firefox", "Safari"].includes(e3);
  })()));
}
function Ca() {
  if (ma()) return false;
  if (Oa()) return false;
  if ("undefined" == typeof AudioWorkletNode) return false;
  switch (Aa()) {
    case "Chrome":
    case "Firefox":
      return true;
    case "Safari":
      var e2 = xa();
      return e2.major > 17 || 17 === e2.major && e2.minor >= 4;
  }
  return false;
}
function Ta() {
  return ya() && "undefined" != typeof MediaStreamTrack && !(function() {
    var e2, t2 = Aa();
    if (!ga()) return true;
    switch (t2) {
      case "Chrome":
        return (e2 = ja()).major && e2.major > 0 && e2.major < 75;
      case "Firefox":
        return (e2 = Na()).major < 91;
      case "Safari":
        return (e2 = Da()).major < 13 || 13 === e2.major && e2.minor < 1;
      default:
        return true;
    }
  })();
}
function Oa() {
  return ga().match(/Linux; Android/);
}
function Pa() {
  var e2, t2 = ga(), n2 = t2.match(/Mac/) && (!ma() && "undefined" != typeof window && null !== (e2 = window) && void 0 !== e2 && null !== (e2 = e2.navigator) && void 0 !== e2 && e2.maxTouchPoints ? window.navigator.maxTouchPoints : 0) >= 5;
  return !!(t2.match(/Mobi/) || t2.match(/Android/) || n2) || (!!ga().match(/DailyAnd\//) || void 0);
}
function Aa() {
  if ("undefined" != typeof window) {
    var e2 = ga();
    return Ia() ? "Safari" : e2.indexOf("Edge") > -1 ? "Edge" : e2.match(/Chrome\//) ? "Chrome" : e2.indexOf("Safari") > -1 || La() ? "Safari" : e2.indexOf("Firefox") > -1 ? "Firefox" : e2.indexOf("MSIE") > -1 || e2.indexOf(".NET") > -1 ? "IE" : "Unknown Browser";
  }
}
function xa() {
  switch (Aa()) {
    case "Chrome":
      return ja();
    case "Safari":
      return Da();
    case "Firefox":
      return Na();
    case "Edge":
      return (function() {
        var e2 = 0, t2 = 0;
        if ("undefined" != typeof window) {
          var n2 = ga().match(/Edge\/(\d+).(\d+)/);
          if (n2) try {
            e2 = parseInt(n2[1]), t2 = parseInt(n2[2]);
          } catch (e3) {
          }
        }
        return { major: e2, minor: t2 };
      })();
  }
}
function ja() {
  var e2 = 0, t2 = 0, n2 = 0, r2 = 0, i2 = false;
  if ("undefined" != typeof window) {
    var o2 = ga(), a2 = o2.match(/Chrome\/(\d+).(\d+).(\d+).(\d+)/);
    if (a2) try {
      e2 = parseInt(a2[1]), t2 = parseInt(a2[2]), n2 = parseInt(a2[3]), r2 = parseInt(a2[4]), i2 = o2.indexOf("OPR/") > -1;
    } catch (e3) {
    }
  }
  return { major: e2, minor: t2, build: n2, patch: r2, opera: i2 };
}
function Ia() {
  return !!ga().match(/\((iPad|iPhone|iPod)/i) && ya();
}
function La() {
  return ga().indexOf("AppleWebKit/605.1.15") > -1;
}
function Da() {
  var e2 = 0, t2 = 0, n2 = 0;
  if ("undefined" != typeof window) {
    var r2 = ga().match(/Version\/(\d+).(\d+)(.(\d+))?/);
    if (r2) try {
      e2 = parseInt(r2[1]), t2 = parseInt(r2[2]), n2 = parseInt(r2[4]);
    } catch (e3) {
    }
    else (Ia() || La()) && (e2 = 14, t2 = 0, n2 = 3);
  }
  return { major: e2, minor: t2, point: n2 };
}
function Na() {
  var e2 = 0, t2 = 0;
  if ("undefined" != typeof window) {
    var n2 = ga().match(/Firefox\/(\d+).(\d+)/);
    if (n2) try {
      e2 = parseInt(n2[1]), t2 = parseInt(n2[2]);
    } catch (e3) {
    }
  }
  return { major: e2, minor: t2 };
}
var Fa = (function() {
  return i(function t2() {
    e(this, t2);
  }, [{ key: "addListenerForMessagesFromCallMachine", value: function(e2, t2, n2) {
    R();
  } }, { key: "addListenerForMessagesFromDailyJs", value: function(e2, t2, n2) {
    R();
  } }, { key: "sendMessageToCallMachine", value: function(e2, t2, n2, r2) {
    R();
  } }, { key: "sendMessageToDailyJs", value: function(e2, t2) {
    R();
  } }, { key: "removeListener", value: function(e2) {
    R();
  } }]);
})();
function Ba(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter(function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    })), n2.push.apply(n2, r2);
  }
  return n2;
}
function Ra(e2) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n2 = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? Ba(Object(n2), true).forEach(function(t3) {
      l(e2, t3, n2[t3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : Ba(Object(n2)).forEach(function(t3) {
      Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
    });
  }
  return e2;
}
function Ua() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (e3) {
  }
  return (Ua = function() {
    return !!e2;
  })();
}
var Va = (function() {
  function t2() {
    var n2, r2, i2, s2;
    return e(this, t2), r2 = this, i2 = a(i2 = t2), (n2 = o(r2, Ua() ? Reflect.construct(i2, s2 || [], a(r2).constructor) : i2.apply(r2, s2)))._wrappedListeners = {}, n2._messageCallbacks = {}, n2;
  }
  return c(t2, Fa), i(t2, [{ key: "addListenerForMessagesFromCallMachine", value: function(e2, t3, n2) {
    var r2 = this, i2 = function(i3) {
      if (i3.data && "iframe-call-message" === i3.data.what && (!i3.data.callClientId || i3.data.callClientId === t3) && (!i3.data.from || "module" !== i3.data.from)) {
        var o2 = Ra({}, i3.data);
        if (delete o2.from, o2.callbackStamp && r2._messageCallbacks[o2.callbackStamp]) {
          var a2 = o2.callbackStamp;
          r2._messageCallbacks[a2].call(n2, o2), delete r2._messageCallbacks[a2];
        }
        delete o2.what, delete o2.callbackStamp, e2.call(n2, o2);
      }
    };
    this._wrappedListeners[e2] = i2, window.addEventListener("message", i2);
  } }, { key: "addListenerForMessagesFromDailyJs", value: function(e2, t3, n2) {
    var r2 = function(r3) {
      var i2;
      if (!(!r3.data || r3.data.what !== na || !r3.data.action || r3.data.from && "module" !== r3.data.from || r3.data.callClientId && t3 && r3.data.callClientId !== t3 || null != r3 && null !== (i2 = r3.data) && void 0 !== i2 && i2.callFrameId)) {
        var o2 = r3.data;
        e2.call(n2, o2);
      }
    };
    this._wrappedListeners[e2] = r2, window.addEventListener("message", r2);
  } }, { key: "sendMessageToCallMachine", value: function(e2, t3, n2, r2) {
    if (!n2) throw new Error("undefined callClientId. Are you trying to use a DailyCall instance previously destroyed?");
    var i2 = Ra({}, e2);
    if (i2.what = na, i2.from = "module", i2.callClientId = n2, t3) {
      var o2 = B();
      this._messageCallbacks[o2] = t3, i2.callbackStamp = o2;
    }
    var a2 = r2 ? r2.contentWindow : window, s2 = this._callMachineTargetOrigin(r2);
    s2 && a2.postMessage(i2, s2);
  } }, { key: "sendMessageToDailyJs", value: function(e2, t3) {
    e2.what = na, e2.callClientId = t3, e2.from = "embedded", window.postMessage(e2, this._targetOriginFromWindowLocation());
  } }, { key: "removeListener", value: function(e2) {
    var t3 = this._wrappedListeners[e2];
    t3 && (window.removeEventListener("message", t3), delete this._wrappedListeners[e2]);
  } }, { key: "forwardPackagedMessageToCallMachine", value: function(e2, t3, n2) {
    var r2 = Ra({}, e2);
    r2.callClientId = n2;
    var i2 = t3 ? t3.contentWindow : window, o2 = this._callMachineTargetOrigin(t3);
    o2 && i2.postMessage(r2, o2);
  } }, { key: "addListenerForPackagedMessagesFromCallMachine", value: function(e2, t3) {
    var n2 = function(n3) {
      if (n3.data && "iframe-call-message" === n3.data.what && (!n3.data.callClientId || n3.data.callClientId === t3) && (!n3.data.from || "module" !== n3.data.from)) {
        var r2 = n3.data;
        e2(r2);
      }
    };
    return this._wrappedListeners[e2] = n2, window.addEventListener("message", n2), e2;
  } }, { key: "removeListenerForPackagedMessagesFromCallMachine", value: function(e2) {
    var t3 = this._wrappedListeners[e2];
    t3 && (window.removeEventListener("message", t3), delete this._wrappedListeners[e2]);
  } }, { key: "_callMachineTargetOrigin", value: function(e2) {
    return e2 ? e2.src ? new URL(e2.src).origin : void 0 : this._targetOriginFromWindowLocation();
  } }, { key: "_targetOriginFromWindowLocation", value: function() {
    return "file:" === window.location.protocol ? "*" : window.location.origin;
  } }]);
})();
function Ja(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter(function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    })), n2.push.apply(n2, r2);
  }
  return n2;
}
function $a() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (e3) {
  }
  return ($a = function() {
    return !!e2;
  })();
}
var qa = (function() {
  function t2() {
    var n2, r2, i2, s2;
    return e(this, t2), r2 = this, i2 = a(i2 = t2), n2 = o(r2, $a() ? Reflect.construct(i2, s2 || [], a(r2).constructor) : i2.apply(r2, s2)), global.callMachineToDailyJsEmitter = global.callMachineToDailyJsEmitter || new b.EventEmitter(), global.dailyJsToCallMachineEmitter = global.dailyJsToCallMachineEmitter || new b.EventEmitter(), n2._wrappedListeners = {}, n2._messageCallbacks = {}, n2;
  }
  return c(t2, Fa), i(t2, [{ key: "addListenerForMessagesFromCallMachine", value: function(e2, t3, n2) {
    this._addListener(e2, global.callMachineToDailyJsEmitter, t3, n2, "received call machine message");
  } }, { key: "addListenerForMessagesFromDailyJs", value: function(e2, t3, n2) {
    this._addListener(e2, global.dailyJsToCallMachineEmitter, t3, n2, "received daily-js message");
  } }, { key: "sendMessageToCallMachine", value: function(e2, t3, n2) {
    this._sendMessage(e2, global.dailyJsToCallMachineEmitter, n2, t3, "sending message to call machine");
  } }, { key: "sendMessageToDailyJs", value: function(e2, t3) {
    this._sendMessage(e2, global.callMachineToDailyJsEmitter, t3, null, "sending message to daily-js");
  } }, { key: "removeListener", value: function(e2) {
    var t3 = this._wrappedListeners[e2];
    t3 && (global.callMachineToDailyJsEmitter.removeListener("message", t3), global.dailyJsToCallMachineEmitter.removeListener("message", t3), delete this._wrappedListeners[e2]);
  } }, { key: "_addListener", value: function(e2, t3, n2, r2, i2) {
    var o2 = this, a2 = function(t4) {
      if (t4.callClientId === n2) {
        if (t4.callbackStamp && o2._messageCallbacks[t4.callbackStamp]) {
          var i3 = t4.callbackStamp;
          o2._messageCallbacks[i3].call(r2, t4), delete o2._messageCallbacks[i3];
        }
        e2.call(r2, t4);
      }
    };
    this._wrappedListeners[e2] = a2, t3.addListener("message", a2);
  } }, { key: "_sendMessage", value: function(e2, t3, n2, r2, i2) {
    var o2 = (function(e3) {
      for (var t4 = 1; t4 < arguments.length; t4++) {
        var n3 = null != arguments[t4] ? arguments[t4] : {};
        t4 % 2 ? Ja(Object(n3), true).forEach(function(t5) {
          l(e3, t5, n3[t5]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(n3)) : Ja(Object(n3)).forEach(function(t5) {
          Object.defineProperty(e3, t5, Object.getOwnPropertyDescriptor(n3, t5));
        });
      }
      return e3;
    })({}, e2);
    if (o2.callClientId = n2, r2) {
      var a2 = B();
      this._messageCallbacks[a2] = r2, o2.callbackStamp = a2;
    }
    t3.emit("message", o2);
  } }]);
})();
var za = "replace";
var Wa = "shallow-merge";
var Ga = [za, Wa];
var Ha = (function() {
  function n2() {
    var t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = t2.data, i2 = t2.mergeStrategy, o2 = void 0 === i2 ? za : i2;
    e(this, n2), n2._validateMergeStrategy(o2), n2._validateData(r2, o2), this.mergeStrategy = o2, this.data = r2;
  }
  return i(n2, [{ key: "isNoOp", value: function() {
    return n2.isNoOpUpdate(this.data, this.mergeStrategy);
  } }], [{ key: "isNoOpUpdate", value: function(e2, t2) {
    return 0 === Object.keys(e2).length && t2 === Wa;
  } }, { key: "_validateMergeStrategy", value: function(e2) {
    if (!Ga.includes(e2)) throw Error("Unrecognized mergeStrategy provided. Options are: [".concat(Ga, "]"));
  } }, { key: "_validateData", value: function(e2, n3) {
    if (!(function(e3) {
      if (null == e3 || "object" !== t(e3)) return false;
      var n4 = Object.getPrototypeOf(e3);
      return null == n4 || n4 === Object.prototype;
    })(e2)) throw Error("Meeting session data must be a plain (map-like) object");
    var r2;
    try {
      if (r2 = JSON.stringify(e2), n3 === za) {
        var i2 = JSON.parse(r2);
        S(i2, e2) || console.warn("The meeting session data provided will be modified when serialized.", i2, e2);
      } else if (n3 === Wa) {
        for (var o2 in e2) if (Object.hasOwnProperty.call(e2, o2) && void 0 !== e2[o2]) {
          var a2 = JSON.parse(JSON.stringify(e2[o2]));
          S(e2[o2], a2) || console.warn("At least one key in the meeting session data provided will be modified when serialized.", a2, e2[o2]);
        }
      }
    } catch (e3) {
      throw Error("Meeting session data must be serializable to JSON: ".concat(e3));
    }
    if (r2.length > ta) throw Error("Meeting session data is too large (".concat(r2.length, " characters). Maximum size suppported is ").concat(ta, "."));
  } }]);
})();
function Qa() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (e3) {
  }
  return (Qa = function() {
    return !!e2;
  })();
}
function Ya(e2) {
  var t2 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
  return Ya = function(e3) {
    if (null === e3 || !(function(e4) {
      try {
        return -1 !== Function.toString.call(e4).indexOf("[native code]");
      } catch (t3) {
        return "function" == typeof e4;
      }
    })(e3)) return e3;
    if ("function" != typeof e3) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== t2) {
      if (t2.has(e3)) return t2.get(e3);
      t2.set(e3, n2);
    }
    function n2() {
      return (function(e4, t3, n3) {
        if (Qa()) return Reflect.construct.apply(null, arguments);
        var r2 = [null];
        r2.push.apply(r2, t3);
        var i2 = new (e4.bind.apply(e4, r2))();
        return n3 && s(i2, n3.prototype), i2;
      })(e3, arguments, a(this).constructor);
    }
    return n2.prototype = Object.create(e3.prototype, { constructor: { value: n2, enumerable: false, writable: true, configurable: true } }), s(n2, e3);
  }, Ya(e2);
}
function Ka() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (e3) {
  }
  return (Ka = function() {
    return !!e2;
  })();
}
function Xa(e2) {
  var t2, n2 = null === (t2 = window._daily) || void 0 === t2 ? void 0 : t2.pendings;
  if (n2) {
    var r2 = n2.indexOf(e2);
    -1 !== r2 && n2.splice(r2, 1);
  }
}
var Za = (function() {
  return i(function t2(n2) {
    e(this, t2), this._currentLoad = null, this._callClientId = n2, this._publicPath = null;
  }, [{ key: "load", value: function() {
    var e2, t2 = this, n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = arguments.length > 1 ? arguments[1] : void 0, i2 = arguments.length > 2 ? arguments[2] : void 0;
    if (this.loaded) return window._daily.instances[this._callClientId].callMachine.reset(), window._daily.instances[this._callClientId].publicPath = this._publicPath, void r2(true);
    e2 = this._callClientId, window._daily.pendings.push(e2), this._currentLoad && this._currentLoad.cancel(), this._currentLoad = new es(n2, function(e3) {
      var n3 = e3.substring(0, e3.lastIndexOf("/"));
      n3.length && "/" !== n3.slice(-1) && (n3 += "/"), t2._publicPath = n3, window._daily.instances[t2._callClientId].publicPath = n3, $(q(e3)), r2(false);
    }, function(e3, n3) {
      n3 || Xa(t2._callClientId), i2(e3, n3);
    }), this._currentLoad.start();
  } }, { key: "cancel", value: function() {
    this._currentLoad && this._currentLoad.cancel(), Xa(this._callClientId);
  } }, { key: "loaded", get: function() {
    return this._currentLoad && this._currentLoad.succeeded;
  } }]);
})();
var es = (function() {
  return i(function t2() {
    var n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = arguments.length > 1 ? arguments[1] : void 0, i2 = arguments.length > 2 ? arguments[2] : void 0;
    e(this, t2), this._dailyConfig = n2, this._successCallback = r2, this._failureCallback = i2, this._urls = (function(e2) {
      var t3;
      if (H(e2)) return [G(e2)];
      var n3 = null !== (t3 = null != V ? V : Q()) && void 0 !== t3 ? t3 : U[0];
      return (n3 === U[0] ? U : [n3].concat(F(U.filter(function(e3) {
        return e3 !== n3;
      })))).map(function(t4) {
        return G(e2, t4);
      });
    })(n2), this._networkTimeoutMs = ns, this._passesRemaining = 3, this._urlIndex = 0, this._currentAttempt = null;
  }, [{ key: "start", value: function() {
    this._currentAttempt || this._startAttempt();
  } }, { key: "_startAttempt", value: function() {
    this._currentAttempt = new rs(this._dailyConfig, this._urls[this._urlIndex], this._networkTimeoutMs, this._successCallback, this._retryOrFailureCallback.bind(this)), this._currentAttempt.start();
  } }, { key: "_retryOrFailureCallback", value: function(e2) {
    var t2 = this;
    if (!this._currentAttempt.cancelled) {
      this._urlIndex++;
      var n2 = this._urlIndex < this._urls.length, r2 = this._passesRemaining > 1, i2 = n2 || r2;
      this._failureCallback(e2, i2), i2 && (n2 ? this._startAttempt() : (this._passesRemaining--, this._urlIndex = 0, setTimeout(function() {
        t2._currentAttempt.cancelled || t2._startAttempt();
      }, 3e3)));
    }
  } }, { key: "cancel", value: function() {
    this._currentAttempt && this._currentAttempt.cancel();
  } }, { key: "cancelled", get: function() {
    return this._currentAttempt && this._currentAttempt.cancelled;
  } }, { key: "succeeded", get: function() {
    return this._currentAttempt && this._currentAttempt.succeeded;
  } }]);
})();
var ts = (function() {
  function t2() {
    return e(this, t2), n2 = this, i2 = arguments, r2 = a(r2 = t2), o(n2, Ka() ? Reflect.construct(r2, i2 || [], a(n2).constructor) : r2.apply(n2, i2));
    var n2, r2, i2;
  }
  return c(t2, Ya(Error)), i(t2);
})();
var ns = 2e4;
var rs = (function() {
  return i(function t3(n2, r2, i2, o2, a2) {
    e(this, t3), this._loadAttemptImpl = ma() || !n2.avoidEval ? new is(n2, r2, i2, o2, a2) : new os(n2, r2, i2, o2, a2);
  }, [{ key: "start", value: (t2 = d(function* () {
    return this._loadAttemptImpl.start();
  }), function() {
    return t2.apply(this, arguments);
  }) }, { key: "cancel", value: function() {
    this._loadAttemptImpl.cancel();
  } }, { key: "cancelled", get: function() {
    return this._loadAttemptImpl.cancelled;
  } }, { key: "succeeded", get: function() {
    return this._loadAttemptImpl.succeeded;
  } }]);
  var t2;
})();
var is = (function() {
  return i(function t3(n3, r3, i2, o3, a2) {
    e(this, t3), this.cancelled = false, this.succeeded = false, this._networkTimedOut = false, this._networkTimeout = null, this._networkTimeoutMs = i2, this._iosCache = "undefined" != typeof iOSCallObjectBundleCache && iOSCallObjectBundleCache, this._refetchHeaders = null, this._dailyConfig = n3, this._url = r3, this._successCallback = o3, this._failureCallback = a2;
  }, [{ key: "start", value: (o2 = d(function* () {
    var e2 = this._url;
    !(yield this._tryLoadFromIOSCache(e2)) && this._loadFromNetwork(e2);
  }), function() {
    return o2.apply(this, arguments);
  }) }, { key: "cancel", value: function() {
    clearTimeout(this._networkTimeout), this.cancelled = true;
  } }, { key: "_tryLoadFromIOSCache", value: (r2 = d(function* (e2) {
    if (!this._iosCache) return false;
    try {
      var t3 = yield this._iosCache.get(e2);
      return !!this.cancelled || !!t3 && (t3.code ? (Function('"use strict";' + t3.code)(), this.succeeded = true, this._successCallback(e2), true) : (this._refetchHeaders = t3.refetchHeaders, false));
    } catch (e3) {
      return false;
    }
  }), function(e2) {
    return r2.apply(this, arguments);
  }) }, { key: "_loadFromNetwork", value: (n2 = d(function* (e2) {
    var t3 = this;
    this._networkTimeout = setTimeout(function() {
      t3._networkTimedOut = true, t3._failureCallback({ msg: "Timed out (>".concat(t3._networkTimeoutMs, " ms) when loading call object bundle ").concat(e2), type: "timeout" });
    }, this._networkTimeoutMs);
    try {
      var n3 = this._refetchHeaders ? { headers: this._refetchHeaders } : {}, r3 = yield fetch(e2, n3);
      if (clearTimeout(this._networkTimeout), this.cancelled || this._networkTimedOut) throw new ts();
      var i2 = yield this._getBundleCodeFromResponse(e2, r3);
      if (this.cancelled) throw new ts();
      Function('"use strict";' + i2)(), this._iosCache && this._iosCache.set(e2, i2, r3.headers), this.succeeded = true, this._successCallback(e2);
    } catch (t4) {
      if (clearTimeout(this._networkTimeout), t4 instanceof ts || this.cancelled || this._networkTimedOut) return;
      this._failureCallback({ msg: "Failed to load call object bundle ".concat(e2, ": ").concat(t4), type: t4.message });
    }
  }), function(e2) {
    return n2.apply(this, arguments);
  }) }, { key: "_getBundleCodeFromResponse", value: (t2 = d(function* (e2, t3) {
    if (t3.ok) return yield t3.text();
    if (this._iosCache && 304 === t3.status) return (yield this._iosCache.renew(e2, t3.headers)).code;
    throw new Error("Received ".concat(t3.status, " response"));
  }), function(e2, n3) {
    return t2.apply(this, arguments);
  }) }]);
  var t2, n2, r2, o2;
})();
var os = (function() {
  return i(function t2(n2, r2, i2, o2, a2) {
    e(this, t2), this.cancelled = false, this.succeeded = false, this._dailyConfig = n2, this._url = r2, this._networkTimeoutMs = i2, this._successCallback = o2, this._failureCallback = a2, this._attemptId = B(), this._networkTimeout = null, this._scriptElement = null;
  }, [{ key: "start", value: function() {
    window._dailyCallMachineLoadWaitlist || (window._dailyCallMachineLoadWaitlist = /* @__PURE__ */ new Set());
    var e2 = this._url;
    "object" === ("undefined" == typeof document ? "undefined" : t(document)) ? this._startLoading(e2) : this._failureCallback({ msg: "Call object bundle must be loaded in a DOM/web context", type: "missing context" });
  } }, { key: "cancel", value: function() {
    this._stopLoading(), this.cancelled = true;
  } }, { key: "_startLoading", value: function(e2) {
    var t2 = this;
    this._signUpForCallMachineLoadWaitlist(), this._networkTimeout = setTimeout(function() {
      t2._stopLoading(), t2._failureCallback({ msg: "Timed out (>".concat(t2._networkTimeoutMs, " ms) when loading call object bundle ").concat(e2), type: "timeout" });
    }, this._networkTimeoutMs);
    var n2 = document.getElementsByTagName("head")[0], r2 = document.createElement("script");
    this._scriptElement = r2, r2.onload = function() {
      t2._stopLoading(), t2.succeeded = true, t2._successCallback(e2);
    }, r2.onerror = function(e3) {
      t2._stopLoading(), t2._failureCallback({ msg: "Failed to load call object bundle ".concat(e3.target.src), type: e3.message });
    }, r2.src = e2, n2.appendChild(r2);
  } }, { key: "_stopLoading", value: function() {
    this._withdrawFromCallMachineLoadWaitlist(), clearTimeout(this._networkTimeout), this._scriptElement && (this._scriptElement.onload = null, this._scriptElement.onerror = null);
  } }, { key: "_signUpForCallMachineLoadWaitlist", value: function() {
    window._dailyCallMachineLoadWaitlist.add(this._attemptId);
  } }, { key: "_withdrawFromCallMachineLoadWaitlist", value: function() {
    window._dailyCallMachineLoadWaitlist.delete(this._attemptId);
  } }]);
})();
var as = function(e2, t2, n2) {
  return true === ls(e2.local, t2, n2);
};
var ss = function(e2, t2, n2) {
  return e2.local.streams && e2.local.streams[t2] && e2.local.streams[t2].stream && e2.local.streams[t2].stream["get".concat("video" === n2 ? "Video" : "Audio", "Tracks")]()[0];
};
var cs = function(e2, t2, n2, r2) {
  var i2 = us(e2, t2, n2, r2);
  return i2 && i2.pendingTrack;
};
var ls = function(e2, t2, n2) {
  if (!e2) return false;
  var r2 = function(e3) {
    switch (e3) {
      case "avatar":
        return true;
      case "staged":
        return e3;
      default:
        return !!e3;
    }
  }, i2 = e2.public.subscribedTracks;
  return i2 && i2[t2] ? -1 === ["cam-audio", "cam-video", "screen-video", "screen-audio", "rmpAudio", "rmpVideo"].indexOf(n2) && i2[t2].custom ? [true, "staged"].includes(i2[t2].custom) ? r2(i2[t2].custom) : r2(i2[t2].custom[n2]) : r2(i2[t2][n2]) : !i2 || r2(i2.ALL);
};
var us = function(e2, t2, n2, r2) {
  var i2 = Object.values(e2.streams || {}).filter(function(e3) {
    return e3.participantId === t2 && e3.type === n2 && e3.pendingTrack && e3.pendingTrack.kind === r2;
  }).sort(function(e3, t3) {
    return new Date(t3.starttime) - new Date(e3.starttime);
  });
  return i2 && i2[0];
};
var ds = function(e2, t2) {
  var n2 = e2.local.public.customTracks;
  if (n2 && n2[t2]) return n2[t2].track;
};
function hs(e2, t2) {
  for (var n2 = t2.getState(), r2 = 0, i2 = ["cam", "screen"]; r2 < i2.length; r2++) for (var o2 = i2[r2], a2 = 0, s2 = ["video", "audio"]; a2 < s2.length; a2++) {
    var c2 = s2[a2], l2 = "cam" === o2 ? c2 : "screen".concat(c2.charAt(0).toUpperCase() + c2.slice(1)), u2 = e2.tracks[l2];
    if (u2) {
      var d2 = e2.local ? ss(n2, o2, c2) : cs(n2, e2.session_id, o2, c2);
      "playable" === u2.state && (u2.track = d2), u2.persistentTrack = d2;
    }
  }
}
function ps(e2, t2) {
  try {
    var n2 = t2.getState();
    for (var r2 in e2.tracks) if (!fs(r2)) {
      var i2 = e2.tracks[r2].kind;
      if (i2) {
        var o2 = e2.tracks[r2];
        if (o2) {
          var a2 = e2.local ? ds(n2, r2) : cs(n2, e2.session_id, r2, i2);
          "playable" === o2.state && (e2.tracks[r2].track = a2), o2.persistentTrack = a2;
        }
      } else console.error("unknown type for custom track");
    }
  } catch (e3) {
    console.error(e3);
  }
}
function fs(e2) {
  return ["video", "audio", "screenVideo", "screenAudio"].includes(e2);
}
function vs(e2, t2, n2) {
  var r2 = n2.getState();
  if (e2.local) {
    if (e2.audio) try {
      e2.audioTrack = r2.local.streams.cam.stream.getAudioTracks()[0], e2.audioTrack || (e2.audio = false);
    } catch (e3) {
    }
    if (e2.video) try {
      e2.videoTrack = r2.local.streams.cam.stream.getVideoTracks()[0], e2.videoTrack || (e2.video = false);
    } catch (e3) {
    }
    if (e2.screen) try {
      e2.screenVideoTrack = r2.local.streams.screen.stream.getVideoTracks()[0], e2.screenAudioTrack = r2.local.streams.screen.stream.getAudioTracks()[0], e2.screenVideoTrack || e2.screenAudioTrack || (e2.screen = false);
    } catch (e3) {
    }
  } else {
    var i2 = true;
    try {
      var o2 = r2.participants[e2.session_id];
      o2 && o2.public && o2.public.rtcType && "peer-to-peer" === o2.public.rtcType.impl && o2.private && !["connected", "completed"].includes(o2.private.peeringState) && (i2 = false);
    } catch (e3) {
      console.error(e3);
    }
    if (!i2) return e2.audio = false, e2.audioTrack = false, e2.video = false, e2.videoTrack = false, e2.screen = false, void (e2.screenTrack = false);
    try {
      r2.streams;
      if (e2.audio && as(r2, e2.session_id, "cam-audio")) {
        var a2 = cs(r2, e2.session_id, "cam", "audio");
        a2 && (t2 && t2.audioTrack && t2.audioTrack.id === a2.id ? e2.audioTrack = a2 : a2.muted || (e2.audioTrack = a2)), e2.audioTrack || (e2.audio = false);
      }
      if (e2.video && as(r2, e2.session_id, "cam-video")) {
        var s2 = cs(r2, e2.session_id, "cam", "video");
        s2 && (t2 && t2.videoTrack && t2.videoTrack.id === s2.id ? e2.videoTrack = s2 : s2.muted || (e2.videoTrack = s2)), e2.videoTrack || (e2.video = false);
      }
      if (e2.screen && as(r2, e2.session_id, "screen-audio")) {
        var c2 = cs(r2, e2.session_id, "screen", "audio");
        c2 && (t2 && t2.screenAudioTrack && t2.screenAudioTrack.id === c2.id ? e2.screenAudioTrack = c2 : c2.muted || (e2.screenAudioTrack = c2));
      }
      if (e2.screen && as(r2, e2.session_id, "screen-video")) {
        var l2 = cs(r2, e2.session_id, "screen", "video");
        l2 && (t2 && t2.screenVideoTrack && t2.screenVideoTrack.id === l2.id ? e2.screenVideoTrack = l2 : l2.muted || (e2.screenVideoTrack = l2));
      }
      e2.screenVideoTrack || e2.screenAudioTrack || (e2.screen = false);
    } catch (e3) {
      console.error("unexpected error matching up tracks", e3);
    }
  }
}
function gs(e2, t2) {
  var n2 = "undefined" != typeof Symbol && e2[Symbol.iterator] || e2["@@iterator"];
  if (!n2) {
    if (Array.isArray(e2) || (n2 = (function(e3, t3) {
      if (e3) {
        if ("string" == typeof e3) return ms(e3, t3);
        var n3 = {}.toString.call(e3).slice(8, -1);
        return "Object" === n3 && e3.constructor && (n3 = e3.constructor.name), "Map" === n3 || "Set" === n3 ? Array.from(e3) : "Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3) ? ms(e3, t3) : void 0;
      }
    })(e2)) || t2 && e2 && "number" == typeof e2.length) {
      n2 && (e2 = n2);
      var r2 = 0, i2 = function() {
      };
      return { s: i2, n: function() {
        return r2 >= e2.length ? { done: true } : { done: false, value: e2[r2++] };
      }, e: function(e3) {
        throw e3;
      }, f: i2 };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o2, a2 = true, s2 = false;
  return { s: function() {
    n2 = n2.call(e2);
  }, n: function() {
    var e3 = n2.next();
    return a2 = e3.done, e3;
  }, e: function(e3) {
    s2 = true, o2 = e3;
  }, f: function() {
    try {
      a2 || null == n2.return || n2.return();
    } finally {
      if (s2) throw o2;
    }
  } };
}
function ms(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
var ys = /* @__PURE__ */ new Map();
var bs = null;
function _s(e2, t2) {
  var n2 = "undefined" != typeof Symbol && e2[Symbol.iterator] || e2["@@iterator"];
  if (!n2) {
    if (Array.isArray(e2) || (n2 = (function(e3, t3) {
      if (e3) {
        if ("string" == typeof e3) return ws(e3, t3);
        var n3 = {}.toString.call(e3).slice(8, -1);
        return "Object" === n3 && e3.constructor && (n3 = e3.constructor.name), "Map" === n3 || "Set" === n3 ? Array.from(e3) : "Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3) ? ws(e3, t3) : void 0;
      }
    })(e2)) || t2 && e2 && "number" == typeof e2.length) {
      n2 && (e2 = n2);
      var r2 = 0, i2 = function() {
      };
      return { s: i2, n: function() {
        return r2 >= e2.length ? { done: true } : { done: false, value: e2[r2++] };
      }, e: function(e3) {
        throw e3;
      }, f: i2 };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o2, a2 = true, s2 = false;
  return { s: function() {
    n2 = n2.call(e2);
  }, n: function() {
    var e3 = n2.next();
    return a2 = e3.done, e3;
  }, e: function(e3) {
    s2 = true, o2 = e3;
  }, f: function() {
    try {
      a2 || null == n2.return || n2.return();
    } finally {
      if (s2) throw o2;
    }
  } };
}
function ws(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
var ks = /* @__PURE__ */ new Map();
var Ss = null;
function Ms(e2) {
  Cs() ? (function(e3) {
    ys.has(e3) || (ys.set(e3, {}), navigator.mediaDevices.enumerateDevices().then(function(t2) {
      ys.has(e3) && (ys.get(e3).lastDevicesString = JSON.stringify(t2), bs || (bs = (function() {
        var e4 = d(function* () {
          var e5, t3 = yield navigator.mediaDevices.enumerateDevices(), n2 = gs(ys.keys());
          try {
            for (n2.s(); !(e5 = n2.n()).done; ) {
              var r2 = e5.value, i2 = JSON.stringify(t3);
              i2 !== ys.get(r2).lastDevicesString && (ys.get(r2).lastDevicesString = i2, r2(t3));
            }
          } catch (e6) {
            n2.e(e6);
          } finally {
            n2.f();
          }
        });
        return function() {
          return e4.apply(this, arguments);
        };
      })(), navigator.mediaDevices.addEventListener("devicechange", bs)));
    }).catch(function() {
    }));
  })(e2) : (function(e3) {
    ks.has(e3) || (ks.set(e3, {}), navigator.mediaDevices.enumerateDevices().then(function(t2) {
      ks.has(e3) && (ks.get(e3).lastDevicesString = JSON.stringify(t2), Ss || (Ss = setInterval(d(function* () {
        var e4, t3 = yield navigator.mediaDevices.enumerateDevices(), n2 = _s(ks.keys());
        try {
          for (n2.s(); !(e4 = n2.n()).done; ) {
            var r2 = e4.value, i2 = JSON.stringify(t3);
            i2 !== ks.get(r2).lastDevicesString && (ks.get(r2).lastDevicesString = i2, r2(t3));
          }
        } catch (e5) {
          n2.e(e5);
        } finally {
          n2.f();
        }
      }), 3e3)));
    }));
  })(e2);
}
function Es(e2) {
  Cs() ? (function(e3) {
    ys.has(e3) && (ys.delete(e3), 0 === ys.size && bs && (navigator.mediaDevices.removeEventListener("devicechange", bs), bs = null));
  })(e2) : (function(e3) {
    ks.has(e3) && (ks.delete(e3), 0 === ks.size && Ss && (clearInterval(Ss), Ss = null));
  })(e2);
}
function Cs() {
  var e2;
  return ma() || void 0 !== (null === (e2 = navigator.mediaDevices) || void 0 === e2 ? void 0 : e2.ondevicechange);
}
var Ts = /* @__PURE__ */ new Set();
function Os(e2, t2) {
  var n2 = t2.isLocalScreenVideo;
  return e2 && "live" === e2.readyState && !(function(e3, t3) {
    return (!t3.isLocalScreenVideo || "Chrome" !== Aa()) && e3.muted && !Ts.has(e3.id);
  })(e2, { isLocalScreenVideo: n2 });
}
function Ps(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter(function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    })), n2.push.apply(n2, r2);
  }
  return n2;
}
function As(e2) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n2 = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? Ps(Object(n2), true).forEach(function(t3) {
      l(e2, t3, n2[t3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : Ps(Object(n2)).forEach(function(t3) {
      Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
    });
  }
  return e2;
}
var xs = Object.freeze({ VIDEO: "video", AUDIO: "audio", SCREEN_VIDEO: "screenVideo", SCREEN_AUDIO: "screenAudio", CUSTOM_VIDEO: "customVideo", CUSTOM_AUDIO: "customAudio" });
var js = Object.freeze({ PARTICIPANTS: "participants", STREAMING: "streaming", TRANSCRIPTION: "transcription" });
var Is = Object.values(xs);
var Ls = ["v", "a", "sv", "sa", "cv", "ca"];
Object.freeze(Is.reduce(function(e2, t2, n2) {
  return e2[t2] = Ls[n2], e2;
}, {})), Object.freeze(Ls.reduce(function(e2, t2, n2) {
  return e2[t2] = Is[n2], e2;
}, {}));
var Ds = [xs.VIDEO, xs.AUDIO, xs.SCREEN_VIDEO, xs.SCREEN_AUDIO];
var Ns = Object.values(js);
var Fs = ["p", "s", "t"];
Object.freeze(Ns.reduce(function(e2, t2, n2) {
  return e2[t2] = Fs[n2], e2;
}, {})), Object.freeze(Fs.reduce(function(e2, t2, n2) {
  return e2[t2] = Ns[n2], e2;
}, {}));
var Bs = (function() {
  function n2() {
    var t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = t2.base, i2 = t2.byUserId, o2 = t2.byParticipantId;
    e(this, n2), this.base = r2, this.byUserId = i2, this.byParticipantId = o2;
  }
  return i(n2, [{ key: "clone", value: function() {
    var e2 = new n2();
    if (this.base instanceof Rs ? e2.base = this.base.clone() : e2.base = this.base, void 0 !== this.byUserId) for (var t2 in e2.byUserId = {}, this.byUserId) {
      var r2 = this.byUserId[t2];
      e2.byUserId[t2] = r2 instanceof Rs ? r2.clone() : r2;
    }
    if (void 0 !== this.byParticipantId) for (var i2 in e2.byParticipantId = {}, this.byParticipantId) {
      var o2 = this.byParticipantId[i2];
      e2.byParticipantId[i2] = o2 instanceof Rs ? o2.clone() : o2;
    }
    return e2;
  } }, { key: "toJSONObject", value: function() {
    var e2 = {};
    if ("boolean" == typeof this.base ? e2.base = this.base : this.base instanceof Rs && (e2.base = this.base.toJSONObject()), void 0 !== this.byUserId) for (var t2 in e2.byUserId = {}, this.byUserId) {
      var n3 = this.byUserId[t2];
      e2.byUserId[t2] = n3 instanceof Rs ? n3.toJSONObject() : n3;
    }
    if (void 0 !== this.byParticipantId) for (var r2 in e2.byParticipantId = {}, this.byParticipantId) {
      var i2 = this.byParticipantId[r2];
      e2.byParticipantId[r2] = i2 instanceof Rs ? i2.toJSONObject() : i2;
    }
    return e2;
  } }, { key: "toMinifiedJSONObject", value: function() {
    var e2 = {};
    if (void 0 !== this.base && ("boolean" == typeof this.base ? e2.b = this.base : e2.b = this.base.toMinifiedJSONObject()), void 0 !== this.byUserId) for (var t2 in e2.u = {}, this.byUserId) {
      var n3 = this.byUserId[t2];
      e2.u[t2] = "boolean" == typeof n3 ? n3 : n3.toMinifiedJSONObject();
    }
    if (void 0 !== this.byParticipantId) for (var r2 in e2.p = {}, this.byParticipantId) {
      var i2 = this.byParticipantId[r2];
      e2.p[r2] = "boolean" == typeof i2 ? i2 : i2.toMinifiedJSONObject();
    }
    return e2;
  } }, { key: "normalize", value: function() {
    return this.base instanceof Rs && (this.base = this.base.normalize()), this.byUserId && (this.byUserId = Object.fromEntries(Object.entries(this.byUserId).map(function(e2) {
      var t2 = v(e2, 2), n3 = t2[0], r2 = t2[1];
      return [n3, r2 instanceof Rs ? r2.normalize() : r2];
    }))), this.byParticipantId && (this.byParticipantId = Object.fromEntries(Object.entries(this.byParticipantId).map(function(e2) {
      var t2 = v(e2, 2), n3 = t2[0], r2 = t2[1];
      return [n3, r2 instanceof Rs ? r2.normalize() : r2];
    }))), this;
  } }], [{ key: "fromJSONObject", value: function(e2) {
    var t2, r2, i2;
    if (void 0 !== e2.base && (t2 = "boolean" == typeof e2.base ? e2.base : Rs.fromJSONObject(e2.base)), void 0 !== e2.byUserId) for (var o2 in r2 = {}, e2.byUserId) {
      var a2 = e2.byUserId[o2];
      r2[o2] = "boolean" == typeof a2 ? a2 : Rs.fromJSONObject(a2);
    }
    if (void 0 !== e2.byParticipantId) for (var s2 in i2 = {}, e2.byParticipantId) {
      var c2 = e2.byParticipantId[s2];
      i2[s2] = "boolean" == typeof c2 ? c2 : Rs.fromJSONObject(c2);
    }
    return new n2({ base: t2, byUserId: r2, byParticipantId: i2 });
  } }, { key: "fromMinifiedJSONObject", value: function(e2) {
    var t2, r2, i2;
    if (void 0 !== e2.b && (t2 = "boolean" == typeof e2.b ? e2.b : Rs.fromMinifiedJSONObject(e2.b)), void 0 !== e2.u) for (var o2 in r2 = {}, e2.u) {
      var a2 = e2.u[o2];
      r2[o2] = "boolean" == typeof a2 ? a2 : Rs.fromMinifiedJSONObject(a2);
    }
    if (void 0 !== e2.p) for (var s2 in i2 = {}, e2.p) {
      var c2 = e2.p[s2];
      i2[s2] = "boolean" == typeof c2 ? c2 : Rs.fromMinifiedJSONObject(c2);
    }
    return new n2({ base: t2, byUserId: r2, byParticipantId: i2 });
  } }, { key: "validateJSONObject", value: function(e2) {
    if ("object" !== t(e2)) return [false, "canReceive must be an object"];
    for (var n3 = ["base", "byUserId", "byParticipantId"], r2 = 0, i2 = Object.keys(e2); r2 < i2.length; r2++) {
      var o2 = i2[r2];
      if (!n3.includes(o2)) return [false, "canReceive can only contain keys (".concat(n3.join(", "), ")")];
      if ("base" === o2) {
        var a2 = v(Rs.validateJSONObject(e2.base, true), 2), s2 = a2[0], c2 = a2[1];
        if (!s2) return [false, c2];
      } else {
        if ("object" !== t(e2[o2])) return [false, "invalid (non-object) value for field '".concat(o2, "' in canReceive")];
        for (var l2 = 0, u2 = Object.values(e2[o2]); l2 < u2.length; l2++) {
          var d2 = u2[l2], h2 = v(Rs.validateJSONObject(d2), 2), p2 = h2[0], f2 = h2[1];
          if (!p2) return [false, f2];
        }
      }
    }
    return [true];
  } }]);
})();
var Rs = (function() {
  function n2() {
    var t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = t2.video, i2 = t2.audio, o2 = t2.screenVideo, a2 = t2.screenAudio, s2 = t2.customVideo, c2 = t2.customAudio;
    e(this, n2), this.video = r2, this.audio = i2, this.screenVideo = o2, this.screenAudio = a2, this.customVideo = s2, this.customAudio = c2;
  }
  return i(n2, [{ key: "clone", value: function() {
    var e2 = new n2();
    return void 0 !== this.video && (e2.video = this.video), void 0 !== this.audio && (e2.audio = this.audio), void 0 !== this.screenVideo && (e2.screenVideo = this.screenVideo), void 0 !== this.screenAudio && (e2.screenAudio = this.screenAudio), void 0 !== this.customVideo && (e2.customVideo = As({}, this.customVideo)), void 0 !== this.customAudio && (e2.customAudio = As({}, this.customAudio)), e2;
  } }, { key: "toJSONObject", value: function() {
    var e2 = {};
    return void 0 !== this.video && (e2.video = this.video), void 0 !== this.audio && (e2.audio = this.audio), void 0 !== this.screenVideo && (e2.screenVideo = this.screenVideo), void 0 !== this.screenAudio && (e2.screenAudio = this.screenAudio), void 0 !== this.customVideo && (e2.customVideo = As({}, this.customVideo)), void 0 !== this.customAudio && (e2.customAudio = As({}, this.customAudio)), e2;
  } }, { key: "toMinifiedJSONObject", value: function() {
    var e2 = {};
    return void 0 !== this.video && (e2.v = this.video), void 0 !== this.audio && (e2.a = this.audio), void 0 !== this.screenVideo && (e2.sv = this.screenVideo), void 0 !== this.screenAudio && (e2.sa = this.screenAudio), void 0 !== this.customVideo && (e2.cv = As({}, this.customVideo)), void 0 !== this.customAudio && (e2.ca = As({}, this.customAudio)), e2;
  } }, { key: "normalize", value: function() {
    function e2(e3, t2) {
      return e3 && 1 === Object.keys(e3).length && e3["*"] === t2;
    }
    return !(true !== this.video || true !== this.audio || true !== this.screenVideo || true !== this.screenAudio || !e2(this.customVideo, true) || !e2(this.customAudio, true)) || (false !== this.video || false !== this.audio || false !== this.screenVideo || false !== this.screenAudio || !e2(this.customVideo, false) || !e2(this.customAudio, false)) && this;
  } }], [{ key: "fromBoolean", value: function(e2) {
    return new n2({ video: e2, audio: e2, screenVideo: e2, screenAudio: e2, customVideo: { "*": e2 }, customAudio: { "*": e2 } });
  } }, { key: "fromJSONObject", value: function(e2) {
    return new n2({ video: e2.video, audio: e2.audio, screenVideo: e2.screenVideo, screenAudio: e2.screenAudio, customVideo: void 0 !== e2.customVideo ? As({}, e2.customVideo) : void 0, customAudio: void 0 !== e2.customAudio ? As({}, e2.customAudio) : void 0 });
  } }, { key: "fromMinifiedJSONObject", value: function(e2) {
    return new n2({ video: e2.v, audio: e2.a, screenVideo: e2.sv, screenAudio: e2.sa, customVideo: e2.cv, customAudio: e2.ca });
  } }, { key: "validateJSONObject", value: function(e2, n3) {
    if ("boolean" == typeof e2) return [true];
    if ("object" !== t(e2)) return [false, "invalid (non-object, non-boolean) value in canReceive"];
    for (var r2 = Object.keys(e2), i2 = 0, o2 = r2; i2 < o2.length; i2++) {
      var a2 = o2[i2];
      if (!Is.includes(a2)) return [false, "invalid media type '".concat(a2, "' in canReceive")];
      if (Ds.includes(a2)) {
        if ("boolean" != typeof e2[a2]) return [false, "invalid (non-boolean) value for media type '".concat(a2, "' in canReceive")];
      } else {
        if ("object" !== t(e2[a2])) return [false, "invalid (non-object) value for media type '".concat(a2, "' in canReceive")];
        for (var s2 = 0, c2 = Object.values(e2[a2]); s2 < c2.length; s2++) {
          if ("boolean" != typeof c2[s2]) return [false, "invalid (non-boolean) value for entry within '".concat(a2, "' in canReceive")];
        }
        if (n3 && void 0 === e2[a2]["*"]) return [false, `canReceive "base" permission must specify "*" as an entry within '`.concat(a2, "'")];
      }
    }
    return n3 && r2.length !== Is.length ? [false, 'canReceive "base" permission must specify all media types: '.concat(Is.join(", "), " (or be set to a boolean shorthand)")] : [true];
  } }]);
})();
var Us = ["initialReceiveBitrate"];
var Vs = ["initialReceiveBitrate"];
var Js = ["result"];
var $s = ["preserveIframe"];
function qs(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter(function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    })), n2.push.apply(n2, r2);
  }
  return n2;
}
function zs(e2) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n2 = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? qs(Object(n2), true).forEach(function(t3) {
      l(e2, t3, n2[t3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : qs(Object(n2)).forEach(function(t3) {
      Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
    });
  }
  return e2;
}
function Ws() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (e3) {
  }
  return (Ws = function() {
    return !!e2;
  })();
}
function Gs(e2, t2) {
  var n2 = "undefined" != typeof Symbol && e2[Symbol.iterator] || e2["@@iterator"];
  if (!n2) {
    if (Array.isArray(e2) || (n2 = (function(e3, t3) {
      if (e3) {
        if ("string" == typeof e3) return Hs(e3, t3);
        var n3 = {}.toString.call(e3).slice(8, -1);
        return "Object" === n3 && e3.constructor && (n3 = e3.constructor.name), "Map" === n3 || "Set" === n3 ? Array.from(e3) : "Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3) ? Hs(e3, t3) : void 0;
      }
    })(e2)) || t2 && e2 && "number" == typeof e2.length) {
      n2 && (e2 = n2);
      var r2 = 0, i2 = function() {
      };
      return { s: i2, n: function() {
        return r2 >= e2.length ? { done: true } : { done: false, value: e2[r2++] };
      }, e: function(e3) {
        throw e3;
      }, f: i2 };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o2, a2 = true, s2 = false;
  return { s: function() {
    n2 = n2.call(e2);
  }, n: function() {
    var e3 = n2.next();
    return a2 = e3.done, e3;
  }, e: function(e3) {
    s2 = true, o2 = e3;
  }, f: function() {
    try {
      a2 || null == n2.return || n2.return();
    } finally {
      if (s2) throw o2;
    }
  } };
}
function Hs(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
var Qs = {};
var Ys = "video";
var Ks = "voice";
var Xs = 3e4;
var Zs = 4294967295;
var ec = ma() ? { data: {} } : { data: {}, topology: "none" };
var tc = { present: 0, hidden: 0 };
var nc = { maxBitrate: { min: 1e5, max: 25e5 }, maxFramerate: { min: 1, max: 30 }, scaleResolutionDownBy: { min: 1, max: 8 } };
var rc = Object.keys(nc);
var ic = ["state", "volume", "simulcastEncodings"];
var oc = { androidInCallNotification: { title: "string", subtitle: "string", iconName: "string", disableForCustomOverride: "boolean" }, disableAutoDeviceManagement: { audio: "boolean", video: "boolean" } };
var ac = { id: { iconPath: "string", iconPathDarkMode: "string", label: "string", tooltip: "string", visualState: "'default' | 'sidebar-open' | 'active'" } };
var sc = { id: { allow: "string", controlledBy: "'*' | 'owners' | string[]", csp: "string", iconURL: "string", label: "string", loading: "'eager' | 'lazy'", location: "'main' | 'sidebar'", name: "string", referrerPolicy: "string", sandbox: "string", src: "string", srcdoc: "string", shared: "string[] | 'owners' | boolean" } };
var cc = /^[a-zA-Z0-9_-]+$/;
function lc(e2) {
  if (null != e2 && "object" === t(e2) && !Array.isArray(e2)) {
    var n2, r2 = {}, i2 = Gs(Object.entries(e2).slice(0, 10));
    try {
      for (i2.s(); !(n2 = i2.n()).done; ) {
        var o2 = v(n2.value, 2), a2 = o2[0], s2 = o2[1];
        "string" != typeof a2 || a2.length > 64 || cc.test(a2) && "string" == typeof s2 && (r2[a2] = s2.slice(0, 256));
      }
    } catch (e3) {
      i2.e(e3);
    } finally {
      i2.f();
    }
    return Object.keys(r2).length ? r2 : void 0;
  }
}
var uc = { customIntegrations: { validate: Dc, help: Ic() }, customTrayButtons: { validate: Lc, help: "customTrayButtons should be a dictionary of the type ".concat(JSON.stringify(ac)) }, url: { validate: function(e2) {
  return "string" == typeof e2;
}, help: "url should be a string" }, baseUrl: { validate: function(e2) {
  return console.warn("baseUrl is deprecated and has no effect"), "string" == typeof e2;
}, help: "baseUrl should be a string" }, token: { validate: function(e2) {
  return "string" == typeof e2;
}, help: "token should be a string", queryString: "t" }, dailyConfig: { validate: function(e2, t2) {
  try {
    return t2.validateDailyConfig(e2), true;
  } catch (e3) {
    console.error("Failed to validate dailyConfig", e3);
  }
  return false;
}, help: "Unsupported dailyConfig. Check error logs for detailed info." }, reactNativeConfig: { validate: function(e2) {
  return Nc(e2, oc);
}, help: "reactNativeConfig should look like ".concat(JSON.stringify(oc), ", all fields optional") }, lang: { validate: function(e2) {
  return ["cs", "da", "de", "en-us", "en", "es", "fi", "fr", "it", "jp", "ka", "nl", "no", "pl", "pt", "pt-BR", "ru", "sk", "sv", "tr", "user"].includes(e2);
}, help: "language not supported. Options are: cs, da, de, en-us, en, es, fi, fr, it, jp, ka, nl, no, pl, pt, pt-BR, ru, sk, sv, tr, user" }, userName: true, userData: { validate: function(e2) {
  try {
    return Mc(e2), true;
  } catch (e3) {
    return console.error(e3), false;
  }
}, help: "invalid userData type provided" }, startVideoOff: true, startAudioOff: true, allowLocalVideo: true, allowLocalAudio: true, activeSpeakerMode: true, showLeaveButton: true, showLocalVideo: true, showParticipantsBar: true, showFullscreenButton: true, showUserNameChangeUI: true, iframeStyle: true, customLayout: true, cssFile: true, cssText: true, bodyClass: true, videoSource: { validate: function(e2, t2) {
  if ("boolean" == typeof e2) return t2._preloadCache.allowLocalVideo = e2, true;
  var n2;
  if (e2 instanceof MediaStreamTrack) t2._sharedTracks.videoTrack = e2, n2 = { customTrack: aa };
  else {
    if (delete t2._sharedTracks.videoTrack, "string" != typeof e2) return console.error("videoSource must be a MediaStreamTrack, boolean, or a string"), false;
    n2 = { deviceId: e2 };
  }
  return t2._updatePreloadCacheInputSettings({ video: { settings: n2 } }, false), true;
} }, audioSource: { validate: function(e2, t2) {
  if ("boolean" == typeof e2) return t2._preloadCache.allowLocalAudio = e2, true;
  var n2;
  if (e2 instanceof MediaStreamTrack) t2._sharedTracks.audioTrack = e2, n2 = { customTrack: aa };
  else {
    if (delete t2._sharedTracks.audioTrack, "string" != typeof e2) return console.error("audioSource must be a MediaStreamTrack, boolean, or a string"), false;
    n2 = { deviceId: e2 };
  }
  return t2._updatePreloadCacheInputSettings({ audio: { settings: n2 } }, false), true;
} }, subscribeToTracksAutomatically: { validate: function(e2, t2) {
  return t2._preloadCache.subscribeToTracksAutomatically = e2, true;
} }, theme: { validate: function(e2) {
  var n2 = ["accent", "accentText", "background", "backgroundAccent", "baseText", "border", "mainAreaBg", "mainAreaBgAccent", "mainAreaText", "supportiveText"], r2 = function(e3) {
    for (var t2 = 0, r3 = Object.keys(e3); t2 < r3.length; t2++) {
      var i2 = r3[t2];
      if (!n2.includes(i2)) return console.error('unsupported color "'.concat(i2, '". Valid colors: ').concat(n2.join(", "))), false;
      if (!e3[i2].match(/^#[0-9a-f]{6}|#[0-9a-f]{3}$/i)) return console.error("".concat(i2, ' theme color should be provided in valid hex color format. Received: "').concat(e3[i2], '"')), false;
    }
    return true;
  };
  return "object" === t(e2) && ("light" in e2 && "dark" in e2 || "colors" in e2) ? "light" in e2 && "dark" in e2 ? "colors" in e2.light ? "colors" in e2.dark ? r2(e2.light.colors) && r2(e2.dark.colors) : (console.error('Dark theme is missing "colors" property.', e2), false) : (console.error('Light theme is missing "colors" property.', e2), false) : r2(e2.colors) : (console.error('Theme must contain either both "light" and "dark" properties, or "colors".', e2), false);
}, help: "unsupported theme configuration. Check error logs for detailed info." }, layoutConfig: { validate: function(e2) {
  if ("grid" in e2) {
    var t2 = e2.grid;
    if ("maxTilesPerPage" in t2) {
      if (!Number.isInteger(t2.maxTilesPerPage)) return console.error("grid.maxTilesPerPage should be an integer. You passed ".concat(t2.maxTilesPerPage, ".")), false;
      if (t2.maxTilesPerPage > 49) return console.error("grid.maxTilesPerPage can't be larger than 49 without sacrificing browser performance. Please contact us at https://www.daily.co/contact to talk about your use case."), false;
    }
    if ("minTilesPerPage" in t2) {
      if (!Number.isInteger(t2.minTilesPerPage)) return console.error("grid.minTilesPerPage should be an integer. You passed ".concat(t2.minTilesPerPage, ".")), false;
      if (t2.minTilesPerPage < 1) return console.error("grid.minTilesPerPage can't be lower than 1."), false;
      if ("maxTilesPerPage" in t2 && t2.minTilesPerPage > t2.maxTilesPerPage) return console.error("grid.minTilesPerPage can't be higher than grid.maxTilesPerPage."), false;
    }
  }
  return true;
}, help: "unsupported layoutConfig. Check error logs for detailed info." }, receiveSettings: { validate: function(e2, t2) {
  var n2 = e2.initialReceiveBitrate, r2 = h(e2, Us);
  if (void 0 !== n2 && !t2._callObjectMode) throw new Error("initialReceiveBitrate is only available in call object mode");
  return (function(e3) {
    if (void 0 !== e3 && (!Number.isInteger(e3) || e3 < Xs || e3 > Zs)) throw new Error("initialReceiveBitrate must be a whole number of bits per second, between ".concat(Xs, " and ").concat(Zs));
  })(n2), Ec(r2, { allowAllParticipantsKey: false });
}, help: jc({ allowAllParticipantsKey: false }) }, sendSettings: { validate: function(e2, t2) {
  return !!(function(e3, t3) {
    try {
      return t3.validateUpdateSendSettings(e3), true;
    } catch (e4) {
      return console.error("Failed to validate send settings", e4), false;
    }
  })(e2, t2) && (t2._preloadCache.sendSettings = e2, true);
}, help: "Invalid sendSettings provided. Check error logs for detailed info." }, inputSettings: { validate: function(e2, t2) {
  var n2;
  return !!Cc(e2) && (t2._inputSettings || (t2._inputSettings = {}), Tc(e2, null === (n2 = t2.properties) || void 0 === n2 ? void 0 : n2.dailyConfig, t2._sharedTracks), t2._updatePreloadCacheInputSettings(e2, true), true);
}, help: xc() }, layout: { validate: function(e2) {
  return "custom-v1" === e2 || "browser" === e2 || "none" === e2;
}, help: 'layout may only be set to "custom-v1"', queryString: "layout" }, emb: { queryString: "emb" }, embHref: { queryString: "embHref" }, dailyJsVersion: { queryString: "dailyJsVersion" }, aboutClient: { validate: function(e2) {
  if (null == e2) return true;
  if ("object" !== t(e2) || Array.isArray(e2)) return false;
  var n2 = Object.entries(e2);
  if (n2.length > 10) return false;
  for (var r2 = 0, i2 = n2; r2 < i2.length; r2++) {
    var o2 = v(i2[r2], 2), a2 = o2[0], s2 = o2[1];
    if ("string" != typeof a2 || a2.length > 64) return false;
    if (!cc.test(a2)) return false;
    if ("string" != typeof s2 || s2.length > 256) return false;
  }
  return true;
}, help: "aboutClient must be an object with up to ".concat(10, " entries; keys must be strings made up of characters (a-z, 0-9, _, -) and a max length of ").concat(64, "; values must be strings with a max length of ").concat(256) }, proxy: { queryString: "proxy" }, strictMode: true, allowMultipleCallInstances: true };
var dc = { styles: { validate: function(e2) {
  for (var t2 in e2) if ("cam" !== t2 && "screen" !== t2) return false;
  if (e2.cam) {
    for (var n2 in e2.cam) if ("div" !== n2 && "video" !== n2) return false;
  }
  if (e2.screen) {
    for (var r2 in e2.screen) if ("div" !== r2 && "video" !== r2) return false;
  }
  return true;
}, help: "styles format should be a subset of: { cam: {div: {}, video: {}}, screen: {div: {}, video: {}} }" }, setSubscribedTracks: { validate: function(e2, t2) {
  if (t2._preloadCache.subscribeToTracksAutomatically) return false;
  var n2 = [true, false, "staged"];
  if (n2.includes(e2) || !ma() && "avatar" === e2) return true;
  var r2 = ["audio", "video", "screenAudio", "screenVideo", "rmpAudio", "rmpVideo"], i2 = function(e3) {
    var t3 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
    for (var o2 in e3) if ("custom" === o2) {
      if (!n2.includes(e3[o2]) && !i2(e3[o2], true)) return false;
    } else {
      var a2 = !t3 && !r2.includes(o2), s2 = !n2.includes(e3[o2]);
      if (a2 || s2) return false;
    }
    return true;
  };
  return i2(e2);
}, help: "setSubscribedTracks cannot be used when setSubscribeToTracksAutomatically is enabled, and should be of the form: " + "true".concat(ma() ? "" : " | 'avatar'", " | false | 'staged' | { [audio: true|false|'staged'], [video: true|false|'staged'], [screenAudio: true|false|'staged'], [screenVideo: true|false|'staged'] }") }, setAudio: true, setVideo: true, setScreenShare: { validate: function(e2) {
  return false === e2;
}, help: "setScreenShare must be false, as it's only meant for stopping remote participants' screen shares" }, eject: true, updatePermissions: { validate: function(e2) {
  for (var t2 = 0, n2 = Object.entries(e2); t2 < n2.length; t2++) {
    var r2 = v(n2[t2], 2), i2 = r2[0], o2 = r2[1];
    switch (i2) {
      case "hasPresence":
        if ("boolean" != typeof o2) return false;
        break;
      case "canSend":
        if (o2 instanceof Set || o2 instanceof Array || Array.isArray(o2)) {
          var a2, s2 = ["video", "audio", "screenVideo", "screenAudio", "customVideo", "customAudio"], c2 = Gs(o2);
          try {
            for (c2.s(); !(a2 = c2.n()).done; ) {
              var l2 = a2.value;
              if (!s2.includes(l2)) return false;
            }
          } catch (e3) {
            c2.e(e3);
          } finally {
            c2.f();
          }
        } else if ("boolean" != typeof o2) return false;
        (o2 instanceof Array || Array.isArray(o2)) && (e2.canSend = new Set(o2));
        break;
      case "canReceive":
        var u2 = v(Bs.validateJSONObject(o2), 2), d2 = u2[0], h2 = u2[1];
        if (!d2) return console.error(h2), false;
        break;
      case "canAdmin":
        if (o2 instanceof Set || o2 instanceof Array || Array.isArray(o2)) {
          var p2, f2 = ["participants", "streaming", "transcription"], g2 = Gs(o2);
          try {
            for (g2.s(); !(p2 = g2.n()).done; ) {
              var m2 = p2.value;
              if (!f2.includes(m2)) return false;
            }
          } catch (e3) {
            g2.e(e3);
          } finally {
            g2.f();
          }
        } else if ("boolean" != typeof o2) return false;
        (o2 instanceof Array || Array.isArray(o2)) && (e2.canAdmin = new Set(o2));
        break;
      default:
        return false;
    }
  }
  return true;
}, help: "updatePermissions can take hasPresence, canSend, canReceive, and canAdmin permissions. hasPresence must be a boolean. canSend can be a boolean or an Array or Set of media types (video, audio, screenVideo, screenAudio, customVideo, customAudio). canReceive must be an object specifying base, byUserId, and/or byParticipantId fields (see documentation for more details). canAdmin can be a boolean or an Array or Set of admin types (participants, streaming, transcription)." } };
Promise.any || (Promise.any = (function() {
  var e2 = d(function* (e3) {
    return new Promise(function(t2, n2) {
      var r2 = [];
      e3.forEach(function(i2) {
        return Promise.resolve(i2).then(function(e4) {
          t2(e4);
        }).catch(function(t3) {
          r2.push(t3), r2.length === e3.length && n2(r2);
        });
      });
    });
  });
  return function(t2) {
    return e2.apply(this, arguments);
  };
})());
var hc = (function() {
  function n2(t2) {
    var r3, i2, s3, c2, u3, p3, f3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (e(this, n2), s3 = this, c2 = a(c2 = n2), l(i2 = o(s3, Ws() ? Reflect.construct(c2, u3 || [], a(s3).constructor) : c2.apply(s3, u3)), "startListeningForDeviceChanges", function() {
      Ms(i2.handleDeviceChange);
    }), l(i2, "stopListeningForDeviceChanges", function() {
      Es(i2.handleDeviceChange);
    }), l(i2, "handleDeviceChange", function(e2) {
      e2 = e2.map(function(e3) {
        return JSON.parse(JSON.stringify(e3));
      }), i2.emitDailyJSEvent({ action: "available-devices-updated", availableDevices: e2 });
    }), l(i2, "handleNativeAppStateChange", (function() {
      var e2 = d(function* (e3) {
        if ("destroyed" === e3) return console.warn("App has been destroyed before leaving the meeting. Cleaning up all the resources!"), void (yield i2.destroy());
        var t3 = "active" === e3;
        i2.disableReactNativeAutoDeviceManagement("video") || (t3 ? i2.camUnmutedBeforeLosingNativeActiveState && i2.setLocalVideo(true) : (i2.camUnmutedBeforeLosingNativeActiveState = i2.localVideo(), i2.camUnmutedBeforeLosingNativeActiveState && i2.setLocalVideo(false)));
      });
      return function(t3) {
        return e2.apply(this, arguments);
      };
    })()), l(i2, "handleNativeAudioFocusChange", function(e2) {
      i2.disableReactNativeAutoDeviceManagement("audio") || (i2._hasNativeAudioFocus = e2, i2.toggleParticipantAudioBasedOnNativeAudioFocus(), i2._hasNativeAudioFocus ? i2.micUnmutedBeforeLosingNativeAudioFocus && i2.setLocalAudio(true) : (i2.micUnmutedBeforeLosingNativeAudioFocus = i2.localAudio(), i2.setLocalAudio(false)));
    }), l(i2, "handleNativeSystemScreenCaptureStop", function() {
      i2.stopScreenShare();
    }), !Ta() && !ma()) throw new Error("WebRTC not supported or suppressed");
    if (i2.strictMode = void 0 === f3.strictMode || f3.strictMode, i2.allowMultipleCallInstances = null !== (r3 = f3.allowMultipleCallInstances) && void 0 !== r3 && r3, Object.keys(Qs).length && (i2._logDuplicateInstanceAttempt(), !i2.allowMultipleCallInstances)) {
      if (i2.strictMode) throw new Error("Duplicate DailyIframe instances are not allowed");
      console.warn("Using strictMode: false to allow multiple call instances is now deprecated. Set `allowMultipleCallInstances: true`");
    }
    if (window._daily || (window._daily = { pendings: [], instances: {} }), i2.callClientId = B(), Qs[(p3 = i2).callClientId] = p3, window._daily.instances[i2.callClientId] = {}, i2._sharedTracks = {}, window._daily.instances[i2.callClientId].tracks = i2._sharedTracks, f3.dailyJsVersion = n2.version(), void 0 !== f3.aboutClient && (f3.aboutClient = lc(f3.aboutClient)), i2._iframe = t2, i2._callObjectMode = "none" === f3.layout && !i2._iframe, i2._preloadCache = { subscribeToTracksAutomatically: true, outputDeviceId: null, inputSettings: null, sendSettings: null, videoTrackForNetworkConnectivityTest: null, videoTrackForConnectionQualityTest: null }, void 0 !== f3.showLocalVideo ? i2._callObjectMode ? console.error("showLocalVideo is not available in call object mode") : i2._showLocalVideo = !!f3.showLocalVideo : i2._showLocalVideo = true, void 0 !== f3.showParticipantsBar ? i2._callObjectMode ? console.error("showParticipantsBar is not available in call object mode") : i2._showParticipantsBar = !!f3.showParticipantsBar : i2._showParticipantsBar = true, void 0 !== f3.customIntegrations ? i2._callObjectMode ? console.error("customIntegrations is not available in call object mode") : i2._customIntegrations = f3.customIntegrations : i2._customIntegrations = {}, void 0 !== f3.customTrayButtons ? i2._callObjectMode ? console.error("customTrayButtons is not available in call object mode") : i2._customTrayButtons = f3.customTrayButtons : i2._customTrayButtons = {}, void 0 !== f3.activeSpeakerMode ? i2._callObjectMode ? console.error("activeSpeakerMode is not available in call object mode") : i2._activeSpeakerMode = !!f3.activeSpeakerMode : i2._activeSpeakerMode = false, f3.receiveSettings) if (i2._callObjectMode) {
      var v2 = f3.receiveSettings;
      v2.initialReceiveBitrate;
      var g3 = h(v2, Vs);
      i2._receiveSettings = g3;
    } else console.error("receiveSettings is only available in call object mode");
    else i2._receiveSettings = {};
    if (i2.validateProperties(f3), i2.properties = zs({}, f3), void 0 !== i2.properties.aboutClient && (i2.properties.aboutClient = lc(i2.properties.aboutClient)), i2._inputSettings || (i2._inputSettings = {}), i2._callObjectLoader = i2._callObjectMode ? new Za(i2.callClientId) : null, i2._callState = hi, i2._isPreparingToJoin = false, i2._accessState = { access: Ei }, i2._meetingSessionSummary = {}, i2._finalSummaryOfPrevSession = {}, i2._meetingSessionState = Uc(ec, i2._callObjectMode), i2._nativeInCallAudioMode = Ys, i2._participants = {}, i2._isScreenSharing = false, i2._participantCounts = tc, i2._rmpPlayerState = {}, i2._waitingParticipants = {}, i2._network = { threshold: "good", quality: 100, networkState: "unknown", stats: {} }, i2._activeSpeaker = {}, i2._localAudioLevel = 0, i2._isLocalAudioLevelObserverRunning = false, i2._remoteParticipantsAudioLevel = {}, i2._isRemoteParticipantsAudioLevelObserverRunning = false, i2._maxAppMessageSize = ea, i2._messageChannel = ma() ? new qa() : new Va(), i2._iframe && (i2._iframe.requestFullscreen ? i2._iframe.addEventListener("fullscreenchange", function() {
      document.fullscreenElement === i2._iframe ? (i2.emitDailyJSEvent({ action: $o }), i2.sendMessageToCallMachine({ action: $o })) : (i2.emitDailyJSEvent({ action: qo }), i2.sendMessageToCallMachine({ action: qo }));
    }) : i2._iframe.webkitRequestFullscreen && i2._iframe.addEventListener("webkitfullscreenchange", function() {
      document.webkitFullscreenElement === i2._iframe ? (i2.emitDailyJSEvent({ action: $o }), i2.sendMessageToCallMachine({ action: $o })) : (i2.emitDailyJSEvent({ action: qo }), i2.sendMessageToCallMachine({ action: qo }));
    })), ma()) {
      var m3 = i2.nativeUtils();
      m3.addAudioFocusChangeListener && m3.removeAudioFocusChangeListener && m3.addAppStateChangeListener && m3.removeAppStateChangeListener && m3.addSystemScreenCaptureStopListener && m3.removeSystemScreenCaptureStopListener || console.warn("expected (add|remove)(AudioFocusChange|AppActiveStateChange|SystemScreenCaptureStop)Listener to be available in React Native"), i2._hasNativeAudioFocus = true, m3.addAudioFocusChangeListener(i2.handleNativeAudioFocusChange), m3.addAppStateChangeListener(i2.handleNativeAppStateChange), m3.addSystemScreenCaptureStopListener(i2.handleNativeSystemScreenCaptureStop);
    }
    return i2._callObjectMode && i2.startListeningForDeviceChanges(), i2._messageChannel.addListenerForMessagesFromCallMachine(i2.handleMessageFromCallMachine, i2.callClientId, i2), i2;
  }
  return c(n2, _), i(n2, [{ key: "destroy", value: (oe2 = d(function* () {
    var e2;
    try {
      yield this.leave();
    } catch (e3) {
    }
    var t2 = this._iframe;
    if (t2) {
      var n3 = t2.parentElement;
      n3 && n3.removeChild(t2);
    }
    if (this._messageChannel.removeListener(this.handleMessageFromCallMachine), ma()) {
      var r3 = this.nativeUtils();
      r3.removeAudioFocusChangeListener(this.handleNativeAudioFocusChange), r3.removeAppStateChangeListener(this.handleNativeAppStateChange), r3.removeSystemScreenCaptureStopListener(this.handleNativeSystemScreenCaptureStop);
    }
    this._callObjectMode && this.stopListeningForDeviceChanges(), this.resetMeetingDependentVars(), this._destroyed = true, this.emitDailyJSEvent({ action: "call-instance-destroyed" }), delete Qs[this.callClientId], (null === (e2 = window) || void 0 === e2 || null === (e2 = e2._daily) || void 0 === e2 ? void 0 : e2.instances) && delete window._daily.instances[this.callClientId], this.strictMode && (this.callClientId = void 0);
  }), function() {
    return oe2.apply(this, arguments);
  }) }, { key: "isDestroyed", value: function() {
    return !!this._destroyed;
  } }, { key: "loadCss", value: function(e2) {
    var t2 = e2.bodyClass, n3 = e2.cssFile, r3 = e2.cssText;
    return kc(), this.sendMessageToCallMachine({ action: "load-css", cssFile: this.absoluteUrl(n3), bodyClass: t2, cssText: r3 }), this;
  } }, { key: "iframe", value: function() {
    return kc(), this._iframe;
  } }, { key: "meetingState", value: function() {
    return this._callState;
  } }, { key: "accessState", value: function() {
    return _c(this._callObjectMode, "accessState()"), this._accessState;
  } }, { key: "participants", value: function() {
    return this._participants;
  } }, { key: "participantCounts", value: function() {
    return this._participantCounts;
  } }, { key: "waitingParticipants", value: function() {
    return _c(this._callObjectMode, "waitingParticipants()"), this._waitingParticipants;
  } }, { key: "validateParticipantProperties", value: function(e2, t2) {
    for (var n3 in t2) {
      if (!dc[n3]) throw new Error("unrecognized updateParticipant property ".concat(n3));
      if (dc[n3].validate && !dc[n3].validate(t2[n3], this, this._participants[e2])) throw new Error(dc[n3].help);
    }
  } }, { key: "updateParticipant", value: function(e2, t2) {
    return this._participants.local && this._participants.local.session_id === e2 && (e2 = "local"), e2 && t2 && (this.validateParticipantProperties(e2, t2), this.sendMessageToCallMachine({ action: "update-participant", id: e2, properties: t2 })), this;
  } }, { key: "updateParticipants", value: function(e2) {
    var t2 = this._participants.local && this._participants.local.session_id;
    for (var n3 in e2) n3 === t2 && (n3 = "local"), n3 && e2[n3] && this.validateParticipantProperties(n3, e2[n3]);
    return this.sendMessageToCallMachine({ action: "update-participants", participants: e2 }), this;
  } }, { key: "updateWaitingParticipant", value: (ie2 = d(function* () {
    var e2 = this, n3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", r3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (_c(this._callObjectMode, "updateWaitingParticipant()"), vc(this._callState, "updateWaitingParticipant()"), "string" != typeof n3 || "object" !== t(r3)) throw new Error("updateWaitingParticipant() must take an id string and a updates object");
    return new Promise(function(t2, i2) {
      e2.sendMessageToCallMachine({ action: "daily-method-update-waiting-participant", id: n3, updates: r3 }, function(e3) {
        e3.error && i2(e3.error), e3.id || i2(new Error("unknown error in updateWaitingParticipant()")), t2({ id: e3.id });
      });
    });
  }), function() {
    return ie2.apply(this, arguments);
  }) }, { key: "updateWaitingParticipants", value: (re2 = d(function* () {
    var e2 = this, n3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (_c(this._callObjectMode, "updateWaitingParticipants()"), vc(this._callState, "updateWaitingParticipants()"), "object" !== t(n3)) throw new Error("updateWaitingParticipants() must take a mapping between ids and update objects");
    return new Promise(function(t2, r3) {
      e2.sendMessageToCallMachine({ action: "daily-method-update-waiting-participants", updatesById: n3 }, function(e3) {
        e3.error && r3(e3.error), e3.ids || r3(new Error("unknown error in updateWaitingParticipants()")), t2({ ids: e3.ids });
      });
    });
  }), function() {
    return re2.apply(this, arguments);
  }) }, { key: "requestAccess", value: (ne2 = d(function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, n3 = t2.access, r3 = void 0 === n3 ? { level: Ci } : n3, i2 = t2.name, o2 = void 0 === i2 ? "" : i2;
    return _c(this._callObjectMode, "requestAccess()"), vc(this._callState, "requestAccess()"), new Promise(function(t3, n4) {
      e2.sendMessageToCallMachine({ action: "daily-method-request-access", access: r3, name: o2 }, function(e3) {
        e3.error && n4(e3.error), e3.access || n4(new Error("unknown error in requestAccess()")), t3({ access: e3.access, granted: e3.granted });
      });
    });
  }), function() {
    return ne2.apply(this, arguments);
  }) }, { key: "localAudio", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.audio.state) : null;
  } }, { key: "localVideo", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.video.state) : null;
  } }, { key: "setLocalAudio", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return "forceDiscardTrack" in t2 && (ma() ? (console.warn("forceDiscardTrack option not supported in React Native; ignoring"), t2 = {}) : e2 && (console.warn("forceDiscardTrack option only supported when calling setLocalAudio(false); ignoring"), t2 = {})), this.sendMessageToCallMachine({ action: "local-audio", state: e2, options: t2 }), this;
  } }, { key: "localScreenAudio", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.screenAudio.state) : null;
  } }, { key: "localScreenVideo", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.screenVideo.state) : null;
  } }, { key: "updateScreenShare", value: function(e2) {
    if (this._isScreenSharing) return this.sendMessageToCallMachine({ action: "local-screen-update", options: e2 }), this;
    console.warn("There is no screen share in progress. Try calling startScreenShare first.");
  } }, { key: "setLocalVideo", value: function(e2) {
    return this.sendMessageToCallMachine({ action: "local-video", state: e2 }), this;
  } }, { key: "_setAllowLocalAudio", value: function(e2) {
    if (this._preloadCache.allowLocalAudio = e2, this._callMachineInitialized) return this.sendMessageToCallMachine({ action: "set-allow-local-audio", state: e2 }), this;
  } }, { key: "_setAllowLocalVideo", value: function(e2) {
    if (this._preloadCache.allowLocalVideo = e2, this._callMachineInitialized) return this.sendMessageToCallMachine({ action: "set-allow-local-video", state: e2 }), this;
  } }, { key: "getReceiveSettings", value: (te2 = d(function* (e2) {
    var n3 = this, r3 = (arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}).showInheritedValues, i2 = void 0 !== r3 && r3;
    if (_c(this._callObjectMode, "getReceiveSettings()"), !this._callMachineInitialized) return this._receiveSettings;
    switch (t(e2)) {
      case "string":
        return new Promise(function(t2) {
          n3.sendMessageToCallMachine({ action: "get-single-participant-receive-settings", id: e2, showInheritedValues: i2 }, function(e3) {
            t2(e3.receiveSettings);
          });
        });
      case "undefined":
        return this._receiveSettings;
      default:
        throw new Error('first argument to getReceiveSettings() must be a participant id (or "base"), or there should be no arguments');
    }
  }), function(e2) {
    return te2.apply(this, arguments);
  }) }, { key: "updateReceiveSettings", value: (ee2 = d(function* (e2) {
    var t2 = this;
    if (_c(this._callObjectMode, "updateReceiveSettings()"), void 0 !== (null == e2 ? void 0 : e2.initialReceiveBitrate)) throw new Error("initialReceiveBitrate can only be set in the receiveSettings config property, when joining");
    if (!Ec(e2, { allowAllParticipantsKey: true })) throw new Error(jc({ allowAllParticipantsKey: true }));
    return vc(this._callState, "updateReceiveSettings()", "To specify receive settings earlier, use the receiveSettings config property."), new Promise(function(n3) {
      t2.sendMessageToCallMachine({ action: "update-receive-settings", receiveSettings: e2 }, function(e3) {
        n3({ receiveSettings: e3.receiveSettings });
      });
    });
  }), function(e2) {
    return ee2.apply(this, arguments);
  }) }, { key: "_prepInputSettingsForSharing", value: function(e2, t2) {
    if (e2) {
      var n3 = {};
      if (e2.audio) {
        var r3, i2, o2;
        e2.audio.settings && (!Object.keys(e2.audio.settings).length && t2 || (n3.audio = { settings: zs({}, e2.audio.settings) })), t2 && null !== (r3 = n3.audio) && void 0 !== r3 && null !== (r3 = r3.settings) && void 0 !== r3 && r3.customTrack && (n3.audio.settings = { customTrack: this._sharedTracks.audioTrack });
        var a2 = "none" === (null === (i2 = e2.audio.processor) || void 0 === i2 ? void 0 : i2.type) && (null === (o2 = e2.audio.processor) || void 0 === o2 ? void 0 : o2._isDefaultWhenNone);
        if (e2.audio.processor && !a2) {
          var s3 = zs({}, e2.audio.processor);
          delete s3._isDefaultWhenNone, n3.audio = zs(zs({}, n3.audio), {}, { processor: s3 });
        }
      }
      if (e2.video) {
        var c2, l2, u3;
        e2.video.settings && (!Object.keys(e2.video.settings).length && t2 || (n3.video = { settings: zs({}, e2.video.settings) })), t2 && null !== (c2 = n3.video) && void 0 !== c2 && null !== (c2 = c2.settings) && void 0 !== c2 && c2.customTrack && (n3.video.settings = { customTrack: this._sharedTracks.videoTrack });
        var d2 = "none" === (null === (l2 = e2.video.processor) || void 0 === l2 ? void 0 : l2.type) && (null === (u3 = e2.video.processor) || void 0 === u3 ? void 0 : u3._isDefaultWhenNone);
        if (e2.video.processor && !d2) {
          var h2 = zs({}, e2.video.processor);
          delete h2._isDefaultWhenNone, n3.video = zs(zs({}, n3.video), {}, { processor: h2 });
        }
      }
      return n3;
    }
  } }, { key: "getInputSettings", value: function() {
    var e2 = this;
    return kc(), new Promise(function(t2) {
      t2(e2._getInputSettings());
    });
  } }, { key: "_getInputSettings", value: function() {
    var e2, t2, n3, r3, i2, o2, a2 = { processor: { type: "none", _isDefaultWhenNone: true } };
    this._inputSettings ? (e2 = (null === (n3 = this._inputSettings) || void 0 === n3 ? void 0 : n3.video) || a2, t2 = (null === (r3 = this._inputSettings) || void 0 === r3 ? void 0 : r3.audio) || a2) : (e2 = (null === (i2 = this._preloadCache) || void 0 === i2 || null === (i2 = i2.inputSettings) || void 0 === i2 ? void 0 : i2.video) || a2, t2 = (null === (o2 = this._preloadCache) || void 0 === o2 || null === (o2 = o2.inputSettings) || void 0 === o2 ? void 0 : o2.audio) || a2);
    var s3 = { audio: t2, video: e2 };
    return this._prepInputSettingsForSharing(s3, true);
  } }, { key: "_updatePreloadCacheInputSettings", value: function(e2, t2) {
    var n3 = this._inputSettings || {}, r3 = {};
    if (e2.video) {
      var i2, o2, a2;
      if (r3.video = {}, e2.video.settings) r3.video.settings = {}, t2 || e2.video.settings.customTrack || null === (a2 = n3.video) || void 0 === a2 || !a2.settings ? r3.video.settings = e2.video.settings : r3.video.settings = zs(zs({}, n3.video.settings), e2.video.settings), Object.keys(r3.video.settings).length || delete r3.video.settings;
      else null !== (i2 = n3.video) && void 0 !== i2 && i2.settings && (r3.video.settings = n3.video.settings);
      e2.video.processor ? r3.video.processor = e2.video.processor : null !== (o2 = n3.video) && void 0 !== o2 && o2.processor && (r3.video.processor = n3.video.processor);
    } else n3.video && (r3.video = n3.video);
    if (e2.audio) {
      var s3, c2, l2;
      if (r3.audio = {}, e2.audio.settings) r3.audio.settings = {}, t2 || e2.audio.settings.customTrack || null === (l2 = n3.audio) || void 0 === l2 || !l2.settings ? r3.audio.settings = e2.audio.settings : r3.audio.settings = zs(zs({}, n3.audio.settings), e2.audio.settings), Object.keys(r3.audio.settings).length || delete r3.audio.settings;
      else null !== (s3 = n3.audio) && void 0 !== s3 && s3.settings && (r3.audio.settings = n3.audio.settings);
      e2.audio.processor ? r3.audio.processor = e2.audio.processor : null !== (c2 = n3.audio) && void 0 !== c2 && c2.processor && (r3.audio.processor = n3.audio.processor);
    } else n3.audio && (r3.audio = n3.audio);
    this._maybeUpdateInputSettings(r3);
  } }, { key: "_devicesFromInputSettings", value: function(e2) {
    var t2, n3, r3 = (null == e2 || null === (t2 = e2.video) || void 0 === t2 || null === (t2 = t2.settings) || void 0 === t2 ? void 0 : t2.deviceId) || null, i2 = (null == e2 || null === (n3 = e2.audio) || void 0 === n3 || null === (n3 = n3.settings) || void 0 === n3 ? void 0 : n3.deviceId) || null, o2 = this._preloadCache.outputDeviceId || null;
    return { camera: r3 ? { deviceId: r3 } : {}, mic: i2 ? { deviceId: i2 } : {}, speaker: o2 ? { deviceId: o2 } : {} };
  } }, { key: "updateInputSettings", value: (Z2 = d(function* (e2) {
    var t2 = this;
    return kc(), Cc(e2) ? e2.video || e2.audio ? (Tc(e2, this.properties.dailyConfig, this._sharedTracks), this._callObjectMode && !this._callMachineInitialized ? (this._updatePreloadCacheInputSettings(e2, true), this._getInputSettings()) : new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine({ action: "update-input-settings", inputSettings: e2 }, function(i2) {
        if (i2.error) r3(i2.error);
        else {
          if (i2.returnPreloadCache) return t2._updatePreloadCacheInputSettings(e2, true), void n3(t2._getInputSettings());
          t2._maybeUpdateInputSettings(i2.inputSettings), n3(t2._prepInputSettingsForSharing(i2.inputSettings, true));
        }
      });
    })) : this._getInputSettings() : (console.error(xc()), Promise.reject(xc()));
  }), function(e2) {
    return Z2.apply(this, arguments);
  }) }, { key: "setBandwidth", value: function(e2) {
    var t2 = e2.kbs, n3 = e2.trackConstraints;
    if (kc(), this._callMachineInitialized) return this.sendMessageToCallMachine({ action: "set-bandwidth", kbs: t2, trackConstraints: n3 }), this;
  } }, { key: "getDailyLang", value: function() {
    var e2 = this;
    if (kc(), this._callMachineInitialized) return new Promise(function(t2) {
      e2.sendMessageToCallMachine({ action: "get-daily-lang" }, function(e3) {
        delete e3.action, delete e3.callbackStamp, t2(e3);
      });
    });
  } }, { key: "setDailyLang", value: function(e2) {
    return kc(), this.sendMessageToCallMachine({ action: "set-daily-lang", lang: e2 }), this;
  } }, { key: "setProxyUrl", value: function(e2) {
    return this.sendMessageToCallMachine({ action: "set-proxy-url", proxyUrl: e2 }), this;
  } }, { key: "setIceConfig", value: function(e2) {
    return this.sendMessageToCallMachine({ action: "set-ice-config", iceConfig: e2 }), this;
  } }, { key: "meetingSessionSummary", value: function() {
    return [mi, yi].includes(this._callState) ? this._finalSummaryOfPrevSession : this._meetingSessionSummary;
  } }, { key: "getMeetingSession", value: (X2 = d(function* () {
    var e2 = this;
    return console.warn("getMeetingSession() is deprecated: use meetingSessionSummary(), which will return immediately"), vc(this._callState, "getMeetingSession()"), new Promise(function(t2) {
      e2.sendMessageToCallMachine({ action: "get-meeting-session" }, function(e3) {
        delete e3.action, delete e3.callbackStamp, t2(e3);
      });
    });
  }), function() {
    return X2.apply(this, arguments);
  }) }, { key: "meetingSessionState", value: function() {
    return vc(this._callState, "meetingSessionState"), this._meetingSessionState;
  } }, { key: "setMeetingSessionData", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "replace";
    _c(this._callObjectMode, "setMeetingSessionData()"), vc(this._callState, "setMeetingSessionData");
    try {
      !(function(e3, t3) {
        new Ha({ data: e3, mergeStrategy: t3 });
      })(e2, t2);
    } catch (e3) {
      throw console.error(e3), e3;
    }
    try {
      this.sendMessageToCallMachine({ action: "set-session-data", data: e2, mergeStrategy: t2 });
    } catch (e3) {
      throw new Error("Error setting meeting session data: ".concat(e3));
    }
  } }, { key: "setUserName", value: function(e2, t2) {
    var n3 = this;
    return this.properties.userName = e2, new Promise(function(r3) {
      n3.sendMessageToCallMachine({ action: "set-user-name", name: null != e2 ? e2 : "", thisMeetingOnly: ma() || !!t2 && !!t2.thisMeetingOnly }, function(e3) {
        delete e3.action, delete e3.callbackStamp, r3(e3);
      });
    });
  } }, { key: "setUserData", value: (K2 = d(function* (e2) {
    var t2 = this;
    try {
      Mc(e2);
    } catch (e3) {
      throw console.error(e3), e3;
    }
    if (this.properties.userData = e2, this._callMachineInitialized) return new Promise(function(n3) {
      try {
        t2.sendMessageToCallMachine({ action: "set-user-data", userData: e2 }, function(e3) {
          delete e3.action, delete e3.callbackStamp, n3(e3);
        });
      } catch (e3) {
        throw new Error("Error setting user data: ".concat(e3));
      }
    });
  }), function(e2) {
    return K2.apply(this, arguments);
  }) }, { key: "validateAudioLevelInterval", value: function(e2) {
    if (e2 && (e2 < 100 || "number" != typeof e2)) throw new Error("The interval must be a number greater than or equal to 100 milliseconds.");
  } }, { key: "startLocalAudioLevelObserver", value: function(e2) {
    var t2 = this;
    if ("undefined" == typeof AudioWorkletNode && !ma()) throw new Error("startLocalAudioLevelObserver() is not supported on this browser");
    if (this.validateAudioLevelInterval(e2), this._callMachineInitialized) return this._isLocalAudioLevelObserverRunning = true, new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine({ action: "start-local-audio-level-observer", interval: e2 }, function(e3) {
        t2._isLocalAudioLevelObserverRunning = !e3.error, e3.error ? r3({ error: e3.error }) : n3();
      });
    });
    this._preloadCache.localAudioLevelObserver = { enabled: true, interval: e2 };
  } }, { key: "isLocalAudioLevelObserverRunning", value: function() {
    return this._isLocalAudioLevelObserverRunning;
  } }, { key: "stopLocalAudioLevelObserver", value: function() {
    this._preloadCache.localAudioLevelObserver = null, this._localAudioLevel = 0, this._isLocalAudioLevelObserverRunning = false, this.sendMessageToCallMachine({ action: "stop-local-audio-level-observer" });
  } }, { key: "startRemoteParticipantsAudioLevelObserver", value: function(e2) {
    var t2 = this;
    if (this.validateAudioLevelInterval(e2), this._callMachineInitialized) return this._isRemoteParticipantsAudioLevelObserverRunning = true, new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine({ action: "start-remote-participants-audio-level-observer", interval: e2 }, function(e3) {
        t2._isRemoteParticipantsAudioLevelObserverRunning = !e3.error, e3.error ? r3({ error: e3.error }) : n3();
      });
    });
    this._preloadCache.remoteParticipantsAudioLevelObserver = { enabled: true, interval: e2 };
  } }, { key: "isRemoteParticipantsAudioLevelObserverRunning", value: function() {
    return this._isRemoteParticipantsAudioLevelObserverRunning;
  } }, { key: "stopRemoteParticipantsAudioLevelObserver", value: function() {
    this._preloadCache.remoteParticipantsAudioLevelObserver = null, this._remoteParticipantsAudioLevel = {}, this._isRemoteParticipantsAudioLevelObserverRunning = false, this.sendMessageToCallMachine({ action: "stop-remote-participants-audio-level-observer" });
  } }, { key: "startCamera", value: (Q2 = d(function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (_c(this._callObjectMode, "startCamera()"), mc(this._callState, this._isPreparingToJoin, "startCamera()", "Did you mean to use setLocalAudio() and/or setLocalVideo() instead?"), this.needsLoad()) try {
      yield this.load(t2);
    } catch (e3) {
      return Promise.reject(e3);
    }
    else {
      if (this._didPreAuth) {
        if (t2.url && t2.url !== this.properties.url) return console.error("url in startCamera() is different than the one used in preAuth()"), Promise.reject();
        if (t2.token && t2.token !== this.properties.token) return console.error("token in startCamera() is different than the one used in preAuth()"), Promise.reject();
      }
      this.validateProperties(t2), this.properties = zs(zs({}, this.properties), t2);
    }
    return new Promise(function(t3, n3) {
      e2._preloadCache.inputSettings = e2._prepInputSettingsForSharing(e2._inputSettings, false), e2.sendMessageToCallMachine({ action: "start-camera", properties: fc(e2.properties, e2.callClientId), preloadCache: fc(e2._preloadCache, e2.callClientId) }, function(e3) {
        e3.error ? n3(e3.error) : t3({ camera: e3.camera, mic: e3.mic, speaker: e3.speaker });
      });
    });
  }), function() {
    return Q2.apply(this, arguments);
  }) }, { key: "validateCustomTrack", value: function(e2, t2, n3) {
    if (n3 && n3.length > 50) throw new Error("Custom track `trackName` must not be more than 50 characters");
    if (t2 && "music" !== t2 && "speech" !== t2 && !(t2 instanceof Object)) throw new Error("Custom track `mode` must be either `music` | `speech` | `DailyMicAudioModeSettings` or `undefined`");
    if (!!n3 && ["audio", "video", "cam-audio", "cam-video", "screenVideo", "screenAudio", "screen-video", "screen-audio", "rmpAudio", "rmpVideo", "customVideoDefaults"].includes(n3)) throw new Error("Custom track `trackName` must not match a track name already used by daily: audio, video, cam-audio, cam-video, screenVideo, screenAudio, screen-video, screen-audio, rmpAudio, rmpVideo, customVideoDefaults");
    if (!(e2 instanceof MediaStreamTrack)) throw new Error("Custom tracks provided must be instances of MediaStreamTrack");
  } }, { key: "startCustomTrack", value: function() {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { track, mode, trackName, ignoreAudioLevel };
    return kc(), _c(this._callObjectMode, "startCustomTrack()"), vc(this._callState, "startCustomTrack()"), this.validateCustomTrack(t2.track, t2.mode, t2.trackName), new Promise(function(n3, r3) {
      e2._sharedTracks.customTrack = t2.track, t2.track = aa, e2.sendMessageToCallMachine({ action: "start-custom-track", properties: t2 }, function(e3) {
        e3.error ? r3({ error: e3.error }) : n3(e3.mediaTag);
      });
    });
  } }, { key: "stopCustomTrack", value: function(e2) {
    var t2 = this;
    return kc(), vc(this._callState, "stopCustomTrack()"), new Promise(function(n3) {
      t2.sendMessageToCallMachine({ action: "stop-custom-track", mediaTag: e2 }, function(e3) {
        n3(e3.mediaTag);
      });
    });
  } }, { key: "setCamera", value: function(e2) {
    var t2 = this;
    return Sc(), yc(this._callMachineInitialized, "setCamera()"), new Promise(function(n3) {
      t2.sendMessageToCallMachine({ action: "set-camera", cameraDeviceId: e2 }, function(e3) {
        n3({ device: e3.device });
      });
    });
  } }, { key: "setAudioDevice", value: (H2 = d(function* (e2) {
    return Sc(), this.nativeUtils().setAudioDevice(e2), { deviceId: yield this.nativeUtils().getAudioDevice() };
  }), function(e2) {
    return H2.apply(this, arguments);
  }) }, { key: "cycleCamera", value: function() {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return new Promise(function(n3) {
      e2.sendMessageToCallMachine({ action: "cycle-camera", properties: t2 }, function(e3) {
        n3({ device: e3.device });
      });
    });
  } }, { key: "cycleMic", value: function() {
    var e2 = this;
    return kc(), new Promise(function(t2) {
      e2.sendMessageToCallMachine({ action: "cycle-mic" }, function(e3) {
        t2({ device: e3.device });
      });
    });
  } }, { key: "getCameraFacingMode", value: function() {
    var e2 = this;
    return Sc(), new Promise(function(t2) {
      e2.sendMessageToCallMachine({ action: "get-camera-facing-mode" }, function(e3) {
        t2(e3.facingMode);
      });
    });
  } }, { key: "setInputDevicesAsync", value: (W2 = d(function* (e2) {
    var t2 = this, n3 = e2.audioDeviceId, r3 = e2.videoDeviceId, i2 = e2.audioSource, o2 = e2.videoSource;
    if (kc(), void 0 !== i2 && (n3 = i2), void 0 !== o2 && (r3 = o2), "boolean" == typeof n3 && (this._setAllowLocalAudio(n3), n3 = void 0), "boolean" == typeof r3 && (this._setAllowLocalVideo(r3), r3 = void 0), !n3 && !r3) return yield this.getInputDevices();
    var a2 = {};
    return n3 && (n3 instanceof MediaStreamTrack ? (this._sharedTracks.audioTrack = n3, n3 = aa, a2.audio = { settings: { customTrack: n3 } }) : (delete this._sharedTracks.audioTrack, a2.audio = { settings: { deviceId: n3 } })), r3 && (r3 instanceof MediaStreamTrack ? (this._sharedTracks.videoTrack = r3, r3 = aa, a2.video = { settings: { customTrack: r3 } }) : (delete this._sharedTracks.videoTrack, a2.video = { settings: { deviceId: r3 } })), this._callObjectMode && this.needsLoad() ? (this._updatePreloadCacheInputSettings(a2, false), this._devicesFromInputSettings(this._inputSettings)) : new Promise(function(e3) {
      t2.sendMessageToCallMachine({ action: "set-input-devices", audioDeviceId: n3, videoDeviceId: r3 }, function(n4) {
        if (delete n4.action, delete n4.callbackStamp, n4.returnPreloadCache) return t2._updatePreloadCacheInputSettings(a2, false), void e3(t2._devicesFromInputSettings(t2._inputSettings));
        e3(n4);
      });
    });
  }), function(e2) {
    return W2.apply(this, arguments);
  }) }, { key: "setOutputDeviceAsync", value: (V2 = d(function* (e2) {
    var t2 = this, n3 = e2.outputDeviceId;
    if (kc(), !n3 || "string" != typeof n3) throw new Error("outputDeviceId must be provided and must be a valid device id");
    return this._preloadCache.outputDeviceId = n3, this._callObjectMode && this.needsLoad() ? this._devicesFromInputSettings(this._inputSettings) : new Promise(function(e3, r3) {
      t2.sendMessageToCallMachine({ action: "set-output-device", outputDeviceId: n3 }, function(n4) {
        if (delete n4.action, delete n4.callbackStamp, n4.error) {
          var i2 = new Error(n4.error.message);
          return i2.type = n4.error.type, void r3(i2);
        }
        n4.returnPreloadCache ? e3(t2._devicesFromInputSettings(t2._inputSettings)) : e3(n4);
      });
    });
  }), function(e2) {
    return V2.apply(this, arguments);
  }) }, { key: "getInputDevices", value: (U2 = d(function* () {
    var e2 = this;
    return this._callObjectMode && this.needsLoad() ? this._devicesFromInputSettings(this._inputSettings) : new Promise(function(t2) {
      e2.sendMessageToCallMachine({ action: "get-input-devices" }, function(n3) {
        n3.returnPreloadCache ? t2(e2._devicesFromInputSettings(e2._inputSettings)) : t2({ camera: n3.camera, mic: n3.mic, speaker: n3.speaker });
      });
    });
  }), function() {
    return U2.apply(this, arguments);
  }) }, { key: "nativeInCallAudioMode", value: function() {
    return Sc(), this._nativeInCallAudioMode;
  } }, { key: "setNativeInCallAudioMode", value: function(e2) {
    if (Sc(), [Ys, Ks].includes(e2)) {
      if (e2 !== this._nativeInCallAudioMode) return this._nativeInCallAudioMode = e2, !this.disableReactNativeAutoDeviceManagement("audio") && gc(this._callState, this._isPreparingToJoin) && this.nativeUtils().setAudioMode(this._nativeInCallAudioMode), this;
    } else console.error("invalid in-call audio mode specified: ", e2);
  } }, { key: "preAuth", value: (R2 = d(function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (_c(this._callObjectMode, "preAuth()"), mc(this._callState, this._isPreparingToJoin, "preAuth()"), this.needsLoad() && (yield this.load(t2)), !t2.url) throw new Error("preAuth() requires at least a url to be provided");
    return this.validateProperties(t2), this.properties = zs(zs({}, this.properties), t2), new Promise(function(t3, n3) {
      e2._preloadCache.inputSettings = e2._prepInputSettingsForSharing(e2._inputSettings, false), e2.sendMessageToCallMachine({ action: "daily-method-preauth", properties: fc(e2.properties, e2.callClientId), preloadCache: fc(e2._preloadCache, e2.callClientId) }, function(r3) {
        return r3.error ? n3(r3.error) : r3.access ? (e2._didPreAuth = true, void t3({ access: r3.access })) : n3(new Error("unknown error in preAuth()"));
      });
    });
  }), function() {
    return R2.apply(this, arguments);
  }) }, { key: "load", value: (F2 = d(function* (e2) {
    var t2 = this;
    if (this.needsLoad()) {
      if (this._destroyed && (this._logUseAfterDestroy(), this.strictMode)) throw new Error("Use after destroy");
      if (e2 && (this.validateProperties(e2), this.properties = zs(zs({}, this.properties), e2)), !this._callObjectMode && !this.properties.url) throw new Error("can't load iframe meeting because url property isn't set");
      if (this._updateCallState(pi), this.emitDailyJSEvent({ action: Xi }), this._callObjectMode) return new Promise(function(e3, n4) {
        t2._callObjectLoader.cancel();
        var r3 = Date.now();
        t2._callObjectLoader.load(t2.properties.dailyConfig, function(n5) {
          t2._bundleLoadTime = n5 ? "no-op" : Date.now() - r3, t2._updateCallState(fi), n5 && t2.emitDailyJSEvent({ action: eo }), e3();
        }, function(e4, r4) {
          t2.emitDailyJSEvent({ action: Zi }), r4 || (t2._handleFatalError({ action: Zo, errorMsg: e4.msg, error: { type: "connection-error", msg: "Failed to load call object bundle.", details: { on: "load", sourceError: e4, bundleUrl: G(t2.properties.dailyConfig) } } }), n4(e4.msg));
        });
      });
      var n3 = Y(this.assembleMeetingUrl(), this.properties.dailyConfig);
      return new Promise(function(e3, r3) {
        var i2 = 0, o2 = function() {
          if (i2 >= n3.length) {
            var a2 = "Timed out attempting to load the call. Please check your network connection and try again.";
            return t2._iframe.srcdoc = (s3 = a2, '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\n  html { font-size: 12px; }\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  body {\n    background: #1f2d3d;\n    color: #fff;\n    font-family: GraphikRegular, "Helvetica Neue", Helvetica, Arial, sans-serif;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    height: 100vh;\n  }\n  .card {\n    background: #121a24;\n    border: 1px solid #2b3f56;\n    border-radius: 4px;\n    padding: 32px 40px;\n    width: 100%;\n    max-width: 65ch;\n    text-align: center;\n  }\n  h1 { color: #f63135; font-size: 1.333rem; font-weight: 600; margin-bottom: 12px; }\n  p { font-size: 1rem; line-height: 1.5; color: rgba(255,255,255,0.9); }\n</style>\n</head>\n<body>\n<div class="card"><h1>'.concat("Failed to load", "</h1><p>").concat(s3, "</p></div>\n</body>\n</html>")), t2._handleFatalError({ action: Zo, errorMsg: a2, error: { type: "connection-error", msg: a2, details: { on: "load", sourceError: { msg: "Timed out (>".concat(25e3, " ms) when loading call frame"), type: "timeout" }, candidateCount: n3.length } }, preserveIframe: true }), void r3(a2);
          }
          var s3, c2 = n3[i2++];
          t2._iframe.src = z(c2, t2.properties.dailyConfig);
          var l2 = setTimeout(function() {
            t2._loadedCallback && (t2._loadedCallback = null, o2());
          }, 25e3);
          t2._loadedCallback = function(n4) {
            clearTimeout(l2), t2._callState !== yi ? ($(q(c2)), t2._updateCallState(fi), (t2.properties.cssFile || t2.properties.cssText) && t2.loadCss(t2.properties), e3()) : r3(n4);
          };
        };
        o2();
      });
    }
  }), function(e2) {
    return F2.apply(this, arguments);
  }) }, { key: "join", value: (D2 = d(function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (this._testCallInProgress && this.stopTestCallQuality(), !t2.url && !this.properties.url) {
      var n3 = "No room URL has been provided";
      return console.error(n3), Promise.reject(new Error(n3));
    }
    var r3 = false;
    if (this.needsLoad()) {
      this.updateIsPreparingToJoin(true);
      try {
        yield this.load(t2);
      } catch (e3) {
        return this.updateIsPreparingToJoin(false), Promise.reject(e3);
      }
    } else {
      if (r3 = !(!this.properties.cssFile && !this.properties.cssText), this._didPreAuth) {
        if (t2.url && t2.url !== this.properties.url) return console.error("url in join() is different than the one used in preAuth()"), this.updateIsPreparingToJoin(false), Promise.reject();
        if (t2.token && t2.token !== this.properties.token) return console.error("token in join() is different than the one used in preAuth()"), this.updateIsPreparingToJoin(false), Promise.reject();
      }
      if (t2.url && !this._callObjectMode && t2.url && t2.url !== this.properties.url) return console.error("url in join() is different than the one used in load() (".concat(this.properties.url, " -> ").concat(t2.url, ")")), this.updateIsPreparingToJoin(false), Promise.reject();
      this.validateProperties(t2), this.properties = zs(zs({}, this.properties), t2);
    }
    return void 0 !== t2.showLocalVideo && (this._callObjectMode ? console.error("showLocalVideo is not available in callObject mode") : this._showLocalVideo = !!t2.showLocalVideo), void 0 !== t2.showParticipantsBar && (this._callObjectMode ? console.error("showParticipantsBar is not available in callObject mode") : this._showParticipantsBar = !!t2.showParticipantsBar), this._callState === gi || this._callState === vi ? (console.warn("already joined meeting, call leave() before joining again"), void this.updateIsPreparingToJoin(false)) : (this._updateCallState(vi, false), this.emitDailyJSEvent({ action: ro }), this._preloadCache.inputSettings = this._prepInputSettingsForSharing(this._inputSettings || {}, false), this.sendMessageToCallMachine({ action: "join-meeting", properties: fc(this.properties, this.callClientId), preloadCache: fc(this._preloadCache, this.callClientId) }, function(t3) {
      t3.error && e2._joinedCallback && (e2._joinedCallback(null, t3.error), e2._joinedCallback = null);
    }), new Promise(function(t3, n4) {
      e2._joinedCallback = function(i2, o2) {
        if (e2._callState !== yi) {
          if (o2) return e2._updateCallState(mi), void n4(o2);
          if (e2._updateCallState(gi), i2) for (var a2 in i2) {
            if (e2._callObjectMode) {
              var s3 = e2._callMachine().store;
              hs(i2[a2], s3), ps(i2[a2], s3), vs(i2[a2], e2._participants[a2], s3);
            }
            e2._participants[a2] = zs({}, i2[a2]), e2.toggleParticipantAudioBasedOnNativeAudioFocus();
          }
          r3 && e2.loadCss(e2.properties), t3(i2);
        } else n4(o2);
      };
    }));
  }), function() {
    return D2.apply(this, arguments);
  }) }, { key: "leave", value: (L2 = d(function* () {
    var e2 = this;
    return this._testCallInProgress && this.stopTestCallQuality(), new Promise(function(t2) {
      e2._callState === mi || e2._callState === yi ? t2() : e2._callObjectLoader && !e2._callObjectLoader.loaded ? (e2._callObjectLoader.cancel(), e2._updateCallState(mi), e2.resetMeetingDependentVars(), e2.emitDailyJSEvent({ action: mi }), t2()) : (e2._resolveLeave = t2, e2.sendMessageToCallMachine({ action: "leave-meeting" }));
    });
  }), function() {
    return L2.apply(this, arguments);
  }) }, { key: "startScreenShare", value: (I2 = d(function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (t2.mediaStream && _c(this._callObjectMode, "startScreenShare() with `mediaStream`"), yc(this._callMachineInitialized, "startScreenShare()"), t2.screenVideoSendSettings && this._validateVideoSendSettings("screenVideo", t2.screenVideoSendSettings), t2.mediaStream && (this._sharedTracks.screenMediaStream = t2.mediaStream, t2.mediaStream = aa), "undefined" != typeof DailyNativeUtils && void 0 !== DailyNativeUtils.isIOS && DailyNativeUtils.isIOS) {
      var n3 = this.nativeUtils();
      if (yield n3.isScreenBeingCaptured()) return void this.emitDailyJSEvent({ action: Xo, type: "screen-share-error", errorMsg: "Could not start the screen sharing. The screen is already been captured!" });
      n3.setSystemScreenCaptureStartCallback(function() {
        n3.setSystemScreenCaptureStartCallback(null), e2.sendMessageToCallMachine({ action: ra, captureOptions: t2 });
      }), n3.presentSystemScreenCapturePrompt();
    } else this.sendMessageToCallMachine({ action: ra, captureOptions: t2 });
  }), function() {
    return I2.apply(this, arguments);
  }) }, { key: "stopScreenShare", value: function() {
    yc(this._callMachineInitialized, "stopScreenShare()"), this.sendMessageToCallMachine({ action: "local-screen-stop" });
  } }, { key: "startRecording", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t2 = e2.type;
    if (t2 && "cloud" !== t2 && "cloud-audio-only" !== t2 && "raw-tracks" !== t2 && "local" !== t2) throw new Error("invalid type: ".concat(t2, ", allowed values 'cloud', 'cloud-audio-only', 'raw-tracks', or 'local'"));
    this.sendMessageToCallMachine(zs({ action: "local-recording-start" }, e2));
  } }, { key: "updateRecording", value: function(e2) {
    var t2 = e2.layout, n3 = void 0 === t2 ? { preset: "default" } : t2, r3 = e2.instanceId;
    this.sendMessageToCallMachine({ action: "daily-method-update-recording", layout: n3, instanceId: r3 });
  } }, { key: "stopRecording", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.sendMessageToCallMachine(zs({ action: "local-recording-stop" }, e2));
  } }, { key: "startLiveStreaming", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.sendMessageToCallMachine(zs({ action: "daily-method-start-live-streaming" }, e2));
  } }, { key: "updateLiveStreaming", value: function(e2) {
    var t2 = e2.layout, n3 = void 0 === t2 ? { preset: "default" } : t2, r3 = e2.instanceId;
    this.sendMessageToCallMachine({ action: "daily-method-update-live-streaming", layout: n3, instanceId: r3 });
  } }, { key: "addLiveStreamingEndpoints", value: function(e2) {
    var t2 = e2.endpoints, n3 = e2.instanceId;
    this.sendMessageToCallMachine({ action: ia, endpointsOp: pa, endpoints: t2, instanceId: n3 });
  } }, { key: "removeLiveStreamingEndpoints", value: function(e2) {
    var t2 = e2.endpoints, n3 = e2.instanceId;
    this.sendMessageToCallMachine({ action: ia, endpointsOp: fa, endpoints: t2, instanceId: n3 });
  } }, { key: "stopLiveStreaming", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.sendMessageToCallMachine(zs({ action: "daily-method-stop-live-streaming" }, e2));
  } }, { key: "validateDailyConfig", value: function(e2) {
    e2.camSimulcastEncodings && (console.warn("camSimulcastEncodings is deprecated. Use sendSettings, found in DailyCallOptions, to provide camera simulcast settings."), this.validateSimulcastEncodings(e2.camSimulcastEncodings)), e2.screenSimulcastEncodings && console.warn("screenSimulcastEncodings is deprecated. Use sendSettings, found in DailyCallOptions, to provide screen simulcast settings."), Oa() && e2.noAutoDefaultDeviceChange && console.warn("noAutoDefaultDeviceChange is not supported on Android, and will be ignored.");
  } }, { key: "validateSimulcastEncodings", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, n3 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
    if (e2) {
      if (!(e2 instanceof Array || Array.isArray(e2))) throw new Error("encodings must be an Array");
      if (!Rc(e2.length, 1, 3)) throw new Error("encodings must be an Array with between 1 to ".concat(3, " layers"));
      for (var r3 = 0; r3 < e2.length; r3++) {
        var i2 = e2[r3];
        for (var o2 in this._validateEncodingLayerHasValidProperties(i2), i2) if (rc.includes(o2)) {
          if ("number" != typeof i2[o2]) throw new Error("".concat(o2, " must be a number"));
          if (t2) {
            var a2 = t2[o2], s3 = a2.min, c2 = a2.max;
            if (!Rc(i2[o2], s3, c2)) throw new Error("".concat(o2, " value not in range. valid range: ").concat(s3, " to ").concat(c2));
          }
        } else if (!["active", "scalabilityMode"].includes(o2)) throw new Error("Invalid key ".concat(o2, ", valid keys are:") + Object.values(rc));
        if (n3 && !i2.hasOwnProperty("maxBitrate")) throw new Error("maxBitrate is not specified");
      }
    }
  } }, { key: "startRemoteMediaPlayer", value: (j2 = d(function* (e2) {
    var t2 = this, n3 = e2.url, r3 = e2.settings, i2 = void 0 === r3 ? { state: la.PLAY } : r3;
    try {
      !(function(e3) {
        if ("string" != typeof e3) throw new Error('url parameter must be "string" type');
      })(n3), Bc(i2), (function(e3) {
        for (var t3 in e3) if (!ic.includes(t3)) throw new Error("Invalid key ".concat(t3, ", valid keys are: ").concat(ic));
        e3.simulcastEncodings && this.validateSimulcastEncodings(e3.simulcastEncodings, nc, true);
      })(i2);
    } catch (e3) {
      throw console.error("invalid argument Error: ".concat(e3)), console.error('startRemoteMediaPlayer arguments must be of the form:\n  { url: "playback url",\n  settings?:\n  {state: "play"|"pause", simulcastEncodings?: [{}] } }'), e3;
    }
    return new Promise(function(e3, r4) {
      t2.sendMessageToCallMachine({ action: "daily-method-start-remote-media-player", url: n3, settings: i2 }, function(t3) {
        t3.error ? r4({ error: t3.error, errorMsg: t3.errorMsg }) : e3({ session_id: t3.session_id, remoteMediaPlayerState: { state: t3.state, settings: t3.settings } });
      });
    });
  }), function(e2) {
    return j2.apply(this, arguments);
  }) }, { key: "stopRemoteMediaPlayer", value: (x2 = d(function* (e2) {
    var t2 = this;
    if ("string" != typeof e2) throw new Error(" remotePlayerID must be of type string");
    return new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine({ action: "daily-method-stop-remote-media-player", session_id: e2 }, function(e3) {
        e3.error ? r3({ error: e3.error, errorMsg: e3.errorMsg }) : n3();
      });
    });
  }), function(e2) {
    return x2.apply(this, arguments);
  }) }, { key: "updateRemoteMediaPlayer", value: (A2 = d(function* (e2) {
    var t2 = this, n3 = e2.session_id, r3 = e2.settings;
    try {
      Bc(r3);
    } catch (e3) {
      throw console.error("invalid argument Error: ".concat(e3)), console.error('updateRemoteMediaPlayer arguments must be of the form:\n  session_id: "participant session",\n  { settings?: {state: "play"|"pause"} }'), e3;
    }
    return new Promise(function(e3, i2) {
      t2.sendMessageToCallMachine({ action: "daily-method-update-remote-media-player", session_id: n3, settings: r3 }, function(t3) {
        t3.error ? i2({ error: t3.error, errorMsg: t3.errorMsg }) : e3({ session_id: t3.session_id, remoteMediaPlayerState: { state: t3.state, settings: t3.settings } });
      });
    });
  }), function(e2) {
    return A2.apply(this, arguments);
  }) }, { key: "startTranscription", value: function(e2) {
    vc(this._callState, "startTranscription()"), this.sendMessageToCallMachine(zs({ action: "daily-method-start-transcription" }, e2));
  } }, { key: "updateTranscription", value: function(e2) {
    if (vc(this._callState, "updateTranscription()"), !e2) throw new Error("updateTranscription Error: options is mandatory");
    if ("object" !== t(e2)) throw new Error("updateTranscription Error: options must be object type");
    if (e2.participants && !Array.isArray(e2.participants)) throw new Error("updateTranscription Error: participants must be an array");
    this.sendMessageToCallMachine(zs({ action: "daily-method-update-transcription" }, e2));
  } }, { key: "stopTranscription", value: function(e2) {
    if (vc(this._callState, "stopTranscription()"), e2 && "object" !== t(e2)) throw new Error("stopTranscription Error: options must be object type");
    if (e2 && !e2.instanceId) throw new Error('"instanceId" not provided');
    this.sendMessageToCallMachine(zs({ action: "daily-method-stop-transcription" }, e2));
  } }, { key: "startDialOut", value: (P2 = d(function* (e2) {
    var n3 = this;
    vc(this._callState, "startDialOut()");
    var r3 = function(e3) {
      if (e3) {
        if (!Array.isArray(e3)) throw new Error("Error starting dial out: audio codec must be an array");
        if (e3.length <= 0) throw new Error("Error starting dial out: audio codec array specified but empty");
        e3.forEach(function(e4) {
          if ("string" != typeof e4) throw new Error("Error starting dial out: audio codec must be a string");
          if ("OPUS" !== e4 && "PCMU" !== e4 && "PCMA" !== e4 && "G722" !== e4) throw new Error("Error starting dial out: audio codec must be one of OPUS, PCMU, PCMA, G722");
        });
      }
    };
    if (!e2.sipUri && !e2.phoneNumber) throw new Error("Error starting dial out: either a sip uri or phone number must be provided");
    if (e2.sipUri && e2.phoneNumber) throw new Error("Error starting dial out: only one of sip uri or phone number must be provided");
    if (e2.sipUri) {
      if ("string" != typeof e2.sipUri) throw new Error("Error starting dial out: sipUri must be a string");
      if (!e2.sipUri.startsWith("sip:")) throw new Error("Error starting dial out: Invalid SIP URI, must start with 'sip:'");
      if (e2.video && "boolean" != typeof e2.video) throw new Error("Error starting dial out: video must be a boolean value");
      if (void 0 !== e2.videoSettings) {
        if ("object" !== t(e2.videoSettings) || null === e2.videoSettings) throw new Error("Error starting dial out: videoSettings must be an object");
        if (!e2.video) throw new Error("Error starting dial out: videoSettings provided but video is not enabled");
        var i2 = e2.videoSettings;
        if (void 0 !== i2.width) {
          if (!Number.isInteger(i2.width) || i2.width <= 0) throw new Error("Error starting dial out: videoSettings.width must be a positive integer");
          if (i2.width > 1280) throw new Error("Error starting dial out: videoSettings.width must be less than or equal to 1280");
        }
        if (void 0 !== i2.height) {
          if (!Number.isInteger(i2.height) || i2.height <= 0) throw new Error("Error starting dial out: videoSettings.height must be a positive integer");
          if (i2.height > 720) throw new Error("Error starting dial out: videoSettings.height must be less than or equal to 720");
        }
        if (void 0 !== i2.fps) {
          if (!Number.isInteger(i2.fps) || i2.fps <= 0) throw new Error("Error starting dial out: videoSettings.fps must be a positive integer");
          if (i2.fps > 30) throw new Error("Error starting dial out: videoSettings.fps must be less than or equal to 30");
        }
        if (void 0 !== i2.videoBitrate) {
          if (!Number.isInteger(i2.videoBitrate) || i2.videoBitrate <= 0) throw new Error("Error starting dial out: videoSettings.videoBitrate must be a positive integer");
          if (i2.videoBitrate > 1e3) throw new Error("Error starting dial out: videoSettings.videoBitrate must be less than or equal to 1000 kbps");
        }
      }
      !(function(e3) {
        if (e3 && (r3(e3.audio), e3.video)) {
          if (!Array.isArray(e3.video)) throw new Error("Error starting dial out: video codec must be an array");
          if (e3.video.length <= 0) throw new Error("Error starting dial out: video codec array specified but empty");
          e3.video.forEach(function(e4) {
            if ("string" != typeof e4) throw new Error("Error starting dial out: video codec must be a string");
            if ("H264" !== e4 && "VP8" !== e4) throw new Error("Error starting dial out: video codec must be H264 or VP8");
          });
        }
      })(e2.codecs);
    }
    if (e2.phoneNumber) {
      if ("string" != typeof e2.phoneNumber) throw new Error("Error starting dial out: phoneNumber must be a string");
      if (!/^\+\d{1,}$/.test(e2.phoneNumber)) throw new Error("Error starting dial out: Invalid phone number, must be valid phone number as per E.164");
      e2.codecs && r3(e2.codecs.audio);
    }
    if (e2.callerId) {
      if ("string" != typeof e2.callerId) throw new Error("Error starting dial out: callerId must be a string");
      if (e2.sipUri) throw new Error("Error starting dial out: callerId not allowed with sipUri");
    }
    if (e2.displayName) {
      if ("string" != typeof e2.displayName) throw new Error("Error starting dial out: displayName must be a string");
      if (e2.displayName.length >= 200) throw new Error("Error starting dial out: displayName length must be less than 200");
    }
    if (e2.userId) {
      if ("string" != typeof e2.userId) throw new Error("Error starting dial out: userId must be a string");
      if (e2.userId.length > 36) throw new Error("Error starting dial out: userId length must be less than or equal to 36");
    }
    if (pc(e2), e2.permissions && e2.permissions.canReceive) {
      var o2 = v(Bs.validateJSONObject(e2.permissions.canReceive), 2), a2 = o2[0], s3 = o2[1];
      if (!a2) throw new Error(s3);
    }
    if (e2.provider) {
      if (e2.provider !== ua && e2.provider !== da) throw new Error("Error: provider can be set only to '".concat(ua, "' or '").concat(da, "', got: ").concat(e2.provider));
      if (e2.phoneNumber) throw new Error("Error starting dial out: provider valid only for sipUri, not phoneNumber");
      e2.provider === ua && console.warn("(pre-beta) provider=".concat(ua, " is currently in pre-beta, things might break!"));
    } else e2.provider = da;
    return new Promise(function(t2, r4) {
      n3.sendMessageToCallMachine(zs({ action: "dialout-start" }, e2), function(e3) {
        e3.error ? r4(e3.error) : t2(e3);
      });
    });
  }), function(e2) {
    return P2.apply(this, arguments);
  }) }, { key: "startDialIn", value: (O2 = d(function* (e2) {
    var n3 = this;
    if (vc(this._callState, "startDialIn()"), !e2 || "object" !== t(e2)) throw new Error("Error starting dial in: args must be an object");
    if ("string" != typeof e2.displayName || 0 === e2.displayName.length) throw new Error("Error starting dial in: displayName is required and must be a non-empty string");
    if (e2.displayName.length >= 200) throw new Error("Error starting dial in: displayName length must be less than 200");
    if (void 0 !== e2.userId && "string" != typeof e2.userId) throw new Error("Error starting dial in: userId must be a string");
    if (void 0 !== e2.userId && e2.userId.length > 36) throw new Error("Error starting dial in: userId length must be less than or equal to 36");
    if (void 0 !== e2.video && "boolean" != typeof e2.video) throw new Error("Error starting dial in: video must be a boolean");
    if (void 0 !== e2.sipEndpoint && "string" != typeof e2.sipEndpoint) throw new Error("Error starting dial in: sipEndpoint must be a string");
    if (void 0 !== e2.codecs && ("object" !== t(e2.codecs) || null === e2.codecs)) throw new Error("Error starting dial in: codecs must be an object");
    if (void 0 !== e2.permissions && ("object" !== t(e2.permissions) || null === e2.permissions)) throw new Error("Error starting dial in: permissions must be an object");
    if (e2.provider) {
      if (e2.provider !== ua && e2.provider !== da) throw new Error("Error starting dial in: provider must be '".concat(ua, "' or '").concat(da, "'"));
    } else e2 = zs(zs({}, e2), {}, { provider: da });
    return new Promise(function(t2, r3) {
      n3.sendMessageToCallMachine(zs({ action: "dialin-start", sipMode: "dial-in" }, e2), function(e3) {
        e3.error ? r3(e3.error) : t2(e3);
      });
    });
  }), function(e2) {
    return O2.apply(this, arguments);
  }) }, { key: "stopDialOut", value: function(e2) {
    var t2 = this;
    return vc(this._callState, "stopDialOut()"), new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine(zs({ action: "dialout-stop" }, e2), function(e3) {
        e3.error ? r3(e3.error) : n3(e3);
      });
    });
  } }, { key: "sipCallTransfer", value: (T2 = d(function* (e2) {
    var t2 = this;
    if (vc(this._callState, "sipCallTransfer()"), !e2) throw new Error("sipCallTransfer() requires a sessionId and toEndPoint");
    return e2.useSipRefer = false, Fc(e2, "sipCallTransfer"), pc(e2), new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine(zs({ action: va }, e2), function(e3) {
        e3.error ? r3(e3.error) : n3(e3);
      });
    });
  }), function(e2) {
    return T2.apply(this, arguments);
  }) }, { key: "sipRefer", value: (C2 = d(function* (e2) {
    var t2 = this;
    if (vc(this._callState, "sipRefer()"), !e2) throw new Error("sessionId and toEndPoint are mandatory parameter");
    return e2.useSipRefer = true, Fc(e2, "sipRefer"), new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine(zs({ action: va }, e2), function(e3) {
        e3.error ? r3(e3.error) : n3(e3);
      });
    });
  }), function(e2) {
    return C2.apply(this, arguments);
  }) }, { key: "sendDTMF", value: (E2 = d(function* (e2) {
    var t2 = this;
    return vc(this._callState, "sendDTMF()"), (function(e3) {
      var t3 = e3.sessionId, n3 = e3.tones, r3 = e3.method, i2 = e3.digitDurationMs;
      if (!t3 || !n3) throw new Error("sessionId and tones are mandatory parameter");
      if ("string" != typeof t3 || "string" != typeof n3) throw new Error("sessionId and tones should be of string type");
      if (n3.length > 20) throw new Error("tones string must be upto 20 characters");
      var o2 = /[^0-9A-D*#]/g, a2 = n3.match(o2);
      if (a2 && a2[0]) throw new Error("".concat(a2[0], " is not valid DTMF tone"));
      if (r3 && !["sip-info", "telephone-event", "auto"].includes(r3)) throw new Error("method must be one of 'sip-info', 'telephone-event', or 'auto'");
      if (void 0 !== i2) {
        if ("number" != typeof i2) throw new Error("digitDurationMs must be a number");
        if (!Number.isFinite(i2) || !Number.isInteger(i2)) throw new Error("digitDurationMs must be a finite integer number");
        if (i2 < 50 || i2 > 2e3) throw new Error("digitDurationMs must be between 50ms and 2000ms");
      }
    })(e2), e2.method = e2.method || "auto", e2.digitDurationMs = e2.digitDurationMs || 500, new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine(zs({ action: "send-dtmf" }, e2), function(e3) {
        e3.error ? r3(e3.error) : n3(e3);
      });
    });
  }), function(e2) {
    return E2.apply(this, arguments);
  }) }, { key: "getNetworkStats", value: function() {
    var e2 = this;
    if (this._callState !== gi) {
      return Promise.resolve(zs({ stats: { latest: {} } }, this._network));
    }
    return new Promise(function(t2) {
      e2.sendMessageToCallMachine({ action: "get-calc-stats" }, function(n3) {
        t2(zs(zs({}, e2._network), {}, { stats: n3.stats }));
      });
    });
  } }, { key: "testWebsocketConnectivity", value: (M2 = d(function* () {
    var e2 = this;
    if (bc(this._testCallInProgress, "testWebsocketConnectivity()"), this.needsLoad()) try {
      yield this.load();
    } catch (e3) {
      return Promise.reject(e3);
    }
    return new Promise(function(t2, n3) {
      e2.sendMessageToCallMachine({ action: "test-websocket-connectivity" }, function(e3) {
        e3.error ? n3(e3.error) : t2(e3.results);
      });
    });
  }), function() {
    return M2.apply(this, arguments);
  }) }, { key: "abortTestWebsocketConnectivity", value: function() {
    this.sendMessageToCallMachine({ action: "abort-test-websocket-connectivity" });
  } }, { key: "_validateVideoTrackForNetworkTests", value: function(e2) {
    return e2 ? e2 instanceof MediaStreamTrack ? !!Os(e2, { isLocalScreenVideo: false }) || (console.error("Video track is not playable. This test needs a live video track."), false) : (console.error("Video track needs to be of type `MediaStreamTrack`."), false) : (console.error("Missing video track. You must provide a video track in order to run this test."), false);
  } }, { key: "testCallQuality", value: (k2 = d(function* () {
    var e2 = this;
    kc(), _c(this._callObjectMode, "testCallQuality()"), yc(this._callMachineInitialized, "testCallQuality()", null, true), mc(this._callState, this._isPreparingToJoin, "testCallQuality()");
    var t2 = this._testCallAlreadyInProgress, n3 = function(n4) {
      t2 || (e2._testCallInProgress = n4);
    };
    if (n3(true), this.needsLoad()) try {
      var r3 = this._callState;
      yield this.load(), this._callState = r3;
    } catch (e3) {
      return n3(false), Promise.reject(e3);
    }
    return new Promise(function(t3) {
      e2.sendMessageToCallMachine({ action: "test-call-quality", dailyJsVersion: e2.properties.dailyJsVersion }, function(r4) {
        var i2 = r4.results, o2 = i2.result, a2 = h(i2, Js);
        if ("failed" === o2) {
          var s3, c2 = zs({}, a2);
          null !== (s3 = a2.error) && void 0 !== s3 && s3.details ? (a2.error.details = JSON.parse(a2.error.details), c2.error = zs(zs({}, c2.error), {}, { details: zs({}, c2.error.details) }), c2.error.details.duringTest = "testCallQuality") : (c2.error = c2.error ? zs({}, c2.error) : {}, c2.error.details = { duringTest: "testCallQuality" }), e2._maybeSendToSentry(c2);
        }
        n3(false), t3(zs({ result: o2 }, a2));
      });
    });
  }), function() {
    return k2.apply(this, arguments);
  }) }, { key: "stopTestCallQuality", value: function() {
    this.sendMessageToCallMachine({ action: "stop-test-call-quality" });
  } }, { key: "testConnectionQuality", value: (w2 = d(function* (e2) {
    var t2;
    ma() ? (console.warn("testConnectionQuality() is deprecated: use testPeerToPeerCallQuality() instead"), t2 = yield this.testPeerToPeerCallQuality(e2)) : (console.warn("testConnectionQuality() is deprecated: use testCallQuality() instead"), t2 = yield this.testCallQuality());
    var n3 = { result: t2.result, secondsElapsed: t2.secondsElapsed };
    return t2.data && (n3.data = { maxRTT: t2.data.maxRoundTripTime, packetLoss: t2.data.avgRecvPacketLoss }), n3;
  }), function(e2) {
    return w2.apply(this, arguments);
  }) }, { key: "testPeerToPeerCallQuality", value: (b2 = d(function* (e2) {
    var t2 = this;
    if (bc(this._testCallInProgress, "testPeerToPeerCallQuality()"), this.needsLoad()) try {
      yield this.load();
    } catch (e3) {
      return Promise.reject(e3);
    }
    var n3 = e2.videoTrack, r3 = e2.duration;
    if (!this._validateVideoTrackForNetworkTests(n3)) throw new Error("Video track error");
    return this._sharedTracks.videoTrackForConnectionQualityTest = n3, new Promise(function(e3, n4) {
      t2.sendMessageToCallMachine({ action: "test-p2p-call-quality", duration: r3 }, function(t3) {
        t3.error ? n4(t3.error) : e3(t3.results);
      });
    });
  }), function(e2) {
    return b2.apply(this, arguments);
  }) }, { key: "stopTestConnectionQuality", value: function() {
    ma() ? (console.warn("stopTestConnectionQuality() is deprecated: use testPeerToPeerCallQuality() and stopTestPeerToPeerCallQuality() instead"), this.stopTestPeerToPeerCallQuality()) : (console.warn("stopTestConnectionQuality() is deprecated: use testCallQuality() and stopTestCallQuality() instead"), this.stopTestCallQuality());
  } }, { key: "stopTestPeerToPeerCallQuality", value: function() {
    this.sendMessageToCallMachine({ action: "stop-test-p2p-call-quality" });
  } }, { key: "testNetworkConnectivity", value: (y2 = d(function* (e2) {
    var t2 = this;
    if (bc(this._testCallInProgress, "testNetworkConnectivity()"), this.needsLoad()) try {
      yield this.load();
    } catch (e3) {
      return Promise.reject(e3);
    }
    if (!this._validateVideoTrackForNetworkTests(e2)) throw new Error("Video track error");
    return this._sharedTracks.videoTrackForNetworkConnectivityTest = e2, new Promise(function(e3, n3) {
      t2.sendMessageToCallMachine({ action: "test-network-connectivity" }, function(t3) {
        t3.error ? n3(t3.error) : e3(t3.results);
      });
    });
  }), function(e2) {
    return y2.apply(this, arguments);
  }) }, { key: "abortTestNetworkConnectivity", value: function() {
    this.sendMessageToCallMachine({ action: "abort-test-network-connectivity" });
  } }, { key: "getCpuLoadStats", value: function() {
    var e2 = this;
    return new Promise(function(t2) {
      if (e2._callState === gi) {
        e2.sendMessageToCallMachine({ action: "get-cpu-load-stats" }, function(e3) {
          t2(e3.cpuStats);
        });
      } else t2({ cpuLoadState: void 0, cpuLoadStateReason: void 0, stats: {} });
    });
  } }, { key: "_validateEncodingLayerHasValidProperties", value: function(e2) {
    var t2;
    if (!((null === (t2 = Object.keys(e2)) || void 0 === t2 ? void 0 : t2.length) > 0)) throw new Error("Empty encoding is not allowed. At least one of these valid keys should be specified:" + Object.values(rc));
  } }, { key: "_validateVideoSendSettings", value: function(e2, n3) {
    var r3 = "screenVideo" === e2 ? ["default-screen-video", "detail-optimized", "motion-optimized", "motion-and-detail-balanced"] : ["default-video", "bandwidth-optimized", "bandwidth-and-quality-balanced", "quality-optimized", "adaptive-2-layers", "adaptive-3-layers"], i2 = "Video send settings should be either an object or one of the supported presets: ".concat(r3.join());
    if ("string" == typeof n3) {
      if (!r3.includes(n3)) throw new Error(i2);
    } else {
      if ("object" !== t(n3)) throw new Error(i2);
      if (!n3.maxQuality && !n3.encodings && void 0 === n3.allowAdaptiveLayers && void 0 === n3.adaptiveLayerMaxBitrate && void 0 === n3.startBitrate) throw new Error("Video send settings must contain at least maxQuality, allowAdaptiveLayers, adaptiveLayerMaxBitrate, startBitrate or encodings attribute");
      if (void 0 !== n3.startBitrate) {
        var o2 = n3.startBitrate;
        if (!Number.isInteger(o2) || o2 < 1e3 || o2 > 4294967295) throw new Error("startBitrate must be a whole number of bits per second, between 1000 and 4294967295");
      }
      if (void 0 !== n3.adaptiveLayerMaxBitrate && null !== n3.adaptiveLayerMaxBitrate) {
        var a2 = n3.adaptiveLayerMaxBitrate;
        if ("number" != typeof a2 || !Number.isFinite(a2) || a2 <= 0) throw new Error("adaptiveLayerMaxBitrate must be a positive number, or null to remove the cap");
      }
      if (n3.maxQuality && -1 === ["low", "medium", "high"].indexOf(n3.maxQuality)) throw new Error("maxQuality must be either low, medium or high");
      if (n3.encodings) {
        var s3 = false;
        switch (Object.keys(n3.encodings).length) {
          case 1:
            s3 = !n3.encodings.low;
            break;
          case 2:
            s3 = !n3.encodings.low || !n3.encodings.medium;
            break;
          case 3:
            s3 = !n3.encodings.low || !n3.encodings.medium || !n3.encodings.high;
            break;
          default:
            s3 = true;
        }
        if (s3) throw new Error("Encodings must be defined as: low, low and medium, or low, medium and high.");
        n3.encodings.low && this._validateEncodingLayerHasValidProperties(n3.encodings.low), n3.encodings.medium && this._validateEncodingLayerHasValidProperties(n3.encodings.medium), n3.encodings.high && this._validateEncodingLayerHasValidProperties(n3.encodings.high);
      }
    }
  } }, { key: "validateUpdateSendSettings", value: function(e2) {
    var t2 = this;
    if (!e2 || 0 === Object.keys(e2).length) throw new Error("Send settings must contain at least information for one track!");
    Object.entries(e2).forEach(function(e3) {
      var n3 = v(e3, 2), r3 = n3[0], i2 = n3[1];
      t2._validateVideoSendSettings(r3, i2);
    });
  } }, { key: "updateSendSettings", value: function(e2) {
    var t2 = this;
    return this.validateUpdateSendSettings(e2), this.needsLoad() ? (this._preloadCache.sendSettings = e2, { sendSettings: this._preloadCache.sendSettings }) : new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine({ action: "update-send-settings", sendSettings: e2 }, function(e3) {
        e3.error ? r3(e3.error) : n3(e3.sendSettings);
      });
    });
  } }, { key: "getSendSettings", value: function() {
    return this._sendSettings || this._preloadCache.sendSettings;
  } }, { key: "getLocalAudioLevel", value: function() {
    return this._localAudioLevel;
  } }, { key: "getRemoteParticipantsAudioLevel", value: function() {
    return this._remoteParticipantsAudioLevel;
  } }, { key: "getActiveSpeaker", value: function() {
    return kc(), this._activeSpeaker;
  } }, { key: "setActiveSpeakerMode", value: function(e2) {
    return kc(), this.sendMessageToCallMachine({ action: "set-active-speaker-mode", enabled: e2 }), this;
  } }, { key: "activeSpeakerMode", value: function() {
    return kc(), this._activeSpeakerMode;
  } }, { key: "subscribeToTracksAutomatically", value: function() {
    return this._preloadCache.subscribeToTracksAutomatically;
  } }, { key: "setSubscribeToTracksAutomatically", value: function(e2) {
    return vc(this._callState, "setSubscribeToTracksAutomatically()", "Use the subscribeToTracksAutomatically configuration property."), this._preloadCache.subscribeToTracksAutomatically = e2, this.sendMessageToCallMachine({ action: "daily-method-subscribe-to-tracks-automatically", enabled: e2 }), this;
  } }, { key: "enumerateDevices", value: (m2 = d(function* () {
    var e2 = this;
    if (this._callObjectMode) {
      var t2 = yield navigator.mediaDevices.enumerateDevices();
      return "Firefox" === Aa() && xa().major > 115 && xa().major < 123 && (t2 = t2.filter(function(e3) {
        return "audiooutput" !== e3.kind;
      })), { devices: t2.map(function(e3) {
        var t3 = JSON.parse(JSON.stringify(e3));
        if (!ma() && "videoinput" === e3.kind && e3.getCapabilities) {
          var n3, r3 = e3.getCapabilities();
          t3.facing = (null == r3 || null === (n3 = r3.facingMode) || void 0 === n3 ? void 0 : n3.length) >= 1 ? r3.facingMode[0] : void 0;
        }
        return t3;
      }) };
    }
    return new Promise(function(t3) {
      e2.sendMessageToCallMachine({ action: "enumerate-devices" }, function(e3) {
        t3({ devices: e3.devices });
      });
    });
  }), function() {
    return m2.apply(this, arguments);
  }) }, { key: "sendAppMessage", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "*";
    if (vc(this._callState, "sendAppMessage()"), JSON.stringify(e2).length > this._maxAppMessageSize) throw new Error("Message data too large. Max size is " + this._maxAppMessageSize);
    return this.sendMessageToCallMachine({ action: "app-msg", data: e2, to: t2 }), this;
  } }, { key: "addFakeParticipant", value: function(e2) {
    return kc(), vc(this._callState, "addFakeParticipant()"), this.sendMessageToCallMachine(zs({ action: "add-fake-participant" }, e2)), this;
  } }, { key: "setShowNamesMode", value: function(e2) {
    return wc(this._callObjectMode, "setShowNamesMode()"), kc(), e2 && "always" !== e2 && "never" !== e2 ? (console.error('setShowNamesMode argument should be "always", "never", or false'), this) : (this.sendMessageToCallMachine({ action: "set-show-names", mode: e2 }), this);
  } }, { key: "setShowLocalVideo", value: function() {
    var e2 = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
    return wc(this._callObjectMode, "setShowLocalVideo()"), kc(), vc(this._callState, "setShowLocalVideo()"), "boolean" != typeof e2 ? (console.error("setShowLocalVideo only accepts a boolean value"), this) : (this.sendMessageToCallMachine({ action: "set-show-local-video", show: e2 }), this._showLocalVideo = e2, this);
  } }, { key: "showLocalVideo", value: function() {
    return wc(this._callObjectMode, "showLocalVideo()"), kc(), this._showLocalVideo;
  } }, { key: "setShowParticipantsBar", value: function() {
    var e2 = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
    return wc(this._callObjectMode, "setShowParticipantsBar()"), kc(), vc(this._callState, "setShowParticipantsBar()"), "boolean" != typeof e2 ? (console.error("setShowParticipantsBar only accepts a boolean value"), this) : (this.sendMessageToCallMachine({ action: "set-show-participants-bar", show: e2 }), this._showParticipantsBar = e2, this);
  } }, { key: "showParticipantsBar", value: function() {
    return wc(this._callObjectMode, "showParticipantsBar()"), kc(), this._showParticipantsBar;
  } }, { key: "customIntegrations", value: function() {
    return kc(), wc(this._callObjectMode, "customIntegrations()"), this._customIntegrations;
  } }, { key: "setCustomIntegrations", value: function(e2) {
    return kc(), wc(this._callObjectMode, "setCustomIntegrations()"), vc(this._callState, "setCustomIntegrations()"), Dc(e2) ? (this.sendMessageToCallMachine({ action: "set-custom-integrations", integrations: e2 }), this._customIntegrations = e2, this) : this;
  } }, { key: "startCustomIntegrations", value: function(e2) {
    var t2 = this;
    if (kc(), wc(this._callObjectMode, "startCustomIntegrations()"), vc(this._callState, "startCustomIntegrations()"), Array.isArray(e2) && e2.some(function(e3) {
      return "string" != typeof e3;
    }) || !Array.isArray(e2) && "string" != typeof e2) return console.error("startCustomIntegrations() only accepts string | string[]"), this;
    var n3 = "string" == typeof e2 ? [e2] : e2, r3 = n3.filter(function(e3) {
      return !(e3 in t2._customIntegrations);
    });
    return r3.length ? (console.error(`Can't find custom integration(s): "`.concat(r3.join(", "), '"')), this) : (this.sendMessageToCallMachine({ action: "start-custom-integrations", ids: n3 }), this);
  } }, { key: "stopCustomIntegrations", value: function(e2) {
    var t2 = this;
    if (kc(), wc(this._callObjectMode, "stopCustomIntegrations()"), vc(this._callState, "stopCustomIntegrations()"), Array.isArray(e2) && e2.some(function(e3) {
      return "string" != typeof e3;
    }) || !Array.isArray(e2) && "string" != typeof e2) return console.error("stopCustomIntegrations() only accepts string | string[]"), this;
    var n3 = "string" == typeof e2 ? [e2] : e2, r3 = n3.filter(function(e3) {
      return !(e3 in t2._customIntegrations);
    });
    return r3.length ? (console.error(`Can't find custom integration(s): "`.concat(r3.join(", "), '"')), this) : (this.sendMessageToCallMachine({ action: "stop-custom-integrations", ids: n3 }), this);
  } }, { key: "customTrayButtons", value: function() {
    return wc(this._callObjectMode, "customTrayButtons()"), kc(), this._customTrayButtons;
  } }, { key: "updateCustomTrayButtons", value: function(e2) {
    return wc(this._callObjectMode, "updateCustomTrayButtons()"), kc(), vc(this._callState, "updateCustomTrayButtons()"), Lc(e2) ? (this.sendMessageToCallMachine({ action: "update-custom-tray-buttons", btns: e2 }), this._customTrayButtons = e2, this) : (console.error("updateCustomTrayButtons only accepts a dictionary of the type ".concat(JSON.stringify(ac))), this);
  } }, { key: "theme", value: function() {
    return wc(this._callObjectMode, "theme()"), this.properties.theme;
  } }, { key: "setTheme", value: function(e2) {
    var t2 = this;
    return wc(this._callObjectMode, "setTheme()"), new Promise(function(n3, r3) {
      try {
        t2.validateProperties({ theme: e2 }), t2.properties.theme = zs({}, e2), t2.sendMessageToCallMachine({ action: "set-theme", theme: t2.properties.theme });
        try {
          t2.emitDailyJSEvent({ action: Ki, theme: t2.properties.theme });
        } catch (e3) {
          console.log("could not emit 'theme-updated'", e3);
        }
        n3(t2.properties.theme);
      } catch (e3) {
        r3(e3);
      }
    });
  } }, { key: "requestFullscreen", value: (g2 = d(function* () {
    if (kc(), this._iframe && !document.fullscreenElement && _a()) try {
      (yield this._iframe.requestFullscreen) ? this._iframe.requestFullscreen() : this._iframe.webkitRequestFullscreen();
    } catch (e2) {
      console.log("could not make video call fullscreen", e2);
    }
  }), function() {
    return g2.apply(this, arguments);
  }) }, { key: "exitFullscreen", value: function() {
    kc(), document.fullscreenElement ? document.exitFullscreen() : document.webkitFullscreenElement && document.webkitExitFullscreen();
  } }, { key: "getSidebarView", value: (f2 = d(function* () {
    var e2 = this;
    return this._callObjectMode ? (console.error("getSidebarView is not available in callObject mode"), Promise.resolve(null)) : new Promise(function(t2) {
      e2.sendMessageToCallMachine({ action: "get-sidebar-view" }, function(e3) {
        t2(e3.view);
      });
    });
  }), function() {
    return f2.apply(this, arguments);
  }) }, { key: "setSidebarView", value: function(e2) {
    return this._callObjectMode ? (console.error("setSidebarView is not available in callObject mode"), this) : (this.sendMessageToCallMachine({ action: "set-sidebar-view", view: e2 }), this);
  } }, { key: "room", value: (p2 = d(function* () {
    var e2 = this, t2 = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).includeRoomConfigDefaults, n3 = void 0 === t2 || t2;
    return this._accessState.access === Ei || this.needsLoad() ? this.properties.url ? { roomUrlPendingJoin: this.properties.url } : null : new Promise(function(t3) {
      e2.sendMessageToCallMachine({ action: "lib-room-info", includeRoomConfigDefaults: n3 }, function(e3) {
        delete e3.action, delete e3.callbackStamp, t3(e3);
      });
    });
  }), function() {
    return p2.apply(this, arguments);
  }) }, { key: "geo", value: (u2 = d(function* () {
    return console.error("The geo() function is no longer supported. Geographical decisions now depend upon domain and room settings."), { current: "" };
  }), function() {
    return u2.apply(this, arguments);
  }) }, { key: "setNetworkTopology", value: (s2 = d(function* (e2) {
    var t2 = this;
    return kc(), vc(this._callState, "setNetworkTopology()"), new Promise(function(n3, r3) {
      t2.sendMessageToCallMachine({ action: "set-network-topology", opts: e2 }, function(e3) {
        e3.error ? r3({ error: e3.error }) : n3({ workerId: e3.workerId });
      });
    });
  }), function(e2) {
    return s2.apply(this, arguments);
  }) }, { key: "getNetworkTopology", value: (r2 = d(function* () {
    var e2 = this;
    return new Promise(function(t2, n3) {
      e2.needsLoad() && t2({ topology: "none" }), e2.sendMessageToCallMachine({ action: "get-network-topology" }, function(e3) {
        e3.error ? n3({ error: e3.error }) : t2({ topology: e3.topology });
      });
    });
  }), function() {
    return r2.apply(this, arguments);
  }) }, { key: "setPlayNewParticipantSound", value: function(e2) {
    if (kc(), "number" != typeof e2 && true !== e2 && false !== e2) throw new Error("argument to setShouldPlayNewParticipantSound should be true, false, or a number, but is ".concat(e2));
    this.sendMessageToCallMachine({ action: "daily-method-set-play-ding", arg: e2 });
  } }, { key: "on", value: function(e2, t2) {
    return _.prototype.on.call(this, e2, t2);
  } }, { key: "once", value: function(e2, t2) {
    return _.prototype.once.call(this, e2, t2);
  } }, { key: "off", value: function(e2, t2) {
    return _.prototype.off.call(this, e2, t2);
  } }, { key: "validateProperties", value: function(e2) {
    var t2, n3;
    if (null != e2 && null !== (t2 = e2.dailyConfig) && void 0 !== t2 && t2.userMediaAudioConstraints) {
      var r3, i2;
      ma() || console.warn("userMediaAudioConstraints is deprecated. You can override constraints with inputSettings.audio.settings, found in DailyCallOptions.");
      var o2 = e2.inputSettings || {};
      o2.audio = (null === (r3 = e2.inputSettings) || void 0 === r3 ? void 0 : r3.audio) || {}, o2.audio.settings = (null === (i2 = e2.inputSettings) || void 0 === i2 || null === (i2 = i2.audio) || void 0 === i2 ? void 0 : i2.settings) || {}, o2.audio.settings = zs(zs({}, o2.audio.settings), e2.dailyConfig.userMediaAudioConstraints), e2.inputSettings = o2, delete e2.dailyConfig.userMediaAudioConstraints;
    }
    if (null != e2 && null !== (n3 = e2.dailyConfig) && void 0 !== n3 && n3.userMediaVideoConstraints) {
      var a2, s3;
      ma() || console.warn("userMediaVideoConstraints is deprecated. You can override constraints with inputSettings.video.settings, found in DailyCallOptions.");
      var c2 = e2.inputSettings || {};
      c2.video = (null === (a2 = e2.inputSettings) || void 0 === a2 ? void 0 : a2.video) || {}, c2.video.settings = (null === (s3 = e2.inputSettings) || void 0 === s3 || null === (s3 = s3.video) || void 0 === s3 ? void 0 : s3.settings) || {}, c2.video.settings = zs(zs({}, c2.video.settings), e2.dailyConfig.userMediaVideoConstraints), e2.inputSettings = c2, delete e2.dailyConfig.userMediaVideoConstraints;
    }
    for (var l2 in e2) if (uc[l2]) {
      if (uc[l2].validate && !uc[l2].validate(e2[l2], this)) throw new Error("property '".concat(l2, "': ").concat(uc[l2].help));
    } else console.warn("Ignoring unrecognized property '".concat(l2, "'")), delete e2[l2];
  } }, { key: "assembleMeetingUrl", value: function() {
    var e2, t2, n3 = zs(zs({}, this.properties), {}, { emb: this.callClientId, embHref: encodeURIComponent(window.location.href), proxy: null !== (e2 = this.properties.dailyConfig) && void 0 !== e2 && e2.proxyUrl ? encodeURIComponent(null === (t2 = this.properties.dailyConfig) || void 0 === t2 ? void 0 : t2.proxyUrl) : void 0 }), r3 = n3.url.match(/\?/) ? "&" : "?";
    return n3.url + r3 + Object.keys(uc).filter(function(e3) {
      return uc[e3].queryString && void 0 !== n3[e3];
    }).map(function(e3) {
      return "".concat(uc[e3].queryString, "=").concat(n3[e3]);
    }).join("&");
  } }, { key: "needsLoad", value: function() {
    return [hi, pi, mi, yi].includes(this._callState);
  } }, { key: "sendMessageToCallMachine", value: function(e2, t2) {
    if (this._destroyed && (this._logUseAfterDestroy(), this.strictMode)) throw new Error("Use after destroy");
    this._messageChannel.sendMessageToCallMachine(e2, t2, this.callClientId, this._iframe);
  } }, { key: "forwardPackagedMessageToCallMachine", value: function(e2) {
    this._messageChannel.forwardPackagedMessageToCallMachine(e2, this._iframe, this.callClientId);
  } }, { key: "addListenerForPackagedMessagesFromCallMachine", value: function(e2) {
    return this._messageChannel.addListenerForPackagedMessagesFromCallMachine(e2, this.callClientId);
  } }, { key: "removeListenerForPackagedMessagesFromCallMachine", value: function(e2) {
    this._messageChannel.removeListenerForPackagedMessagesFromCallMachine(e2);
  } }, { key: "handleMessageFromCallMachine", value: function(e2) {
    switch (e2.action) {
      case Qi:
        this.sendMessageToCallMachine(zs({ action: Yi }, this.properties));
        break;
      case "call-machine-initialized":
        this._callMachineInitialized = true;
        var t2 = J(), n3 = { action: oa, level: "log", code: 1011, stats: { event: "bundle load", time: "no-op" === this._bundleLoadTime ? 0 : this._bundleLoadTime, preLoaded: "no-op" === this._bundleLoadTime, url: G(this.properties.dailyConfig), resolvedBaseDomain: t2, failedOver: null != t2 && "daily.co" !== t2 } };
        this.sendMessageToCallMachine(n3), this._delayDuplicateInstanceLog && this._logDuplicateInstanceAttempt();
        break;
      case eo:
        this._loadedCallback && (this._loadedCallback(), this._loadedCallback = null), this.emitDailyJSEvent(e2);
        break;
      case io:
        var r3, i2 = zs({}, e2);
        delete i2.internal, this._maxAppMessageSize = (null === (r3 = e2.internal) || void 0 === r3 ? void 0 : r3._maxAppMessageSize) || ea, this._joinedCallback && (this._joinedCallback(e2.participants), this._joinedCallback = null), this.emitDailyJSEvent(i2);
        break;
      case ao:
      case so:
        if (this._callState === mi) return;
        if (e2.participant && e2.participant.session_id) {
          var o2 = e2.participant.local ? "local" : e2.participant.session_id;
          if (this._callObjectMode) {
            var a2 = this._callMachine().store;
            hs(e2.participant, a2), ps(e2.participant, a2), vs(e2.participant, this._participants[o2], a2);
          }
          try {
            this.maybeParticipantTracksStopped(this._participants[o2], e2.participant), this.maybeParticipantTracksStarted(this._participants[o2], e2.participant), this.maybeEventRecordingStopped(this._participants[o2], e2.participant), this.maybeEventRecordingStarted(this._participants[o2], e2.participant);
          } catch (e3) {
            console.error("track events error", e3);
          }
          this.compareEqualForParticipantUpdateEvent(e2.participant, this._participants[o2]) || (this._participants[o2] = zs({}, e2.participant), this.toggleParticipantAudioBasedOnNativeAudioFocus(), this.emitDailyJSEvent(e2));
        }
        break;
      case co:
        if (e2.participant && e2.participant.session_id) {
          var s3 = this._participants[e2.participant.session_id];
          s3 && this.maybeParticipantTracksStopped(s3, null), delete this._participants[e2.participant.session_id], this.emitDailyJSEvent(e2);
        }
        break;
      case lo:
        S(this._participantCounts, e2.participantCounts) || (this._participantCounts = e2.participantCounts, this.emitDailyJSEvent(e2));
        break;
      case uo:
        var c2 = { access: e2.access };
        e2.awaitingAccess && (c2.awaitingAccess = e2.awaitingAccess), S(this._accessState, c2) || (this._accessState = c2, this.emitDailyJSEvent(e2));
        break;
      case ho:
        if (e2.meetingSession) {
          this._meetingSessionSummary = e2.meetingSession, this.emitDailyJSEvent(e2);
          var l2 = zs(zs({}, e2), {}, { action: "meeting-session-updated" });
          this.emitDailyJSEvent(l2);
        }
        break;
      case Zo:
        this._handleFatalError(e2);
        break;
      case oo:
        this._callState !== yi && this._updateCallState(mi), this.resetMeetingDependentVars(), this._resolveLeave && (this._resolveLeave(), this._resolveLeave = null), this.emitDailyJSEvent(e2);
        break;
      case "selected-devices-updated":
        e2.devices && this.emitDailyJSEvent(e2);
        break;
      case Ro:
        var u3 = e2.state, d2 = e2.threshold, h2 = e2.quality, p3 = u3.state, f3 = u3.reasons;
        p3 === this._network.networkState && S(f3, this._network.networkStateReasons) && d2 === this._network.threshold && h2 === this._network.quality || (this._network.networkState = p3, this._network.networkStateReasons = f3, this._network.quality = h2, this._network.threshold = d2, e2.networkState = p3, f3.length && (e2.networkStateReasons = f3), delete e2.state, this.emitDailyJSEvent(e2));
        break;
      case Vo:
        e2 && e2.cpuLoadState && this.emitDailyJSEvent(e2);
        break;
      case Jo:
        e2 && void 0 !== e2.faceCounts && this.emitDailyJSEvent(e2);
        break;
      case Fo:
        var v2 = e2.activeSpeaker;
        this._activeSpeaker.peerId !== v2.peerId && (this._activeSpeaker.peerId = v2.peerId, this.emitDailyJSEvent({ action: e2.action, activeSpeaker: this._activeSpeaker }));
        break;
      case "show-local-video-changed":
        if (this._callObjectMode) return;
        var g3 = e2.show;
        this._showLocalVideo = g3, this.emitDailyJSEvent({ action: e2.action, show: g3 });
        break;
      case Bo:
        var m3 = e2.enabled;
        this._activeSpeakerMode !== m3 && (this._activeSpeakerMode = m3, this.emitDailyJSEvent({ action: e2.action, enabled: this._activeSpeakerMode }));
        break;
      case vo:
      case go:
      case mo:
        this._waitingParticipants = e2.allWaitingParticipants, this.emitDailyJSEvent({ action: e2.action, participant: e2.participant });
        break;
      case Yo:
        S(this._receiveSettings, e2.receiveSettings) || (this._receiveSettings = e2.receiveSettings, this.emitDailyJSEvent({ action: e2.action, receiveSettings: e2.receiveSettings }));
        break;
      case Ko:
        this._maybeUpdateInputSettings(e2.inputSettings);
        break;
      case "send-settings-updated":
        S(this._sendSettings, e2.sendSettings) || (this._sendSettings = e2.sendSettings, this._preloadCache.sendSettings = null, this.emitDailyJSEvent({ action: e2.action, sendSettings: e2.sendSettings }));
        break;
      case "local-audio-level":
        this._localAudioLevel = e2.audioLevel, this._preloadCache.localAudioLevelObserver = null, this.emitDailyJSEvent(e2);
        break;
      case "remote-participants-audio-level":
        this._remoteParticipantsAudioLevel = e2.participantsAudioLevel, this._preloadCache.remoteParticipantsAudioLevelObserver = null, this.emitDailyJSEvent(e2);
        break;
      case xo:
        var y3 = e2.session_id;
        this._rmpPlayerState[y3] = e2.playerState, this.emitDailyJSEvent(e2);
        break;
      case Io:
        delete this._rmpPlayerState[e2.session_id], this.emitDailyJSEvent(e2);
        break;
      case jo:
        var b3 = e2.session_id, _2 = this._rmpPlayerState[b3];
        _2 && this.compareEqualForRMPUpdateEvent(_2, e2.remoteMediaPlayerState) || (this._rmpPlayerState[b3] = e2.remoteMediaPlayerState, this.emitDailyJSEvent(e2));
        break;
      case "custom-button-click":
      case "sidebar-view-changed":
      case "pip-started":
      case "pip-stopped":
        this.emitDailyJSEvent(e2);
        break;
      case po:
        var w3 = this._meetingSessionState.topology !== (e2.meetingSessionState && e2.meetingSessionState.topology);
        this._meetingSessionState = Uc(e2.meetingSessionState, this._callObjectMode), (this._callObjectMode || w3) && this.emitDailyJSEvent(e2);
        break;
      case Lo:
        this._isScreenSharing = true, this.emitDailyJSEvent(e2);
        break;
      case Do:
      case No:
        this._isScreenSharing = false, this.emitDailyJSEvent(e2);
        break;
      case So:
      case Mo:
      case Eo:
      case Co:
      case To:
      case _o:
      case wo:
      case ko:
      case to:
      case no:
      case Po:
      case Ao:
      case "test-completed":
      case Uo:
      case Oo:
      case zo:
      case Wo:
      case Go:
      case Ho:
      case Xo:
      case Qo:
      case "dialin-ready":
      case "dialin-connected":
      case "dialin-error":
      case "dialin-stopped":
      case "dialin-warning":
      case "dialout-connected":
      case "dtmf-event":
      case "dialout-answered":
      case "dialout-error":
      case "dialout-stopped":
      case "dialout-warning":
        this.emitDailyJSEvent(e2);
        break;
      case "request-fullscreen":
        this.requestFullscreen();
        break;
      case "request-exit-fullscreen":
        this.exitFullscreen();
    }
  } }, { key: "maybeEventRecordingStopped", value: function(e2, t2) {
    var n3 = "record";
    e2 && (t2.local || false !== t2[n3] || e2[n3] === t2[n3] || this.emitDailyJSEvent({ action: Mo }));
  } }, { key: "maybeEventRecordingStarted", value: function(e2, t2) {
    var n3 = "record";
    e2 && (t2.local || true !== t2[n3] || e2[n3] === t2[n3] || this.emitDailyJSEvent({ action: So }));
  } }, { key: "_trackStatePlayable", value: function(e2) {
    return !(!e2 || e2.state !== Mi);
  } }, { key: "_trackChanged", value: function(e2, t2) {
    return !((null == e2 ? void 0 : e2.id) === (null == t2 ? void 0 : t2.id));
  } }, { key: "maybeEventTrackStopped", value: function(e2, t2, n3) {
    var r3, i2, o2 = null !== (r3 = null == t2 ? void 0 : t2.tracks[e2]) && void 0 !== r3 ? r3 : null, a2 = null !== (i2 = null == n3 ? void 0 : n3.tracks[e2]) && void 0 !== i2 ? i2 : null, s3 = null == o2 ? void 0 : o2.track;
    if (s3) {
      var c2 = this._trackStatePlayable(o2), l2 = this._trackStatePlayable(a2), u3 = this._trackChanged(s3, null == a2 ? void 0 : a2.track);
      c2 && (l2 && !u3 || this.emitDailyJSEvent({ action: bo, track: s3, participant: null != n3 ? n3 : t2, type: e2 }));
    }
  } }, { key: "maybeEventTrackStarted", value: function(e2, t2, n3) {
    var r3, i2, o2 = null !== (r3 = null == t2 ? void 0 : t2.tracks[e2]) && void 0 !== r3 ? r3 : null, a2 = null !== (i2 = null == n3 ? void 0 : n3.tracks[e2]) && void 0 !== i2 ? i2 : null, s3 = null == a2 ? void 0 : a2.track;
    if (s3) {
      var c2 = this._trackStatePlayable(o2), l2 = this._trackStatePlayable(a2), u3 = this._trackChanged(null == o2 ? void 0 : o2.track, s3);
      l2 && (c2 && !u3 || this.emitDailyJSEvent({ action: yo, track: s3, participant: n3, type: e2 }));
    }
  } }, { key: "maybeParticipantTracksStopped", value: function(e2, t2) {
    if (e2) for (var n3 in e2.tracks) this.maybeEventTrackStopped(n3, e2, t2);
  } }, { key: "maybeParticipantTracksStarted", value: function(e2, t2) {
    if (t2) for (var n3 in t2.tracks) this.maybeEventTrackStarted(n3, e2, t2);
  } }, { key: "compareEqualForRMPUpdateEvent", value: function(e2, t2) {
    var n3, r3;
    return e2.state === t2.state && (null === (n3 = e2.settings) || void 0 === n3 ? void 0 : n3.volume) === (null === (r3 = t2.settings) || void 0 === r3 ? void 0 : r3.volume);
  } }, { key: "emitDailyJSEvent", value: function(e2) {
    try {
      e2.callClientId = this.callClientId, this.emit(e2.action, e2);
    } catch (t2) {
      console.log("could not emit", e2, t2);
    }
  } }, { key: "compareEqualForParticipantUpdateEvent", value: function(e2, t2) {
    return !!S(e2, t2) && ((!e2.videoTrack || !t2.videoTrack || e2.videoTrack.id === t2.videoTrack.id && e2.videoTrack.muted === t2.videoTrack.muted && e2.videoTrack.enabled === t2.videoTrack.enabled) && (!e2.audioTrack || !t2.audioTrack || e2.audioTrack.id === t2.audioTrack.id && e2.audioTrack.muted === t2.audioTrack.muted && e2.audioTrack.enabled === t2.audioTrack.enabled));
  } }, { key: "nativeUtils", value: function() {
    return ma() ? "undefined" == typeof DailyNativeUtils ? (console.warn("in React Native, DailyNativeUtils is expected to be available"), null) : DailyNativeUtils : null;
  } }, { key: "updateIsPreparingToJoin", value: function(e2) {
    this._updateCallState(this._callState, e2);
  } }, { key: "_updateCallState", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this._isPreparingToJoin;
    if (e2 !== this._callState || t2 !== this._isPreparingToJoin) {
      var n3 = this._callState, r3 = this._isPreparingToJoin;
      this._callState = e2, this._isPreparingToJoin = t2;
      var i2 = this._callState === gi;
      this.updateShowAndroidOngoingMeetingNotification(i2);
      var o2 = gc(n3, r3), a2 = gc(this._callState, this._isPreparingToJoin);
      o2 !== a2 && (this.updateKeepDeviceAwake(a2), this.updateDeviceAudioMode(a2), this.updateNoOpRecordingEnsuringBackgroundContinuity(a2));
    }
  } }, { key: "_handleFatalError", value: function(e2) {
    var t2;
    this._iframe && !e2.preserveIframe && (this._iframe.src = ""), this._updateCallState(yi), this.resetMeetingDependentVars(), this._loadedCallback && (this._loadedCallback(e2.errorMsg), this._loadedCallback = null), e2.preserveIframe;
    var n3 = h(e2, $s);
    "string" == typeof (null == n3 || null === (t2 = n3.error) || void 0 === t2 ? void 0 : t2.details) && (n3.error.details = JSON.parse(n3.error.details)), this._maybeSendToSentry(e2), this._joinedCallback && (this._joinedCallback(null, n3), this._joinedCallback = null), this.emitDailyJSEvent(n3);
  } }, { key: "resetMeetingDependentVars", value: function() {
    this._participants = {}, this._participantCounts = tc, this._waitingParticipants = {}, this._activeSpeaker = {}, this._activeSpeakerMode = false, this._didPreAuth = false, this._accessState = { access: Ei }, this._finalSummaryOfPrevSession = this._meetingSessionSummary, this._meetingSessionSummary = {}, this._meetingSessionState = Uc(ec, this._callObjectMode), this._isScreenSharing = false, this._receiveSettings = {}, this._inputSettings = void 0, this._sendSettings = {}, this._localAudioLevel = 0, this._isLocalAudioLevelObserverRunning = false, this._remoteParticipantsAudioLevel = {}, this._isRemoteParticipantsAudioLevelObserverRunning = false, this._maxAppMessageSize = ea, this._callMachineInitialized = false, this._bundleLoadTime = void 0, this._preloadCache;
  } }, { key: "updateKeepDeviceAwake", value: function(e2) {
    ma() && this.nativeUtils().setKeepDeviceAwake(e2, this.callClientId);
  } }, { key: "updateDeviceAudioMode", value: function(e2) {
    if (ma() && !this.disableReactNativeAutoDeviceManagement("audio")) {
      var t2 = e2 ? this._nativeInCallAudioMode : "idle";
      this.nativeUtils().setAudioMode(t2);
    }
  } }, { key: "updateShowAndroidOngoingMeetingNotification", value: function(e2) {
    if (ma() && this.nativeUtils().setShowOngoingMeetingNotification) {
      var t2, n3, r3, i2;
      if (this.properties.reactNativeConfig && this.properties.reactNativeConfig.androidInCallNotification) {
        var o2 = this.properties.reactNativeConfig.androidInCallNotification;
        t2 = o2.title, n3 = o2.subtitle, r3 = o2.iconName, i2 = o2.disableForCustomOverride;
      }
      i2 && (e2 = false), this.nativeUtils().setShowOngoingMeetingNotification(e2, t2, n3, r3, this.callClientId);
    }
  } }, { key: "updateNoOpRecordingEnsuringBackgroundContinuity", value: function(e2) {
    ma() && this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity && this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity(e2);
  } }, { key: "toggleParticipantAudioBasedOnNativeAudioFocus", value: function() {
    var e2;
    if (ma()) {
      var t2 = null === (e2 = this._callMachine()) || void 0 === e2 || null === (e2 = e2.store) || void 0 === e2 ? void 0 : e2.getState();
      for (var n3 in null == t2 ? void 0 : t2.streams) {
        var r3 = t2.streams[n3];
        r3 && r3.pendingTrack && "audio" === r3.pendingTrack.kind && (r3.pendingTrack.enabled = this._hasNativeAudioFocus);
      }
    }
  } }, { key: "disableReactNativeAutoDeviceManagement", value: function(e2) {
    return this.properties.reactNativeConfig && this.properties.reactNativeConfig.disableAutoDeviceManagement && this.properties.reactNativeConfig.disableAutoDeviceManagement[e2];
  } }, { key: "absoluteUrl", value: function(e2) {
    if (void 0 !== e2) {
      var t2 = document.createElement("a");
      return t2.href = e2, t2.href;
    }
  } }, { key: "sayHello", value: function() {
    var e2 = "hello, world.";
    return console.log(e2), e2;
  } }, { key: "_logUseAfterDestroy", value: function() {
    var e2 = Object.values(Qs)[0];
    if (this.needsLoad()) {
      if (e2 && !e2.needsLoad()) {
        var t2 = { action: oa, level: "error", code: this.strictMode ? 9995 : 9997 };
        e2.sendMessageToCallMachine(t2);
      } else if (!this.strictMode) {
        console.error("You are are attempting to use a call instance that was previously destroyed, which is unsupported. Please remove `strictMode: false` from your constructor properties to enable strict mode to track down and fix this unsupported usage.");
      }
    } else {
      var n3 = { action: oa, level: "error", code: this.strictMode ? 9995 : 9997 };
      this._messageChannel.sendMessageToCallMachine(n3, null, this.callClientId, this._iframe);
    }
  } }, { key: "_logDuplicateInstanceAttempt", value: function() {
    for (var e2 = 0, t2 = Object.values(Qs); e2 < t2.length; e2++) {
      var n3 = t2[e2];
      n3._callMachineInitialized ? (n3.sendMessageToCallMachine({ action: oa, level: "warn", code: this.allowMultipleCallInstances ? 9993 : 9992 }), n3._delayDuplicateInstanceLog = false) : n3._delayDuplicateInstanceLog = true;
    }
  } }, { key: "_maybeSendToSentry", value: function(e2) {
    var t2, r3, i2, o2, a2;
    if (null !== (t2 = e2.error) && void 0 !== t2 && t2.type) {
      if (![Ui, Bi, Ni].includes(e2.error.type)) return;
      if (e2.error.type === Ni && e2.error.msg.includes("deleted")) return;
    }
    var s3 = null !== (r3 = this.properties) && void 0 !== r3 && r3.url ? new URL(this.properties.url) : void 0, c2 = "production";
    s3 && s3.host.includes(".staging.daily") && (c2 = "staging");
    var l2, u3, d2, h2, p3, f3 = (function(e3) {
      const t3 = [zn(), $n(), ti(), Zr(), si(), di(), er(), ui()];
      return false !== e3.autoSessionTracking && t3.push(ai()), t3;
    })({}).filter(function(e3) {
      return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(e3.name);
    }), v2 = new Or({ dsn: "https://f10f1c81e5d44a4098416c0867a8b740@o77906.ingest.sentry.io/168844", transport: $r, stackParser: Yr, integrations: f3, environment: c2 }), g3 = new wt();
    if (g3.setClient(v2), v2.init(), (null === (i2 = this._participants) || void 0 === i2 || null === (i2 = i2.local) || void 0 === i2 ? void 0 : i2.session_id) && g3.setExtra("sessionId", this._participants.local.session_id), this.properties) {
      var m3 = zs({}, this.properties);
      m3.userName = m3.userName ? "[Filtered]" : void 0, m3.userData = m3.userData ? "[Filtered]" : void 0, m3.token = m3.token ? "[Filtered]" : void 0, g3.setExtra("properties", m3);
    }
    if (s3) {
      var y3 = s3.searchParams.get("domain");
      if (!y3) {
        var b3 = s3.host.match(/(.*?)\./);
        y3 = b3 && b3[1] || "";
      }
      y3 && g3.setTag("domain", y3);
    }
    e2.error && (g3.setTag("fatalErrorType", e2.error.type), g3.setExtra("errorDetails", e2.error.details), (null === (l2 = e2.error.details) || void 0 === l2 ? void 0 : l2.uri) && g3.setTag("serverAddress", e2.error.details.uri), (null === (u3 = e2.error.details) || void 0 === u3 ? void 0 : u3.workerGroup) && g3.setTag("workerGroup", e2.error.details.workerGroup), (null === (d2 = e2.error.details) || void 0 === d2 ? void 0 : d2.geoGroup) && g3.setTag("geoGroup", e2.error.details.geoGroup), (null === (h2 = e2.error.details) || void 0 === h2 ? void 0 : h2.on) && g3.setTag("connectionAttempt", e2.error.details.on), null !== (p3 = e2.error.details) && void 0 !== p3 && p3.bundleUrl && (g3.setTag("bundleUrl", e2.error.details.bundleUrl), g3.setTag("bundleError", e2.error.details.sourceError.type)));
    g3.setTags({ callMode: this._callObjectMode ? ma() ? "reactNative" : null !== (o2 = this.properties) && void 0 !== o2 && null !== (o2 = o2.dailyConfig) && void 0 !== o2 && null !== (o2 = o2.callMode) && void 0 !== o2 && o2.includes("prebuilt") ? this.properties.dailyConfig.callMode : "custom" : "prebuilt-frame", version: n2.version() });
    var _2 = (null === (a2 = e2.error) || void 0 === a2 ? void 0 : a2.msg) || e2.errorMsg;
    g3.captureException(new Error(_2));
  } }, { key: "_callMachine", value: function() {
    var e2;
    return null === (e2 = window._daily) || void 0 === e2 || null === (e2 = e2.instances) || void 0 === e2 || null === (e2 = e2[this.callClientId]) || void 0 === e2 ? void 0 : e2.callMachine;
  } }, { key: "_maybeUpdateInputSettings", value: function(e2) {
    if (!S(this._inputSettings, e2)) {
      var t2 = this._getInputSettings();
      this._inputSettings = e2;
      var n3 = this._getInputSettings();
      S(t2, n3) || this.emitDailyJSEvent({ action: Ko, inputSettings: n3 });
    }
  } }], [{ key: "supportedBrowser", value: function() {
    if (ma()) return { supported: true, mobile: true, name: "React Native", version: null, supportsScreenShare: true, supportsSfu: true, supportsVideoProcessing: false, supportsAudioProcessing: false };
    var e2 = N.getParser(ga());
    return { supported: !!Ta(), mobile: "mobile" === e2.getPlatformType(), name: e2.getBrowserName(), version: e2.getBrowserVersion(), supportsFullscreen: !!_a(), supportsScreenShare: !!ba(), supportsSfu: !!Ta(), supportsVideoProcessing: Ea(), supportsAudioProcessing: Ca() };
  } }, { key: "version", value: function() {
    return "0.94.0";
  } }, { key: "createCallObject", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return e2.layout = "none", new n2(null, e2);
  } }, { key: "wrap", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (kc(), !e2 || !e2.contentWindow || "string" != typeof e2.src) throw new Error("DailyIframe::Wrap needs an iframe-like first argument");
    return t2.layout || (t2.customLayout ? t2.layout = "custom-v1" : t2.layout = "browser"), new n2(e2, t2);
  } }, { key: "createFrame", value: function(e2, t2) {
    var r3, i2;
    kc(), e2 && t2 ? (r3 = e2, i2 = t2) : e2 && e2.append ? (r3 = e2, i2 = {}) : (r3 = document.body, i2 = e2 || {});
    var o2 = i2.iframeStyle;
    o2 || (o2 = r3 === document.body ? { position: "fixed", border: "1px solid black", backgroundColor: "white", width: "375px", height: "450px", right: "1em", bottom: "1em" } : { border: 0, width: "100%", height: "100%" });
    var a2 = document.createElement("iframe");
    window.navigator && window.navigator.userAgent.match(/Chrome\/61\./) ? a2.allow = "microphone, camera" : a2.allow = "microphone; camera; autoplay; display-capture; screen-wake-lock; compute-pressure;", a2.style.visibility = "hidden", r3.appendChild(a2), a2.style.visibility = null, Object.keys(o2).forEach(function(e3) {
      return a2.style[e3] = o2[e3];
    }), i2.layout || (i2.customLayout ? i2.layout = "custom-v1" : i2.layout = "browser");
    try {
      return new n2(a2, i2);
    } catch (e3) {
      throw r3.removeChild(a2), e3;
    }
  } }, { key: "createTransparentFrame", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    kc();
    var t2 = document.createElement("iframe");
    return t2.allow = "microphone; camera; autoplay", t2.style.cssText = "\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      border: 0;\n      pointer-events: none;\n    ", document.body.appendChild(t2), e2.layout || (e2.layout = "custom-v1"), n2.wrap(t2, e2);
  } }, { key: "getCallInstance", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
    return e2 ? Qs[e2] : Object.values(Qs)[0];
  } }]);
  var r2, s2, u2, p2, f2, g2, m2, y2, b2, w2, k2, M2, E2, C2, T2, O2, P2, A2, x2, j2, I2, L2, D2, F2, R2, U2, V2, W2, H2, Q2, K2, X2, Z2, ee2, te2, ne2, re2, ie2, oe2;
})();
function pc(e2) {
  if (e2.extension) {
    if ("string" != typeof e2.extension) throw new Error("Error starting dial out: extension must be a string");
    if (e2.extension.length > 20) throw new Error("Error starting dial out: extension length must be less than or equal to 20");
  }
  if (e2.waitBeforeExtensionDialSec) {
    if ("number" != typeof e2.waitBeforeExtensionDialSec) throw new Error("Error starting dial out: waitBeforeExtensionDialSec must be a number");
    if (e2.waitBeforeExtensionDialSec > 60) throw new Error("Error starting dial out: waitBeforeExtensionDialSec must be less than or equal to 60");
    if (!e2.extension) throw new Error("Error starting dial out: waitBeforeExtensionDialSec requires a phoneNumber and extension");
  }
}
function fc(e2, t2) {
  var n2 = {};
  for (var r2 in e2) if (e2[r2] instanceof MediaStreamTrack) console.warn("MediaStreamTrack found in props or cache.", r2), n2[r2] = aa;
  else if ("dailyConfig" === r2) {
    if (e2[r2].modifyLocalSdpHook) {
      var i2 = window._daily.instances[t2].customCallbacks || {};
      i2.modifyLocalSdpHook = e2[r2].modifyLocalSdpHook, window._daily.instances[t2].customCallbacks = i2, delete e2[r2].modifyLocalSdpHook;
    }
    if (e2[r2].modifyRemoteSdpHook) {
      var o2 = window._daily.instances[t2].customCallbacks || {};
      o2.modifyRemoteSdpHook = e2[r2].modifyRemoteSdpHook, window._daily.instances[t2].customCallbacks = o2, delete e2[r2].modifyRemoteSdpHook;
    }
    n2[r2] = e2[r2];
  } else n2[r2] = e2[r2];
  return n2;
}
function vc(e2) {
  var t2 = arguments.length > 2 ? arguments[2] : void 0;
  if (e2 !== gi) {
    var n2 = "".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " only supported after join.");
    throw t2 && (n2 += " ".concat(t2)), console.error(n2), new Error(n2);
  }
}
function gc(e2, t2) {
  return [vi, gi].includes(e2) || t2;
}
function mc(e2, t2) {
  var n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "This daily-js method", r2 = arguments.length > 3 ? arguments[3] : void 0;
  if (gc(e2, t2)) {
    var i2 = "".concat(n2, " not supported after joining a meeting.");
    throw r2 && (i2 += " ".concat(r2)), console.error(i2), new Error(i2);
  }
}
function yc(e2) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", n2 = arguments.length > 2 ? arguments[2] : void 0;
  if (!e2) {
    var r2 = "".concat(t2, arguments.length > 3 && void 0 !== arguments[3] && arguments[3] ? " requires preAuth() or startCamera() to initialize call state." : " requires preAuth(), startCamera(), or join() to initialize call state.");
    throw n2 && (r2 += " ".concat(n2)), console.error(r2), new Error(r2);
  }
}
function bc(e2) {
  if (e2) {
    var t2 = "A pre-call quality test is in progress. Please try ".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " again once testing has completed. Use stopTestCallQuality() to end it early.");
    throw console.error(t2), new Error(t2);
  }
}
function _c(e2) {
  if (!e2) {
    var t2 = "".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " is only supported on custom callObject instances");
    throw console.error(t2), new Error(t2);
  }
}
function wc(e2) {
  if (e2) {
    var t2 = "".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " is only supported as part of Daily's Prebuilt");
    throw console.error(t2), new Error(t2);
  }
}
function kc() {
  if (ma()) throw new Error("This daily-js method is not currently supported in React Native");
}
function Sc() {
  if (!ma()) throw new Error("This daily-js method is only supported in React Native");
}
function Mc(e2) {
  if (void 0 === e2) return true;
  var t2;
  if ("string" == typeof e2) t2 = e2;
  else try {
    t2 = JSON.stringify(e2), S(JSON.parse(t2), e2) || console.warn("The userData provided will be modified when serialized.");
  } catch (e3) {
    throw Error("userData must be serializable to JSON: ".concat(e3));
  }
  if (t2.length > 4096) throw Error("userData is too large (".concat(t2.length, " characters). Maximum size suppported is ").concat(4096, "."));
  return true;
}
function Ec(e2, t2) {
  for (var n2 = t2.allowAllParticipantsKey, r2 = function(e3) {
    var t3 = ["local"];
    return n2 || t3.push("*"), e3 && !t3.includes(e3);
  }, i2 = function(e3) {
    return !!(void 0 === e3.layer || Number.isInteger(e3.layer) && e3.layer >= 0 || "inherit" === e3.layer);
  }, o2 = function(e3) {
    return !!e3 && (!(e3.video && !i2(e3.video)) && !(e3.screenVideo && !i2(e3.screenVideo)));
  }, a2 = 0, s2 = Object.entries(e2); a2 < s2.length; a2++) {
    var c2 = v(s2[a2], 2), l2 = c2[0], u2 = c2[1];
    if (!r2(l2) || !o2(u2)) return false;
  }
  return true;
}
function Cc(e2) {
  if ("object" !== t(e2)) return false;
  for (var n2 = 0, r2 = Object.entries(e2); n2 < r2.length; n2++) {
    var i2 = v(r2[n2], 2), o2 = i2[0], a2 = i2[1];
    switch (o2) {
      case "video":
        if ("object" !== t(a2)) return false;
        for (var s2 = 0, c2 = Object.entries(a2); s2 < c2.length; s2++) {
          var l2 = v(c2[s2], 2), u2 = l2[0], d2 = l2[1];
          switch (u2) {
            case "processor":
              if (!Pc(d2)) return false;
              break;
            case "settings":
              if (!Ac(d2)) return false;
              break;
            default:
              return false;
          }
        }
        break;
      case "audio":
        if ("object" !== t(a2)) return false;
        for (var h2 = 0, p2 = Object.entries(a2); h2 < p2.length; h2++) {
          var f2 = v(p2[h2], 2), g2 = f2[0], m2 = f2[1];
          switch (g2) {
            case "processor":
              if (!Oc(m2)) return false;
              break;
            case "settings":
              if (!Ac(m2)) return false;
              break;
            default:
              return false;
          }
        }
        break;
      default:
        return false;
    }
  }
  return true;
}
function Tc(e2, t2, n2) {
  var r2, i2 = [];
  e2.video && e2.video.processor && (Ea(null !== (r2 = null == t2 ? void 0 : t2.useLegacyVideoProcessor) && void 0 !== r2 && r2) || (e2.video.settings ? delete e2.video.processor : delete e2.video, i2.push("video")));
  e2.audio && e2.audio.processor && (Ca() || (e2.audio.settings ? delete e2.audio.processor : delete e2.audio, i2.push("audio"))), i2.length > 0 && console.error("Ignoring settings for browser- or platform-unsupported input processor(s): ".concat(i2.join(", "))), e2.audio && e2.audio.settings && (e2.audio.settings.customTrack ? (n2.audioTrack = e2.audio.settings.customTrack, e2.audio.settings = { customTrack: aa }) : delete n2.audioTrack), e2.video && e2.video.settings && (e2.video.settings.customTrack ? (n2.videoTrack = e2.video.settings.customTrack, e2.video.settings = { customTrack: aa }) : delete n2.videoTrack);
}
function Oc(e2) {
  if (ma()) return console.warn("Video processing is not yet supported in React Native"), false;
  var n2 = ["type"];
  return !!e2 && ("object" === t(e2) && (Object.keys(e2).filter(function(e3) {
    return !n2.includes(e3);
  }).forEach(function(t2) {
    console.warn("invalid key inputSettings -> audio -> processor : ".concat(t2)), delete e2[t2];
  }), !!(function(e3) {
    if ("string" != typeof e3) return false;
    if (!Object.values(ca).includes(e3)) return console.error("inputSettings audio processor type invalid"), false;
    return true;
  })(e2.type)));
}
function Pc(e2) {
  if (ma()) return console.warn("Video processing is not yet supported in React Native"), false;
  var n2 = ["type", "config"];
  if (!e2) return false;
  if ("object" !== t(e2)) return false;
  if (!(function(e3) {
    if ("string" != typeof e3) return false;
    if (!Object.values(sa).includes(e3)) return console.error("inputSettings video processor type invalid"), false;
    return true;
  })(e2.type)) return false;
  if (e2.config) {
    if ("object" !== t(e2.config)) return false;
    if (!(function(e3, t2) {
      var n3 = Object.keys(t2);
      if (0 === n3.length) return true;
      var r2 = "invalid object in inputSettings -> video -> processor -> config";
      switch (e3) {
        case sa.BGBLUR:
          return n3.length > 1 || "strength" !== n3[0] ? (console.error(r2), false) : !("number" != typeof t2.strength || t2.strength <= 0 || t2.strength > 1 || isNaN(t2.strength)) || (console.error("".concat(r2, "; expected: {0 < strength <= 1}, got: ").concat(t2.strength)), false);
        case sa.BGIMAGE:
          return !(void 0 !== t2.source && !(function(e4) {
            if ("default" === e4.source) return e4.type = "default", true;
            if (e4.source instanceof ArrayBuffer) return true;
            if (K(e4.source)) return e4.type = "url", !!(function(e5) {
              var t4 = new URL(e5), n5 = t4.pathname;
              if ("data:" === t4.protocol) try {
                var r3 = n5.substring(n5.indexOf(":") + 1, n5.indexOf(";")).split("/")[1];
                return ha.includes(r3);
              } catch (e6) {
                return console.error("failed to deduce blob content type", e6), false;
              }
              var i2 = n5.split(".").at(-1).toLowerCase().trim();
              return ha.includes(i2);
            })(e4.source) || (console.error("invalid image type; supported types: [".concat(ha.join(", "), "]")), false);
            return t3 = e4.source, n4 = Number(t3), isNaN(n4) || !Number.isInteger(n4) || n4 <= 0 || n4 > 10 ? (console.error("invalid image selection; must be an int, > 0, <= ".concat(10)), false) : (e4.type = "daily-preselect", true);
            var t3, n4;
          })(t2));
        default:
          return true;
      }
    })(e2.type, e2.config)) return false;
  }
  return Object.keys(e2).filter(function(e3) {
    return !n2.includes(e3);
  }).forEach(function(t2) {
    console.warn("invalid key inputSettings -> video -> processor : ".concat(t2)), delete e2[t2];
  }), true;
}
function Ac(e2) {
  return "object" === t(e2) && (!e2.customTrack || e2.customTrack instanceof MediaStreamTrack);
}
function xc() {
  var e2 = Object.values(sa).join(" | "), t2 = Object.values(ca).join(" | ");
  return "inputSettings must be of the form: { video?: { processor?: { type: [ ".concat(e2, " ], config?: {} } }, audio?: { processor: {type: [ ").concat(t2, " ] } } }");
}
function jc(e2) {
  var t2 = e2.allowAllParticipantsKey;
  return "receiveSettings must be of the form { [<remote participant id> | ".concat(Pi).concat(t2 ? ' | "'.concat("*", '"') : "", "]: ") + '{ [video: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]], [screenVideo: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]] }}}';
}
function Ic() {
  return "customIntegrations should be an object of type ".concat(JSON.stringify(sc), ".");
}
function Lc(e2) {
  if (e2 && "object" !== t(e2) || Array.isArray(e2)) return console.error("customTrayButtons should be an Object of the type ".concat(JSON.stringify(ac), ".")), false;
  if (e2) for (var n2 = 0, r2 = Object.entries(e2); n2 < r2.length; n2++) for (var i2 = v(r2[n2], 1)[0], o2 = 0, a2 = Object.entries(e2[i2]); o2 < a2.length; o2++) {
    var s2 = v(a2[o2], 2), c2 = s2[0], l2 = s2[1], u2 = ac.id[c2];
    if (!u2) return console.error("customTrayButton does not support key ".concat(c2)), false;
    switch (c2) {
      case "iconPath":
      case "iconPathDarkMode":
        if (!K(l2)) return console.error("customTrayButton ".concat(c2, " should be a url.")), false;
        break;
      case "visualState":
        if (!["default", "sidebar-open", "active"].includes(l2)) return console.error("customTrayButton ".concat(c2, " should be ").concat(u2, ". Got: ").concat(l2)), false;
        break;
      default:
        if (t(l2) !== u2) return console.error("customTrayButton ".concat(c2, " should be a ").concat(u2, ".")), false;
    }
  }
  return true;
}
function Dc(e2) {
  if (!e2 || e2 && "object" !== t(e2) || Array.isArray(e2)) return console.error(Ic()), false;
  for (var n2 = function(e3) {
    return "".concat(e3, " should be ").concat(sc.id[e3]);
  }, r2 = function(e3, t2) {
    return console.error("customIntegration ".concat(e3, ": ").concat(t2));
  }, i2 = 0, o2 = Object.entries(e2); i2 < o2.length; i2++) {
    var a2 = v(o2[i2], 1)[0];
    if (!("label" in e2[a2])) return r2(a2, "label is required"), false;
    if (!("location" in e2[a2])) return r2(a2, "location is required"), false;
    if (!("src" in e2[a2]) && !("srcdoc" in e2[a2])) return r2(a2, "src or srcdoc is required"), false;
    for (var s2 = 0, c2 = Object.entries(e2[a2]); s2 < c2.length; s2++) {
      var l2 = v(c2[s2], 2), u2 = l2[0], d2 = l2[1];
      switch (u2) {
        case "allow":
        case "csp":
        case "name":
        case "referrerPolicy":
        case "sandbox":
          if ("string" != typeof d2) return r2(a2, n2(u2)), false;
          break;
        case "iconURL":
          if (!K(d2)) return r2(a2, "".concat(u2, " should be a url")), false;
          break;
        case "src":
          if ("srcdoc" in e2[a2]) return r2(a2, "cannot have both src and srcdoc"), false;
          if (!K(d2)) return r2(a2, 'src "'.concat(d2, '" is not a valid URL')), false;
          break;
        case "srcdoc":
          if ("src" in e2[a2]) return r2(a2, "cannot have both src and srcdoc"), false;
          if ("string" != typeof d2) return r2(a2, n2(u2)), false;
          break;
        case "location":
          if (!["main", "sidebar"].includes(d2)) return r2(a2, n2(u2)), false;
          break;
        case "controlledBy":
          if ("*" !== d2 && "owners" !== d2 && (!Array.isArray(d2) || d2.some(function(e3) {
            return "string" != typeof e3;
          }))) return r2(a2, n2(u2)), false;
          break;
        case "shared":
          if ((!Array.isArray(d2) || d2.some(function(e3) {
            return "string" != typeof e3;
          })) && "owners" !== d2 && "boolean" != typeof d2) return r2(a2, n2(u2)), false;
          break;
        default:
          if (!sc.id[u2]) return console.error("customIntegration does not support key ".concat(u2)), false;
      }
    }
  }
  return true;
}
function Nc(e2, n2) {
  if (void 0 === n2) return false;
  switch (t(n2)) {
    case "string":
      return t(e2) === n2;
    case "object":
      if ("object" !== t(e2)) return false;
      for (var r2 in e2) if (!Nc(e2[r2], n2[r2])) return false;
      return true;
    default:
      return false;
  }
}
function Fc(e2, t2) {
  var n2 = e2.sessionId, r2 = e2.toEndPoint, i2 = e2.callerId, o2 = e2.useSipRefer;
  if (!n2 || !r2) throw new Error("".concat(t2, "() requires a sessionId and toEndPoint"));
  if ("string" != typeof n2 || "string" != typeof r2) throw new Error("Invalid paramater: sessionId and toEndPoint must be of type string");
  if (o2 && !r2.startsWith("sip:")) throw new Error('"toEndPoint" must be a "sip" address');
  if (!r2.startsWith("sip:") && !r2.startsWith("+")) throw new Error("toEndPoint: ".concat(r2, ' must starts with either "sip:" or "+"'));
  if (i2 && "string" != typeof i2) throw new Error("callerId must be of type string");
  if (i2 && !r2.startsWith("+")) throw new Error("callerId is only valid when transferring to a PSTN number");
}
function Bc(e2) {
  if ("object" !== t(e2)) throw new Error('RemoteMediaPlayerSettings: must be "object" type');
  if (e2.state && !Object.values(la).includes(e2.state)) throw new Error("Invalid value for RemoteMediaPlayerSettings.state, valid values are: " + JSON.stringify(la));
  if (e2.volume) {
    if ("number" != typeof e2.volume) throw new Error('RemoteMediaPlayerSettings.volume: must be "number" type');
    if (e2.volume < 0 || e2.volume > 2) throw new Error("RemoteMediaPlayerSettings.volume: must be between 0.0 - 2.0");
  }
}
function Rc(e2, t2, n2) {
  return !("number" != typeof e2 || e2 < t2 || e2 > n2);
}
function Uc(e2, t2) {
  return e2 && !t2 && delete e2.data, e2;
}

// node_modules/@pipecat-ai/small-webrtc-transport/dist/index.module.js
var import_events2 = __toESM(require_events());
var import_cloneDeep = __toESM(require_cloneDeep());
function $parcel$export2(e2, n2, v2, s2) {
  Object.defineProperty(e2, n2, { get: v2, set: s2, enumerable: true, configurable: true });
}
function $13c8c94ddb82851d$export$7f8f33b9b54c8307() {
  return typeof navigator?.mediaDevices?.getDisplayMedia === "function";
}
var $90e51b630ebb9a32$export$13afda237b1c9846 = class {
  /**
  * Converts Float32Array of amplitude data to ArrayBuffer in Int16Array format
  * @param {Float32Array} float32Array
  * @returns {ArrayBuffer}
  */
  static floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i2 = 0; i2 < float32Array.length; i2++, offset += 2) {
      let s2 = Math.max(-1, Math.min(1, float32Array[i2]));
      view.setInt16(offset, s2 < 0 ? s2 * 32768 : s2 * 32767, true);
    }
    return buffer;
  }
  /**
  * Concatenates two ArrayBuffers
  * @param {ArrayBuffer} leftBuffer
  * @param {ArrayBuffer} rightBuffer
  * @returns {ArrayBuffer}
  */
  static mergeBuffers(leftBuffer, rightBuffer) {
    const tmpArray = new Uint8Array(leftBuffer.byteLength + rightBuffer.byteLength);
    tmpArray.set(new Uint8Array(leftBuffer), 0);
    tmpArray.set(new Uint8Array(rightBuffer), leftBuffer.byteLength);
    return tmpArray.buffer;
  }
  /**
  * Packs data into an Int16 format
  * @private
  * @param {number} size 0 = 1x Int16, 1 = 2x Int16
  * @param {number} arg value to pack
  * @returns
  */
  _packData(size, arg) {
    return [
      new Uint8Array([
        arg,
        arg >> 8
      ]),
      new Uint8Array([
        arg,
        arg >> 8,
        arg >> 16,
        arg >> 24
      ])
    ][size];
  }
  /**
  * Packs audio into "audio/wav" Blob
  * @param {number} sampleRate
  * @param {{bitsPerSample: number, channels: Array<Float32Array>, data: Int16Array}} audio
  * @returns {WavPackerAudioType}
  */
  pack(sampleRate, audio) {
    if (!audio?.bitsPerSample) throw new Error(`Missing "bitsPerSample"`);
    else if (!audio?.channels) throw new Error(`Missing "channels"`);
    else if (!audio?.data) throw new Error(`Missing "data"`);
    const { bitsPerSample, channels, data } = audio;
    const output = [
      // Header
      "RIFF",
      this._packData(1, 52),
      "WAVE",
      // chunk 1
      "fmt ",
      this._packData(1, 16),
      this._packData(0, 1),
      this._packData(0, channels.length),
      this._packData(1, sampleRate),
      this._packData(1, sampleRate * channels.length * bitsPerSample / 8),
      this._packData(0, channels.length * bitsPerSample / 8),
      this._packData(0, bitsPerSample),
      // chunk 2
      "data",
      this._packData(1, channels[0].length * channels.length * bitsPerSample / 8),
      data
    ];
    const blob = new Blob(output, {
      type: "audio/mpeg"
    });
    const url = URL.createObjectURL(blob);
    return {
      blob,
      url,
      channelCount: channels.length,
      sampleRate,
      duration: data.byteLength / (channels.length * sampleRate * 2)
    };
  }
};
globalThis.WavPacker = $90e51b630ebb9a32$export$13afda237b1c9846;
var $25b1294e29240c0a$var$octave8Frequencies = [
  4186.01,
  4434.92,
  4698.63,
  4978.03,
  5274.04,
  5587.65,
  5919.91,
  6271.93,
  6644.88,
  7040,
  7458.62,
  7902.13
];
var $25b1294e29240c0a$var$octave8FrequencyLabels = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];
var $25b1294e29240c0a$export$776c63898ae5b636 = [];
var $25b1294e29240c0a$export$facd167cc27ea9b0 = [];
for (let i2 = 1; i2 <= 8; i2++) for (let f2 = 0; f2 < $25b1294e29240c0a$var$octave8Frequencies.length; f2++) {
  const freq = $25b1294e29240c0a$var$octave8Frequencies[f2];
  $25b1294e29240c0a$export$776c63898ae5b636.push(freq / Math.pow(2, 8 - i2));
  $25b1294e29240c0a$export$facd167cc27ea9b0.push($25b1294e29240c0a$var$octave8FrequencyLabels[f2] + i2);
}
var $25b1294e29240c0a$var$voiceFrequencyRange = [
  32,
  2e3
];
var $25b1294e29240c0a$export$dbc1581ed2cfa183 = $25b1294e29240c0a$export$776c63898ae5b636.filter((_2, i2) => {
  return $25b1294e29240c0a$export$776c63898ae5b636[i2] > $25b1294e29240c0a$var$voiceFrequencyRange[0] && $25b1294e29240c0a$export$776c63898ae5b636[i2] < $25b1294e29240c0a$var$voiceFrequencyRange[1];
});
var $25b1294e29240c0a$export$30a6f2881311088f = $25b1294e29240c0a$export$facd167cc27ea9b0.filter((_2, i2) => {
  return $25b1294e29240c0a$export$776c63898ae5b636[i2] > $25b1294e29240c0a$var$voiceFrequencyRange[0] && $25b1294e29240c0a$export$776c63898ae5b636[i2] < $25b1294e29240c0a$var$voiceFrequencyRange[1];
});
var $4aa7d69f60688511$export$2c3136da0bf130f9 = class _$4aa7d69f60688511$export$2c3136da0bf130f9 {
  /**
  * Retrieves frequency domain data from an AnalyserNode adjusted to a decibel range
  * returns human-readable formatting and labels
  * @param {AnalyserNode} analyser
  * @param {number} sampleRate
  * @param {Float32Array} [fftResult]
  * @param {"frequency"|"music"|"voice"} [analysisType]
  * @param {number} [minDecibels] default -100
  * @param {number} [maxDecibels] default -30
  * @returns {AudioAnalysisOutputType}
  */
  static getFrequencies(analyser, sampleRate, fftResult, analysisType = "frequency", minDecibels = -100, maxDecibels = -30) {
    if (!fftResult) {
      fftResult = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(fftResult);
    }
    const nyquistFrequency = sampleRate / 2;
    const frequencyStep = 1 / fftResult.length * nyquistFrequency;
    let outputValues;
    let frequencies;
    let labels;
    if (analysisType === "music" || analysisType === "voice") {
      const useFrequencies = analysisType === "voice" ? (0, $25b1294e29240c0a$export$dbc1581ed2cfa183) : (0, $25b1294e29240c0a$export$776c63898ae5b636);
      const aggregateOutput = Array(useFrequencies.length).fill(minDecibels);
      for (let i2 = 0; i2 < fftResult.length; i2++) {
        const frequency = i2 * frequencyStep;
        const amplitude = fftResult[i2];
        for (let n2 = useFrequencies.length - 1; n2 >= 0; n2--) if (frequency > useFrequencies[n2]) {
          aggregateOutput[n2] = Math.max(aggregateOutput[n2], amplitude);
          break;
        }
      }
      outputValues = aggregateOutput;
      frequencies = analysisType === "voice" ? (0, $25b1294e29240c0a$export$dbc1581ed2cfa183) : (0, $25b1294e29240c0a$export$776c63898ae5b636);
      labels = analysisType === "voice" ? (0, $25b1294e29240c0a$export$30a6f2881311088f) : (0, $25b1294e29240c0a$export$facd167cc27ea9b0);
    } else {
      outputValues = Array.from(fftResult);
      frequencies = outputValues.map((_2, i2) => frequencyStep * i2);
      labels = frequencies.map((f2) => `${f2.toFixed(2)} Hz`);
    }
    const normalizedOutput = outputValues.map((v2) => {
      return Math.max(0, Math.min((v2 - minDecibels) / (maxDecibels - minDecibels), 1));
    });
    const values = new Float32Array(normalizedOutput);
    return {
      values,
      frequencies,
      labels
    };
  }
  /**
  * Creates a new AudioAnalysis instance for an HTMLAudioElement
  * @param {HTMLAudioElement} audioElement
  * @param {AudioBuffer|null} [audioBuffer] If provided, will cache all frequency domain data from the buffer
  * @returns {AudioAnalysis}
  */
  constructor(audioElement, audioBuffer = null) {
    this.fftResults = [];
    if (audioBuffer) {
      const { length, sampleRate } = audioBuffer;
      const offlineAudioContext = new OfflineAudioContext({
        length,
        sampleRate
      });
      const source = offlineAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      const analyser = offlineAudioContext.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.1;
      source.connect(analyser);
      const renderQuantumInSeconds = 1 / 60;
      const durationInSeconds = length / sampleRate;
      const analyze = (index) => {
        const suspendTime = renderQuantumInSeconds * index;
        if (suspendTime < durationInSeconds) offlineAudioContext.suspend(suspendTime).then(() => {
          const fftResult = new Float32Array(analyser.frequencyBinCount);
          analyser.getFloatFrequencyData(fftResult);
          this.fftResults.push(fftResult);
          analyze(index + 1);
        });
        if (index === 1) offlineAudioContext.startRendering();
        else offlineAudioContext.resume();
      };
      source.start(0);
      analyze(1);
      this.audio = audioElement;
      this.context = offlineAudioContext;
      this.analyser = analyser;
      this.sampleRate = sampleRate;
      this.audioBuffer = audioBuffer;
    } else {
      const audioContext = new AudioContext();
      const track2 = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.1;
      track2.connect(analyser);
      analyser.connect(audioContext.destination);
      this.audio = audioElement;
      this.context = audioContext;
      this.analyser = analyser;
      this.sampleRate = this.context.sampleRate;
      this.audioBuffer = null;
    }
  }
  /**
  * Gets the current frequency domain data from the playing audio track
  * @param {"frequency"|"music"|"voice"} [analysisType]
  * @param {number} [minDecibels] default -100
  * @param {number} [maxDecibels] default -30
  * @returns {AudioAnalysisOutputType}
  */
  getFrequencies(analysisType = "frequency", minDecibels = -100, maxDecibels = -30) {
    let fftResult = null;
    if (this.audioBuffer && this.fftResults.length) {
      const pct = this.audio.currentTime / this.audio.duration;
      const index = Math.min(pct * this.fftResults.length | 0, this.fftResults.length - 1);
      fftResult = this.fftResults[index];
    }
    return _$4aa7d69f60688511$export$2c3136da0bf130f9.getFrequencies(this.analyser, this.sampleRate, fftResult, analysisType, minDecibels, maxDecibels);
  }
  /**
  * Resume the internal AudioContext if it was suspended due to the lack of
  * user interaction when the AudioAnalysis was instantiated.
  * @returns {Promise<true>}
  */
  async resumeIfSuspended() {
    if (this.context.state === "suspended") await this.context.resume();
    return true;
  }
};
globalThis.AudioAnalysis = $4aa7d69f60688511$export$2c3136da0bf130f9;
var $a2a1b43080b222e4$export$50b76700e2b15e9 = `
class StreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.hasStarted = false;
    this.hasInterrupted = false;
    this.outputBuffers = [];
    this.bufferLength = 128;
    this.write = { buffer: new Float32Array(this.bufferLength), trackId: null };
    this.writeOffset = 0;
    this.trackSampleOffsets = {};
    this.port.onmessage = (event) => {
      if (event.data) {
        const payload = event.data;
        if (payload.event === 'write') {
          const int16Array = payload.buffer;
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 0x8000; // Convert Int16 to Float32
          }
          this.writeData(float32Array, payload.trackId);
        } else if (
          payload.event === 'offset' ||
          payload.event === 'interrupt'
        ) {
          const requestId = payload.requestId;
          const trackId = this.write.trackId;
          const offset = this.trackSampleOffsets[trackId] || 0;
          this.port.postMessage({
            event: 'offset',
            requestId,
            trackId,
            offset,
          });
          if (payload.event === 'interrupt') {
            this.hasInterrupted = true;
          }
        } else {
          throw new Error(\`Unhandled event "\${payload.event}"\`);
        }
      }
    };
  }

  writeData(float32Array, trackId = null) {
    let { buffer } = this.write;
    let offset = this.writeOffset;
    for (let i = 0; i < float32Array.length; i++) {
      buffer[offset++] = float32Array[i];
      if (offset >= buffer.length) {
        this.outputBuffers.push(this.write);
        this.write = { buffer: new Float32Array(this.bufferLength), trackId };
        buffer = this.write.buffer;
        offset = 0;
      }
    }
    this.writeOffset = offset;
    return true;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannelData = output[0];
    const outputBuffers = this.outputBuffers;
    if (this.hasInterrupted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else if (outputBuffers.length) {
      this.hasStarted = true;
      const { buffer, trackId } = outputBuffers.shift();
      for (let i = 0; i < outputChannelData.length; i++) {
        outputChannelData[i] = buffer[i] || 0;
      }
      if (trackId) {
        this.trackSampleOffsets[trackId] =
          this.trackSampleOffsets[trackId] || 0;
        this.trackSampleOffsets[trackId] += buffer.length;
      }
      return true;
    } else if (this.hasStarted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else {
      return true;
    }
  }
}

registerProcessor('stream_processor', StreamProcessor);
`;
var $a2a1b43080b222e4$var$script = new Blob([
  $a2a1b43080b222e4$export$50b76700e2b15e9
], {
  type: "application/javascript"
});
var $a2a1b43080b222e4$var$src = URL.createObjectURL($a2a1b43080b222e4$var$script);
var $a2a1b43080b222e4$export$bfa8c596114d74df = $a2a1b43080b222e4$var$src;
var $17ba052b4c7c2439$export$9698d62c78b8f366 = class {
  /**
  * Creates a new WavStreamPlayer instance
  * @param {{sampleRate?: number}} options
  * @returns {WavStreamPlayer}
  */
  constructor({ sampleRate = 44100 } = {}) {
    this.scriptSrc = (0, $a2a1b43080b222e4$export$bfa8c596114d74df);
    this.sampleRate = sampleRate;
    this.context = null;
    this.stream = null;
    this.analyser = null;
    this.trackSampleOffsets = {};
    this.interruptedTrackIds = {};
  }
  /**
  * Connects the audio context and enables output to speakers
  * @returns {Promise<true>}
  */
  async connect() {
    this.context = new AudioContext({
      sampleRate: this.sampleRate
    });
    if (this._speakerID) this.context.setSinkId(this._speakerID);
    if (this.context.state === "suspended") await this.context.resume();
    try {
      await this.context.audioWorklet.addModule(this.scriptSrc);
    } catch (e2) {
      console.error(e2);
      throw new Error(`Could not add audioWorklet module: ${this.scriptSrc}`);
    }
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.1;
    this.analyser = analyser;
    return true;
  }
  /**
  * Gets the current frequency domain data from the playing track
  * @param {"frequency"|"music"|"voice"} [analysisType]
  * @param {number} [minDecibels] default -100
  * @param {number} [maxDecibels] default -30
  * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
  */
  getFrequencies(analysisType = "frequency", minDecibels = -100, maxDecibels = -30) {
    if (!this.analyser) throw new Error("Not connected, please call .connect() first");
    return (0, $4aa7d69f60688511$export$2c3136da0bf130f9).getFrequencies(this.analyser, this.sampleRate, null, analysisType, minDecibels, maxDecibels);
  }
  /**
  * @param {string} speaker deviceId
  */
  async updateSpeaker(speaker) {
    const _prevSpeaker = this._speakerID;
    this._speakerID = speaker;
    if (this.context) try {
      if (speaker === "default") await this.context.setSinkId();
      else await this.context.setSinkId(speaker);
    } catch (e2) {
      console.error(`Could not set sinkId to ${speaker}: ${e2}`);
      this._speakerID = _prevSpeaker;
    }
  }
  /**
  * Starts audio streaming
  * @private
  * @returns {Promise<true>}
  */
  _start() {
    const streamNode = new AudioWorkletNode(this.context, "stream_processor");
    streamNode.connect(this.context.destination);
    streamNode.port.onmessage = (e2) => {
      const { event } = e2.data;
      if (event === "stop") {
        streamNode.disconnect();
        this.stream = null;
      } else if (event === "offset") {
        const { requestId, trackId, offset } = e2.data;
        const currentTime = offset / this.sampleRate;
        this.trackSampleOffsets[requestId] = {
          trackId,
          offset,
          currentTime
        };
      }
    };
    this.analyser.disconnect();
    streamNode.connect(this.analyser);
    this.stream = streamNode;
    return true;
  }
  /**
  * Adds 16BitPCM data to the currently playing audio stream
  * You can add chunks beyond the current play point and they will be queued for play
  * @param {ArrayBuffer|Int16Array} arrayBuffer
  * @param {string} [trackId]
  * @returns {Int16Array}
  */
  add16BitPCM(arrayBuffer, trackId = "default") {
    if (typeof trackId !== "string") throw new Error(`trackId must be a string`);
    else if (this.interruptedTrackIds[trackId]) return;
    if (!this.stream) this._start();
    let buffer;
    if (arrayBuffer instanceof Int16Array) buffer = arrayBuffer;
    else if (arrayBuffer instanceof ArrayBuffer) buffer = new Int16Array(arrayBuffer);
    else throw new Error(`argument must be Int16Array or ArrayBuffer`);
    this.stream.port.postMessage({
      event: "write",
      buffer,
      trackId
    });
    return buffer;
  }
  /**
  * Gets the offset (sample count) of the currently playing stream
  * @param {boolean} [interrupt]
  * @returns {{trackId: string|null, offset: number, currentTime: number}}
  */
  async getTrackSampleOffset(interrupt = false) {
    if (!this.stream) return null;
    const requestId = crypto.randomUUID();
    this.stream.port.postMessage({
      event: interrupt ? "interrupt" : "offset",
      requestId
    });
    let trackSampleOffset;
    while (!trackSampleOffset) {
      trackSampleOffset = this.trackSampleOffsets[requestId];
      await new Promise((r2) => setTimeout(() => r2(), 1));
    }
    const { trackId } = trackSampleOffset;
    if (interrupt && trackId) this.interruptedTrackIds[trackId] = true;
    return trackSampleOffset;
  }
  /**
  * Strips the current stream and returns the sample offset of the audio
  * @param {boolean} [interrupt]
  * @returns {{trackId: string|null, offset: number, currentTime: number}}
  */
  async interrupt() {
    return this.getTrackSampleOffset(true);
  }
};
globalThis.WavStreamPlayer = $17ba052b4c7c2439$export$9698d62c78b8f366;
var $a1f3ec78ca8ae68d$var$AudioProcessorWorklet = `
class AudioProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = this.receive.bind(this);
    this.initialize();
  }

  initialize() {
    this.foundAudio = false;
    this.recording = false;
    this.chunks = [];
  }

  /**
   * Concatenates sampled chunks into channels
   * Format is chunk[Left[], Right[]]
   */
  readChannelData(chunks, channel = -1, maxChannels = 9) {
    let channelLimit;
    if (channel !== -1) {
      if (chunks[0] && chunks[0].length - 1 < channel) {
        throw new Error(
          \`Channel \${channel} out of range: max \${chunks[0].length}\`
        );
      }
      channelLimit = channel + 1;
    } else {
      channel = 0;
      channelLimit = Math.min(chunks[0] ? chunks[0].length : 1, maxChannels);
    }
    const channels = [];
    for (let n = channel; n < channelLimit; n++) {
      const length = chunks.reduce((sum, chunk) => {
        return sum + chunk[n].length;
      }, 0);
      const buffers = chunks.map((chunk) => chunk[n]);
      const result = new Float32Array(length);
      let offset = 0;
      for (let i = 0; i < buffers.length; i++) {
        result.set(buffers[i], offset);
        offset += buffers[i].length;
      }
      channels[n] = result;
    }
    return channels;
  }

  /**
   * Combines parallel audio data into correct format,
   * channels[Left[], Right[]] to float32Array[LRLRLRLR...]
   */
  formatAudioData(channels) {
    if (channels.length === 1) {
      // Simple case is only one channel
      const float32Array = channels[0].slice();
      const meanValues = channels[0].slice();
      return { float32Array, meanValues };
    } else {
      const float32Array = new Float32Array(
        channels[0].length * channels.length
      );
      const meanValues = new Float32Array(channels[0].length);
      for (let i = 0; i < channels[0].length; i++) {
        const offset = i * channels.length;
        let meanValue = 0;
        for (let n = 0; n < channels.length; n++) {
          float32Array[offset + n] = channels[n][i];
          meanValue += channels[n][i];
        }
        meanValues[i] = meanValue / channels.length;
      }
      return { float32Array, meanValues };
    }
  }

  /**
   * Converts 32-bit float data to 16-bit integers
   */
  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  /**
   * Retrieves the most recent amplitude values from the audio stream
   * @param {number} channel
   */
  getValues(channel = -1) {
    const channels = this.readChannelData(this.chunks, channel);
    const { meanValues } = this.formatAudioData(channels);
    return { meanValues, channels };
  }

  /**
   * Exports chunks as an audio/wav file
   */
  export() {
    const channels = this.readChannelData(this.chunks);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const audioData = this.floatTo16BitPCM(float32Array);
    return {
      meanValues: meanValues,
      audio: {
        bitsPerSample: 16,
        channels: channels,
        data: audioData,
      },
    };
  }

  receive(e) {
    const { event, id } = e.data;
    let receiptData = {};
    switch (event) {
      case 'start':
        this.recording = true;
        break;
      case 'stop':
        this.recording = false;
        break;
      case 'clear':
        this.initialize();
        break;
      case 'export':
        receiptData = this.export();
        break;
      case 'read':
        receiptData = this.getValues();
        break;
      default:
        break;
    }
    // Always send back receipt
    this.port.postMessage({ event: 'receipt', id, data: receiptData });
  }

  sendChunk(chunk) {
    const channels = this.readChannelData([chunk]);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const rawAudioData = this.floatTo16BitPCM(float32Array);
    const monoAudioData = this.floatTo16BitPCM(meanValues);
    this.port.postMessage({
      event: 'chunk',
      data: {
        mono: monoAudioData,
        raw: rawAudioData,
      },
    });
  }

  process(inputList, outputList, parameters) {
    // Copy input to output (e.g. speakers)
    // Note that this creates choppy sounds with Mac products
    const sourceLimit = Math.min(inputList.length, outputList.length);
    for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
      const input = inputList[inputNum];
      const output = outputList[inputNum];
      const channelCount = Math.min(input.length, output.length);
      for (let channelNum = 0; channelNum < channelCount; channelNum++) {
        input[channelNum].forEach((sample, i) => {
          output[channelNum][i] = sample;
        });
      }
    }
    const inputs = inputList[0];
    // There's latency at the beginning of a stream before recording starts
    // Make sure we actually receive audio data before we start storing chunks
    let sliceIndex = 0;
    if (!this.foundAudio) {
      for (const channel of inputs) {
        sliceIndex = 0; // reset for each channel
        if (this.foundAudio) {
          break;
        }
        if (channel) {
          for (const value of channel) {
            if (value !== 0) {
              // find only one non-zero entry in any channel
              this.foundAudio = true;
              break;
            } else {
              sliceIndex++;
            }
          }
        }
      }
    }
    if (inputs && inputs[0] && this.foundAudio && this.recording) {
      // We need to copy the TypedArray, because the \`process\`
      // internals will reuse the same buffer to hold each input
      const chunk = inputs.map((input) => input.slice(sliceIndex));
      this.chunks.push(chunk);
      this.sendChunk(chunk);
    }
    return true;
  }
}

registerProcessor('audio_processor', AudioProcessor);
`;
var $a1f3ec78ca8ae68d$var$script = new Blob([
  $a1f3ec78ca8ae68d$var$AudioProcessorWorklet
], {
  type: "application/javascript"
});
var $a1f3ec78ca8ae68d$var$src = URL.createObjectURL($a1f3ec78ca8ae68d$var$script);
var $a1f3ec78ca8ae68d$export$1f65f50a8cbff43c = $a1f3ec78ca8ae68d$var$src;
var $58a7d939ec2b36fc$export$439b217ca659a877 = class {
  /**
  * Create a new WavRecorder instance
  * @param {{sampleRate?: number, outputToSpeakers?: boolean, debug?: boolean}} [options]
  * @returns {WavRecorder}
  */
  constructor({ sampleRate = 44100, outputToSpeakers = false, debug = false } = {}) {
    this.scriptSrc = (0, $a1f3ec78ca8ae68d$export$1f65f50a8cbff43c);
    this.sampleRate = sampleRate;
    this.outputToSpeakers = outputToSpeakers;
    this.debug = !!debug;
    this._deviceChangeCallback = null;
    this._deviceErrorCallback = null;
    this._devices = [];
    this.deviceSelection = null;
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.node = null;
    this.recording = false;
    this._lastEventId = 0;
    this.eventReceipts = {};
    this.eventTimeout = 5e3;
    this._chunkProcessor = () => {
    };
    this._chunkProcessorSize = void 0;
    this._chunkProcessorBuffer = {
      raw: new ArrayBuffer(0),
      mono: new ArrayBuffer(0)
    };
  }
  /**
  * Decodes audio data from multiple formats to a Blob, url, Float32Array and AudioBuffer
  * @param {Blob|Float32Array|Int16Array|ArrayBuffer|number[]} audioData
  * @param {number} sampleRate
  * @param {number} fromSampleRate
  * @returns {Promise<DecodedAudioType>}
  */
  static async decode(audioData, sampleRate = 44100, fromSampleRate = -1) {
    const context = new AudioContext({
      sampleRate
    });
    let arrayBuffer;
    let blob;
    if (audioData instanceof Blob) {
      if (fromSampleRate !== -1) throw new Error(`Can not specify "fromSampleRate" when reading from Blob`);
      blob = audioData;
      arrayBuffer = await blob.arrayBuffer();
    } else if (audioData instanceof ArrayBuffer) {
      if (fromSampleRate !== -1) throw new Error(`Can not specify "fromSampleRate" when reading from ArrayBuffer`);
      arrayBuffer = audioData;
      blob = new Blob([
        arrayBuffer
      ], {
        type: "audio/wav"
      });
    } else {
      let float32Array;
      let data;
      if (audioData instanceof Int16Array) {
        data = audioData;
        float32Array = new Float32Array(audioData.length);
        for (let i2 = 0; i2 < audioData.length; i2++) float32Array[i2] = audioData[i2] / 32768;
      } else if (audioData instanceof Float32Array) float32Array = audioData;
      else if (audioData instanceof Array) float32Array = new Float32Array(audioData);
      else throw new Error(`"audioData" must be one of: Blob, Float32Arrray, Int16Array, ArrayBuffer, Array<number>`);
      if (fromSampleRate === -1) throw new Error(`Must specify "fromSampleRate" when reading from Float32Array, In16Array or Array`);
      else if (fromSampleRate < 3e3) throw new Error(`Minimum "fromSampleRate" is 3000 (3kHz)`);
      if (!data) data = (0, $90e51b630ebb9a32$export$13afda237b1c9846).floatTo16BitPCM(float32Array);
      const audio = {
        bitsPerSample: 16,
        channels: [
          float32Array
        ],
        data
      };
      const packer = new (0, $90e51b630ebb9a32$export$13afda237b1c9846)();
      const result = packer.pack(fromSampleRate, audio);
      blob = result.blob;
      arrayBuffer = await blob.arrayBuffer();
    }
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const values = audioBuffer.getChannelData(0);
    const url = URL.createObjectURL(blob);
    return {
      blob,
      url,
      values,
      audioBuffer
    };
  }
  /**
  * Logs data in debug mode
  * @param {...any} arguments
  * @returns {true}
  */
  log() {
    if (this.debug) this.log(...arguments);
    return true;
  }
  /**
  * Retrieves the current sampleRate for the recorder
  * @returns {number}
  */
  getSampleRate() {
    return this.sampleRate;
  }
  /**
  * Retrieves the current status of the recording
  * @returns {"ended"|"paused"|"recording"}
  */
  getStatus() {
    if (!this.processor) return "ended";
    else if (!this.recording) return "paused";
    else return "recording";
  }
  /**
  * Sends an event to the AudioWorklet
  * @private
  * @param {string} name
  * @param {{[key: string]: any}} data
  * @param {AudioWorkletNode} [_processor]
  * @returns {Promise<{[key: string]: any}>}
  */
  async _event(name, data = {}, _processor = null) {
    _processor = _processor || this.processor;
    if (!_processor) throw new Error("Can not send events without recording first");
    const message = {
      event: name,
      id: this._lastEventId++,
      data
    };
    _processor.port.postMessage(message);
    const t0 = (/* @__PURE__ */ new Date()).valueOf();
    while (!this.eventReceipts[message.id]) {
      if ((/* @__PURE__ */ new Date()).valueOf() - t0 > this.eventTimeout) throw new Error(`Timeout waiting for "${name}" event`);
      await new Promise((res) => setTimeout(() => res(true), 1));
    }
    const payload = this.eventReceipts[message.id];
    delete this.eventReceipts[message.id];
    return payload;
  }
  /**
  * Sets device change callback, remove if callback provided is `null`
  * @param {(Array<MediaDeviceInfo & {default: boolean}>): void|null} callback
  * @returns {true}
  */
  listenForDeviceChange(callback) {
    if (callback === null && this._deviceChangeCallback) {
      navigator.mediaDevices.removeEventListener("devicechange", this._deviceChangeCallback);
      this._deviceChangeCallback = null;
    } else if (callback !== null) {
      let lastId = 0;
      let lastDevices = [];
      const serializeDevices = (devices) => devices.map((d2) => d2.deviceId).sort().join(",");
      const cb = async () => {
        let id = ++lastId;
        const devices = await this.listDevices();
        if (id === lastId) {
          if (serializeDevices(lastDevices) !== serializeDevices(devices)) {
            lastDevices = devices;
            callback(devices.slice());
          }
        }
      };
      navigator.mediaDevices.addEventListener("devicechange", cb);
      cb();
      this._deviceChangeCallback = cb;
    }
    return true;
  }
  /**
  * Provide a callback for if/when device errors occur
  * @param {(({devices: Array<"cam" | "mic">, type: string, error?: Error}) => void) | null} callback
  * @returns {true}
  */
  listenForDeviceErrors(callback) {
    this._deviceErrorCallback = callback;
  }
  /**
  * Manually request permission to use the microphone
  * @returns {Promise<true>}
  */
  async requestPermission() {
    const permissionStatus = await navigator.permissions.query({
      name: "microphone"
    });
    if (permissionStatus.state === "denied") {
      if (this._deviceErrorCallback) this._deviceErrorCallback({
        devices: [
          "mic"
        ],
        type: "unknown",
        error: new Error("Microphone access denied")
      });
    } else if (permissionStatus.state === "prompt") try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const tracks = stream.getTracks();
      tracks.forEach((track2) => track2.stop());
    } catch (e2) {
      console.error("Error accessing microphone.");
      if (this._deviceErrorCallback) this._deviceErrorCallback({
        devices: [
          "mic"
        ],
        type: "unknown",
        error: e2
      });
    }
    return true;
  }
  /**
  * List all eligible devices for recording, will request permission to use microphone
  * @returns {Promise<Array<MediaDeviceInfo & {default: boolean}>>}
  */
  async listDevices() {
    if (!navigator.mediaDevices || !("enumerateDevices" in navigator.mediaDevices)) throw new Error("Could not request user devices");
    await this.requestPermission();
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter((device) => device.kind === "audioinput");
    return audioDevices;
  }
  /**
  * Begins a recording session and requests microphone permissions if not already granted
  * Microphone recording indicator will appear on browser tab but status will be "paused"
  * @param {string} [deviceId] if no device provided, default device will be used
  * @returns {Promise<true>}
  */
  async begin(deviceId) {
    if (this.processor) throw new Error(`Already connected: please call .end() to start a new session`);
    if (!navigator.mediaDevices || !("getUserMedia" in navigator.mediaDevices)) {
      if (this._deviceErrorCallback) this._deviceErrorCallback({
        devices: [
          "mic",
          "cam"
        ],
        type: "undefined-mediadevices"
      });
      throw new Error("Could not request user media");
    }
    deviceId = deviceId ?? this.deviceSelection?.deviceId;
    try {
      const config = {
        audio: true
      };
      if (deviceId) config.audio = {
        deviceId: {
          exact: deviceId
        }
      };
      this.stream = await navigator.mediaDevices.getUserMedia(config);
    } catch (err) {
      if (this._deviceErrorCallback) this._deviceErrorCallback({
        devices: [
          "mic"
        ],
        type: "unknown",
        error: err
      });
      throw new Error("Could not start media stream");
    }
    this.listDevices().then((devices) => {
      deviceId = this.stream.getAudioTracks()[0].getSettings().deviceId;
      console.log("find current device", devices, deviceId, this.stream.getAudioTracks()[0].getSettings());
      this.deviceSelection = devices.find((d2) => d2.deviceId === deviceId);
      console.log("current device", this.deviceSelection);
    });
    const context = new AudioContext({
      sampleRate: this.sampleRate
    });
    const source = context.createMediaStreamSource(this.stream);
    try {
      await context.audioWorklet.addModule(this.scriptSrc);
    } catch (e2) {
      console.error(e2);
      throw new Error(`Could not add audioWorklet module: ${this.scriptSrc}`);
    }
    const processor = new AudioWorkletNode(context, "audio_processor");
    processor.port.onmessage = (e2) => {
      const { event, id, data } = e2.data;
      if (event === "receipt") this.eventReceipts[id] = data;
      else if (event === "chunk") {
        if (this._chunkProcessorSize) {
          const buffer = this._chunkProcessorBuffer;
          this._chunkProcessorBuffer = {
            raw: (0, $90e51b630ebb9a32$export$13afda237b1c9846).mergeBuffers(buffer.raw, data.raw),
            mono: (0, $90e51b630ebb9a32$export$13afda237b1c9846).mergeBuffers(buffer.mono, data.mono)
          };
          if (this._chunkProcessorBuffer.mono.byteLength >= this._chunkProcessorSize) {
            this._chunkProcessor(this._chunkProcessorBuffer);
            this._chunkProcessorBuffer = {
              raw: new ArrayBuffer(0),
              mono: new ArrayBuffer(0)
            };
          }
        } else this._chunkProcessor(data);
      }
    };
    const node = source.connect(processor);
    const analyser = context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.1;
    node.connect(analyser);
    if (this.outputToSpeakers) {
      console.warn("Warning: Output to speakers may affect sound quality,\nespecially due to system audio feedback preventative measures.\nuse only for debugging");
      analyser.connect(context.destination);
    }
    this.source = source;
    this.node = node;
    this.analyser = analyser;
    this.processor = processor;
    console.log("begin completed");
    return true;
  }
  /**
  * Gets the current frequency domain data from the recording track
  * @param {"frequency"|"music"|"voice"} [analysisType]
  * @param {number} [minDecibels] default -100
  * @param {number} [maxDecibels] default -30
  * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
  */
  getFrequencies(analysisType = "frequency", minDecibels = -100, maxDecibels = -30) {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    return (0, $4aa7d69f60688511$export$2c3136da0bf130f9).getFrequencies(this.analyser, this.sampleRate, null, analysisType, minDecibels, maxDecibels);
  }
  /**
  * Pauses the recording
  * Keeps microphone stream open but halts storage of audio
  * @returns {Promise<true>}
  */
  async pause() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    else if (!this.recording) throw new Error("Already paused: please call .record() first");
    if (this._chunkProcessorBuffer.raw.byteLength) this._chunkProcessor(this._chunkProcessorBuffer);
    this.log("Pausing ...");
    await this._event("stop");
    this.recording = false;
    return true;
  }
  /**
  * Start recording stream and storing to memory from the connected audio source
  * @param {(data: { mono: ArrayBuffer; raw: ArrayBuffer }) => any} [chunkProcessor]
  * @param {number} [chunkSize] chunkProcessor will not be triggered until this size threshold met in mono audio
  * @returns {Promise<true>}
  */
  async record(chunkProcessor = () => {
  }, chunkSize = 8192) {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    else if (this.recording) throw new Error("Already recording: please call .pause() first");
    else if (typeof chunkProcessor !== "function") throw new Error(`chunkProcessor must be a function`);
    this._chunkProcessor = chunkProcessor;
    this._chunkProcessorSize = chunkSize;
    this._chunkProcessorBuffer = {
      raw: new ArrayBuffer(0),
      mono: new ArrayBuffer(0)
    };
    this.log("Recording ...");
    await this._event("start");
    this.recording = true;
    return true;
  }
  /**
  * Clears the audio buffer, empties stored recording
  * @returns {Promise<true>}
  */
  async clear() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    await this._event("clear");
    return true;
  }
  /**
  * Reads the current audio stream data
  * @returns {Promise<{meanValues: Float32Array, channels: Array<Float32Array>}>}
  */
  async read() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    this.log("Reading ...");
    const result = await this._event("read");
    return result;
  }
  /**
  * Saves the current audio stream to a file
  * @param {boolean} [force] Force saving while still recording
  * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
  */
  async save(force = false) {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    if (!force && this.recording) throw new Error("Currently recording: please call .pause() first, or call .save(true) to force");
    this.log("Exporting ...");
    const exportData = await this._event("export");
    const packer = new (0, $90e51b630ebb9a32$export$13afda237b1c9846)();
    const result = packer.pack(this.sampleRate, exportData.audio);
    return result;
  }
  /**
  * Ends the current recording session and saves the result
  * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
  */
  async end() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    const _processor = this.processor;
    this.log("Stopping ...");
    await this._event("stop");
    this.recording = false;
    const tracks = this.stream.getTracks();
    tracks.forEach((track2) => track2.stop());
    this.log("Exporting ...");
    const exportData = await this._event("export", {}, _processor);
    this.processor.disconnect();
    this.source.disconnect();
    this.node.disconnect();
    this.analyser.disconnect();
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.node = null;
    const packer = new (0, $90e51b630ebb9a32$export$13afda237b1c9846)();
    const result = packer.pack(this.sampleRate, exportData.audio);
    return result;
  }
  /**
  * Performs a full cleanup of WavRecorder instance
  * Stops actively listening via microphone and removes existing listeners
  * @returns {Promise<true>}
  */
  async quit() {
    this.listenForDeviceChange(null);
    this.deviceSelection = null;
    if (this.processor) await this.end();
    return true;
  }
};
globalThis.WavRecorder = $58a7d939ec2b36fc$export$439b217ca659a877;
function $4223416b99b33991$var$resampleAudioBuffer(inputBuffer, inputSampleRate, outputSampleRate) {
  if (inputSampleRate === outputSampleRate) return inputBuffer;
  const inputView = new Int16Array(inputBuffer);
  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.round(inputView.length / ratio);
  const outputBuffer = new ArrayBuffer(outputLength * 2);
  const outputView = new Int16Array(outputBuffer);
  for (let i2 = 0; i2 < outputLength; i2++) {
    const srcIndex = i2 * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, inputView.length - 1);
    const t2 = srcIndex - srcIndexFloor;
    outputView[i2] = Math.round(inputView[srcIndexFloor] * (1 - t2) + inputView[srcIndexCeil] * t2);
  }
  return outputBuffer;
}
var $4223416b99b33991$export$2934cf2d25c67a48 = class {
  /**
  * Create a new MediaStreamRecorder instance
  * @param {{sampleRate?: number, outputToSpeakers?: boolean, debug?: boolean}} [options]
  * @returns {MediaStreamRecorder}
  */
  constructor({ sampleRate = 44100, outputToSpeakers = false, debug = false } = {}) {
    this.scriptSrc = (0, $a1f3ec78ca8ae68d$export$1f65f50a8cbff43c);
    this.sampleRate = sampleRate;
    this.outputToSpeakers = outputToSpeakers;
    this.debug = !!debug;
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.node = null;
    this.recording = false;
    this._lastEventId = 0;
    this.eventReceipts = {};
    this.eventTimeout = 5e3;
    this._chunkProcessor = () => {
    };
    this._chunkProcessorSize = void 0;
    this._chunkProcessorBuffer = {
      raw: new ArrayBuffer(0),
      mono: new ArrayBuffer(0)
    };
  }
  /**
  * Logs data in debug mode
  * @param {...any} arguments
  * @returns {true}
  */
  log() {
    if (this.debug) this.log(...arguments);
    return true;
  }
  /**
  * Retrieves the current sampleRate for the recorder
  * @returns {number}
  */
  getSampleRate() {
    return this.sampleRate;
  }
  /**
  * Retrieves the current status of the recording
  * @returns {"ended"|"paused"|"recording"}
  */
  getStatus() {
    if (!this.processor) return "ended";
    else if (!this.recording) return "paused";
    else return "recording";
  }
  /**
  * Sends an event to the AudioWorklet
  * @private
  * @param {string} name
  * @param {{[key: string]: any}} data
  * @param {AudioWorkletNode} [_processor]
  * @returns {Promise<{[key: string]: any}>}
  */
  async _event(name, data = {}, _processor = null) {
    _processor = _processor || this.processor;
    if (!_processor) throw new Error("Can not send events without recording first");
    const message = {
      event: name,
      id: this._lastEventId++,
      data
    };
    _processor.port.postMessage(message);
    const t0 = (/* @__PURE__ */ new Date()).valueOf();
    while (!this.eventReceipts[message.id]) {
      if ((/* @__PURE__ */ new Date()).valueOf() - t0 > this.eventTimeout) throw new Error(`Timeout waiting for "${name}" event`);
      await new Promise((res) => setTimeout(() => res(true), 1));
    }
    const payload = this.eventReceipts[message.id];
    delete this.eventReceipts[message.id];
    return payload;
  }
  /**
  * Begins a recording session for the given audioTrack
  * Microphone recording indicator will appear on browser tab but status will be "paused"
  * @param {MediaStreamTrack} [audioTrack] if no device provided, default device will be used
  * @returns {Promise<true>}
  */
  async begin(audioTrack) {
    if (this.processor) throw new Error(`Already connected: please call .end() to start a new session`);
    if (!audioTrack || audioTrack.kind !== "audio") throw new Error("No audio track provided");
    this.stream = new MediaStream([
      audioTrack
    ]);
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    let context;
    if (isFirefox)
      context = new AudioContext();
    else
      context = new AudioContext({
        sampleRate: this.sampleRate
      });
    const contextSampleRate = context.sampleRate;
    const source = context.createMediaStreamSource(this.stream);
    try {
      await context.audioWorklet.addModule(this.scriptSrc);
    } catch (e2) {
      console.error(e2);
      throw new Error(`Could not add audioWorklet module: ${this.scriptSrc}`);
    }
    const processor = new AudioWorkletNode(context, "audio_processor");
    processor.port.onmessage = (e2) => {
      const { event, id, data } = e2.data;
      if (event === "receipt") this.eventReceipts[id] = data;
      else if (event === "chunk") {
        const resampledData = {
          raw: $4223416b99b33991$var$resampleAudioBuffer(data.raw, contextSampleRate, this.sampleRate),
          mono: $4223416b99b33991$var$resampleAudioBuffer(data.mono, contextSampleRate, this.sampleRate)
        };
        if (this._chunkProcessorSize) {
          const buffer = this._chunkProcessorBuffer;
          this._chunkProcessorBuffer = {
            raw: (0, $90e51b630ebb9a32$export$13afda237b1c9846).mergeBuffers(buffer.raw, resampledData.raw),
            mono: (0, $90e51b630ebb9a32$export$13afda237b1c9846).mergeBuffers(buffer.mono, resampledData.mono)
          };
          if (this._chunkProcessorBuffer.mono.byteLength >= this._chunkProcessorSize) {
            this._chunkProcessor(this._chunkProcessorBuffer);
            this._chunkProcessorBuffer = {
              raw: new ArrayBuffer(0),
              mono: new ArrayBuffer(0)
            };
          }
        } else this._chunkProcessor(resampledData);
      }
    };
    const node = source.connect(processor);
    const analyser = context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.1;
    node.connect(analyser);
    if (this.outputToSpeakers) {
      console.warn("Warning: Output to speakers may affect sound quality,\nespecially due to system audio feedback preventative measures.\nuse only for debugging");
      analyser.connect(context.destination);
    }
    this.source = source;
    this.node = node;
    this.analyser = analyser;
    this.processor = processor;
    return true;
  }
  /**
  * Gets the current frequency domain data from the recording track
  * @param {"frequency"|"music"|"voice"} [analysisType]
  * @param {number} [minDecibels] default -100
  * @param {number} [maxDecibels] default -30
  * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
  */
  getFrequencies(analysisType = "frequency", minDecibels = -100, maxDecibels = -30) {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    return (0, $4aa7d69f60688511$export$2c3136da0bf130f9).getFrequencies(this.analyser, this.sampleRate, null, analysisType, minDecibels, maxDecibels);
  }
  /**
  * Pauses the recording
  * Keeps microphone stream open but halts storage of audio
  * @returns {Promise<true>}
  */
  async pause() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    else if (!this.recording) throw new Error("Already paused: please call .record() first");
    if (this._chunkProcessorBuffer.raw.byteLength) this._chunkProcessor(this._chunkProcessorBuffer);
    this.log("Pausing ...");
    await this._event("stop");
    this.recording = false;
    return true;
  }
  /**
  * Start recording stream and storing to memory from the connected audio source
  * @param {(data: { mono: ArrayBuffer; raw: ArrayBuffer }) => any} [chunkProcessor]
  * @param {number} [chunkSize] chunkProcessor will not be triggered until this size threshold met in mono audio
  * @returns {Promise<true>}
  */
  async record(chunkProcessor = () => {
  }, chunkSize = 8192) {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    else if (this.recording) throw new Error("Already recording: HELLO please call .pause() first");
    else if (typeof chunkProcessor !== "function") throw new Error(`chunkProcessor must be a function`);
    this._chunkProcessor = chunkProcessor;
    this._chunkProcessorSize = chunkSize;
    this._chunkProcessorBuffer = {
      raw: new ArrayBuffer(0),
      mono: new ArrayBuffer(0)
    };
    this.log("Recording ...");
    await this._event("start");
    this.recording = true;
    return true;
  }
  /**
  * Clears the audio buffer, empties stored recording
  * @returns {Promise<true>}
  */
  async clear() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    await this._event("clear");
    return true;
  }
  /**
  * Reads the current audio stream data
  * @returns {Promise<{meanValues: Float32Array, channels: Array<Float32Array>}>}
  */
  async read() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    this.log("Reading ...");
    const result = await this._event("read");
    return result;
  }
  /**
  * Saves the current audio stream to a file
  * @param {boolean} [force] Force saving while still recording
  * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
  */
  async save(force = false) {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    if (!force && this.recording) throw new Error("Currently recording: please call .pause() first, or call .save(true) to force");
    this.log("Exporting ...");
    const exportData = await this._event("export");
    const packer = new (0, $90e51b630ebb9a32$export$13afda237b1c9846)();
    const result = packer.pack(this.sampleRate, exportData.audio);
    return result;
  }
  /**
  * Ends the current recording session and saves the result
  * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
  */
  async end() {
    if (!this.processor) throw new Error("Session ended: please call .begin() first");
    const _processor = this.processor;
    this.log("Stopping ...");
    await this._event("stop");
    this.recording = false;
    this.log("Exporting ...");
    const exportData = await this._event("export", {}, _processor);
    this.processor.disconnect();
    this.source.disconnect();
    this.node.disconnect();
    this.analyser.disconnect();
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.node = null;
    const packer = new (0, $90e51b630ebb9a32$export$13afda237b1c9846)();
    const result = packer.pack(this.sampleRate, exportData.audio);
    return result;
  }
  /**
  * Performs a full cleanup of WavRecorder instance
  * Stops actively listening via microphone and removes existing listeners
  * @returns {Promise<true>}
  */
  async quit() {
    this.listenForDeviceChange(null);
    if (this.processor) await this.end();
    return true;
  }
};
globalThis.WavRecorder = WavRecorder;
var $daa89bdc6099638f$export$4a0c46dbbe2ddb67 = class {
  constructor() {
    this._callbacks = {};
    this._micEnabled = true;
    this._camEnabled = false;
    this._supportsScreenShare = false;
  }
  setUserAudioCallback(userAudioCallback) {
    this._userAudioCallback = userAudioCallback;
  }
  setClientOptions(options, override = false) {
    if (this._options && !override) return;
    this._options = options;
    this._callbacks = options.callbacks ?? {};
    this._micEnabled = options.enableMic ?? true;
    this._camEnabled = options.enableCam ?? false;
  }
  get supportsScreenShare() {
    return this._supportsScreenShare;
  }
  /**
   * The kinds of media this media manager can capture, for the transport's
   * `mediaSupport`. `false` rules a kind out, and a missing key leaves it unknown.
   * By default only screen share can be ruled out: `screenShare` is `false` when
   * `supportsScreenShare` is, because this media manager or the browser can't
   * share the screen. Media managers that know more override this.
   */
  get mediaSupport() {
    return this._supportsScreenShare ? {} : {
      screenShare: false
    };
  }
};
var $0817f76e57abfe7a$export$c95c65abc5f47125 = class extends (0, $daa89bdc6099638f$export$4a0c46dbbe2ddb67) {
  constructor(enablePlayer = true, enableRecording = true, onTrackStartedCallback, onTrackStoppedCallback, recorderChunkSize, recorderSampleRate = 24e3, playerSampleRate = 24e3) {
    super();
    this._selectedCam = {};
    this._selectedMic = {};
    this._selectedSpeaker = {};
    this._remoteAudioLevelInterval = null;
    this._recorderChunkSize = void 0;
    this._initialized = false;
    this._connected = false;
    this._currentAudioTrack = null;
    this._connectResolve = null;
    this.onTrackStartedCallback = onTrackStartedCallback;
    this.onTrackStoppedCallback = onTrackStoppedCallback;
    this._recorderChunkSize = recorderChunkSize;
    this._supportsScreenShare = (0, $13c8c94ddb82851d$export$7f8f33b9b54c8307)();
    this._daily = (0, hc).getCallInstance() ?? (0, hc).createCallObject();
    if (enableRecording) this._mediaStreamRecorder = new (0, $4223416b99b33991$export$2934cf2d25c67a48)({
      sampleRate: recorderSampleRate
    });
    if (enablePlayer) this._wavStreamPlayer = new (0, $17ba052b4c7c2439$export$9698d62c78b8f366)({
      sampleRate: playerSampleRate
    });
    this._daily.on("track-started", this.handleTrackStarted.bind(this));
    this._daily.on("track-stopped", this.handleTrackStopped.bind(this));
    this._daily.on("available-devices-updated", this._handleAvailableDevicesUpdated.bind(this));
    this._daily.on("selected-devices-updated", this._handleSelectedDevicesUpdated.bind(this));
    this._daily.on("camera-error", this.handleDeviceError.bind(this));
    this._daily.on("local-audio-level", this._handleLocalAudioLevel.bind(this));
  }
  async initialize() {
    if (this._initialized) {
      console.warn("DailyMediaManager already initialized");
      return;
    }
    const infos = await this._daily.startCamera({
      startVideoOff: !this._camEnabled,
      startAudioOff: !this._micEnabled,
      dailyConfig: {
        useDevicePreferenceCookies: true
      }
    });
    const { devices } = await this._daily.enumerateDevices();
    const cams = devices.filter((d2) => d2.kind === "videoinput");
    const mics = devices.filter((d2) => d2.kind === "audioinput");
    const speakers = devices.filter((d2) => d2.kind === "audiooutput");
    this._callbacks.onAvailableCamsUpdated?.(cams);
    this._callbacks.onAvailableMicsUpdated?.(mics);
    this._callbacks.onAvailableSpeakersUpdated?.(speakers);
    this._selectedCam = infos.camera;
    this._callbacks.onCamUpdated?.(infos.camera);
    this._selectedMic = infos.mic;
    this._callbacks.onMicUpdated?.(infos.mic);
    this._selectedSpeaker = infos.speaker;
    this._callbacks.onSpeakerUpdated?.(infos.speaker);
    if (!this._daily.isLocalAudioLevelObserverRunning()) await this._daily.startLocalAudioLevelObserver(100);
    if (this._wavStreamPlayer) {
      await this._wavStreamPlayer.connect();
      if (!this._remoteAudioLevelInterval) this._remoteAudioLevelInterval = setInterval(() => {
        const frequencies = this._wavStreamPlayer.getFrequencies();
        let aveVal = 0;
        if (frequencies.values?.length) aveVal = frequencies.values.reduce((a2, c2) => a2 + c2, 0) / frequencies.values.length;
        this._handleRemoteAudioLevel(aveVal);
      }, 100);
    }
    this._initialized = true;
  }
  async connect() {
    if (this._connected) {
      console.warn("DailyMediaManager already connected");
      return;
    }
    this._connected = true;
    if (!this._initialized) return new Promise((resolve) => {
      (async () => {
        this._connectResolve = resolve;
        await this.initialize();
        if (this._connectResolve && !this._mediaStreamRecorder) {
          this._connectResolve();
          this._connectResolve = null;
        }
      })();
    });
    if (this._micEnabled) this._startRecording();
  }
  async disconnect() {
    if (this._remoteAudioLevelInterval) clearInterval(this._remoteAudioLevelInterval);
    this._remoteAudioLevelInterval = null;
    this._daily.leave();
    this._currentAudioTrack = null;
    await this._mediaStreamRecorder?.end();
    this._wavStreamPlayer?.interrupt();
    this._initialized = false;
    this._connected = false;
  }
  async interruptBotAudio() {
    return this._wavStreamPlayer?.interrupt();
  }
  bufferBotAudio(data, id) {
    return this._wavStreamPlayer?.add16BitPCM(data, id);
  }
  async getAllMics() {
    let devices = (await this._daily.enumerateDevices()).devices;
    return devices.filter((device) => device.kind === "audioinput");
  }
  async getAllCams() {
    let devices = (await this._daily.enumerateDevices()).devices;
    return devices.filter((device) => device.kind === "videoinput");
  }
  async getAllSpeakers() {
    let devices = (await this._daily.enumerateDevices()).devices;
    return devices.filter((device) => device.kind === "audiooutput");
  }
  updateMic(micId) {
    this._daily.setInputDevicesAsync({
      audioDeviceId: micId
    }).then((deviceInfo) => {
      this._selectedMic = deviceInfo.mic;
    });
  }
  updateCam(camId) {
    this._daily.setInputDevicesAsync({
      videoDeviceId: camId
    }).then((deviceInfo) => {
      this._selectedCam = deviceInfo.camera;
    });
  }
  async updateSpeaker(speakerId) {
    if (!this._wavStreamPlayer) {
      try {
        const dInfo = await this._daily.setOutputDeviceAsync({
          outputDeviceId: speakerId
        });
        this._selectedSpeaker = dInfo.speaker;
        this._callbacks.onSpeakerUpdated?.(this._selectedSpeaker);
      } catch (e2) {
        console.error("Error setting output device", e2);
      }
      return;
    }
    if (speakerId !== "default" && this._selectedSpeaker.deviceId === speakerId) return;
    let sID = speakerId;
    if (sID === "default") {
      const speakers = await this.getAllSpeakers();
      const defaultSpeaker = speakers.find((s2) => s2.deviceId === "default");
      if (!defaultSpeaker) {
        console.warn("No default speaker found");
        return;
      }
      speakers.splice(speakers.indexOf(defaultSpeaker), 1);
      const defaultSpeakerCp = speakers.find((s2) => defaultSpeaker.label.includes(s2.label));
      sID = defaultSpeakerCp?.deviceId ?? speakerId;
    }
    this._wavStreamPlayer?.updateSpeaker(sID).then(() => {
      this._selectedSpeaker = {
        deviceId: speakerId
      };
      this._callbacks.onSpeakerUpdated?.(this._selectedSpeaker);
    });
  }
  get selectedMic() {
    return this._selectedMic;
  }
  get selectedCam() {
    return this._selectedCam;
  }
  get selectedSpeaker() {
    return this._selectedSpeaker;
  }
  async enableMic(enable) {
    this._micEnabled = enable;
    if (!this._daily.participants()?.local) return;
    this._daily.setLocalAudio(enable);
    if (this._mediaStreamRecorder) {
      if (enable) {
        if (this._mediaStreamRecorder.getStatus() === "paused") this._startRecording();
      } else if (this._mediaStreamRecorder.getStatus() === "recording") this._mediaStreamRecorder.pause();
    }
  }
  enableCam(enable) {
    this._camEnabled = enable;
    this._daily.setLocalVideo(enable);
  }
  enableScreenShare(enable) {
    if (enable) this._daily.startScreenShare();
    else this._daily.stopScreenShare();
  }
  // NOTE: deliberately not `this._daily.localVideo()` / `localAudio()`. Daily
  // fires 'track-started'/'track-stopped' *before* it commits the new state
  // to the participant object those getters read from (see daily-js's
  // DAILY_EVENT_PARTICIPANT_UPDATED handling: maybeEventTrackStopped/Started
  // run, then `this._participants[id]` is reassigned). Callers that react to
  // TrackStarted/TrackStopped by reading isCamEnabled/isMicEnabled — e.g. to
  // resync UI state — would otherwise always observe the pre-toggle value.
  // _camEnabled/_micEnabled are updated synchronously in
  // handleTrackStarted/handleTrackStopped below, before those callbacks fire.
  get isCamEnabled() {
    return this._camEnabled;
  }
  get isMicEnabled() {
    return this._micEnabled;
  }
  /** Captures the microphone, the camera and, where the browser can, the screen. */
  get mediaSupport() {
    return {
      mic: true,
      cam: true,
      screenShare: this._supportsScreenShare
    };
  }
  get isSharingScreen() {
    return this._daily.localScreenAudio() || this._daily.localScreenVideo();
  }
  tracks() {
    const participants = this._daily.participants();
    return {
      local: {
        audio: participants?.local?.tracks?.audio?.persistentTrack,
        screenAudio: participants?.local?.tracks?.screenAudio?.persistentTrack,
        screenVideo: participants?.local?.tracks?.screenVideo?.persistentTrack,
        video: participants?.local?.tracks?.video?.persistentTrack
      }
    };
  }
  _startRecording() {
    if (!this._connected || !this._mediaStreamRecorder) return;
    try {
      this._mediaStreamRecorder.record((data) => {
        this._userAudioCallback(data.mono);
      }, this._recorderChunkSize);
    } catch (e2) {
      const err = e2;
      if (!err.message.includes("Already recording")) console.error("Error starting recording", e2);
    }
  }
  _handleAvailableDevicesUpdated(event) {
    this._callbacks.onAvailableCamsUpdated?.(event.availableDevices.filter((d2) => d2.kind === "videoinput"));
    this._callbacks.onAvailableMicsUpdated?.(event.availableDevices.filter((d2) => d2.kind === "audioinput"));
    this._callbacks.onAvailableSpeakersUpdated?.(event.availableDevices.filter((d2) => d2.kind === "audiooutput"));
    if (this._selectedSpeaker.deviceId === "default") this.updateSpeaker("default");
  }
  _handleSelectedDevicesUpdated(event) {
    if (this._selectedCam?.deviceId !== event.devices.camera) {
      this._selectedCam = event.devices.camera;
      this._callbacks.onCamUpdated?.(event.devices.camera);
    }
    if (this._selectedMic?.deviceId !== event.devices.mic) {
      this._selectedMic = event.devices.mic;
      this._callbacks.onMicUpdated?.(event.devices.mic);
    }
  }
  handleDeviceError(ev) {
    const generateDeviceError = (error) => {
      const devices = [];
      switch (error.type) {
        case "permissions":
          error.blockedMedia.forEach((d2) => {
            devices.push(d2 === "video" ? "cam" : "mic");
          });
          return new (0, $db6391dc7d757577$export$64c9f614187c1e59)(devices, error.type, error.msg, {
            blockedBy: error.blockedBy
          });
        case "not-found":
          error.missingMedia.forEach((d2) => {
            devices.push(d2 === "video" ? "cam" : "mic");
          });
          return new (0, $db6391dc7d757577$export$64c9f614187c1e59)(devices, error.type, error.msg);
        case "constraints":
          error.failedMedia.forEach((d2) => {
            devices.push(d2 === "video" ? "cam" : "mic");
          });
          return new (0, $db6391dc7d757577$export$64c9f614187c1e59)(devices, error.type, error.msg, {
            reason: error.reason
          });
        case "cam-in-use":
          devices.push("cam");
          return new (0, $db6391dc7d757577$export$64c9f614187c1e59)(devices, "in-use", error.msg);
        case "mic-in-use":
          devices.push("mic");
          return new (0, $db6391dc7d757577$export$64c9f614187c1e59)(devices, "in-use", error.msg);
        case "cam-mic-in-use":
          devices.push("cam");
          devices.push("mic");
          return new (0, $db6391dc7d757577$export$64c9f614187c1e59)(devices, "in-use", error.msg);
        case "undefined-mediadevices":
        case "unknown":
        default:
          devices.push("cam");
          devices.push("mic");
          return new (0, $db6391dc7d757577$export$64c9f614187c1e59)(devices, error.type, error.msg);
      }
    };
    const deviceError = generateDeviceError(ev.error);
    if (deviceError.devices.includes("mic")) this._micEnabled = this._daily.localAudio();
    if (deviceError.devices.includes("cam")) this._camEnabled = this._daily.localVideo();
    this._callbacks.onDeviceError?.(deviceError);
  }
  _handleLocalAudioLevel(ev) {
    this._callbacks.onLocalAudioLevel?.(ev.audioLevel);
  }
  _handleRemoteAudioLevel(audioLevel) {
    this._callbacks.onRemoteAudioLevel?.(audioLevel, $0817f76e57abfe7a$var$botParticipant());
  }
  async handleTrackStarted(event) {
    if (!event.participant?.local) return;
    if (event.track.kind === "audio") {
      this._micEnabled = true;
      if (this._mediaStreamRecorder) {
        const status = this._mediaStreamRecorder.getStatus();
        switch (status) {
          case "ended":
            try {
              await this._mediaStreamRecorder.begin(event.track);
              if (this._connected) {
                this._startRecording();
                if (this._connectResolve) {
                  this._connectResolve();
                  this._connectResolve = null;
                }
              }
            } catch (e2) {
            }
            break;
          case "paused":
            this._startRecording();
            break;
          case "recording":
          default:
            if (this._currentAudioTrack !== event.track) {
              await this._mediaStreamRecorder.end();
              try {
                await this._mediaStreamRecorder.begin(event.track);
                this._startRecording();
              } catch (e2) {
              }
            } else console.warn("track-started event received for current track and already recording");
            break;
        }
      }
      this._currentAudioTrack = event.track;
    } else if (event.track.kind === "video") this._camEnabled = true;
    this._callbacks.onTrackStarted?.(event.track, event.participant ? $0817f76e57abfe7a$var$dailyParticipantToParticipant(event.participant) : void 0);
    this.onTrackStartedCallback?.(event);
  }
  handleTrackStopped(event) {
    if (!event.participant?.local) return;
    if (event.track.kind === "audio") {
      this._micEnabled = false;
      if (this._mediaStreamRecorder && this._mediaStreamRecorder.getStatus() === "recording") this._mediaStreamRecorder.pause();
    } else if (event.track.kind === "video") this._camEnabled = false;
    this._callbacks.onTrackStopped?.(event.track, event.participant ? $0817f76e57abfe7a$var$dailyParticipantToParticipant(event.participant) : void 0);
    this.onTrackStoppedCallback?.(event);
  }
};
var $0817f76e57abfe7a$var$dailyParticipantToParticipant = (p2) => ({
  id: p2.user_id,
  local: p2.local,
  name: p2.user_name
});
var $0817f76e57abfe7a$var$botParticipant = () => ({
  id: "bot",
  local: false,
  name: "Bot"
});
var $2f600f73c421a514$var$readyStates = [
  "CONNECTING",
  "OPEN",
  "CLOSING",
  "CLOSED"
];
var $2f600f73c421a514$var$KEEP_ALIVE_INTERVAL = 5e3;
var $2f600f73c421a514$var$KEEP_ALIVE_TIMEOUT = 15e3;
var $2f600f73c421a514$var$WEBSOCKET_CONNECTION_TIMEOUT = 15e4;
var $2f600f73c421a514$var$DEFAULT_RECONNECT_ATTEMPTS = 2;
var $2f600f73c421a514$var$MAX_RECONNECT_ATTEMPTS = 10;
var $2f600f73c421a514$var$DEFAULT_RECONNECT_INTERVAL = 1e3;
var $2f600f73c421a514$var$MAX_RECONNECT_INTERVAL = 3e4;
var $2f600f73c421a514$var$DEFAULT_RECONNECT_DECAY = 1.5;
var $2f600f73c421a514$var$WEBSOCKET_TIMEOUT_CODE = 4100;
var $2f600f73c421a514$var$SIG_CONNECTION_CANCELED = "SIG_CONNECTION_CANCELED";
var $2f600f73c421a514$var$WEBSOCKET_ERROR = "WEBSOCKET_ERROR";
var $2f600f73c421a514$var$LOG_LEVEL;
(function(LOG_LEVEL) {
  LOG_LEVEL[LOG_LEVEL["DEBUG"] = 0] = "DEBUG";
  LOG_LEVEL[LOG_LEVEL["ERROR"] = 1] = "ERROR";
  LOG_LEVEL[LOG_LEVEL["INFO"] = 2] = "INFO";
  LOG_LEVEL[LOG_LEVEL["WARN"] = 3] = "WARN";
})($2f600f73c421a514$var$LOG_LEVEL || ($2f600f73c421a514$var$LOG_LEVEL = {}));
var $2f600f73c421a514$var$rWebSocket = class {
  constructor(url, protocols) {
    this._closedManually = false;
    this._errored = false;
    this._rejected = false;
    this._timed_out = false;
    this._initialConnectionOk = false;
    this._ws = new WebSocket(url, protocols);
  }
  addEventListener(type, listener) {
    this._ws.addEventListener(type, listener);
  }
  // Add other WebSocket methods as needed
  close(code, reason) {
    this._ws.close(code, reason);
  }
  send(data) {
    this._ws.send(data);
  }
  // Add getters for WebSocket properties
  get url() {
    return this._ws.url;
  }
  get readyState() {
    return this._ws.readyState;
  }
};
var $2f600f73c421a514$export$4f3d0ffd941ebefb = class extends (0, import_events2.EventEmitter) {
  constructor(address, protocols, options = {}) {
    super();
    if (!address) throw new Error("Need a valid WebSocket URL");
    this._ws = null;
    this._url = address;
    this._protocols = protocols;
    this._parseBlobToJson = options?.parseBlobToJson ?? true;
    this.init();
  }
  init() {
    this._keepAliveTimeout = $2f600f73c421a514$var$KEEP_ALIVE_TIMEOUT;
    this._keepAliveInterval = $2f600f73c421a514$var$KEEP_ALIVE_INTERVAL;
    this._disconnected = false;
    this._keepIntervalID = null;
    this._shouldRetryFn = null;
    this._connectionTimeout = $2f600f73c421a514$var$WEBSOCKET_CONNECTION_TIMEOUT;
    this._reconnectAttempts = 0;
    this._allowedReconnectAttempts = $2f600f73c421a514$var$DEFAULT_RECONNECT_ATTEMPTS;
    this._reconnectInterval = $2f600f73c421a514$var$DEFAULT_RECONNECT_INTERVAL;
    this._maxReconnectInterval = $2f600f73c421a514$var$MAX_RECONNECT_INTERVAL;
    this._reconnectDecay = $2f600f73c421a514$var$DEFAULT_RECONNECT_DECAY;
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this._disconnected = false;
      this.clearReconnectTimeout();
      let ws2 = new $2f600f73c421a514$var$rWebSocket(this._url, this._protocols);
      this.setConnectionTimeout();
      ws2.addEventListener("close", (evt) => {
        const closeEvent = evt;
        let code = ws2._timed_out ? $2f600f73c421a514$var$WEBSOCKET_TIMEOUT_CODE : closeEvent.code;
        let reason = ws2._timed_out ? "websocket connection timed out" : closeEvent.reason;
        ws2._timed_out = false;
        if (!ws2._closedManually && ws2._initialConnectionOk) {
          console.warn(`signaling socket closed unexpectedly: ${code}${reason ? " " + reason : ""}`);
          this._closeSocket();
          this.emit("close", code, reason);
        } else this.log("signaling socket closed");
        if (!ws2._closedManually && (ws2._errored || ws2._timed_out)) {
          console.warn(`signaling socket closed on error: ${code}${reason ? " " + reason : ""}`);
          if (!ws2._rejected) {
            ws2._rejected = true;
            const err = new Error(`WebSocket connection error (${code}): ${reason}`);
            err.name = $2f600f73c421a514$var$WEBSOCKET_ERROR;
            reject(err);
          }
        }
      });
      ws2.addEventListener("open", (evt) => {
        this.log("wss connection opened to", $2f600f73c421a514$var$LOG_LEVEL.DEBUG, this._url);
        this.clearConnectionTimeout();
        if (ws2._rejected || ws2._timed_out) return;
        if (ws2._closedManually || this._ws && this._ws !== ws2) {
          ws2._rejected = true;
          ws2.close();
          let err = Error("wss connection interrupted by disconnect or newer connection");
          err.name = $2f600f73c421a514$var$SIG_CONNECTION_CANCELED;
          reject(err);
          return;
        }
        ws2._initialConnectionOk = this._url;
        this._lastMsgRecvTime = Date.now();
        if (this._keepAliveInterval) this._keepIntervalID = setInterval(() => this.checkSocketHealthAndSendKeepAlive(), this._keepAliveInterval);
        this._ws = ws2;
        this.emit("open");
        resolve(ws2);
      });
      ws2.addEventListener("error", (evt) => {
        if (!ws2._closedManually) {
          const wsTarget = evt.currentTarget;
          this.log(`websocket error event: ${wsTarget?.url}`);
        }
        ws2._errored = true;
      });
      ws2.addEventListener("message", (msg) => {
        this._handleMessage(msg);
      });
    });
  }
  setConnectionTimeout() {
    this._connectionTimeoutID = setTimeout(async () => {
      this.log("Connection reconnect attempt timed out.");
      this.emit("connection-timeout");
      this.clearConnectionTimeout();
      await this._closeSocket();
    }, this._connectionTimeout);
  }
  clearConnectionTimeout() {
    clearTimeout(this._connectionTimeoutID);
    this._connectionTimeoutID = void 0;
  }
  clearReconnectTimeout() {
    clearTimeout(this._reconnectTimeoutID);
    this._reconnectTimeoutID = void 0;
  }
  clearKeepAliveInterval() {
    if (this._keepIntervalID) {
      clearInterval(this._keepIntervalID);
      this._keepIntervalID = null;
    }
  }
  async checkSocketHealthAndSendKeepAlive() {
    if (!(this._ws && this._ws.readyState === WebSocket.OPEN)) return;
    if (!this._keepAliveTimeout || !this._keepAliveInterval) return;
    if (Date.now() - this._lastMsgRecvTime > this._keepAliveTimeout) {
      this.log("Connection is stale, need to reconnect", $2f600f73c421a514$var$LOG_LEVEL.WARN);
      await this._closeSocket();
      return;
    }
    if (Date.now() - this._lastMsgSendTime < this._keepAliveInterval) return;
    this.log("Emitting keep-alive", $2f600f73c421a514$var$LOG_LEVEL.DEBUG);
    this.emit("keep-alive");
  }
  // We use the word manually here to imply the application using this code
  // or this code itself will decide to close the socket.
  async _closeSocket() {
    this.log("Closing");
    try {
      this.clearKeepAliveInterval();
      this._lastMsgRecvTime = 0;
      if (this._ws) {
        this._ws._closedManually = true;
        this._ws.close();
      }
      const shouldRetry = this._ws?._initialConnectionOk && this._shouldRetryFn && this._shouldRetryFn();
      this._ws = null;
      if (shouldRetry) {
        this.log("Emitting reconnect", $2f600f73c421a514$var$LOG_LEVEL.DEBUG);
        this.emit("reconnecting");
        await this.retryFailedConnection();
      }
    } catch (error) {
      this.log(`Error while closing and retrying: ${error}`, $2f600f73c421a514$var$LOG_LEVEL.ERROR);
    }
  }
  async retryFailedConnection() {
    if (this._reconnectAttempts < this._allowedReconnectAttempts) {
      if (this._reconnectTimeoutID) {
        this.log("Retry already scheduled");
        return;
      }
      this.log("Retrying failed connection");
      let timeout = (
        // The timeout logic is taken from
        // https://github.com/joewalnes/reconnecting-websocket
        this._reconnectInterval * Math.pow(this._reconnectDecay, this._reconnectAttempts)
      );
      timeout = timeout > this._maxReconnectInterval ? this._maxReconnectInterval : timeout;
      this.log(`Reconnecting in ${timeout / 1e3} seconds`);
      this._reconnectAttempts += 1;
      this._reconnectTimeoutID = setTimeout(() => this.connect(), timeout);
    } else {
      this.log("Maximum connection retry attempts exceeded", $2f600f73c421a514$var$LOG_LEVEL.ERROR);
      this.emit("reconnect-failed");
    }
  }
  log(msg, log_level = $2f600f73c421a514$var$LOG_LEVEL.DEBUG, ...args) {
    switch (log_level) {
      case $2f600f73c421a514$var$LOG_LEVEL.DEBUG:
        console.debug(`websocket: ${msg}`, ...args);
        break;
      case $2f600f73c421a514$var$LOG_LEVEL.ERROR:
        console.error(`websocket: ${msg}`, ...args);
        break;
      case $2f600f73c421a514$var$LOG_LEVEL.WARN:
        console.warn(`websocket: ${msg}`, ...args);
        break;
      case $2f600f73c421a514$var$LOG_LEVEL.INFO:
      default:
        console.log(`websocket: ${msg}`, ...args);
        break;
    }
  }
  async send(data) {
    try {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._lastMsgSendTime = Date.now();
        this._ws.send(data);
      } else this.log(`Failed to send data, web socket not open.`, $2f600f73c421a514$var$LOG_LEVEL.ERROR);
    } catch (error) {
      this.log(`Failed to send data. ${error}`, $2f600f73c421a514$var$LOG_LEVEL.ERROR);
    }
  }
  async close() {
    try {
      this.log("Closing websocket");
      this._disconnected = true;
      this.clearReconnectTimeout();
      this._closeSocket();
    } catch (error) {
      this.log(`Failed to close websocket. ${error}`);
    }
  }
  get readyState() {
    return this._ws?.readyState ?? WebSocket.CLOSED;
  }
  get url() {
    return this._url;
  }
  get keepAliveTimeout() {
    return this._keepAliveTimeout;
  }
  set keepAliveTimeout(keepAliveTimeout) {
    if (typeof keepAliveTimeout === "number") {
      this.log(`Setting ACK freshness timeout to ${keepAliveTimeout}`);
      this._keepAliveTimeout = keepAliveTimeout;
    }
  }
  get keepAliveInterval() {
    return this._keepAliveInterval;
  }
  set keepAliveInterval(keepAliveInterval) {
    if (typeof keepAliveInterval === "number") {
      this.log(`Setting keep-alive interval to ${keepAliveInterval}`);
      this._keepAliveInterval = keepAliveInterval;
    }
  }
  set shouldRetryFn(cb) {
    if (typeof cb === "function") this._shouldRetryFn = cb;
  }
  get connectionTimeout() {
    return this._connectionTimeout;
  }
  set connectionTimeout(timeout) {
    if (typeof timeout === "number") this._connectionTimeout = timeout;
  }
  get maxReconnectAttempts() {
    return this._allowedReconnectAttempts;
  }
  set maxReconnectAttempts(attempts) {
    if (attempts > 0 && attempts < $2f600f73c421a514$var$MAX_RECONNECT_ATTEMPTS) {
      this.log(`Setting maximum connection retry attempts to ${attempts}`);
      this._allowedReconnectAttempts = attempts;
    } else this._allowedReconnectAttempts = $2f600f73c421a514$var$DEFAULT_RECONNECT_ATTEMPTS;
  }
  get reconnectInterval() {
    return this._reconnectInterval;
  }
  set reconnectInterval(interval) {
    if (typeof interval === "number") this._reconnectInterval = interval < this._maxReconnectInterval ? interval : this._maxReconnectInterval;
  }
  async _handleMessage(event) {
    this._lastMsgRecvTime = Date.now();
    const data = event.data;
    const _parsePromise = new Promise((resolve, reject) => {
      if (typeof data === "string")
        resolve(data);
      else if (data instanceof ArrayBuffer) {
        const arrayBuffer = data;
        resolve(new Uint8Array(arrayBuffer));
      } else if (data instanceof Blob) {
        if (!this._parseBlobToJson) {
          resolve(data);
          return;
        }
        const blob = data;
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          try {
            const json = JSON.parse(text);
            resolve(json);
          } catch (e2) {
            console.error("Failed to parse JSON from Blob:", e2);
          }
        };
        reader.readAsText(blob);
      }
    });
    let msg = await _parsePromise;
    this.emit("message", msg);
  }
};
[
  "binaryType",
  "bufferedAmount",
  "extensions",
  "protocol",
  "readyState",
  "url",
  "keepAliveTimeout",
  "keepAliveInterval",
  "shouldRetryFn",
  "connectionTimeout",
  "maxReconnectAttempts",
  "reconnectInterval"
].forEach((property) => {
  Object.defineProperty($2f600f73c421a514$export$4f3d0ffd941ebefb.prototype, property, {
    enumerable: true
  });
});
[
  "CONNECTING",
  "OPEN",
  "CLOSING",
  "CLOSED"
].forEach((property) => {
  Object.defineProperty($2f600f73c421a514$export$4f3d0ffd941ebefb.prototype, property, {
    enumerable: true,
    value: $2f600f73c421a514$var$readyStates.indexOf(property)
  });
});
[
  "CONNECTING",
  "OPEN",
  "CLOSING",
  "CLOSED"
].forEach((property) => {
  Object.defineProperty($2f600f73c421a514$export$4f3d0ffd941ebefb, property, {
    enumerable: true,
    value: $2f600f73c421a514$var$readyStates.indexOf(property)
  });
});
var $f424abce94945317$exports = {};
$parcel$export2($f424abce94945317$exports, "SmallWebRTCTransport", () => $f424abce94945317$export$62043589d053a879);
var $f424abce94945317$var$TrackStatusMessage = class {
  constructor(receiver_index, enabled) {
    this.type = "trackStatus";
    this.receiver_index = receiver_index;
    this.enabled = enabled;
  }
};
var $f424abce94945317$var$WebRTCTrack = class {
  constructor(track2) {
    this.track = track2;
    this.status = "new";
  }
};
var $f424abce94945317$var$RENEGOTIATE_TYPE = "renegotiate";
var $f424abce94945317$var$PEER_LEFT_TYPE = "peerLeft";
var $f424abce94945317$var$SIGNALLING_TYPE = "signalling";
var $f424abce94945317$var$SignallingMessageObject = class {
  constructor(message) {
    this.type = $f424abce94945317$var$SIGNALLING_TYPE;
    this.message = message;
  }
};
var $f424abce94945317$var$isOfferRefused = (e2) => typeof Response !== "undefined" && e2 instanceof Response && e2.status >= 400 && e2.status < 500;
var $f424abce94945317$var$AUDIO_TRANSCEIVER_INDEX = 0;
var $f424abce94945317$var$VIDEO_TRANSCEIVER_INDEX = 1;
var $f424abce94945317$var$SCREEN_VIDEO_TRANSCEIVER_INDEX = 2;
var $f424abce94945317$export$62043589d053a879 = class extends (0, $7ef5cee66c377f4d$export$86495b081fef8e52) {
  constructor(opts = {}) {
    super();
    this._webrtcRequest = null;
    this._connectResolved = null;
    this._connectFailed = null;
    this.pc = null;
    this.dc = null;
    this.audioCodec = null;
    this.videoCodec = null;
    this.pc_id = null;
    this.offerUrlTemplate = null;
    this.reconnectionAttempts = 0;
    this.maxReconnectionAttempts = 3;
    this.isReconnecting = false;
    this.keepAliveInterval = null;
    this._iceServers = [];
    this._incomingTracks = /* @__PURE__ */ new Map();
    this._canSendIceCandidates = false;
    this._candidateQueue = [];
    this.__flushTimeout = null;
    this._flushDelay = 200;
    this._lastNegotiationError = null;
    this._iceServers = opts.iceServers ?? [];
    this._waitForICEGathering = opts.waitForICEGathering ?? false;
    this.audioCodec = opts.audioCodec ?? null;
    this.videoCodec = opts.videoCodec ?? null;
    this.offerUrlTemplate = opts.offerUrlTemplate ?? null;
    this._webrtcRequest = this._resolveRequestInfo(opts);
    this.mediaManager = opts.mediaManager || new (0, $0817f76e57abfe7a$export$c95c65abc5f47125)(false, false, async (event) => {
      if (!this.pc) return;
      if (event.type == "audio") {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("SmallWebRTCMediaManager replacing audio track");
        await this.getAudioTransceiver().sender.replaceTrack(event.track);
      } else if (event.type == "video") {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("SmallWebRTCMediaManager replacing video track");
        await this.getVideoTransceiver().sender.replaceTrack(event.track);
      } else if (event.type == "screenVideo") {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("SmallWebRTCMediaManager replacing screen video track");
        await this.getScreenVideoTransceiver().sender.replaceTrack(event.track);
      } else if (event.type == "screenAudio") (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("SmallWebRTCMediaManager does not yet support screen audio. Track is ignored.");
    }, (event) => (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("SmallWebRTCMediaManager Track stopped:", event));
  }
  initialize(options, messageHandler) {
    this._options = options;
    this._callbacks = options.callbacks ?? {};
    this._onMessage = messageHandler;
    this.mediaManager.setClientOptions(options);
    this.state = "disconnected";
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("[RTVI Transport] Initialized");
  }
  async initDevices() {
    this.state = "initializing";
    await this.mediaManager.initialize();
    this.state = "initialized";
  }
  setAudioCodec(audioCodec) {
    this.audioCodec = audioCodec;
  }
  setVideoCodec(videoCodec) {
    this.videoCodec = videoCodec;
  }
  _resolveRequestInfo(params) {
    let requestInfo = null;
    const _webrtcUrl = params.webrtcUrl ?? params.connectionUrl ?? null;
    if (_webrtcUrl) {
      const key = params.webrtcUrl ? "webrtcUrl" : "connectionUrl";
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn(`${key} is deprecated. Use webrtcRequestParams instead.`);
      if (params.webrtcRequestParams) (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn(`Both ${key} and webrtcRequestParams provided. Using webrtcRequestParams.`);
      else if (typeof _webrtcUrl === "string") requestInfo = {
        endpoint: _webrtcUrl
      };
      else (0, $e0900798b6cc045b$export$af88d00dbe7f521).error(`Invalid ${key} provided in params. Ignoring.`);
    }
    if (params.webrtcRequestParams) {
      if ((0, $d0e914667cc5346b$export$2dd7ca293b2783)(params.webrtcRequestParams))
        requestInfo = params.webrtcRequestParams;
      else (0, $e0900798b6cc045b$export$af88d00dbe7f521).error(`Invalid webrtcRequestParams provided in params. Ignoring.`);
    }
    return requestInfo ?? this._webrtcRequest;
  }
  _getStartEndpointAsString() {
    const startEndpoint = this.startBotParams?.endpoint;
    switch (typeof startEndpoint) {
      case "string":
        return startEndpoint;
      case "object":
        if (startEndpoint instanceof URL) return startEndpoint.toString();
        if (typeof Request !== "undefined" && startEndpoint instanceof Request) return startEndpoint.url;
    }
    return;
  }
  _isValidObject(value) {
    if (value === null || value === void 0) return false;
    if (typeof value !== "object") throw new (0, $db6391dc7d757577$export$59b4786f333aac02)("Invalid connection parameters");
    return true;
  }
  _fixConnectionOptionsParams(params, supportedKeys) {
    const snakeToCamel = (snakeCaseString) => {
      return snakeCaseString.replace(/_([a-z,A-Z])/g, (_2, letter) => letter.toUpperCase());
    };
    let result = {};
    let sessionId;
    for (const [key, val] of Object.entries(params)) {
      const camelKey = snakeToCamel(key);
      if (camelKey === "sessionId") {
        sessionId = val;
        continue;
      }
      if (!supportedKeys.includes(camelKey)) {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn(`Unrecognized connection parameter: ${key}. Ignored.`);
        continue;
      }
      result[camelKey] = val;
    }
    if (sessionId && this._shouldUseStartBotFallback(result)) result.webrtcRequestParams = this._buildRequestParamsBasedOnStartBotParams(sessionId);
    return result;
  }
  _shouldUseStartBotFallback(options) {
    const hasStartEndpoint = !!this._getStartEndpointAsString();
    const hasNoConnectionParams = !options.webrtcUrl && !options.connectionUrl && !options.webrtcRequestParams;
    return hasStartEndpoint && hasNoConnectionParams;
  }
  _buildRequestParamsBasedOnStartBotParams(sessionId) {
    const startEndpoint = this._getStartEndpointAsString();
    const offerUrl = this.offerUrlTemplate ? this.offerUrlTemplate.replace(":sessionId", sessionId) : startEndpoint.replace("/start", `/sessions/${sessionId}/api/offer`);
    if (typeof Request !== "undefined" && this.startBotParams.endpoint instanceof Request) return {
      endpoint: new Request(offerUrl, this.startBotParams?.endpoint)
    };
    return {
      endpoint: offerUrl,
      headers: this.startBotParams.headers
    };
  }
  _validateConnectionParams(connectParams) {
    if (!this._isValidObject(connectParams)) return void 0;
    const params = connectParams;
    const supportedKeys = [
      "webrtcUrl",
      "connectionUrl",
      "webrtcRequestParams",
      "iceConfig"
    ];
    const fixedParams = this._fixConnectionOptionsParams(params, supportedKeys);
    const webrtcRequestParams = this._resolveRequestInfo(fixedParams);
    if (webrtcRequestParams) fixedParams.webrtcRequestParams = webrtcRequestParams;
    delete fixedParams.connectionUrl;
    delete fixedParams.webrtcUrl;
    if (Object.keys(fixedParams).length === 0) return void 0;
    return fixedParams;
  }
  async _connect(connectParams) {
    if (this._abortController?.signal.aborted) return;
    this.state = "connecting";
    if (connectParams?.iceConfig?.iceServers) this._iceServers = connectParams?.iceConfig?.iceServers;
    this._webrtcRequest = connectParams?.webrtcRequestParams ?? this._webrtcRequest;
    if (!this._webrtcRequest) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).error("No request details provided for WebRTC connection");
      this.state = "error";
      throw new (0, $db6391dc7d757577$export$e0624a511a2c4e9)();
    }
    await this.mediaManager.connect();
    const connected = new Promise((resolve, reject) => {
      this._connectResolved = resolve;
      this._connectFailed = reject;
    });
    await this.startNewPeerConnection();
    if (this._abortController?.signal.aborted) return;
    if (this.dc?.readyState !== "open")
      await connected;
    this.state = "connected";
    this._callbacks.onConnected?.();
    this._callbacks.onBotConnected?.($f424abce94945317$var$botParticipant(this.pc_id));
  }
  syncTrackStatus() {
    this.sendSignallingMessage(new $f424abce94945317$var$TrackStatusMessage($f424abce94945317$var$AUDIO_TRANSCEIVER_INDEX, this.mediaManager.isMicEnabled));
    this.sendSignallingMessage(new $f424abce94945317$var$TrackStatusMessage($f424abce94945317$var$VIDEO_TRANSCEIVER_INDEX, this.mediaManager.isCamEnabled));
    if (this.mediaManager.supportsScreenShare) this.sendSignallingMessage(new $f424abce94945317$var$TrackStatusMessage($f424abce94945317$var$SCREEN_VIDEO_TRANSCEIVER_INDEX, this.mediaManager.isSharingScreen && !!this.mediaManager.tracks().local.screenVideo));
  }
  sendReadyMessage() {
    this.state = "ready";
    this.sendMessage((0, $c0d10c4690969999$export$69aa9ab0334b212).clientReady());
  }
  sendMessage(message) {
    if (!this.dc || this.dc.readyState !== "open") {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn(`Datachannel is not ready. Message not sent: ${message}`);
      return;
    }
    if (!(0, $dfd757760e36925b$export$48f8227f1e7323f5)(message, this._maxMessageSize)) throw new (0, $db6391dc7d757577$export$78e1011ee1942cf6)("Message data too large. Max size is " + this._maxMessageSize);
    this.dc?.send(JSON.stringify(message));
  }
  sendSignallingMessage(message) {
    if (!this.dc || this.dc.readyState !== "open") {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn(`Datachannel is not ready. Message not sent: ${message}`);
      return;
    }
    const signallingMessage = new $f424abce94945317$var$SignallingMessageObject(message);
    this.dc?.send(JSON.stringify(signallingMessage));
  }
  async _disconnect() {
    this.state = "disconnecting";
    await this.stop();
    this.state = "disconnected";
  }
  createPeerConnection() {
    const config = {
      iceServers: this._iceServers
    };
    let pc2 = new RTCPeerConnection(config);
    pc2.onicecandidate = async (event) => {
      if (event.candidate) {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("New ICE candidate:", event.candidate);
        await this.sendIceCandidate(event.candidate);
      } else (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("All ICE candidates have been sent.");
    };
    pc2.addEventListener("icegatheringstatechange", () => {
      if (pc2.iceGatheringState === "complete" && pc2.iceConnectionState === "checking" && this._waitForICEGathering) {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("Ice gathering completed and connection is still checking. Trying to reconnect.");
        this.attemptReconnection(false);
      }
    });
    pc2.addEventListener("iceconnectionstatechange", () => this.handleICEConnectionStateChange());
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`iceConnectionState: ${pc2.iceConnectionState}`);
    pc2.addEventListener("signalingstatechange", () => {
      if (pc2 !== this.pc) return;
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`signalingState: ${pc2.signalingState}`);
      if (pc2.signalingState == "stable") this.handleReconnectionCompleted();
    });
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`signalingState: ${pc2.signalingState}`);
    pc2.addEventListener("track", (evt) => {
      const streamType = evt.transceiver ? evt.transceiver.mid === "0" ? "microphone" : evt.transceiver.mid === "1" ? "camera" : "screenVideo" : null;
      if (!streamType) {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("Received track without transceiver mid", evt);
        return;
      }
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Received new remote track for ${streamType}`);
      this._incomingTracks.set(streamType, new $f424abce94945317$var$WebRTCTrack(evt.track));
      evt.track.addEventListener("unmute", () => {
        const t2 = this._incomingTracks.get(streamType);
        if (t2?.track !== evt.track) return;
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Remote track unmuted: ${streamType}`);
        t2.status = "unmuted";
        this._callbacks.onTrackStarted?.(evt.track);
      });
      evt.track.addEventListener("mute", () => {
        const t2 = this._incomingTracks.get(streamType);
        if (t2?.track !== evt.track || t2.status !== "unmuted") return;
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Remote track muted: ${streamType}`);
        t2.status = "muted";
        this._callbacks.onTrackStopped?.(evt.track);
      });
      evt.track.addEventListener("ended", () => {
        const t2 = this._incomingTracks.get(streamType);
        if (t2?.track !== evt.track) return;
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Remote track ended: ${streamType}`);
        this._callbacks.onTrackStopped?.(evt.track);
        this._incomingTracks.delete(streamType);
      });
    });
    return pc2;
  }
  handleICEConnectionStateChange() {
    if (!this.pc) return;
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`ICE Connection State: ${this.pc.iceConnectionState}`);
    if (this.pc.iceConnectionState === "failed") {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("ICE connection failed, attempting restart.");
      this.attemptReconnection(true);
    } else if (this.pc.iceConnectionState === "disconnected")
      setTimeout(() => {
        if (this.pc?.iceConnectionState === "disconnected") {
          (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("Still disconnected, attempting reconnection.");
          this.attemptReconnection(true);
        }
      }, 5e3);
  }
  handleReconnectionCompleted() {
    this.reconnectionAttempts = 0;
    this.isReconnecting = false;
  }
  async attemptReconnection(recreatePeerConnection = false) {
    if (this._abortController?.signal.aborted) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("Transport disconnected, skipping reconnection.");
      return;
    }
    if (this.isReconnecting) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("Reconnection already in progress, skipping.");
      return;
    }
    if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("Max reconnection attempts reached. Stopping transport.");
      await this.stop(this.buildTransportStartError());
      return;
    }
    this.isReconnecting = true;
    this.reconnectionAttempts++;
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Reconnection attempt ${this.reconnectionAttempts}...`);
    try {
      if (recreatePeerConnection) {
        const oldPC = this.pc;
        await this.startNewPeerConnection(recreatePeerConnection);
        if (oldPC) {
          (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("closing old peer connection");
          this.closePeerConnection(oldPC);
        }
      } else await this.negotiate();
    } catch (e2) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).error(`Reconnection stopped: ${e2}`);
    }
  }
  async waitForIceGatheringComplete(timeoutMs = 2e3) {
    const pc2 = this.pc;
    if (pc2.iceGatheringState === "complete") return;
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).info("Waiting for ICE gathering to complete. Current state:", pc2.iceGatheringState);
    return new Promise((resolve) => {
      let timeoutId;
      const cleanup = () => {
        pc2.removeEventListener("icegatheringstatechange", checkState);
        clearTimeout(timeoutId);
      };
      const checkState = () => {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("icegatheringstatechange:", pc2.iceGatheringState);
        if (pc2.iceGatheringState === "complete") {
          cleanup();
          resolve();
        }
      };
      const onTimeout = () => {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`ICE gathering timed out after ${timeoutMs} ms.`);
        cleanup();
        resolve();
      };
      pc2.addEventListener("icegatheringstatechange", checkState);
      timeoutId = setTimeout(onTimeout, timeoutMs);
      checkState();
    });
  }
  async sendIceCandidate(candidate) {
    if (!this._webrtcRequest) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).error("No request details provided for WebRTC connection");
      return;
    }
    this._candidateQueue.push(candidate);
    if (!this.__flushTimeout) this.__flushTimeout = setTimeout(() => this.flushIceCandidates(), this._flushDelay);
  }
  async flushIceCandidates() {
    this.__flushTimeout = null;
    if (!this._webrtcRequest || this._candidateQueue.length === 0 || !this._canSendIceCandidates) return;
    const candidates = this._candidateQueue.splice(0, this._candidateQueue.length);
    let headers;
    try {
      if (typeof Request !== "undefined" && this._webrtcRequest.endpoint instanceof Request) {
        console.log("Using Request object headers");
        headers = this._webrtcRequest.endpoint.headers;
      } else headers = new Headers({
        "Content-Type": "application/json",
        ...Object.fromEntries((this._webrtcRequest.headers ?? new Headers()).entries())
      });
      const payload = {
        pc_id: this.pc_id,
        candidates: candidates.map((c2) => ({
          candidate: c2.candidate,
          sdp_mid: c2.sdpMid,
          sdp_mline_index: c2.sdpMLineIndex
        }))
      };
      await fetch(this._webrtcRequest.endpoint, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      });
    } catch (e2) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).error(`Failed to send ICE candidate: ${e2}`);
    }
  }
  async negotiate(recreatePeerConnection = false) {
    if (!this.pc) return Promise.reject("Peer connection is not initialized");
    if (!this._webrtcRequest) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).error("No request details provided for WebRTC connection");
      this.state = "error";
      throw new (0, $db6391dc7d757577$export$e0624a511a2c4e9)();
    }
    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      if (this._waitForICEGathering) await this.waitForIceGatheringComplete();
      let offerSdp = this.pc.localDescription;
      if (this.audioCodec && this.audioCodec !== "default")
        offerSdp.sdp = this.sdpFilterCodec("audio", this.audioCodec, offerSdp.sdp);
      if (this.videoCodec && this.videoCodec !== "default")
        offerSdp.sdp = this.sdpFilterCodec("video", this.videoCodec, offerSdp.sdp);
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Will create offer for peerId: ${this.pc_id}`);
      const requestData = {
        sdp: offerSdp.sdp,
        type: offerSdp.type,
        pc_id: this.pc_id,
        restart_pc: recreatePeerConnection
      };
      let request;
      if (typeof Request !== "undefined" && this._webrtcRequest.endpoint instanceof Request) request = {
        endpoint: new Request(this._webrtcRequest.endpoint, {
          body: JSON.stringify(requestData)
        })
      };
      else {
        request = (0, import_cloneDeep.default)(this._webrtcRequest);
        if (this._webrtcRequest.requestData) requestData.requestData = this._webrtcRequest.requestData;
        request.requestData = requestData;
      }
      const answer = await (0, $d0e914667cc5346b$export$699251e5611cc6db)(request);
      this.pc_id = answer.pc_id;
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Received answer for peer connection id ${answer.pc_id}`);
      await this.pc.setRemoteDescription(answer);
      this._canSendIceCandidates = true;
      await this.flushIceCandidates();
    } catch (e2) {
      this._lastNegotiationError = e2;
      if ($f424abce94945317$var$isOfferRefused(e2)) {
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).error(`WebRTC offer rejected with status ${e2.status}`);
        this.isReconnecting = false;
        await this.stop(this.buildTransportStartError());
        return;
      }
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`Reconnection attempt ${this.reconnectionAttempts} failed: ${e2}`);
      this.isReconnecting = false;
      setTimeout(() => this.attemptReconnection(true), 2e3);
    }
  }
  buildTransportStartError() {
    const e2 = this._lastNegotiationError;
    const error = new (0, $db6391dc7d757577$export$e0624a511a2c4e9)($f424abce94945317$var$isOfferRefused(e2) ? `WebRTC offer rejected with status ${e2.status}` : `Offer request failed${e2 ? `: ${String(e2)}` : "."}`);
    error.cause = e2;
    error.status = e2?.status;
    return error;
  }
  addInitialTransceivers() {
    this.pc.addTransceiver("audio", {
      direction: "sendrecv"
    });
    this.pc.addTransceiver("video", {
      direction: "sendrecv"
    });
    if (this.mediaManager.supportsScreenShare)
      this.pc.addTransceiver("video", {
        direction: "sendonly"
      });
  }
  getAudioTransceiver() {
    return this.pc.getTransceivers()[$f424abce94945317$var$AUDIO_TRANSCEIVER_INDEX];
  }
  getVideoTransceiver() {
    return this.pc.getTransceivers()[$f424abce94945317$var$VIDEO_TRANSCEIVER_INDEX];
  }
  getScreenVideoTransceiver() {
    return this.pc.getTransceivers()[$f424abce94945317$var$SCREEN_VIDEO_TRANSCEIVER_INDEX];
  }
  async startNewPeerConnection(recreatePeerConnection = false) {
    this.pc = this.createPeerConnection();
    this.addInitialTransceivers();
    this.dc = this.createDataChannel("chat", {
      ordered: true
    });
    await this.addUserMedia();
    await this.negotiate(recreatePeerConnection);
  }
  async addUserMedia() {
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`addUserMedia this.tracks(): ${this.tracks()}`);
    let audioTrack = this.tracks().local.audio;
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`addUserMedia audioTrack: ${audioTrack}`);
    if (audioTrack) await this.getAudioTransceiver().sender.replaceTrack(audioTrack);
    let videoTrack = this.tracks().local.video;
    (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`addUserMedia videoTrack: ${videoTrack}`);
    if (videoTrack) await this.getVideoTransceiver().sender.replaceTrack(videoTrack);
    if (this.mediaManager.supportsScreenShare) {
      videoTrack = this.tracks().local.screenVideo;
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug(`addUserMedia screenVideoTrack: ${videoTrack}`);
      if (videoTrack) await this.getScreenVideoTransceiver().sender.replaceTrack(videoTrack);
    }
  }
  // Method to handle a general message (this can be expanded for other types of messages)
  handleMessage(message) {
    try {
      const messageObj = JSON.parse(message);
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("received message:", messageObj);
      if (messageObj.type === $f424abce94945317$var$SIGNALLING_TYPE) this.handleSignallingMessage(messageObj);
      else if (messageObj.label === "rtvi-ai") this._onMessage({
        id: messageObj.id,
        type: messageObj.type,
        data: messageObj.data
      });
    } catch (error) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).error("Failed to parse JSON message:", error);
    }
  }
  // Method to handle signalling messages specifically
  async handleSignallingMessage(messageObj) {
    const signallingMessage = messageObj;
    switch (signallingMessage.message.type) {
      case $f424abce94945317$var$RENEGOTIATE_TYPE:
        this.attemptReconnection(false);
        break;
      case $f424abce94945317$var$PEER_LEFT_TYPE:
        this._callbacks.onBotDisconnected?.($f424abce94945317$var$botParticipant(this.pc_id));
        break;
      default:
        (0, $e0900798b6cc045b$export$af88d00dbe7f521).warn("Unknown signalling message:", signallingMessage.message);
    }
  }
  createDataChannel(label, options) {
    const dc2 = this.pc.createDataChannel(label, options);
    dc2.addEventListener("close", () => {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("datachannel closed");
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
    });
    dc2.addEventListener("open", () => {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("datachannel opened");
      this._maxMessageSize = this.pc?.sctp?.maxMessageSize ?? 65536;
      if (this._connectResolved) {
        this.syncTrackStatus();
        this._connectResolved();
        this._connectResolved = null;
        this._connectFailed = null;
      }
      this.keepAliveInterval = setInterval(() => {
        if (dc2.readyState !== "open") return;
        const message = "ping: " + (/* @__PURE__ */ new Date()).getTime();
        dc2.send(message);
      }, 1e3);
    });
    dc2.addEventListener("message", (evt) => {
      let message = evt.data;
      this.handleMessage(message);
    });
    return dc2;
  }
  closePeerConnection(pc2) {
    const tracksInUse = new Set(pc2 !== this.pc ? (this.pc?.getSenders() ?? []).map((sender) => sender.track) : []);
    pc2.getTransceivers().forEach((transceiver) => {
      if (transceiver.stop) transceiver.stop();
    });
    pc2.getSenders().forEach((sender) => {
      if (sender.track && !tracksInUse.has(sender.track)) sender.track.stop();
    });
    pc2.close();
  }
  async stop(error) {
    if (!this.pc) {
      (0, $e0900798b6cc045b$export$af88d00dbe7f521).debug("Peer connection is already closed or null.");
      return;
    }
    if (error) this.state = "error";
    if (this.dc) this.dc.close();
    this.closePeerConnection(this.pc);
    this.pc = null;
    await this.mediaManager.disconnect();
    this.pc_id = null;
    this.reconnectionAttempts = 0;
    this.isReconnecting = false;
    this._lastNegotiationError = null;
    this._callbacks.onDisconnected?.();
    this._candidateQueue = [];
    this._canSendIceCandidates = false;
    if (this._connectFailed) this._connectFailed(error ?? new (0, $db6391dc7d757577$export$e0624a511a2c4e9)());
    this._connectFailed = null;
    this._connectResolved = null;
  }
  getAllMics() {
    return this.mediaManager.getAllMics();
  }
  getAllCams() {
    return this.mediaManager.getAllCams();
  }
  getAllSpeakers() {
    return this.mediaManager.getAllSpeakers();
  }
  async updateMic(micId) {
    return this.mediaManager.updateMic(micId);
  }
  updateCam(camId) {
    return this.mediaManager.updateCam(camId);
  }
  updateSpeaker(speakerId) {
    return this.mediaManager.updateSpeaker(speakerId);
  }
  get selectedMic() {
    return this.mediaManager.selectedMic;
  }
  get selectedCam() {
    return this.mediaManager.selectedCam;
  }
  get selectedSpeaker() {
    return this.mediaManager.selectedSpeaker;
  }
  set iceServers(iceServers) {
    this._iceServers = iceServers;
  }
  get iceServers() {
    return this._iceServers;
  }
  enableMic(enable) {
    this.mediaManager.enableMic(enable);
    this.sendSignallingMessage(new $f424abce94945317$var$TrackStatusMessage($f424abce94945317$var$AUDIO_TRANSCEIVER_INDEX, enable));
  }
  enableCam(enable) {
    this.mediaManager.enableCam(enable);
    this.sendSignallingMessage(new $f424abce94945317$var$TrackStatusMessage($f424abce94945317$var$VIDEO_TRANSCEIVER_INDEX, enable));
  }
  async enableScreenShare(enable) {
    if (!this.mediaManager.supportsScreenShare) throw new (0, $db6391dc7d757577$export$bd0820eb8444fcd9)("enableScreenShare", "mediaManager", "Screen sharing is not supported by the current media manager");
    this.mediaManager.enableScreenShare(enable);
    this.sendSignallingMessage(new $f424abce94945317$var$TrackStatusMessage($f424abce94945317$var$SCREEN_VIDEO_TRANSCEIVER_INDEX, enable));
  }
  get isCamEnabled() {
    return this.mediaManager.isCamEnabled;
  }
  get isMicEnabled() {
    return this.mediaManager.isMicEnabled;
  }
  get isSharingScreen() {
    return this.mediaManager.isSharingScreen;
  }
  /**
   * Carries every kind of media, so what the user can send is what the media
   * manager can capture.
   */
  get mediaSupport() {
    return {
      ...this.mediaManager.mediaSupport,
      botAudio: true,
      botVideo: true
    };
  }
  get state() {
    return this._state;
  }
  set state(state) {
    if (this._state === state) return;
    this._state = state;
    this._callbacks.onTransportStateChanged?.(state);
  }
  tracks() {
    return this.mediaManager.tracks();
  }
  sdpFilterCodec(kind, codec, realSdp) {
    const allowed = [];
    const rtxRegex = new RegExp("a=fmtp:(\\d+) apt=(\\d+)\\r$");
    const codecRegex = new RegExp("a=rtpmap:([0-9]+) " + this.escapeRegExp(codec));
    const videoRegex = new RegExp("(m=" + kind + " .*?)( ([0-9]+))*\\s*$");
    const lines = realSdp.split("\n");
    let isKind = false;
    for (let i2 = 0; i2 < lines.length; i2++) {
      if (lines[i2].startsWith("m=" + kind + " ")) isKind = true;
      else if (lines[i2].startsWith("m=")) isKind = false;
      if (isKind) {
        const match = lines[i2].match(codecRegex);
        if (match) allowed.push(parseInt(match[1]));
        const matchRtx = lines[i2].match(rtxRegex);
        if (matchRtx && allowed.includes(parseInt(matchRtx[2]))) allowed.push(parseInt(matchRtx[1]));
      }
    }
    const skipRegex = "a=(fmtp|rtcp-fb|rtpmap):([0-9]+)";
    let sdp = "";
    isKind = false;
    for (let i2 = 0; i2 < lines.length; i2++) {
      if (lines[i2].startsWith("m=" + kind + " ")) isKind = true;
      else if (lines[i2].startsWith("m=")) isKind = false;
      if (isKind) {
        const skipMatch = lines[i2].match(skipRegex);
        if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) continue;
        else if (lines[i2].match(videoRegex)) sdp += lines[i2].replace(videoRegex, "$1 " + allowed.join(" ")) + "\n";
        else sdp += lines[i2] + "\n";
      } else sdp += lines[i2] + "\n";
    }
    return sdp;
  }
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
};
$f424abce94945317$export$62043589d053a879.SERVICE_NAME = "small-webrtc-transport";
var $f424abce94945317$var$botParticipant = (pc_id) => ({
  id: pc_id || "bot",
  local: false,
  name: "bot"
});

// src/main.js
function createVestaVoiceClient(callbacks = {}) {
  return new $364c127d152b1085$export$8f7f86a77535f7a3({ transport: new $f424abce94945317$export$62043589d053a879(), enableMic: true, callbacks });
}
export {
  createVestaVoiceClient
};
/*! Bundled license information:

bowser/bowser.mjs:
  (*!
   * Bowser - a browser detector
   * https://github.com/lancedikson/bowser
   * MIT License | (c) Dustin Diaz 2012-2015
   * MIT License | (c) Denis Demchenko 2015-2026
   *)
  (*!
  * Bowser - a browser detector
  * https://github.com/bowser-js/bowser
  * MIT License | (c) Dustin Diaz 2012-2015
  * MIT License | (c) Denis Demchenko 2015-2026
  *)

@daily-co/daily-js/dist/daily-esm.js:
  (*!
   * Bowser - a browser detector
   * https://github.com/bowser-js/bowser
   * MIT License | (c) Dustin Diaz 2012-2015
   * MIT License | (c) Denis Demchenko 2015-2019
   *)

@pipecat-ai/small-webrtc-transport/dist/index.module.js:
  (*!
   * wavtools is adapted from openai-realtime-console
   * (https://github.com/openai/openai-realtime-console) and modified by Daily.
   *
   * @license MIT
   *
   * Copyright (c) 2024 OpenAI
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *)
  (*!
  * Adapted from openai-realtime-console (https://github.com/openai/openai-realtime-console).
  * Copyright (c) 2024 OpenAI. Modified by Daily. MIT License; see wavtools/index.js.
  *)
  (*!
   * Adapted from openai-realtime-console (https://github.com/openai/openai-realtime-console).
   * Copyright (c) 2024 OpenAI. Modified by Daily. MIT License; see wavtools/index.js.
   *)
*/
