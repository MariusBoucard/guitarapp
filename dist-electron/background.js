"use strict";
const require$$0$1 = require("electron");
const require$$1$1 = require("fs");
const require$$1 = require("path");
const require$$3 = require("https");
const require$$0$2 = require("stream");
const require$$2 = require("events");
const require$$0$3 = require("buffer");
const require$$1$2 = require("util");
const url = require("url");
const fs = require("fs-extra");
const os = require("os");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dist$1 = {};
var downloadChromeExtension = {};
var utils$1 = {};
var hasRequiredUtils$1;
function requireUtils$1() {
  if (hasRequiredUtils$1) return utils$1;
  hasRequiredUtils$1 = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.changePermissions = exports.downloadFile = exports.getPath = void 0;
    const electron_1 = require$$0$1;
    const fs2 = require$$1$1;
    const path = require$$1;
    const https = require$$3;
    const getPath = () => {
      const savePath = electron_1.app.getPath("userData");
      return path.resolve(`${savePath}/extensions`);
    };
    exports.getPath = getPath;
    const request = electron_1.net ? electron_1.net.request : https.get;
    const downloadFile = (from, to) => {
      return new Promise((resolve, reject) => {
        const req = request(from);
        req.on("response", (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return (0, exports.downloadFile)(res.headers.location, to).then(resolve).catch(reject);
          }
          res.pipe(fs2.createWriteStream(to)).on("close", resolve);
          res.on("error", reject);
        });
        req.on("error", reject);
        req.end();
      });
    };
    exports.downloadFile = downloadFile;
    const changePermissions = (dir, mode) => {
      const files = fs2.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        fs2.chmodSync(filePath, parseInt(`${mode}`, 8));
        if (fs2.statSync(filePath).isDirectory()) {
          (0, exports.changePermissions)(filePath, mode);
        }
      });
    };
    exports.changePermissions = changePermissions;
  })(utils$1);
  return utils$1;
}
var utf8 = {};
var utils = {};
var support = {};
var readable = { exports: {} };
var processNextickArgs = { exports: {} };
var hasRequiredProcessNextickArgs;
function requireProcessNextickArgs() {
  if (hasRequiredProcessNextickArgs) return processNextickArgs.exports;
  hasRequiredProcessNextickArgs = 1;
  if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
    processNextickArgs.exports = { nextTick };
  } else {
    processNextickArgs.exports = process;
  }
  function nextTick(fn, arg1, arg2, arg3) {
    if (typeof fn !== "function") {
      throw new TypeError('"callback" argument must be a function');
    }
    var len = arguments.length;
    var args, i;
    switch (len) {
      case 0:
      case 1:
        return process.nextTick(fn);
      case 2:
        return process.nextTick(function afterTickOne() {
          fn.call(null, arg1);
        });
      case 3:
        return process.nextTick(function afterTickTwo() {
          fn.call(null, arg1, arg2);
        });
      case 4:
        return process.nextTick(function afterTickThree() {
          fn.call(null, arg1, arg2, arg3);
        });
      default:
        args = new Array(len - 1);
        i = 0;
        while (i < args.length) {
          args[i++] = arguments[i];
        }
        return process.nextTick(function afterTick() {
          fn.apply(null, args);
        });
    }
  }
  return processNextickArgs.exports;
}
var isarray;
var hasRequiredIsarray;
function requireIsarray() {
  if (hasRequiredIsarray) return isarray;
  hasRequiredIsarray = 1;
  var toString = {}.toString;
  isarray = Array.isArray || function(arr) {
    return toString.call(arr) == "[object Array]";
  };
  return isarray;
}
var stream;
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream) return stream;
  hasRequiredStream = 1;
  stream = require$$0$2;
  return stream;
}
var safeBuffer = { exports: {} };
var hasRequiredSafeBuffer;
function requireSafeBuffer() {
  if (hasRequiredSafeBuffer) return safeBuffer.exports;
  hasRequiredSafeBuffer = 1;
  (function(module, exports) {
    var buffer = require$$0$3;
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  })(safeBuffer, safeBuffer.exports);
  return safeBuffer.exports;
}
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util;
  hasRequiredUtil = 1;
  function isArray(arg) {
    if (Array.isArray) {
      return Array.isArray(arg);
    }
    return objectToString(arg) === "[object Array]";
  }
  util.isArray = isArray;
  function isBoolean(arg) {
    return typeof arg === "boolean";
  }
  util.isBoolean = isBoolean;
  function isNull(arg) {
    return arg === null;
  }
  util.isNull = isNull;
  function isNullOrUndefined(arg) {
    return arg == null;
  }
  util.isNullOrUndefined = isNullOrUndefined;
  function isNumber(arg) {
    return typeof arg === "number";
  }
  util.isNumber = isNumber;
  function isString(arg) {
    return typeof arg === "string";
  }
  util.isString = isString;
  function isSymbol(arg) {
    return typeof arg === "symbol";
  }
  util.isSymbol = isSymbol;
  function isUndefined(arg) {
    return arg === void 0;
  }
  util.isUndefined = isUndefined;
  function isRegExp(re) {
    return objectToString(re) === "[object RegExp]";
  }
  util.isRegExp = isRegExp;
  function isObject(arg) {
    return typeof arg === "object" && arg !== null;
  }
  util.isObject = isObject;
  function isDate(d) {
    return objectToString(d) === "[object Date]";
  }
  util.isDate = isDate;
  function isError(e) {
    return objectToString(e) === "[object Error]" || e instanceof Error;
  }
  util.isError = isError;
  function isFunction(arg) {
    return typeof arg === "function";
  }
  util.isFunction = isFunction;
  function isPrimitive(arg) {
    return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
    typeof arg === "undefined";
  }
  util.isPrimitive = isPrimitive;
  util.isBuffer = Buffer.isBuffer;
  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }
  return util;
}
var inherits = { exports: {} };
var inherits_browser = { exports: {} };
var hasRequiredInherits_browser;
function requireInherits_browser() {
  if (hasRequiredInherits_browser) return inherits_browser.exports;
  hasRequiredInherits_browser = 1;
  if (typeof Object.create === "function") {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  return inherits_browser.exports;
}
var hasRequiredInherits;
function requireInherits() {
  if (hasRequiredInherits) return inherits.exports;
  hasRequiredInherits = 1;
  try {
    var util2 = require("util");
    if (typeof util2.inherits !== "function") throw "";
    inherits.exports = util2.inherits;
  } catch (e) {
    inherits.exports = requireInherits_browser();
  }
  return inherits.exports;
}
var BufferList = { exports: {} };
var hasRequiredBufferList;
function requireBufferList() {
  if (hasRequiredBufferList) return BufferList.exports;
  hasRequiredBufferList = 1;
  (function(module) {
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = requireSafeBuffer().Buffer;
    var util2 = require$$1$2;
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module.exports = (function() {
      function BufferList2() {
        _classCallCheck(this, BufferList2);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList2.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList2.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList2.prototype.shift = function shift() {
        if (this.length === 0) return;
        var ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList2.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList2.prototype.join = function join(s) {
        if (this.length === 0) return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList2.prototype.concat = function concat(n) {
        if (this.length === 0) return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList2;
    })();
    if (util2 && util2.inspect && util2.inspect.custom) {
      module.exports.prototype[util2.inspect.custom] = function() {
        var obj = util2.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  })(BufferList);
  return BufferList.exports;
}
var destroy_1;
var hasRequiredDestroy;
function requireDestroy() {
  if (hasRequiredDestroy) return destroy_1;
  hasRequiredDestroy = 1;
  var pna = requireProcessNextickArgs();
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          pna.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          pna.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          pna.nextTick(emitErrorNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          pna.nextTick(emitErrorNT, _this, err2);
        }
      } else if (cb) {
        cb(err2);
      }
    });
    return this;
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  destroy_1 = {
    destroy,
    undestroy
  };
  return destroy_1;
}
var node;
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node;
  hasRequiredNode = 1;
  node = require$$1$2.deprecate;
  return node;
}
var _stream_writable;
var hasRequired_stream_writable;
function require_stream_writable() {
  if (hasRequired_stream_writable) return _stream_writable;
  hasRequired_stream_writable = 1;
  var pna = requireProcessNextickArgs();
  _stream_writable = Writable;
  function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state);
    };
  }
  var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
  var Duplex;
  Writable.WritableState = WritableState;
  var util2 = Object.create(requireUtil());
  util2.inherits = requireInherits();
  var internalUtil = {
    deprecate: requireNode()
  };
  var Stream = requireStream();
  var Buffer2 = requireSafeBuffer().Buffer;
  var OurUint8Array = (typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var destroyImpl = requireDestroy();
  util2.inherits(Writable, Stream);
  function nop() {
  }
  function WritableState(options, stream2) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    var isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
    var hwm = options.highWaterMark;
    var writableHwm = options.writableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0) this.highWaterMark = hwm;
    else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;
    else this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream2, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch (_2) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function(object2) {
        if (realHasInstance.call(this, object2)) return true;
        if (this !== Writable) return false;
        return object2 && object2._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function(object2) {
      return object2 instanceof this;
    };
  }
  function Writable(options) {
    Duplex = Duplex || require_stream_duplex();
    if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
      return new Writable(options);
    }
    this._writableState = new WritableState(options, this);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function") this._write = options.write;
      if (typeof options.writev === "function") this._writev = options.writev;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
      if (typeof options.final === "function") this._final = options.final;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    this.emit("error", new Error("Cannot pipe, not readable"));
  };
  function writeAfterEnd(stream2, cb) {
    var er = new Error("write after end");
    stream2.emit("error", er);
    pna.nextTick(cb, er);
  }
  function validChunk(stream2, state, chunk, cb) {
    var valid = true;
    var er = false;
    if (chunk === null) {
      er = new TypeError("May not write null values to stream");
    } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    if (er) {
      stream2.emit("error", er);
      pna.nextTick(cb, er);
      valid = false;
    }
    return valid;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    var isBuf = !state.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer2.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf) encoding = "buffer";
    else if (!encoding) encoding = state.defaultEncoding;
    if (typeof cb !== "function") cb = nop;
    if (state.ended) writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    var state = this._writableState;
    state.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string") encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer2.from(chunk, encoding);
    }
    return chunk;
  }
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function writeOrBuffer(stream2, state, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret) state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream2, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream2, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (writev) stream2._writev(chunk, state.onwrite);
    else stream2._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream2, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
      pna.nextTick(cb, er);
      pna.nextTick(finishMaybe, stream2, state);
      stream2._writableState.errorEmitted = true;
      stream2.emit("error", er);
    } else {
      cb(er);
      stream2._writableState.errorEmitted = true;
      stream2.emit("error", er);
      finishMaybe(stream2, state);
    }
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream2, er) {
    var state = stream2._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    onwriteStateUpdate(state);
    if (er) onwriteError(stream2, state, sync, er, cb);
    else {
      var finished = needFinish(state);
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream2, state);
      }
      if (sync) {
        asyncWrite(afterWrite, stream2, state, finished, cb);
      } else {
        afterWrite(stream2, state, finished, cb);
      }
    }
  }
  function afterWrite(stream2, state, finished, cb) {
    if (!finished) onwriteDrain(stream2, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream2, state);
  }
  function onwriteDrain(stream2, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream2.emit("drain");
    }
  }
  function clearBuffer(stream2, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream2._writev && entry && entry.next) {
      var l = state.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer[count] = entry;
        if (!entry.isBuf) allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer.allBuffers = allBuffers;
      doWrite(stream2, state, true, state.length, buffer, "", holder.finish);
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
      state.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream2, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        state.bufferedRequestCount--;
        if (state.writing) {
          break;
        }
      }
      if (entry === null) state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new Error("_write() is not implemented"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending) endWritable(this, state, cb);
  };
  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }
  function callFinal(stream2, state) {
    stream2._final(function(err) {
      state.pendingcb--;
      if (err) {
        stream2.emit("error", err);
      }
      state.prefinished = true;
      stream2.emit("prefinish");
      finishMaybe(stream2, state);
    });
  }
  function prefinish(stream2, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream2._final === "function") {
        state.pendingcb++;
        state.finalCalled = true;
        pna.nextTick(callFinal, stream2, state);
      } else {
        state.prefinished = true;
        stream2.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream2, state) {
    var need = needFinish(state);
    if (need) {
      prefinish(stream2, state);
      if (state.pendingcb === 0) {
        state.finished = true;
        stream2.emit("finish");
      }
    }
    return need;
  }
  function endWritable(stream2, state, cb) {
    state.ending = true;
    finishMaybe(stream2, state);
    if (cb) {
      if (state.finished) pna.nextTick(cb);
      else stream2.once("finish", cb);
    }
    state.ended = true;
    stream2.writable = false;
  }
  function onCorkedFinish(corkReq, state, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state.corkedRequestsFree.next = corkReq;
  }
  Object.defineProperty(Writable.prototype, "destroyed", {
    get: function() {
      if (this._writableState === void 0) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    this.end();
    cb(err);
  };
  return _stream_writable;
}
var _stream_duplex;
var hasRequired_stream_duplex;
function require_stream_duplex() {
  if (hasRequired_stream_duplex) return _stream_duplex;
  hasRequired_stream_duplex = 1;
  var pna = requireProcessNextickArgs();
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj) {
      keys2.push(key);
    }
    return keys2;
  };
  _stream_duplex = Duplex;
  var util2 = Object.create(requireUtil());
  util2.inherits = requireInherits();
  var Readable = require_stream_readable();
  var Writable = require_stream_writable();
  util2.inherits(Duplex, Readable);
  {
    var keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
      var method = keys[v];
      if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  function Duplex(options) {
    if (!(this instanceof Duplex)) return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options && options.readable === false) this.readable = false;
    if (options && options.writable === false) this.writable = false;
    this.allowHalfOpen = true;
    if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
    this.once("end", onend);
  }
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function onend() {
    if (this.allowHalfOpen || this._writableState.ended) return;
    pna.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  Object.defineProperty(Duplex.prototype, "destroyed", {
    get: function() {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(value) {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
  Duplex.prototype._destroy = function(err, cb) {
    this.push(null);
    this.end();
    pna.nextTick(cb, err);
  };
  return _stream_duplex;
}
var string_decoder = {};
var hasRequiredString_decoder;
function requireString_decoder() {
  if (hasRequiredString_decoder) return string_decoder;
  hasRequiredString_decoder = 1;
  var Buffer2 = requireSafeBuffer().Buffer;
  var isEncoding = Buffer2.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  function _normalizeEncoding(enc) {
    if (!enc) return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried) return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  string_decoder.StringDecoder = StringDecoder;
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer2.allocUnsafe(nb);
  }
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0) return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === void 0) return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
  function utf8CheckByte(byte) {
    if (byte <= 127) return 0;
    else if (byte >> 5 === 6) return 2;
    else if (byte >> 4 === 14) return 3;
    else if (byte >> 3 === 30) return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i) return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2) nb = 0;
        else self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "�";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "�";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "�";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf);
    if (r !== void 0) return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed) return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + "�";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0) return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
  return string_decoder;
}
var _stream_readable;
var hasRequired_stream_readable;
function require_stream_readable() {
  if (hasRequired_stream_readable) return _stream_readable;
  hasRequired_stream_readable = 1;
  var pna = requireProcessNextickArgs();
  _stream_readable = Readable;
  var isArray = requireIsarray();
  var Duplex;
  Readable.ReadableState = ReadableState;
  require$$2.EventEmitter;
  var EElistenerCount = function(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = requireStream();
  var Buffer2 = requireSafeBuffer().Buffer;
  var OurUint8Array = (typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var util2 = Object.create(requireUtil());
  util2.inherits = requireInherits();
  var debugUtil = require$$1$2;
  var debug = void 0;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function() {
    };
  }
  var BufferList2 = requireBufferList();
  var destroyImpl = requireDestroy();
  var StringDecoder;
  util2.inherits(Readable, Stream);
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
    else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);
    else emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream2) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    var isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
    var hwm = options.highWaterMark;
    var readableHwm = options.readableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0) this.highWaterMark = hwm;
    else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;
    else this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.buffer = new BufferList2();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require_stream_duplex();
    if (!(this instanceof Readable)) return new Readable(options);
    this._readableState = new ReadableState(options, this);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function") this._read = options.read;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  Object.defineProperty(Readable.prototype, "destroyed", {
    get: function() {
      if (this._readableState === void 0) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    this.push(null);
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    var skipChunkCheck;
    if (!state.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  function readableAddChunk(stream2, chunk, encoding, addToFront, skipChunkCheck) {
    var state = stream2._readableState;
    if (chunk === null) {
      state.reading = false;
      onEofChunk(stream2, state);
    } else {
      var er;
      if (!skipChunkCheck) er = chunkInvalid(state, chunk);
      if (er) {
        stream2.emit("error", er);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state.endEmitted) stream2.emit("error", new Error("stream.unshift() after end event"));
          else addChunk(stream2, state, chunk, true);
        } else if (state.ended) {
          stream2.emit("error", new Error("stream.push() after EOF"));
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0) addChunk(stream2, state, chunk, false);
            else maybeReadMore(stream2, state);
          } else {
            addChunk(stream2, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
      }
    }
    return needMoreData(state);
  }
  function addChunk(stream2, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
      stream2.emit("data", chunk);
      stream2.read(0);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) state.buffer.unshift(chunk);
      else state.buffer.push(chunk);
      if (state.needReadable) emitReadable(stream2);
    }
    maybeReadMore(stream2, state);
  }
  function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    return er;
  }
  function needMoreData(state) {
    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
  }
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
    this._readableState.decoder = new StringDecoder(enc);
    this._readableState.encoding = enc;
    return this;
  };
  var MAX_HWM = 8388608;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended) return 0;
    if (state.objectMode) return 1;
    if (n !== n) {
      if (state.flowing && state.length) return state.buffer.head.data.length;
      else return state.length;
    }
    if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length) return n;
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0) state.emittedReadable = false;
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended) endReadable(this);
      else emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0) endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state.reading = true;
      state.sync = true;
      if (state.length === 0) state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
      if (!state.reading) n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0) ret = fromList(n, state);
    else ret = null;
    if (ret === null) {
      state.needReadable = true;
      n = 0;
    } else {
      state.length -= n;
    }
    if (state.length === 0) {
      if (!state.ended) state.needReadable = true;
      if (nOrig !== n && state.ended) endReadable(this);
    }
    if (ret !== null) this.emit("data", ret);
    return ret;
  };
  function onEofChunk(stream2, state) {
    if (state.ended) return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    emitReadable(stream2);
  }
  function emitReadable(stream2) {
    var state = stream2._readableState;
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      if (state.sync) pna.nextTick(emitReadable_, stream2);
      else emitReadable_(stream2);
    }
  }
  function emitReadable_(stream2) {
    debug("emit readable");
    stream2.emit("readable");
    flow(stream2);
  }
  function maybeReadMore(stream2, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      pna.nextTick(maybeReadMore_, stream2, state);
    }
  }
  function maybeReadMore_(stream2, state) {
    var len = state.length;
    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
      debug("maybeReadMore read 0");
      stream2.read(0);
      if (len === state.length)
        break;
      else len = state.length;
    }
    state.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    this.emit("error", new Error("_read() is not implemented"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state.endEmitted) pna.nextTick(endFn);
    else src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable2, unpipeInfo) {
      debug("onunpipe");
      if (readable2 === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
    }
    var increasedAwaitDrain = false;
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      increasedAwaitDrain = false;
      var ret = dest.write(chunk);
      if (false === ret && !increasedAwaitDrain) {
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state.awaitDrain);
          state.awaitDrain++;
          increasedAwaitDrain = true;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0) dest.emit("error", er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function() {
      var state = src._readableState;
      debug("pipeOnDrain", state.awaitDrain);
      if (state.awaitDrain) state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    var unpipeInfo = { hasUnpiped: false };
    if (state.pipesCount === 0) return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes) return this;
      if (!dest) dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest) dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0; i < len; i++) {
        dests[i].emit("unpipe", this, { hasUnpiped: false });
      }
      return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1) return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1) state.pipes = state.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    if (ev === "data") {
      if (this._readableState.flowing !== false) this.resume();
    } else if (ev === "readable") {
      var state = this._readableState;
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.emittedReadable = false;
        if (!state.reading) {
          pna.nextTick(nReadingNextTick, this);
        } else if (state.length) {
          emitReadable(this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = true;
      resume(this, state);
    }
    return this;
  };
  function resume(stream2, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      pna.nextTick(resume_, stream2, state);
    }
  }
  function resume_(stream2, state) {
    if (!state.reading) {
      debug("resume read 0");
      stream2.read(0);
    }
    state.resumeScheduled = false;
    state.awaitDrain = 0;
    stream2.emit("resume");
    flow(stream2);
    if (state.flowing && !state.reading) stream2.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (false !== this._readableState.flowing) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    return this;
  };
  function flow(stream2) {
    var state = stream2._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream2.read() !== null) {
    }
  }
  Readable.prototype.wrap = function(stream2) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream2.on("end", function() {
      debug("wrapped end");
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) _this.push(chunk);
      }
      _this.push(null);
    });
    stream2.on("data", function(chunk) {
      debug("wrapped data");
      if (state.decoder) chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === void 0)) return;
      else if (!state.objectMode && (!chunk || !chunk.length)) return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream2.pause();
      }
    });
    for (var i in stream2) {
      if (this[i] === void 0 && typeof stream2[i] === "function") {
        this[i] = /* @__PURE__ */ (function(method) {
          return function() {
            return stream2[method].apply(stream2, arguments);
          };
        })(i);
      }
    }
    for (var n = 0; n < kProxyEvents.length; n++) {
      stream2.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream2.resume();
      }
    };
    return this;
  };
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._readableState.highWaterMark;
    }
  });
  Readable._fromList = fromList;
  function fromList(n, state) {
    if (state.length === 0) return null;
    var ret;
    if (state.objectMode) ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder) ret = state.buffer.join("");
      else if (state.buffer.length === 1) ret = state.buffer.head.data;
      else ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = fromListPartial(n, state.buffer, state.decoder);
    }
    return ret;
  }
  function fromListPartial(n, list, hasStrings) {
    var ret;
    if (n < list.head.data.length) {
      ret = list.head.data.slice(0, n);
      list.head.data = list.head.data.slice(n);
    } else if (n === list.head.data.length) {
      ret = list.shift();
    } else {
      ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
    }
    return ret;
  }
  function copyFromBufferString(n, list) {
    var p = list.head;
    var c = 1;
    var ret = p.data;
    n -= ret.length;
    while (p = p.next) {
      var str = p.data;
      var nb = n > str.length ? str.length : n;
      if (nb === str.length) ret += str;
      else ret += str.slice(0, n);
      n -= nb;
      if (n === 0) {
        if (nb === str.length) {
          ++c;
          if (p.next) list.head = p.next;
          else list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = str.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function copyFromBuffer(n, list) {
    var ret = Buffer2.allocUnsafe(n);
    var p = list.head;
    var c = 1;
    p.data.copy(ret);
    n -= p.data.length;
    while (p = p.next) {
      var buf = p.data;
      var nb = n > buf.length ? buf.length : n;
      buf.copy(ret, ret.length - n, 0, nb);
      n -= nb;
      if (n === 0) {
        if (nb === buf.length) {
          ++c;
          if (p.next) list.head = p.next;
          else list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = buf.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function endReadable(stream2) {
    var state = stream2._readableState;
    if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
    if (!state.endEmitted) {
      state.ended = true;
      pna.nextTick(endReadableNT, state, stream2);
    }
  }
  function endReadableNT(state, stream2) {
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream2.readable = false;
      stream2.emit("end");
    }
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
      if (xs[i] === x) return i;
    }
    return -1;
  }
  return _stream_readable;
}
var _stream_transform;
var hasRequired_stream_transform;
function require_stream_transform() {
  if (hasRequired_stream_transform) return _stream_transform;
  hasRequired_stream_transform = 1;
  _stream_transform = Transform;
  var Duplex = require_stream_duplex();
  var util2 = Object.create(requireUtil());
  util2.inherits = requireInherits();
  util2.inherits(Transform, Duplex);
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (!cb) {
      return this.emit("error", new Error("write callback called multiple times"));
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform)) return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function") this._transform = options.transform;
      if (typeof options.flush === "function") this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function") {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    throw new Error("_transform() is not implemented");
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    var _this2 = this;
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
      _this2.emit("close");
    });
  };
  function done(stream2, er, data) {
    if (er) return stream2.emit("error", er);
    if (data != null)
      stream2.push(data);
    if (stream2._writableState.length) throw new Error("Calling transform done when ws.length != 0");
    if (stream2._transformState.transforming) throw new Error("Calling transform done when still transforming");
    return stream2.push(null);
  }
  return _stream_transform;
}
var _stream_passthrough;
var hasRequired_stream_passthrough;
function require_stream_passthrough() {
  if (hasRequired_stream_passthrough) return _stream_passthrough;
  hasRequired_stream_passthrough = 1;
  _stream_passthrough = PassThrough;
  var Transform = require_stream_transform();
  var util2 = Object.create(requireUtil());
  util2.inherits = requireInherits();
  util2.inherits(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough)) return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
  return _stream_passthrough;
}
var hasRequiredReadable;
function requireReadable() {
  if (hasRequiredReadable) return readable.exports;
  hasRequiredReadable = 1;
  (function(module, exports) {
    var Stream = require$$0$2;
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module.exports = Stream;
      exports = module.exports = Stream.Readable;
      exports.Readable = Stream.Readable;
      exports.Writable = Stream.Writable;
      exports.Duplex = Stream.Duplex;
      exports.Transform = Stream.Transform;
      exports.PassThrough = Stream.PassThrough;
      exports.Stream = Stream;
    } else {
      exports = module.exports = require_stream_readable();
      exports.Stream = Stream || exports;
      exports.Readable = exports;
      exports.Writable = require_stream_writable();
      exports.Duplex = require_stream_duplex();
      exports.Transform = require_stream_transform();
      exports.PassThrough = require_stream_passthrough();
    }
  })(readable, readable.exports);
  return readable.exports;
}
var hasRequiredSupport;
function requireSupport() {
  if (hasRequiredSupport) return support;
  hasRequiredSupport = 1;
  support.base64 = true;
  support.array = true;
  support.string = true;
  support.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
  support.nodebuffer = typeof Buffer !== "undefined";
  support.uint8array = typeof Uint8Array !== "undefined";
  if (typeof ArrayBuffer === "undefined") {
    support.blob = false;
  } else {
    var buffer = new ArrayBuffer(0);
    try {
      support.blob = new Blob([buffer], {
        type: "application/zip"
      }).size === 0;
    } catch (e) {
      try {
        var Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
        var builder = new Builder();
        builder.append(buffer);
        support.blob = builder.getBlob("application/zip").size === 0;
      } catch (e2) {
        support.blob = false;
      }
    }
  }
  try {
    support.nodestream = !!requireReadable().Readable;
  } catch (e) {
    support.nodestream = false;
  }
  return support;
}
var base64 = {};
var hasRequiredBase64;
function requireBase64() {
  if (hasRequiredBase64) return base64;
  hasRequiredBase64 = 1;
  var utils2 = requireUtils();
  var support2 = requireSupport();
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  base64.encode = function(input) {
    var output = [];
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0, len = input.length, remainingBytes = len;
    var isArray = utils2.getTypeOf(input) !== "string";
    while (i < input.length) {
      remainingBytes = len - i;
      if (!isArray) {
        chr1 = input.charCodeAt(i++);
        chr2 = i < len ? input.charCodeAt(i++) : 0;
        chr3 = i < len ? input.charCodeAt(i++) : 0;
      } else {
        chr1 = input[i++];
        chr2 = i < len ? input[i++] : 0;
        chr3 = i < len ? input[i++] : 0;
      }
      enc1 = chr1 >> 2;
      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      enc3 = remainingBytes > 1 ? (chr2 & 15) << 2 | chr3 >> 6 : 64;
      enc4 = remainingBytes > 2 ? chr3 & 63 : 64;
      output.push(_keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4));
    }
    return output.join("");
  };
  base64.decode = function(input) {
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0, resultIndex = 0;
    var dataUrlPrefix = "data:";
    if (input.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
      throw new Error("Invalid base64 input, it looks like a data url.");
    }
    input = input.replace(/[^A-Za-z0-9+/=]/g, "");
    var totalLength = input.length * 3 / 4;
    if (input.charAt(input.length - 1) === _keyStr.charAt(64)) {
      totalLength--;
    }
    if (input.charAt(input.length - 2) === _keyStr.charAt(64)) {
      totalLength--;
    }
    if (totalLength % 1 !== 0) {
      throw new Error("Invalid base64 input, bad content length.");
    }
    var output;
    if (support2.uint8array) {
      output = new Uint8Array(totalLength | 0);
    } else {
      output = new Array(totalLength | 0);
    }
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = enc1 << 2 | enc2 >> 4;
      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      chr3 = (enc3 & 3) << 6 | enc4;
      output[resultIndex++] = chr1;
      if (enc3 !== 64) {
        output[resultIndex++] = chr2;
      }
      if (enc4 !== 64) {
        output[resultIndex++] = chr3;
      }
    }
    return output;
  };
  return base64;
}
var nodejsUtils;
var hasRequiredNodejsUtils;
function requireNodejsUtils() {
  if (hasRequiredNodejsUtils) return nodejsUtils;
  hasRequiredNodejsUtils = 1;
  nodejsUtils = {
    /**
     * True if this is running in Nodejs, will be undefined in a browser.
     * In a browser, browserify won't include this file and the whole module
     * will be resolved an empty object.
     */
    isNode: typeof Buffer !== "undefined",
    /**
     * Create a new nodejs Buffer from an existing content.
     * @param {Object} data the data to pass to the constructor.
     * @param {String} encoding the encoding to use.
     * @return {Buffer} a new Buffer.
     */
    newBufferFrom: function(data, encoding) {
      if (Buffer.from && Buffer.from !== Uint8Array.from) {
        return Buffer.from(data, encoding);
      } else {
        if (typeof data === "number") {
          throw new Error('The "data" argument must not be a number');
        }
        return new Buffer(data, encoding);
      }
    },
    /**
     * Create a new nodejs Buffer with the specified size.
     * @param {Integer} size the size of the buffer.
     * @return {Buffer} a new Buffer.
     */
    allocBuffer: function(size) {
      if (Buffer.alloc) {
        return Buffer.alloc(size);
      } else {
        var buf = new Buffer(size);
        buf.fill(0);
        return buf;
      }
    },
    /**
     * Find out if an object is a Buffer.
     * @param {Object} b the object to test.
     * @return {Boolean} true if the object is a Buffer, false otherwise.
     */
    isBuffer: function(b) {
      return Buffer.isBuffer(b);
    },
    isStream: function(obj) {
      return obj && typeof obj.on === "function" && typeof obj.pause === "function" && typeof obj.resume === "function";
    }
  };
  return nodejsUtils;
}
var lib$2;
var hasRequiredLib$2;
function requireLib$2() {
  if (hasRequiredLib$2) return lib$2;
  hasRequiredLib$2 = 1;
  var Mutation = commonjsGlobal.MutationObserver || commonjsGlobal.WebKitMutationObserver;
  var scheduleDrain;
  if (process.browser) {
    if (Mutation) {
      var called = 0;
      var observer = new Mutation(nextTick);
      var element = commonjsGlobal.document.createTextNode("");
      observer.observe(element, {
        characterData: true
      });
      scheduleDrain = function() {
        element.data = called = ++called % 2;
      };
    } else if (!commonjsGlobal.setImmediate && typeof commonjsGlobal.MessageChannel !== "undefined") {
      var channel = new commonjsGlobal.MessageChannel();
      channel.port1.onmessage = nextTick;
      scheduleDrain = function() {
        channel.port2.postMessage(0);
      };
    } else if ("document" in commonjsGlobal && "onreadystatechange" in commonjsGlobal.document.createElement("script")) {
      scheduleDrain = function() {
        var scriptEl = commonjsGlobal.document.createElement("script");
        scriptEl.onreadystatechange = function() {
          nextTick();
          scriptEl.onreadystatechange = null;
          scriptEl.parentNode.removeChild(scriptEl);
          scriptEl = null;
        };
        commonjsGlobal.document.documentElement.appendChild(scriptEl);
      };
    } else {
      scheduleDrain = function() {
        setTimeout(nextTick, 0);
      };
    }
  } else {
    scheduleDrain = function() {
      process.nextTick(nextTick);
    };
  }
  var draining;
  var queue = [];
  function nextTick() {
    draining = true;
    var i, oldQueue;
    var len = queue.length;
    while (len) {
      oldQueue = queue;
      queue = [];
      i = -1;
      while (++i < len) {
        oldQueue[i]();
      }
      len = queue.length;
    }
    draining = false;
  }
  lib$2 = immediate;
  function immediate(task) {
    if (queue.push(task) === 1 && !draining) {
      scheduleDrain();
    }
  }
  return lib$2;
}
var lib$1;
var hasRequiredLib$1;
function requireLib$1() {
  if (hasRequiredLib$1) return lib$1;
  hasRequiredLib$1 = 1;
  var immediate = requireLib$2();
  function INTERNAL() {
  }
  var handlers = {};
  var REJECTED = ["REJECTED"];
  var FULFILLED = ["FULFILLED"];
  var PENDING = ["PENDING"];
  if (!process.browser) {
    var UNHANDLED = ["UNHANDLED"];
  }
  lib$1 = Promise2;
  function Promise2(resolver) {
    if (typeof resolver !== "function") {
      throw new TypeError("resolver must be a function");
    }
    this.state = PENDING;
    this.queue = [];
    this.outcome = void 0;
    if (!process.browser) {
      this.handled = UNHANDLED;
    }
    if (resolver !== INTERNAL) {
      safelyResolveThenable(this, resolver);
    }
  }
  Promise2.prototype.finally = function(callback) {
    if (typeof callback !== "function") {
      return this;
    }
    var p = this.constructor;
    return this.then(resolve2, reject2);
    function resolve2(value) {
      function yes() {
        return value;
      }
      return p.resolve(callback()).then(yes);
    }
    function reject2(reason) {
      function no() {
        throw reason;
      }
      return p.resolve(callback()).then(no);
    }
  };
  Promise2.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
  };
  Promise2.prototype.then = function(onFulfilled, onRejected) {
    if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
      return this;
    }
    var promise = new this.constructor(INTERNAL);
    if (!process.browser) {
      if (this.handled === UNHANDLED) {
        this.handled = null;
      }
    }
    if (this.state !== PENDING) {
      var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
      unwrap(promise, resolver, this.outcome);
    } else {
      this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
    }
    return promise;
  };
  function QueueItem(promise, onFulfilled, onRejected) {
    this.promise = promise;
    if (typeof onFulfilled === "function") {
      this.onFulfilled = onFulfilled;
      this.callFulfilled = this.otherCallFulfilled;
    }
    if (typeof onRejected === "function") {
      this.onRejected = onRejected;
      this.callRejected = this.otherCallRejected;
    }
  }
  QueueItem.prototype.callFulfilled = function(value) {
    handlers.resolve(this.promise, value);
  };
  QueueItem.prototype.otherCallFulfilled = function(value) {
    unwrap(this.promise, this.onFulfilled, value);
  };
  QueueItem.prototype.callRejected = function(value) {
    handlers.reject(this.promise, value);
  };
  QueueItem.prototype.otherCallRejected = function(value) {
    unwrap(this.promise, this.onRejected, value);
  };
  function unwrap(promise, func, value) {
    immediate(function() {
      var returnValue;
      try {
        returnValue = func(value);
      } catch (e) {
        return handlers.reject(promise, e);
      }
      if (returnValue === promise) {
        handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
      } else {
        handlers.resolve(promise, returnValue);
      }
    });
  }
  handlers.resolve = function(self2, value) {
    var result = tryCatch(getThen, value);
    if (result.status === "error") {
      return handlers.reject(self2, result.value);
    }
    var thenable = result.value;
    if (thenable) {
      safelyResolveThenable(self2, thenable);
    } else {
      self2.state = FULFILLED;
      self2.outcome = value;
      var i = -1;
      var len = self2.queue.length;
      while (++i < len) {
        self2.queue[i].callFulfilled(value);
      }
    }
    return self2;
  };
  handlers.reject = function(self2, error) {
    self2.state = REJECTED;
    self2.outcome = error;
    if (!process.browser) {
      if (self2.handled === UNHANDLED) {
        immediate(function() {
          if (self2.handled === UNHANDLED) {
            process.emit("unhandledRejection", error, self2);
          }
        });
      }
    }
    var i = -1;
    var len = self2.queue.length;
    while (++i < len) {
      self2.queue[i].callRejected(error);
    }
    return self2;
  };
  function getThen(obj) {
    var then = obj && obj.then;
    if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
      return function appyThen() {
        then.apply(obj, arguments);
      };
    }
  }
  function safelyResolveThenable(self2, thenable) {
    var called = false;
    function onError(value) {
      if (called) {
        return;
      }
      called = true;
      handlers.reject(self2, value);
    }
    function onSuccess(value) {
      if (called) {
        return;
      }
      called = true;
      handlers.resolve(self2, value);
    }
    function tryToUnwrap() {
      thenable(onSuccess, onError);
    }
    var result = tryCatch(tryToUnwrap);
    if (result.status === "error") {
      onError(result.value);
    }
  }
  function tryCatch(func, value) {
    var out = {};
    try {
      out.value = func(value);
      out.status = "success";
    } catch (e) {
      out.status = "error";
      out.value = e;
    }
    return out;
  }
  Promise2.resolve = resolve;
  function resolve(value) {
    if (value instanceof this) {
      return value;
    }
    return handlers.resolve(new this(INTERNAL), value);
  }
  Promise2.reject = reject;
  function reject(reason) {
    var promise = new this(INTERNAL);
    return handlers.reject(promise, reason);
  }
  Promise2.all = all;
  function all(iterable) {
    var self2 = this;
    if (Object.prototype.toString.call(iterable) !== "[object Array]") {
      return this.reject(new TypeError("must be an array"));
    }
    var len = iterable.length;
    var called = false;
    if (!len) {
      return this.resolve([]);
    }
    var values = new Array(len);
    var resolved = 0;
    var i = -1;
    var promise = new this(INTERNAL);
    while (++i < len) {
      allResolver(iterable[i], i);
    }
    return promise;
    function allResolver(value, i2) {
      self2.resolve(value).then(resolveFromAll, function(error) {
        if (!called) {
          called = true;
          handlers.reject(promise, error);
        }
      });
      function resolveFromAll(outValue) {
        values[i2] = outValue;
        if (++resolved === len && !called) {
          called = true;
          handlers.resolve(promise, values);
        }
      }
    }
  }
  Promise2.race = race;
  function race(iterable) {
    var self2 = this;
    if (Object.prototype.toString.call(iterable) !== "[object Array]") {
      return this.reject(new TypeError("must be an array"));
    }
    var len = iterable.length;
    var called = false;
    if (!len) {
      return this.resolve([]);
    }
    var i = -1;
    var promise = new this(INTERNAL);
    while (++i < len) {
      resolver(iterable[i]);
    }
    return promise;
    function resolver(value) {
      self2.resolve(value).then(function(response) {
        if (!called) {
          called = true;
          handlers.resolve(promise, response);
        }
      }, function(error) {
        if (!called) {
          called = true;
          handlers.reject(promise, error);
        }
      });
    }
  }
  return lib$1;
}
var external;
var hasRequiredExternal;
function requireExternal() {
  if (hasRequiredExternal) return external;
  hasRequiredExternal = 1;
  var ES6Promise = null;
  if (typeof Promise !== "undefined") {
    ES6Promise = Promise;
  } else {
    ES6Promise = requireLib$1();
  }
  external = {
    Promise: ES6Promise
  };
  return external;
}
var setImmediate$1 = {};
var hasRequiredSetImmediate;
function requireSetImmediate() {
  if (hasRequiredSetImmediate) return setImmediate$1;
  hasRequiredSetImmediate = 1;
  (function(global2, undefined$1) {
    if (global2.setImmediate) {
      return;
    }
    var nextHandle = 1;
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global2.document;
    var registerImmediate;
    function setImmediate2(callback) {
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i + 1];
      }
      var task = { callback, args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }
    function clearImmediate(handle) {
      delete tasksByHandle[handle];
    }
    function run(task) {
      var callback = task.callback;
      var args = task.args;
      switch (args.length) {
        case 0:
          callback();
          break;
        case 1:
          callback(args[0]);
          break;
        case 2:
          callback(args[0], args[1]);
          break;
        case 3:
          callback(args[0], args[1], args[2]);
          break;
        default:
          callback.apply(undefined$1, args);
          break;
      }
    }
    function runIfPresent(handle) {
      if (currentlyRunningATask) {
        setTimeout(runIfPresent, 0, handle);
      } else {
        var task = tasksByHandle[handle];
        if (task) {
          currentlyRunningATask = true;
          try {
            run(task);
          } finally {
            clearImmediate(handle);
            currentlyRunningATask = false;
          }
        }
      }
    }
    function installNextTickImplementation() {
      registerImmediate = function(handle) {
        process.nextTick(function() {
          runIfPresent(handle);
        });
      };
    }
    function canUsePostMessage() {
      if (global2.postMessage && !global2.importScripts) {
        var postMessageIsAsynchronous = true;
        var oldOnMessage = global2.onmessage;
        global2.onmessage = function() {
          postMessageIsAsynchronous = false;
        };
        global2.postMessage("", "*");
        global2.onmessage = oldOnMessage;
        return postMessageIsAsynchronous;
      }
    }
    function installPostMessageImplementation() {
      var messagePrefix = "setImmediate$" + Math.random() + "$";
      var onGlobalMessage = function(event) {
        if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
          runIfPresent(+event.data.slice(messagePrefix.length));
        }
      };
      if (global2.addEventListener) {
        global2.addEventListener("message", onGlobalMessage, false);
      } else {
        global2.attachEvent("onmessage", onGlobalMessage);
      }
      registerImmediate = function(handle) {
        global2.postMessage(messagePrefix + handle, "*");
      };
    }
    function installMessageChannelImplementation() {
      var channel = new MessageChannel();
      channel.port1.onmessage = function(event) {
        var handle = event.data;
        runIfPresent(handle);
      };
      registerImmediate = function(handle) {
        channel.port2.postMessage(handle);
      };
    }
    function installReadyStateChangeImplementation() {
      var html = doc.documentElement;
      registerImmediate = function(handle) {
        var script = doc.createElement("script");
        script.onreadystatechange = function() {
          runIfPresent(handle);
          script.onreadystatechange = null;
          html.removeChild(script);
          script = null;
        };
        html.appendChild(script);
      };
    }
    function installSetTimeoutImplementation() {
      registerImmediate = function(handle) {
        setTimeout(runIfPresent, 0, handle);
      };
    }
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
    if ({}.toString.call(global2.process) === "[object process]") {
      installNextTickImplementation();
    } else if (canUsePostMessage()) {
      installPostMessageImplementation();
    } else if (global2.MessageChannel) {
      installMessageChannelImplementation();
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
      installReadyStateChangeImplementation();
    } else {
      installSetTimeoutImplementation();
    }
    attachTo.setImmediate = setImmediate2;
    attachTo.clearImmediate = clearImmediate;
  })(typeof self === "undefined" ? typeof commonjsGlobal === "undefined" ? setImmediate$1 : commonjsGlobal : self);
  return setImmediate$1;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports) {
    var support2 = requireSupport();
    var base642 = requireBase64();
    var nodejsUtils2 = requireNodejsUtils();
    var external2 = requireExternal();
    requireSetImmediate();
    function string2binary(str) {
      var result = null;
      if (support2.uint8array) {
        result = new Uint8Array(str.length);
      } else {
        result = new Array(str.length);
      }
      return stringToArrayLike(str, result);
    }
    exports.newBlob = function(part, type) {
      exports.checkSupport("blob");
      try {
        return new Blob([part], {
          type
        });
      } catch (e) {
        try {
          var Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
          var builder = new Builder();
          builder.append(part);
          return builder.getBlob(type);
        } catch (e2) {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    function identity(input) {
      return input;
    }
    function stringToArrayLike(str, array) {
      for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 255;
      }
      return array;
    }
    var arrayToStringHelper = {
      /**
       * Transform an array of int into a string, chunk by chunk.
       * See the performances notes on arrayLikeToString.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @param {String} type the type of the array.
       * @param {Integer} chunk the chunk size.
       * @return {String} the resulting string.
       * @throws Error if the chunk is too big for the stack.
       */
      stringifyByChunk: function(array, type, chunk) {
        var result = [], k = 0, len = array.length;
        if (len <= chunk) {
          return String.fromCharCode.apply(null, array);
        }
        while (k < len) {
          if (type === "array" || type === "nodebuffer") {
            result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
          } else {
            result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
          }
          k += chunk;
        }
        return result.join("");
      },
      /**
       * Call String.fromCharCode on every item in the array.
       * This is the naive implementation, which generate A LOT of intermediate string.
       * This should be used when everything else fail.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @return {String} the result.
       */
      stringifyByChar: function(array) {
        var resultStr = "";
        for (var i = 0; i < array.length; i++) {
          resultStr += String.fromCharCode(array[i]);
        }
        return resultStr;
      },
      applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: (function() {
          try {
            return support2.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch (e) {
            return false;
          }
        })(),
        /**
         * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
         */
        nodebuffer: (function() {
          try {
            return support2.nodebuffer && String.fromCharCode.apply(null, nodejsUtils2.allocBuffer(1)).length === 1;
          } catch (e) {
            return false;
          }
        })()
      }
    };
    function arrayLikeToString(array) {
      var chunk = 65536, type = exports.getTypeOf(array), canUseApply = true;
      if (type === "uint8array") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
      } else if (type === "nodebuffer") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.nodebuffer;
      }
      if (canUseApply) {
        while (chunk > 1) {
          try {
            return arrayToStringHelper.stringifyByChunk(array, type, chunk);
          } catch (e) {
            chunk = Math.floor(chunk / 2);
          }
        }
      }
      return arrayToStringHelper.stringifyByChar(array);
    }
    exports.applyFromCharCode = arrayLikeToString;
    function arrayLikeToArrayLike(arrayFrom, arrayTo) {
      for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
      }
      return arrayTo;
    }
    var transform = {};
    transform["string"] = {
      "string": identity,
      "array": function(input) {
        return stringToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["string"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": function(input) {
        return stringToArrayLike(input, nodejsUtils2.allocBuffer(input.length));
      }
    };
    transform["array"] = {
      "string": arrayLikeToString,
      "array": identity,
      "arraybuffer": function(input) {
        return new Uint8Array(input).buffer;
      },
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils2.newBufferFrom(input);
      }
    };
    transform["arraybuffer"] = {
      "string": function(input) {
        return arrayLikeToString(new Uint8Array(input));
      },
      "array": function(input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
      },
      "arraybuffer": identity,
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils2.newBufferFrom(new Uint8Array(input));
      }
    };
    transform["uint8array"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return input.buffer;
      },
      "uint8array": identity,
      "nodebuffer": function(input) {
        return nodejsUtils2.newBufferFrom(input);
      }
    };
    transform["nodebuffer"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["nodebuffer"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return arrayLikeToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": identity
    };
    exports.transformTo = function(outputType, input) {
      if (!input) {
        input = "";
      }
      if (!outputType) {
        return input;
      }
      exports.checkSupport(outputType);
      var inputType = exports.getTypeOf(input);
      var result = transform[inputType][outputType](input);
      return result;
    };
    exports.resolve = function(path) {
      var parts = path.split("/");
      var result = [];
      for (var index = 0; index < parts.length; index++) {
        var part = parts[index];
        if (part === "." || part === "" && index !== 0 && index !== parts.length - 1) {
          continue;
        } else if (part === "..") {
          result.pop();
        } else {
          result.push(part);
        }
      }
      return result.join("/");
    };
    exports.getTypeOf = function(input) {
      if (typeof input === "string") {
        return "string";
      }
      if (Object.prototype.toString.call(input) === "[object Array]") {
        return "array";
      }
      if (support2.nodebuffer && nodejsUtils2.isBuffer(input)) {
        return "nodebuffer";
      }
      if (support2.uint8array && input instanceof Uint8Array) {
        return "uint8array";
      }
      if (support2.arraybuffer && input instanceof ArrayBuffer) {
        return "arraybuffer";
      }
    };
    exports.checkSupport = function(type) {
      var supported = support2[type.toLowerCase()];
      if (!supported) {
        throw new Error(type + " is not supported by this platform");
      }
    };
    exports.MAX_VALUE_16BITS = 65535;
    exports.MAX_VALUE_32BITS = -1;
    exports.pretty = function(str) {
      var res = "", code, i;
      for (i = 0; i < (str || "").length; i++) {
        code = str.charCodeAt(i);
        res += "\\x" + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
      }
      return res;
    };
    exports.delay = function(callback, args, self2) {
      setImmediate(function() {
        callback.apply(self2 || null, args || []);
      });
    };
    exports.inherits = function(ctor, superCtor) {
      var Obj = function() {
      };
      Obj.prototype = superCtor.prototype;
      ctor.prototype = new Obj();
    };
    exports.extend = function() {
      var result = {}, i, attr;
      for (i = 0; i < arguments.length; i++) {
        for (attr in arguments[i]) {
          if (Object.prototype.hasOwnProperty.call(arguments[i], attr) && typeof result[attr] === "undefined") {
            result[attr] = arguments[i][attr];
          }
        }
      }
      return result;
    };
    exports.prepareContent = function(name, inputData, isBinary, isOptimizedBinaryString, isBase64) {
      var promise = external2.Promise.resolve(inputData).then(function(data) {
        var isBlob = support2.blob && (data instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(data)) !== -1);
        if (isBlob && typeof FileReader !== "undefined") {
          return new external2.Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
              resolve(e.target.result);
            };
            reader.onerror = function(e) {
              reject(e.target.error);
            };
            reader.readAsArrayBuffer(data);
          });
        } else {
          return data;
        }
      });
      return promise.then(function(data) {
        var dataType = exports.getTypeOf(data);
        if (!dataType) {
          return external2.Promise.reject(
            new Error("Can't read the data of '" + name + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")
          );
        }
        if (dataType === "arraybuffer") {
          data = exports.transformTo("uint8array", data);
        } else if (dataType === "string") {
          if (isBase64) {
            data = base642.decode(data);
          } else if (isBinary) {
            if (isOptimizedBinaryString !== true) {
              data = string2binary(data);
            }
          }
        }
        return data;
      });
    };
  })(utils);
  return utils;
}
var GenericWorker_1;
var hasRequiredGenericWorker;
function requireGenericWorker() {
  if (hasRequiredGenericWorker) return GenericWorker_1;
  hasRequiredGenericWorker = 1;
  function GenericWorker(name) {
    this.name = name || "default";
    this.streamInfo = {};
    this.generatedError = null;
    this.extraStreamInfo = {};
    this.isPaused = true;
    this.isFinished = false;
    this.isLocked = false;
    this._listeners = {
      "data": [],
      "end": [],
      "error": []
    };
    this.previous = null;
  }
  GenericWorker.prototype = {
    /**
     * Push a chunk to the next workers.
     * @param {Object} chunk the chunk to push
     */
    push: function(chunk) {
      this.emit("data", chunk);
    },
    /**
     * End the stream.
     * @return {Boolean} true if this call ended the worker, false otherwise.
     */
    end: function() {
      if (this.isFinished) {
        return false;
      }
      this.flush();
      try {
        this.emit("end");
        this.cleanUp();
        this.isFinished = true;
      } catch (e) {
        this.emit("error", e);
      }
      return true;
    },
    /**
     * End the stream with an error.
     * @param {Error} e the error which caused the premature end.
     * @return {Boolean} true if this call ended the worker with an error, false otherwise.
     */
    error: function(e) {
      if (this.isFinished) {
        return false;
      }
      if (this.isPaused) {
        this.generatedError = e;
      } else {
        this.isFinished = true;
        this.emit("error", e);
        if (this.previous) {
          this.previous.error(e);
        }
        this.cleanUp();
      }
      return true;
    },
    /**
     * Add a callback on an event.
     * @param {String} name the name of the event (data, end, error)
     * @param {Function} listener the function to call when the event is triggered
     * @return {GenericWorker} the current object for chainability
     */
    on: function(name, listener) {
      this._listeners[name].push(listener);
      return this;
    },
    /**
     * Clean any references when a worker is ending.
     */
    cleanUp: function() {
      this.streamInfo = this.generatedError = this.extraStreamInfo = null;
      this._listeners = [];
    },
    /**
     * Trigger an event. This will call registered callback with the provided arg.
     * @param {String} name the name of the event (data, end, error)
     * @param {Object} arg the argument to call the callback with.
     */
    emit: function(name, arg) {
      if (this._listeners[name]) {
        for (var i = 0; i < this._listeners[name].length; i++) {
          this._listeners[name][i].call(this, arg);
        }
      }
    },
    /**
     * Chain a worker with an other.
     * @param {Worker} next the worker receiving events from the current one.
     * @return {worker} the next worker for chainability
     */
    pipe: function(next) {
      return next.registerPrevious(this);
    },
    /**
     * Same as `pipe` in the other direction.
     * Using an API with `pipe(next)` is very easy.
     * Implementing the API with the point of view of the next one registering
     * a source is easier, see the ZipFileWorker.
     * @param {Worker} previous the previous worker, sending events to this one
     * @return {Worker} the current worker for chainability
     */
    registerPrevious: function(previous) {
      if (this.isLocked) {
        throw new Error("The stream '" + this + "' has already been used.");
      }
      this.streamInfo = previous.streamInfo;
      this.mergeStreamInfo();
      this.previous = previous;
      var self2 = this;
      previous.on("data", function(chunk) {
        self2.processChunk(chunk);
      });
      previous.on("end", function() {
        self2.end();
      });
      previous.on("error", function(e) {
        self2.error(e);
      });
      return this;
    },
    /**
     * Pause the stream so it doesn't send events anymore.
     * @return {Boolean} true if this call paused the worker, false otherwise.
     */
    pause: function() {
      if (this.isPaused || this.isFinished) {
        return false;
      }
      this.isPaused = true;
      if (this.previous) {
        this.previous.pause();
      }
      return true;
    },
    /**
     * Resume a paused stream.
     * @return {Boolean} true if this call resumed the worker, false otherwise.
     */
    resume: function() {
      if (!this.isPaused || this.isFinished) {
        return false;
      }
      this.isPaused = false;
      var withError = false;
      if (this.generatedError) {
        this.error(this.generatedError);
        withError = true;
      }
      if (this.previous) {
        this.previous.resume();
      }
      return !withError;
    },
    /**
     * Flush any remaining bytes as the stream is ending.
     */
    flush: function() {
    },
    /**
     * Process a chunk. This is usually the method overridden.
     * @param {Object} chunk the chunk to process.
     */
    processChunk: function(chunk) {
      this.push(chunk);
    },
    /**
     * Add a key/value to be added in the workers chain streamInfo once activated.
     * @param {String} key the key to use
     * @param {Object} value the associated value
     * @return {Worker} the current worker for chainability
     */
    withStreamInfo: function(key, value) {
      this.extraStreamInfo[key] = value;
      this.mergeStreamInfo();
      return this;
    },
    /**
     * Merge this worker's streamInfo into the chain's streamInfo.
     */
    mergeStreamInfo: function() {
      for (var key in this.extraStreamInfo) {
        if (!Object.prototype.hasOwnProperty.call(this.extraStreamInfo, key)) {
          continue;
        }
        this.streamInfo[key] = this.extraStreamInfo[key];
      }
    },
    /**
     * Lock the stream to prevent further updates on the workers chain.
     * After calling this method, all calls to pipe will fail.
     */
    lock: function() {
      if (this.isLocked) {
        throw new Error("The stream '" + this + "' has already been used.");
      }
      this.isLocked = true;
      if (this.previous) {
        this.previous.lock();
      }
    },
    /**
     *
     * Pretty print the workers chain.
     */
    toString: function() {
      var me = "Worker " + this.name;
      if (this.previous) {
        return this.previous + " -> " + me;
      } else {
        return me;
      }
    }
  };
  GenericWorker_1 = GenericWorker;
  return GenericWorker_1;
}
var hasRequiredUtf8;
function requireUtf8() {
  if (hasRequiredUtf8) return utf8;
  hasRequiredUtf8 = 1;
  (function(exports) {
    var utils2 = requireUtils();
    var support2 = requireSupport();
    var nodejsUtils2 = requireNodejsUtils();
    var GenericWorker = requireGenericWorker();
    var _utf8len = new Array(256);
    for (var i = 0; i < 256; i++) {
      _utf8len[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;
    }
    _utf8len[254] = _utf8len[254] = 1;
    var string2buf = function(str) {
      var buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      if (support2.uint8array) {
        buf = new Uint8Array(buf_len);
      } else {
        buf = new Array(buf_len);
      }
      for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i2++] = c;
        } else if (c < 2048) {
          buf[i2++] = 192 | c >>> 6;
          buf[i2++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i2++] = 224 | c >>> 12;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        } else {
          buf[i2++] = 240 | c >>> 18;
          buf[i2++] = 128 | c >>> 12 & 63;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        }
      }
      return buf;
    };
    var utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
    var buf2string = function(buf) {
      var i2, out, c, c_len;
      var len = buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i2 = 0; i2 < len; ) {
        c = buf[i2++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i2 += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i2 < len) {
          c = c << 6 | buf[i2++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      if (utf16buf.length !== out) {
        if (utf16buf.subarray) {
          utf16buf = utf16buf.subarray(0, out);
        } else {
          utf16buf.length = out;
        }
      }
      return utils2.applyFromCharCode(utf16buf);
    };
    exports.utf8encode = function utf8encode(str) {
      if (support2.nodebuffer) {
        return nodejsUtils2.newBufferFrom(str, "utf-8");
      }
      return string2buf(str);
    };
    exports.utf8decode = function utf8decode(buf) {
      if (support2.nodebuffer) {
        return utils2.transformTo("nodebuffer", buf).toString("utf-8");
      }
      buf = utils2.transformTo(support2.uint8array ? "uint8array" : "array", buf);
      return buf2string(buf);
    };
    function Utf8DecodeWorker() {
      GenericWorker.call(this, "utf-8 decode");
      this.leftOver = null;
    }
    utils2.inherits(Utf8DecodeWorker, GenericWorker);
    Utf8DecodeWorker.prototype.processChunk = function(chunk) {
      var data = utils2.transformTo(support2.uint8array ? "uint8array" : "array", chunk.data);
      if (this.leftOver && this.leftOver.length) {
        if (support2.uint8array) {
          var previousData = data;
          data = new Uint8Array(previousData.length + this.leftOver.length);
          data.set(this.leftOver, 0);
          data.set(previousData, this.leftOver.length);
        } else {
          data = this.leftOver.concat(data);
        }
        this.leftOver = null;
      }
      var nextBoundary = utf8border(data);
      var usableData = data;
      if (nextBoundary !== data.length) {
        if (support2.uint8array) {
          usableData = data.subarray(0, nextBoundary);
          this.leftOver = data.subarray(nextBoundary, data.length);
        } else {
          usableData = data.slice(0, nextBoundary);
          this.leftOver = data.slice(nextBoundary, data.length);
        }
      }
      this.push({
        data: exports.utf8decode(usableData),
        meta: chunk.meta
      });
    };
    Utf8DecodeWorker.prototype.flush = function() {
      if (this.leftOver && this.leftOver.length) {
        this.push({
          data: exports.utf8decode(this.leftOver),
          meta: {}
        });
        this.leftOver = null;
      }
    };
    exports.Utf8DecodeWorker = Utf8DecodeWorker;
    function Utf8EncodeWorker() {
      GenericWorker.call(this, "utf-8 encode");
    }
    utils2.inherits(Utf8EncodeWorker, GenericWorker);
    Utf8EncodeWorker.prototype.processChunk = function(chunk) {
      this.push({
        data: exports.utf8encode(chunk.data),
        meta: chunk.meta
      });
    };
    exports.Utf8EncodeWorker = Utf8EncodeWorker;
  })(utf8);
  return utf8;
}
var ConvertWorker_1;
var hasRequiredConvertWorker;
function requireConvertWorker() {
  if (hasRequiredConvertWorker) return ConvertWorker_1;
  hasRequiredConvertWorker = 1;
  var GenericWorker = requireGenericWorker();
  var utils2 = requireUtils();
  function ConvertWorker(destType) {
    GenericWorker.call(this, "ConvertWorker to " + destType);
    this.destType = destType;
  }
  utils2.inherits(ConvertWorker, GenericWorker);
  ConvertWorker.prototype.processChunk = function(chunk) {
    this.push({
      data: utils2.transformTo(this.destType, chunk.data),
      meta: chunk.meta
    });
  };
  ConvertWorker_1 = ConvertWorker;
  return ConvertWorker_1;
}
var NodejsStreamOutputAdapter_1;
var hasRequiredNodejsStreamOutputAdapter;
function requireNodejsStreamOutputAdapter() {
  if (hasRequiredNodejsStreamOutputAdapter) return NodejsStreamOutputAdapter_1;
  hasRequiredNodejsStreamOutputAdapter = 1;
  var Readable = requireReadable().Readable;
  var utils2 = requireUtils();
  utils2.inherits(NodejsStreamOutputAdapter, Readable);
  function NodejsStreamOutputAdapter(helper, options, updateCb) {
    Readable.call(this, options);
    this._helper = helper;
    var self2 = this;
    helper.on("data", function(data, meta) {
      if (!self2.push(data)) {
        self2._helper.pause();
      }
      if (updateCb) {
        updateCb(meta);
      }
    }).on("error", function(e) {
      self2.emit("error", e);
    }).on("end", function() {
      self2.push(null);
    });
  }
  NodejsStreamOutputAdapter.prototype._read = function() {
    this._helper.resume();
  };
  NodejsStreamOutputAdapter_1 = NodejsStreamOutputAdapter;
  return NodejsStreamOutputAdapter_1;
}
var StreamHelper_1;
var hasRequiredStreamHelper;
function requireStreamHelper() {
  if (hasRequiredStreamHelper) return StreamHelper_1;
  hasRequiredStreamHelper = 1;
  var utils2 = requireUtils();
  var ConvertWorker = requireConvertWorker();
  var GenericWorker = requireGenericWorker();
  var base642 = requireBase64();
  var support2 = requireSupport();
  var external2 = requireExternal();
  var NodejsStreamOutputAdapter = null;
  if (support2.nodestream) {
    try {
      NodejsStreamOutputAdapter = requireNodejsStreamOutputAdapter();
    } catch (e) {
    }
  }
  function transformZipOutput(type, content, mimeType) {
    switch (type) {
      case "blob":
        return utils2.newBlob(utils2.transformTo("arraybuffer", content), mimeType);
      case "base64":
        return base642.encode(content);
      default:
        return utils2.transformTo(type, content);
    }
  }
  function concat(type, dataArray) {
    var i, index = 0, res = null, totalLength = 0;
    for (i = 0; i < dataArray.length; i++) {
      totalLength += dataArray[i].length;
    }
    switch (type) {
      case "string":
        return dataArray.join("");
      case "array":
        return Array.prototype.concat.apply([], dataArray);
      case "uint8array":
        res = new Uint8Array(totalLength);
        for (i = 0; i < dataArray.length; i++) {
          res.set(dataArray[i], index);
          index += dataArray[i].length;
        }
        return res;
      case "nodebuffer":
        return Buffer.concat(dataArray);
      default:
        throw new Error("concat : unsupported type '" + type + "'");
    }
  }
  function accumulate(helper, updateCallback) {
    return new external2.Promise(function(resolve, reject) {
      var dataArray = [];
      var chunkType = helper._internalType, resultType = helper._outputType, mimeType = helper._mimeType;
      helper.on("data", function(data, meta) {
        dataArray.push(data);
        if (updateCallback) {
          updateCallback(meta);
        }
      }).on("error", function(err) {
        dataArray = [];
        reject(err);
      }).on("end", function() {
        try {
          var result = transformZipOutput(resultType, concat(chunkType, dataArray), mimeType);
          resolve(result);
        } catch (e) {
          reject(e);
        }
        dataArray = [];
      }).resume();
    });
  }
  function StreamHelper(worker, outputType, mimeType) {
    var internalType = outputType;
    switch (outputType) {
      case "blob":
      case "arraybuffer":
        internalType = "uint8array";
        break;
      case "base64":
        internalType = "string";
        break;
    }
    try {
      this._internalType = internalType;
      this._outputType = outputType;
      this._mimeType = mimeType;
      utils2.checkSupport(internalType);
      this._worker = worker.pipe(new ConvertWorker(internalType));
      worker.lock();
    } catch (e) {
      this._worker = new GenericWorker("error");
      this._worker.error(e);
    }
  }
  StreamHelper.prototype = {
    /**
     * Listen a StreamHelper, accumulate its content and concatenate it into a
     * complete block.
     * @param {Function} updateCb the update callback.
     * @return Promise the promise for the accumulation.
     */
    accumulate: function(updateCb) {
      return accumulate(this, updateCb);
    },
    /**
     * Add a listener on an event triggered on a stream.
     * @param {String} evt the name of the event
     * @param {Function} fn the listener
     * @return {StreamHelper} the current helper.
     */
    on: function(evt, fn) {
      var self2 = this;
      if (evt === "data") {
        this._worker.on(evt, function(chunk) {
          fn.call(self2, chunk.data, chunk.meta);
        });
      } else {
        this._worker.on(evt, function() {
          utils2.delay(fn, arguments, self2);
        });
      }
      return this;
    },
    /**
     * Resume the flow of chunks.
     * @return {StreamHelper} the current helper.
     */
    resume: function() {
      utils2.delay(this._worker.resume, [], this._worker);
      return this;
    },
    /**
     * Pause the flow of chunks.
     * @return {StreamHelper} the current helper.
     */
    pause: function() {
      this._worker.pause();
      return this;
    },
    /**
     * Return a nodejs stream for this helper.
     * @param {Function} updateCb the update callback.
     * @return {NodejsStreamOutputAdapter} the nodejs stream.
     */
    toNodejsStream: function(updateCb) {
      utils2.checkSupport("nodestream");
      if (this._outputType !== "nodebuffer") {
        throw new Error(this._outputType + " is not supported by this method");
      }
      return new NodejsStreamOutputAdapter(this, {
        objectMode: this._outputType !== "nodebuffer"
      }, updateCb);
    }
  };
  StreamHelper_1 = StreamHelper;
  return StreamHelper_1;
}
var defaults = {};
var hasRequiredDefaults;
function requireDefaults() {
  if (hasRequiredDefaults) return defaults;
  hasRequiredDefaults = 1;
  defaults.base64 = false;
  defaults.binary = false;
  defaults.dir = false;
  defaults.createFolders = true;
  defaults.date = null;
  defaults.compression = null;
  defaults.compressionOptions = null;
  defaults.comment = null;
  defaults.unixPermissions = null;
  defaults.dosPermissions = null;
  return defaults;
}
var DataWorker_1;
var hasRequiredDataWorker;
function requireDataWorker() {
  if (hasRequiredDataWorker) return DataWorker_1;
  hasRequiredDataWorker = 1;
  var utils2 = requireUtils();
  var GenericWorker = requireGenericWorker();
  var DEFAULT_BLOCK_SIZE = 16 * 1024;
  function DataWorker(dataP) {
    GenericWorker.call(this, "DataWorker");
    var self2 = this;
    this.dataIsReady = false;
    this.index = 0;
    this.max = 0;
    this.data = null;
    this.type = "";
    this._tickScheduled = false;
    dataP.then(function(data) {
      self2.dataIsReady = true;
      self2.data = data;
      self2.max = data && data.length || 0;
      self2.type = utils2.getTypeOf(data);
      if (!self2.isPaused) {
        self2._tickAndRepeat();
      }
    }, function(e) {
      self2.error(e);
    });
  }
  utils2.inherits(DataWorker, GenericWorker);
  DataWorker.prototype.cleanUp = function() {
    GenericWorker.prototype.cleanUp.call(this);
    this.data = null;
  };
  DataWorker.prototype.resume = function() {
    if (!GenericWorker.prototype.resume.call(this)) {
      return false;
    }
    if (!this._tickScheduled && this.dataIsReady) {
      this._tickScheduled = true;
      utils2.delay(this._tickAndRepeat, [], this);
    }
    return true;
  };
  DataWorker.prototype._tickAndRepeat = function() {
    this._tickScheduled = false;
    if (this.isPaused || this.isFinished) {
      return;
    }
    this._tick();
    if (!this.isFinished) {
      utils2.delay(this._tickAndRepeat, [], this);
      this._tickScheduled = true;
    }
  };
  DataWorker.prototype._tick = function() {
    if (this.isPaused || this.isFinished) {
      return false;
    }
    var size = DEFAULT_BLOCK_SIZE;
    var data = null, nextIndex = Math.min(this.max, this.index + size);
    if (this.index >= this.max) {
      return this.end();
    } else {
      switch (this.type) {
        case "string":
          data = this.data.substring(this.index, nextIndex);
          break;
        case "uint8array":
          data = this.data.subarray(this.index, nextIndex);
          break;
        case "array":
        case "nodebuffer":
          data = this.data.slice(this.index, nextIndex);
          break;
      }
      this.index = nextIndex;
      return this.push({
        data,
        meta: {
          percent: this.max ? this.index / this.max * 100 : 0
        }
      });
    }
  };
  DataWorker_1 = DataWorker;
  return DataWorker_1;
}
var crc32_1$1;
var hasRequiredCrc32$1;
function requireCrc32$1() {
  if (hasRequiredCrc32$1) return crc32_1$1;
  hasRequiredCrc32$1 = 1;
  var utils2 = requireUtils();
  function makeTable() {
    var c, table = [];
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  }
  var crcTable = makeTable();
  function crc32(crc, buf, len, pos) {
    var t = crcTable, end = pos + len;
    crc = crc ^ -1;
    for (var i = pos; i < end; i++) {
      crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
    }
    return crc ^ -1;
  }
  function crc32str(crc, str, len, pos) {
    var t = crcTable, end = pos + len;
    crc = crc ^ -1;
    for (var i = pos; i < end; i++) {
      crc = crc >>> 8 ^ t[(crc ^ str.charCodeAt(i)) & 255];
    }
    return crc ^ -1;
  }
  crc32_1$1 = function crc32wrapper(input, crc) {
    if (typeof input === "undefined" || !input.length) {
      return 0;
    }
    var isArray = utils2.getTypeOf(input) !== "string";
    if (isArray) {
      return crc32(crc | 0, input, input.length, 0);
    } else {
      return crc32str(crc | 0, input, input.length, 0);
    }
  };
  return crc32_1$1;
}
var Crc32Probe_1;
var hasRequiredCrc32Probe;
function requireCrc32Probe() {
  if (hasRequiredCrc32Probe) return Crc32Probe_1;
  hasRequiredCrc32Probe = 1;
  var GenericWorker = requireGenericWorker();
  var crc32 = requireCrc32$1();
  var utils2 = requireUtils();
  function Crc32Probe() {
    GenericWorker.call(this, "Crc32Probe");
    this.withStreamInfo("crc32", 0);
  }
  utils2.inherits(Crc32Probe, GenericWorker);
  Crc32Probe.prototype.processChunk = function(chunk) {
    this.streamInfo.crc32 = crc32(chunk.data, this.streamInfo.crc32 || 0);
    this.push(chunk);
  };
  Crc32Probe_1 = Crc32Probe;
  return Crc32Probe_1;
}
var DataLengthProbe_1;
var hasRequiredDataLengthProbe;
function requireDataLengthProbe() {
  if (hasRequiredDataLengthProbe) return DataLengthProbe_1;
  hasRequiredDataLengthProbe = 1;
  var utils2 = requireUtils();
  var GenericWorker = requireGenericWorker();
  function DataLengthProbe(propName) {
    GenericWorker.call(this, "DataLengthProbe for " + propName);
    this.propName = propName;
    this.withStreamInfo(propName, 0);
  }
  utils2.inherits(DataLengthProbe, GenericWorker);
  DataLengthProbe.prototype.processChunk = function(chunk) {
    if (chunk) {
      var length = this.streamInfo[this.propName] || 0;
      this.streamInfo[this.propName] = length + chunk.data.length;
    }
    GenericWorker.prototype.processChunk.call(this, chunk);
  };
  DataLengthProbe_1 = DataLengthProbe;
  return DataLengthProbe_1;
}
var compressedObject;
var hasRequiredCompressedObject;
function requireCompressedObject() {
  if (hasRequiredCompressedObject) return compressedObject;
  hasRequiredCompressedObject = 1;
  var external2 = requireExternal();
  var DataWorker = requireDataWorker();
  var Crc32Probe = requireCrc32Probe();
  var DataLengthProbe = requireDataLengthProbe();
  function CompressedObject(compressedSize, uncompressedSize, crc32, compression, data) {
    this.compressedSize = compressedSize;
    this.uncompressedSize = uncompressedSize;
    this.crc32 = crc32;
    this.compression = compression;
    this.compressedContent = data;
  }
  CompressedObject.prototype = {
    /**
     * Create a worker to get the uncompressed content.
     * @return {GenericWorker} the worker.
     */
    getContentWorker: function() {
      var worker = new DataWorker(external2.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new DataLengthProbe("data_length"));
      var that = this;
      worker.on("end", function() {
        if (this.streamInfo["data_length"] !== that.uncompressedSize) {
          throw new Error("Bug : uncompressed data size mismatch");
        }
      });
      return worker;
    },
    /**
     * Create a worker to get the compressed content.
     * @return {GenericWorker} the worker.
     */
    getCompressedWorker: function() {
      return new DataWorker(external2.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
    }
  };
  CompressedObject.createWorkerFrom = function(uncompressedWorker, compression, compressionOptions) {
    return uncompressedWorker.pipe(new Crc32Probe()).pipe(new DataLengthProbe("uncompressedSize")).pipe(compression.compressWorker(compressionOptions)).pipe(new DataLengthProbe("compressedSize")).withStreamInfo("compression", compression);
  };
  compressedObject = CompressedObject;
  return compressedObject;
}
var zipObject;
var hasRequiredZipObject;
function requireZipObject() {
  if (hasRequiredZipObject) return zipObject;
  hasRequiredZipObject = 1;
  var StreamHelper = requireStreamHelper();
  var DataWorker = requireDataWorker();
  var utf82 = requireUtf8();
  var CompressedObject = requireCompressedObject();
  var GenericWorker = requireGenericWorker();
  var ZipObject = function(name, data, options) {
    this.name = name;
    this.dir = options.dir;
    this.date = options.date;
    this.comment = options.comment;
    this.unixPermissions = options.unixPermissions;
    this.dosPermissions = options.dosPermissions;
    this._data = data;
    this._dataBinary = options.binary;
    this.options = {
      compression: options.compression,
      compressionOptions: options.compressionOptions
    };
  };
  ZipObject.prototype = {
    /**
     * Create an internal stream for the content of this object.
     * @param {String} type the type of each chunk.
     * @return StreamHelper the stream.
     */
    internalStream: function(type) {
      var result = null, outputType = "string";
      try {
        if (!type) {
          throw new Error("No output type specified.");
        }
        outputType = type.toLowerCase();
        var askUnicodeString = outputType === "string" || outputType === "text";
        if (outputType === "binarystring" || outputType === "text") {
          outputType = "string";
        }
        result = this._decompressWorker();
        var isUnicodeString = !this._dataBinary;
        if (isUnicodeString && !askUnicodeString) {
          result = result.pipe(new utf82.Utf8EncodeWorker());
        }
        if (!isUnicodeString && askUnicodeString) {
          result = result.pipe(new utf82.Utf8DecodeWorker());
        }
      } catch (e) {
        result = new GenericWorker("error");
        result.error(e);
      }
      return new StreamHelper(result, outputType, "");
    },
    /**
     * Prepare the content in the asked type.
     * @param {String} type the type of the result.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Promise the promise of the result.
     */
    async: function(type, onUpdate) {
      return this.internalStream(type).accumulate(onUpdate);
    },
    /**
     * Prepare the content as a nodejs stream.
     * @param {String} type the type of each chunk.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Stream the stream.
     */
    nodeStream: function(type, onUpdate) {
      return this.internalStream(type || "nodebuffer").toNodejsStream(onUpdate);
    },
    /**
     * Return a worker for the compressed content.
     * @private
     * @param {Object} compression the compression object to use.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return Worker the worker.
     */
    _compressWorker: function(compression, compressionOptions) {
      if (this._data instanceof CompressedObject && this._data.compression.magic === compression.magic) {
        return this._data.getCompressedWorker();
      } else {
        var result = this._decompressWorker();
        if (!this._dataBinary) {
          result = result.pipe(new utf82.Utf8EncodeWorker());
        }
        return CompressedObject.createWorkerFrom(result, compression, compressionOptions);
      }
    },
    /**
     * Return a worker for the decompressed content.
     * @private
     * @return Worker the worker.
     */
    _decompressWorker: function() {
      if (this._data instanceof CompressedObject) {
        return this._data.getContentWorker();
      } else if (this._data instanceof GenericWorker) {
        return this._data;
      } else {
        return new DataWorker(this._data);
      }
    }
  };
  var removedMethods = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"];
  var removedFn = function() {
    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
  };
  for (var i = 0; i < removedMethods.length; i++) {
    ZipObject.prototype[removedMethods[i]] = removedFn;
  }
  zipObject = ZipObject;
  return zipObject;
}
var generate = {};
var compressions = {};
var flate = {};
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  (function(exports) {
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    exports.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        var i, l, len, pos, chunk, result;
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }
    };
    var fnUntyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        return [].concat.apply([], chunks);
      }
    };
    exports.setTyped = function(on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };
    exports.setTyped(TYPED_OK);
  })(common);
  return common;
}
var deflate$1 = {};
var deflate = {};
var trees = {};
var hasRequiredTrees;
function requireTrees() {
  if (hasRequiredTrees) return trees;
  hasRequiredTrees = 1;
  var utils2 = requireCommon();
  var Z_FIXED = 4;
  var Z_BINARY = 0;
  var Z_TEXT = 1;
  var Z_UNKNOWN = 2;
  function zero(buf) {
    var len = buf.length;
    while (--len >= 0) {
      buf[len] = 0;
    }
  }
  var STORED_BLOCK = 0;
  var STATIC_TREES = 1;
  var DYN_TREES = 2;
  var MIN_MATCH = 3;
  var MAX_MATCH = 258;
  var LENGTH_CODES = 29;
  var LITERALS = 256;
  var L_CODES = LITERALS + 1 + LENGTH_CODES;
  var D_CODES = 30;
  var BL_CODES = 19;
  var HEAP_SIZE = 2 * L_CODES + 1;
  var MAX_BITS = 15;
  var Buf_size = 16;
  var MAX_BL_BITS = 7;
  var END_BLOCK = 256;
  var REP_3_6 = 16;
  var REPZ_3_10 = 17;
  var REPZ_11_138 = 18;
  var extra_lbits = (
    /* extra bits for each length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
  );
  var extra_dbits = (
    /* extra bits for each distance code */
    [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
  );
  var extra_blbits = (
    /* extra bits for each bit length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
  );
  var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  var DIST_CODE_LEN = 512;
  var static_ltree = new Array((L_CODES + 2) * 2);
  zero(static_ltree);
  var static_dtree = new Array(D_CODES * 2);
  zero(static_dtree);
  var _dist_code = new Array(DIST_CODE_LEN);
  zero(_dist_code);
  var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
  zero(_length_code);
  var base_length = new Array(LENGTH_CODES);
  zero(base_length);
  var base_dist = new Array(D_CODES);
  zero(base_dist);
  function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
    this.static_tree = static_tree;
    this.extra_bits = extra_bits;
    this.extra_base = extra_base;
    this.elems = elems;
    this.max_length = max_length;
    this.has_stree = static_tree && static_tree.length;
  }
  var static_l_desc;
  var static_d_desc;
  var static_bl_desc;
  function TreeDesc(dyn_tree, stat_desc) {
    this.dyn_tree = dyn_tree;
    this.max_code = 0;
    this.stat_desc = stat_desc;
  }
  function d_code(dist2) {
    return dist2 < 256 ? _dist_code[dist2] : _dist_code[256 + (dist2 >>> 7)];
  }
  function put_short(s, w) {
    s.pending_buf[s.pending++] = w & 255;
    s.pending_buf[s.pending++] = w >>> 8 & 255;
  }
  function send_bits(s, value, length) {
    if (s.bi_valid > Buf_size - length) {
      s.bi_buf |= value << s.bi_valid & 65535;
      put_short(s, s.bi_buf);
      s.bi_buf = value >> Buf_size - s.bi_valid;
      s.bi_valid += length - Buf_size;
    } else {
      s.bi_buf |= value << s.bi_valid & 65535;
      s.bi_valid += length;
    }
  }
  function send_code(s, c, tree) {
    send_bits(
      s,
      tree[c * 2],
      tree[c * 2 + 1]
      /*.Len*/
    );
  }
  function bi_reverse(code, len) {
    var res = 0;
    do {
      res |= code & 1;
      code >>>= 1;
      res <<= 1;
    } while (--len > 0);
    return res >>> 1;
  }
  function bi_flush(s) {
    if (s.bi_valid === 16) {
      put_short(s, s.bi_buf);
      s.bi_buf = 0;
      s.bi_valid = 0;
    } else if (s.bi_valid >= 8) {
      s.pending_buf[s.pending++] = s.bi_buf & 255;
      s.bi_buf >>= 8;
      s.bi_valid -= 8;
    }
  }
  function gen_bitlen(s, desc) {
    var tree = desc.dyn_tree;
    var max_code = desc.max_code;
    var stree = desc.stat_desc.static_tree;
    var has_stree = desc.stat_desc.has_stree;
    var extra = desc.stat_desc.extra_bits;
    var base = desc.stat_desc.extra_base;
    var max_length = desc.stat_desc.max_length;
    var h;
    var n, m;
    var bits;
    var xbits;
    var f;
    var overflow = 0;
    for (bits = 0; bits <= MAX_BITS; bits++) {
      s.bl_count[bits] = 0;
    }
    tree[s.heap[s.heap_max] * 2 + 1] = 0;
    for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
      n = s.heap[h];
      bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
      if (bits > max_length) {
        bits = max_length;
        overflow++;
      }
      tree[n * 2 + 1] = bits;
      if (n > max_code) {
        continue;
      }
      s.bl_count[bits]++;
      xbits = 0;
      if (n >= base) {
        xbits = extra[n - base];
      }
      f = tree[n * 2];
      s.opt_len += f * (bits + xbits);
      if (has_stree) {
        s.static_len += f * (stree[n * 2 + 1] + xbits);
      }
    }
    if (overflow === 0) {
      return;
    }
    do {
      bits = max_length - 1;
      while (s.bl_count[bits] === 0) {
        bits--;
      }
      s.bl_count[bits]--;
      s.bl_count[bits + 1] += 2;
      s.bl_count[max_length]--;
      overflow -= 2;
    } while (overflow > 0);
    for (bits = max_length; bits !== 0; bits--) {
      n = s.bl_count[bits];
      while (n !== 0) {
        m = s.heap[--h];
        if (m > max_code) {
          continue;
        }
        if (tree[m * 2 + 1] !== bits) {
          s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
          tree[m * 2 + 1] = bits;
        }
        n--;
      }
    }
  }
  function gen_codes(tree, max_code, bl_count) {
    var next_code = new Array(MAX_BITS + 1);
    var code = 0;
    var bits;
    var n;
    for (bits = 1; bits <= MAX_BITS; bits++) {
      next_code[bits] = code = code + bl_count[bits - 1] << 1;
    }
    for (n = 0; n <= max_code; n++) {
      var len = tree[n * 2 + 1];
      if (len === 0) {
        continue;
      }
      tree[n * 2] = bi_reverse(next_code[len]++, len);
    }
  }
  function tr_static_init() {
    var n;
    var bits;
    var length;
    var code;
    var dist2;
    var bl_count = new Array(MAX_BITS + 1);
    length = 0;
    for (code = 0; code < LENGTH_CODES - 1; code++) {
      base_length[code] = length;
      for (n = 0; n < 1 << extra_lbits[code]; n++) {
        _length_code[length++] = code;
      }
    }
    _length_code[length - 1] = code;
    dist2 = 0;
    for (code = 0; code < 16; code++) {
      base_dist[code] = dist2;
      for (n = 0; n < 1 << extra_dbits[code]; n++) {
        _dist_code[dist2++] = code;
      }
    }
    dist2 >>= 7;
    for (; code < D_CODES; code++) {
      base_dist[code] = dist2 << 7;
      for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
        _dist_code[256 + dist2++] = code;
      }
    }
    for (bits = 0; bits <= MAX_BITS; bits++) {
      bl_count[bits] = 0;
    }
    n = 0;
    while (n <= 143) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    while (n <= 255) {
      static_ltree[n * 2 + 1] = 9;
      n++;
      bl_count[9]++;
    }
    while (n <= 279) {
      static_ltree[n * 2 + 1] = 7;
      n++;
      bl_count[7]++;
    }
    while (n <= 287) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    gen_codes(static_ltree, L_CODES + 1, bl_count);
    for (n = 0; n < D_CODES; n++) {
      static_dtree[n * 2 + 1] = 5;
      static_dtree[n * 2] = bi_reverse(n, 5);
    }
    static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
    static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
    static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
  }
  function init_block(s) {
    var n;
    for (n = 0; n < L_CODES; n++) {
      s.dyn_ltree[n * 2] = 0;
    }
    for (n = 0; n < D_CODES; n++) {
      s.dyn_dtree[n * 2] = 0;
    }
    for (n = 0; n < BL_CODES; n++) {
      s.bl_tree[n * 2] = 0;
    }
    s.dyn_ltree[END_BLOCK * 2] = 1;
    s.opt_len = s.static_len = 0;
    s.last_lit = s.matches = 0;
  }
  function bi_windup(s) {
    if (s.bi_valid > 8) {
      put_short(s, s.bi_buf);
    } else if (s.bi_valid > 0) {
      s.pending_buf[s.pending++] = s.bi_buf;
    }
    s.bi_buf = 0;
    s.bi_valid = 0;
  }
  function copy_block(s, buf, len, header) {
    bi_windup(s);
    {
      put_short(s, len);
      put_short(s, ~len);
    }
    utils2.arraySet(s.pending_buf, s.window, buf, len, s.pending);
    s.pending += len;
  }
  function smaller(tree, n, m, depth) {
    var _n2 = n * 2;
    var _m2 = m * 2;
    return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
  }
  function pqdownheap(s, tree, k) {
    var v = s.heap[k];
    var j = k << 1;
    while (j <= s.heap_len) {
      if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
        j++;
      }
      if (smaller(tree, v, s.heap[j], s.depth)) {
        break;
      }
      s.heap[k] = s.heap[j];
      k = j;
      j <<= 1;
    }
    s.heap[k] = v;
  }
  function compress_block(s, ltree, dtree) {
    var dist2;
    var lc;
    var lx = 0;
    var code;
    var extra;
    if (s.last_lit !== 0) {
      do {
        dist2 = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
        lc = s.pending_buf[s.l_buf + lx];
        lx++;
        if (dist2 === 0) {
          send_code(s, lc, ltree);
        } else {
          code = _length_code[lc];
          send_code(s, code + LITERALS + 1, ltree);
          extra = extra_lbits[code];
          if (extra !== 0) {
            lc -= base_length[code];
            send_bits(s, lc, extra);
          }
          dist2--;
          code = d_code(dist2);
          send_code(s, code, dtree);
          extra = extra_dbits[code];
          if (extra !== 0) {
            dist2 -= base_dist[code];
            send_bits(s, dist2, extra);
          }
        }
      } while (lx < s.last_lit);
    }
    send_code(s, END_BLOCK, ltree);
  }
  function build_tree(s, desc) {
    var tree = desc.dyn_tree;
    var stree = desc.stat_desc.static_tree;
    var has_stree = desc.stat_desc.has_stree;
    var elems = desc.stat_desc.elems;
    var n, m;
    var max_code = -1;
    var node2;
    s.heap_len = 0;
    s.heap_max = HEAP_SIZE;
    for (n = 0; n < elems; n++) {
      if (tree[n * 2] !== 0) {
        s.heap[++s.heap_len] = max_code = n;
        s.depth[n] = 0;
      } else {
        tree[n * 2 + 1] = 0;
      }
    }
    while (s.heap_len < 2) {
      node2 = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
      tree[node2 * 2] = 1;
      s.depth[node2] = 0;
      s.opt_len--;
      if (has_stree) {
        s.static_len -= stree[node2 * 2 + 1];
      }
    }
    desc.max_code = max_code;
    for (n = s.heap_len >> 1; n >= 1; n--) {
      pqdownheap(s, tree, n);
    }
    node2 = elems;
    do {
      n = s.heap[
        1
        /*SMALLEST*/
      ];
      s.heap[
        1
        /*SMALLEST*/
      ] = s.heap[s.heap_len--];
      pqdownheap(
        s,
        tree,
        1
        /*SMALLEST*/
      );
      m = s.heap[
        1
        /*SMALLEST*/
      ];
      s.heap[--s.heap_max] = n;
      s.heap[--s.heap_max] = m;
      tree[node2 * 2] = tree[n * 2] + tree[m * 2];
      s.depth[node2] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
      tree[n * 2 + 1] = tree[m * 2 + 1] = node2;
      s.heap[
        1
        /*SMALLEST*/
      ] = node2++;
      pqdownheap(
        s,
        tree,
        1
        /*SMALLEST*/
      );
    } while (s.heap_len >= 2);
    s.heap[--s.heap_max] = s.heap[
      1
      /*SMALLEST*/
    ];
    gen_bitlen(s, desc);
    gen_codes(tree, max_code, s.bl_count);
  }
  function scan_tree(s, tree, max_code) {
    var n;
    var prevlen = -1;
    var curlen;
    var nextlen = tree[0 * 2 + 1];
    var count = 0;
    var max_count = 7;
    var min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[(max_code + 1) * 2 + 1] = 65535;
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) {
        continue;
      } else if (count < min_count) {
        s.bl_tree[curlen * 2] += count;
      } else if (curlen !== 0) {
        if (curlen !== prevlen) {
          s.bl_tree[curlen * 2]++;
        }
        s.bl_tree[REP_3_6 * 2]++;
      } else if (count <= 10) {
        s.bl_tree[REPZ_3_10 * 2]++;
      } else {
        s.bl_tree[REPZ_11_138 * 2]++;
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function send_tree(s, tree, max_code) {
    var n;
    var prevlen = -1;
    var curlen;
    var nextlen = tree[0 * 2 + 1];
    var count = 0;
    var max_count = 7;
    var min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) {
        continue;
      } else if (count < min_count) {
        do {
          send_code(s, curlen, s.bl_tree);
        } while (--count !== 0);
      } else if (curlen !== 0) {
        if (curlen !== prevlen) {
          send_code(s, curlen, s.bl_tree);
          count--;
        }
        send_code(s, REP_3_6, s.bl_tree);
        send_bits(s, count - 3, 2);
      } else if (count <= 10) {
        send_code(s, REPZ_3_10, s.bl_tree);
        send_bits(s, count - 3, 3);
      } else {
        send_code(s, REPZ_11_138, s.bl_tree);
        send_bits(s, count - 11, 7);
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function build_bl_tree(s) {
    var max_blindex;
    scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
    scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
    build_tree(s, s.bl_desc);
    for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
      if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
        break;
      }
    }
    s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
    return max_blindex;
  }
  function send_all_trees(s, lcodes, dcodes, blcodes) {
    var rank;
    send_bits(s, lcodes - 257, 5);
    send_bits(s, dcodes - 1, 5);
    send_bits(s, blcodes - 4, 4);
    for (rank = 0; rank < blcodes; rank++) {
      send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
    }
    send_tree(s, s.dyn_ltree, lcodes - 1);
    send_tree(s, s.dyn_dtree, dcodes - 1);
  }
  function detect_data_type(s) {
    var black_mask = 4093624447;
    var n;
    for (n = 0; n <= 31; n++, black_mask >>>= 1) {
      if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
        return Z_BINARY;
      }
    }
    if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
      return Z_TEXT;
    }
    for (n = 32; n < LITERALS; n++) {
      if (s.dyn_ltree[n * 2] !== 0) {
        return Z_TEXT;
      }
    }
    return Z_BINARY;
  }
  var static_init_done = false;
  function _tr_init(s) {
    if (!static_init_done) {
      tr_static_init();
      static_init_done = true;
    }
    s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
    s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
    s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
    s.bi_buf = 0;
    s.bi_valid = 0;
    init_block(s);
  }
  function _tr_stored_block(s, buf, stored_len, last) {
    send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
    copy_block(s, buf, stored_len);
  }
  function _tr_align(s) {
    send_bits(s, STATIC_TREES << 1, 3);
    send_code(s, END_BLOCK, static_ltree);
    bi_flush(s);
  }
  function _tr_flush_block(s, buf, stored_len, last) {
    var opt_lenb, static_lenb;
    var max_blindex = 0;
    if (s.level > 0) {
      if (s.strm.data_type === Z_UNKNOWN) {
        s.strm.data_type = detect_data_type(s);
      }
      build_tree(s, s.l_desc);
      build_tree(s, s.d_desc);
      max_blindex = build_bl_tree(s);
      opt_lenb = s.opt_len + 3 + 7 >>> 3;
      static_lenb = s.static_len + 3 + 7 >>> 3;
      if (static_lenb <= opt_lenb) {
        opt_lenb = static_lenb;
      }
    } else {
      opt_lenb = static_lenb = stored_len + 5;
    }
    if (stored_len + 4 <= opt_lenb && buf !== -1) {
      _tr_stored_block(s, buf, stored_len, last);
    } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
      send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
      compress_block(s, static_ltree, static_dtree);
    } else {
      send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
      send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
      compress_block(s, s.dyn_ltree, s.dyn_dtree);
    }
    init_block(s);
    if (last) {
      bi_windup(s);
    }
  }
  function _tr_tally(s, dist2, lc) {
    s.pending_buf[s.d_buf + s.last_lit * 2] = dist2 >>> 8 & 255;
    s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist2 & 255;
    s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
    s.last_lit++;
    if (dist2 === 0) {
      s.dyn_ltree[lc * 2]++;
    } else {
      s.matches++;
      dist2--;
      s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
      s.dyn_dtree[d_code(dist2) * 2]++;
    }
    return s.last_lit === s.lit_bufsize - 1;
  }
  trees._tr_init = _tr_init;
  trees._tr_stored_block = _tr_stored_block;
  trees._tr_flush_block = _tr_flush_block;
  trees._tr_tally = _tr_tally;
  trees._tr_align = _tr_align;
  return trees;
}
var adler32_1;
var hasRequiredAdler32;
function requireAdler32() {
  if (hasRequiredAdler32) return adler32_1;
  hasRequiredAdler32 = 1;
  function adler32(adler, buf, len, pos) {
    var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
    while (len !== 0) {
      n = len > 2e3 ? 2e3 : len;
      len -= n;
      do {
        s1 = s1 + buf[pos++] | 0;
        s2 = s2 + s1 | 0;
      } while (--n);
      s1 %= 65521;
      s2 %= 65521;
    }
    return s1 | s2 << 16 | 0;
  }
  adler32_1 = adler32;
  return adler32_1;
}
var crc32_1;
var hasRequiredCrc32;
function requireCrc32() {
  if (hasRequiredCrc32) return crc32_1;
  hasRequiredCrc32 = 1;
  function makeTable() {
    var c, table = [];
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  }
  var crcTable = makeTable();
  function crc32(crc, buf, len, pos) {
    var t = crcTable, end = pos + len;
    crc ^= -1;
    for (var i = pos; i < end; i++) {
      crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
    }
    return crc ^ -1;
  }
  crc32_1 = crc32;
  return crc32_1;
}
var messages;
var hasRequiredMessages;
function requireMessages() {
  if (hasRequiredMessages) return messages;
  hasRequiredMessages = 1;
  messages = {
    2: "need dictionary",
    /* Z_NEED_DICT       2  */
    1: "stream end",
    /* Z_STREAM_END      1  */
    0: "",
    /* Z_OK              0  */
    "-1": "file error",
    /* Z_ERRNO         (-1) */
    "-2": "stream error",
    /* Z_STREAM_ERROR  (-2) */
    "-3": "data error",
    /* Z_DATA_ERROR    (-3) */
    "-4": "insufficient memory",
    /* Z_MEM_ERROR     (-4) */
    "-5": "buffer error",
    /* Z_BUF_ERROR     (-5) */
    "-6": "incompatible version"
    /* Z_VERSION_ERROR (-6) */
  };
  return messages;
}
var hasRequiredDeflate$1;
function requireDeflate$1() {
  if (hasRequiredDeflate$1) return deflate;
  hasRequiredDeflate$1 = 1;
  var utils2 = requireCommon();
  var trees2 = requireTrees();
  var adler32 = requireAdler32();
  var crc32 = requireCrc32();
  var msg = requireMessages();
  var Z_NO_FLUSH = 0;
  var Z_PARTIAL_FLUSH = 1;
  var Z_FULL_FLUSH = 3;
  var Z_FINISH = 4;
  var Z_BLOCK = 5;
  var Z_OK = 0;
  var Z_STREAM_END = 1;
  var Z_STREAM_ERROR = -2;
  var Z_DATA_ERROR = -3;
  var Z_BUF_ERROR = -5;
  var Z_DEFAULT_COMPRESSION = -1;
  var Z_FILTERED = 1;
  var Z_HUFFMAN_ONLY = 2;
  var Z_RLE = 3;
  var Z_FIXED = 4;
  var Z_DEFAULT_STRATEGY = 0;
  var Z_UNKNOWN = 2;
  var Z_DEFLATED = 8;
  var MAX_MEM_LEVEL = 9;
  var MAX_WBITS = 15;
  var DEF_MEM_LEVEL = 8;
  var LENGTH_CODES = 29;
  var LITERALS = 256;
  var L_CODES = LITERALS + 1 + LENGTH_CODES;
  var D_CODES = 30;
  var BL_CODES = 19;
  var HEAP_SIZE = 2 * L_CODES + 1;
  var MAX_BITS = 15;
  var MIN_MATCH = 3;
  var MAX_MATCH = 258;
  var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
  var PRESET_DICT = 32;
  var INIT_STATE = 42;
  var EXTRA_STATE = 69;
  var NAME_STATE = 73;
  var COMMENT_STATE = 91;
  var HCRC_STATE = 103;
  var BUSY_STATE = 113;
  var FINISH_STATE = 666;
  var BS_NEED_MORE = 1;
  var BS_BLOCK_DONE = 2;
  var BS_FINISH_STARTED = 3;
  var BS_FINISH_DONE = 4;
  var OS_CODE = 3;
  function err(strm, errorCode) {
    strm.msg = msg[errorCode];
    return errorCode;
  }
  function rank(f) {
    return (f << 1) - (f > 4 ? 9 : 0);
  }
  function zero(buf) {
    var len = buf.length;
    while (--len >= 0) {
      buf[len] = 0;
    }
  }
  function flush_pending(strm) {
    var s = strm.state;
    var len = s.pending;
    if (len > strm.avail_out) {
      len = strm.avail_out;
    }
    if (len === 0) {
      return;
    }
    utils2.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
    strm.next_out += len;
    s.pending_out += len;
    strm.total_out += len;
    strm.avail_out -= len;
    s.pending -= len;
    if (s.pending === 0) {
      s.pending_out = 0;
    }
  }
  function flush_block_only(s, last) {
    trees2._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
    s.block_start = s.strstart;
    flush_pending(s.strm);
  }
  function put_byte(s, b) {
    s.pending_buf[s.pending++] = b;
  }
  function putShortMSB(s, b) {
    s.pending_buf[s.pending++] = b >>> 8 & 255;
    s.pending_buf[s.pending++] = b & 255;
  }
  function read_buf(strm, buf, start, size) {
    var len = strm.avail_in;
    if (len > size) {
      len = size;
    }
    if (len === 0) {
      return 0;
    }
    strm.avail_in -= len;
    utils2.arraySet(buf, strm.input, strm.next_in, len, start);
    if (strm.state.wrap === 1) {
      strm.adler = adler32(strm.adler, buf, len, start);
    } else if (strm.state.wrap === 2) {
      strm.adler = crc32(strm.adler, buf, len, start);
    }
    strm.next_in += len;
    strm.total_in += len;
    return len;
  }
  function longest_match(s, cur_match) {
    var chain_length = s.max_chain_length;
    var scan = s.strstart;
    var match;
    var len;
    var best_len = s.prev_length;
    var nice_match = s.nice_match;
    var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
    var _win = s.window;
    var wmask = s.w_mask;
    var prev = s.prev;
    var strend = s.strstart + MAX_MATCH;
    var scan_end1 = _win[scan + best_len - 1];
    var scan_end = _win[scan + best_len];
    if (s.prev_length >= s.good_match) {
      chain_length >>= 2;
    }
    if (nice_match > s.lookahead) {
      nice_match = s.lookahead;
    }
    do {
      match = cur_match;
      if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
        continue;
      }
      scan += 2;
      match++;
      do {
      } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
      len = MAX_MATCH - (strend - scan);
      scan = strend - MAX_MATCH;
      if (len > best_len) {
        s.match_start = cur_match;
        best_len = len;
        if (len >= nice_match) {
          break;
        }
        scan_end1 = _win[scan + best_len - 1];
        scan_end = _win[scan + best_len];
      }
    } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
    if (best_len <= s.lookahead) {
      return best_len;
    }
    return s.lookahead;
  }
  function fill_window(s) {
    var _w_size = s.w_size;
    var p, n, m, more, str;
    do {
      more = s.window_size - s.lookahead - s.strstart;
      if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
        utils2.arraySet(s.window, s.window, _w_size, _w_size, 0);
        s.match_start -= _w_size;
        s.strstart -= _w_size;
        s.block_start -= _w_size;
        n = s.hash_size;
        p = n;
        do {
          m = s.head[--p];
          s.head[p] = m >= _w_size ? m - _w_size : 0;
        } while (--n);
        n = _w_size;
        p = n;
        do {
          m = s.prev[--p];
          s.prev[p] = m >= _w_size ? m - _w_size : 0;
        } while (--n);
        more += _w_size;
      }
      if (s.strm.avail_in === 0) {
        break;
      }
      n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
      s.lookahead += n;
      if (s.lookahead + s.insert >= MIN_MATCH) {
        str = s.strstart - s.insert;
        s.ins_h = s.window[str];
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
        while (s.insert) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
          s.insert--;
          if (s.lookahead + s.insert < MIN_MATCH) {
            break;
          }
        }
      }
    } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
  }
  function deflate_stored(s, flush) {
    var max_block_size = 65535;
    if (max_block_size > s.pending_buf_size - 5) {
      max_block_size = s.pending_buf_size - 5;
    }
    for (; ; ) {
      if (s.lookahead <= 1) {
        fill_window(s);
        if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      s.strstart += s.lookahead;
      s.lookahead = 0;
      var max_start = s.block_start + max_block_size;
      if (s.strstart === 0 || s.strstart >= max_start) {
        s.lookahead = s.strstart - max_start;
        s.strstart = max_start;
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.strstart > s.block_start) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_NEED_MORE;
  }
  function deflate_fast(s, flush) {
    var hash_head;
    var bflush;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH) {
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
      }
      if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
        s.match_length = longest_match(s, hash_head);
      }
      if (s.match_length >= MIN_MATCH) {
        bflush = trees2._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
        s.lookahead -= s.match_length;
        if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
          s.match_length--;
          do {
            s.strstart++;
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          } while (--s.match_length !== 0);
          s.strstart++;
        } else {
          s.strstart += s.match_length;
          s.match_length = 0;
          s.ins_h = s.window[s.strstart];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
        }
      } else {
        bflush = trees2._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function deflate_slow(s, flush) {
    var hash_head;
    var bflush;
    var max_insert;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH) {
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
      }
      s.prev_length = s.match_length;
      s.prev_match = s.match_start;
      s.match_length = MIN_MATCH - 1;
      if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
        s.match_length = longest_match(s, hash_head);
        if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
          s.match_length = MIN_MATCH - 1;
        }
      }
      if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
        max_insert = s.strstart + s.lookahead - MIN_MATCH;
        bflush = trees2._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
        s.lookahead -= s.prev_length - 1;
        s.prev_length -= 2;
        do {
          if (++s.strstart <= max_insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
        } while (--s.prev_length !== 0);
        s.match_available = 0;
        s.match_length = MIN_MATCH - 1;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      } else if (s.match_available) {
        bflush = trees2._tr_tally(s, 0, s.window[s.strstart - 1]);
        if (bflush) {
          flush_block_only(s, false);
        }
        s.strstart++;
        s.lookahead--;
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      } else {
        s.match_available = 1;
        s.strstart++;
        s.lookahead--;
      }
    }
    if (s.match_available) {
      bflush = trees2._tr_tally(s, 0, s.window[s.strstart - 1]);
      s.match_available = 0;
    }
    s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function deflate_rle(s, flush) {
    var bflush;
    var prev;
    var scan, strend;
    var _win = s.window;
    for (; ; ) {
      if (s.lookahead <= MAX_MATCH) {
        fill_window(s);
        if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      s.match_length = 0;
      if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
        scan = s.strstart - 1;
        prev = _win[scan];
        if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
          strend = s.strstart + MAX_MATCH;
          do {
          } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
          s.match_length = MAX_MATCH - (strend - scan);
          if (s.match_length > s.lookahead) {
            s.match_length = s.lookahead;
          }
        }
      }
      if (s.match_length >= MIN_MATCH) {
        bflush = trees2._tr_tally(s, 1, s.match_length - MIN_MATCH);
        s.lookahead -= s.match_length;
        s.strstart += s.match_length;
        s.match_length = 0;
      } else {
        bflush = trees2._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function deflate_huff(s, flush) {
    var bflush;
    for (; ; ) {
      if (s.lookahead === 0) {
        fill_window(s);
        if (s.lookahead === 0) {
          if (flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          break;
        }
      }
      s.match_length = 0;
      bflush = trees2._tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function Config(good_length, max_lazy, nice_length, max_chain, func) {
    this.good_length = good_length;
    this.max_lazy = max_lazy;
    this.nice_length = nice_length;
    this.max_chain = max_chain;
    this.func = func;
  }
  var configuration_table;
  configuration_table = [
    /*      good lazy nice chain */
    new Config(0, 0, 0, 0, deflate_stored),
    /* 0 store only */
    new Config(4, 4, 8, 4, deflate_fast),
    /* 1 max speed, no lazy matches */
    new Config(4, 5, 16, 8, deflate_fast),
    /* 2 */
    new Config(4, 6, 32, 32, deflate_fast),
    /* 3 */
    new Config(4, 4, 16, 16, deflate_slow),
    /* 4 lazy matches */
    new Config(8, 16, 32, 32, deflate_slow),
    /* 5 */
    new Config(8, 16, 128, 128, deflate_slow),
    /* 6 */
    new Config(8, 32, 128, 256, deflate_slow),
    /* 7 */
    new Config(32, 128, 258, 1024, deflate_slow),
    /* 8 */
    new Config(32, 258, 258, 4096, deflate_slow)
    /* 9 max compression */
  ];
  function lm_init(s) {
    s.window_size = 2 * s.w_size;
    zero(s.head);
    s.max_lazy_match = configuration_table[s.level].max_lazy;
    s.good_match = configuration_table[s.level].good_length;
    s.nice_match = configuration_table[s.level].nice_length;
    s.max_chain_length = configuration_table[s.level].max_chain;
    s.strstart = 0;
    s.block_start = 0;
    s.lookahead = 0;
    s.insert = 0;
    s.match_length = s.prev_length = MIN_MATCH - 1;
    s.match_available = 0;
    s.ins_h = 0;
  }
  function DeflateState() {
    this.strm = null;
    this.status = 0;
    this.pending_buf = null;
    this.pending_buf_size = 0;
    this.pending_out = 0;
    this.pending = 0;
    this.wrap = 0;
    this.gzhead = null;
    this.gzindex = 0;
    this.method = Z_DEFLATED;
    this.last_flush = -1;
    this.w_size = 0;
    this.w_bits = 0;
    this.w_mask = 0;
    this.window = null;
    this.window_size = 0;
    this.prev = null;
    this.head = null;
    this.ins_h = 0;
    this.hash_size = 0;
    this.hash_bits = 0;
    this.hash_mask = 0;
    this.hash_shift = 0;
    this.block_start = 0;
    this.match_length = 0;
    this.prev_match = 0;
    this.match_available = 0;
    this.strstart = 0;
    this.match_start = 0;
    this.lookahead = 0;
    this.prev_length = 0;
    this.max_chain_length = 0;
    this.max_lazy_match = 0;
    this.level = 0;
    this.strategy = 0;
    this.good_match = 0;
    this.nice_match = 0;
    this.dyn_ltree = new utils2.Buf16(HEAP_SIZE * 2);
    this.dyn_dtree = new utils2.Buf16((2 * D_CODES + 1) * 2);
    this.bl_tree = new utils2.Buf16((2 * BL_CODES + 1) * 2);
    zero(this.dyn_ltree);
    zero(this.dyn_dtree);
    zero(this.bl_tree);
    this.l_desc = null;
    this.d_desc = null;
    this.bl_desc = null;
    this.bl_count = new utils2.Buf16(MAX_BITS + 1);
    this.heap = new utils2.Buf16(2 * L_CODES + 1);
    zero(this.heap);
    this.heap_len = 0;
    this.heap_max = 0;
    this.depth = new utils2.Buf16(2 * L_CODES + 1);
    zero(this.depth);
    this.l_buf = 0;
    this.lit_bufsize = 0;
    this.last_lit = 0;
    this.d_buf = 0;
    this.opt_len = 0;
    this.static_len = 0;
    this.matches = 0;
    this.insert = 0;
    this.bi_buf = 0;
    this.bi_valid = 0;
  }
  function deflateResetKeep(strm) {
    var s;
    if (!strm || !strm.state) {
      return err(strm, Z_STREAM_ERROR);
    }
    strm.total_in = strm.total_out = 0;
    strm.data_type = Z_UNKNOWN;
    s = strm.state;
    s.pending = 0;
    s.pending_out = 0;
    if (s.wrap < 0) {
      s.wrap = -s.wrap;
    }
    s.status = s.wrap ? INIT_STATE : BUSY_STATE;
    strm.adler = s.wrap === 2 ? 0 : 1;
    s.last_flush = Z_NO_FLUSH;
    trees2._tr_init(s);
    return Z_OK;
  }
  function deflateReset(strm) {
    var ret = deflateResetKeep(strm);
    if (ret === Z_OK) {
      lm_init(strm.state);
    }
    return ret;
  }
  function deflateSetHeader(strm, head) {
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    if (strm.state.wrap !== 2) {
      return Z_STREAM_ERROR;
    }
    strm.state.gzhead = head;
    return Z_OK;
  }
  function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
    if (!strm) {
      return Z_STREAM_ERROR;
    }
    var wrap = 1;
    if (level === Z_DEFAULT_COMPRESSION) {
      level = 6;
    }
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else if (windowBits > 15) {
      wrap = 2;
      windowBits -= 16;
    }
    if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
      return err(strm, Z_STREAM_ERROR);
    }
    if (windowBits === 8) {
      windowBits = 9;
    }
    var s = new DeflateState();
    strm.state = s;
    s.strm = strm;
    s.wrap = wrap;
    s.gzhead = null;
    s.w_bits = windowBits;
    s.w_size = 1 << s.w_bits;
    s.w_mask = s.w_size - 1;
    s.hash_bits = memLevel + 7;
    s.hash_size = 1 << s.hash_bits;
    s.hash_mask = s.hash_size - 1;
    s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
    s.window = new utils2.Buf8(s.w_size * 2);
    s.head = new utils2.Buf16(s.hash_size);
    s.prev = new utils2.Buf16(s.w_size);
    s.lit_bufsize = 1 << memLevel + 6;
    s.pending_buf_size = s.lit_bufsize * 4;
    s.pending_buf = new utils2.Buf8(s.pending_buf_size);
    s.d_buf = 1 * s.lit_bufsize;
    s.l_buf = (1 + 2) * s.lit_bufsize;
    s.level = level;
    s.strategy = strategy;
    s.method = method;
    return deflateReset(strm);
  }
  function deflateInit(strm, level) {
    return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }
  function deflate$12(strm, flush) {
    var old_flush, s;
    var beg, val;
    if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
      return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
    }
    s = strm.state;
    if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
      return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
    }
    s.strm = strm;
    old_flush = s.last_flush;
    s.last_flush = flush;
    if (s.status === INIT_STATE) {
      if (s.wrap === 2) {
        strm.adler = 0;
        put_byte(s, 31);
        put_byte(s, 139);
        put_byte(s, 8);
        if (!s.gzhead) {
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
          put_byte(s, OS_CODE);
          s.status = BUSY_STATE;
        } else {
          put_byte(
            s,
            (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
          );
          put_byte(s, s.gzhead.time & 255);
          put_byte(s, s.gzhead.time >> 8 & 255);
          put_byte(s, s.gzhead.time >> 16 & 255);
          put_byte(s, s.gzhead.time >> 24 & 255);
          put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
          put_byte(s, s.gzhead.os & 255);
          if (s.gzhead.extra && s.gzhead.extra.length) {
            put_byte(s, s.gzhead.extra.length & 255);
            put_byte(s, s.gzhead.extra.length >> 8 & 255);
          }
          if (s.gzhead.hcrc) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
          }
          s.gzindex = 0;
          s.status = EXTRA_STATE;
        }
      } else {
        var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
        var level_flags = -1;
        if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
          level_flags = 0;
        } else if (s.level < 6) {
          level_flags = 1;
        } else if (s.level === 6) {
          level_flags = 2;
        } else {
          level_flags = 3;
        }
        header |= level_flags << 6;
        if (s.strstart !== 0) {
          header |= PRESET_DICT;
        }
        header += 31 - header % 31;
        s.status = BUSY_STATE;
        putShortMSB(s, header);
        if (s.strstart !== 0) {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 65535);
        }
        strm.adler = 1;
      }
    }
    if (s.status === EXTRA_STATE) {
      if (s.gzhead.extra) {
        beg = s.pending;
        while (s.gzindex < (s.gzhead.extra.length & 65535)) {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              break;
            }
          }
          put_byte(s, s.gzhead.extra[s.gzindex] & 255);
          s.gzindex++;
        }
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (s.gzindex === s.gzhead.extra.length) {
          s.gzindex = 0;
          s.status = NAME_STATE;
        }
      } else {
        s.status = NAME_STATE;
      }
    }
    if (s.status === NAME_STATE) {
      if (s.gzhead.name) {
        beg = s.pending;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          if (s.gzindex < s.gzhead.name.length) {
            val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.gzindex = 0;
          s.status = COMMENT_STATE;
        }
      } else {
        s.status = COMMENT_STATE;
      }
    }
    if (s.status === COMMENT_STATE) {
      if (s.gzhead.comment) {
        beg = s.pending;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          if (s.gzindex < s.gzhead.comment.length) {
            val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.status = HCRC_STATE;
        }
      } else {
        s.status = HCRC_STATE;
      }
    }
    if (s.status === HCRC_STATE) {
      if (s.gzhead.hcrc) {
        if (s.pending + 2 > s.pending_buf_size) {
          flush_pending(strm);
        }
        if (s.pending + 2 <= s.pending_buf_size) {
          put_byte(s, strm.adler & 255);
          put_byte(s, strm.adler >> 8 & 255);
          strm.adler = 0;
          s.status = BUSY_STATE;
        }
      } else {
        s.status = BUSY_STATE;
      }
    }
    if (s.pending !== 0) {
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return Z_OK;
      }
    } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
      return err(strm, Z_BUF_ERROR);
    }
    if (s.status === FINISH_STATE && strm.avail_in !== 0) {
      return err(strm, Z_BUF_ERROR);
    }
    if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
      var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
      if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
        s.status = FINISH_STATE;
      }
      if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
        if (strm.avail_out === 0) {
          s.last_flush = -1;
        }
        return Z_OK;
      }
      if (bstate === BS_BLOCK_DONE) {
        if (flush === Z_PARTIAL_FLUSH) {
          trees2._tr_align(s);
        } else if (flush !== Z_BLOCK) {
          trees2._tr_stored_block(s, 0, 0, false);
          if (flush === Z_FULL_FLUSH) {
            zero(s.head);
            if (s.lookahead === 0) {
              s.strstart = 0;
              s.block_start = 0;
              s.insert = 0;
            }
          }
        }
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK;
        }
      }
    }
    if (flush !== Z_FINISH) {
      return Z_OK;
    }
    if (s.wrap <= 0) {
      return Z_STREAM_END;
    }
    if (s.wrap === 2) {
      put_byte(s, strm.adler & 255);
      put_byte(s, strm.adler >> 8 & 255);
      put_byte(s, strm.adler >> 16 & 255);
      put_byte(s, strm.adler >> 24 & 255);
      put_byte(s, strm.total_in & 255);
      put_byte(s, strm.total_in >> 8 & 255);
      put_byte(s, strm.total_in >> 16 & 255);
      put_byte(s, strm.total_in >> 24 & 255);
    } else {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 65535);
    }
    flush_pending(strm);
    if (s.wrap > 0) {
      s.wrap = -s.wrap;
    }
    return s.pending !== 0 ? Z_OK : Z_STREAM_END;
  }
  function deflateEnd(strm) {
    var status;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    status = strm.state.status;
    if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
      return err(strm, Z_STREAM_ERROR);
    }
    strm.state = null;
    return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
  }
  function deflateSetDictionary(strm, dictionary) {
    var dictLength = dictionary.length;
    var s;
    var str, n;
    var wrap;
    var avail;
    var next;
    var input;
    var tmpDict;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    s = strm.state;
    wrap = s.wrap;
    if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
      return Z_STREAM_ERROR;
    }
    if (wrap === 1) {
      strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
    }
    s.wrap = 0;
    if (dictLength >= s.w_size) {
      if (wrap === 0) {
        zero(s.head);
        s.strstart = 0;
        s.block_start = 0;
        s.insert = 0;
      }
      tmpDict = new utils2.Buf8(s.w_size);
      utils2.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
      dictionary = tmpDict;
      dictLength = s.w_size;
    }
    avail = strm.avail_in;
    next = strm.next_in;
    input = strm.input;
    strm.avail_in = dictLength;
    strm.next_in = 0;
    strm.input = dictionary;
    fill_window(s);
    while (s.lookahead >= MIN_MATCH) {
      str = s.strstart;
      n = s.lookahead - (MIN_MATCH - 1);
      do {
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
      } while (--n);
      s.strstart = str;
      s.lookahead = MIN_MATCH - 1;
      fill_window(s);
    }
    s.strstart += s.lookahead;
    s.block_start = s.strstart;
    s.insert = s.lookahead;
    s.lookahead = 0;
    s.match_length = s.prev_length = MIN_MATCH - 1;
    s.match_available = 0;
    strm.next_in = next;
    strm.input = input;
    strm.avail_in = avail;
    s.wrap = wrap;
    return Z_OK;
  }
  deflate.deflateInit = deflateInit;
  deflate.deflateInit2 = deflateInit2;
  deflate.deflateReset = deflateReset;
  deflate.deflateResetKeep = deflateResetKeep;
  deflate.deflateSetHeader = deflateSetHeader;
  deflate.deflate = deflate$12;
  deflate.deflateEnd = deflateEnd;
  deflate.deflateSetDictionary = deflateSetDictionary;
  deflate.deflateInfo = "pako deflate (from Nodeca project)";
  return deflate;
}
var strings = {};
var hasRequiredStrings;
function requireStrings() {
  if (hasRequiredStrings) return strings;
  hasRequiredStrings = 1;
  var utils2 = requireCommon();
  var STR_APPLY_OK = true;
  var STR_APPLY_UIA_OK = true;
  try {
    String.fromCharCode.apply(null, [0]);
  } catch (__) {
    STR_APPLY_OK = false;
  }
  try {
    String.fromCharCode.apply(null, new Uint8Array(1));
  } catch (__) {
    STR_APPLY_UIA_OK = false;
  }
  var _utf8len = new utils2.Buf8(256);
  for (var q = 0; q < 256; q++) {
    _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
  }
  _utf8len[254] = _utf8len[254] = 1;
  strings.string2buf = function(str) {
    var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
    for (m_pos = 0; m_pos < str_len; m_pos++) {
      c = str.charCodeAt(m_pos);
      if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
        c2 = str.charCodeAt(m_pos + 1);
        if ((c2 & 64512) === 56320) {
          c = 65536 + (c - 55296 << 10) + (c2 - 56320);
          m_pos++;
        }
      }
      buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
    }
    buf = new utils2.Buf8(buf_len);
    for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
      c = str.charCodeAt(m_pos);
      if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
        c2 = str.charCodeAt(m_pos + 1);
        if ((c2 & 64512) === 56320) {
          c = 65536 + (c - 55296 << 10) + (c2 - 56320);
          m_pos++;
        }
      }
      if (c < 128) {
        buf[i++] = c;
      } else if (c < 2048) {
        buf[i++] = 192 | c >>> 6;
        buf[i++] = 128 | c & 63;
      } else if (c < 65536) {
        buf[i++] = 224 | c >>> 12;
        buf[i++] = 128 | c >>> 6 & 63;
        buf[i++] = 128 | c & 63;
      } else {
        buf[i++] = 240 | c >>> 18;
        buf[i++] = 128 | c >>> 12 & 63;
        buf[i++] = 128 | c >>> 6 & 63;
        buf[i++] = 128 | c & 63;
      }
    }
    return buf;
  };
  function buf2binstring(buf, len) {
    if (len < 65534) {
      if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
        return String.fromCharCode.apply(null, utils2.shrinkBuf(buf, len));
      }
    }
    var result = "";
    for (var i = 0; i < len; i++) {
      result += String.fromCharCode(buf[i]);
    }
    return result;
  }
  strings.buf2binstring = function(buf) {
    return buf2binstring(buf, buf.length);
  };
  strings.binstring2buf = function(str) {
    var buf = new utils2.Buf8(str.length);
    for (var i = 0, len = buf.length; i < len; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  };
  strings.buf2string = function(buf, max) {
    var i, out, c, c_len;
    var len = max || buf.length;
    var utf16buf = new Array(len * 2);
    for (out = 0, i = 0; i < len; ) {
      c = buf[i++];
      if (c < 128) {
        utf16buf[out++] = c;
        continue;
      }
      c_len = _utf8len[c];
      if (c_len > 4) {
        utf16buf[out++] = 65533;
        i += c_len - 1;
        continue;
      }
      c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
      while (c_len > 1 && i < len) {
        c = c << 6 | buf[i++] & 63;
        c_len--;
      }
      if (c_len > 1) {
        utf16buf[out++] = 65533;
        continue;
      }
      if (c < 65536) {
        utf16buf[out++] = c;
      } else {
        c -= 65536;
        utf16buf[out++] = 55296 | c >> 10 & 1023;
        utf16buf[out++] = 56320 | c & 1023;
      }
    }
    return buf2binstring(utf16buf, out);
  };
  strings.utf8border = function(buf, max) {
    var pos;
    max = max || buf.length;
    if (max > buf.length) {
      max = buf.length;
    }
    pos = max - 1;
    while (pos >= 0 && (buf[pos] & 192) === 128) {
      pos--;
    }
    if (pos < 0) {
      return max;
    }
    if (pos === 0) {
      return max;
    }
    return pos + _utf8len[buf[pos]] > max ? pos : max;
  };
  return strings;
}
var zstream;
var hasRequiredZstream;
function requireZstream() {
  if (hasRequiredZstream) return zstream;
  hasRequiredZstream = 1;
  function ZStream() {
    this.input = null;
    this.next_in = 0;
    this.avail_in = 0;
    this.total_in = 0;
    this.output = null;
    this.next_out = 0;
    this.avail_out = 0;
    this.total_out = 0;
    this.msg = "";
    this.state = null;
    this.data_type = 2;
    this.adler = 0;
  }
  zstream = ZStream;
  return zstream;
}
var hasRequiredDeflate;
function requireDeflate() {
  if (hasRequiredDeflate) return deflate$1;
  hasRequiredDeflate = 1;
  var zlib_deflate = requireDeflate$1();
  var utils2 = requireCommon();
  var strings2 = requireStrings();
  var msg = requireMessages();
  var ZStream = requireZstream();
  var toString = Object.prototype.toString;
  var Z_NO_FLUSH = 0;
  var Z_FINISH = 4;
  var Z_OK = 0;
  var Z_STREAM_END = 1;
  var Z_SYNC_FLUSH = 2;
  var Z_DEFAULT_COMPRESSION = -1;
  var Z_DEFAULT_STRATEGY = 0;
  var Z_DEFLATED = 8;
  function Deflate(options) {
    if (!(this instanceof Deflate)) return new Deflate(options);
    this.options = utils2.assign({
      level: Z_DEFAULT_COMPRESSION,
      method: Z_DEFLATED,
      chunkSize: 16384,
      windowBits: 15,
      memLevel: 8,
      strategy: Z_DEFAULT_STRATEGY,
      to: ""
    }, options || {});
    var opt = this.options;
    if (opt.raw && opt.windowBits > 0) {
      opt.windowBits = -opt.windowBits;
    } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
      opt.windowBits += 16;
    }
    this.err = 0;
    this.msg = "";
    this.ended = false;
    this.chunks = [];
    this.strm = new ZStream();
    this.strm.avail_out = 0;
    var status = zlib_deflate.deflateInit2(
      this.strm,
      opt.level,
      opt.method,
      opt.windowBits,
      opt.memLevel,
      opt.strategy
    );
    if (status !== Z_OK) {
      throw new Error(msg[status]);
    }
    if (opt.header) {
      zlib_deflate.deflateSetHeader(this.strm, opt.header);
    }
    if (opt.dictionary) {
      var dict;
      if (typeof opt.dictionary === "string") {
        dict = strings2.string2buf(opt.dictionary);
      } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
        dict = new Uint8Array(opt.dictionary);
      } else {
        dict = opt.dictionary;
      }
      status = zlib_deflate.deflateSetDictionary(this.strm, dict);
      if (status !== Z_OK) {
        throw new Error(msg[status]);
      }
      this._dict_set = true;
    }
  }
  Deflate.prototype.push = function(data, mode) {
    var strm = this.strm;
    var chunkSize = this.options.chunkSize;
    var status, _mode;
    if (this.ended) {
      return false;
    }
    _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
    if (typeof data === "string") {
      strm.input = strings2.string2buf(data);
    } else if (toString.call(data) === "[object ArrayBuffer]") {
      strm.input = new Uint8Array(data);
    } else {
      strm.input = data;
    }
    strm.next_in = 0;
    strm.avail_in = strm.input.length;
    do {
      if (strm.avail_out === 0) {
        strm.output = new utils2.Buf8(chunkSize);
        strm.next_out = 0;
        strm.avail_out = chunkSize;
      }
      status = zlib_deflate.deflate(strm, _mode);
      if (status !== Z_STREAM_END && status !== Z_OK) {
        this.onEnd(status);
        this.ended = true;
        return false;
      }
      if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
        if (this.options.to === "string") {
          this.onData(strings2.buf2binstring(utils2.shrinkBuf(strm.output, strm.next_out)));
        } else {
          this.onData(utils2.shrinkBuf(strm.output, strm.next_out));
        }
      }
    } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
    if (_mode === Z_FINISH) {
      status = zlib_deflate.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK;
    }
    if (_mode === Z_SYNC_FLUSH) {
      this.onEnd(Z_OK);
      strm.avail_out = 0;
      return true;
    }
    return true;
  };
  Deflate.prototype.onData = function(chunk) {
    this.chunks.push(chunk);
  };
  Deflate.prototype.onEnd = function(status) {
    if (status === Z_OK) {
      if (this.options.to === "string") {
        this.result = this.chunks.join("");
      } else {
        this.result = utils2.flattenChunks(this.chunks);
      }
    }
    this.chunks = [];
    this.err = status;
    this.msg = this.strm.msg;
  };
  function deflate2(input, options) {
    var deflator = new Deflate(options);
    deflator.push(input, true);
    if (deflator.err) {
      throw deflator.msg || msg[deflator.err];
    }
    return deflator.result;
  }
  function deflateRaw(input, options) {
    options = options || {};
    options.raw = true;
    return deflate2(input, options);
  }
  function gzip(input, options) {
    options = options || {};
    options.gzip = true;
    return deflate2(input, options);
  }
  deflate$1.Deflate = Deflate;
  deflate$1.deflate = deflate2;
  deflate$1.deflateRaw = deflateRaw;
  deflate$1.gzip = gzip;
  return deflate$1;
}
var inflate$1 = {};
var inflate = {};
var inffast;
var hasRequiredInffast;
function requireInffast() {
  if (hasRequiredInffast) return inffast;
  hasRequiredInffast = 1;
  var BAD = 30;
  var TYPE = 12;
  inffast = function inflate_fast(strm, start) {
    var state;
    var _in;
    var last;
    var _out;
    var beg;
    var end;
    var dmax;
    var wsize;
    var whave;
    var wnext;
    var s_window;
    var hold;
    var bits;
    var lcode;
    var dcode;
    var lmask;
    var dmask;
    var here;
    var op;
    var len;
    var dist2;
    var from;
    var from_source;
    var input, output;
    state = strm.state;
    _in = strm.next_in;
    input = strm.input;
    last = _in + (strm.avail_in - 5);
    _out = strm.next_out;
    output = strm.output;
    beg = _out - (start - strm.avail_out);
    end = _out + (strm.avail_out - 257);
    dmax = state.dmax;
    wsize = state.wsize;
    whave = state.whave;
    wnext = state.wnext;
    s_window = state.window;
    hold = state.hold;
    bits = state.bits;
    lcode = state.lencode;
    dcode = state.distcode;
    lmask = (1 << state.lenbits) - 1;
    dmask = (1 << state.distbits) - 1;
    top:
      do {
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = lcode[hold & lmask];
        dolen:
          for (; ; ) {
            op = here >>> 24;
            hold >>>= op;
            bits -= op;
            op = here >>> 16 & 255;
            if (op === 0) {
              output[_out++] = here & 65535;
            } else if (op & 16) {
              len = here & 65535;
              op &= 15;
              if (op) {
                if (bits < op) {
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                len += hold & (1 << op) - 1;
                hold >>>= op;
                bits -= op;
              }
              if (bits < 15) {
                hold += input[_in++] << bits;
                bits += 8;
                hold += input[_in++] << bits;
                bits += 8;
              }
              here = dcode[hold & dmask];
              dodist:
                for (; ; ) {
                  op = here >>> 24;
                  hold >>>= op;
                  bits -= op;
                  op = here >>> 16 & 255;
                  if (op & 16) {
                    dist2 = here & 65535;
                    op &= 15;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                      }
                    }
                    dist2 += hold & (1 << op) - 1;
                    if (dist2 > dmax) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break top;
                    }
                    hold >>>= op;
                    bits -= op;
                    op = _out - beg;
                    if (dist2 > op) {
                      op = dist2 - op;
                      if (op > whave) {
                        if (state.sane) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                      }
                      from = 0;
                      from_source = s_window;
                      if (wnext === 0) {
                        from += wsize - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist2;
                          from_source = output;
                        }
                      } else if (wnext < op) {
                        from += wsize + wnext - op;
                        op -= wnext;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = 0;
                          if (wnext < len) {
                            op = wnext;
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist2;
                            from_source = output;
                          }
                        }
                      } else {
                        from += wnext - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist2;
                          from_source = output;
                        }
                      }
                      while (len > 2) {
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        len -= 3;
                      }
                      if (len) {
                        output[_out++] = from_source[from++];
                        if (len > 1) {
                          output[_out++] = from_source[from++];
                        }
                      }
                    } else {
                      from = _out - dist2;
                      do {
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        len -= 3;
                      } while (len > 2);
                      if (len) {
                        output[_out++] = output[from++];
                        if (len > 1) {
                          output[_out++] = output[from++];
                        }
                      }
                    }
                  } else if ((op & 64) === 0) {
                    here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                    continue dodist;
                  } else {
                    strm.msg = "invalid distance code";
                    state.mode = BAD;
                    break top;
                  }
                  break;
                }
            } else if ((op & 64) === 0) {
              here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
              continue dolen;
            } else if (op & 32) {
              state.mode = TYPE;
              break top;
            } else {
              strm.msg = "invalid literal/length code";
              state.mode = BAD;
              break top;
            }
            break;
          }
      } while (_in < last && _out < end);
    len = bits >> 3;
    _in -= len;
    bits -= len << 3;
    hold &= (1 << bits) - 1;
    strm.next_in = _in;
    strm.next_out = _out;
    strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
    strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
    state.hold = hold;
    state.bits = bits;
    return;
  };
  return inffast;
}
var inftrees;
var hasRequiredInftrees;
function requireInftrees() {
  if (hasRequiredInftrees) return inftrees;
  hasRequiredInftrees = 1;
  var utils2 = requireCommon();
  var MAXBITS = 15;
  var ENOUGH_LENS = 852;
  var ENOUGH_DISTS = 592;
  var CODES = 0;
  var LENS = 1;
  var DISTS = 2;
  var lbase = [
    /* Length codes 257..285 base */
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    13,
    15,
    17,
    19,
    23,
    27,
    31,
    35,
    43,
    51,
    59,
    67,
    83,
    99,
    115,
    131,
    163,
    195,
    227,
    258,
    0,
    0
  ];
  var lext = [
    /* Length codes 257..285 extra */
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    17,
    17,
    17,
    17,
    18,
    18,
    18,
    18,
    19,
    19,
    19,
    19,
    20,
    20,
    20,
    20,
    21,
    21,
    21,
    21,
    16,
    72,
    78
  ];
  var dbase = [
    /* Distance codes 0..29 base */
    1,
    2,
    3,
    4,
    5,
    7,
    9,
    13,
    17,
    25,
    33,
    49,
    65,
    97,
    129,
    193,
    257,
    385,
    513,
    769,
    1025,
    1537,
    2049,
    3073,
    4097,
    6145,
    8193,
    12289,
    16385,
    24577,
    0,
    0
  ];
  var dext = [
    /* Distance codes 0..29 extra */
    16,
    16,
    16,
    16,
    17,
    17,
    18,
    18,
    19,
    19,
    20,
    20,
    21,
    21,
    22,
    22,
    23,
    23,
    24,
    24,
    25,
    25,
    26,
    26,
    27,
    27,
    28,
    28,
    29,
    29,
    64,
    64
  ];
  inftrees = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
    var bits = opts.bits;
    var len = 0;
    var sym = 0;
    var min = 0, max = 0;
    var root = 0;
    var curr = 0;
    var drop = 0;
    var left = 0;
    var used = 0;
    var huff = 0;
    var incr;
    var fill;
    var low;
    var mask;
    var next;
    var base = null;
    var base_index = 0;
    var end;
    var count = new utils2.Buf16(MAXBITS + 1);
    var offs = new utils2.Buf16(MAXBITS + 1);
    var extra = null;
    var extra_index = 0;
    var here_bits, here_op, here_val;
    for (len = 0; len <= MAXBITS; len++) {
      count[len] = 0;
    }
    for (sym = 0; sym < codes; sym++) {
      count[lens[lens_index + sym]]++;
    }
    root = bits;
    for (max = MAXBITS; max >= 1; max--) {
      if (count[max] !== 0) {
        break;
      }
    }
    if (root > max) {
      root = max;
    }
    if (max === 0) {
      table[table_index++] = 1 << 24 | 64 << 16 | 0;
      table[table_index++] = 1 << 24 | 64 << 16 | 0;
      opts.bits = 1;
      return 0;
    }
    for (min = 1; min < max; min++) {
      if (count[min] !== 0) {
        break;
      }
    }
    if (root < min) {
      root = min;
    }
    left = 1;
    for (len = 1; len <= MAXBITS; len++) {
      left <<= 1;
      left -= count[len];
      if (left < 0) {
        return -1;
      }
    }
    if (left > 0 && (type === CODES || max !== 1)) {
      return -1;
    }
    offs[1] = 0;
    for (len = 1; len < MAXBITS; len++) {
      offs[len + 1] = offs[len] + count[len];
    }
    for (sym = 0; sym < codes; sym++) {
      if (lens[lens_index + sym] !== 0) {
        work[offs[lens[lens_index + sym]]++] = sym;
      }
    }
    if (type === CODES) {
      base = extra = work;
      end = 19;
    } else if (type === LENS) {
      base = lbase;
      base_index -= 257;
      extra = lext;
      extra_index -= 257;
      end = 256;
    } else {
      base = dbase;
      extra = dext;
      end = -1;
    }
    huff = 0;
    sym = 0;
    len = min;
    next = table_index;
    curr = root;
    drop = 0;
    low = -1;
    used = 1 << root;
    mask = used - 1;
    if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
      return 1;
    }
    for (; ; ) {
      here_bits = len - drop;
      if (work[sym] < end) {
        here_op = 0;
        here_val = work[sym];
      } else if (work[sym] > end) {
        here_op = extra[extra_index + work[sym]];
        here_val = base[base_index + work[sym]];
      } else {
        here_op = 32 + 64;
        here_val = 0;
      }
      incr = 1 << len - drop;
      fill = 1 << curr;
      min = fill;
      do {
        fill -= incr;
        table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
      } while (fill !== 0);
      incr = 1 << len - 1;
      while (huff & incr) {
        incr >>= 1;
      }
      if (incr !== 0) {
        huff &= incr - 1;
        huff += incr;
      } else {
        huff = 0;
      }
      sym++;
      if (--count[len] === 0) {
        if (len === max) {
          break;
        }
        len = lens[lens_index + work[sym]];
      }
      if (len > root && (huff & mask) !== low) {
        if (drop === 0) {
          drop = root;
        }
        next += min;
        curr = len - drop;
        left = 1 << curr;
        while (curr + drop < max) {
          left -= count[curr + drop];
          if (left <= 0) {
            break;
          }
          curr++;
          left <<= 1;
        }
        used += 1 << curr;
        if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
          return 1;
        }
        low = huff & mask;
        table[low] = root << 24 | curr << 16 | next - table_index | 0;
      }
    }
    if (huff !== 0) {
      table[next + huff] = len - drop << 24 | 64 << 16 | 0;
    }
    opts.bits = root;
    return 0;
  };
  return inftrees;
}
var hasRequiredInflate$1;
function requireInflate$1() {
  if (hasRequiredInflate$1) return inflate;
  hasRequiredInflate$1 = 1;
  var utils2 = requireCommon();
  var adler32 = requireAdler32();
  var crc32 = requireCrc32();
  var inflate_fast = requireInffast();
  var inflate_table = requireInftrees();
  var CODES = 0;
  var LENS = 1;
  var DISTS = 2;
  var Z_FINISH = 4;
  var Z_BLOCK = 5;
  var Z_TREES = 6;
  var Z_OK = 0;
  var Z_STREAM_END = 1;
  var Z_NEED_DICT = 2;
  var Z_STREAM_ERROR = -2;
  var Z_DATA_ERROR = -3;
  var Z_MEM_ERROR = -4;
  var Z_BUF_ERROR = -5;
  var Z_DEFLATED = 8;
  var HEAD = 1;
  var FLAGS = 2;
  var TIME = 3;
  var OS = 4;
  var EXLEN = 5;
  var EXTRA = 6;
  var NAME = 7;
  var COMMENT = 8;
  var HCRC = 9;
  var DICTID = 10;
  var DICT = 11;
  var TYPE = 12;
  var TYPEDO = 13;
  var STORED = 14;
  var COPY_ = 15;
  var COPY = 16;
  var TABLE = 17;
  var LENLENS = 18;
  var CODELENS = 19;
  var LEN_ = 20;
  var LEN = 21;
  var LENEXT = 22;
  var DIST = 23;
  var DISTEXT = 24;
  var MATCH = 25;
  var LIT = 26;
  var CHECK = 27;
  var LENGTH = 28;
  var DONE = 29;
  var BAD = 30;
  var MEM = 31;
  var SYNC = 32;
  var ENOUGH_LENS = 852;
  var ENOUGH_DISTS = 592;
  var MAX_WBITS = 15;
  var DEF_WBITS = MAX_WBITS;
  function zswap32(q) {
    return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
  }
  function InflateState() {
    this.mode = 0;
    this.last = false;
    this.wrap = 0;
    this.havedict = false;
    this.flags = 0;
    this.dmax = 0;
    this.check = 0;
    this.total = 0;
    this.head = null;
    this.wbits = 0;
    this.wsize = 0;
    this.whave = 0;
    this.wnext = 0;
    this.window = null;
    this.hold = 0;
    this.bits = 0;
    this.length = 0;
    this.offset = 0;
    this.extra = 0;
    this.lencode = null;
    this.distcode = null;
    this.lenbits = 0;
    this.distbits = 0;
    this.ncode = 0;
    this.nlen = 0;
    this.ndist = 0;
    this.have = 0;
    this.next = null;
    this.lens = new utils2.Buf16(320);
    this.work = new utils2.Buf16(288);
    this.lendyn = null;
    this.distdyn = null;
    this.sane = 0;
    this.back = 0;
    this.was = 0;
  }
  function inflateResetKeep(strm) {
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    state = strm.state;
    strm.total_in = strm.total_out = state.total = 0;
    strm.msg = "";
    if (state.wrap) {
      strm.adler = state.wrap & 1;
    }
    state.mode = HEAD;
    state.last = 0;
    state.havedict = 0;
    state.dmax = 32768;
    state.head = null;
    state.hold = 0;
    state.bits = 0;
    state.lencode = state.lendyn = new utils2.Buf32(ENOUGH_LENS);
    state.distcode = state.distdyn = new utils2.Buf32(ENOUGH_DISTS);
    state.sane = 1;
    state.back = -1;
    return Z_OK;
  }
  function inflateReset(strm) {
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    state = strm.state;
    state.wsize = 0;
    state.whave = 0;
    state.wnext = 0;
    return inflateResetKeep(strm);
  }
  function inflateReset2(strm, windowBits) {
    var wrap;
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    state = strm.state;
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else {
      wrap = (windowBits >> 4) + 1;
      if (windowBits < 48) {
        windowBits &= 15;
      }
    }
    if (windowBits && (windowBits < 8 || windowBits > 15)) {
      return Z_STREAM_ERROR;
    }
    if (state.window !== null && state.wbits !== windowBits) {
      state.window = null;
    }
    state.wrap = wrap;
    state.wbits = windowBits;
    return inflateReset(strm);
  }
  function inflateInit2(strm, windowBits) {
    var ret;
    var state;
    if (!strm) {
      return Z_STREAM_ERROR;
    }
    state = new InflateState();
    strm.state = state;
    state.window = null;
    ret = inflateReset2(strm, windowBits);
    if (ret !== Z_OK) {
      strm.state = null;
    }
    return ret;
  }
  function inflateInit(strm) {
    return inflateInit2(strm, DEF_WBITS);
  }
  var virgin = true;
  var lenfix, distfix;
  function fixedtables(state) {
    if (virgin) {
      var sym;
      lenfix = new utils2.Buf32(512);
      distfix = new utils2.Buf32(32);
      sym = 0;
      while (sym < 144) {
        state.lens[sym++] = 8;
      }
      while (sym < 256) {
        state.lens[sym++] = 9;
      }
      while (sym < 280) {
        state.lens[sym++] = 7;
      }
      while (sym < 288) {
        state.lens[sym++] = 8;
      }
      inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
      sym = 0;
      while (sym < 32) {
        state.lens[sym++] = 5;
      }
      inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
      virgin = false;
    }
    state.lencode = lenfix;
    state.lenbits = 9;
    state.distcode = distfix;
    state.distbits = 5;
  }
  function updatewindow(strm, src, end, copy) {
    var dist2;
    var state = strm.state;
    if (state.window === null) {
      state.wsize = 1 << state.wbits;
      state.wnext = 0;
      state.whave = 0;
      state.window = new utils2.Buf8(state.wsize);
    }
    if (copy >= state.wsize) {
      utils2.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
      state.wnext = 0;
      state.whave = state.wsize;
    } else {
      dist2 = state.wsize - state.wnext;
      if (dist2 > copy) {
        dist2 = copy;
      }
      utils2.arraySet(state.window, src, end - copy, dist2, state.wnext);
      copy -= dist2;
      if (copy) {
        utils2.arraySet(state.window, src, end - copy, copy, 0);
        state.wnext = copy;
        state.whave = state.wsize;
      } else {
        state.wnext += dist2;
        if (state.wnext === state.wsize) {
          state.wnext = 0;
        }
        if (state.whave < state.wsize) {
          state.whave += dist2;
        }
      }
    }
    return 0;
  }
  function inflate$12(strm, flush) {
    var state;
    var input, output;
    var next;
    var put;
    var have, left;
    var hold;
    var bits;
    var _in, _out;
    var copy;
    var from;
    var from_source;
    var here = 0;
    var here_bits, here_op, here_val;
    var last_bits, last_op, last_val;
    var len;
    var ret;
    var hbuf = new utils2.Buf8(4);
    var opts;
    var n;
    var order = (
      /* permutation of code lengths */
      [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
    );
    if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
      return Z_STREAM_ERROR;
    }
    state = strm.state;
    if (state.mode === TYPE) {
      state.mode = TYPEDO;
    }
    put = strm.next_out;
    output = strm.output;
    left = strm.avail_out;
    next = strm.next_in;
    input = strm.input;
    have = strm.avail_in;
    hold = state.hold;
    bits = state.bits;
    _in = have;
    _out = left;
    ret = Z_OK;
    inf_leave:
      for (; ; ) {
        switch (state.mode) {
          case HEAD:
            if (state.wrap === 0) {
              state.mode = TYPEDO;
              break;
            }
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.wrap & 2 && hold === 35615) {
              state.check = 0;
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32(state.check, hbuf, 2, 0);
              hold = 0;
              bits = 0;
              state.mode = FLAGS;
              break;
            }
            state.flags = 0;
            if (state.head) {
              state.head.done = false;
            }
            if (!(state.wrap & 1) || /* check if zlib header allowed */
            (((hold & 255) << 8) + (hold >> 8)) % 31) {
              strm.msg = "incorrect header check";
              state.mode = BAD;
              break;
            }
            if ((hold & 15) !== Z_DEFLATED) {
              strm.msg = "unknown compression method";
              state.mode = BAD;
              break;
            }
            hold >>>= 4;
            bits -= 4;
            len = (hold & 15) + 8;
            if (state.wbits === 0) {
              state.wbits = len;
            } else if (len > state.wbits) {
              strm.msg = "invalid window size";
              state.mode = BAD;
              break;
            }
            state.dmax = 1 << len;
            strm.adler = state.check = 1;
            state.mode = hold & 512 ? DICTID : TYPE;
            hold = 0;
            bits = 0;
            break;
          case FLAGS:
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.flags = hold;
            if ((state.flags & 255) !== Z_DEFLATED) {
              strm.msg = "unknown compression method";
              state.mode = BAD;
              break;
            }
            if (state.flags & 57344) {
              strm.msg = "unknown header flags set";
              state.mode = BAD;
              break;
            }
            if (state.head) {
              state.head.text = hold >> 8 & 1;
            }
            if (state.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = TIME;
          /* falls through */
          case TIME:
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.head) {
              state.head.time = hold;
            }
            if (state.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              hbuf[2] = hold >>> 16 & 255;
              hbuf[3] = hold >>> 24 & 255;
              state.check = crc32(state.check, hbuf, 4, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = OS;
          /* falls through */
          case OS:
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.head) {
              state.head.xflags = hold & 255;
              state.head.os = hold >> 8;
            }
            if (state.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = EXLEN;
          /* falls through */
          case EXLEN:
            if (state.flags & 1024) {
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.length = hold;
              if (state.head) {
                state.head.extra_len = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
            } else if (state.head) {
              state.head.extra = null;
            }
            state.mode = EXTRA;
          /* falls through */
          case EXTRA:
            if (state.flags & 1024) {
              copy = state.length;
              if (copy > have) {
                copy = have;
              }
              if (copy) {
                if (state.head) {
                  len = state.head.extra_len - state.length;
                  if (!state.head.extra) {
                    state.head.extra = new Array(state.head.extra_len);
                  }
                  utils2.arraySet(
                    state.head.extra,
                    input,
                    next,
                    // extra field is limited to 65536 bytes
                    // - no need for additional size check
                    copy,
                    /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                    len
                  );
                }
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                state.length -= copy;
              }
              if (state.length) {
                break inf_leave;
              }
            }
            state.length = 0;
            state.mode = NAME;
          /* falls through */
          case NAME:
            if (state.flags & 2048) {
              if (have === 0) {
                break inf_leave;
              }
              copy = 0;
              do {
                len = input[next + copy++];
                if (state.head && len && state.length < 65536) {
                  state.head.name += String.fromCharCode(len);
                }
              } while (len && copy < have);
              if (state.flags & 512) {
                state.check = crc32(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              if (len) {
                break inf_leave;
              }
            } else if (state.head) {
              state.head.name = null;
            }
            state.length = 0;
            state.mode = COMMENT;
          /* falls through */
          case COMMENT:
            if (state.flags & 4096) {
              if (have === 0) {
                break inf_leave;
              }
              copy = 0;
              do {
                len = input[next + copy++];
                if (state.head && len && state.length < 65536) {
                  state.head.comment += String.fromCharCode(len);
                }
              } while (len && copy < have);
              if (state.flags & 512) {
                state.check = crc32(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              if (len) {
                break inf_leave;
              }
            } else if (state.head) {
              state.head.comment = null;
            }
            state.mode = HCRC;
          /* falls through */
          case HCRC:
            if (state.flags & 512) {
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (hold !== (state.check & 65535)) {
                strm.msg = "header crc mismatch";
                state.mode = BAD;
                break;
              }
              hold = 0;
              bits = 0;
            }
            if (state.head) {
              state.head.hcrc = state.flags >> 9 & 1;
              state.head.done = true;
            }
            strm.adler = state.check = 0;
            state.mode = TYPE;
            break;
          case DICTID:
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            strm.adler = state.check = zswap32(hold);
            hold = 0;
            bits = 0;
            state.mode = DICT;
          /* falls through */
          case DICT:
            if (state.havedict === 0) {
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              return Z_NEED_DICT;
            }
            strm.adler = state.check = 1;
            state.mode = TYPE;
          /* falls through */
          case TYPE:
            if (flush === Z_BLOCK || flush === Z_TREES) {
              break inf_leave;
            }
          /* falls through */
          case TYPEDO:
            if (state.last) {
              hold >>>= bits & 7;
              bits -= bits & 7;
              state.mode = CHECK;
              break;
            }
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.last = hold & 1;
            hold >>>= 1;
            bits -= 1;
            switch (hold & 3) {
              case 0:
                state.mode = STORED;
                break;
              case 1:
                fixedtables(state);
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  hold >>>= 2;
                  bits -= 2;
                  break inf_leave;
                }
                break;
              case 2:
                state.mode = TABLE;
                break;
              case 3:
                strm.msg = "invalid block type";
                state.mode = BAD;
            }
            hold >>>= 2;
            bits -= 2;
            break;
          case STORED:
            hold >>>= bits & 7;
            bits -= bits & 7;
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
              strm.msg = "invalid stored block lengths";
              state.mode = BAD;
              break;
            }
            state.length = hold & 65535;
            hold = 0;
            bits = 0;
            state.mode = COPY_;
            if (flush === Z_TREES) {
              break inf_leave;
            }
          /* falls through */
          case COPY_:
            state.mode = COPY;
          /* falls through */
          case COPY:
            copy = state.length;
            if (copy) {
              if (copy > have) {
                copy = have;
              }
              if (copy > left) {
                copy = left;
              }
              if (copy === 0) {
                break inf_leave;
              }
              utils2.arraySet(output, input, next, copy, put);
              have -= copy;
              next += copy;
              left -= copy;
              put += copy;
              state.length -= copy;
              break;
            }
            state.mode = TYPE;
            break;
          case TABLE:
            while (bits < 14) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.nlen = (hold & 31) + 257;
            hold >>>= 5;
            bits -= 5;
            state.ndist = (hold & 31) + 1;
            hold >>>= 5;
            bits -= 5;
            state.ncode = (hold & 15) + 4;
            hold >>>= 4;
            bits -= 4;
            if (state.nlen > 286 || state.ndist > 30) {
              strm.msg = "too many length or distance symbols";
              state.mode = BAD;
              break;
            }
            state.have = 0;
            state.mode = LENLENS;
          /* falls through */
          case LENLENS:
            while (state.have < state.ncode) {
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.lens[order[state.have++]] = hold & 7;
              hold >>>= 3;
              bits -= 3;
            }
            while (state.have < 19) {
              state.lens[order[state.have++]] = 0;
            }
            state.lencode = state.lendyn;
            state.lenbits = 7;
            opts = { bits: state.lenbits };
            ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
            state.lenbits = opts.bits;
            if (ret) {
              strm.msg = "invalid code lengths set";
              state.mode = BAD;
              break;
            }
            state.have = 0;
            state.mode = CODELENS;
          /* falls through */
          case CODELENS:
            while (state.have < state.nlen + state.ndist) {
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_val < 16) {
                hold >>>= here_bits;
                bits -= here_bits;
                state.lens[state.have++] = here_val;
              } else {
                if (here_val === 16) {
                  n = here_bits + 2;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  if (state.have === 0) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD;
                    break;
                  }
                  len = state.lens[state.have - 1];
                  copy = 3 + (hold & 3);
                  hold >>>= 2;
                  bits -= 2;
                } else if (here_val === 17) {
                  n = here_bits + 3;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  len = 0;
                  copy = 3 + (hold & 7);
                  hold >>>= 3;
                  bits -= 3;
                } else {
                  n = here_bits + 7;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  len = 0;
                  copy = 11 + (hold & 127);
                  hold >>>= 7;
                  bits -= 7;
                }
                if (state.have + copy > state.nlen + state.ndist) {
                  strm.msg = "invalid bit length repeat";
                  state.mode = BAD;
                  break;
                }
                while (copy--) {
                  state.lens[state.have++] = len;
                }
              }
            }
            if (state.mode === BAD) {
              break;
            }
            if (state.lens[256] === 0) {
              strm.msg = "invalid code -- missing end-of-block";
              state.mode = BAD;
              break;
            }
            state.lenbits = 9;
            opts = { bits: state.lenbits };
            ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
            state.lenbits = opts.bits;
            if (ret) {
              strm.msg = "invalid literal/lengths set";
              state.mode = BAD;
              break;
            }
            state.distbits = 6;
            state.distcode = state.distdyn;
            opts = { bits: state.distbits };
            ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
            state.distbits = opts.bits;
            if (ret) {
              strm.msg = "invalid distances set";
              state.mode = BAD;
              break;
            }
            state.mode = LEN_;
            if (flush === Z_TREES) {
              break inf_leave;
            }
          /* falls through */
          case LEN_:
            state.mode = LEN;
          /* falls through */
          case LEN:
            if (have >= 6 && left >= 258) {
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              inflate_fast(strm, _out);
              put = strm.next_out;
              output = strm.output;
              left = strm.avail_out;
              next = strm.next_in;
              input = strm.input;
              have = strm.avail_in;
              hold = state.hold;
              bits = state.bits;
              if (state.mode === TYPE) {
                state.back = -1;
              }
              break;
            }
            state.back = 0;
            for (; ; ) {
              here = state.lencode[hold & (1 << state.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_op && (here_op & 240) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (; ; ) {
                here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (last_bits + here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= last_bits;
              bits -= last_bits;
              state.back += last_bits;
            }
            hold >>>= here_bits;
            bits -= here_bits;
            state.back += here_bits;
            state.length = here_val;
            if (here_op === 0) {
              state.mode = LIT;
              break;
            }
            if (here_op & 32) {
              state.back = -1;
              state.mode = TYPE;
              break;
            }
            if (here_op & 64) {
              strm.msg = "invalid literal/length code";
              state.mode = BAD;
              break;
            }
            state.extra = here_op & 15;
            state.mode = LENEXT;
          /* falls through */
          case LENEXT:
            if (state.extra) {
              n = state.extra;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.length += hold & (1 << state.extra) - 1;
              hold >>>= state.extra;
              bits -= state.extra;
              state.back += state.extra;
            }
            state.was = state.length;
            state.mode = DIST;
          /* falls through */
          case DIST:
            for (; ; ) {
              here = state.distcode[hold & (1 << state.distbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if ((here_op & 240) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (; ; ) {
                here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (last_bits + here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= last_bits;
              bits -= last_bits;
              state.back += last_bits;
            }
            hold >>>= here_bits;
            bits -= here_bits;
            state.back += here_bits;
            if (here_op & 64) {
              strm.msg = "invalid distance code";
              state.mode = BAD;
              break;
            }
            state.offset = here_val;
            state.extra = here_op & 15;
            state.mode = DISTEXT;
          /* falls through */
          case DISTEXT:
            if (state.extra) {
              n = state.extra;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.offset += hold & (1 << state.extra) - 1;
              hold >>>= state.extra;
              bits -= state.extra;
              state.back += state.extra;
            }
            if (state.offset > state.dmax) {
              strm.msg = "invalid distance too far back";
              state.mode = BAD;
              break;
            }
            state.mode = MATCH;
          /* falls through */
          case MATCH:
            if (left === 0) {
              break inf_leave;
            }
            copy = _out - left;
            if (state.offset > copy) {
              copy = state.offset - copy;
              if (copy > state.whave) {
                if (state.sane) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
              }
              if (copy > state.wnext) {
                copy -= state.wnext;
                from = state.wsize - copy;
              } else {
                from = state.wnext - copy;
              }
              if (copy > state.length) {
                copy = state.length;
              }
              from_source = state.window;
            } else {
              from_source = output;
              from = put - state.offset;
              copy = state.length;
            }
            if (copy > left) {
              copy = left;
            }
            left -= copy;
            state.length -= copy;
            do {
              output[put++] = from_source[from++];
            } while (--copy);
            if (state.length === 0) {
              state.mode = LEN;
            }
            break;
          case LIT:
            if (left === 0) {
              break inf_leave;
            }
            output[put++] = state.length;
            left--;
            state.mode = LEN;
            break;
          case CHECK:
            if (state.wrap) {
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold |= input[next++] << bits;
                bits += 8;
              }
              _out -= left;
              strm.total_out += _out;
              state.total += _out;
              if (_out) {
                strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
              }
              _out = left;
              if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                strm.msg = "incorrect data check";
                state.mode = BAD;
                break;
              }
              hold = 0;
              bits = 0;
            }
            state.mode = LENGTH;
          /* falls through */
          case LENGTH:
            if (state.wrap && state.flags) {
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (hold !== (state.total & 4294967295)) {
                strm.msg = "incorrect length check";
                state.mode = BAD;
                break;
              }
              hold = 0;
              bits = 0;
            }
            state.mode = DONE;
          /* falls through */
          case DONE:
            ret = Z_STREAM_END;
            break inf_leave;
          case BAD:
            ret = Z_DATA_ERROR;
            break inf_leave;
          case MEM:
            return Z_MEM_ERROR;
          case SYNC:
          /* falls through */
          default:
            return Z_STREAM_ERROR;
        }
      }
    strm.next_out = put;
    strm.avail_out = left;
    strm.next_in = next;
    strm.avail_in = have;
    state.hold = hold;
    state.bits = bits;
    if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
      if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
    }
    _in -= strm.avail_in;
    _out -= strm.avail_out;
    strm.total_in += _in;
    strm.total_out += _out;
    state.total += _out;
    if (state.wrap && _out) {
      strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
    }
    strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
    if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
      ret = Z_BUF_ERROR;
    }
    return ret;
  }
  function inflateEnd(strm) {
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    var state = strm.state;
    if (state.window) {
      state.window = null;
    }
    strm.state = null;
    return Z_OK;
  }
  function inflateGetHeader(strm, head) {
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    state = strm.state;
    if ((state.wrap & 2) === 0) {
      return Z_STREAM_ERROR;
    }
    state.head = head;
    head.done = false;
    return Z_OK;
  }
  function inflateSetDictionary(strm, dictionary) {
    var dictLength = dictionary.length;
    var state;
    var dictid;
    var ret;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    state = strm.state;
    if (state.wrap !== 0 && state.mode !== DICT) {
      return Z_STREAM_ERROR;
    }
    if (state.mode === DICT) {
      dictid = 1;
      dictid = adler32(dictid, dictionary, dictLength, 0);
      if (dictid !== state.check) {
        return Z_DATA_ERROR;
      }
    }
    ret = updatewindow(strm, dictionary, dictLength, dictLength);
    if (ret) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
    state.havedict = 1;
    return Z_OK;
  }
  inflate.inflateReset = inflateReset;
  inflate.inflateReset2 = inflateReset2;
  inflate.inflateResetKeep = inflateResetKeep;
  inflate.inflateInit = inflateInit;
  inflate.inflateInit2 = inflateInit2;
  inflate.inflate = inflate$12;
  inflate.inflateEnd = inflateEnd;
  inflate.inflateGetHeader = inflateGetHeader;
  inflate.inflateSetDictionary = inflateSetDictionary;
  inflate.inflateInfo = "pako inflate (from Nodeca project)";
  return inflate;
}
var constants;
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  constants = {
    /* Allowed flush values; see deflate() and inflate() below for details */
    Z_NO_FLUSH: 0,
    Z_PARTIAL_FLUSH: 1,
    Z_SYNC_FLUSH: 2,
    Z_FULL_FLUSH: 3,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_TREES: 6,
    /* Return codes for the compression/decompression functions. Negative values
    * are errors, positive values are used for special but normal events.
    */
    Z_OK: 0,
    Z_STREAM_END: 1,
    Z_NEED_DICT: 2,
    Z_ERRNO: -1,
    Z_STREAM_ERROR: -2,
    Z_DATA_ERROR: -3,
    //Z_MEM_ERROR:     -4,
    Z_BUF_ERROR: -5,
    //Z_VERSION_ERROR: -6,
    /* compression levels */
    Z_NO_COMPRESSION: 0,
    Z_BEST_SPEED: 1,
    Z_BEST_COMPRESSION: 9,
    Z_DEFAULT_COMPRESSION: -1,
    Z_FILTERED: 1,
    Z_HUFFMAN_ONLY: 2,
    Z_RLE: 3,
    Z_FIXED: 4,
    Z_DEFAULT_STRATEGY: 0,
    /* Possible values of the data_type field (though see inflate()) */
    Z_BINARY: 0,
    Z_TEXT: 1,
    //Z_ASCII:                1, // = Z_TEXT (deprecated)
    Z_UNKNOWN: 2,
    /* The deflate compression method */
    Z_DEFLATED: 8
    //Z_NULL:                 null // Use -1 or null inline, depending on var type
  };
  return constants;
}
var gzheader;
var hasRequiredGzheader;
function requireGzheader() {
  if (hasRequiredGzheader) return gzheader;
  hasRequiredGzheader = 1;
  function GZheader() {
    this.text = 0;
    this.time = 0;
    this.xflags = 0;
    this.os = 0;
    this.extra = null;
    this.extra_len = 0;
    this.name = "";
    this.comment = "";
    this.hcrc = 0;
    this.done = false;
  }
  gzheader = GZheader;
  return gzheader;
}
var hasRequiredInflate;
function requireInflate() {
  if (hasRequiredInflate) return inflate$1;
  hasRequiredInflate = 1;
  var zlib_inflate = requireInflate$1();
  var utils2 = requireCommon();
  var strings2 = requireStrings();
  var c = requireConstants();
  var msg = requireMessages();
  var ZStream = requireZstream();
  var GZheader = requireGzheader();
  var toString = Object.prototype.toString;
  function Inflate(options) {
    if (!(this instanceof Inflate)) return new Inflate(options);
    this.options = utils2.assign({
      chunkSize: 16384,
      windowBits: 0,
      to: ""
    }, options || {});
    var opt = this.options;
    if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
      opt.windowBits = -opt.windowBits;
      if (opt.windowBits === 0) {
        opt.windowBits = -15;
      }
    }
    if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
      opt.windowBits += 32;
    }
    if (opt.windowBits > 15 && opt.windowBits < 48) {
      if ((opt.windowBits & 15) === 0) {
        opt.windowBits |= 15;
      }
    }
    this.err = 0;
    this.msg = "";
    this.ended = false;
    this.chunks = [];
    this.strm = new ZStream();
    this.strm.avail_out = 0;
    var status = zlib_inflate.inflateInit2(
      this.strm,
      opt.windowBits
    );
    if (status !== c.Z_OK) {
      throw new Error(msg[status]);
    }
    this.header = new GZheader();
    zlib_inflate.inflateGetHeader(this.strm, this.header);
    if (opt.dictionary) {
      if (typeof opt.dictionary === "string") {
        opt.dictionary = strings2.string2buf(opt.dictionary);
      } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
        opt.dictionary = new Uint8Array(opt.dictionary);
      }
      if (opt.raw) {
        status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
        if (status !== c.Z_OK) {
          throw new Error(msg[status]);
        }
      }
    }
  }
  Inflate.prototype.push = function(data, mode) {
    var strm = this.strm;
    var chunkSize = this.options.chunkSize;
    var dictionary = this.options.dictionary;
    var status, _mode;
    var next_out_utf8, tail, utf8str;
    var allowBufError = false;
    if (this.ended) {
      return false;
    }
    _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
    if (typeof data === "string") {
      strm.input = strings2.binstring2buf(data);
    } else if (toString.call(data) === "[object ArrayBuffer]") {
      strm.input = new Uint8Array(data);
    } else {
      strm.input = data;
    }
    strm.next_in = 0;
    strm.avail_in = strm.input.length;
    do {
      if (strm.avail_out === 0) {
        strm.output = new utils2.Buf8(chunkSize);
        strm.next_out = 0;
        strm.avail_out = chunkSize;
      }
      status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
      if (status === c.Z_NEED_DICT && dictionary) {
        status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
      }
      if (status === c.Z_BUF_ERROR && allowBufError === true) {
        status = c.Z_OK;
        allowBufError = false;
      }
      if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
        this.onEnd(status);
        this.ended = true;
        return false;
      }
      if (strm.next_out) {
        if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
          if (this.options.to === "string") {
            next_out_utf8 = strings2.utf8border(strm.output, strm.next_out);
            tail = strm.next_out - next_out_utf8;
            utf8str = strings2.buf2string(strm.output, next_out_utf8);
            strm.next_out = tail;
            strm.avail_out = chunkSize - tail;
            if (tail) {
              utils2.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
            }
            this.onData(utf8str);
          } else {
            this.onData(utils2.shrinkBuf(strm.output, strm.next_out));
          }
        }
      }
      if (strm.avail_in === 0 && strm.avail_out === 0) {
        allowBufError = true;
      }
    } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
    if (status === c.Z_STREAM_END) {
      _mode = c.Z_FINISH;
    }
    if (_mode === c.Z_FINISH) {
      status = zlib_inflate.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === c.Z_OK;
    }
    if (_mode === c.Z_SYNC_FLUSH) {
      this.onEnd(c.Z_OK);
      strm.avail_out = 0;
      return true;
    }
    return true;
  };
  Inflate.prototype.onData = function(chunk) {
    this.chunks.push(chunk);
  };
  Inflate.prototype.onEnd = function(status) {
    if (status === c.Z_OK) {
      if (this.options.to === "string") {
        this.result = this.chunks.join("");
      } else {
        this.result = utils2.flattenChunks(this.chunks);
      }
    }
    this.chunks = [];
    this.err = status;
    this.msg = this.strm.msg;
  };
  function inflate2(input, options) {
    var inflator = new Inflate(options);
    inflator.push(input, true);
    if (inflator.err) {
      throw inflator.msg || msg[inflator.err];
    }
    return inflator.result;
  }
  function inflateRaw(input, options) {
    options = options || {};
    options.raw = true;
    return inflate2(input, options);
  }
  inflate$1.Inflate = Inflate;
  inflate$1.inflate = inflate2;
  inflate$1.inflateRaw = inflateRaw;
  inflate$1.ungzip = inflate2;
  return inflate$1;
}
var pako_1;
var hasRequiredPako;
function requirePako() {
  if (hasRequiredPako) return pako_1;
  hasRequiredPako = 1;
  var assign = requireCommon().assign;
  var deflate2 = requireDeflate();
  var inflate2 = requireInflate();
  var constants2 = requireConstants();
  var pako = {};
  assign(pako, deflate2, inflate2, constants2);
  pako_1 = pako;
  return pako_1;
}
var hasRequiredFlate;
function requireFlate() {
  if (hasRequiredFlate) return flate;
  hasRequiredFlate = 1;
  var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined";
  var pako = requirePako();
  var utils2 = requireUtils();
  var GenericWorker = requireGenericWorker();
  var ARRAY_TYPE = USE_TYPEDARRAY ? "uint8array" : "array";
  flate.magic = "\b\0";
  function FlateWorker(action, options) {
    GenericWorker.call(this, "FlateWorker/" + action);
    this._pako = null;
    this._pakoAction = action;
    this._pakoOptions = options;
    this.meta = {};
  }
  utils2.inherits(FlateWorker, GenericWorker);
  FlateWorker.prototype.processChunk = function(chunk) {
    this.meta = chunk.meta;
    if (this._pako === null) {
      this._createPako();
    }
    this._pako.push(utils2.transformTo(ARRAY_TYPE, chunk.data), false);
  };
  FlateWorker.prototype.flush = function() {
    GenericWorker.prototype.flush.call(this);
    if (this._pako === null) {
      this._createPako();
    }
    this._pako.push([], true);
  };
  FlateWorker.prototype.cleanUp = function() {
    GenericWorker.prototype.cleanUp.call(this);
    this._pako = null;
  };
  FlateWorker.prototype._createPako = function() {
    this._pako = new pako[this._pakoAction]({
      raw: true,
      level: this._pakoOptions.level || -1
      // default compression
    });
    var self2 = this;
    this._pako.onData = function(data) {
      self2.push({
        data,
        meta: self2.meta
      });
    };
  };
  flate.compressWorker = function(compressionOptions) {
    return new FlateWorker("Deflate", compressionOptions);
  };
  flate.uncompressWorker = function() {
    return new FlateWorker("Inflate", {});
  };
  return flate;
}
var hasRequiredCompressions;
function requireCompressions() {
  if (hasRequiredCompressions) return compressions;
  hasRequiredCompressions = 1;
  var GenericWorker = requireGenericWorker();
  compressions.STORE = {
    magic: "\0\0",
    compressWorker: function() {
      return new GenericWorker("STORE compression");
    },
    uncompressWorker: function() {
      return new GenericWorker("STORE decompression");
    }
  };
  compressions.DEFLATE = requireFlate();
  return compressions;
}
var signature = {};
var hasRequiredSignature;
function requireSignature() {
  if (hasRequiredSignature) return signature;
  hasRequiredSignature = 1;
  signature.LOCAL_FILE_HEADER = "PK";
  signature.CENTRAL_FILE_HEADER = "PK";
  signature.CENTRAL_DIRECTORY_END = "PK";
  signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07";
  signature.ZIP64_CENTRAL_DIRECTORY_END = "PK";
  signature.DATA_DESCRIPTOR = "PK\x07\b";
  return signature;
}
var ZipFileWorker_1;
var hasRequiredZipFileWorker;
function requireZipFileWorker() {
  if (hasRequiredZipFileWorker) return ZipFileWorker_1;
  hasRequiredZipFileWorker = 1;
  var utils2 = requireUtils();
  var GenericWorker = requireGenericWorker();
  var utf82 = requireUtf8();
  var crc32 = requireCrc32$1();
  var signature2 = requireSignature();
  var decToHex = function(dec, bytes) {
    var hex = "", i;
    for (i = 0; i < bytes; i++) {
      hex += String.fromCharCode(dec & 255);
      dec = dec >>> 8;
    }
    return hex;
  };
  var generateUnixExternalFileAttr = function(unixPermissions, isDir) {
    var result = unixPermissions;
    if (!unixPermissions) {
      result = isDir ? 16893 : 33204;
    }
    return (result & 65535) << 16;
  };
  var generateDosExternalFileAttr = function(dosPermissions) {
    return (dosPermissions || 0) & 63;
  };
  var generateZipParts = function(streamInfo, streamedContent, streamingEnded, offset, platform, encodeFileName) {
    var file = streamInfo["file"], compression = streamInfo["compression"], useCustomEncoding = encodeFileName !== utf82.utf8encode, encodedFileName = utils2.transformTo("string", encodeFileName(file.name)), utfEncodedFileName = utils2.transformTo("string", utf82.utf8encode(file.name)), comment = file.comment, encodedComment = utils2.transformTo("string", encodeFileName(comment)), utfEncodedComment = utils2.transformTo("string", utf82.utf8encode(comment)), useUTF8ForFileName = utfEncodedFileName.length !== file.name.length, useUTF8ForComment = utfEncodedComment.length !== comment.length, dosTime, dosDate, extraFields = "", unicodePathExtraField = "", unicodeCommentExtraField = "", dir = file.dir, date = file.date;
    var dataInfo = {
      crc32: 0,
      compressedSize: 0,
      uncompressedSize: 0
    };
    if (!streamedContent || streamingEnded) {
      dataInfo.crc32 = streamInfo["crc32"];
      dataInfo.compressedSize = streamInfo["compressedSize"];
      dataInfo.uncompressedSize = streamInfo["uncompressedSize"];
    }
    var bitflag = 0;
    if (streamedContent) {
      bitflag |= 8;
    }
    if (!useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment)) {
      bitflag |= 2048;
    }
    var extFileAttr = 0;
    var versionMadeBy = 0;
    if (dir) {
      extFileAttr |= 16;
    }
    if (platform === "UNIX") {
      versionMadeBy = 798;
      extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
    } else {
      versionMadeBy = 20;
      extFileAttr |= generateDosExternalFileAttr(file.dosPermissions);
    }
    dosTime = date.getUTCHours();
    dosTime = dosTime << 6;
    dosTime = dosTime | date.getUTCMinutes();
    dosTime = dosTime << 5;
    dosTime = dosTime | date.getUTCSeconds() / 2;
    dosDate = date.getUTCFullYear() - 1980;
    dosDate = dosDate << 4;
    dosDate = dosDate | date.getUTCMonth() + 1;
    dosDate = dosDate << 5;
    dosDate = dosDate | date.getUTCDate();
    if (useUTF8ForFileName) {
      unicodePathExtraField = // Version
      decToHex(1, 1) + // NameCRC32
      decToHex(crc32(encodedFileName), 4) + // UnicodeName
      utfEncodedFileName;
      extraFields += // Info-ZIP Unicode Path Extra Field
      "up" + // size
      decToHex(unicodePathExtraField.length, 2) + // content
      unicodePathExtraField;
    }
    if (useUTF8ForComment) {
      unicodeCommentExtraField = // Version
      decToHex(1, 1) + // CommentCRC32
      decToHex(crc32(encodedComment), 4) + // UnicodeName
      utfEncodedComment;
      extraFields += // Info-ZIP Unicode Path Extra Field
      "uc" + // size
      decToHex(unicodeCommentExtraField.length, 2) + // content
      unicodeCommentExtraField;
    }
    var header = "";
    header += "\n\0";
    header += decToHex(bitflag, 2);
    header += compression.magic;
    header += decToHex(dosTime, 2);
    header += decToHex(dosDate, 2);
    header += decToHex(dataInfo.crc32, 4);
    header += decToHex(dataInfo.compressedSize, 4);
    header += decToHex(dataInfo.uncompressedSize, 4);
    header += decToHex(encodedFileName.length, 2);
    header += decToHex(extraFields.length, 2);
    var fileRecord = signature2.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;
    var dirRecord = signature2.CENTRAL_FILE_HEADER + // version made by (00: DOS)
    decToHex(versionMadeBy, 2) + // file header (common to file and central directory)
    header + // file comment length
    decToHex(encodedComment.length, 2) + // disk number start
    "\0\0\0\0" + // external file attributes
    decToHex(extFileAttr, 4) + // relative offset of local header
    decToHex(offset, 4) + // file name
    encodedFileName + // extra field
    extraFields + // file comment
    encodedComment;
    return {
      fileRecord,
      dirRecord
    };
  };
  var generateCentralDirectoryEnd = function(entriesCount, centralDirLength, localDirLength, comment, encodeFileName) {
    var dirEnd = "";
    var encodedComment = utils2.transformTo("string", encodeFileName(comment));
    dirEnd = signature2.CENTRAL_DIRECTORY_END + // number of this disk
    "\0\0\0\0" + // total number of entries in the central directory on this disk
    decToHex(entriesCount, 2) + // total number of entries in the central directory
    decToHex(entriesCount, 2) + // size of the central directory   4 bytes
    decToHex(centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number
    decToHex(localDirLength, 4) + // .ZIP file comment length
    decToHex(encodedComment.length, 2) + // .ZIP file comment
    encodedComment;
    return dirEnd;
  };
  var generateDataDescriptors = function(streamInfo) {
    var descriptor = "";
    descriptor = signature2.DATA_DESCRIPTOR + // crc-32                          4 bytes
    decToHex(streamInfo["crc32"], 4) + // compressed size                 4 bytes
    decToHex(streamInfo["compressedSize"], 4) + // uncompressed size               4 bytes
    decToHex(streamInfo["uncompressedSize"], 4);
    return descriptor;
  };
  function ZipFileWorker(streamFiles, comment, platform, encodeFileName) {
    GenericWorker.call(this, "ZipFileWorker");
    this.bytesWritten = 0;
    this.zipComment = comment;
    this.zipPlatform = platform;
    this.encodeFileName = encodeFileName;
    this.streamFiles = streamFiles;
    this.accumulate = false;
    this.contentBuffer = [];
    this.dirRecords = [];
    this.currentSourceOffset = 0;
    this.entriesCount = 0;
    this.currentFile = null;
    this._sources = [];
  }
  utils2.inherits(ZipFileWorker, GenericWorker);
  ZipFileWorker.prototype.push = function(chunk) {
    var currentFilePercent = chunk.meta.percent || 0;
    var entriesCount = this.entriesCount;
    var remainingFiles = this._sources.length;
    if (this.accumulate) {
      this.contentBuffer.push(chunk);
    } else {
      this.bytesWritten += chunk.data.length;
      GenericWorker.prototype.push.call(this, {
        data: chunk.data,
        meta: {
          currentFile: this.currentFile,
          percent: entriesCount ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) / entriesCount : 100
        }
      });
    }
  };
  ZipFileWorker.prototype.openedSource = function(streamInfo) {
    this.currentSourceOffset = this.bytesWritten;
    this.currentFile = streamInfo["file"].name;
    var streamedContent = this.streamFiles && !streamInfo["file"].dir;
    if (streamedContent) {
      var record = generateZipParts(streamInfo, streamedContent, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
      this.push({
        data: record.fileRecord,
        meta: { percent: 0 }
      });
    } else {
      this.accumulate = true;
    }
  };
  ZipFileWorker.prototype.closedSource = function(streamInfo) {
    this.accumulate = false;
    var streamedContent = this.streamFiles && !streamInfo["file"].dir;
    var record = generateZipParts(streamInfo, streamedContent, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
    this.dirRecords.push(record.dirRecord);
    if (streamedContent) {
      this.push({
        data: generateDataDescriptors(streamInfo),
        meta: { percent: 100 }
      });
    } else {
      this.push({
        data: record.fileRecord,
        meta: { percent: 0 }
      });
      while (this.contentBuffer.length) {
        this.push(this.contentBuffer.shift());
      }
    }
    this.currentFile = null;
  };
  ZipFileWorker.prototype.flush = function() {
    var localDirLength = this.bytesWritten;
    for (var i = 0; i < this.dirRecords.length; i++) {
      this.push({
        data: this.dirRecords[i],
        meta: { percent: 100 }
      });
    }
    var centralDirLength = this.bytesWritten - localDirLength;
    var dirEnd = generateCentralDirectoryEnd(this.dirRecords.length, centralDirLength, localDirLength, this.zipComment, this.encodeFileName);
    this.push({
      data: dirEnd,
      meta: { percent: 100 }
    });
  };
  ZipFileWorker.prototype.prepareNextSource = function() {
    this.previous = this._sources.shift();
    this.openedSource(this.previous.streamInfo);
    if (this.isPaused) {
      this.previous.pause();
    } else {
      this.previous.resume();
    }
  };
  ZipFileWorker.prototype.registerPrevious = function(previous) {
    this._sources.push(previous);
    var self2 = this;
    previous.on("data", function(chunk) {
      self2.processChunk(chunk);
    });
    previous.on("end", function() {
      self2.closedSource(self2.previous.streamInfo);
      if (self2._sources.length) {
        self2.prepareNextSource();
      } else {
        self2.end();
      }
    });
    previous.on("error", function(e) {
      self2.error(e);
    });
    return this;
  };
  ZipFileWorker.prototype.resume = function() {
    if (!GenericWorker.prototype.resume.call(this)) {
      return false;
    }
    if (!this.previous && this._sources.length) {
      this.prepareNextSource();
      return true;
    }
    if (!this.previous && !this._sources.length && !this.generatedError) {
      this.end();
      return true;
    }
  };
  ZipFileWorker.prototype.error = function(e) {
    var sources = this._sources;
    if (!GenericWorker.prototype.error.call(this, e)) {
      return false;
    }
    for (var i = 0; i < sources.length; i++) {
      try {
        sources[i].error(e);
      } catch (e2) {
      }
    }
    return true;
  };
  ZipFileWorker.prototype.lock = function() {
    GenericWorker.prototype.lock.call(this);
    var sources = this._sources;
    for (var i = 0; i < sources.length; i++) {
      sources[i].lock();
    }
  };
  ZipFileWorker_1 = ZipFileWorker;
  return ZipFileWorker_1;
}
var hasRequiredGenerate;
function requireGenerate() {
  if (hasRequiredGenerate) return generate;
  hasRequiredGenerate = 1;
  var compressions2 = requireCompressions();
  var ZipFileWorker = requireZipFileWorker();
  var getCompression = function(fileCompression, zipCompression) {
    var compressionName = fileCompression || zipCompression;
    var compression = compressions2[compressionName];
    if (!compression) {
      throw new Error(compressionName + " is not a valid compression method !");
    }
    return compression;
  };
  generate.generateWorker = function(zip, options, comment) {
    var zipFileWorker = new ZipFileWorker(options.streamFiles, comment, options.platform, options.encodeFileName);
    var entriesCount = 0;
    try {
      zip.forEach(function(relativePath, file) {
        entriesCount++;
        var compression = getCompression(file.options.compression, options.compression);
        var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
        var dir = file.dir, date = file.date;
        file._compressWorker(compression, compressionOptions).withStreamInfo("file", {
          name: relativePath,
          dir,
          date,
          comment: file.comment || "",
          unixPermissions: file.unixPermissions,
          dosPermissions: file.dosPermissions
        }).pipe(zipFileWorker);
      });
      zipFileWorker.entriesCount = entriesCount;
    } catch (e) {
      zipFileWorker.error(e);
    }
    return zipFileWorker;
  };
  return generate;
}
var NodejsStreamInputAdapter_1;
var hasRequiredNodejsStreamInputAdapter;
function requireNodejsStreamInputAdapter() {
  if (hasRequiredNodejsStreamInputAdapter) return NodejsStreamInputAdapter_1;
  hasRequiredNodejsStreamInputAdapter = 1;
  var utils2 = requireUtils();
  var GenericWorker = requireGenericWorker();
  function NodejsStreamInputAdapter(filename, stream2) {
    GenericWorker.call(this, "Nodejs stream input adapter for " + filename);
    this._upstreamEnded = false;
    this._bindStream(stream2);
  }
  utils2.inherits(NodejsStreamInputAdapter, GenericWorker);
  NodejsStreamInputAdapter.prototype._bindStream = function(stream2) {
    var self2 = this;
    this._stream = stream2;
    stream2.pause();
    stream2.on("data", function(chunk) {
      self2.push({
        data: chunk,
        meta: {
          percent: 0
        }
      });
    }).on("error", function(e) {
      if (self2.isPaused) {
        this.generatedError = e;
      } else {
        self2.error(e);
      }
    }).on("end", function() {
      if (self2.isPaused) {
        self2._upstreamEnded = true;
      } else {
        self2.end();
      }
    });
  };
  NodejsStreamInputAdapter.prototype.pause = function() {
    if (!GenericWorker.prototype.pause.call(this)) {
      return false;
    }
    this._stream.pause();
    return true;
  };
  NodejsStreamInputAdapter.prototype.resume = function() {
    if (!GenericWorker.prototype.resume.call(this)) {
      return false;
    }
    if (this._upstreamEnded) {
      this.end();
    } else {
      this._stream.resume();
    }
    return true;
  };
  NodejsStreamInputAdapter_1 = NodejsStreamInputAdapter;
  return NodejsStreamInputAdapter_1;
}
var object;
var hasRequiredObject;
function requireObject() {
  if (hasRequiredObject) return object;
  hasRequiredObject = 1;
  var utf82 = requireUtf8();
  var utils2 = requireUtils();
  var GenericWorker = requireGenericWorker();
  var StreamHelper = requireStreamHelper();
  var defaults2 = requireDefaults();
  var CompressedObject = requireCompressedObject();
  var ZipObject = requireZipObject();
  var generate2 = requireGenerate();
  var nodejsUtils2 = requireNodejsUtils();
  var NodejsStreamInputAdapter = requireNodejsStreamInputAdapter();
  var fileAdd = function(name, data, originalOptions) {
    var dataType = utils2.getTypeOf(data), parent;
    var o = utils2.extend(originalOptions || {}, defaults2);
    o.date = o.date || /* @__PURE__ */ new Date();
    if (o.compression !== null) {
      o.compression = o.compression.toUpperCase();
    }
    if (typeof o.unixPermissions === "string") {
      o.unixPermissions = parseInt(o.unixPermissions, 8);
    }
    if (o.unixPermissions && o.unixPermissions & 16384) {
      o.dir = true;
    }
    if (o.dosPermissions && o.dosPermissions & 16) {
      o.dir = true;
    }
    if (o.dir) {
      name = forceTrailingSlash(name);
    }
    if (o.createFolders && (parent = parentFolder(name))) {
      folderAdd.call(this, parent, true);
    }
    var isUnicodeString = dataType === "string" && o.binary === false && o.base64 === false;
    if (!originalOptions || typeof originalOptions.binary === "undefined") {
      o.binary = !isUnicodeString;
    }
    var isCompressedEmpty = data instanceof CompressedObject && data.uncompressedSize === 0;
    if (isCompressedEmpty || o.dir || !data || data.length === 0) {
      o.base64 = false;
      o.binary = true;
      data = "";
      o.compression = "STORE";
      dataType = "string";
    }
    var zipObjectContent = null;
    if (data instanceof CompressedObject || data instanceof GenericWorker) {
      zipObjectContent = data;
    } else if (nodejsUtils2.isNode && nodejsUtils2.isStream(data)) {
      zipObjectContent = new NodejsStreamInputAdapter(name, data);
    } else {
      zipObjectContent = utils2.prepareContent(name, data, o.binary, o.optimizedBinaryString, o.base64);
    }
    var object2 = new ZipObject(name, zipObjectContent, o);
    this.files[name] = object2;
  };
  var parentFolder = function(path) {
    if (path.slice(-1) === "/") {
      path = path.substring(0, path.length - 1);
    }
    var lastSlash = path.lastIndexOf("/");
    return lastSlash > 0 ? path.substring(0, lastSlash) : "";
  };
  var forceTrailingSlash = function(path) {
    if (path.slice(-1) !== "/") {
      path += "/";
    }
    return path;
  };
  var folderAdd = function(name, createFolders) {
    createFolders = typeof createFolders !== "undefined" ? createFolders : defaults2.createFolders;
    name = forceTrailingSlash(name);
    if (!this.files[name]) {
      fileAdd.call(this, name, null, {
        dir: true,
        createFolders
      });
    }
    return this.files[name];
  };
  function isRegExp(object2) {
    return Object.prototype.toString.call(object2) === "[object RegExp]";
  }
  var out = {
    /**
     * @see loadAsync
     */
    load: function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    },
    /**
     * Call a callback function for each entry at this folder level.
     * @param {Function} cb the callback function:
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     */
    forEach: function(cb) {
      var filename, relativePath, file;
      for (filename in this.files) {
        file = this.files[filename];
        relativePath = filename.slice(this.root.length, filename.length);
        if (relativePath && filename.slice(0, this.root.length) === this.root) {
          cb(relativePath, file);
        }
      }
    },
    /**
     * Filter nested files/folders with the specified function.
     * @param {Function} search the predicate to use :
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     * @return {Array} An array of matching elements.
     */
    filter: function(search) {
      var result = [];
      this.forEach(function(relativePath, entry) {
        if (search(relativePath, entry)) {
          result.push(entry);
        }
      });
      return result;
    },
    /**
     * Add a file to the zip file, or search a file.
     * @param   {string|RegExp} name The name of the file to add (if data is defined),
     * the name of the file to find (if no data) or a regex to match files.
     * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
     * @param   {Object} o     File options
     * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
     * a file (when searching by string) or an array of files (when searching by regex).
     */
    file: function(name, data, o) {
      if (arguments.length === 1) {
        if (isRegExp(name)) {
          var regexp = name;
          return this.filter(function(relativePath, file) {
            return !file.dir && regexp.test(relativePath);
          });
        } else {
          var obj = this.files[this.root + name];
          if (obj && !obj.dir) {
            return obj;
          } else {
            return null;
          }
        }
      } else {
        name = this.root + name;
        fileAdd.call(this, name, data, o);
      }
      return this;
    },
    /**
     * Add a directory to the zip file, or search.
     * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
     * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
     */
    folder: function(arg) {
      if (!arg) {
        return this;
      }
      if (isRegExp(arg)) {
        return this.filter(function(relativePath, file) {
          return file.dir && arg.test(relativePath);
        });
      }
      var name = this.root + arg;
      var newFolder = folderAdd.call(this, name);
      var ret = this.clone();
      ret.root = newFolder.name;
      return ret;
    },
    /**
     * Delete a file, or a directory and all sub-files, from the zip
     * @param {string} name the name of the file to delete
     * @return {JSZip} this JSZip object
     */
    remove: function(name) {
      name = this.root + name;
      var file = this.files[name];
      if (!file) {
        if (name.slice(-1) !== "/") {
          name += "/";
        }
        file = this.files[name];
      }
      if (file && !file.dir) {
        delete this.files[name];
      } else {
        var kids = this.filter(function(relativePath, file2) {
          return file2.name.slice(0, name.length) === name;
        });
        for (var i = 0; i < kids.length; i++) {
          delete this.files[kids[i].name];
        }
      }
      return this;
    },
    /**
     * @deprecated This method has been removed in JSZip 3.0, please check the upgrade guide.
     */
    generate: function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    },
    /**
     * Generate the complete zip file as an internal stream.
     * @param {Object} options the options to generate the zip file :
     * - compression, "STORE" by default.
     * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
     * @return {StreamHelper} the streamed zip file.
     */
    generateInternalStream: function(options) {
      var worker, opts = {};
      try {
        opts = utils2.extend(options || {}, {
          streamFiles: false,
          compression: "STORE",
          compressionOptions: null,
          type: "",
          platform: "DOS",
          comment: null,
          mimeType: "application/zip",
          encodeFileName: utf82.utf8encode
        });
        opts.type = opts.type.toLowerCase();
        opts.compression = opts.compression.toUpperCase();
        if (opts.type === "binarystring") {
          opts.type = "string";
        }
        if (!opts.type) {
          throw new Error("No output type specified.");
        }
        utils2.checkSupport(opts.type);
        if (opts.platform === "darwin" || opts.platform === "freebsd" || opts.platform === "linux" || opts.platform === "sunos") {
          opts.platform = "UNIX";
        }
        if (opts.platform === "win32") {
          opts.platform = "DOS";
        }
        var comment = opts.comment || this.comment || "";
        worker = generate2.generateWorker(this, opts, comment);
      } catch (e) {
        worker = new GenericWorker("error");
        worker.error(e);
      }
      return new StreamHelper(worker, opts.type || "string", opts.mimeType);
    },
    /**
     * Generate the complete zip file asynchronously.
     * @see generateInternalStream
     */
    generateAsync: function(options, onUpdate) {
      return this.generateInternalStream(options).accumulate(onUpdate);
    },
    /**
     * Generate the complete zip file asynchronously.
     * @see generateInternalStream
     */
    generateNodeStream: function(options, onUpdate) {
      options = options || {};
      if (!options.type) {
        options.type = "nodebuffer";
      }
      return this.generateInternalStream(options).toNodejsStream(onUpdate);
    }
  };
  object = out;
  return object;
}
var DataReader_1;
var hasRequiredDataReader;
function requireDataReader() {
  if (hasRequiredDataReader) return DataReader_1;
  hasRequiredDataReader = 1;
  var utils2 = requireUtils();
  function DataReader(data) {
    this.data = data;
    this.length = data.length;
    this.index = 0;
    this.zero = 0;
  }
  DataReader.prototype = {
    /**
     * Check that the offset will not go too far.
     * @param {string} offset the additional offset to check.
     * @throws {Error} an Error if the offset is out of bounds.
     */
    checkOffset: function(offset) {
      this.checkIndex(this.index + offset);
    },
    /**
     * Check that the specified index will not be too far.
     * @param {string} newIndex the index to check.
     * @throws {Error} an Error if the index is out of bounds.
     */
    checkIndex: function(newIndex) {
      if (this.length < this.zero + newIndex || newIndex < 0) {
        throw new Error("End of data reached (data length = " + this.length + ", asked index = " + newIndex + "). Corrupted zip ?");
      }
    },
    /**
     * Change the index.
     * @param {number} newIndex The new index.
     * @throws {Error} if the new index is out of the data.
     */
    setIndex: function(newIndex) {
      this.checkIndex(newIndex);
      this.index = newIndex;
    },
    /**
     * Skip the next n bytes.
     * @param {number} n the number of bytes to skip.
     * @throws {Error} if the new index is out of the data.
     */
    skip: function(n) {
      this.setIndex(this.index + n);
    },
    /**
     * Get the byte at the specified index.
     * @param {number} i the index to use.
     * @return {number} a byte.
     */
    byteAt: function() {
    },
    /**
     * Get the next number with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {number} the corresponding number.
     */
    readInt: function(size) {
      var result = 0, i;
      this.checkOffset(size);
      for (i = this.index + size - 1; i >= this.index; i--) {
        result = (result << 8) + this.byteAt(i);
      }
      this.index += size;
      return result;
    },
    /**
     * Get the next string with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {string} the corresponding string.
     */
    readString: function(size) {
      return utils2.transformTo("string", this.readData(size));
    },
    /**
     * Get raw data without conversion, <size> bytes.
     * @param {number} size the number of bytes to read.
     * @return {Object} the raw data, implementation specific.
     */
    readData: function() {
    },
    /**
     * Find the last occurrence of a zip signature (4 bytes).
     * @param {string} sig the signature to find.
     * @return {number} the index of the last occurrence, -1 if not found.
     */
    lastIndexOfSignature: function() {
    },
    /**
     * Read the signature (4 bytes) at the current position and compare it with sig.
     * @param {string} sig the expected signature
     * @return {boolean} true if the signature matches, false otherwise.
     */
    readAndCheckSignature: function() {
    },
    /**
     * Get the next date.
     * @return {Date} the date.
     */
    readDate: function() {
      var dostime = this.readInt(4);
      return new Date(Date.UTC(
        (dostime >> 25 & 127) + 1980,
        // year
        (dostime >> 21 & 15) - 1,
        // month
        dostime >> 16 & 31,
        // day
        dostime >> 11 & 31,
        // hour
        dostime >> 5 & 63,
        // minute
        (dostime & 31) << 1
      ));
    }
  };
  DataReader_1 = DataReader;
  return DataReader_1;
}
var ArrayReader_1;
var hasRequiredArrayReader;
function requireArrayReader() {
  if (hasRequiredArrayReader) return ArrayReader_1;
  hasRequiredArrayReader = 1;
  var DataReader = requireDataReader();
  var utils2 = requireUtils();
  function ArrayReader(data) {
    DataReader.call(this, data);
    for (var i = 0; i < this.data.length; i++) {
      data[i] = data[i] & 255;
    }
  }
  utils2.inherits(ArrayReader, DataReader);
  ArrayReader.prototype.byteAt = function(i) {
    return this.data[this.zero + i];
  };
  ArrayReader.prototype.lastIndexOfSignature = function(sig) {
    var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3);
    for (var i = this.length - 4; i >= 0; --i) {
      if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
        return i - this.zero;
      }
    }
    return -1;
  };
  ArrayReader.prototype.readAndCheckSignature = function(sig) {
    var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3), data = this.readData(4);
    return sig0 === data[0] && sig1 === data[1] && sig2 === data[2] && sig3 === data[3];
  };
  ArrayReader.prototype.readData = function(size) {
    this.checkOffset(size);
    if (size === 0) {
      return [];
    }
    var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
  };
  ArrayReader_1 = ArrayReader;
  return ArrayReader_1;
}
var StringReader_1;
var hasRequiredStringReader;
function requireStringReader() {
  if (hasRequiredStringReader) return StringReader_1;
  hasRequiredStringReader = 1;
  var DataReader = requireDataReader();
  var utils2 = requireUtils();
  function StringReader(data) {
    DataReader.call(this, data);
  }
  utils2.inherits(StringReader, DataReader);
  StringReader.prototype.byteAt = function(i) {
    return this.data.charCodeAt(this.zero + i);
  };
  StringReader.prototype.lastIndexOfSignature = function(sig) {
    return this.data.lastIndexOf(sig) - this.zero;
  };
  StringReader.prototype.readAndCheckSignature = function(sig) {
    var data = this.readData(4);
    return sig === data;
  };
  StringReader.prototype.readData = function(size) {
    this.checkOffset(size);
    var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
  };
  StringReader_1 = StringReader;
  return StringReader_1;
}
var Uint8ArrayReader_1;
var hasRequiredUint8ArrayReader;
function requireUint8ArrayReader() {
  if (hasRequiredUint8ArrayReader) return Uint8ArrayReader_1;
  hasRequiredUint8ArrayReader = 1;
  var ArrayReader = requireArrayReader();
  var utils2 = requireUtils();
  function Uint8ArrayReader(data) {
    ArrayReader.call(this, data);
  }
  utils2.inherits(Uint8ArrayReader, ArrayReader);
  Uint8ArrayReader.prototype.readData = function(size) {
    this.checkOffset(size);
    if (size === 0) {
      return new Uint8Array(0);
    }
    var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
  };
  Uint8ArrayReader_1 = Uint8ArrayReader;
  return Uint8ArrayReader_1;
}
var NodeBufferReader_1;
var hasRequiredNodeBufferReader;
function requireNodeBufferReader() {
  if (hasRequiredNodeBufferReader) return NodeBufferReader_1;
  hasRequiredNodeBufferReader = 1;
  var Uint8ArrayReader = requireUint8ArrayReader();
  var utils2 = requireUtils();
  function NodeBufferReader(data) {
    Uint8ArrayReader.call(this, data);
  }
  utils2.inherits(NodeBufferReader, Uint8ArrayReader);
  NodeBufferReader.prototype.readData = function(size) {
    this.checkOffset(size);
    var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
  };
  NodeBufferReader_1 = NodeBufferReader;
  return NodeBufferReader_1;
}
var readerFor;
var hasRequiredReaderFor;
function requireReaderFor() {
  if (hasRequiredReaderFor) return readerFor;
  hasRequiredReaderFor = 1;
  var utils2 = requireUtils();
  var support2 = requireSupport();
  var ArrayReader = requireArrayReader();
  var StringReader = requireStringReader();
  var NodeBufferReader = requireNodeBufferReader();
  var Uint8ArrayReader = requireUint8ArrayReader();
  readerFor = function(data) {
    var type = utils2.getTypeOf(data);
    utils2.checkSupport(type);
    if (type === "string" && !support2.uint8array) {
      return new StringReader(data);
    }
    if (type === "nodebuffer") {
      return new NodeBufferReader(data);
    }
    if (support2.uint8array) {
      return new Uint8ArrayReader(utils2.transformTo("uint8array", data));
    }
    return new ArrayReader(utils2.transformTo("array", data));
  };
  return readerFor;
}
var zipEntry;
var hasRequiredZipEntry;
function requireZipEntry() {
  if (hasRequiredZipEntry) return zipEntry;
  hasRequiredZipEntry = 1;
  var readerFor2 = requireReaderFor();
  var utils2 = requireUtils();
  var CompressedObject = requireCompressedObject();
  var crc32fn = requireCrc32$1();
  var utf82 = requireUtf8();
  var compressions2 = requireCompressions();
  var support2 = requireSupport();
  var MADE_BY_DOS = 0;
  var MADE_BY_UNIX = 3;
  var findCompression = function(compressionMethod) {
    for (var method in compressions2) {
      if (!Object.prototype.hasOwnProperty.call(compressions2, method)) {
        continue;
      }
      if (compressions2[method].magic === compressionMethod) {
        return compressions2[method];
      }
    }
    return null;
  };
  function ZipEntry(options, loadOptions) {
    this.options = options;
    this.loadOptions = loadOptions;
  }
  ZipEntry.prototype = {
    /**
     * say if the file is encrypted.
     * @return {boolean} true if the file is encrypted, false otherwise.
     */
    isEncrypted: function() {
      return (this.bitFlag & 1) === 1;
    },
    /**
     * say if the file has utf-8 filename/comment.
     * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
     */
    useUTF8: function() {
      return (this.bitFlag & 2048) === 2048;
    },
    /**
     * Read the local part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readLocalPart: function(reader) {
      var compression, localExtraFieldsLength;
      reader.skip(22);
      this.fileNameLength = reader.readInt(2);
      localExtraFieldsLength = reader.readInt(2);
      this.fileName = reader.readData(this.fileNameLength);
      reader.skip(localExtraFieldsLength);
      if (this.compressedSize === -1 || this.uncompressedSize === -1) {
        throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
      }
      compression = findCompression(this.compressionMethod);
      if (compression === null) {
        throw new Error("Corrupted zip : compression " + utils2.pretty(this.compressionMethod) + " unknown (inner file : " + utils2.transformTo("string", this.fileName) + ")");
      }
      this.decompressed = new CompressedObject(this.compressedSize, this.uncompressedSize, this.crc32, compression, reader.readData(this.compressedSize));
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readCentralPart: function(reader) {
      this.versionMadeBy = reader.readInt(2);
      reader.skip(2);
      this.bitFlag = reader.readInt(2);
      this.compressionMethod = reader.readString(2);
      this.date = reader.readDate();
      this.crc32 = reader.readInt(4);
      this.compressedSize = reader.readInt(4);
      this.uncompressedSize = reader.readInt(4);
      var fileNameLength = reader.readInt(2);
      this.extraFieldsLength = reader.readInt(2);
      this.fileCommentLength = reader.readInt(2);
      this.diskNumberStart = reader.readInt(2);
      this.internalFileAttributes = reader.readInt(2);
      this.externalFileAttributes = reader.readInt(4);
      this.localHeaderOffset = reader.readInt(4);
      if (this.isEncrypted()) {
        throw new Error("Encrypted zip are not supported");
      }
      reader.skip(fileNameLength);
      this.readExtraFields(reader);
      this.parseZIP64ExtraField(reader);
      this.fileComment = reader.readData(this.fileCommentLength);
    },
    /**
     * Parse the external file attributes and get the unix/dos permissions.
     */
    processAttributes: function() {
      this.unixPermissions = null;
      this.dosPermissions = null;
      var madeBy = this.versionMadeBy >> 8;
      this.dir = this.externalFileAttributes & 16 ? true : false;
      if (madeBy === MADE_BY_DOS) {
        this.dosPermissions = this.externalFileAttributes & 63;
      }
      if (madeBy === MADE_BY_UNIX) {
        this.unixPermissions = this.externalFileAttributes >> 16 & 65535;
      }
      if (!this.dir && this.fileNameStr.slice(-1) === "/") {
        this.dir = true;
      }
    },
    /**
     * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
     * @param {DataReader} reader the reader to use.
     */
    parseZIP64ExtraField: function() {
      if (!this.extraFields[1]) {
        return;
      }
      var extraReader = readerFor2(this.extraFields[1].value);
      if (this.uncompressedSize === utils2.MAX_VALUE_32BITS) {
        this.uncompressedSize = extraReader.readInt(8);
      }
      if (this.compressedSize === utils2.MAX_VALUE_32BITS) {
        this.compressedSize = extraReader.readInt(8);
      }
      if (this.localHeaderOffset === utils2.MAX_VALUE_32BITS) {
        this.localHeaderOffset = extraReader.readInt(8);
      }
      if (this.diskNumberStart === utils2.MAX_VALUE_32BITS) {
        this.diskNumberStart = extraReader.readInt(4);
      }
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readExtraFields: function(reader) {
      var end = reader.index + this.extraFieldsLength, extraFieldId, extraFieldLength, extraFieldValue;
      if (!this.extraFields) {
        this.extraFields = {};
      }
      while (reader.index + 4 < end) {
        extraFieldId = reader.readInt(2);
        extraFieldLength = reader.readInt(2);
        extraFieldValue = reader.readData(extraFieldLength);
        this.extraFields[extraFieldId] = {
          id: extraFieldId,
          length: extraFieldLength,
          value: extraFieldValue
        };
      }
      reader.setIndex(end);
    },
    /**
     * Apply an UTF8 transformation if needed.
     */
    handleUTF8: function() {
      var decodeParamType = support2.uint8array ? "uint8array" : "array";
      if (this.useUTF8()) {
        this.fileNameStr = utf82.utf8decode(this.fileName);
        this.fileCommentStr = utf82.utf8decode(this.fileComment);
      } else {
        var upath = this.findExtraFieldUnicodePath();
        if (upath !== null) {
          this.fileNameStr = upath;
        } else {
          var fileNameByteArray = utils2.transformTo(decodeParamType, this.fileName);
          this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
        }
        var ucomment = this.findExtraFieldUnicodeComment();
        if (ucomment !== null) {
          this.fileCommentStr = ucomment;
        } else {
          var commentByteArray = utils2.transformTo(decodeParamType, this.fileComment);
          this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
        }
      }
    },
    /**
     * Find the unicode path declared in the extra field, if any.
     * @return {String} the unicode path, null otherwise.
     */
    findExtraFieldUnicodePath: function() {
      var upathField = this.extraFields[28789];
      if (upathField) {
        var extraReader = readerFor2(upathField.value);
        if (extraReader.readInt(1) !== 1) {
          return null;
        }
        if (crc32fn(this.fileName) !== extraReader.readInt(4)) {
          return null;
        }
        return utf82.utf8decode(extraReader.readData(upathField.length - 5));
      }
      return null;
    },
    /**
     * Find the unicode comment declared in the extra field, if any.
     * @return {String} the unicode comment, null otherwise.
     */
    findExtraFieldUnicodeComment: function() {
      var ucommentField = this.extraFields[25461];
      if (ucommentField) {
        var extraReader = readerFor2(ucommentField.value);
        if (extraReader.readInt(1) !== 1) {
          return null;
        }
        if (crc32fn(this.fileComment) !== extraReader.readInt(4)) {
          return null;
        }
        return utf82.utf8decode(extraReader.readData(ucommentField.length - 5));
      }
      return null;
    }
  };
  zipEntry = ZipEntry;
  return zipEntry;
}
var zipEntries;
var hasRequiredZipEntries;
function requireZipEntries() {
  if (hasRequiredZipEntries) return zipEntries;
  hasRequiredZipEntries = 1;
  var readerFor2 = requireReaderFor();
  var utils2 = requireUtils();
  var sig = requireSignature();
  var ZipEntry = requireZipEntry();
  var support2 = requireSupport();
  function ZipEntries(loadOptions) {
    this.files = [];
    this.loadOptions = loadOptions;
  }
  ZipEntries.prototype = {
    /**
     * Check that the reader is on the specified signature.
     * @param {string} expectedSignature the expected signature.
     * @throws {Error} if it is an other signature.
     */
    checkSignature: function(expectedSignature) {
      if (!this.reader.readAndCheckSignature(expectedSignature)) {
        this.reader.index -= 4;
        var signature2 = this.reader.readString(4);
        throw new Error("Corrupted zip or bug: unexpected signature (" + utils2.pretty(signature2) + ", expected " + utils2.pretty(expectedSignature) + ")");
      }
    },
    /**
     * Check if the given signature is at the given index.
     * @param {number} askedIndex the index to check.
     * @param {string} expectedSignature the signature to expect.
     * @return {boolean} true if the signature is here, false otherwise.
     */
    isSignature: function(askedIndex, expectedSignature) {
      var currentIndex = this.reader.index;
      this.reader.setIndex(askedIndex);
      var signature2 = this.reader.readString(4);
      var result = signature2 === expectedSignature;
      this.reader.setIndex(currentIndex);
      return result;
    },
    /**
     * Read the end of the central directory.
     */
    readBlockEndOfCentral: function() {
      this.diskNumber = this.reader.readInt(2);
      this.diskWithCentralDirStart = this.reader.readInt(2);
      this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
      this.centralDirRecords = this.reader.readInt(2);
      this.centralDirSize = this.reader.readInt(4);
      this.centralDirOffset = this.reader.readInt(4);
      this.zipCommentLength = this.reader.readInt(2);
      var zipComment = this.reader.readData(this.zipCommentLength);
      var decodeParamType = support2.uint8array ? "uint8array" : "array";
      var decodeContent = utils2.transformTo(decodeParamType, zipComment);
      this.zipComment = this.loadOptions.decodeFileName(decodeContent);
    },
    /**
     * Read the end of the Zip 64 central directory.
     * Not merged with the method readEndOfCentral :
     * The end of central can coexist with its Zip64 brother,
     * I don't want to read the wrong number of bytes !
     */
    readBlockZip64EndOfCentral: function() {
      this.zip64EndOfCentralSize = this.reader.readInt(8);
      this.reader.skip(4);
      this.diskNumber = this.reader.readInt(4);
      this.diskWithCentralDirStart = this.reader.readInt(4);
      this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
      this.centralDirRecords = this.reader.readInt(8);
      this.centralDirSize = this.reader.readInt(8);
      this.centralDirOffset = this.reader.readInt(8);
      this.zip64ExtensibleData = {};
      var extraDataSize = this.zip64EndOfCentralSize - 44, index = 0, extraFieldId, extraFieldLength, extraFieldValue;
      while (index < extraDataSize) {
        extraFieldId = this.reader.readInt(2);
        extraFieldLength = this.reader.readInt(4);
        extraFieldValue = this.reader.readData(extraFieldLength);
        this.zip64ExtensibleData[extraFieldId] = {
          id: extraFieldId,
          length: extraFieldLength,
          value: extraFieldValue
        };
      }
    },
    /**
     * Read the end of the Zip 64 central directory locator.
     */
    readBlockZip64EndOfCentralLocator: function() {
      this.diskWithZip64CentralDirStart = this.reader.readInt(4);
      this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
      this.disksCount = this.reader.readInt(4);
      if (this.disksCount > 1) {
        throw new Error("Multi-volumes zip are not supported");
      }
    },
    /**
     * Read the local files, based on the offset read in the central part.
     */
    readLocalFiles: function() {
      var i, file;
      for (i = 0; i < this.files.length; i++) {
        file = this.files[i];
        this.reader.setIndex(file.localHeaderOffset);
        this.checkSignature(sig.LOCAL_FILE_HEADER);
        file.readLocalPart(this.reader);
        file.handleUTF8();
        file.processAttributes();
      }
    },
    /**
     * Read the central directory.
     */
    readCentralDir: function() {
      var file;
      this.reader.setIndex(this.centralDirOffset);
      while (this.reader.readAndCheckSignature(sig.CENTRAL_FILE_HEADER)) {
        file = new ZipEntry({
          zip64: this.zip64
        }, this.loadOptions);
        file.readCentralPart(this.reader);
        this.files.push(file);
      }
      if (this.centralDirRecords !== this.files.length) {
        if (this.centralDirRecords !== 0 && this.files.length === 0) {
          throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }
      }
    },
    /**
     * Read the end of central directory.
     */
    readEndOfCentral: function() {
      var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
      if (offset < 0) {
        var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);
        if (isGarbage) {
          throw new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
        } else {
          throw new Error("Corrupted zip: can't find end of central directory");
        }
      }
      this.reader.setIndex(offset);
      var endOfCentralDirOffset = offset;
      this.checkSignature(sig.CENTRAL_DIRECTORY_END);
      this.readBlockEndOfCentral();
      if (this.diskNumber === utils2.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils2.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils2.MAX_VALUE_16BITS || this.centralDirRecords === utils2.MAX_VALUE_16BITS || this.centralDirSize === utils2.MAX_VALUE_32BITS || this.centralDirOffset === utils2.MAX_VALUE_32BITS) {
        this.zip64 = true;
        offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
        if (offset < 0) {
          throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
        }
        this.reader.setIndex(offset);
        this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
        this.readBlockZip64EndOfCentralLocator();
        if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
          this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
          if (this.relativeOffsetEndOfZip64CentralDir < 0) {
            throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
          }
        }
        this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
        this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
        this.readBlockZip64EndOfCentral();
      }
      var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
      if (this.zip64) {
        expectedEndOfCentralDirOffset += 20;
        expectedEndOfCentralDirOffset += 12 + this.zip64EndOfCentralSize;
      }
      var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;
      if (extraBytes > 0) {
        if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) ;
        else {
          this.reader.zero = extraBytes;
        }
      } else if (extraBytes < 0) {
        throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
      }
    },
    prepareReader: function(data) {
      this.reader = readerFor2(data);
    },
    /**
     * Read a zip file and create ZipEntries.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
     */
    load: function(data) {
      this.prepareReader(data);
      this.readEndOfCentral();
      this.readCentralDir();
      this.readLocalFiles();
    }
  };
  zipEntries = ZipEntries;
  return zipEntries;
}
var load;
var hasRequiredLoad;
function requireLoad() {
  if (hasRequiredLoad) return load;
  hasRequiredLoad = 1;
  var utils2 = requireUtils();
  var external2 = requireExternal();
  var utf82 = requireUtf8();
  var ZipEntries = requireZipEntries();
  var Crc32Probe = requireCrc32Probe();
  var nodejsUtils2 = requireNodejsUtils();
  function checkEntryCRC32(zipEntry2) {
    return new external2.Promise(function(resolve, reject) {
      var worker = zipEntry2.decompressed.getContentWorker().pipe(new Crc32Probe());
      worker.on("error", function(e) {
        reject(e);
      }).on("end", function() {
        if (worker.streamInfo.crc32 !== zipEntry2.decompressed.crc32) {
          reject(new Error("Corrupted zip : CRC32 mismatch"));
        } else {
          resolve();
        }
      }).resume();
    });
  }
  load = function(data, options) {
    var zip = this;
    options = utils2.extend(options || {}, {
      base64: false,
      checkCRC32: false,
      optimizedBinaryString: false,
      createFolders: false,
      decodeFileName: utf82.utf8decode
    });
    if (nodejsUtils2.isNode && nodejsUtils2.isStream(data)) {
      return external2.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
    }
    return utils2.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64).then(function(data2) {
      var zipEntries2 = new ZipEntries(options);
      zipEntries2.load(data2);
      return zipEntries2;
    }).then(function checkCRC32(zipEntries2) {
      var promises = [external2.Promise.resolve(zipEntries2)];
      var files = zipEntries2.files;
      if (options.checkCRC32) {
        for (var i = 0; i < files.length; i++) {
          promises.push(checkEntryCRC32(files[i]));
        }
      }
      return external2.Promise.all(promises);
    }).then(function addFiles(results) {
      var zipEntries2 = results.shift();
      var files = zipEntries2.files;
      for (var i = 0; i < files.length; i++) {
        var input = files[i];
        var unsafeName = input.fileNameStr;
        var safeName = utils2.resolve(input.fileNameStr);
        zip.file(safeName, input.decompressed, {
          binary: true,
          optimizedBinaryString: true,
          date: input.date,
          dir: input.dir,
          comment: input.fileCommentStr.length ? input.fileCommentStr : null,
          unixPermissions: input.unixPermissions,
          dosPermissions: input.dosPermissions,
          createFolders: options.createFolders
        });
        if (!input.dir) {
          zip.file(safeName).unsafeOriginalName = unsafeName;
        }
      }
      if (zipEntries2.zipComment.length) {
        zip.comment = zipEntries2.zipComment;
      }
      return zip;
    });
  };
  return load;
}
var lib;
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib;
  hasRequiredLib = 1;
  function JSZip() {
    if (!(this instanceof JSZip)) {
      return new JSZip();
    }
    if (arguments.length) {
      throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
    }
    this.files = /* @__PURE__ */ Object.create(null);
    this.comment = null;
    this.root = "";
    this.clone = function() {
      var newObj = new JSZip();
      for (var i in this) {
        if (typeof this[i] !== "function") {
          newObj[i] = this[i];
        }
      }
      return newObj;
    };
  }
  JSZip.prototype = requireObject();
  JSZip.prototype.loadAsync = requireLoad();
  JSZip.support = requireSupport();
  JSZip.defaults = requireDefaults();
  JSZip.version = "3.10.1";
  JSZip.loadAsync = function(content, options) {
    return new JSZip().loadAsync(content, options);
  };
  JSZip.external = requireExternal();
  lib = JSZip;
  return lib;
}
var mkdirp;
var hasRequiredMkdirp;
function requireMkdirp() {
  if (hasRequiredMkdirp) return mkdirp;
  hasRequiredMkdirp = 1;
  var path = require$$1;
  var fs2 = require$$1$1;
  var _0777 = parseInt("0777", 8);
  mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
  function mkdirP(p, opts, f, made) {
    if (typeof opts === "function") {
      f = opts;
      opts = {};
    } else if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs2;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made) made = null;
    var cb = f || /* istanbul ignore next */
    function() {
    };
    p = path.resolve(p);
    xfs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return cb(null, made);
      }
      switch (er.code) {
        case "ENOENT":
          if (path.dirname(p) === p) return cb(er);
          mkdirP(path.dirname(p), opts, function(er2, made2) {
            if (er2) cb(er2, made2);
            else mkdirP(p, opts, cb, made2);
          });
          break;
        // In the case of any other error, just see if there's a dir
        // there already.  If so, then hooray!  If not, then something
        // is borked.
        default:
          xfs.stat(p, function(er2, stat) {
            if (er2 || !stat.isDirectory()) cb(er, made);
            else cb(null, made);
          });
          break;
      }
    });
  }
  mkdirP.sync = function sync(p, opts, made) {
    if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs2;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made) made = null;
    p = path.resolve(p);
    try {
      xfs.mkdirSync(p, mode);
      made = made || p;
    } catch (err0) {
      switch (err0.code) {
        case "ENOENT":
          made = sync(path.dirname(p), opts, made);
          sync(p, opts, made);
          break;
        // In the case of any other error, just see if there's a dir
        // there already.  If so, then hooray!  If not, then something
        // is borked.
        default:
          var stat;
          try {
            stat = xfs.statSync(p);
          } catch (err1) {
            throw err0;
          }
          if (!stat.isDirectory()) throw err0;
          break;
      }
    }
    return made;
  };
  return mkdirp;
}
var yaku = { exports: {} };
var hasRequiredYaku;
function requireYaku() {
  if (hasRequiredYaku) return yaku.exports;
  hasRequiredYaku = 1;
  (function() {
    var $undefined, $null = null, root = typeof window === "object" ? window : commonjsGlobal, isLongStackTrace = false, process2 = root.process, Arr = Array, Err = Error, $rejected = 0, $resolved = 1, $pending = 2, $Symbol = "Symbol", $iterator = "iterator", $species = "species", $speciesKey = $Symbol + "(" + $species + ")", $return = "return", $unhandled = "_uh", $promiseTrace = "_pt", $settlerTrace = "_st", $invalidThis = "Invalid this", $invalidArgument = "Invalid argument", $fromPrevious = "\nFrom previous ", $promiseCircularChain = "Chaining cycle detected for promise", $unhandledRejectionMsg = "Uncaught (in promise)", $rejectionHandled = "rejectionHandled", $unhandledRejection = "unhandledRejection", $tryCatchFn, $tryCatchThis, $tryErr = { e: $null }, $noop = function() {
    }, $cleanStackReg = /^.+\/node_modules\/yaku\/.+\n?/mg;
    var Yaku = yaku.exports = function Promise2(executor) {
      var self2 = this, err;
      if (!isObject(self2) || self2._s !== $undefined)
        throw genTypeError($invalidThis);
      self2._s = $pending;
      if (isLongStackTrace) self2[$promiseTrace] = genTraceInfo();
      if (executor !== $noop) {
        if (!isFunction(executor))
          throw genTypeError($invalidArgument);
        err = genTryCatcher(executor)(
          genSettler(self2, $resolved),
          genSettler(self2, $rejected)
        );
        if (err === $tryErr)
          settlePromise(self2, $rejected, err.e);
      }
    };
    Yaku["default"] = Yaku;
    extendPrototype(Yaku, {
      /**
       * Appends fulfillment and rejection handlers to the promise,
       * and returns a new promise resolving to the return value of the called handler.
       * @param  {Function} onFulfilled Optional. Called when the Promise is resolved.
       * @param  {Function} onRejected  Optional. Called when the Promise is rejected.
       * @return {Yaku} It will return a new Yaku which will resolve or reject after
       * @example
       * the current Promise.
       * ```js
       * var Promise = require('yaku');
       * var p = Promise.resolve(10);
       *
       * p.then((v) => {
       *     console.log(v);
       * });
       * ```
       */
      then: function then(onFulfilled, onRejected) {
        if (this._s === void 0) throw genTypeError();
        return addHandler(
          this,
          newCapablePromise(Yaku.speciesConstructor(this, Yaku)),
          onFulfilled,
          onRejected
        );
      },
      /**
       * The `catch()` method returns a Promise and deals with rejected cases only.
       * It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.
       * @param  {Function} onRejected A Function called when the Promise is rejected.
       * This function has one argument, the rejection reason.
       * @return {Yaku} A Promise that deals with rejected cases only.
       * @example
       * ```js
       * var Promise = require('yaku');
       * var p = Promise.reject(new Error("ERR"));
       *
       * p['catch']((v) => {
       *     console.log(v);
       * });
       * ```
       */
      "catch": function(onRejected) {
        return this.then($undefined, onRejected);
      },
      // The number of current promises that attach to this Yaku instance.
      _pCount: 0,
      // The parent Yaku.
      _pre: $null,
      // A unique type flag, it helps different versions of Yaku know each other.
      _Yaku: 1
    });
    Yaku.resolve = function resolve(val) {
      return isYaku(val) ? val : settleWithX(newCapablePromise(this), val);
    };
    Yaku.reject = function reject(reason) {
      return settlePromise(newCapablePromise(this), $rejected, reason);
    };
    Yaku.race = function race(iterable) {
      var self2 = this, p = newCapablePromise(self2), resolve = function(val) {
        settlePromise(p, $resolved, val);
      }, reject = function(val) {
        settlePromise(p, $rejected, val);
      }, ret = genTryCatcher(each)(iterable, function(v) {
        self2.resolve(v).then(resolve, reject);
      });
      if (ret === $tryErr) return self2.reject(ret.e);
      return p;
    };
    Yaku.all = function all(iterable) {
      var self2 = this, p1 = newCapablePromise(self2), res = [], ret;
      function reject(reason) {
        settlePromise(p1, $rejected, reason);
      }
      ret = genTryCatcher(each)(iterable, function(item, i) {
        self2.resolve(item).then(function(value) {
          res[i] = value;
          if (!--ret) settlePromise(p1, $resolved, res);
        }, reject);
      });
      if (ret === $tryErr) return self2.reject(ret.e);
      if (!ret) settlePromise(p1, $resolved, []);
      return p1;
    };
    Yaku.Symbol = root[$Symbol] || {};
    genTryCatcher(function() {
      Object.defineProperty(Yaku, getSpecies(), {
        get: function() {
          return this;
        }
      });
    })();
    Yaku.speciesConstructor = function(O, D) {
      var C = O.constructor;
      return C ? C[getSpecies()] || D : D;
    };
    Yaku.unhandledRejection = function(reason, p) {
      try {
        root.console.error(
          $unhandledRejectionMsg,
          isLongStackTrace ? p.longStack : genStackInfo(reason, p)
        );
      } catch (e) {
      }
    };
    Yaku.rejectionHandled = $noop;
    Yaku.enableLongStackTrace = function() {
      isLongStackTrace = true;
    };
    Yaku.nextTick = process2 ? process2.nextTick : function(fn) {
      setTimeout(fn);
    };
    Yaku._Yaku = 1;
    function getSpecies() {
      return Yaku[$Symbol][$species] || $speciesKey;
    }
    function extendPrototype(src, target) {
      for (var k in target) {
        src.prototype[k] = target[k];
      }
      return src;
    }
    function isObject(obj) {
      return obj && typeof obj === "object";
    }
    function isFunction(obj) {
      return typeof obj === "function";
    }
    function isInstanceOf(a, b) {
      return a instanceof b;
    }
    function isError(obj) {
      return isInstanceOf(obj, Err);
    }
    function ensureType(obj, fn, msg) {
      if (!fn(obj)) throw genTypeError(msg);
    }
    function tryCatcher() {
      try {
        return $tryCatchFn.apply($tryCatchThis, arguments);
      } catch (e) {
        $tryErr.e = e;
        return $tryErr;
      }
    }
    function genTryCatcher(fn, self2) {
      $tryCatchFn = fn;
      $tryCatchThis = self2;
      return tryCatcher;
    }
    function genScheduler(initQueueSize, fn) {
      var fnQueue = Arr(initQueueSize), fnQueueLen = 0;
      function flush() {
        var i = 0;
        while (i < fnQueueLen) {
          fn(fnQueue[i], fnQueue[i + 1]);
          fnQueue[i++] = $undefined;
          fnQueue[i++] = $undefined;
        }
        fnQueueLen = 0;
        if (fnQueue.length > initQueueSize) fnQueue.length = initQueueSize;
      }
      return function(v, arg) {
        fnQueue[fnQueueLen++] = v;
        fnQueue[fnQueueLen++] = arg;
        if (fnQueueLen === 2) Yaku.nextTick(flush);
      };
    }
    function each(iterable, fn) {
      var len, i = 0, iter, item, ret;
      if (!iterable) throw genTypeError($invalidArgument);
      var gen = iterable[Yaku[$Symbol][$iterator]];
      if (isFunction(gen))
        iter = gen.call(iterable);
      else if (isFunction(iterable.next)) {
        iter = iterable;
      } else if (isInstanceOf(iterable, Arr)) {
        len = iterable.length;
        while (i < len) {
          fn(iterable[i], i++);
        }
        return i;
      } else
        throw genTypeError($invalidArgument);
      while (!(item = iter.next()).done) {
        ret = genTryCatcher(fn)(item.value, i++);
        if (ret === $tryErr) {
          isFunction(iter[$return]) && iter[$return]();
          throw ret.e;
        }
      }
      return i;
    }
    function genTypeError(msg) {
      return new TypeError(msg);
    }
    function genTraceInfo(noTitle) {
      return (noTitle ? "" : $fromPrevious) + new Err().stack;
    }
    var scheduleHandler = genScheduler(999, function(p1, p2) {
      var x, handler;
      handler = p1._s ? p2._onFulfilled : p2._onRejected;
      if (handler === $undefined) {
        settlePromise(p2, p1._s, p1._v);
        return;
      }
      x = genTryCatcher(callHanler)(handler, p1._v);
      if (x === $tryErr) {
        settlePromise(p2, $rejected, x.e);
        return;
      }
      settleWithX(p2, x);
    });
    var scheduleUnhandledRejection = genScheduler(9, function(p) {
      if (!hashOnRejected(p)) {
        p[$unhandled] = 1;
        emitEvent($unhandledRejection, p);
      }
    });
    function emitEvent(name, p) {
      var browserEventName = "on" + name.toLowerCase(), browserHandler = root[browserEventName];
      if (process2 && process2.listeners(name).length)
        name === $unhandledRejection ? process2.emit(name, p._v, p) : process2.emit(name, p);
      else if (browserHandler)
        browserHandler({ reason: p._v, promise: p });
      else
        Yaku[name](p._v, p);
    }
    function isYaku(val) {
      return val && val._Yaku;
    }
    function newCapablePromise(Constructor) {
      if (isYaku(Constructor)) return new Constructor($noop);
      var p, r, j;
      p = new Constructor(function(resolve, reject) {
        if (p) throw genTypeError();
        r = resolve;
        j = reject;
      });
      ensureType(r, isFunction);
      ensureType(j, isFunction);
      return p;
    }
    function genSettler(self2, state) {
      return function(value) {
        if (isLongStackTrace)
          self2[$settlerTrace] = genTraceInfo(true);
        if (state === $resolved)
          settleWithX(self2, value);
        else
          settlePromise(self2, state, value);
      };
    }
    function addHandler(p1, p2, onFulfilled, onRejected) {
      if (isFunction(onFulfilled))
        p2._onFulfilled = onFulfilled;
      if (isFunction(onRejected)) {
        if (p1[$unhandled]) emitEvent($rejectionHandled, p1);
        p2._onRejected = onRejected;
      }
      if (isLongStackTrace) p2._pre = p1;
      p1[p1._pCount++] = p2;
      if (p1._s !== $pending)
        scheduleHandler(p1, p2);
      return p2;
    }
    function hashOnRejected(node2) {
      if (node2._umark)
        return true;
      else
        node2._umark = true;
      var i = 0, len = node2._pCount, child;
      while (i < len) {
        child = node2[i++];
        if (child._onRejected || hashOnRejected(child)) return true;
      }
    }
    function genStackInfo(reason, p) {
      var stackInfo = [];
      function push(trace) {
        return stackInfo.push(trace.replace(/^\s+|\s+$/g, ""));
      }
      if (isLongStackTrace) {
        if (p[$settlerTrace])
          push(p[$settlerTrace]);
        (function iter(node2) {
          if (node2 && $promiseTrace in node2) {
            iter(node2._next);
            push(node2[$promiseTrace] + "");
            iter(node2._pre);
          }
        })(p);
      }
      return (reason && reason.stack ? reason.stack : reason) + ("\n" + stackInfo.join("\n")).replace($cleanStackReg, "");
    }
    function callHanler(handler, value) {
      return handler(value);
    }
    function settlePromise(p, state, value) {
      var i = 0, len = p._pCount;
      if (p._s === $pending) {
        p._s = state;
        p._v = value;
        if (state === $rejected) {
          if (isLongStackTrace && isError(value)) {
            value.longStack = genStackInfo(value, p);
          }
          scheduleUnhandledRejection(p);
        }
        while (i < len) {
          scheduleHandler(p, p[i++]);
        }
      }
      return p;
    }
    function settleWithX(p, x) {
      if (x === p && x) {
        settlePromise(p, $rejected, genTypeError($promiseCircularChain));
        return p;
      }
      if (x !== $null && (isFunction(x) || isObject(x))) {
        var xthen = genTryCatcher(getThen)(x);
        if (xthen === $tryErr) {
          settlePromise(p, $rejected, xthen.e);
          return p;
        }
        if (isFunction(xthen)) {
          if (isLongStackTrace && isYaku(x))
            p._next = x;
          if (isYaku(x))
            settleXthen(p, x, xthen);
          else
            Yaku.nextTick(function() {
              settleXthen(p, x, xthen);
            });
        } else
          settlePromise(p, $resolved, x);
      } else
        settlePromise(p, $resolved, x);
      return p;
    }
    function getThen(x) {
      return x.then;
    }
    function settleXthen(p, x, xthen) {
      var err = genTryCatcher(xthen, x)(function(y) {
        x && (x = $null, settleWithX(p, y));
      }, function(r) {
        x && (x = $null, settlePromise(p, $rejected, r));
      });
      if (err === $tryErr && x) {
        settlePromise(p, $rejected, err.e);
        x = $null;
      }
    }
  })();
  return yaku.exports;
}
var _;
var hasRequired_;
function require_() {
  if (hasRequired_) return _;
  hasRequired_ = 1;
  var Promise2 = requireYaku();
  _ = {
    extendPrototype: function(src, target) {
      for (var k in target) {
        src.prototype[k] = target[k];
      }
      return src;
    },
    isFunction: function(obj) {
      return typeof obj === "function";
    },
    isNumber: function(obj) {
      return typeof obj === "number";
    },
    Promise: Promise2,
    slice: [].slice
  };
  return _;
}
var promisify;
var hasRequiredPromisify;
function requirePromisify() {
  if (hasRequiredPromisify) return promisify;
  hasRequiredPromisify = 1;
  var _2 = require_();
  var isFn = _2.isFunction;
  promisify = function(fn, self2) {
    return function(a, b, c, d, e) {
      var len = arguments.length, args, promise, resolve, reject;
      promise = new _2.Promise(function(r, rj) {
        resolve = r;
        reject = rj;
      });
      function cb(err, val) {
        err == null ? resolve(val) : reject(err);
      }
      switch (len) {
        case 0:
          fn.call(self2, cb);
          break;
        case 1:
          isFn(a) ? fn.call(self2, a) : fn.call(self2, a, cb);
          break;
        case 2:
          isFn(b) ? fn.call(self2, a, b) : fn.call(self2, a, b, cb);
          break;
        case 3:
          isFn(c) ? fn.call(self2, a, b, c) : fn.call(self2, a, b, c, cb);
          break;
        case 4:
          isFn(d) ? fn.call(self2, a, b, c, d) : fn.call(self2, a, b, c, d, cb);
          break;
        case 5:
          isFn(e) ? fn.call(self2, a, b, c, d, e) : fn.call(self2, a, b, c, d, e, cb);
          break;
        default:
          args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
          }
          if (isFn(args[len - 1])) {
            return fn.apply(self2, args);
          }
          args[i] = cb;
          fn.apply(self2, args);
      }
      return promise;
    };
  };
  return promisify;
}
var dist;
var hasRequiredDist$1;
function requireDist$1() {
  if (hasRequiredDist$1) return dist;
  hasRequiredDist$1 = 1;
  var fs2 = require$$1$1;
  var path = require$$1;
  var jszip = requireLib();
  var mkdirp2 = requireMkdirp();
  var promisify2 = requirePromisify();
  var writeFile = promisify2(fs2.writeFile);
  var readFile = promisify2(fs2.readFile);
  var mkdir = promisify2(mkdirp2);
  function crxToZip(buf) {
    function calcLength(a, b, c, d) {
      var length = 0;
      length += a;
      length += b << 8;
      length += c << 16;
      length += d << 24;
      return length;
    }
    if (buf[0] === 80 && buf[1] === 75 && buf[2] === 3 && buf[3] === 4) {
      return buf;
    }
    if (buf[0] !== 67 || buf[1] !== 114 || buf[2] !== 50 || buf[3] !== 52) {
      throw new Error("Invalid header: Does not start with Cr24");
    }
    var isV3 = buf[4] === 3;
    var isV2 = buf[4] === 2;
    if (!isV2 && !isV3 || buf[5] || buf[6] || buf[7]) {
      throw new Error("Unexpected crx format version number.");
    }
    if (isV2) {
      var publicKeyLength = calcLength(buf[8], buf[9], buf[10], buf[11]);
      var signatureLength = calcLength(buf[12], buf[13], buf[14], buf[15]);
      var _zipStartOffset = 16 + publicKeyLength + signatureLength;
      return buf.slice(_zipStartOffset, buf.length);
    }
    var headerSize = calcLength(buf[8], buf[9], buf[10], buf[11]);
    var zipStartOffset = 12 + headerSize;
    return buf.slice(zipStartOffset, buf.length);
  }
  function unzip(crxFilePath, destination) {
    var filePath = path.resolve(crxFilePath);
    var extname = path.extname(crxFilePath);
    var basename = path.basename(crxFilePath, extname);
    var dirname = path.dirname(crxFilePath);
    destination = destination || path.resolve(dirname, basename);
    return readFile(filePath).then(function(buf) {
      return jszip.loadAsync(crxToZip(buf));
    }).then(function(zip) {
      var zipFileKeys = Object.keys(zip.files);
      return Promise.all(zipFileKeys.map(function(filename) {
        var isFile = !zip.files[filename].dir;
        var fullPath = path.join(destination, filename);
        var directory = isFile && path.dirname(fullPath) || fullPath;
        var content = zip.files[filename].async("nodebuffer");
        return mkdir(directory).then(function() {
          return isFile ? content : false;
        }).then(function(data) {
          return data ? writeFile(fullPath, data) : true;
        });
      }));
    });
  }
  dist = unzip;
  return dist;
}
var hasRequiredDownloadChromeExtension;
function requireDownloadChromeExtension() {
  if (hasRequiredDownloadChromeExtension) return downloadChromeExtension;
  hasRequiredDownloadChromeExtension = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.downloadChromeExtension = void 0;
    const fs2 = require$$1$1;
    const path = require$$1;
    const utils_1 = requireUtils$1();
    const unzip = requireDist$1();
    const downloadChromeExtension2 = async (chromeStoreID, { forceDownload = false, attempts = 5 } = {}) => {
      const extensionsStore = (0, utils_1.getPath)();
      if (!fs2.existsSync(extensionsStore)) {
        await fs2.promises.mkdir(extensionsStore, { recursive: true });
      }
      const extensionFolder = path.resolve(`${extensionsStore}/${chromeStoreID}`);
      if (!fs2.existsSync(extensionFolder) || forceDownload) {
        if (fs2.existsSync(extensionFolder)) {
          await fs2.promises.rmdir(extensionFolder, {
            recursive: true
          });
        }
        const fileURL = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3D${chromeStoreID}%26uc&prodversion=${process.versions.chrome}`;
        const filePath = path.resolve(`${extensionFolder}.crx`);
        try {
          await (0, utils_1.downloadFile)(fileURL, filePath);
          try {
            await unzip(filePath, extensionFolder);
            (0, utils_1.changePermissions)(extensionFolder, 755);
            return extensionFolder;
          } catch (err) {
            if (!fs2.existsSync(path.resolve(extensionFolder, "manifest.json"))) {
              throw err;
            }
          }
        } catch (err) {
          console.error(`Failed to fetch extension, trying ${attempts - 1} more times`);
          if (attempts <= 1) {
            throw err;
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
          return await (0, exports.downloadChromeExtension)(chromeStoreID, {
            forceDownload,
            attempts: attempts - 1
          });
        }
      }
      return extensionFolder;
    };
    exports.downloadChromeExtension = downloadChromeExtension2;
  })(downloadChromeExtension);
  return downloadChromeExtension;
}
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist$1;
  hasRequiredDist = 1;
  Object.defineProperty(dist$1, "__esModule", { value: true });
  dist$1.MOBX_DEVTOOLS = dist$1.REDUX_DEVTOOLS = dist$1.VUEJS_DEVTOOLS_BETA = dist$1.VUEJS_DEVTOOLS = dist$1.JQUERY_DEBUGGER = dist$1.BACKBONE_DEBUGGER = dist$1.REACT_DEVELOPER_TOOLS = dist$1.EMBER_INSPECTOR = void 0;
  dist$1.installExtension = installExtension2;
  const electron_1 = require$$0$1;
  const downloadChromeExtension_1 = requireDownloadChromeExtension();
  async function installExtension2(extensionReference, options = {}) {
    const { forceDownload, loadExtensionOptions, session: _session } = options;
    const targetSession = _session || electron_1.session.defaultSession;
    if (process.type !== "browser") {
      return Promise.reject(new Error("electron-devtools-installer can only be used from the main process"));
    }
    if (Array.isArray(extensionReference)) {
      return extensionReference.reduce((accum, extension) => accum.then(async (result) => {
        const inner = await installExtension2(extension, options);
        return [...result, inner];
      }), Promise.resolve([]));
    }
    let chromeStoreID;
    if (typeof extensionReference === "object" && extensionReference.id) {
      chromeStoreID = extensionReference.id;
    } else if (typeof extensionReference === "string") {
      chromeStoreID = extensionReference;
    } else {
      throw new Error(`Invalid extensionReference passed in: "${extensionReference}"`);
    }
    const installedExtension = targetSession.getAllExtensions().find((e) => e.id === chromeStoreID);
    if (!forceDownload && installedExtension) {
      return installedExtension;
    }
    const extensionFolder = await (0, downloadChromeExtension_1.downloadChromeExtension)(chromeStoreID, {
      forceDownload: forceDownload || false
    });
    if (installedExtension === null || installedExtension === void 0 ? void 0 : installedExtension.id) {
      const unloadPromise = new Promise((resolve) => {
        const handler = (_2, ext) => {
          if (ext.id === installedExtension.id) {
            targetSession.removeListener("extension-unloaded", handler);
            resolve();
          }
        };
        targetSession.on("extension-unloaded", handler);
      });
      targetSession.removeExtension(installedExtension.id);
      await unloadPromise;
    }
    return targetSession.loadExtension(extensionFolder, loadExtensionOptions);
  }
  dist$1.default = installExtension2;
  dist$1.EMBER_INSPECTOR = {
    id: "bmdblncegkenkacieihfhpjfppoconhi"
  };
  dist$1.REACT_DEVELOPER_TOOLS = {
    id: "fmkadmapgofadopljbjfkapdkoienihi"
  };
  dist$1.BACKBONE_DEBUGGER = {
    id: "bhljhndlimiafopmmhjlgfpnnchjjbhd"
  };
  dist$1.JQUERY_DEBUGGER = {
    id: "dbhhnnnpaeobfddmlalhnehgclcmjimi"
  };
  dist$1.VUEJS_DEVTOOLS = {
    id: "nhdogjmejiglipccpnnnanhbledajbpd"
  };
  dist$1.VUEJS_DEVTOOLS_BETA = {
    id: "ljjemllljcmogpfapbkkighbhhppjdbg"
  };
  dist$1.REDUX_DEVTOOLS = {
    id: "lmhkpmbekcpmknklioeibfkpmmfibljd"
  };
  dist$1.MOBX_DEVTOOLS = {
    id: "pfgnfdagidkfgccljigdamigbcnndkod"
  };
  return dist$1;
}
var distExports = requireDist();
const installExtension = /* @__PURE__ */ getDefaultExportFromCjs(distExports);
var mimeTypes = {};
const require$$0 = {
  "application/1d-interleaved-parityfec": { "source": "iana" },
  "application/3gpdash-qoe-report+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/3gpp-ims+xml": { "source": "iana", "compressible": true },
  "application/3gpphal+json": { "source": "iana", "compressible": true },
  "application/3gpphalforms+json": { "source": "iana", "compressible": true },
  "application/a2l": { "source": "iana" },
  "application/ace+cbor": { "source": "iana" },
  "application/activemessage": { "source": "iana" },
  "application/activity+json": { "source": "iana", "compressible": true },
  "application/alto-costmap+json": { "source": "iana", "compressible": true },
  "application/alto-costmapfilter+json": { "source": "iana", "compressible": true },
  "application/alto-directory+json": { "source": "iana", "compressible": true },
  "application/alto-endpointcost+json": { "source": "iana", "compressible": true },
  "application/alto-endpointcostparams+json": { "source": "iana", "compressible": true },
  "application/alto-endpointprop+json": { "source": "iana", "compressible": true },
  "application/alto-endpointpropparams+json": { "source": "iana", "compressible": true },
  "application/alto-error+json": { "source": "iana", "compressible": true },
  "application/alto-networkmap+json": { "source": "iana", "compressible": true },
  "application/alto-networkmapfilter+json": { "source": "iana", "compressible": true },
  "application/alto-updatestreamcontrol+json": { "source": "iana", "compressible": true },
  "application/alto-updatestreamparams+json": { "source": "iana", "compressible": true },
  "application/aml": { "source": "iana" },
  "application/andrew-inset": { "source": "iana", "extensions": ["ez"] },
  "application/applefile": { "source": "iana" },
  "application/applixware": { "source": "apache", "extensions": ["aw"] },
  "application/at+jwt": { "source": "iana" },
  "application/atf": { "source": "iana" },
  "application/atfx": { "source": "iana" },
  "application/atom+xml": { "source": "iana", "compressible": true, "extensions": ["atom"] },
  "application/atomcat+xml": { "source": "iana", "compressible": true, "extensions": ["atomcat"] },
  "application/atomdeleted+xml": { "source": "iana", "compressible": true, "extensions": ["atomdeleted"] },
  "application/atomicmail": { "source": "iana" },
  "application/atomsvc+xml": { "source": "iana", "compressible": true, "extensions": ["atomsvc"] },
  "application/atsc-dwd+xml": { "source": "iana", "compressible": true, "extensions": ["dwd"] },
  "application/atsc-dynamic-event-message": { "source": "iana" },
  "application/atsc-held+xml": { "source": "iana", "compressible": true, "extensions": ["held"] },
  "application/atsc-rdt+json": { "source": "iana", "compressible": true },
  "application/atsc-rsat+xml": { "source": "iana", "compressible": true, "extensions": ["rsat"] },
  "application/atxml": { "source": "iana" },
  "application/auth-policy+xml": { "source": "iana", "compressible": true },
  "application/bacnet-xdd+zip": { "source": "iana", "compressible": false },
  "application/batch-smtp": { "source": "iana" },
  "application/bdoc": { "compressible": false, "extensions": ["bdoc"] },
  "application/beep+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/calendar+json": { "source": "iana", "compressible": true },
  "application/calendar+xml": { "source": "iana", "compressible": true, "extensions": ["xcs"] },
  "application/call-completion": { "source": "iana" },
  "application/cals-1840": { "source": "iana" },
  "application/captive+json": { "source": "iana", "compressible": true },
  "application/cbor": { "source": "iana" },
  "application/cbor-seq": { "source": "iana" },
  "application/cccex": { "source": "iana" },
  "application/ccmp+xml": { "source": "iana", "compressible": true },
  "application/ccxml+xml": { "source": "iana", "compressible": true, "extensions": ["ccxml"] },
  "application/cdfx+xml": { "source": "iana", "compressible": true, "extensions": ["cdfx"] },
  "application/cdmi-capability": { "source": "iana", "extensions": ["cdmia"] },
  "application/cdmi-container": { "source": "iana", "extensions": ["cdmic"] },
  "application/cdmi-domain": { "source": "iana", "extensions": ["cdmid"] },
  "application/cdmi-object": { "source": "iana", "extensions": ["cdmio"] },
  "application/cdmi-queue": { "source": "iana", "extensions": ["cdmiq"] },
  "application/cdni": { "source": "iana" },
  "application/cea": { "source": "iana" },
  "application/cea-2018+xml": { "source": "iana", "compressible": true },
  "application/cellml+xml": { "source": "iana", "compressible": true },
  "application/cfw": { "source": "iana" },
  "application/city+json": { "source": "iana", "compressible": true },
  "application/clr": { "source": "iana" },
  "application/clue+xml": { "source": "iana", "compressible": true },
  "application/clue_info+xml": { "source": "iana", "compressible": true },
  "application/cms": { "source": "iana" },
  "application/cnrp+xml": { "source": "iana", "compressible": true },
  "application/coap-group+json": { "source": "iana", "compressible": true },
  "application/coap-payload": { "source": "iana" },
  "application/commonground": { "source": "iana" },
  "application/conference-info+xml": { "source": "iana", "compressible": true },
  "application/cose": { "source": "iana" },
  "application/cose-key": { "source": "iana" },
  "application/cose-key-set": { "source": "iana" },
  "application/cpl+xml": { "source": "iana", "compressible": true, "extensions": ["cpl"] },
  "application/csrattrs": { "source": "iana" },
  "application/csta+xml": { "source": "iana", "compressible": true },
  "application/cstadata+xml": { "source": "iana", "compressible": true },
  "application/csvm+json": { "source": "iana", "compressible": true },
  "application/cu-seeme": { "source": "apache", "extensions": ["cu"] },
  "application/cwt": { "source": "iana" },
  "application/cybercash": { "source": "iana" },
  "application/dart": { "compressible": true },
  "application/dash+xml": { "source": "iana", "compressible": true, "extensions": ["mpd"] },
  "application/dash-patch+xml": { "source": "iana", "compressible": true, "extensions": ["mpp"] },
  "application/dashdelta": { "source": "iana" },
  "application/davmount+xml": { "source": "iana", "compressible": true, "extensions": ["davmount"] },
  "application/dca-rft": { "source": "iana" },
  "application/dcd": { "source": "iana" },
  "application/dec-dx": { "source": "iana" },
  "application/dialog-info+xml": { "source": "iana", "compressible": true },
  "application/dicom": { "source": "iana" },
  "application/dicom+json": { "source": "iana", "compressible": true },
  "application/dicom+xml": { "source": "iana", "compressible": true },
  "application/dii": { "source": "iana" },
  "application/dit": { "source": "iana" },
  "application/dns": { "source": "iana" },
  "application/dns+json": { "source": "iana", "compressible": true },
  "application/dns-message": { "source": "iana" },
  "application/docbook+xml": { "source": "apache", "compressible": true, "extensions": ["dbk"] },
  "application/dots+cbor": { "source": "iana" },
  "application/dskpp+xml": { "source": "iana", "compressible": true },
  "application/dssc+der": { "source": "iana", "extensions": ["dssc"] },
  "application/dssc+xml": { "source": "iana", "compressible": true, "extensions": ["xdssc"] },
  "application/dvcs": { "source": "iana" },
  "application/ecmascript": { "source": "iana", "compressible": true, "extensions": ["es", "ecma"] },
  "application/edi-consent": { "source": "iana" },
  "application/edi-x12": { "source": "iana", "compressible": false },
  "application/edifact": { "source": "iana", "compressible": false },
  "application/efi": { "source": "iana" },
  "application/elm+json": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/elm+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.cap+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/emergencycalldata.comment+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.control+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.deviceinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.ecall.msd": { "source": "iana" },
  "application/emergencycalldata.providerinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.serviceinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.subscriberinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.veds+xml": { "source": "iana", "compressible": true },
  "application/emma+xml": { "source": "iana", "compressible": true, "extensions": ["emma"] },
  "application/emotionml+xml": { "source": "iana", "compressible": true, "extensions": ["emotionml"] },
  "application/encaprtp": { "source": "iana" },
  "application/epp+xml": { "source": "iana", "compressible": true },
  "application/epub+zip": { "source": "iana", "compressible": false, "extensions": ["epub"] },
  "application/eshop": { "source": "iana" },
  "application/exi": { "source": "iana", "extensions": ["exi"] },
  "application/expect-ct-report+json": { "source": "iana", "compressible": true },
  "application/express": { "source": "iana", "extensions": ["exp"] },
  "application/fastinfoset": { "source": "iana" },
  "application/fastsoap": { "source": "iana" },
  "application/fdt+xml": { "source": "iana", "compressible": true, "extensions": ["fdt"] },
  "application/fhir+json": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/fhir+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/fido.trusted-apps+json": { "compressible": true },
  "application/fits": { "source": "iana" },
  "application/flexfec": { "source": "iana" },
  "application/font-sfnt": { "source": "iana" },
  "application/font-tdpfr": { "source": "iana", "extensions": ["pfr"] },
  "application/font-woff": { "source": "iana", "compressible": false },
  "application/framework-attributes+xml": { "source": "iana", "compressible": true },
  "application/geo+json": { "source": "iana", "compressible": true, "extensions": ["geojson"] },
  "application/geo+json-seq": { "source": "iana" },
  "application/geopackage+sqlite3": { "source": "iana" },
  "application/geoxacml+xml": { "source": "iana", "compressible": true },
  "application/gltf-buffer": { "source": "iana" },
  "application/gml+xml": { "source": "iana", "compressible": true, "extensions": ["gml"] },
  "application/gpx+xml": { "source": "apache", "compressible": true, "extensions": ["gpx"] },
  "application/gxf": { "source": "apache", "extensions": ["gxf"] },
  "application/gzip": { "source": "iana", "compressible": false, "extensions": ["gz"] },
  "application/h224": { "source": "iana" },
  "application/held+xml": { "source": "iana", "compressible": true },
  "application/hjson": { "extensions": ["hjson"] },
  "application/http": { "source": "iana" },
  "application/hyperstudio": { "source": "iana", "extensions": ["stk"] },
  "application/ibe-key-request+xml": { "source": "iana", "compressible": true },
  "application/ibe-pkg-reply+xml": { "source": "iana", "compressible": true },
  "application/ibe-pp-data": { "source": "iana" },
  "application/iges": { "source": "iana" },
  "application/im-iscomposing+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/index": { "source": "iana" },
  "application/index.cmd": { "source": "iana" },
  "application/index.obj": { "source": "iana" },
  "application/index.response": { "source": "iana" },
  "application/index.vnd": { "source": "iana" },
  "application/inkml+xml": { "source": "iana", "compressible": true, "extensions": ["ink", "inkml"] },
  "application/iotp": { "source": "iana" },
  "application/ipfix": { "source": "iana", "extensions": ["ipfix"] },
  "application/ipp": { "source": "iana" },
  "application/isup": { "source": "iana" },
  "application/its+xml": { "source": "iana", "compressible": true, "extensions": ["its"] },
  "application/java-archive": { "source": "apache", "compressible": false, "extensions": ["jar", "war", "ear"] },
  "application/java-serialized-object": { "source": "apache", "compressible": false, "extensions": ["ser"] },
  "application/java-vm": { "source": "apache", "compressible": false, "extensions": ["class"] },
  "application/javascript": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["js", "mjs"] },
  "application/jf2feed+json": { "source": "iana", "compressible": true },
  "application/jose": { "source": "iana" },
  "application/jose+json": { "source": "iana", "compressible": true },
  "application/jrd+json": { "source": "iana", "compressible": true },
  "application/jscalendar+json": { "source": "iana", "compressible": true },
  "application/json": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["json", "map"] },
  "application/json-patch+json": { "source": "iana", "compressible": true },
  "application/json-seq": { "source": "iana" },
  "application/json5": { "extensions": ["json5"] },
  "application/jsonml+json": { "source": "apache", "compressible": true, "extensions": ["jsonml"] },
  "application/jwk+json": { "source": "iana", "compressible": true },
  "application/jwk-set+json": { "source": "iana", "compressible": true },
  "application/jwt": { "source": "iana" },
  "application/kpml-request+xml": { "source": "iana", "compressible": true },
  "application/kpml-response+xml": { "source": "iana", "compressible": true },
  "application/ld+json": { "source": "iana", "compressible": true, "extensions": ["jsonld"] },
  "application/lgr+xml": { "source": "iana", "compressible": true, "extensions": ["lgr"] },
  "application/link-format": { "source": "iana" },
  "application/load-control+xml": { "source": "iana", "compressible": true },
  "application/lost+xml": { "source": "iana", "compressible": true, "extensions": ["lostxml"] },
  "application/lostsync+xml": { "source": "iana", "compressible": true },
  "application/lpf+zip": { "source": "iana", "compressible": false },
  "application/lxf": { "source": "iana" },
  "application/mac-binhex40": { "source": "iana", "extensions": ["hqx"] },
  "application/mac-compactpro": { "source": "apache", "extensions": ["cpt"] },
  "application/macwriteii": { "source": "iana" },
  "application/mads+xml": { "source": "iana", "compressible": true, "extensions": ["mads"] },
  "application/manifest+json": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["webmanifest"] },
  "application/marc": { "source": "iana", "extensions": ["mrc"] },
  "application/marcxml+xml": { "source": "iana", "compressible": true, "extensions": ["mrcx"] },
  "application/mathematica": { "source": "iana", "extensions": ["ma", "nb", "mb"] },
  "application/mathml+xml": { "source": "iana", "compressible": true, "extensions": ["mathml"] },
  "application/mathml-content+xml": { "source": "iana", "compressible": true },
  "application/mathml-presentation+xml": { "source": "iana", "compressible": true },
  "application/mbms-associated-procedure-description+xml": { "source": "iana", "compressible": true },
  "application/mbms-deregister+xml": { "source": "iana", "compressible": true },
  "application/mbms-envelope+xml": { "source": "iana", "compressible": true },
  "application/mbms-msk+xml": { "source": "iana", "compressible": true },
  "application/mbms-msk-response+xml": { "source": "iana", "compressible": true },
  "application/mbms-protection-description+xml": { "source": "iana", "compressible": true },
  "application/mbms-reception-report+xml": { "source": "iana", "compressible": true },
  "application/mbms-register+xml": { "source": "iana", "compressible": true },
  "application/mbms-register-response+xml": { "source": "iana", "compressible": true },
  "application/mbms-schedule+xml": { "source": "iana", "compressible": true },
  "application/mbms-user-service-description+xml": { "source": "iana", "compressible": true },
  "application/mbox": { "source": "iana", "extensions": ["mbox"] },
  "application/media-policy-dataset+xml": { "source": "iana", "compressible": true, "extensions": ["mpf"] },
  "application/media_control+xml": { "source": "iana", "compressible": true },
  "application/mediaservercontrol+xml": { "source": "iana", "compressible": true, "extensions": ["mscml"] },
  "application/merge-patch+json": { "source": "iana", "compressible": true },
  "application/metalink+xml": { "source": "apache", "compressible": true, "extensions": ["metalink"] },
  "application/metalink4+xml": { "source": "iana", "compressible": true, "extensions": ["meta4"] },
  "application/mets+xml": { "source": "iana", "compressible": true, "extensions": ["mets"] },
  "application/mf4": { "source": "iana" },
  "application/mikey": { "source": "iana" },
  "application/mipc": { "source": "iana" },
  "application/missing-blocks+cbor-seq": { "source": "iana" },
  "application/mmt-aei+xml": { "source": "iana", "compressible": true, "extensions": ["maei"] },
  "application/mmt-usd+xml": { "source": "iana", "compressible": true, "extensions": ["musd"] },
  "application/mods+xml": { "source": "iana", "compressible": true, "extensions": ["mods"] },
  "application/moss-keys": { "source": "iana" },
  "application/moss-signature": { "source": "iana" },
  "application/mosskey-data": { "source": "iana" },
  "application/mosskey-request": { "source": "iana" },
  "application/mp21": { "source": "iana", "extensions": ["m21", "mp21"] },
  "application/mp4": { "source": "iana", "extensions": ["mp4s", "m4p"] },
  "application/mpeg4-generic": { "source": "iana" },
  "application/mpeg4-iod": { "source": "iana" },
  "application/mpeg4-iod-xmt": { "source": "iana" },
  "application/mrb-consumer+xml": { "source": "iana", "compressible": true },
  "application/mrb-publish+xml": { "source": "iana", "compressible": true },
  "application/msc-ivr+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/msc-mixer+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/msword": { "source": "iana", "compressible": false, "extensions": ["doc", "dot"] },
  "application/mud+json": { "source": "iana", "compressible": true },
  "application/multipart-core": { "source": "iana" },
  "application/mxf": { "source": "iana", "extensions": ["mxf"] },
  "application/n-quads": { "source": "iana", "extensions": ["nq"] },
  "application/n-triples": { "source": "iana", "extensions": ["nt"] },
  "application/nasdata": { "source": "iana" },
  "application/news-checkgroups": { "source": "iana", "charset": "US-ASCII" },
  "application/news-groupinfo": { "source": "iana", "charset": "US-ASCII" },
  "application/news-transmission": { "source": "iana" },
  "application/nlsml+xml": { "source": "iana", "compressible": true },
  "application/node": { "source": "iana", "extensions": ["cjs"] },
  "application/nss": { "source": "iana" },
  "application/oauth-authz-req+jwt": { "source": "iana" },
  "application/oblivious-dns-message": { "source": "iana" },
  "application/ocsp-request": { "source": "iana" },
  "application/ocsp-response": { "source": "iana" },
  "application/octet-stream": { "source": "iana", "compressible": false, "extensions": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"] },
  "application/oda": { "source": "iana", "extensions": ["oda"] },
  "application/odm+xml": { "source": "iana", "compressible": true },
  "application/odx": { "source": "iana" },
  "application/oebps-package+xml": { "source": "iana", "compressible": true, "extensions": ["opf"] },
  "application/ogg": { "source": "iana", "compressible": false, "extensions": ["ogx"] },
  "application/omdoc+xml": { "source": "apache", "compressible": true, "extensions": ["omdoc"] },
  "application/onenote": { "source": "apache", "extensions": ["onetoc", "onetoc2", "onetmp", "onepkg"] },
  "application/opc-nodeset+xml": { "source": "iana", "compressible": true },
  "application/oscore": { "source": "iana" },
  "application/oxps": { "source": "iana", "extensions": ["oxps"] },
  "application/p21": { "source": "iana" },
  "application/p21+zip": { "source": "iana", "compressible": false },
  "application/p2p-overlay+xml": { "source": "iana", "compressible": true, "extensions": ["relo"] },
  "application/parityfec": { "source": "iana" },
  "application/passport": { "source": "iana" },
  "application/patch-ops-error+xml": { "source": "iana", "compressible": true, "extensions": ["xer"] },
  "application/pdf": { "source": "iana", "compressible": false, "extensions": ["pdf"] },
  "application/pdx": { "source": "iana" },
  "application/pem-certificate-chain": { "source": "iana" },
  "application/pgp-encrypted": { "source": "iana", "compressible": false, "extensions": ["pgp"] },
  "application/pgp-keys": { "source": "iana", "extensions": ["asc"] },
  "application/pgp-signature": { "source": "iana", "extensions": ["asc", "sig"] },
  "application/pics-rules": { "source": "apache", "extensions": ["prf"] },
  "application/pidf+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/pidf-diff+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/pkcs10": { "source": "iana", "extensions": ["p10"] },
  "application/pkcs12": { "source": "iana" },
  "application/pkcs7-mime": { "source": "iana", "extensions": ["p7m", "p7c"] },
  "application/pkcs7-signature": { "source": "iana", "extensions": ["p7s"] },
  "application/pkcs8": { "source": "iana", "extensions": ["p8"] },
  "application/pkcs8-encrypted": { "source": "iana" },
  "application/pkix-attr-cert": { "source": "iana", "extensions": ["ac"] },
  "application/pkix-cert": { "source": "iana", "extensions": ["cer"] },
  "application/pkix-crl": { "source": "iana", "extensions": ["crl"] },
  "application/pkix-pkipath": { "source": "iana", "extensions": ["pkipath"] },
  "application/pkixcmp": { "source": "iana", "extensions": ["pki"] },
  "application/pls+xml": { "source": "iana", "compressible": true, "extensions": ["pls"] },
  "application/poc-settings+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/postscript": { "source": "iana", "compressible": true, "extensions": ["ai", "eps", "ps"] },
  "application/ppsp-tracker+json": { "source": "iana", "compressible": true },
  "application/problem+json": { "source": "iana", "compressible": true },
  "application/problem+xml": { "source": "iana", "compressible": true },
  "application/provenance+xml": { "source": "iana", "compressible": true, "extensions": ["provx"] },
  "application/prs.alvestrand.titrax-sheet": { "source": "iana" },
  "application/prs.cww": { "source": "iana", "extensions": ["cww"] },
  "application/prs.cyn": { "source": "iana", "charset": "7-BIT" },
  "application/prs.hpub+zip": { "source": "iana", "compressible": false },
  "application/prs.nprend": { "source": "iana" },
  "application/prs.plucker": { "source": "iana" },
  "application/prs.rdf-xml-crypt": { "source": "iana" },
  "application/prs.xsf+xml": { "source": "iana", "compressible": true },
  "application/pskc+xml": { "source": "iana", "compressible": true, "extensions": ["pskcxml"] },
  "application/pvd+json": { "source": "iana", "compressible": true },
  "application/qsig": { "source": "iana" },
  "application/raml+yaml": { "compressible": true, "extensions": ["raml"] },
  "application/raptorfec": { "source": "iana" },
  "application/rdap+json": { "source": "iana", "compressible": true },
  "application/rdf+xml": { "source": "iana", "compressible": true, "extensions": ["rdf", "owl"] },
  "application/reginfo+xml": { "source": "iana", "compressible": true, "extensions": ["rif"] },
  "application/relax-ng-compact-syntax": { "source": "iana", "extensions": ["rnc"] },
  "application/remote-printing": { "source": "iana" },
  "application/reputon+json": { "source": "iana", "compressible": true },
  "application/resource-lists+xml": { "source": "iana", "compressible": true, "extensions": ["rl"] },
  "application/resource-lists-diff+xml": { "source": "iana", "compressible": true, "extensions": ["rld"] },
  "application/rfc+xml": { "source": "iana", "compressible": true },
  "application/riscos": { "source": "iana" },
  "application/rlmi+xml": { "source": "iana", "compressible": true },
  "application/rls-services+xml": { "source": "iana", "compressible": true, "extensions": ["rs"] },
  "application/route-apd+xml": { "source": "iana", "compressible": true, "extensions": ["rapd"] },
  "application/route-s-tsid+xml": { "source": "iana", "compressible": true, "extensions": ["sls"] },
  "application/route-usd+xml": { "source": "iana", "compressible": true, "extensions": ["rusd"] },
  "application/rpki-ghostbusters": { "source": "iana", "extensions": ["gbr"] },
  "application/rpki-manifest": { "source": "iana", "extensions": ["mft"] },
  "application/rpki-publication": { "source": "iana" },
  "application/rpki-roa": { "source": "iana", "extensions": ["roa"] },
  "application/rpki-updown": { "source": "iana" },
  "application/rsd+xml": { "source": "apache", "compressible": true, "extensions": ["rsd"] },
  "application/rss+xml": { "source": "apache", "compressible": true, "extensions": ["rss"] },
  "application/rtf": { "source": "iana", "compressible": true, "extensions": ["rtf"] },
  "application/rtploopback": { "source": "iana" },
  "application/rtx": { "source": "iana" },
  "application/samlassertion+xml": { "source": "iana", "compressible": true },
  "application/samlmetadata+xml": { "source": "iana", "compressible": true },
  "application/sarif+json": { "source": "iana", "compressible": true },
  "application/sarif-external-properties+json": { "source": "iana", "compressible": true },
  "application/sbe": { "source": "iana" },
  "application/sbml+xml": { "source": "iana", "compressible": true, "extensions": ["sbml"] },
  "application/scaip+xml": { "source": "iana", "compressible": true },
  "application/scim+json": { "source": "iana", "compressible": true },
  "application/scvp-cv-request": { "source": "iana", "extensions": ["scq"] },
  "application/scvp-cv-response": { "source": "iana", "extensions": ["scs"] },
  "application/scvp-vp-request": { "source": "iana", "extensions": ["spq"] },
  "application/scvp-vp-response": { "source": "iana", "extensions": ["spp"] },
  "application/sdp": { "source": "iana", "extensions": ["sdp"] },
  "application/secevent+jwt": { "source": "iana" },
  "application/senml+cbor": { "source": "iana" },
  "application/senml+json": { "source": "iana", "compressible": true },
  "application/senml+xml": { "source": "iana", "compressible": true, "extensions": ["senmlx"] },
  "application/senml-etch+cbor": { "source": "iana" },
  "application/senml-etch+json": { "source": "iana", "compressible": true },
  "application/senml-exi": { "source": "iana" },
  "application/sensml+cbor": { "source": "iana" },
  "application/sensml+json": { "source": "iana", "compressible": true },
  "application/sensml+xml": { "source": "iana", "compressible": true, "extensions": ["sensmlx"] },
  "application/sensml-exi": { "source": "iana" },
  "application/sep+xml": { "source": "iana", "compressible": true },
  "application/sep-exi": { "source": "iana" },
  "application/session-info": { "source": "iana" },
  "application/set-payment": { "source": "iana" },
  "application/set-payment-initiation": { "source": "iana", "extensions": ["setpay"] },
  "application/set-registration": { "source": "iana" },
  "application/set-registration-initiation": { "source": "iana", "extensions": ["setreg"] },
  "application/sgml": { "source": "iana" },
  "application/sgml-open-catalog": { "source": "iana" },
  "application/shf+xml": { "source": "iana", "compressible": true, "extensions": ["shf"] },
  "application/sieve": { "source": "iana", "extensions": ["siv", "sieve"] },
  "application/simple-filter+xml": { "source": "iana", "compressible": true },
  "application/simple-message-summary": { "source": "iana" },
  "application/simplesymbolcontainer": { "source": "iana" },
  "application/sipc": { "source": "iana" },
  "application/slate": { "source": "iana" },
  "application/smil": { "source": "iana" },
  "application/smil+xml": { "source": "iana", "compressible": true, "extensions": ["smi", "smil"] },
  "application/smpte336m": { "source": "iana" },
  "application/soap+fastinfoset": { "source": "iana" },
  "application/soap+xml": { "source": "iana", "compressible": true },
  "application/sparql-query": { "source": "iana", "extensions": ["rq"] },
  "application/sparql-results+xml": { "source": "iana", "compressible": true, "extensions": ["srx"] },
  "application/spdx+json": { "source": "iana", "compressible": true },
  "application/spirits-event+xml": { "source": "iana", "compressible": true },
  "application/sql": { "source": "iana" },
  "application/srgs": { "source": "iana", "extensions": ["gram"] },
  "application/srgs+xml": { "source": "iana", "compressible": true, "extensions": ["grxml"] },
  "application/sru+xml": { "source": "iana", "compressible": true, "extensions": ["sru"] },
  "application/ssdl+xml": { "source": "apache", "compressible": true, "extensions": ["ssdl"] },
  "application/ssml+xml": { "source": "iana", "compressible": true, "extensions": ["ssml"] },
  "application/stix+json": { "source": "iana", "compressible": true },
  "application/swid+xml": { "source": "iana", "compressible": true, "extensions": ["swidtag"] },
  "application/tamp-apex-update": { "source": "iana" },
  "application/tamp-apex-update-confirm": { "source": "iana" },
  "application/tamp-community-update": { "source": "iana" },
  "application/tamp-community-update-confirm": { "source": "iana" },
  "application/tamp-error": { "source": "iana" },
  "application/tamp-sequence-adjust": { "source": "iana" },
  "application/tamp-sequence-adjust-confirm": { "source": "iana" },
  "application/tamp-status-query": { "source": "iana" },
  "application/tamp-status-response": { "source": "iana" },
  "application/tamp-update": { "source": "iana" },
  "application/tamp-update-confirm": { "source": "iana" },
  "application/tar": { "compressible": true },
  "application/taxii+json": { "source": "iana", "compressible": true },
  "application/td+json": { "source": "iana", "compressible": true },
  "application/tei+xml": { "source": "iana", "compressible": true, "extensions": ["tei", "teicorpus"] },
  "application/tetra_isi": { "source": "iana" },
  "application/thraud+xml": { "source": "iana", "compressible": true, "extensions": ["tfi"] },
  "application/timestamp-query": { "source": "iana" },
  "application/timestamp-reply": { "source": "iana" },
  "application/timestamped-data": { "source": "iana", "extensions": ["tsd"] },
  "application/tlsrpt+gzip": { "source": "iana" },
  "application/tlsrpt+json": { "source": "iana", "compressible": true },
  "application/tnauthlist": { "source": "iana" },
  "application/token-introspection+jwt": { "source": "iana" },
  "application/toml": { "compressible": true, "extensions": ["toml"] },
  "application/trickle-ice-sdpfrag": { "source": "iana" },
  "application/trig": { "source": "iana", "extensions": ["trig"] },
  "application/ttml+xml": { "source": "iana", "compressible": true, "extensions": ["ttml"] },
  "application/tve-trigger": { "source": "iana" },
  "application/tzif": { "source": "iana" },
  "application/tzif-leap": { "source": "iana" },
  "application/ubjson": { "compressible": false, "extensions": ["ubj"] },
  "application/ulpfec": { "source": "iana" },
  "application/urc-grpsheet+xml": { "source": "iana", "compressible": true },
  "application/urc-ressheet+xml": { "source": "iana", "compressible": true, "extensions": ["rsheet"] },
  "application/urc-targetdesc+xml": { "source": "iana", "compressible": true, "extensions": ["td"] },
  "application/urc-uisocketdesc+xml": { "source": "iana", "compressible": true },
  "application/vcard+json": { "source": "iana", "compressible": true },
  "application/vcard+xml": { "source": "iana", "compressible": true },
  "application/vemmi": { "source": "iana" },
  "application/vividence.scriptfile": { "source": "apache" },
  "application/vnd.1000minds.decision-model+xml": { "source": "iana", "compressible": true, "extensions": ["1km"] },
  "application/vnd.3gpp-prose+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp-prose-pc3ch+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp-v2x-local-service-information": { "source": "iana" },
  "application/vnd.3gpp.5gnas": { "source": "iana" },
  "application/vnd.3gpp.access-transfer-events+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.bsf+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.gmop+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.gtpc": { "source": "iana" },
  "application/vnd.3gpp.interworking-data": { "source": "iana" },
  "application/vnd.3gpp.lpp": { "source": "iana" },
  "application/vnd.3gpp.mc-signalling-ear": { "source": "iana" },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-payload": { "source": "iana" },
  "application/vnd.3gpp.mcdata-service-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-signalling": { "source": "iana" },
  "application/vnd.3gpp.mcdata-ue-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-user-profile+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-floor-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-location-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-service-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-signed+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-ue-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-user-profile+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-location-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-service-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-ue-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-user-profile+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mid-call+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.ngap": { "source": "iana" },
  "application/vnd.3gpp.pfcp": { "source": "iana" },
  "application/vnd.3gpp.pic-bw-large": { "source": "iana", "extensions": ["plb"] },
  "application/vnd.3gpp.pic-bw-small": { "source": "iana", "extensions": ["psb"] },
  "application/vnd.3gpp.pic-bw-var": { "source": "iana", "extensions": ["pvb"] },
  "application/vnd.3gpp.s1ap": { "source": "iana" },
  "application/vnd.3gpp.sms": { "source": "iana" },
  "application/vnd.3gpp.sms+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.srvcc-ext+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.srvcc-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.state-and-event-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.ussd+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp2.bcmcsinfo+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp2.sms": { "source": "iana" },
  "application/vnd.3gpp2.tcap": { "source": "iana", "extensions": ["tcap"] },
  "application/vnd.3lightssoftware.imagescal": { "source": "iana" },
  "application/vnd.3m.post-it-notes": { "source": "iana", "extensions": ["pwn"] },
  "application/vnd.accpac.simply.aso": { "source": "iana", "extensions": ["aso"] },
  "application/vnd.accpac.simply.imp": { "source": "iana", "extensions": ["imp"] },
  "application/vnd.acucobol": { "source": "iana", "extensions": ["acu"] },
  "application/vnd.acucorp": { "source": "iana", "extensions": ["atc", "acutc"] },
  "application/vnd.adobe.air-application-installer-package+zip": { "source": "apache", "compressible": false, "extensions": ["air"] },
  "application/vnd.adobe.flash.movie": { "source": "iana" },
  "application/vnd.adobe.formscentral.fcdt": { "source": "iana", "extensions": ["fcdt"] },
  "application/vnd.adobe.fxp": { "source": "iana", "extensions": ["fxp", "fxpl"] },
  "application/vnd.adobe.partial-upload": { "source": "iana" },
  "application/vnd.adobe.xdp+xml": { "source": "iana", "compressible": true, "extensions": ["xdp"] },
  "application/vnd.adobe.xfdf": { "source": "iana", "extensions": ["xfdf"] },
  "application/vnd.aether.imp": { "source": "iana" },
  "application/vnd.afpc.afplinedata": { "source": "iana" },
  "application/vnd.afpc.afplinedata-pagedef": { "source": "iana" },
  "application/vnd.afpc.cmoca-cmresource": { "source": "iana" },
  "application/vnd.afpc.foca-charset": { "source": "iana" },
  "application/vnd.afpc.foca-codedfont": { "source": "iana" },
  "application/vnd.afpc.foca-codepage": { "source": "iana" },
  "application/vnd.afpc.modca": { "source": "iana" },
  "application/vnd.afpc.modca-cmtable": { "source": "iana" },
  "application/vnd.afpc.modca-formdef": { "source": "iana" },
  "application/vnd.afpc.modca-mediummap": { "source": "iana" },
  "application/vnd.afpc.modca-objectcontainer": { "source": "iana" },
  "application/vnd.afpc.modca-overlay": { "source": "iana" },
  "application/vnd.afpc.modca-pagesegment": { "source": "iana" },
  "application/vnd.age": { "source": "iana", "extensions": ["age"] },
  "application/vnd.ah-barcode": { "source": "iana" },
  "application/vnd.ahead.space": { "source": "iana", "extensions": ["ahead"] },
  "application/vnd.airzip.filesecure.azf": { "source": "iana", "extensions": ["azf"] },
  "application/vnd.airzip.filesecure.azs": { "source": "iana", "extensions": ["azs"] },
  "application/vnd.amadeus+json": { "source": "iana", "compressible": true },
  "application/vnd.amazon.ebook": { "source": "apache", "extensions": ["azw"] },
  "application/vnd.amazon.mobi8-ebook": { "source": "iana" },
  "application/vnd.americandynamics.acc": { "source": "iana", "extensions": ["acc"] },
  "application/vnd.amiga.ami": { "source": "iana", "extensions": ["ami"] },
  "application/vnd.amundsen.maze+xml": { "source": "iana", "compressible": true },
  "application/vnd.android.ota": { "source": "iana" },
  "application/vnd.android.package-archive": { "source": "apache", "compressible": false, "extensions": ["apk"] },
  "application/vnd.anki": { "source": "iana" },
  "application/vnd.anser-web-certificate-issue-initiation": { "source": "iana", "extensions": ["cii"] },
  "application/vnd.anser-web-funds-transfer-initiation": { "source": "apache", "extensions": ["fti"] },
  "application/vnd.antix.game-component": { "source": "iana", "extensions": ["atx"] },
  "application/vnd.apache.arrow.file": { "source": "iana" },
  "application/vnd.apache.arrow.stream": { "source": "iana" },
  "application/vnd.apache.thrift.binary": { "source": "iana" },
  "application/vnd.apache.thrift.compact": { "source": "iana" },
  "application/vnd.apache.thrift.json": { "source": "iana" },
  "application/vnd.api+json": { "source": "iana", "compressible": true },
  "application/vnd.aplextor.warrp+json": { "source": "iana", "compressible": true },
  "application/vnd.apothekende.reservation+json": { "source": "iana", "compressible": true },
  "application/vnd.apple.installer+xml": { "source": "iana", "compressible": true, "extensions": ["mpkg"] },
  "application/vnd.apple.keynote": { "source": "iana", "extensions": ["key"] },
  "application/vnd.apple.mpegurl": { "source": "iana", "extensions": ["m3u8"] },
  "application/vnd.apple.numbers": { "source": "iana", "extensions": ["numbers"] },
  "application/vnd.apple.pages": { "source": "iana", "extensions": ["pages"] },
  "application/vnd.apple.pkpass": { "compressible": false, "extensions": ["pkpass"] },
  "application/vnd.arastra.swi": { "source": "iana" },
  "application/vnd.aristanetworks.swi": { "source": "iana", "extensions": ["swi"] },
  "application/vnd.artisan+json": { "source": "iana", "compressible": true },
  "application/vnd.artsquare": { "source": "iana" },
  "application/vnd.astraea-software.iota": { "source": "iana", "extensions": ["iota"] },
  "application/vnd.audiograph": { "source": "iana", "extensions": ["aep"] },
  "application/vnd.autopackage": { "source": "iana" },
  "application/vnd.avalon+json": { "source": "iana", "compressible": true },
  "application/vnd.avistar+xml": { "source": "iana", "compressible": true },
  "application/vnd.balsamiq.bmml+xml": { "source": "iana", "compressible": true, "extensions": ["bmml"] },
  "application/vnd.balsamiq.bmpr": { "source": "iana" },
  "application/vnd.banana-accounting": { "source": "iana" },
  "application/vnd.bbf.usp.error": { "source": "iana" },
  "application/vnd.bbf.usp.msg": { "source": "iana" },
  "application/vnd.bbf.usp.msg+json": { "source": "iana", "compressible": true },
  "application/vnd.bekitzur-stech+json": { "source": "iana", "compressible": true },
  "application/vnd.bint.med-content": { "source": "iana" },
  "application/vnd.biopax.rdf+xml": { "source": "iana", "compressible": true },
  "application/vnd.blink-idb-value-wrapper": { "source": "iana" },
  "application/vnd.blueice.multipass": { "source": "iana", "extensions": ["mpm"] },
  "application/vnd.bluetooth.ep.oob": { "source": "iana" },
  "application/vnd.bluetooth.le.oob": { "source": "iana" },
  "application/vnd.bmi": { "source": "iana", "extensions": ["bmi"] },
  "application/vnd.bpf": { "source": "iana" },
  "application/vnd.bpf3": { "source": "iana" },
  "application/vnd.businessobjects": { "source": "iana", "extensions": ["rep"] },
  "application/vnd.byu.uapi+json": { "source": "iana", "compressible": true },
  "application/vnd.cab-jscript": { "source": "iana" },
  "application/vnd.canon-cpdl": { "source": "iana" },
  "application/vnd.canon-lips": { "source": "iana" },
  "application/vnd.capasystems-pg+json": { "source": "iana", "compressible": true },
  "application/vnd.cendio.thinlinc.clientconf": { "source": "iana" },
  "application/vnd.century-systems.tcp_stream": { "source": "iana" },
  "application/vnd.chemdraw+xml": { "source": "iana", "compressible": true, "extensions": ["cdxml"] },
  "application/vnd.chess-pgn": { "source": "iana" },
  "application/vnd.chipnuts.karaoke-mmd": { "source": "iana", "extensions": ["mmd"] },
  "application/vnd.ciedi": { "source": "iana" },
  "application/vnd.cinderella": { "source": "iana", "extensions": ["cdy"] },
  "application/vnd.cirpack.isdn-ext": { "source": "iana" },
  "application/vnd.citationstyles.style+xml": { "source": "iana", "compressible": true, "extensions": ["csl"] },
  "application/vnd.claymore": { "source": "iana", "extensions": ["cla"] },
  "application/vnd.cloanto.rp9": { "source": "iana", "extensions": ["rp9"] },
  "application/vnd.clonk.c4group": { "source": "iana", "extensions": ["c4g", "c4d", "c4f", "c4p", "c4u"] },
  "application/vnd.cluetrust.cartomobile-config": { "source": "iana", "extensions": ["c11amc"] },
  "application/vnd.cluetrust.cartomobile-config-pkg": { "source": "iana", "extensions": ["c11amz"] },
  "application/vnd.coffeescript": { "source": "iana" },
  "application/vnd.collabio.xodocuments.document": { "source": "iana" },
  "application/vnd.collabio.xodocuments.document-template": { "source": "iana" },
  "application/vnd.collabio.xodocuments.presentation": { "source": "iana" },
  "application/vnd.collabio.xodocuments.presentation-template": { "source": "iana" },
  "application/vnd.collabio.xodocuments.spreadsheet": { "source": "iana" },
  "application/vnd.collabio.xodocuments.spreadsheet-template": { "source": "iana" },
  "application/vnd.collection+json": { "source": "iana", "compressible": true },
  "application/vnd.collection.doc+json": { "source": "iana", "compressible": true },
  "application/vnd.collection.next+json": { "source": "iana", "compressible": true },
  "application/vnd.comicbook+zip": { "source": "iana", "compressible": false },
  "application/vnd.comicbook-rar": { "source": "iana" },
  "application/vnd.commerce-battelle": { "source": "iana" },
  "application/vnd.commonspace": { "source": "iana", "extensions": ["csp"] },
  "application/vnd.contact.cmsg": { "source": "iana", "extensions": ["cdbcmsg"] },
  "application/vnd.coreos.ignition+json": { "source": "iana", "compressible": true },
  "application/vnd.cosmocaller": { "source": "iana", "extensions": ["cmc"] },
  "application/vnd.crick.clicker": { "source": "iana", "extensions": ["clkx"] },
  "application/vnd.crick.clicker.keyboard": { "source": "iana", "extensions": ["clkk"] },
  "application/vnd.crick.clicker.palette": { "source": "iana", "extensions": ["clkp"] },
  "application/vnd.crick.clicker.template": { "source": "iana", "extensions": ["clkt"] },
  "application/vnd.crick.clicker.wordbank": { "source": "iana", "extensions": ["clkw"] },
  "application/vnd.criticaltools.wbs+xml": { "source": "iana", "compressible": true, "extensions": ["wbs"] },
  "application/vnd.cryptii.pipe+json": { "source": "iana", "compressible": true },
  "application/vnd.crypto-shade-file": { "source": "iana" },
  "application/vnd.cryptomator.encrypted": { "source": "iana" },
  "application/vnd.cryptomator.vault": { "source": "iana" },
  "application/vnd.ctc-posml": { "source": "iana", "extensions": ["pml"] },
  "application/vnd.ctct.ws+xml": { "source": "iana", "compressible": true },
  "application/vnd.cups-pdf": { "source": "iana" },
  "application/vnd.cups-postscript": { "source": "iana" },
  "application/vnd.cups-ppd": { "source": "iana", "extensions": ["ppd"] },
  "application/vnd.cups-raster": { "source": "iana" },
  "application/vnd.cups-raw": { "source": "iana" },
  "application/vnd.curl": { "source": "iana" },
  "application/vnd.curl.car": { "source": "apache", "extensions": ["car"] },
  "application/vnd.curl.pcurl": { "source": "apache", "extensions": ["pcurl"] },
  "application/vnd.cyan.dean.root+xml": { "source": "iana", "compressible": true },
  "application/vnd.cybank": { "source": "iana" },
  "application/vnd.cyclonedx+json": { "source": "iana", "compressible": true },
  "application/vnd.cyclonedx+xml": { "source": "iana", "compressible": true },
  "application/vnd.d2l.coursepackage1p0+zip": { "source": "iana", "compressible": false },
  "application/vnd.d3m-dataset": { "source": "iana" },
  "application/vnd.d3m-problem": { "source": "iana" },
  "application/vnd.dart": { "source": "iana", "compressible": true, "extensions": ["dart"] },
  "application/vnd.data-vision.rdz": { "source": "iana", "extensions": ["rdz"] },
  "application/vnd.datapackage+json": { "source": "iana", "compressible": true },
  "application/vnd.dataresource+json": { "source": "iana", "compressible": true },
  "application/vnd.dbf": { "source": "iana", "extensions": ["dbf"] },
  "application/vnd.debian.binary-package": { "source": "iana" },
  "application/vnd.dece.data": { "source": "iana", "extensions": ["uvf", "uvvf", "uvd", "uvvd"] },
  "application/vnd.dece.ttml+xml": { "source": "iana", "compressible": true, "extensions": ["uvt", "uvvt"] },
  "application/vnd.dece.unspecified": { "source": "iana", "extensions": ["uvx", "uvvx"] },
  "application/vnd.dece.zip": { "source": "iana", "extensions": ["uvz", "uvvz"] },
  "application/vnd.denovo.fcselayout-link": { "source": "iana", "extensions": ["fe_launch"] },
  "application/vnd.desmume.movie": { "source": "iana" },
  "application/vnd.dir-bi.plate-dl-nosuffix": { "source": "iana" },
  "application/vnd.dm.delegation+xml": { "source": "iana", "compressible": true },
  "application/vnd.dna": { "source": "iana", "extensions": ["dna"] },
  "application/vnd.document+json": { "source": "iana", "compressible": true },
  "application/vnd.dolby.mlp": { "source": "apache", "extensions": ["mlp"] },
  "application/vnd.dolby.mobile.1": { "source": "iana" },
  "application/vnd.dolby.mobile.2": { "source": "iana" },
  "application/vnd.doremir.scorecloud-binary-document": { "source": "iana" },
  "application/vnd.dpgraph": { "source": "iana", "extensions": ["dpg"] },
  "application/vnd.dreamfactory": { "source": "iana", "extensions": ["dfac"] },
  "application/vnd.drive+json": { "source": "iana", "compressible": true },
  "application/vnd.ds-keypoint": { "source": "apache", "extensions": ["kpxx"] },
  "application/vnd.dtg.local": { "source": "iana" },
  "application/vnd.dtg.local.flash": { "source": "iana" },
  "application/vnd.dtg.local.html": { "source": "iana" },
  "application/vnd.dvb.ait": { "source": "iana", "extensions": ["ait"] },
  "application/vnd.dvb.dvbisl+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.dvbj": { "source": "iana" },
  "application/vnd.dvb.esgcontainer": { "source": "iana" },
  "application/vnd.dvb.ipdcdftnotifaccess": { "source": "iana" },
  "application/vnd.dvb.ipdcesgaccess": { "source": "iana" },
  "application/vnd.dvb.ipdcesgaccess2": { "source": "iana" },
  "application/vnd.dvb.ipdcesgpdd": { "source": "iana" },
  "application/vnd.dvb.ipdcroaming": { "source": "iana" },
  "application/vnd.dvb.iptv.alfec-base": { "source": "iana" },
  "application/vnd.dvb.iptv.alfec-enhancement": { "source": "iana" },
  "application/vnd.dvb.notif-aggregate-root+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-container+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-generic+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-ia-msglist+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-ia-registration-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-ia-registration-response+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-init+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.pfr": { "source": "iana" },
  "application/vnd.dvb.service": { "source": "iana", "extensions": ["svc"] },
  "application/vnd.dxr": { "source": "iana" },
  "application/vnd.dynageo": { "source": "iana", "extensions": ["geo"] },
  "application/vnd.dzr": { "source": "iana" },
  "application/vnd.easykaraoke.cdgdownload": { "source": "iana" },
  "application/vnd.ecdis-update": { "source": "iana" },
  "application/vnd.ecip.rlp": { "source": "iana" },
  "application/vnd.eclipse.ditto+json": { "source": "iana", "compressible": true },
  "application/vnd.ecowin.chart": { "source": "iana", "extensions": ["mag"] },
  "application/vnd.ecowin.filerequest": { "source": "iana" },
  "application/vnd.ecowin.fileupdate": { "source": "iana" },
  "application/vnd.ecowin.series": { "source": "iana" },
  "application/vnd.ecowin.seriesrequest": { "source": "iana" },
  "application/vnd.ecowin.seriesupdate": { "source": "iana" },
  "application/vnd.efi.img": { "source": "iana" },
  "application/vnd.efi.iso": { "source": "iana" },
  "application/vnd.emclient.accessrequest+xml": { "source": "iana", "compressible": true },
  "application/vnd.enliven": { "source": "iana", "extensions": ["nml"] },
  "application/vnd.enphase.envoy": { "source": "iana" },
  "application/vnd.eprints.data+xml": { "source": "iana", "compressible": true },
  "application/vnd.epson.esf": { "source": "iana", "extensions": ["esf"] },
  "application/vnd.epson.msf": { "source": "iana", "extensions": ["msf"] },
  "application/vnd.epson.quickanime": { "source": "iana", "extensions": ["qam"] },
  "application/vnd.epson.salt": { "source": "iana", "extensions": ["slt"] },
  "application/vnd.epson.ssf": { "source": "iana", "extensions": ["ssf"] },
  "application/vnd.ericsson.quickcall": { "source": "iana" },
  "application/vnd.espass-espass+zip": { "source": "iana", "compressible": false },
  "application/vnd.eszigno3+xml": { "source": "iana", "compressible": true, "extensions": ["es3", "et3"] },
  "application/vnd.etsi.aoc+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.asic-e+zip": { "source": "iana", "compressible": false },
  "application/vnd.etsi.asic-s+zip": { "source": "iana", "compressible": false },
  "application/vnd.etsi.cug+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvcommand+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvdiscovery+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsad-bc+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsad-cod+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsad-npvr+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvservice+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsync+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvueprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.mcid+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.mheg5": { "source": "iana" },
  "application/vnd.etsi.overload-control-policy-dataset+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.pstn+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.sci+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.simservs+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.timestamp-token": { "source": "iana" },
  "application/vnd.etsi.tsl+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.tsl.der": { "source": "iana" },
  "application/vnd.eu.kasparian.car+json": { "source": "iana", "compressible": true },
  "application/vnd.eudora.data": { "source": "iana" },
  "application/vnd.evolv.ecig.profile": { "source": "iana" },
  "application/vnd.evolv.ecig.settings": { "source": "iana" },
  "application/vnd.evolv.ecig.theme": { "source": "iana" },
  "application/vnd.exstream-empower+zip": { "source": "iana", "compressible": false },
  "application/vnd.exstream-package": { "source": "iana" },
  "application/vnd.ezpix-album": { "source": "iana", "extensions": ["ez2"] },
  "application/vnd.ezpix-package": { "source": "iana", "extensions": ["ez3"] },
  "application/vnd.f-secure.mobile": { "source": "iana" },
  "application/vnd.familysearch.gedcom+zip": { "source": "iana", "compressible": false },
  "application/vnd.fastcopy-disk-image": { "source": "iana" },
  "application/vnd.fdf": { "source": "iana", "extensions": ["fdf"] },
  "application/vnd.fdsn.mseed": { "source": "iana", "extensions": ["mseed"] },
  "application/vnd.fdsn.seed": { "source": "iana", "extensions": ["seed", "dataless"] },
  "application/vnd.ffsns": { "source": "iana" },
  "application/vnd.ficlab.flb+zip": { "source": "iana", "compressible": false },
  "application/vnd.filmit.zfc": { "source": "iana" },
  "application/vnd.fints": { "source": "iana" },
  "application/vnd.firemonkeys.cloudcell": { "source": "iana" },
  "application/vnd.flographit": { "source": "iana", "extensions": ["gph"] },
  "application/vnd.fluxtime.clip": { "source": "iana", "extensions": ["ftc"] },
  "application/vnd.font-fontforge-sfd": { "source": "iana" },
  "application/vnd.framemaker": { "source": "iana", "extensions": ["fm", "frame", "maker", "book"] },
  "application/vnd.frogans.fnc": { "source": "iana", "extensions": ["fnc"] },
  "application/vnd.frogans.ltf": { "source": "iana", "extensions": ["ltf"] },
  "application/vnd.fsc.weblaunch": { "source": "iana", "extensions": ["fsc"] },
  "application/vnd.fujifilm.fb.docuworks": { "source": "iana" },
  "application/vnd.fujifilm.fb.docuworks.binder": { "source": "iana" },
  "application/vnd.fujifilm.fb.docuworks.container": { "source": "iana" },
  "application/vnd.fujifilm.fb.jfi+xml": { "source": "iana", "compressible": true },
  "application/vnd.fujitsu.oasys": { "source": "iana", "extensions": ["oas"] },
  "application/vnd.fujitsu.oasys2": { "source": "iana", "extensions": ["oa2"] },
  "application/vnd.fujitsu.oasys3": { "source": "iana", "extensions": ["oa3"] },
  "application/vnd.fujitsu.oasysgp": { "source": "iana", "extensions": ["fg5"] },
  "application/vnd.fujitsu.oasysprs": { "source": "iana", "extensions": ["bh2"] },
  "application/vnd.fujixerox.art-ex": { "source": "iana" },
  "application/vnd.fujixerox.art4": { "source": "iana" },
  "application/vnd.fujixerox.ddd": { "source": "iana", "extensions": ["ddd"] },
  "application/vnd.fujixerox.docuworks": { "source": "iana", "extensions": ["xdw"] },
  "application/vnd.fujixerox.docuworks.binder": { "source": "iana", "extensions": ["xbd"] },
  "application/vnd.fujixerox.docuworks.container": { "source": "iana" },
  "application/vnd.fujixerox.hbpl": { "source": "iana" },
  "application/vnd.fut-misnet": { "source": "iana" },
  "application/vnd.futoin+cbor": { "source": "iana" },
  "application/vnd.futoin+json": { "source": "iana", "compressible": true },
  "application/vnd.fuzzysheet": { "source": "iana", "extensions": ["fzs"] },
  "application/vnd.genomatix.tuxedo": { "source": "iana", "extensions": ["txd"] },
  "application/vnd.gentics.grd+json": { "source": "iana", "compressible": true },
  "application/vnd.geo+json": { "source": "iana", "compressible": true },
  "application/vnd.geocube+xml": { "source": "iana", "compressible": true },
  "application/vnd.geogebra.file": { "source": "iana", "extensions": ["ggb"] },
  "application/vnd.geogebra.slides": { "source": "iana" },
  "application/vnd.geogebra.tool": { "source": "iana", "extensions": ["ggt"] },
  "application/vnd.geometry-explorer": { "source": "iana", "extensions": ["gex", "gre"] },
  "application/vnd.geonext": { "source": "iana", "extensions": ["gxt"] },
  "application/vnd.geoplan": { "source": "iana", "extensions": ["g2w"] },
  "application/vnd.geospace": { "source": "iana", "extensions": ["g3w"] },
  "application/vnd.gerber": { "source": "iana" },
  "application/vnd.globalplatform.card-content-mgt": { "source": "iana" },
  "application/vnd.globalplatform.card-content-mgt-response": { "source": "iana" },
  "application/vnd.gmx": { "source": "iana", "extensions": ["gmx"] },
  "application/vnd.google-apps.document": { "compressible": false, "extensions": ["gdoc"] },
  "application/vnd.google-apps.presentation": { "compressible": false, "extensions": ["gslides"] },
  "application/vnd.google-apps.spreadsheet": { "compressible": false, "extensions": ["gsheet"] },
  "application/vnd.google-earth.kml+xml": { "source": "iana", "compressible": true, "extensions": ["kml"] },
  "application/vnd.google-earth.kmz": { "source": "iana", "compressible": false, "extensions": ["kmz"] },
  "application/vnd.gov.sk.e-form+xml": { "source": "iana", "compressible": true },
  "application/vnd.gov.sk.e-form+zip": { "source": "iana", "compressible": false },
  "application/vnd.gov.sk.xmldatacontainer+xml": { "source": "iana", "compressible": true },
  "application/vnd.grafeq": { "source": "iana", "extensions": ["gqf", "gqs"] },
  "application/vnd.gridmp": { "source": "iana" },
  "application/vnd.groove-account": { "source": "iana", "extensions": ["gac"] },
  "application/vnd.groove-help": { "source": "iana", "extensions": ["ghf"] },
  "application/vnd.groove-identity-message": { "source": "iana", "extensions": ["gim"] },
  "application/vnd.groove-injector": { "source": "iana", "extensions": ["grv"] },
  "application/vnd.groove-tool-message": { "source": "iana", "extensions": ["gtm"] },
  "application/vnd.groove-tool-template": { "source": "iana", "extensions": ["tpl"] },
  "application/vnd.groove-vcard": { "source": "iana", "extensions": ["vcg"] },
  "application/vnd.hal+json": { "source": "iana", "compressible": true },
  "application/vnd.hal+xml": { "source": "iana", "compressible": true, "extensions": ["hal"] },
  "application/vnd.handheld-entertainment+xml": { "source": "iana", "compressible": true, "extensions": ["zmm"] },
  "application/vnd.hbci": { "source": "iana", "extensions": ["hbci"] },
  "application/vnd.hc+json": { "source": "iana", "compressible": true },
  "application/vnd.hcl-bireports": { "source": "iana" },
  "application/vnd.hdt": { "source": "iana" },
  "application/vnd.heroku+json": { "source": "iana", "compressible": true },
  "application/vnd.hhe.lesson-player": { "source": "iana", "extensions": ["les"] },
  "application/vnd.hl7cda+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.hl7v2+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.hp-hpgl": { "source": "iana", "extensions": ["hpgl"] },
  "application/vnd.hp-hpid": { "source": "iana", "extensions": ["hpid"] },
  "application/vnd.hp-hps": { "source": "iana", "extensions": ["hps"] },
  "application/vnd.hp-jlyt": { "source": "iana", "extensions": ["jlt"] },
  "application/vnd.hp-pcl": { "source": "iana", "extensions": ["pcl"] },
  "application/vnd.hp-pclxl": { "source": "iana", "extensions": ["pclxl"] },
  "application/vnd.httphone": { "source": "iana" },
  "application/vnd.hydrostatix.sof-data": { "source": "iana", "extensions": ["sfd-hdstx"] },
  "application/vnd.hyper+json": { "source": "iana", "compressible": true },
  "application/vnd.hyper-item+json": { "source": "iana", "compressible": true },
  "application/vnd.hyperdrive+json": { "source": "iana", "compressible": true },
  "application/vnd.hzn-3d-crossword": { "source": "iana" },
  "application/vnd.ibm.afplinedata": { "source": "iana" },
  "application/vnd.ibm.electronic-media": { "source": "iana" },
  "application/vnd.ibm.minipay": { "source": "iana", "extensions": ["mpy"] },
  "application/vnd.ibm.modcap": { "source": "iana", "extensions": ["afp", "listafp", "list3820"] },
  "application/vnd.ibm.rights-management": { "source": "iana", "extensions": ["irm"] },
  "application/vnd.ibm.secure-container": { "source": "iana", "extensions": ["sc"] },
  "application/vnd.iccprofile": { "source": "iana", "extensions": ["icc", "icm"] },
  "application/vnd.ieee.1905": { "source": "iana" },
  "application/vnd.igloader": { "source": "iana", "extensions": ["igl"] },
  "application/vnd.imagemeter.folder+zip": { "source": "iana", "compressible": false },
  "application/vnd.imagemeter.image+zip": { "source": "iana", "compressible": false },
  "application/vnd.immervision-ivp": { "source": "iana", "extensions": ["ivp"] },
  "application/vnd.immervision-ivu": { "source": "iana", "extensions": ["ivu"] },
  "application/vnd.ims.imsccv1p1": { "source": "iana" },
  "application/vnd.ims.imsccv1p2": { "source": "iana" },
  "application/vnd.ims.imsccv1p3": { "source": "iana" },
  "application/vnd.ims.lis.v2.result+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolproxy+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolproxy.id+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolsettings+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": { "source": "iana", "compressible": true },
  "application/vnd.informedcontrol.rms+xml": { "source": "iana", "compressible": true },
  "application/vnd.informix-visionary": { "source": "iana" },
  "application/vnd.infotech.project": { "source": "iana" },
  "application/vnd.infotech.project+xml": { "source": "iana", "compressible": true },
  "application/vnd.innopath.wamp.notification": { "source": "iana" },
  "application/vnd.insors.igm": { "source": "iana", "extensions": ["igm"] },
  "application/vnd.intercon.formnet": { "source": "iana", "extensions": ["xpw", "xpx"] },
  "application/vnd.intergeo": { "source": "iana", "extensions": ["i2g"] },
  "application/vnd.intertrust.digibox": { "source": "iana" },
  "application/vnd.intertrust.nncp": { "source": "iana" },
  "application/vnd.intu.qbo": { "source": "iana", "extensions": ["qbo"] },
  "application/vnd.intu.qfx": { "source": "iana", "extensions": ["qfx"] },
  "application/vnd.iptc.g2.catalogitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.conceptitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.knowledgeitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.newsitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.newsmessage+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.packageitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.planningitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.ipunplugged.rcprofile": { "source": "iana", "extensions": ["rcprofile"] },
  "application/vnd.irepository.package+xml": { "source": "iana", "compressible": true, "extensions": ["irp"] },
  "application/vnd.is-xpr": { "source": "iana", "extensions": ["xpr"] },
  "application/vnd.isac.fcs": { "source": "iana", "extensions": ["fcs"] },
  "application/vnd.iso11783-10+zip": { "source": "iana", "compressible": false },
  "application/vnd.jam": { "source": "iana", "extensions": ["jam"] },
  "application/vnd.japannet-directory-service": { "source": "iana" },
  "application/vnd.japannet-jpnstore-wakeup": { "source": "iana" },
  "application/vnd.japannet-payment-wakeup": { "source": "iana" },
  "application/vnd.japannet-registration": { "source": "iana" },
  "application/vnd.japannet-registration-wakeup": { "source": "iana" },
  "application/vnd.japannet-setstore-wakeup": { "source": "iana" },
  "application/vnd.japannet-verification": { "source": "iana" },
  "application/vnd.japannet-verification-wakeup": { "source": "iana" },
  "application/vnd.jcp.javame.midlet-rms": { "source": "iana", "extensions": ["rms"] },
  "application/vnd.jisp": { "source": "iana", "extensions": ["jisp"] },
  "application/vnd.joost.joda-archive": { "source": "iana", "extensions": ["joda"] },
  "application/vnd.jsk.isdn-ngn": { "source": "iana" },
  "application/vnd.kahootz": { "source": "iana", "extensions": ["ktz", "ktr"] },
  "application/vnd.kde.karbon": { "source": "iana", "extensions": ["karbon"] },
  "application/vnd.kde.kchart": { "source": "iana", "extensions": ["chrt"] },
  "application/vnd.kde.kformula": { "source": "iana", "extensions": ["kfo"] },
  "application/vnd.kde.kivio": { "source": "iana", "extensions": ["flw"] },
  "application/vnd.kde.kontour": { "source": "iana", "extensions": ["kon"] },
  "application/vnd.kde.kpresenter": { "source": "iana", "extensions": ["kpr", "kpt"] },
  "application/vnd.kde.kspread": { "source": "iana", "extensions": ["ksp"] },
  "application/vnd.kde.kword": { "source": "iana", "extensions": ["kwd", "kwt"] },
  "application/vnd.kenameaapp": { "source": "iana", "extensions": ["htke"] },
  "application/vnd.kidspiration": { "source": "iana", "extensions": ["kia"] },
  "application/vnd.kinar": { "source": "iana", "extensions": ["kne", "knp"] },
  "application/vnd.koan": { "source": "iana", "extensions": ["skp", "skd", "skt", "skm"] },
  "application/vnd.kodak-descriptor": { "source": "iana", "extensions": ["sse"] },
  "application/vnd.las": { "source": "iana" },
  "application/vnd.las.las+json": { "source": "iana", "compressible": true },
  "application/vnd.las.las+xml": { "source": "iana", "compressible": true, "extensions": ["lasxml"] },
  "application/vnd.laszip": { "source": "iana" },
  "application/vnd.leap+json": { "source": "iana", "compressible": true },
  "application/vnd.liberty-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.llamagraphics.life-balance.desktop": { "source": "iana", "extensions": ["lbd"] },
  "application/vnd.llamagraphics.life-balance.exchange+xml": { "source": "iana", "compressible": true, "extensions": ["lbe"] },
  "application/vnd.logipipe.circuit+zip": { "source": "iana", "compressible": false },
  "application/vnd.loom": { "source": "iana" },
  "application/vnd.lotus-1-2-3": { "source": "iana", "extensions": ["123"] },
  "application/vnd.lotus-approach": { "source": "iana", "extensions": ["apr"] },
  "application/vnd.lotus-freelance": { "source": "iana", "extensions": ["pre"] },
  "application/vnd.lotus-notes": { "source": "iana", "extensions": ["nsf"] },
  "application/vnd.lotus-organizer": { "source": "iana", "extensions": ["org"] },
  "application/vnd.lotus-screencam": { "source": "iana", "extensions": ["scm"] },
  "application/vnd.lotus-wordpro": { "source": "iana", "extensions": ["lwp"] },
  "application/vnd.macports.portpkg": { "source": "iana", "extensions": ["portpkg"] },
  "application/vnd.mapbox-vector-tile": { "source": "iana", "extensions": ["mvt"] },
  "application/vnd.marlin.drm.actiontoken+xml": { "source": "iana", "compressible": true },
  "application/vnd.marlin.drm.conftoken+xml": { "source": "iana", "compressible": true },
  "application/vnd.marlin.drm.license+xml": { "source": "iana", "compressible": true },
  "application/vnd.marlin.drm.mdcf": { "source": "iana" },
  "application/vnd.mason+json": { "source": "iana", "compressible": true },
  "application/vnd.maxar.archive.3tz+zip": { "source": "iana", "compressible": false },
  "application/vnd.maxmind.maxmind-db": { "source": "iana" },
  "application/vnd.mcd": { "source": "iana", "extensions": ["mcd"] },
  "application/vnd.medcalcdata": { "source": "iana", "extensions": ["mc1"] },
  "application/vnd.mediastation.cdkey": { "source": "iana", "extensions": ["cdkey"] },
  "application/vnd.meridian-slingshot": { "source": "iana" },
  "application/vnd.mfer": { "source": "iana", "extensions": ["mwf"] },
  "application/vnd.mfmp": { "source": "iana", "extensions": ["mfm"] },
  "application/vnd.micro+json": { "source": "iana", "compressible": true },
  "application/vnd.micrografx.flo": { "source": "iana", "extensions": ["flo"] },
  "application/vnd.micrografx.igx": { "source": "iana", "extensions": ["igx"] },
  "application/vnd.microsoft.portable-executable": { "source": "iana" },
  "application/vnd.microsoft.windows.thumbnail-cache": { "source": "iana" },
  "application/vnd.miele+json": { "source": "iana", "compressible": true },
  "application/vnd.mif": { "source": "iana", "extensions": ["mif"] },
  "application/vnd.minisoft-hp3000-save": { "source": "iana" },
  "application/vnd.mitsubishi.misty-guard.trustweb": { "source": "iana" },
  "application/vnd.mobius.daf": { "source": "iana", "extensions": ["daf"] },
  "application/vnd.mobius.dis": { "source": "iana", "extensions": ["dis"] },
  "application/vnd.mobius.mbk": { "source": "iana", "extensions": ["mbk"] },
  "application/vnd.mobius.mqy": { "source": "iana", "extensions": ["mqy"] },
  "application/vnd.mobius.msl": { "source": "iana", "extensions": ["msl"] },
  "application/vnd.mobius.plc": { "source": "iana", "extensions": ["plc"] },
  "application/vnd.mobius.txf": { "source": "iana", "extensions": ["txf"] },
  "application/vnd.mophun.application": { "source": "iana", "extensions": ["mpn"] },
  "application/vnd.mophun.certificate": { "source": "iana", "extensions": ["mpc"] },
  "application/vnd.motorola.flexsuite": { "source": "iana" },
  "application/vnd.motorola.flexsuite.adsi": { "source": "iana" },
  "application/vnd.motorola.flexsuite.fis": { "source": "iana" },
  "application/vnd.motorola.flexsuite.gotap": { "source": "iana" },
  "application/vnd.motorola.flexsuite.kmr": { "source": "iana" },
  "application/vnd.motorola.flexsuite.ttc": { "source": "iana" },
  "application/vnd.motorola.flexsuite.wem": { "source": "iana" },
  "application/vnd.motorola.iprm": { "source": "iana" },
  "application/vnd.mozilla.xul+xml": { "source": "iana", "compressible": true, "extensions": ["xul"] },
  "application/vnd.ms-3mfdocument": { "source": "iana" },
  "application/vnd.ms-artgalry": { "source": "iana", "extensions": ["cil"] },
  "application/vnd.ms-asf": { "source": "iana" },
  "application/vnd.ms-cab-compressed": { "source": "iana", "extensions": ["cab"] },
  "application/vnd.ms-color.iccprofile": { "source": "apache" },
  "application/vnd.ms-excel": { "source": "iana", "compressible": false, "extensions": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"] },
  "application/vnd.ms-excel.addin.macroenabled.12": { "source": "iana", "extensions": ["xlam"] },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": { "source": "iana", "extensions": ["xlsb"] },
  "application/vnd.ms-excel.sheet.macroenabled.12": { "source": "iana", "extensions": ["xlsm"] },
  "application/vnd.ms-excel.template.macroenabled.12": { "source": "iana", "extensions": ["xltm"] },
  "application/vnd.ms-fontobject": { "source": "iana", "compressible": true, "extensions": ["eot"] },
  "application/vnd.ms-htmlhelp": { "source": "iana", "extensions": ["chm"] },
  "application/vnd.ms-ims": { "source": "iana", "extensions": ["ims"] },
  "application/vnd.ms-lrm": { "source": "iana", "extensions": ["lrm"] },
  "application/vnd.ms-office.activex+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-officetheme": { "source": "iana", "extensions": ["thmx"] },
  "application/vnd.ms-opentype": { "source": "apache", "compressible": true },
  "application/vnd.ms-outlook": { "compressible": false, "extensions": ["msg"] },
  "application/vnd.ms-package.obfuscated-opentype": { "source": "apache" },
  "application/vnd.ms-pki.seccat": { "source": "apache", "extensions": ["cat"] },
  "application/vnd.ms-pki.stl": { "source": "apache", "extensions": ["stl"] },
  "application/vnd.ms-playready.initiator+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-powerpoint": { "source": "iana", "compressible": false, "extensions": ["ppt", "pps", "pot"] },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": { "source": "iana", "extensions": ["ppam"] },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": { "source": "iana", "extensions": ["pptm"] },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": { "source": "iana", "extensions": ["sldm"] },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": { "source": "iana", "extensions": ["ppsm"] },
  "application/vnd.ms-powerpoint.template.macroenabled.12": { "source": "iana", "extensions": ["potm"] },
  "application/vnd.ms-printdevicecapabilities+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-printing.printticket+xml": { "source": "apache", "compressible": true },
  "application/vnd.ms-printschematicket+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-project": { "source": "iana", "extensions": ["mpp", "mpt"] },
  "application/vnd.ms-tnef": { "source": "iana" },
  "application/vnd.ms-windows.devicepairing": { "source": "iana" },
  "application/vnd.ms-windows.nwprinting.oob": { "source": "iana" },
  "application/vnd.ms-windows.printerpairing": { "source": "iana" },
  "application/vnd.ms-windows.wsd.oob": { "source": "iana" },
  "application/vnd.ms-wmdrm.lic-chlg-req": { "source": "iana" },
  "application/vnd.ms-wmdrm.lic-resp": { "source": "iana" },
  "application/vnd.ms-wmdrm.meter-chlg-req": { "source": "iana" },
  "application/vnd.ms-wmdrm.meter-resp": { "source": "iana" },
  "application/vnd.ms-word.document.macroenabled.12": { "source": "iana", "extensions": ["docm"] },
  "application/vnd.ms-word.template.macroenabled.12": { "source": "iana", "extensions": ["dotm"] },
  "application/vnd.ms-works": { "source": "iana", "extensions": ["wps", "wks", "wcm", "wdb"] },
  "application/vnd.ms-wpl": { "source": "iana", "extensions": ["wpl"] },
  "application/vnd.ms-xpsdocument": { "source": "iana", "compressible": false, "extensions": ["xps"] },
  "application/vnd.msa-disk-image": { "source": "iana" },
  "application/vnd.mseq": { "source": "iana", "extensions": ["mseq"] },
  "application/vnd.msign": { "source": "iana" },
  "application/vnd.multiad.creator": { "source": "iana" },
  "application/vnd.multiad.creator.cif": { "source": "iana" },
  "application/vnd.music-niff": { "source": "iana" },
  "application/vnd.musician": { "source": "iana", "extensions": ["mus"] },
  "application/vnd.muvee.style": { "source": "iana", "extensions": ["msty"] },
  "application/vnd.mynfc": { "source": "iana", "extensions": ["taglet"] },
  "application/vnd.nacamar.ybrid+json": { "source": "iana", "compressible": true },
  "application/vnd.ncd.control": { "source": "iana" },
  "application/vnd.ncd.reference": { "source": "iana" },
  "application/vnd.nearst.inv+json": { "source": "iana", "compressible": true },
  "application/vnd.nebumind.line": { "source": "iana" },
  "application/vnd.nervana": { "source": "iana" },
  "application/vnd.netfpx": { "source": "iana" },
  "application/vnd.neurolanguage.nlu": { "source": "iana", "extensions": ["nlu"] },
  "application/vnd.nimn": { "source": "iana" },
  "application/vnd.nintendo.nitro.rom": { "source": "iana" },
  "application/vnd.nintendo.snes.rom": { "source": "iana" },
  "application/vnd.nitf": { "source": "iana", "extensions": ["ntf", "nitf"] },
  "application/vnd.noblenet-directory": { "source": "iana", "extensions": ["nnd"] },
  "application/vnd.noblenet-sealer": { "source": "iana", "extensions": ["nns"] },
  "application/vnd.noblenet-web": { "source": "iana", "extensions": ["nnw"] },
  "application/vnd.nokia.catalogs": { "source": "iana" },
  "application/vnd.nokia.conml+wbxml": { "source": "iana" },
  "application/vnd.nokia.conml+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.iptv.config+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.isds-radio-presets": { "source": "iana" },
  "application/vnd.nokia.landmark+wbxml": { "source": "iana" },
  "application/vnd.nokia.landmark+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.landmarkcollection+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.n-gage.ac+xml": { "source": "iana", "compressible": true, "extensions": ["ac"] },
  "application/vnd.nokia.n-gage.data": { "source": "iana", "extensions": ["ngdat"] },
  "application/vnd.nokia.n-gage.symbian.install": { "source": "iana", "extensions": ["n-gage"] },
  "application/vnd.nokia.ncd": { "source": "iana" },
  "application/vnd.nokia.pcd+wbxml": { "source": "iana" },
  "application/vnd.nokia.pcd+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.radio-preset": { "source": "iana", "extensions": ["rpst"] },
  "application/vnd.nokia.radio-presets": { "source": "iana", "extensions": ["rpss"] },
  "application/vnd.novadigm.edm": { "source": "iana", "extensions": ["edm"] },
  "application/vnd.novadigm.edx": { "source": "iana", "extensions": ["edx"] },
  "application/vnd.novadigm.ext": { "source": "iana", "extensions": ["ext"] },
  "application/vnd.ntt-local.content-share": { "source": "iana" },
  "application/vnd.ntt-local.file-transfer": { "source": "iana" },
  "application/vnd.ntt-local.ogw_remote-access": { "source": "iana" },
  "application/vnd.ntt-local.sip-ta_remote": { "source": "iana" },
  "application/vnd.ntt-local.sip-ta_tcp_stream": { "source": "iana" },
  "application/vnd.oasis.opendocument.chart": { "source": "iana", "extensions": ["odc"] },
  "application/vnd.oasis.opendocument.chart-template": { "source": "iana", "extensions": ["otc"] },
  "application/vnd.oasis.opendocument.database": { "source": "iana", "extensions": ["odb"] },
  "application/vnd.oasis.opendocument.formula": { "source": "iana", "extensions": ["odf"] },
  "application/vnd.oasis.opendocument.formula-template": { "source": "iana", "extensions": ["odft"] },
  "application/vnd.oasis.opendocument.graphics": { "source": "iana", "compressible": false, "extensions": ["odg"] },
  "application/vnd.oasis.opendocument.graphics-template": { "source": "iana", "extensions": ["otg"] },
  "application/vnd.oasis.opendocument.image": { "source": "iana", "extensions": ["odi"] },
  "application/vnd.oasis.opendocument.image-template": { "source": "iana", "extensions": ["oti"] },
  "application/vnd.oasis.opendocument.presentation": { "source": "iana", "compressible": false, "extensions": ["odp"] },
  "application/vnd.oasis.opendocument.presentation-template": { "source": "iana", "extensions": ["otp"] },
  "application/vnd.oasis.opendocument.spreadsheet": { "source": "iana", "compressible": false, "extensions": ["ods"] },
  "application/vnd.oasis.opendocument.spreadsheet-template": { "source": "iana", "extensions": ["ots"] },
  "application/vnd.oasis.opendocument.text": { "source": "iana", "compressible": false, "extensions": ["odt"] },
  "application/vnd.oasis.opendocument.text-master": { "source": "iana", "extensions": ["odm"] },
  "application/vnd.oasis.opendocument.text-template": { "source": "iana", "extensions": ["ott"] },
  "application/vnd.oasis.opendocument.text-web": { "source": "iana", "extensions": ["oth"] },
  "application/vnd.obn": { "source": "iana" },
  "application/vnd.ocf+cbor": { "source": "iana" },
  "application/vnd.oci.image.manifest.v1+json": { "source": "iana", "compressible": true },
  "application/vnd.oftn.l10n+json": { "source": "iana", "compressible": true },
  "application/vnd.oipf.contentaccessdownload+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.contentaccessstreaming+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.cspg-hexbinary": { "source": "iana" },
  "application/vnd.oipf.dae.svg+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.dae.xhtml+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.mippvcontrolmessage+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.pae.gem": { "source": "iana" },
  "application/vnd.oipf.spdiscovery+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.spdlist+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.ueprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.userprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.olpc-sugar": { "source": "iana", "extensions": ["xo"] },
  "application/vnd.oma-scws-config": { "source": "iana" },
  "application/vnd.oma-scws-http-request": { "source": "iana" },
  "application/vnd.oma-scws-http-response": { "source": "iana" },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.drm-trigger+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.imd+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.ltkm": { "source": "iana" },
  "application/vnd.oma.bcast.notification+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.provisioningtrigger": { "source": "iana" },
  "application/vnd.oma.bcast.sgboot": { "source": "iana" },
  "application/vnd.oma.bcast.sgdd+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.sgdu": { "source": "iana" },
  "application/vnd.oma.bcast.simple-symbol-container": { "source": "iana" },
  "application/vnd.oma.bcast.smartcard-trigger+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.sprov+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.stkm": { "source": "iana" },
  "application/vnd.oma.cab-address-book+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-feature-handler+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-pcc+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-subs-invite+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-user-prefs+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.dcd": { "source": "iana" },
  "application/vnd.oma.dcdc": { "source": "iana" },
  "application/vnd.oma.dd2+xml": { "source": "iana", "compressible": true, "extensions": ["dd2"] },
  "application/vnd.oma.drm.risd+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.group-usage-list+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.lwm2m+cbor": { "source": "iana" },
  "application/vnd.oma.lwm2m+json": { "source": "iana", "compressible": true },
  "application/vnd.oma.lwm2m+tlv": { "source": "iana" },
  "application/vnd.oma.pal+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.detailed-progress-report+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.final-report+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.groups+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.invocation-descriptor+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.optimized-progress-report+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.push": { "source": "iana" },
  "application/vnd.oma.scidm.messages+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.xcap-directory+xml": { "source": "iana", "compressible": true },
  "application/vnd.omads-email+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.omads-file+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.omads-folder+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.omaloc-supl-init": { "source": "iana" },
  "application/vnd.onepager": { "source": "iana" },
  "application/vnd.onepagertamp": { "source": "iana" },
  "application/vnd.onepagertamx": { "source": "iana" },
  "application/vnd.onepagertat": { "source": "iana" },
  "application/vnd.onepagertatp": { "source": "iana" },
  "application/vnd.onepagertatx": { "source": "iana" },
  "application/vnd.openblox.game+xml": { "source": "iana", "compressible": true, "extensions": ["obgx"] },
  "application/vnd.openblox.game-binary": { "source": "iana" },
  "application/vnd.openeye.oeb": { "source": "iana" },
  "application/vnd.openofficeorg.extension": { "source": "apache", "extensions": ["oxt"] },
  "application/vnd.openstreetmap.data+xml": { "source": "iana", "compressible": true, "extensions": ["osm"] },
  "application/vnd.opentimestamps.ots": { "source": "iana" },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawing+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { "source": "iana", "compressible": false, "extensions": ["pptx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": { "source": "iana", "extensions": ["sldx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": { "source": "iana", "extensions": ["ppsx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.template": { "source": "iana", "extensions": ["potx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { "source": "iana", "compressible": false, "extensions": ["xlsx"] },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": { "source": "iana", "extensions": ["xltx"] },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.theme+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.vmldrawing": { "source": "iana" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { "source": "iana", "compressible": false, "extensions": ["docx"] },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": { "source": "iana", "extensions": ["dotx"] },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-package.core-properties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-package.relationships+xml": { "source": "iana", "compressible": true },
  "application/vnd.oracle.resource+json": { "source": "iana", "compressible": true },
  "application/vnd.orange.indata": { "source": "iana" },
  "application/vnd.osa.netdeploy": { "source": "iana" },
  "application/vnd.osgeo.mapguide.package": { "source": "iana", "extensions": ["mgp"] },
  "application/vnd.osgi.bundle": { "source": "iana" },
  "application/vnd.osgi.dp": { "source": "iana", "extensions": ["dp"] },
  "application/vnd.osgi.subsystem": { "source": "iana", "extensions": ["esa"] },
  "application/vnd.otps.ct-kip+xml": { "source": "iana", "compressible": true },
  "application/vnd.oxli.countgraph": { "source": "iana" },
  "application/vnd.pagerduty+json": { "source": "iana", "compressible": true },
  "application/vnd.palm": { "source": "iana", "extensions": ["pdb", "pqa", "oprc"] },
  "application/vnd.panoply": { "source": "iana" },
  "application/vnd.paos.xml": { "source": "iana" },
  "application/vnd.patentdive": { "source": "iana" },
  "application/vnd.patientecommsdoc": { "source": "iana" },
  "application/vnd.pawaafile": { "source": "iana", "extensions": ["paw"] },
  "application/vnd.pcos": { "source": "iana" },
  "application/vnd.pg.format": { "source": "iana", "extensions": ["str"] },
  "application/vnd.pg.osasli": { "source": "iana", "extensions": ["ei6"] },
  "application/vnd.piaccess.application-licence": { "source": "iana" },
  "application/vnd.picsel": { "source": "iana", "extensions": ["efif"] },
  "application/vnd.pmi.widget": { "source": "iana", "extensions": ["wg"] },
  "application/vnd.poc.group-advertisement+xml": { "source": "iana", "compressible": true },
  "application/vnd.pocketlearn": { "source": "iana", "extensions": ["plf"] },
  "application/vnd.powerbuilder6": { "source": "iana", "extensions": ["pbd"] },
  "application/vnd.powerbuilder6-s": { "source": "iana" },
  "application/vnd.powerbuilder7": { "source": "iana" },
  "application/vnd.powerbuilder7-s": { "source": "iana" },
  "application/vnd.powerbuilder75": { "source": "iana" },
  "application/vnd.powerbuilder75-s": { "source": "iana" },
  "application/vnd.preminet": { "source": "iana" },
  "application/vnd.previewsystems.box": { "source": "iana", "extensions": ["box"] },
  "application/vnd.proteus.magazine": { "source": "iana", "extensions": ["mgz"] },
  "application/vnd.psfs": { "source": "iana" },
  "application/vnd.publishare-delta-tree": { "source": "iana", "extensions": ["qps"] },
  "application/vnd.pvi.ptid1": { "source": "iana", "extensions": ["ptid"] },
  "application/vnd.pwg-multiplexed": { "source": "iana" },
  "application/vnd.pwg-xhtml-print+xml": { "source": "iana", "compressible": true },
  "application/vnd.qualcomm.brew-app-res": { "source": "iana" },
  "application/vnd.quarantainenet": { "source": "iana" },
  "application/vnd.quark.quarkxpress": { "source": "iana", "extensions": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"] },
  "application/vnd.quobject-quoxdocument": { "source": "iana" },
  "application/vnd.radisys.moml+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-conf+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-conn+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-dialog+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-stream+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-conf+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-base+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-group+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-speech+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-transform+xml": { "source": "iana", "compressible": true },
  "application/vnd.rainstor.data": { "source": "iana" },
  "application/vnd.rapid": { "source": "iana" },
  "application/vnd.rar": { "source": "iana", "extensions": ["rar"] },
  "application/vnd.realvnc.bed": { "source": "iana", "extensions": ["bed"] },
  "application/vnd.recordare.musicxml": { "source": "iana", "extensions": ["mxl"] },
  "application/vnd.recordare.musicxml+xml": { "source": "iana", "compressible": true, "extensions": ["musicxml"] },
  "application/vnd.renlearn.rlprint": { "source": "iana" },
  "application/vnd.resilient.logic": { "source": "iana" },
  "application/vnd.restful+json": { "source": "iana", "compressible": true },
  "application/vnd.rig.cryptonote": { "source": "iana", "extensions": ["cryptonote"] },
  "application/vnd.rim.cod": { "source": "apache", "extensions": ["cod"] },
  "application/vnd.rn-realmedia": { "source": "apache", "extensions": ["rm"] },
  "application/vnd.rn-realmedia-vbr": { "source": "apache", "extensions": ["rmvb"] },
  "application/vnd.route66.link66+xml": { "source": "iana", "compressible": true, "extensions": ["link66"] },
  "application/vnd.rs-274x": { "source": "iana" },
  "application/vnd.ruckus.download": { "source": "iana" },
  "application/vnd.s3sms": { "source": "iana" },
  "application/vnd.sailingtracker.track": { "source": "iana", "extensions": ["st"] },
  "application/vnd.sar": { "source": "iana" },
  "application/vnd.sbm.cid": { "source": "iana" },
  "application/vnd.sbm.mid2": { "source": "iana" },
  "application/vnd.scribus": { "source": "iana" },
  "application/vnd.sealed.3df": { "source": "iana" },
  "application/vnd.sealed.csf": { "source": "iana" },
  "application/vnd.sealed.doc": { "source": "iana" },
  "application/vnd.sealed.eml": { "source": "iana" },
  "application/vnd.sealed.mht": { "source": "iana" },
  "application/vnd.sealed.net": { "source": "iana" },
  "application/vnd.sealed.ppt": { "source": "iana" },
  "application/vnd.sealed.tiff": { "source": "iana" },
  "application/vnd.sealed.xls": { "source": "iana" },
  "application/vnd.sealedmedia.softseal.html": { "source": "iana" },
  "application/vnd.sealedmedia.softseal.pdf": { "source": "iana" },
  "application/vnd.seemail": { "source": "iana", "extensions": ["see"] },
  "application/vnd.seis+json": { "source": "iana", "compressible": true },
  "application/vnd.sema": { "source": "iana", "extensions": ["sema"] },
  "application/vnd.semd": { "source": "iana", "extensions": ["semd"] },
  "application/vnd.semf": { "source": "iana", "extensions": ["semf"] },
  "application/vnd.shade-save-file": { "source": "iana" },
  "application/vnd.shana.informed.formdata": { "source": "iana", "extensions": ["ifm"] },
  "application/vnd.shana.informed.formtemplate": { "source": "iana", "extensions": ["itp"] },
  "application/vnd.shana.informed.interchange": { "source": "iana", "extensions": ["iif"] },
  "application/vnd.shana.informed.package": { "source": "iana", "extensions": ["ipk"] },
  "application/vnd.shootproof+json": { "source": "iana", "compressible": true },
  "application/vnd.shopkick+json": { "source": "iana", "compressible": true },
  "application/vnd.shp": { "source": "iana" },
  "application/vnd.shx": { "source": "iana" },
  "application/vnd.sigrok.session": { "source": "iana" },
  "application/vnd.simtech-mindmapper": { "source": "iana", "extensions": ["twd", "twds"] },
  "application/vnd.siren+json": { "source": "iana", "compressible": true },
  "application/vnd.smaf": { "source": "iana", "extensions": ["mmf"] },
  "application/vnd.smart.notebook": { "source": "iana" },
  "application/vnd.smart.teacher": { "source": "iana", "extensions": ["teacher"] },
  "application/vnd.snesdev-page-table": { "source": "iana" },
  "application/vnd.software602.filler.form+xml": { "source": "iana", "compressible": true, "extensions": ["fo"] },
  "application/vnd.software602.filler.form-xml-zip": { "source": "iana" },
  "application/vnd.solent.sdkm+xml": { "source": "iana", "compressible": true, "extensions": ["sdkm", "sdkd"] },
  "application/vnd.spotfire.dxp": { "source": "iana", "extensions": ["dxp"] },
  "application/vnd.spotfire.sfs": { "source": "iana", "extensions": ["sfs"] },
  "application/vnd.sqlite3": { "source": "iana" },
  "application/vnd.sss-cod": { "source": "iana" },
  "application/vnd.sss-dtf": { "source": "iana" },
  "application/vnd.sss-ntf": { "source": "iana" },
  "application/vnd.stardivision.calc": { "source": "apache", "extensions": ["sdc"] },
  "application/vnd.stardivision.draw": { "source": "apache", "extensions": ["sda"] },
  "application/vnd.stardivision.impress": { "source": "apache", "extensions": ["sdd"] },
  "application/vnd.stardivision.math": { "source": "apache", "extensions": ["smf"] },
  "application/vnd.stardivision.writer": { "source": "apache", "extensions": ["sdw", "vor"] },
  "application/vnd.stardivision.writer-global": { "source": "apache", "extensions": ["sgl"] },
  "application/vnd.stepmania.package": { "source": "iana", "extensions": ["smzip"] },
  "application/vnd.stepmania.stepchart": { "source": "iana", "extensions": ["sm"] },
  "application/vnd.street-stream": { "source": "iana" },
  "application/vnd.sun.wadl+xml": { "source": "iana", "compressible": true, "extensions": ["wadl"] },
  "application/vnd.sun.xml.calc": { "source": "apache", "extensions": ["sxc"] },
  "application/vnd.sun.xml.calc.template": { "source": "apache", "extensions": ["stc"] },
  "application/vnd.sun.xml.draw": { "source": "apache", "extensions": ["sxd"] },
  "application/vnd.sun.xml.draw.template": { "source": "apache", "extensions": ["std"] },
  "application/vnd.sun.xml.impress": { "source": "apache", "extensions": ["sxi"] },
  "application/vnd.sun.xml.impress.template": { "source": "apache", "extensions": ["sti"] },
  "application/vnd.sun.xml.math": { "source": "apache", "extensions": ["sxm"] },
  "application/vnd.sun.xml.writer": { "source": "apache", "extensions": ["sxw"] },
  "application/vnd.sun.xml.writer.global": { "source": "apache", "extensions": ["sxg"] },
  "application/vnd.sun.xml.writer.template": { "source": "apache", "extensions": ["stw"] },
  "application/vnd.sus-calendar": { "source": "iana", "extensions": ["sus", "susp"] },
  "application/vnd.svd": { "source": "iana", "extensions": ["svd"] },
  "application/vnd.swiftview-ics": { "source": "iana" },
  "application/vnd.sycle+xml": { "source": "iana", "compressible": true },
  "application/vnd.syft+json": { "source": "iana", "compressible": true },
  "application/vnd.symbian.install": { "source": "apache", "extensions": ["sis", "sisx"] },
  "application/vnd.syncml+xml": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["xsm"] },
  "application/vnd.syncml.dm+wbxml": { "source": "iana", "charset": "UTF-8", "extensions": ["bdm"] },
  "application/vnd.syncml.dm+xml": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["xdm"] },
  "application/vnd.syncml.dm.notification": { "source": "iana" },
  "application/vnd.syncml.dmddf+wbxml": { "source": "iana" },
  "application/vnd.syncml.dmddf+xml": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["ddf"] },
  "application/vnd.syncml.dmtnds+wbxml": { "source": "iana" },
  "application/vnd.syncml.dmtnds+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.syncml.ds.notification": { "source": "iana" },
  "application/vnd.tableschema+json": { "source": "iana", "compressible": true },
  "application/vnd.tao.intent-module-archive": { "source": "iana", "extensions": ["tao"] },
  "application/vnd.tcpdump.pcap": { "source": "iana", "extensions": ["pcap", "cap", "dmp"] },
  "application/vnd.think-cell.ppttc+json": { "source": "iana", "compressible": true },
  "application/vnd.tmd.mediaflex.api+xml": { "source": "iana", "compressible": true },
  "application/vnd.tml": { "source": "iana" },
  "application/vnd.tmobile-livetv": { "source": "iana", "extensions": ["tmo"] },
  "application/vnd.tri.onesource": { "source": "iana" },
  "application/vnd.trid.tpt": { "source": "iana", "extensions": ["tpt"] },
  "application/vnd.triscape.mxs": { "source": "iana", "extensions": ["mxs"] },
  "application/vnd.trueapp": { "source": "iana", "extensions": ["tra"] },
  "application/vnd.truedoc": { "source": "iana" },
  "application/vnd.ubisoft.webplayer": { "source": "iana" },
  "application/vnd.ufdl": { "source": "iana", "extensions": ["ufd", "ufdl"] },
  "application/vnd.uiq.theme": { "source": "iana", "extensions": ["utz"] },
  "application/vnd.umajin": { "source": "iana", "extensions": ["umj"] },
  "application/vnd.unity": { "source": "iana", "extensions": ["unityweb"] },
  "application/vnd.uoml+xml": { "source": "iana", "compressible": true, "extensions": ["uoml"] },
  "application/vnd.uplanet.alert": { "source": "iana" },
  "application/vnd.uplanet.alert-wbxml": { "source": "iana" },
  "application/vnd.uplanet.bearer-choice": { "source": "iana" },
  "application/vnd.uplanet.bearer-choice-wbxml": { "source": "iana" },
  "application/vnd.uplanet.cacheop": { "source": "iana" },
  "application/vnd.uplanet.cacheop-wbxml": { "source": "iana" },
  "application/vnd.uplanet.channel": { "source": "iana" },
  "application/vnd.uplanet.channel-wbxml": { "source": "iana" },
  "application/vnd.uplanet.list": { "source": "iana" },
  "application/vnd.uplanet.list-wbxml": { "source": "iana" },
  "application/vnd.uplanet.listcmd": { "source": "iana" },
  "application/vnd.uplanet.listcmd-wbxml": { "source": "iana" },
  "application/vnd.uplanet.signal": { "source": "iana" },
  "application/vnd.uri-map": { "source": "iana" },
  "application/vnd.valve.source.material": { "source": "iana" },
  "application/vnd.vcx": { "source": "iana", "extensions": ["vcx"] },
  "application/vnd.vd-study": { "source": "iana" },
  "application/vnd.vectorworks": { "source": "iana" },
  "application/vnd.vel+json": { "source": "iana", "compressible": true },
  "application/vnd.verimatrix.vcas": { "source": "iana" },
  "application/vnd.veritone.aion+json": { "source": "iana", "compressible": true },
  "application/vnd.veryant.thin": { "source": "iana" },
  "application/vnd.ves.encrypted": { "source": "iana" },
  "application/vnd.vidsoft.vidconference": { "source": "iana" },
  "application/vnd.visio": { "source": "iana", "extensions": ["vsd", "vst", "vss", "vsw"] },
  "application/vnd.visionary": { "source": "iana", "extensions": ["vis"] },
  "application/vnd.vividence.scriptfile": { "source": "iana" },
  "application/vnd.vsf": { "source": "iana", "extensions": ["vsf"] },
  "application/vnd.wap.sic": { "source": "iana" },
  "application/vnd.wap.slc": { "source": "iana" },
  "application/vnd.wap.wbxml": { "source": "iana", "charset": "UTF-8", "extensions": ["wbxml"] },
  "application/vnd.wap.wmlc": { "source": "iana", "extensions": ["wmlc"] },
  "application/vnd.wap.wmlscriptc": { "source": "iana", "extensions": ["wmlsc"] },
  "application/vnd.webturbo": { "source": "iana", "extensions": ["wtb"] },
  "application/vnd.wfa.dpp": { "source": "iana" },
  "application/vnd.wfa.p2p": { "source": "iana" },
  "application/vnd.wfa.wsc": { "source": "iana" },
  "application/vnd.windows.devicepairing": { "source": "iana" },
  "application/vnd.wmc": { "source": "iana" },
  "application/vnd.wmf.bootstrap": { "source": "iana" },
  "application/vnd.wolfram.mathematica": { "source": "iana" },
  "application/vnd.wolfram.mathematica.package": { "source": "iana" },
  "application/vnd.wolfram.player": { "source": "iana", "extensions": ["nbp"] },
  "application/vnd.wordperfect": { "source": "iana", "extensions": ["wpd"] },
  "application/vnd.wqd": { "source": "iana", "extensions": ["wqd"] },
  "application/vnd.wrq-hp3000-labelled": { "source": "iana" },
  "application/vnd.wt.stf": { "source": "iana", "extensions": ["stf"] },
  "application/vnd.wv.csp+wbxml": { "source": "iana" },
  "application/vnd.wv.csp+xml": { "source": "iana", "compressible": true },
  "application/vnd.wv.ssp+xml": { "source": "iana", "compressible": true },
  "application/vnd.xacml+json": { "source": "iana", "compressible": true },
  "application/vnd.xara": { "source": "iana", "extensions": ["xar"] },
  "application/vnd.xfdl": { "source": "iana", "extensions": ["xfdl"] },
  "application/vnd.xfdl.webform": { "source": "iana" },
  "application/vnd.xmi+xml": { "source": "iana", "compressible": true },
  "application/vnd.xmpie.cpkg": { "source": "iana" },
  "application/vnd.xmpie.dpkg": { "source": "iana" },
  "application/vnd.xmpie.plan": { "source": "iana" },
  "application/vnd.xmpie.ppkg": { "source": "iana" },
  "application/vnd.xmpie.xlim": { "source": "iana" },
  "application/vnd.yamaha.hv-dic": { "source": "iana", "extensions": ["hvd"] },
  "application/vnd.yamaha.hv-script": { "source": "iana", "extensions": ["hvs"] },
  "application/vnd.yamaha.hv-voice": { "source": "iana", "extensions": ["hvp"] },
  "application/vnd.yamaha.openscoreformat": { "source": "iana", "extensions": ["osf"] },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": { "source": "iana", "compressible": true, "extensions": ["osfpvg"] },
  "application/vnd.yamaha.remote-setup": { "source": "iana" },
  "application/vnd.yamaha.smaf-audio": { "source": "iana", "extensions": ["saf"] },
  "application/vnd.yamaha.smaf-phrase": { "source": "iana", "extensions": ["spf"] },
  "application/vnd.yamaha.through-ngn": { "source": "iana" },
  "application/vnd.yamaha.tunnel-udpencap": { "source": "iana" },
  "application/vnd.yaoweme": { "source": "iana" },
  "application/vnd.yellowriver-custom-menu": { "source": "iana", "extensions": ["cmp"] },
  "application/vnd.youtube.yt": { "source": "iana" },
  "application/vnd.zul": { "source": "iana", "extensions": ["zir", "zirz"] },
  "application/vnd.zzazz.deck+xml": { "source": "iana", "compressible": true, "extensions": ["zaz"] },
  "application/voicexml+xml": { "source": "iana", "compressible": true, "extensions": ["vxml"] },
  "application/voucher-cms+json": { "source": "iana", "compressible": true },
  "application/vq-rtcpxr": { "source": "iana" },
  "application/wasm": { "source": "iana", "compressible": true, "extensions": ["wasm"] },
  "application/watcherinfo+xml": { "source": "iana", "compressible": true, "extensions": ["wif"] },
  "application/webpush-options+json": { "source": "iana", "compressible": true },
  "application/whoispp-query": { "source": "iana" },
  "application/whoispp-response": { "source": "iana" },
  "application/widget": { "source": "iana", "extensions": ["wgt"] },
  "application/winhlp": { "source": "apache", "extensions": ["hlp"] },
  "application/wita": { "source": "iana" },
  "application/wordperfect5.1": { "source": "iana" },
  "application/wsdl+xml": { "source": "iana", "compressible": true, "extensions": ["wsdl"] },
  "application/wspolicy+xml": { "source": "iana", "compressible": true, "extensions": ["wspolicy"] },
  "application/x-7z-compressed": { "source": "apache", "compressible": false, "extensions": ["7z"] },
  "application/x-abiword": { "source": "apache", "extensions": ["abw"] },
  "application/x-ace-compressed": { "source": "apache", "extensions": ["ace"] },
  "application/x-amf": { "source": "apache" },
  "application/x-apple-diskimage": { "source": "apache", "extensions": ["dmg"] },
  "application/x-arj": { "compressible": false, "extensions": ["arj"] },
  "application/x-authorware-bin": { "source": "apache", "extensions": ["aab", "x32", "u32", "vox"] },
  "application/x-authorware-map": { "source": "apache", "extensions": ["aam"] },
  "application/x-authorware-seg": { "source": "apache", "extensions": ["aas"] },
  "application/x-bcpio": { "source": "apache", "extensions": ["bcpio"] },
  "application/x-bdoc": { "compressible": false, "extensions": ["bdoc"] },
  "application/x-bittorrent": { "source": "apache", "extensions": ["torrent"] },
  "application/x-blorb": { "source": "apache", "extensions": ["blb", "blorb"] },
  "application/x-bzip": { "source": "apache", "compressible": false, "extensions": ["bz"] },
  "application/x-bzip2": { "source": "apache", "compressible": false, "extensions": ["bz2", "boz"] },
  "application/x-cbr": { "source": "apache", "extensions": ["cbr", "cba", "cbt", "cbz", "cb7"] },
  "application/x-cdlink": { "source": "apache", "extensions": ["vcd"] },
  "application/x-cfs-compressed": { "source": "apache", "extensions": ["cfs"] },
  "application/x-chat": { "source": "apache", "extensions": ["chat"] },
  "application/x-chess-pgn": { "source": "apache", "extensions": ["pgn"] },
  "application/x-chrome-extension": { "extensions": ["crx"] },
  "application/x-cocoa": { "source": "nginx", "extensions": ["cco"] },
  "application/x-compress": { "source": "apache" },
  "application/x-conference": { "source": "apache", "extensions": ["nsc"] },
  "application/x-cpio": { "source": "apache", "extensions": ["cpio"] },
  "application/x-csh": { "source": "apache", "extensions": ["csh"] },
  "application/x-deb": { "compressible": false },
  "application/x-debian-package": { "source": "apache", "extensions": ["deb", "udeb"] },
  "application/x-dgc-compressed": { "source": "apache", "extensions": ["dgc"] },
  "application/x-director": { "source": "apache", "extensions": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"] },
  "application/x-doom": { "source": "apache", "extensions": ["wad"] },
  "application/x-dtbncx+xml": { "source": "apache", "compressible": true, "extensions": ["ncx"] },
  "application/x-dtbook+xml": { "source": "apache", "compressible": true, "extensions": ["dtb"] },
  "application/x-dtbresource+xml": { "source": "apache", "compressible": true, "extensions": ["res"] },
  "application/x-dvi": { "source": "apache", "compressible": false, "extensions": ["dvi"] },
  "application/x-envoy": { "source": "apache", "extensions": ["evy"] },
  "application/x-eva": { "source": "apache", "extensions": ["eva"] },
  "application/x-font-bdf": { "source": "apache", "extensions": ["bdf"] },
  "application/x-font-dos": { "source": "apache" },
  "application/x-font-framemaker": { "source": "apache" },
  "application/x-font-ghostscript": { "source": "apache", "extensions": ["gsf"] },
  "application/x-font-libgrx": { "source": "apache" },
  "application/x-font-linux-psf": { "source": "apache", "extensions": ["psf"] },
  "application/x-font-pcf": { "source": "apache", "extensions": ["pcf"] },
  "application/x-font-snf": { "source": "apache", "extensions": ["snf"] },
  "application/x-font-speedo": { "source": "apache" },
  "application/x-font-sunos-news": { "source": "apache" },
  "application/x-font-type1": { "source": "apache", "extensions": ["pfa", "pfb", "pfm", "afm"] },
  "application/x-font-vfont": { "source": "apache" },
  "application/x-freearc": { "source": "apache", "extensions": ["arc"] },
  "application/x-futuresplash": { "source": "apache", "extensions": ["spl"] },
  "application/x-gca-compressed": { "source": "apache", "extensions": ["gca"] },
  "application/x-glulx": { "source": "apache", "extensions": ["ulx"] },
  "application/x-gnumeric": { "source": "apache", "extensions": ["gnumeric"] },
  "application/x-gramps-xml": { "source": "apache", "extensions": ["gramps"] },
  "application/x-gtar": { "source": "apache", "extensions": ["gtar"] },
  "application/x-gzip": { "source": "apache" },
  "application/x-hdf": { "source": "apache", "extensions": ["hdf"] },
  "application/x-httpd-php": { "compressible": true, "extensions": ["php"] },
  "application/x-install-instructions": { "source": "apache", "extensions": ["install"] },
  "application/x-iso9660-image": { "source": "apache", "extensions": ["iso"] },
  "application/x-iwork-keynote-sffkey": { "extensions": ["key"] },
  "application/x-iwork-numbers-sffnumbers": { "extensions": ["numbers"] },
  "application/x-iwork-pages-sffpages": { "extensions": ["pages"] },
  "application/x-java-archive-diff": { "source": "nginx", "extensions": ["jardiff"] },
  "application/x-java-jnlp-file": { "source": "apache", "compressible": false, "extensions": ["jnlp"] },
  "application/x-javascript": { "compressible": true },
  "application/x-keepass2": { "extensions": ["kdbx"] },
  "application/x-latex": { "source": "apache", "compressible": false, "extensions": ["latex"] },
  "application/x-lua-bytecode": { "extensions": ["luac"] },
  "application/x-lzh-compressed": { "source": "apache", "extensions": ["lzh", "lha"] },
  "application/x-makeself": { "source": "nginx", "extensions": ["run"] },
  "application/x-mie": { "source": "apache", "extensions": ["mie"] },
  "application/x-mobipocket-ebook": { "source": "apache", "extensions": ["prc", "mobi"] },
  "application/x-mpegurl": { "compressible": false },
  "application/x-ms-application": { "source": "apache", "extensions": ["application"] },
  "application/x-ms-shortcut": { "source": "apache", "extensions": ["lnk"] },
  "application/x-ms-wmd": { "source": "apache", "extensions": ["wmd"] },
  "application/x-ms-wmz": { "source": "apache", "extensions": ["wmz"] },
  "application/x-ms-xbap": { "source": "apache", "extensions": ["xbap"] },
  "application/x-msaccess": { "source": "apache", "extensions": ["mdb"] },
  "application/x-msbinder": { "source": "apache", "extensions": ["obd"] },
  "application/x-mscardfile": { "source": "apache", "extensions": ["crd"] },
  "application/x-msclip": { "source": "apache", "extensions": ["clp"] },
  "application/x-msdos-program": { "extensions": ["exe"] },
  "application/x-msdownload": { "source": "apache", "extensions": ["exe", "dll", "com", "bat", "msi"] },
  "application/x-msmediaview": { "source": "apache", "extensions": ["mvb", "m13", "m14"] },
  "application/x-msmetafile": { "source": "apache", "extensions": ["wmf", "wmz", "emf", "emz"] },
  "application/x-msmoney": { "source": "apache", "extensions": ["mny"] },
  "application/x-mspublisher": { "source": "apache", "extensions": ["pub"] },
  "application/x-msschedule": { "source": "apache", "extensions": ["scd"] },
  "application/x-msterminal": { "source": "apache", "extensions": ["trm"] },
  "application/x-mswrite": { "source": "apache", "extensions": ["wri"] },
  "application/x-netcdf": { "source": "apache", "extensions": ["nc", "cdf"] },
  "application/x-ns-proxy-autoconfig": { "compressible": true, "extensions": ["pac"] },
  "application/x-nzb": { "source": "apache", "extensions": ["nzb"] },
  "application/x-perl": { "source": "nginx", "extensions": ["pl", "pm"] },
  "application/x-pilot": { "source": "nginx", "extensions": ["prc", "pdb"] },
  "application/x-pkcs12": { "source": "apache", "compressible": false, "extensions": ["p12", "pfx"] },
  "application/x-pkcs7-certificates": { "source": "apache", "extensions": ["p7b", "spc"] },
  "application/x-pkcs7-certreqresp": { "source": "apache", "extensions": ["p7r"] },
  "application/x-pki-message": { "source": "iana" },
  "application/x-rar-compressed": { "source": "apache", "compressible": false, "extensions": ["rar"] },
  "application/x-redhat-package-manager": { "source": "nginx", "extensions": ["rpm"] },
  "application/x-research-info-systems": { "source": "apache", "extensions": ["ris"] },
  "application/x-sea": { "source": "nginx", "extensions": ["sea"] },
  "application/x-sh": { "source": "apache", "compressible": true, "extensions": ["sh"] },
  "application/x-shar": { "source": "apache", "extensions": ["shar"] },
  "application/x-shockwave-flash": { "source": "apache", "compressible": false, "extensions": ["swf"] },
  "application/x-silverlight-app": { "source": "apache", "extensions": ["xap"] },
  "application/x-sql": { "source": "apache", "extensions": ["sql"] },
  "application/x-stuffit": { "source": "apache", "compressible": false, "extensions": ["sit"] },
  "application/x-stuffitx": { "source": "apache", "extensions": ["sitx"] },
  "application/x-subrip": { "source": "apache", "extensions": ["srt"] },
  "application/x-sv4cpio": { "source": "apache", "extensions": ["sv4cpio"] },
  "application/x-sv4crc": { "source": "apache", "extensions": ["sv4crc"] },
  "application/x-t3vm-image": { "source": "apache", "extensions": ["t3"] },
  "application/x-tads": { "source": "apache", "extensions": ["gam"] },
  "application/x-tar": { "source": "apache", "compressible": true, "extensions": ["tar"] },
  "application/x-tcl": { "source": "apache", "extensions": ["tcl", "tk"] },
  "application/x-tex": { "source": "apache", "extensions": ["tex"] },
  "application/x-tex-tfm": { "source": "apache", "extensions": ["tfm"] },
  "application/x-texinfo": { "source": "apache", "extensions": ["texinfo", "texi"] },
  "application/x-tgif": { "source": "apache", "extensions": ["obj"] },
  "application/x-ustar": { "source": "apache", "extensions": ["ustar"] },
  "application/x-virtualbox-hdd": { "compressible": true, "extensions": ["hdd"] },
  "application/x-virtualbox-ova": { "compressible": true, "extensions": ["ova"] },
  "application/x-virtualbox-ovf": { "compressible": true, "extensions": ["ovf"] },
  "application/x-virtualbox-vbox": { "compressible": true, "extensions": ["vbox"] },
  "application/x-virtualbox-vbox-extpack": { "compressible": false, "extensions": ["vbox-extpack"] },
  "application/x-virtualbox-vdi": { "compressible": true, "extensions": ["vdi"] },
  "application/x-virtualbox-vhd": { "compressible": true, "extensions": ["vhd"] },
  "application/x-virtualbox-vmdk": { "compressible": true, "extensions": ["vmdk"] },
  "application/x-wais-source": { "source": "apache", "extensions": ["src"] },
  "application/x-web-app-manifest+json": { "compressible": true, "extensions": ["webapp"] },
  "application/x-www-form-urlencoded": { "source": "iana", "compressible": true },
  "application/x-x509-ca-cert": { "source": "iana", "extensions": ["der", "crt", "pem"] },
  "application/x-x509-ca-ra-cert": { "source": "iana" },
  "application/x-x509-next-ca-cert": { "source": "iana" },
  "application/x-xfig": { "source": "apache", "extensions": ["fig"] },
  "application/x-xliff+xml": { "source": "apache", "compressible": true, "extensions": ["xlf"] },
  "application/x-xpinstall": { "source": "apache", "compressible": false, "extensions": ["xpi"] },
  "application/x-xz": { "source": "apache", "extensions": ["xz"] },
  "application/x-zmachine": { "source": "apache", "extensions": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"] },
  "application/x400-bp": { "source": "iana" },
  "application/xacml+xml": { "source": "iana", "compressible": true },
  "application/xaml+xml": { "source": "apache", "compressible": true, "extensions": ["xaml"] },
  "application/xcap-att+xml": { "source": "iana", "compressible": true, "extensions": ["xav"] },
  "application/xcap-caps+xml": { "source": "iana", "compressible": true, "extensions": ["xca"] },
  "application/xcap-diff+xml": { "source": "iana", "compressible": true, "extensions": ["xdf"] },
  "application/xcap-el+xml": { "source": "iana", "compressible": true, "extensions": ["xel"] },
  "application/xcap-error+xml": { "source": "iana", "compressible": true },
  "application/xcap-ns+xml": { "source": "iana", "compressible": true, "extensions": ["xns"] },
  "application/xcon-conference-info+xml": { "source": "iana", "compressible": true },
  "application/xcon-conference-info-diff+xml": { "source": "iana", "compressible": true },
  "application/xenc+xml": { "source": "iana", "compressible": true, "extensions": ["xenc"] },
  "application/xhtml+xml": { "source": "iana", "compressible": true, "extensions": ["xhtml", "xht"] },
  "application/xhtml-voice+xml": { "source": "apache", "compressible": true },
  "application/xliff+xml": { "source": "iana", "compressible": true, "extensions": ["xlf"] },
  "application/xml": { "source": "iana", "compressible": true, "extensions": ["xml", "xsl", "xsd", "rng"] },
  "application/xml-dtd": { "source": "iana", "compressible": true, "extensions": ["dtd"] },
  "application/xml-external-parsed-entity": { "source": "iana" },
  "application/xml-patch+xml": { "source": "iana", "compressible": true },
  "application/xmpp+xml": { "source": "iana", "compressible": true },
  "application/xop+xml": { "source": "iana", "compressible": true, "extensions": ["xop"] },
  "application/xproc+xml": { "source": "apache", "compressible": true, "extensions": ["xpl"] },
  "application/xslt+xml": { "source": "iana", "compressible": true, "extensions": ["xsl", "xslt"] },
  "application/xspf+xml": { "source": "apache", "compressible": true, "extensions": ["xspf"] },
  "application/xv+xml": { "source": "iana", "compressible": true, "extensions": ["mxml", "xhvml", "xvml", "xvm"] },
  "application/yang": { "source": "iana", "extensions": ["yang"] },
  "application/yang-data+json": { "source": "iana", "compressible": true },
  "application/yang-data+xml": { "source": "iana", "compressible": true },
  "application/yang-patch+json": { "source": "iana", "compressible": true },
  "application/yang-patch+xml": { "source": "iana", "compressible": true },
  "application/yin+xml": { "source": "iana", "compressible": true, "extensions": ["yin"] },
  "application/zip": { "source": "iana", "compressible": false, "extensions": ["zip"] },
  "application/zlib": { "source": "iana" },
  "application/zstd": { "source": "iana" },
  "audio/1d-interleaved-parityfec": { "source": "iana" },
  "audio/32kadpcm": { "source": "iana" },
  "audio/3gpp": { "source": "iana", "compressible": false, "extensions": ["3gpp"] },
  "audio/3gpp2": { "source": "iana" },
  "audio/aac": { "source": "iana" },
  "audio/ac3": { "source": "iana" },
  "audio/adpcm": { "source": "apache", "extensions": ["adp"] },
  "audio/amr": { "source": "iana", "extensions": ["amr"] },
  "audio/amr-wb": { "source": "iana" },
  "audio/amr-wb+": { "source": "iana" },
  "audio/aptx": { "source": "iana" },
  "audio/asc": { "source": "iana" },
  "audio/atrac-advanced-lossless": { "source": "iana" },
  "audio/atrac-x": { "source": "iana" },
  "audio/atrac3": { "source": "iana" },
  "audio/basic": { "source": "iana", "compressible": false, "extensions": ["au", "snd"] },
  "audio/bv16": { "source": "iana" },
  "audio/bv32": { "source": "iana" },
  "audio/clearmode": { "source": "iana" },
  "audio/cn": { "source": "iana" },
  "audio/dat12": { "source": "iana" },
  "audio/dls": { "source": "iana" },
  "audio/dsr-es201108": { "source": "iana" },
  "audio/dsr-es202050": { "source": "iana" },
  "audio/dsr-es202211": { "source": "iana" },
  "audio/dsr-es202212": { "source": "iana" },
  "audio/dv": { "source": "iana" },
  "audio/dvi4": { "source": "iana" },
  "audio/eac3": { "source": "iana" },
  "audio/encaprtp": { "source": "iana" },
  "audio/evrc": { "source": "iana" },
  "audio/evrc-qcp": { "source": "iana" },
  "audio/evrc0": { "source": "iana" },
  "audio/evrc1": { "source": "iana" },
  "audio/evrcb": { "source": "iana" },
  "audio/evrcb0": { "source": "iana" },
  "audio/evrcb1": { "source": "iana" },
  "audio/evrcnw": { "source": "iana" },
  "audio/evrcnw0": { "source": "iana" },
  "audio/evrcnw1": { "source": "iana" },
  "audio/evrcwb": { "source": "iana" },
  "audio/evrcwb0": { "source": "iana" },
  "audio/evrcwb1": { "source": "iana" },
  "audio/evs": { "source": "iana" },
  "audio/flexfec": { "source": "iana" },
  "audio/fwdred": { "source": "iana" },
  "audio/g711-0": { "source": "iana" },
  "audio/g719": { "source": "iana" },
  "audio/g722": { "source": "iana" },
  "audio/g7221": { "source": "iana" },
  "audio/g723": { "source": "iana" },
  "audio/g726-16": { "source": "iana" },
  "audio/g726-24": { "source": "iana" },
  "audio/g726-32": { "source": "iana" },
  "audio/g726-40": { "source": "iana" },
  "audio/g728": { "source": "iana" },
  "audio/g729": { "source": "iana" },
  "audio/g7291": { "source": "iana" },
  "audio/g729d": { "source": "iana" },
  "audio/g729e": { "source": "iana" },
  "audio/gsm": { "source": "iana" },
  "audio/gsm-efr": { "source": "iana" },
  "audio/gsm-hr-08": { "source": "iana" },
  "audio/ilbc": { "source": "iana" },
  "audio/ip-mr_v2.5": { "source": "iana" },
  "audio/isac": { "source": "apache" },
  "audio/l16": { "source": "iana" },
  "audio/l20": { "source": "iana" },
  "audio/l24": { "source": "iana", "compressible": false },
  "audio/l8": { "source": "iana" },
  "audio/lpc": { "source": "iana" },
  "audio/melp": { "source": "iana" },
  "audio/melp1200": { "source": "iana" },
  "audio/melp2400": { "source": "iana" },
  "audio/melp600": { "source": "iana" },
  "audio/mhas": { "source": "iana" },
  "audio/midi": { "source": "apache", "extensions": ["mid", "midi", "kar", "rmi"] },
  "audio/mobile-xmf": { "source": "iana", "extensions": ["mxmf"] },
  "audio/mp3": { "compressible": false, "extensions": ["mp3"] },
  "audio/mp4": { "source": "iana", "compressible": false, "extensions": ["m4a", "mp4a"] },
  "audio/mp4a-latm": { "source": "iana" },
  "audio/mpa": { "source": "iana" },
  "audio/mpa-robust": { "source": "iana" },
  "audio/mpeg": { "source": "iana", "compressible": false, "extensions": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"] },
  "audio/mpeg4-generic": { "source": "iana" },
  "audio/musepack": { "source": "apache" },
  "audio/ogg": { "source": "iana", "compressible": false, "extensions": ["oga", "ogg", "spx", "opus"] },
  "audio/opus": { "source": "iana" },
  "audio/parityfec": { "source": "iana" },
  "audio/pcma": { "source": "iana" },
  "audio/pcma-wb": { "source": "iana" },
  "audio/pcmu": { "source": "iana" },
  "audio/pcmu-wb": { "source": "iana" },
  "audio/prs.sid": { "source": "iana" },
  "audio/qcelp": { "source": "iana" },
  "audio/raptorfec": { "source": "iana" },
  "audio/red": { "source": "iana" },
  "audio/rtp-enc-aescm128": { "source": "iana" },
  "audio/rtp-midi": { "source": "iana" },
  "audio/rtploopback": { "source": "iana" },
  "audio/rtx": { "source": "iana" },
  "audio/s3m": { "source": "apache", "extensions": ["s3m"] },
  "audio/scip": { "source": "iana" },
  "audio/silk": { "source": "apache", "extensions": ["sil"] },
  "audio/smv": { "source": "iana" },
  "audio/smv-qcp": { "source": "iana" },
  "audio/smv0": { "source": "iana" },
  "audio/sofa": { "source": "iana" },
  "audio/sp-midi": { "source": "iana" },
  "audio/speex": { "source": "iana" },
  "audio/t140c": { "source": "iana" },
  "audio/t38": { "source": "iana" },
  "audio/telephone-event": { "source": "iana" },
  "audio/tetra_acelp": { "source": "iana" },
  "audio/tetra_acelp_bb": { "source": "iana" },
  "audio/tone": { "source": "iana" },
  "audio/tsvcis": { "source": "iana" },
  "audio/uemclip": { "source": "iana" },
  "audio/ulpfec": { "source": "iana" },
  "audio/usac": { "source": "iana" },
  "audio/vdvi": { "source": "iana" },
  "audio/vmr-wb": { "source": "iana" },
  "audio/vnd.3gpp.iufp": { "source": "iana" },
  "audio/vnd.4sb": { "source": "iana" },
  "audio/vnd.audiokoz": { "source": "iana" },
  "audio/vnd.celp": { "source": "iana" },
  "audio/vnd.cisco.nse": { "source": "iana" },
  "audio/vnd.cmles.radio-events": { "source": "iana" },
  "audio/vnd.cns.anp1": { "source": "iana" },
  "audio/vnd.cns.inf1": { "source": "iana" },
  "audio/vnd.dece.audio": { "source": "iana", "extensions": ["uva", "uvva"] },
  "audio/vnd.digital-winds": { "source": "iana", "extensions": ["eol"] },
  "audio/vnd.dlna.adts": { "source": "iana" },
  "audio/vnd.dolby.heaac.1": { "source": "iana" },
  "audio/vnd.dolby.heaac.2": { "source": "iana" },
  "audio/vnd.dolby.mlp": { "source": "iana" },
  "audio/vnd.dolby.mps": { "source": "iana" },
  "audio/vnd.dolby.pl2": { "source": "iana" },
  "audio/vnd.dolby.pl2x": { "source": "iana" },
  "audio/vnd.dolby.pl2z": { "source": "iana" },
  "audio/vnd.dolby.pulse.1": { "source": "iana" },
  "audio/vnd.dra": { "source": "iana", "extensions": ["dra"] },
  "audio/vnd.dts": { "source": "iana", "extensions": ["dts"] },
  "audio/vnd.dts.hd": { "source": "iana", "extensions": ["dtshd"] },
  "audio/vnd.dts.uhd": { "source": "iana" },
  "audio/vnd.dvb.file": { "source": "iana" },
  "audio/vnd.everad.plj": { "source": "iana" },
  "audio/vnd.hns.audio": { "source": "iana" },
  "audio/vnd.lucent.voice": { "source": "iana", "extensions": ["lvp"] },
  "audio/vnd.ms-playready.media.pya": { "source": "iana", "extensions": ["pya"] },
  "audio/vnd.nokia.mobile-xmf": { "source": "iana" },
  "audio/vnd.nortel.vbk": { "source": "iana" },
  "audio/vnd.nuera.ecelp4800": { "source": "iana", "extensions": ["ecelp4800"] },
  "audio/vnd.nuera.ecelp7470": { "source": "iana", "extensions": ["ecelp7470"] },
  "audio/vnd.nuera.ecelp9600": { "source": "iana", "extensions": ["ecelp9600"] },
  "audio/vnd.octel.sbc": { "source": "iana" },
  "audio/vnd.presonus.multitrack": { "source": "iana" },
  "audio/vnd.qcelp": { "source": "iana" },
  "audio/vnd.rhetorex.32kadpcm": { "source": "iana" },
  "audio/vnd.rip": { "source": "iana", "extensions": ["rip"] },
  "audio/vnd.rn-realaudio": { "compressible": false },
  "audio/vnd.sealedmedia.softseal.mpeg": { "source": "iana" },
  "audio/vnd.vmx.cvsd": { "source": "iana" },
  "audio/vnd.wave": { "compressible": false },
  "audio/vorbis": { "source": "iana", "compressible": false },
  "audio/vorbis-config": { "source": "iana" },
  "audio/wav": { "compressible": false, "extensions": ["wav"] },
  "audio/wave": { "compressible": false, "extensions": ["wav"] },
  "audio/webm": { "source": "apache", "compressible": false, "extensions": ["weba"] },
  "audio/x-aac": { "source": "apache", "compressible": false, "extensions": ["aac"] },
  "audio/x-aiff": { "source": "apache", "extensions": ["aif", "aiff", "aifc"] },
  "audio/x-caf": { "source": "apache", "compressible": false, "extensions": ["caf"] },
  "audio/x-flac": { "source": "apache", "extensions": ["flac"] },
  "audio/x-m4a": { "source": "nginx", "extensions": ["m4a"] },
  "audio/x-matroska": { "source": "apache", "extensions": ["mka"] },
  "audio/x-mpegurl": { "source": "apache", "extensions": ["m3u"] },
  "audio/x-ms-wax": { "source": "apache", "extensions": ["wax"] },
  "audio/x-ms-wma": { "source": "apache", "extensions": ["wma"] },
  "audio/x-pn-realaudio": { "source": "apache", "extensions": ["ram", "ra"] },
  "audio/x-pn-realaudio-plugin": { "source": "apache", "extensions": ["rmp"] },
  "audio/x-realaudio": { "source": "nginx", "extensions": ["ra"] },
  "audio/x-tta": { "source": "apache" },
  "audio/x-wav": { "source": "apache", "extensions": ["wav"] },
  "audio/xm": { "source": "apache", "extensions": ["xm"] },
  "chemical/x-cdx": { "source": "apache", "extensions": ["cdx"] },
  "chemical/x-cif": { "source": "apache", "extensions": ["cif"] },
  "chemical/x-cmdf": { "source": "apache", "extensions": ["cmdf"] },
  "chemical/x-cml": { "source": "apache", "extensions": ["cml"] },
  "chemical/x-csml": { "source": "apache", "extensions": ["csml"] },
  "chemical/x-pdb": { "source": "apache" },
  "chemical/x-xyz": { "source": "apache", "extensions": ["xyz"] },
  "font/collection": { "source": "iana", "extensions": ["ttc"] },
  "font/otf": { "source": "iana", "compressible": true, "extensions": ["otf"] },
  "font/sfnt": { "source": "iana" },
  "font/ttf": { "source": "iana", "compressible": true, "extensions": ["ttf"] },
  "font/woff": { "source": "iana", "extensions": ["woff"] },
  "font/woff2": { "source": "iana", "extensions": ["woff2"] },
  "image/aces": { "source": "iana", "extensions": ["exr"] },
  "image/apng": { "compressible": false, "extensions": ["apng"] },
  "image/avci": { "source": "iana", "extensions": ["avci"] },
  "image/avcs": { "source": "iana", "extensions": ["avcs"] },
  "image/avif": { "source": "iana", "compressible": false, "extensions": ["avif"] },
  "image/bmp": { "source": "iana", "compressible": true, "extensions": ["bmp"] },
  "image/cgm": { "source": "iana", "extensions": ["cgm"] },
  "image/dicom-rle": { "source": "iana", "extensions": ["drle"] },
  "image/emf": { "source": "iana", "extensions": ["emf"] },
  "image/fits": { "source": "iana", "extensions": ["fits"] },
  "image/g3fax": { "source": "iana", "extensions": ["g3"] },
  "image/gif": { "source": "iana", "compressible": false, "extensions": ["gif"] },
  "image/heic": { "source": "iana", "extensions": ["heic"] },
  "image/heic-sequence": { "source": "iana", "extensions": ["heics"] },
  "image/heif": { "source": "iana", "extensions": ["heif"] },
  "image/heif-sequence": { "source": "iana", "extensions": ["heifs"] },
  "image/hej2k": { "source": "iana", "extensions": ["hej2"] },
  "image/hsj2": { "source": "iana", "extensions": ["hsj2"] },
  "image/ief": { "source": "iana", "extensions": ["ief"] },
  "image/jls": { "source": "iana", "extensions": ["jls"] },
  "image/jp2": { "source": "iana", "compressible": false, "extensions": ["jp2", "jpg2"] },
  "image/jpeg": { "source": "iana", "compressible": false, "extensions": ["jpeg", "jpg", "jpe"] },
  "image/jph": { "source": "iana", "extensions": ["jph"] },
  "image/jphc": { "source": "iana", "extensions": ["jhc"] },
  "image/jpm": { "source": "iana", "compressible": false, "extensions": ["jpm"] },
  "image/jpx": { "source": "iana", "compressible": false, "extensions": ["jpx", "jpf"] },
  "image/jxr": { "source": "iana", "extensions": ["jxr"] },
  "image/jxra": { "source": "iana", "extensions": ["jxra"] },
  "image/jxrs": { "source": "iana", "extensions": ["jxrs"] },
  "image/jxs": { "source": "iana", "extensions": ["jxs"] },
  "image/jxsc": { "source": "iana", "extensions": ["jxsc"] },
  "image/jxsi": { "source": "iana", "extensions": ["jxsi"] },
  "image/jxss": { "source": "iana", "extensions": ["jxss"] },
  "image/ktx": { "source": "iana", "extensions": ["ktx"] },
  "image/ktx2": { "source": "iana", "extensions": ["ktx2"] },
  "image/naplps": { "source": "iana" },
  "image/pjpeg": { "compressible": false },
  "image/png": { "source": "iana", "compressible": false, "extensions": ["png"] },
  "image/prs.btif": { "source": "iana", "extensions": ["btif"] },
  "image/prs.pti": { "source": "iana", "extensions": ["pti"] },
  "image/pwg-raster": { "source": "iana" },
  "image/sgi": { "source": "apache", "extensions": ["sgi"] },
  "image/svg+xml": { "source": "iana", "compressible": true, "extensions": ["svg", "svgz"] },
  "image/t38": { "source": "iana", "extensions": ["t38"] },
  "image/tiff": { "source": "iana", "compressible": false, "extensions": ["tif", "tiff"] },
  "image/tiff-fx": { "source": "iana", "extensions": ["tfx"] },
  "image/vnd.adobe.photoshop": { "source": "iana", "compressible": true, "extensions": ["psd"] },
  "image/vnd.airzip.accelerator.azv": { "source": "iana", "extensions": ["azv"] },
  "image/vnd.cns.inf2": { "source": "iana" },
  "image/vnd.dece.graphic": { "source": "iana", "extensions": ["uvi", "uvvi", "uvg", "uvvg"] },
  "image/vnd.djvu": { "source": "iana", "extensions": ["djvu", "djv"] },
  "image/vnd.dvb.subtitle": { "source": "iana", "extensions": ["sub"] },
  "image/vnd.dwg": { "source": "iana", "extensions": ["dwg"] },
  "image/vnd.dxf": { "source": "iana", "extensions": ["dxf"] },
  "image/vnd.fastbidsheet": { "source": "iana", "extensions": ["fbs"] },
  "image/vnd.fpx": { "source": "iana", "extensions": ["fpx"] },
  "image/vnd.fst": { "source": "iana", "extensions": ["fst"] },
  "image/vnd.fujixerox.edmics-mmr": { "source": "iana", "extensions": ["mmr"] },
  "image/vnd.fujixerox.edmics-rlc": { "source": "iana", "extensions": ["rlc"] },
  "image/vnd.globalgraphics.pgb": { "source": "iana" },
  "image/vnd.microsoft.icon": { "source": "iana", "compressible": true, "extensions": ["ico"] },
  "image/vnd.mix": { "source": "iana" },
  "image/vnd.mozilla.apng": { "source": "iana" },
  "image/vnd.ms-dds": { "compressible": true, "extensions": ["dds"] },
  "image/vnd.ms-modi": { "source": "iana", "extensions": ["mdi"] },
  "image/vnd.ms-photo": { "source": "apache", "extensions": ["wdp"] },
  "image/vnd.net-fpx": { "source": "iana", "extensions": ["npx"] },
  "image/vnd.pco.b16": { "source": "iana", "extensions": ["b16"] },
  "image/vnd.radiance": { "source": "iana" },
  "image/vnd.sealed.png": { "source": "iana" },
  "image/vnd.sealedmedia.softseal.gif": { "source": "iana" },
  "image/vnd.sealedmedia.softseal.jpg": { "source": "iana" },
  "image/vnd.svf": { "source": "iana" },
  "image/vnd.tencent.tap": { "source": "iana", "extensions": ["tap"] },
  "image/vnd.valve.source.texture": { "source": "iana", "extensions": ["vtf"] },
  "image/vnd.wap.wbmp": { "source": "iana", "extensions": ["wbmp"] },
  "image/vnd.xiff": { "source": "iana", "extensions": ["xif"] },
  "image/vnd.zbrush.pcx": { "source": "iana", "extensions": ["pcx"] },
  "image/webp": { "source": "apache", "extensions": ["webp"] },
  "image/wmf": { "source": "iana", "extensions": ["wmf"] },
  "image/x-3ds": { "source": "apache", "extensions": ["3ds"] },
  "image/x-cmu-raster": { "source": "apache", "extensions": ["ras"] },
  "image/x-cmx": { "source": "apache", "extensions": ["cmx"] },
  "image/x-freehand": { "source": "apache", "extensions": ["fh", "fhc", "fh4", "fh5", "fh7"] },
  "image/x-icon": { "source": "apache", "compressible": true, "extensions": ["ico"] },
  "image/x-jng": { "source": "nginx", "extensions": ["jng"] },
  "image/x-mrsid-image": { "source": "apache", "extensions": ["sid"] },
  "image/x-ms-bmp": { "source": "nginx", "compressible": true, "extensions": ["bmp"] },
  "image/x-pcx": { "source": "apache", "extensions": ["pcx"] },
  "image/x-pict": { "source": "apache", "extensions": ["pic", "pct"] },
  "image/x-portable-anymap": { "source": "apache", "extensions": ["pnm"] },
  "image/x-portable-bitmap": { "source": "apache", "extensions": ["pbm"] },
  "image/x-portable-graymap": { "source": "apache", "extensions": ["pgm"] },
  "image/x-portable-pixmap": { "source": "apache", "extensions": ["ppm"] },
  "image/x-rgb": { "source": "apache", "extensions": ["rgb"] },
  "image/x-tga": { "source": "apache", "extensions": ["tga"] },
  "image/x-xbitmap": { "source": "apache", "extensions": ["xbm"] },
  "image/x-xcf": { "compressible": false },
  "image/x-xpixmap": { "source": "apache", "extensions": ["xpm"] },
  "image/x-xwindowdump": { "source": "apache", "extensions": ["xwd"] },
  "message/cpim": { "source": "iana" },
  "message/delivery-status": { "source": "iana" },
  "message/disposition-notification": { "source": "iana", "extensions": ["disposition-notification"] },
  "message/external-body": { "source": "iana" },
  "message/feedback-report": { "source": "iana" },
  "message/global": { "source": "iana", "extensions": ["u8msg"] },
  "message/global-delivery-status": { "source": "iana", "extensions": ["u8dsn"] },
  "message/global-disposition-notification": { "source": "iana", "extensions": ["u8mdn"] },
  "message/global-headers": { "source": "iana", "extensions": ["u8hdr"] },
  "message/http": { "source": "iana", "compressible": false },
  "message/imdn+xml": { "source": "iana", "compressible": true },
  "message/news": { "source": "iana" },
  "message/partial": { "source": "iana", "compressible": false },
  "message/rfc822": { "source": "iana", "compressible": true, "extensions": ["eml", "mime"] },
  "message/s-http": { "source": "iana" },
  "message/sip": { "source": "iana" },
  "message/sipfrag": { "source": "iana" },
  "message/tracking-status": { "source": "iana" },
  "message/vnd.si.simp": { "source": "iana" },
  "message/vnd.wfa.wsc": { "source": "iana", "extensions": ["wsc"] },
  "model/3mf": { "source": "iana", "extensions": ["3mf"] },
  "model/e57": { "source": "iana" },
  "model/gltf+json": { "source": "iana", "compressible": true, "extensions": ["gltf"] },
  "model/gltf-binary": { "source": "iana", "compressible": true, "extensions": ["glb"] },
  "model/iges": { "source": "iana", "compressible": false, "extensions": ["igs", "iges"] },
  "model/mesh": { "source": "iana", "compressible": false, "extensions": ["msh", "mesh", "silo"] },
  "model/mtl": { "source": "iana", "extensions": ["mtl"] },
  "model/obj": { "source": "iana", "extensions": ["obj"] },
  "model/step": { "source": "iana" },
  "model/step+xml": { "source": "iana", "compressible": true, "extensions": ["stpx"] },
  "model/step+zip": { "source": "iana", "compressible": false, "extensions": ["stpz"] },
  "model/step-xml+zip": { "source": "iana", "compressible": false, "extensions": ["stpxz"] },
  "model/stl": { "source": "iana", "extensions": ["stl"] },
  "model/vnd.collada+xml": { "source": "iana", "compressible": true, "extensions": ["dae"] },
  "model/vnd.dwf": { "source": "iana", "extensions": ["dwf"] },
  "model/vnd.flatland.3dml": { "source": "iana" },
  "model/vnd.gdl": { "source": "iana", "extensions": ["gdl"] },
  "model/vnd.gs-gdl": { "source": "apache" },
  "model/vnd.gs.gdl": { "source": "iana" },
  "model/vnd.gtw": { "source": "iana", "extensions": ["gtw"] },
  "model/vnd.moml+xml": { "source": "iana", "compressible": true },
  "model/vnd.mts": { "source": "iana", "extensions": ["mts"] },
  "model/vnd.opengex": { "source": "iana", "extensions": ["ogex"] },
  "model/vnd.parasolid.transmit.binary": { "source": "iana", "extensions": ["x_b"] },
  "model/vnd.parasolid.transmit.text": { "source": "iana", "extensions": ["x_t"] },
  "model/vnd.pytha.pyox": { "source": "iana" },
  "model/vnd.rosette.annotated-data-model": { "source": "iana" },
  "model/vnd.sap.vds": { "source": "iana", "extensions": ["vds"] },
  "model/vnd.usdz+zip": { "source": "iana", "compressible": false, "extensions": ["usdz"] },
  "model/vnd.valve.source.compiled-map": { "source": "iana", "extensions": ["bsp"] },
  "model/vnd.vtu": { "source": "iana", "extensions": ["vtu"] },
  "model/vrml": { "source": "iana", "compressible": false, "extensions": ["wrl", "vrml"] },
  "model/x3d+binary": { "source": "apache", "compressible": false, "extensions": ["x3db", "x3dbz"] },
  "model/x3d+fastinfoset": { "source": "iana", "extensions": ["x3db"] },
  "model/x3d+vrml": { "source": "apache", "compressible": false, "extensions": ["x3dv", "x3dvz"] },
  "model/x3d+xml": { "source": "iana", "compressible": true, "extensions": ["x3d", "x3dz"] },
  "model/x3d-vrml": { "source": "iana", "extensions": ["x3dv"] },
  "multipart/alternative": { "source": "iana", "compressible": false },
  "multipart/appledouble": { "source": "iana" },
  "multipart/byteranges": { "source": "iana" },
  "multipart/digest": { "source": "iana" },
  "multipart/encrypted": { "source": "iana", "compressible": false },
  "multipart/form-data": { "source": "iana", "compressible": false },
  "multipart/header-set": { "source": "iana" },
  "multipart/mixed": { "source": "iana" },
  "multipart/multilingual": { "source": "iana" },
  "multipart/parallel": { "source": "iana" },
  "multipart/related": { "source": "iana", "compressible": false },
  "multipart/report": { "source": "iana" },
  "multipart/signed": { "source": "iana", "compressible": false },
  "multipart/vnd.bint.med-plus": { "source": "iana" },
  "multipart/voice-message": { "source": "iana" },
  "multipart/x-mixed-replace": { "source": "iana" },
  "text/1d-interleaved-parityfec": { "source": "iana" },
  "text/cache-manifest": { "source": "iana", "compressible": true, "extensions": ["appcache", "manifest"] },
  "text/calendar": { "source": "iana", "extensions": ["ics", "ifb"] },
  "text/calender": { "compressible": true },
  "text/cmd": { "compressible": true },
  "text/coffeescript": { "extensions": ["coffee", "litcoffee"] },
  "text/cql": { "source": "iana" },
  "text/cql-expression": { "source": "iana" },
  "text/cql-identifier": { "source": "iana" },
  "text/css": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["css"] },
  "text/csv": { "source": "iana", "compressible": true, "extensions": ["csv"] },
  "text/csv-schema": { "source": "iana" },
  "text/directory": { "source": "iana" },
  "text/dns": { "source": "iana" },
  "text/ecmascript": { "source": "iana" },
  "text/encaprtp": { "source": "iana" },
  "text/enriched": { "source": "iana" },
  "text/fhirpath": { "source": "iana" },
  "text/flexfec": { "source": "iana" },
  "text/fwdred": { "source": "iana" },
  "text/gff3": { "source": "iana" },
  "text/grammar-ref-list": { "source": "iana" },
  "text/html": { "source": "iana", "compressible": true, "extensions": ["html", "htm", "shtml"] },
  "text/jade": { "extensions": ["jade"] },
  "text/javascript": { "source": "iana", "compressible": true },
  "text/jcr-cnd": { "source": "iana" },
  "text/jsx": { "compressible": true, "extensions": ["jsx"] },
  "text/less": { "compressible": true, "extensions": ["less"] },
  "text/markdown": { "source": "iana", "compressible": true, "extensions": ["markdown", "md"] },
  "text/mathml": { "source": "nginx", "extensions": ["mml"] },
  "text/mdx": { "compressible": true, "extensions": ["mdx"] },
  "text/mizar": { "source": "iana" },
  "text/n3": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["n3"] },
  "text/parameters": { "source": "iana", "charset": "UTF-8" },
  "text/parityfec": { "source": "iana" },
  "text/plain": { "source": "iana", "compressible": true, "extensions": ["txt", "text", "conf", "def", "list", "log", "in", "ini"] },
  "text/provenance-notation": { "source": "iana", "charset": "UTF-8" },
  "text/prs.fallenstein.rst": { "source": "iana" },
  "text/prs.lines.tag": { "source": "iana", "extensions": ["dsc"] },
  "text/prs.prop.logic": { "source": "iana" },
  "text/raptorfec": { "source": "iana" },
  "text/red": { "source": "iana" },
  "text/rfc822-headers": { "source": "iana" },
  "text/richtext": { "source": "iana", "compressible": true, "extensions": ["rtx"] },
  "text/rtf": { "source": "iana", "compressible": true, "extensions": ["rtf"] },
  "text/rtp-enc-aescm128": { "source": "iana" },
  "text/rtploopback": { "source": "iana" },
  "text/rtx": { "source": "iana" },
  "text/sgml": { "source": "iana", "extensions": ["sgml", "sgm"] },
  "text/shaclc": { "source": "iana" },
  "text/shex": { "source": "iana", "extensions": ["shex"] },
  "text/slim": { "extensions": ["slim", "slm"] },
  "text/spdx": { "source": "iana", "extensions": ["spdx"] },
  "text/strings": { "source": "iana" },
  "text/stylus": { "extensions": ["stylus", "styl"] },
  "text/t140": { "source": "iana" },
  "text/tab-separated-values": { "source": "iana", "compressible": true, "extensions": ["tsv"] },
  "text/troff": { "source": "iana", "extensions": ["t", "tr", "roff", "man", "me", "ms"] },
  "text/turtle": { "source": "iana", "charset": "UTF-8", "extensions": ["ttl"] },
  "text/ulpfec": { "source": "iana" },
  "text/uri-list": { "source": "iana", "compressible": true, "extensions": ["uri", "uris", "urls"] },
  "text/vcard": { "source": "iana", "compressible": true, "extensions": ["vcard"] },
  "text/vnd.a": { "source": "iana" },
  "text/vnd.abc": { "source": "iana" },
  "text/vnd.ascii-art": { "source": "iana" },
  "text/vnd.curl": { "source": "iana", "extensions": ["curl"] },
  "text/vnd.curl.dcurl": { "source": "apache", "extensions": ["dcurl"] },
  "text/vnd.curl.mcurl": { "source": "apache", "extensions": ["mcurl"] },
  "text/vnd.curl.scurl": { "source": "apache", "extensions": ["scurl"] },
  "text/vnd.debian.copyright": { "source": "iana", "charset": "UTF-8" },
  "text/vnd.dmclientscript": { "source": "iana" },
  "text/vnd.dvb.subtitle": { "source": "iana", "extensions": ["sub"] },
  "text/vnd.esmertec.theme-descriptor": { "source": "iana", "charset": "UTF-8" },
  "text/vnd.familysearch.gedcom": { "source": "iana", "extensions": ["ged"] },
  "text/vnd.ficlab.flt": { "source": "iana" },
  "text/vnd.fly": { "source": "iana", "extensions": ["fly"] },
  "text/vnd.fmi.flexstor": { "source": "iana", "extensions": ["flx"] },
  "text/vnd.gml": { "source": "iana" },
  "text/vnd.graphviz": { "source": "iana", "extensions": ["gv"] },
  "text/vnd.hans": { "source": "iana" },
  "text/vnd.hgl": { "source": "iana" },
  "text/vnd.in3d.3dml": { "source": "iana", "extensions": ["3dml"] },
  "text/vnd.in3d.spot": { "source": "iana", "extensions": ["spot"] },
  "text/vnd.iptc.newsml": { "source": "iana" },
  "text/vnd.iptc.nitf": { "source": "iana" },
  "text/vnd.latex-z": { "source": "iana" },
  "text/vnd.motorola.reflex": { "source": "iana" },
  "text/vnd.ms-mediapackage": { "source": "iana" },
  "text/vnd.net2phone.commcenter.command": { "source": "iana" },
  "text/vnd.radisys.msml-basic-layout": { "source": "iana" },
  "text/vnd.senx.warpscript": { "source": "iana" },
  "text/vnd.si.uricatalogue": { "source": "iana" },
  "text/vnd.sosi": { "source": "iana" },
  "text/vnd.sun.j2me.app-descriptor": { "source": "iana", "charset": "UTF-8", "extensions": ["jad"] },
  "text/vnd.trolltech.linguist": { "source": "iana", "charset": "UTF-8" },
  "text/vnd.wap.si": { "source": "iana" },
  "text/vnd.wap.sl": { "source": "iana" },
  "text/vnd.wap.wml": { "source": "iana", "extensions": ["wml"] },
  "text/vnd.wap.wmlscript": { "source": "iana", "extensions": ["wmls"] },
  "text/vtt": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["vtt"] },
  "text/x-asm": { "source": "apache", "extensions": ["s", "asm"] },
  "text/x-c": { "source": "apache", "extensions": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"] },
  "text/x-component": { "source": "nginx", "extensions": ["htc"] },
  "text/x-fortran": { "source": "apache", "extensions": ["f", "for", "f77", "f90"] },
  "text/x-gwt-rpc": { "compressible": true },
  "text/x-handlebars-template": { "extensions": ["hbs"] },
  "text/x-java-source": { "source": "apache", "extensions": ["java"] },
  "text/x-jquery-tmpl": { "compressible": true },
  "text/x-lua": { "extensions": ["lua"] },
  "text/x-markdown": { "compressible": true, "extensions": ["mkd"] },
  "text/x-nfo": { "source": "apache", "extensions": ["nfo"] },
  "text/x-opml": { "source": "apache", "extensions": ["opml"] },
  "text/x-org": { "compressible": true, "extensions": ["org"] },
  "text/x-pascal": { "source": "apache", "extensions": ["p", "pas"] },
  "text/x-processing": { "compressible": true, "extensions": ["pde"] },
  "text/x-sass": { "extensions": ["sass"] },
  "text/x-scss": { "extensions": ["scss"] },
  "text/x-setext": { "source": "apache", "extensions": ["etx"] },
  "text/x-sfv": { "source": "apache", "extensions": ["sfv"] },
  "text/x-suse-ymp": { "compressible": true, "extensions": ["ymp"] },
  "text/x-uuencode": { "source": "apache", "extensions": ["uu"] },
  "text/x-vcalendar": { "source": "apache", "extensions": ["vcs"] },
  "text/x-vcard": { "source": "apache", "extensions": ["vcf"] },
  "text/xml": { "source": "iana", "compressible": true, "extensions": ["xml"] },
  "text/xml-external-parsed-entity": { "source": "iana" },
  "text/yaml": { "compressible": true, "extensions": ["yaml", "yml"] },
  "video/1d-interleaved-parityfec": { "source": "iana" },
  "video/3gpp": { "source": "iana", "extensions": ["3gp", "3gpp"] },
  "video/3gpp-tt": { "source": "iana" },
  "video/3gpp2": { "source": "iana", "extensions": ["3g2"] },
  "video/av1": { "source": "iana" },
  "video/bmpeg": { "source": "iana" },
  "video/bt656": { "source": "iana" },
  "video/celb": { "source": "iana" },
  "video/dv": { "source": "iana" },
  "video/encaprtp": { "source": "iana" },
  "video/ffv1": { "source": "iana" },
  "video/flexfec": { "source": "iana" },
  "video/h261": { "source": "iana", "extensions": ["h261"] },
  "video/h263": { "source": "iana", "extensions": ["h263"] },
  "video/h263-1998": { "source": "iana" },
  "video/h263-2000": { "source": "iana" },
  "video/h264": { "source": "iana", "extensions": ["h264"] },
  "video/h264-rcdo": { "source": "iana" },
  "video/h264-svc": { "source": "iana" },
  "video/h265": { "source": "iana" },
  "video/iso.segment": { "source": "iana", "extensions": ["m4s"] },
  "video/jpeg": { "source": "iana", "extensions": ["jpgv"] },
  "video/jpeg2000": { "source": "iana" },
  "video/jpm": { "source": "apache", "extensions": ["jpm", "jpgm"] },
  "video/jxsv": { "source": "iana" },
  "video/mj2": { "source": "iana", "extensions": ["mj2", "mjp2"] },
  "video/mp1s": { "source": "iana" },
  "video/mp2p": { "source": "iana" },
  "video/mp2t": { "source": "iana", "extensions": ["ts"] },
  "video/mp4": { "source": "iana", "compressible": false, "extensions": ["mp4", "mp4v", "mpg4"] },
  "video/mp4v-es": { "source": "iana" },
  "video/mpeg": { "source": "iana", "compressible": false, "extensions": ["mpeg", "mpg", "mpe", "m1v", "m2v"] },
  "video/mpeg4-generic": { "source": "iana" },
  "video/mpv": { "source": "iana" },
  "video/nv": { "source": "iana" },
  "video/ogg": { "source": "iana", "compressible": false, "extensions": ["ogv"] },
  "video/parityfec": { "source": "iana" },
  "video/pointer": { "source": "iana" },
  "video/quicktime": { "source": "iana", "compressible": false, "extensions": ["qt", "mov"] },
  "video/raptorfec": { "source": "iana" },
  "video/raw": { "source": "iana" },
  "video/rtp-enc-aescm128": { "source": "iana" },
  "video/rtploopback": { "source": "iana" },
  "video/rtx": { "source": "iana" },
  "video/scip": { "source": "iana" },
  "video/smpte291": { "source": "iana" },
  "video/smpte292m": { "source": "iana" },
  "video/ulpfec": { "source": "iana" },
  "video/vc1": { "source": "iana" },
  "video/vc2": { "source": "iana" },
  "video/vnd.cctv": { "source": "iana" },
  "video/vnd.dece.hd": { "source": "iana", "extensions": ["uvh", "uvvh"] },
  "video/vnd.dece.mobile": { "source": "iana", "extensions": ["uvm", "uvvm"] },
  "video/vnd.dece.mp4": { "source": "iana" },
  "video/vnd.dece.pd": { "source": "iana", "extensions": ["uvp", "uvvp"] },
  "video/vnd.dece.sd": { "source": "iana", "extensions": ["uvs", "uvvs"] },
  "video/vnd.dece.video": { "source": "iana", "extensions": ["uvv", "uvvv"] },
  "video/vnd.directv.mpeg": { "source": "iana" },
  "video/vnd.directv.mpeg-tts": { "source": "iana" },
  "video/vnd.dlna.mpeg-tts": { "source": "iana" },
  "video/vnd.dvb.file": { "source": "iana", "extensions": ["dvb"] },
  "video/vnd.fvt": { "source": "iana", "extensions": ["fvt"] },
  "video/vnd.hns.video": { "source": "iana" },
  "video/vnd.iptvforum.1dparityfec-1010": { "source": "iana" },
  "video/vnd.iptvforum.1dparityfec-2005": { "source": "iana" },
  "video/vnd.iptvforum.2dparityfec-1010": { "source": "iana" },
  "video/vnd.iptvforum.2dparityfec-2005": { "source": "iana" },
  "video/vnd.iptvforum.ttsavc": { "source": "iana" },
  "video/vnd.iptvforum.ttsmpeg2": { "source": "iana" },
  "video/vnd.motorola.video": { "source": "iana" },
  "video/vnd.motorola.videop": { "source": "iana" },
  "video/vnd.mpegurl": { "source": "iana", "extensions": ["mxu", "m4u"] },
  "video/vnd.ms-playready.media.pyv": { "source": "iana", "extensions": ["pyv"] },
  "video/vnd.nokia.interleaved-multimedia": { "source": "iana" },
  "video/vnd.nokia.mp4vr": { "source": "iana" },
  "video/vnd.nokia.videovoip": { "source": "iana" },
  "video/vnd.objectvideo": { "source": "iana" },
  "video/vnd.radgamettools.bink": { "source": "iana" },
  "video/vnd.radgamettools.smacker": { "source": "iana" },
  "video/vnd.sealed.mpeg1": { "source": "iana" },
  "video/vnd.sealed.mpeg4": { "source": "iana" },
  "video/vnd.sealed.swf": { "source": "iana" },
  "video/vnd.sealedmedia.softseal.mov": { "source": "iana" },
  "video/vnd.uvvu.mp4": { "source": "iana", "extensions": ["uvu", "uvvu"] },
  "video/vnd.vivo": { "source": "iana", "extensions": ["viv"] },
  "video/vnd.youtube.yt": { "source": "iana" },
  "video/vp8": { "source": "iana" },
  "video/vp9": { "source": "iana" },
  "video/webm": { "source": "apache", "compressible": false, "extensions": ["webm"] },
  "video/x-f4v": { "source": "apache", "extensions": ["f4v"] },
  "video/x-fli": { "source": "apache", "extensions": ["fli"] },
  "video/x-flv": { "source": "apache", "compressible": false, "extensions": ["flv"] },
  "video/x-m4v": { "source": "apache", "extensions": ["m4v"] },
  "video/x-matroska": { "source": "apache", "compressible": false, "extensions": ["mkv", "mk3d", "mks"] },
  "video/x-mng": { "source": "apache", "extensions": ["mng"] },
  "video/x-ms-asf": { "source": "apache", "extensions": ["asf", "asx"] },
  "video/x-ms-vob": { "source": "apache", "extensions": ["vob"] },
  "video/x-ms-wm": { "source": "apache", "extensions": ["wm"] },
  "video/x-ms-wmv": { "source": "apache", "compressible": false, "extensions": ["wmv"] },
  "video/x-ms-wmx": { "source": "apache", "extensions": ["wmx"] },
  "video/x-ms-wvx": { "source": "apache", "extensions": ["wvx"] },
  "video/x-msvideo": { "source": "apache", "extensions": ["avi"] },
  "video/x-sgi-movie": { "source": "apache", "extensions": ["movie"] },
  "video/x-smv": { "source": "apache", "extensions": ["smv"] },
  "x-conference/x-cooltalk": { "source": "apache", "extensions": ["ice"] },
  "x-shader/x-fragment": { "compressible": true },
  "x-shader/x-vertex": { "compressible": true }
};
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */
var mimeDb;
var hasRequiredMimeDb;
function requireMimeDb() {
  if (hasRequiredMimeDb) return mimeDb;
  hasRequiredMimeDb = 1;
  mimeDb = require$$0;
  return mimeDb;
}
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var hasRequiredMimeTypes;
function requireMimeTypes() {
  if (hasRequiredMimeTypes) return mimeTypes;
  hasRequiredMimeTypes = 1;
  (function(exports) {
    var db = requireMimeDb();
    var extname = require$$1.extname;
    var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
    var TEXT_TYPE_REGEXP = /^text\//i;
    exports.charset = charset;
    exports.charsets = { lookup: charset };
    exports.contentType = contentType;
    exports.extension = extension;
    exports.extensions = /* @__PURE__ */ Object.create(null);
    exports.lookup = lookup;
    exports.types = /* @__PURE__ */ Object.create(null);
    populateMaps(exports.extensions, exports.types);
    function charset(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var mime2 = match && db[match[1].toLowerCase()];
      if (mime2 && mime2.charset) {
        return mime2.charset;
      }
      if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return "UTF-8";
      }
      return false;
    }
    function contentType(str) {
      if (!str || typeof str !== "string") {
        return false;
      }
      var mime2 = str.indexOf("/") === -1 ? exports.lookup(str) : str;
      if (!mime2) {
        return false;
      }
      if (mime2.indexOf("charset") === -1) {
        var charset2 = exports.charset(mime2);
        if (charset2) mime2 += "; charset=" + charset2.toLowerCase();
      }
      return mime2;
    }
    function extension(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var exts = match && exports.extensions[match[1].toLowerCase()];
      if (!exts || !exts.length) {
        return false;
      }
      return exts[0];
    }
    function lookup(path) {
      if (!path || typeof path !== "string") {
        return false;
      }
      var extension2 = extname("x." + path).toLowerCase().substr(1);
      if (!extension2) {
        return false;
      }
      return exports.types[extension2] || false;
    }
    function populateMaps(extensions, types) {
      var preference = ["nginx", "apache", void 0, "iana"];
      Object.keys(db).forEach(function forEachMimeType(type) {
        var mime2 = db[type];
        var exts = mime2.extensions;
        if (!exts || !exts.length) {
          return;
        }
        extensions[type] = exts;
        for (var i = 0; i < exts.length; i++) {
          var extension2 = exts[i];
          if (types[extension2]) {
            var from = preference.indexOf(db[types[extension2]].source);
            var to = preference.indexOf(mime2.source);
            if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
              continue;
            }
          }
          types[extension2] = type;
        }
      });
    }
  })(mimeTypes);
  return mimeTypes;
}
var mimeTypesExports = requireMimeTypes();
const mime = /* @__PURE__ */ getDefaultExportFromCjs(mimeTypesExports);
function registerFileHandlers() {
  require$$0$1.ipcMain.handle("select-audio-file", async () => {
    const result = await require$$0$1.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Audio Files", extensions: ["mp3", "wav", "ogg", "flac", "m4a", "aac"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });
  require$$0$1.ipcMain.handle("select-video-file", async () => {
    const result = await require$$0$1.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Video Files", extensions: ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });
  require$$0$1.ipcMain.handle("select-directory", async () => {
    const result = await require$$0$1.dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });
  require$$0$1.ipcMain.handle("select-vst3-plugin", async () => {
    const result = await require$$0$1.dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [
        { name: "VST3 Plugins", extensions: ["vst3"] },
        { name: "All Files", extensions: ["*"] }
      ],
      title: "Select VST3 Plugin Files"
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths;
    }
    return [];
  });
  require$$0$1.ipcMain.handle("save-directory-tree", async (event, directoryPath, treeData) => {
    try {
      const appDataPath = require$$1.join(os.homedir(), ".guitarapp");
      await fs.ensureDir(appDataPath);
      const treeFilePath = require$$1.join(appDataPath, "directory-tree.json");
      const dataToSave = {
        directoryPath,
        lastScanned: (/* @__PURE__ */ new Date()).toISOString(),
        tree: treeData
      };
      await fs.writeJson(treeFilePath, dataToSave, { spaces: 2 });
      return { success: true, filePath: treeFilePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  require$$0$1.ipcMain.handle("load-directory-tree", async () => {
    try {
      const appDataPath = require$$1.join(os.homedir(), ".guitarapp");
      const treeFilePath = require$$1.join(appDataPath, "directory-tree.json");
      if (await fs.pathExists(treeFilePath)) {
        const data = await fs.readJson(treeFilePath);
        if (await fs.pathExists(data.directoryPath)) {
          return { success: true, data };
        } else {
          await fs.remove(treeFilePath);
          return { success: false, error: "Saved directory no longer exists" };
        }
      }
      return { success: false, error: "No saved directory tree found" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  require$$0$1.ipcMain.on("parse-directory", (event, directoryPath) => {
  });
  console.log("✅ File handlers registered");
}
function registerVideoHandlers() {
  require$$0$1.ipcMain.handle("load-video-file", async (event, filePath) => {
    try {
      console.log("🎬 IPC: Validating video file:", filePath);
      if (!await fs.pathExists(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      const ext = require$$1.extname(filePath).toLowerCase();
      const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"];
      if (!videoExtensions.includes(ext)) {
        throw new Error(`Unsupported video format: ${ext}`);
      }
      const encodedPath = Buffer.from(filePath, "utf-8").toString("hex");
      console.log("✅ IPC: Returning video URL for path:", filePath);
      return {
        success: true,
        url: `video-stream://${encodedPath}`,
        fileName: require$$1.basename(filePath)
      };
    } catch (error) {
      console.error("❌ IPC: Failed to validate video file:", error);
      return {
        success: false,
        error: error.message
      };
    }
  });
  require$$0$1.ipcMain.handle("scan-video-directory", async (event, directoryPath) => {
    try {
      const allVideos = [];
      const scanDirectory = async (dirPath) => {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
          const fullPath = require$$1.join(dirPath, item.name);
          if (item.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (item.isFile()) {
            const ext = require$$1.extname(item.name).toLowerCase();
            const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"];
            if (videoExtensions.includes(ext)) {
              const stats = await fs.stat(fullPath);
              allVideos.push({
                name: item.name,
                path: fullPath,
                isDirectory: false,
                size: stats.size,
                lastModified: stats.mtime
              });
            }
          }
        }
      };
      await scanDirectory(directoryPath);
      console.log(`Found ${allVideos.length} video files in ${directoryPath}`);
      return { success: true, videos: allVideos };
    } catch (error) {
      console.error("Failed to scan directory:", error);
      return { success: false, error: error.message };
    }
  });
  console.log("✅ Video handlers registered");
}
function registerAllIPCHandlers() {
  console.log("🔧 Registering all IPC handlers...");
  registerFileHandlers();
  registerVideoHandlers();
  console.log("✅ All IPC handlers registered successfully");
}
const isDevelopment = process.env.NODE_ENV !== "production" && !require$$0$1.app.isPackaged;
require$$0$1.app.commandLine.appendSwitch("disable-crash-reporter");
require$$0$1.app.commandLine.appendSwitch("disable-crashpad");
try {
  require$$0$1.crashReporter.start({
    productName: "NeckWanker",
    companyName: "Guitar App",
    submitURL: "",
    uploadToServer: false,
    collectParameters: false,
    crashesDirectory: "",
    extra: {}
  });
} catch (error) {
}
const __filename$1 = url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("background.js", document.baseURI).href);
const __dirname$1 = require$$1.dirname(__filename$1);
require$$0$1.protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
  {
    scheme: "video-stream",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true
    }
  }
]);
let isQuitting = false;
require$$0$1.app.setName("GuitarApp");
async function createWindow() {
  const win = new require$$0$1.BrowserWindow({
    width: 1600,
    height: 1200,
    backgroundColor: "#000000",
    icon: require$$1.join(__dirname$1, "../public/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: isDevelopment ? require$$1.join(__dirname$1, "../public/preload.js") : require$$1.join(__dirname$1, "./preload.js"),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      backgroundThrottling: false,
      sandbox: false,
      partition: "persist:guitarapp"
    }
  });
  win.maximize();
  win.setMenu(null);
  const session = win.webContents.session;
  session.setPermissionRequestHandler(() => true);
  console.log("📁 localStorage will persist in:", require$$0$1.app.getPath("userData"));
  session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === "fullscreen") {
      callback(true);
      return;
    }
    callback(true);
  });
  session.protocol.handle("video-stream", async (request) => {
    const schemePrefixLength = "video-stream://".length;
    const urlPath = request.url.slice(schemePrefixLength).replace(/\/$/, "");
    try {
      let decodedPath = Buffer.from(urlPath, "hex").toString("utf-8");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🟢 SESSION HANDLER CALLED");
      console.log("📝 Decoded Path:", decodedPath);
      if (!fs.existsSync(decodedPath)) {
        console.error("❌ FILE DOES NOT EXIST:", decodedPath);
        return new Response("File not found", { status: 404 });
      }
      const stat = fs.statSync(decodedPath);
      const fileSize = stat.size;
      const mimeType = mime.lookup(decodedPath) || "video/mp4";
      const range = request.headers.get("range");
      if (range) {
        console.log("📝 Range request:", range);
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        console.log(`📝 Serving bytes ${start}-${end} of ${fileSize}`);
        const fileStream2 = fs.createReadStream(decodedPath, { start, end });
        return new Response(require$$0$2.Readable.toWeb(fileStream2), {
          status: 206,
          // Partial Content
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize.toString(),
            "Content-Type": mimeType
          }
        });
      }
      console.log("📝 Serving full file, size:", fileSize);
      const fileStream = fs.createReadStream(decodedPath);
      return new Response(require$$0$2.Readable.toWeb(fileStream), {
        status: 200,
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": mimeType,
          "Accept-Ranges": "bytes"
          // Tell browser seeking is supported
        }
      });
    } catch (err) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ SESSION PROTOCOL FAILED");
      console.error("❌ Error:", err);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return new Response("Internal server error", { status: 500 });
    }
  });
  if (isDevelopment) {
    try {
      await win.loadURL("http://localhost:8080");
    } catch (error) {
      console.error("Failed to load development URL:", error);
      const indexPath = require$$1.join(__dirname$1, "../dist/index.html");
      await win.loadFile(indexPath);
    }
  } else {
    const indexPath = require$$1.join(__dirname$1, "../dist/index.html");
    await win.loadFile(indexPath);
  }
  if (isDevelopment) {
    try {
      win.webContents.openDevTools();
      win.webContents.on("devtools-opened", () => {
        win.webContents.devToolsWebContents?.executeJavaScript(
          `
            // Disable autofill in DevTools to prevent console errors
            if (window.DevToolsAPI && window.DevToolsAPI.dispatchMessage) {
              const originalDispatch = window.DevToolsAPI.dispatchMessage;
              window.DevToolsAPI.dispatchMessage = function(message) {
                if (message && message.includes('Autofill.enable')) {
                  return;
                }
                return originalDispatch.call(this, message);
              };
            }
          `
        ).catch(() => {
        });
      });
    } catch (e) {
      console.log("pas cool");
    }
  }
  win.on("close", async (event) => {
    if (!isQuitting) {
      event.preventDefault();
      isQuitting = true;
      console.log("📦 Window closing - requesting data save...");
      win.webContents.send("app-before-quit");
      setTimeout(() => {
        console.log("🚪 Closing application...");
        win.destroy();
        require$$0$1.app.quit();
      }, 500);
    }
  });
  return win;
}
registerAllIPCHandlers();
require$$0$1.ipcMain.handle("app-save-complete", async () => {
  console.log("📥 Save-complete signal from renderer");
  return { success: true };
});
require$$0$1.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$0$1.app.quit();
  }
});
require$$0$1.app.on("activate", () => {
  if (require$$0$1.BrowserWindow.getAllWindows().length === 0) createWindow();
});
require$$0$1.app.whenReady().then(async () => {
  console.log("🚀 App starting...");
  console.log("📁 User data directory:", require$$0$1.app.getPath("userData"));
  console.log("📁 App data directory:", require$$0$1.app.getPath("appData"));
  console.log("💾 localStorage will be stored in the user data directory");
  require$$0$1.protocol.interceptFileProtocol("file", (request, callback) => {
    try {
      const filePath = url.fileURLToPath(request.url);
      callback({ path: filePath });
    } catch (err) {
      console.error("Failed to resolve file URL for protocol handler:", request.url, err);
      callback({ error: -6 });
    }
  });
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      const session = require("electron").session.defaultSession;
      await installExtension(distExports.VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true
        },
        forceDownload: false
      });
      console.log(`Vue Devtools installed successfully`);
    } catch (e) {
      if (e && e.message && e.message.includes("already exists")) {
        console.log("Vue Devtools already installed");
      } else {
        console.log("Vue Devtools installation skipped (non-critical)");
      }
    }
  }
  createWindow();
});
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        require$$0$1.app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      require$$0$1.app.quit();
    });
  }
}
