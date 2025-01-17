"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/blakejs/util.js
var require_util = __commonJS({
  "../../node_modules/blakejs/util.js"(exports2, module2) {
    "use strict";
    var ERROR_MSG_INPUT = "Input must be an string, Buffer or Uint8Array";
    function normalizeInput(input) {
      let ret;
      if (input instanceof Uint8Array) {
        ret = input;
      } else if (typeof input === "string") {
        const encoder = new TextEncoder();
        ret = encoder.encode(input);
      } else {
        throw new Error(ERROR_MSG_INPUT);
      }
      return ret;
    }
    function toHex(bytes) {
      return Array.prototype.map.call(bytes, function(n) {
        return (n < 16 ? "0" : "") + n.toString(16);
      }).join("");
    }
    function uint32ToHex(val) {
      return (4294967296 + val).toString(16).substring(1);
    }
    function debugPrint(label, arr, size) {
      let msg = "\n" + label + " = ";
      for (let i = 0; i < arr.length; i += 2) {
        if (size === 32) {
          msg += uint32ToHex(arr[i]).toUpperCase();
          msg += " ";
          msg += uint32ToHex(arr[i + 1]).toUpperCase();
        } else if (size === 64) {
          msg += uint32ToHex(arr[i + 1]).toUpperCase();
          msg += uint32ToHex(arr[i]).toUpperCase();
        } else throw new Error("Invalid size " + size);
        if (i % 6 === 4) {
          msg += "\n" + new Array(label.length + 4).join(" ");
        } else if (i < arr.length - 2) {
          msg += " ";
        }
      }
      console.log(msg);
    }
    function testSpeed(hashFn, N, M) {
      let startMs = (/* @__PURE__ */ new Date()).getTime();
      const input = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        input[i] = i % 256;
      }
      const genMs = (/* @__PURE__ */ new Date()).getTime();
      console.log("Generated random input in " + (genMs - startMs) + "ms");
      startMs = genMs;
      for (let i = 0; i < M; i++) {
        const hashHex = hashFn(input);
        const hashMs = (/* @__PURE__ */ new Date()).getTime();
        const ms = hashMs - startMs;
        startMs = hashMs;
        console.log("Hashed in " + ms + "ms: " + hashHex.substring(0, 20) + "...");
        console.log(
          Math.round(N / (1 << 20) / (ms / 1e3) * 100) / 100 + " MB PER SECOND"
        );
      }
    }
    module2.exports = {
      normalizeInput,
      toHex,
      debugPrint,
      testSpeed
    };
  }
});

// ../../node_modules/blakejs/blake2b.js
var require_blake2b = __commonJS({
  "../../node_modules/blakejs/blake2b.js"(exports2, module2) {
    "use strict";
    var util = require_util();
    function ADD64AA(v2, a, b) {
      const o0 = v2[a] + v2[b];
      let o1 = v2[a + 1] + v2[b + 1];
      if (o0 >= 4294967296) {
        o1++;
      }
      v2[a] = o0;
      v2[a + 1] = o1;
    }
    function ADD64AC(v2, a, b0, b1) {
      let o0 = v2[a] + b0;
      if (b0 < 0) {
        o0 += 4294967296;
      }
      let o1 = v2[a + 1] + b1;
      if (o0 >= 4294967296) {
        o1++;
      }
      v2[a] = o0;
      v2[a + 1] = o1;
    }
    function B2B_GET32(arr, i) {
      return arr[i] ^ arr[i + 1] << 8 ^ arr[i + 2] << 16 ^ arr[i + 3] << 24;
    }
    function B2B_G(a, b, c, d, ix, iy) {
      const x0 = m[ix];
      const x1 = m[ix + 1];
      const y0 = m[iy];
      const y1 = m[iy + 1];
      ADD64AA(v, a, b);
      ADD64AC(v, a, x0, x1);
      let xor0 = v[d] ^ v[a];
      let xor1 = v[d + 1] ^ v[a + 1];
      v[d] = xor1;
      v[d + 1] = xor0;
      ADD64AA(v, c, d);
      xor0 = v[b] ^ v[c];
      xor1 = v[b + 1] ^ v[c + 1];
      v[b] = xor0 >>> 24 ^ xor1 << 8;
      v[b + 1] = xor1 >>> 24 ^ xor0 << 8;
      ADD64AA(v, a, b);
      ADD64AC(v, a, y0, y1);
      xor0 = v[d] ^ v[a];
      xor1 = v[d + 1] ^ v[a + 1];
      v[d] = xor0 >>> 16 ^ xor1 << 16;
      v[d + 1] = xor1 >>> 16 ^ xor0 << 16;
      ADD64AA(v, c, d);
      xor0 = v[b] ^ v[c];
      xor1 = v[b + 1] ^ v[c + 1];
      v[b] = xor1 >>> 31 ^ xor0 << 1;
      v[b + 1] = xor0 >>> 31 ^ xor1 << 1;
    }
    var BLAKE2B_IV32 = new Uint32Array([
      4089235720,
      1779033703,
      2227873595,
      3144134277,
      4271175723,
      1013904242,
      1595750129,
      2773480762,
      2917565137,
      1359893119,
      725511199,
      2600822924,
      4215389547,
      528734635,
      327033209,
      1541459225
    ]);
    var SIGMA8 = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3,
      11,
      8,
      12,
      0,
      5,
      2,
      15,
      13,
      10,
      14,
      3,
      6,
      7,
      1,
      9,
      4,
      7,
      9,
      3,
      1,
      13,
      12,
      11,
      14,
      2,
      6,
      5,
      10,
      4,
      0,
      15,
      8,
      9,
      0,
      5,
      7,
      2,
      4,
      10,
      15,
      14,
      1,
      11,
      12,
      6,
      8,
      3,
      13,
      2,
      12,
      6,
      10,
      0,
      11,
      8,
      3,
      4,
      13,
      7,
      5,
      15,
      14,
      1,
      9,
      12,
      5,
      1,
      15,
      14,
      13,
      4,
      10,
      0,
      7,
      6,
      3,
      9,
      2,
      8,
      11,
      13,
      11,
      7,
      14,
      12,
      1,
      3,
      9,
      5,
      0,
      15,
      4,
      8,
      6,
      2,
      10,
      6,
      15,
      14,
      9,
      11,
      3,
      0,
      8,
      12,
      2,
      13,
      7,
      1,
      4,
      10,
      5,
      10,
      2,
      8,
      4,
      7,
      6,
      1,
      5,
      15,
      11,
      9,
      14,
      3,
      12,
      13,
      0,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3
    ];
    var SIGMA82 = new Uint8Array(
      SIGMA8.map(function(x) {
        return x * 2;
      })
    );
    var v = new Uint32Array(32);
    var m = new Uint32Array(32);
    function blake2bCompress(ctx, last) {
      let i = 0;
      for (i = 0; i < 16; i++) {
        v[i] = ctx.h[i];
        v[i + 16] = BLAKE2B_IV32[i];
      }
      v[24] = v[24] ^ ctx.t;
      v[25] = v[25] ^ ctx.t / 4294967296;
      if (last) {
        v[28] = ~v[28];
        v[29] = ~v[29];
      }
      for (i = 0; i < 32; i++) {
        m[i] = B2B_GET32(ctx.b, 4 * i);
      }
      for (i = 0; i < 12; i++) {
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
      }
      for (i = 0; i < 16; i++) {
        ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
      }
    }
    var parameterBlock = new Uint8Array([
      0,
      0,
      0,
      0,
      //  0: outlen, keylen, fanout, depth
      0,
      0,
      0,
      0,
      //  4: leaf length, sequential mode
      0,
      0,
      0,
      0,
      //  8: node offset
      0,
      0,
      0,
      0,
      // 12: node offset
      0,
      0,
      0,
      0,
      // 16: node depth, inner length, rfu
      0,
      0,
      0,
      0,
      // 20: rfu
      0,
      0,
      0,
      0,
      // 24: rfu
      0,
      0,
      0,
      0,
      // 28: rfu
      0,
      0,
      0,
      0,
      // 32: salt
      0,
      0,
      0,
      0,
      // 36: salt
      0,
      0,
      0,
      0,
      // 40: salt
      0,
      0,
      0,
      0,
      // 44: salt
      0,
      0,
      0,
      0,
      // 48: personal
      0,
      0,
      0,
      0,
      // 52: personal
      0,
      0,
      0,
      0,
      // 56: personal
      0,
      0,
      0,
      0
      // 60: personal
    ]);
    function blake2bInit(outlen, key, salt, personal) {
      if (outlen === 0 || outlen > 64) {
        throw new Error("Illegal output length, expected 0 < length <= 64");
      }
      if (key && key.length > 64) {
        throw new Error("Illegal key, expected Uint8Array with 0 < length <= 64");
      }
      if (salt && salt.length !== 16) {
        throw new Error("Illegal salt, expected Uint8Array with length is 16");
      }
      if (personal && personal.length !== 16) {
        throw new Error("Illegal personal, expected Uint8Array with length is 16");
      }
      const ctx = {
        b: new Uint8Array(128),
        h: new Uint32Array(16),
        t: 0,
        // input count
        c: 0,
        // pointer within buffer
        outlen
        // output length in bytes
      };
      parameterBlock.fill(0);
      parameterBlock[0] = outlen;
      if (key) parameterBlock[1] = key.length;
      parameterBlock[2] = 1;
      parameterBlock[3] = 1;
      if (salt) parameterBlock.set(salt, 32);
      if (personal) parameterBlock.set(personal, 48);
      for (let i = 0; i < 16; i++) {
        ctx.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(parameterBlock, i * 4);
      }
      if (key) {
        blake2bUpdate(ctx, key);
        ctx.c = 128;
      }
      return ctx;
    }
    function blake2bUpdate(ctx, input) {
      for (let i = 0; i < input.length; i++) {
        if (ctx.c === 128) {
          ctx.t += ctx.c;
          blake2bCompress(ctx, false);
          ctx.c = 0;
        }
        ctx.b[ctx.c++] = input[i];
      }
    }
    function blake2bFinal(ctx) {
      ctx.t += ctx.c;
      while (ctx.c < 128) {
        ctx.b[ctx.c++] = 0;
      }
      blake2bCompress(ctx, true);
      const out = new Uint8Array(ctx.outlen);
      for (let i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> 8 * (i & 3);
      }
      return out;
    }
    function blake2b5(input, key, outlen, salt, personal) {
      outlen = outlen || 64;
      input = util.normalizeInput(input);
      if (salt) {
        salt = util.normalizeInput(salt);
      }
      if (personal) {
        personal = util.normalizeInput(personal);
      }
      const ctx = blake2bInit(outlen, key, salt, personal);
      blake2bUpdate(ctx, input);
      return blake2bFinal(ctx);
    }
    function blake2bHex(input, key, outlen, salt, personal) {
      const output = blake2b5(input, key, outlen, salt, personal);
      return util.toHex(output);
    }
    module2.exports = {
      blake2b: blake2b5,
      blake2bHex,
      blake2bInit,
      blake2bUpdate,
      blake2bFinal
    };
  }
});

// ../../node_modules/blakejs/blake2s.js
var require_blake2s = __commonJS({
  "../../node_modules/blakejs/blake2s.js"(exports2, module2) {
    "use strict";
    var util = require_util();
    function B2S_GET32(v2, i) {
      return v2[i] ^ v2[i + 1] << 8 ^ v2[i + 2] << 16 ^ v2[i + 3] << 24;
    }
    function B2S_G(a, b, c, d, x, y) {
      v[a] = v[a] + v[b] + x;
      v[d] = ROTR32(v[d] ^ v[a], 16);
      v[c] = v[c] + v[d];
      v[b] = ROTR32(v[b] ^ v[c], 12);
      v[a] = v[a] + v[b] + y;
      v[d] = ROTR32(v[d] ^ v[a], 8);
      v[c] = v[c] + v[d];
      v[b] = ROTR32(v[b] ^ v[c], 7);
    }
    function ROTR32(x, y) {
      return x >>> y ^ x << 32 - y;
    }
    var BLAKE2S_IV = new Uint32Array([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    var SIGMA = new Uint8Array([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3,
      11,
      8,
      12,
      0,
      5,
      2,
      15,
      13,
      10,
      14,
      3,
      6,
      7,
      1,
      9,
      4,
      7,
      9,
      3,
      1,
      13,
      12,
      11,
      14,
      2,
      6,
      5,
      10,
      4,
      0,
      15,
      8,
      9,
      0,
      5,
      7,
      2,
      4,
      10,
      15,
      14,
      1,
      11,
      12,
      6,
      8,
      3,
      13,
      2,
      12,
      6,
      10,
      0,
      11,
      8,
      3,
      4,
      13,
      7,
      5,
      15,
      14,
      1,
      9,
      12,
      5,
      1,
      15,
      14,
      13,
      4,
      10,
      0,
      7,
      6,
      3,
      9,
      2,
      8,
      11,
      13,
      11,
      7,
      14,
      12,
      1,
      3,
      9,
      5,
      0,
      15,
      4,
      8,
      6,
      2,
      10,
      6,
      15,
      14,
      9,
      11,
      3,
      0,
      8,
      12,
      2,
      13,
      7,
      1,
      4,
      10,
      5,
      10,
      2,
      8,
      4,
      7,
      6,
      1,
      5,
      15,
      11,
      9,
      14,
      3,
      12,
      13,
      0
    ]);
    var v = new Uint32Array(16);
    var m = new Uint32Array(16);
    function blake2sCompress(ctx, last) {
      let i = 0;
      for (i = 0; i < 8; i++) {
        v[i] = ctx.h[i];
        v[i + 8] = BLAKE2S_IV[i];
      }
      v[12] ^= ctx.t;
      v[13] ^= ctx.t / 4294967296;
      if (last) {
        v[14] = ~v[14];
      }
      for (i = 0; i < 16; i++) {
        m[i] = B2S_GET32(ctx.b, 4 * i);
      }
      for (i = 0; i < 10; i++) {
        B2S_G(0, 4, 8, 12, m[SIGMA[i * 16 + 0]], m[SIGMA[i * 16 + 1]]);
        B2S_G(1, 5, 9, 13, m[SIGMA[i * 16 + 2]], m[SIGMA[i * 16 + 3]]);
        B2S_G(2, 6, 10, 14, m[SIGMA[i * 16 + 4]], m[SIGMA[i * 16 + 5]]);
        B2S_G(3, 7, 11, 15, m[SIGMA[i * 16 + 6]], m[SIGMA[i * 16 + 7]]);
        B2S_G(0, 5, 10, 15, m[SIGMA[i * 16 + 8]], m[SIGMA[i * 16 + 9]]);
        B2S_G(1, 6, 11, 12, m[SIGMA[i * 16 + 10]], m[SIGMA[i * 16 + 11]]);
        B2S_G(2, 7, 8, 13, m[SIGMA[i * 16 + 12]], m[SIGMA[i * 16 + 13]]);
        B2S_G(3, 4, 9, 14, m[SIGMA[i * 16 + 14]], m[SIGMA[i * 16 + 15]]);
      }
      for (i = 0; i < 8; i++) {
        ctx.h[i] ^= v[i] ^ v[i + 8];
      }
    }
    function blake2sInit(outlen, key) {
      if (!(outlen > 0 && outlen <= 32)) {
        throw new Error("Incorrect output length, should be in [1, 32]");
      }
      const keylen = key ? key.length : 0;
      if (key && !(keylen > 0 && keylen <= 32)) {
        throw new Error("Incorrect key length, should be in [1, 32]");
      }
      const ctx = {
        h: new Uint32Array(BLAKE2S_IV),
        // hash state
        b: new Uint8Array(64),
        // input block
        c: 0,
        // pointer within block
        t: 0,
        // input count
        outlen
        // output length in bytes
      };
      ctx.h[0] ^= 16842752 ^ keylen << 8 ^ outlen;
      if (keylen > 0) {
        blake2sUpdate(ctx, key);
        ctx.c = 64;
      }
      return ctx;
    }
    function blake2sUpdate(ctx, input) {
      for (let i = 0; i < input.length; i++) {
        if (ctx.c === 64) {
          ctx.t += ctx.c;
          blake2sCompress(ctx, false);
          ctx.c = 0;
        }
        ctx.b[ctx.c++] = input[i];
      }
    }
    function blake2sFinal(ctx) {
      ctx.t += ctx.c;
      while (ctx.c < 64) {
        ctx.b[ctx.c++] = 0;
      }
      blake2sCompress(ctx, true);
      const out = new Uint8Array(ctx.outlen);
      for (let i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> 8 * (i & 3) & 255;
      }
      return out;
    }
    function blake2s(input, key, outlen) {
      outlen = outlen || 32;
      input = util.normalizeInput(input);
      const ctx = blake2sInit(outlen, key);
      blake2sUpdate(ctx, input);
      return blake2sFinal(ctx);
    }
    function blake2sHex(input, key, outlen) {
      const output = blake2s(input, key, outlen);
      return util.toHex(output);
    }
    module2.exports = {
      blake2s,
      blake2sHex,
      blake2sInit,
      blake2sUpdate,
      blake2sFinal
    };
  }
});

// ../../node_modules/blakejs/index.js
var require_blakejs = __commonJS({
  "../../node_modules/blakejs/index.js"(exports2, module2) {
    "use strict";
    var b2b = require_blake2b();
    var b2s = require_blake2s();
    module2.exports = {
      blake2b: b2b.blake2b,
      blake2bHex: b2b.blake2bHex,
      blake2bInit: b2b.blake2bInit,
      blake2bUpdate: b2b.blake2bUpdate,
      blake2bFinal: b2b.blake2bFinal,
      blake2s: b2s.blake2s,
      blake2sHex: b2s.blake2sHex,
      blake2sInit: b2s.blake2sInit,
      blake2sUpdate: b2s.blake2sUpdate,
      blake2sFinal: b2s.blake2sFinal
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Address: () => Address,
  AddressType: () => AddressType,
  AssetFingerprint: () => AssetFingerprint,
  AssetId: () => AssetId,
  AssetName: () => AssetName,
  BaseAddress: () => BaseAddress,
  Bip32PrivateKey: () => Bip32PrivateKey2,
  Bip32PrivateKeyHex: () => Bip32PrivateKeyHex2,
  Cardano: () => import_core7.Cardano,
  CardanoSDK: () => CardanoSDK,
  CardanoSDKSerializer: () => CardanoSDKSerializer,
  CardanoSDKUtil: () => CardanoSDKUtil,
  CborSet: () => CborSet,
  CborWriter: () => CborWriter,
  Certificate: () => Certificate,
  CertificateType: () => CertificateType,
  ConstrPlutusData: () => ConstrPlutusData,
  CoseSign1: () => CoseSign1,
  CostModel: () => CostModel,
  Costmdls: () => Costmdls,
  Credential: () => Credential,
  CredentialType: () => CredentialType,
  Crypto: () => Crypto3,
  DRep: () => DRep,
  DRepID: () => DRepID,
  Datum: () => Datum,
  DatumHash: () => DatumHash,
  DatumKind: () => DatumKind,
  Ed25519KeyHash: () => Ed25519KeyHash2,
  Ed25519KeyHashHex: () => Ed25519KeyHashHex2,
  Ed25519PrivateExtendedKeyHex: () => Ed25519PrivateExtendedKeyHex,
  Ed25519PrivateNormalKeyHex: () => Ed25519PrivateNormalKeyHex,
  Ed25519PublicKey: () => Ed25519PublicKey2,
  Ed25519PublicKeyHex: () => Ed25519PublicKeyHex2,
  Ed25519Signature: () => Ed25519Signature2,
  Ed25519SignatureHex: () => Ed25519SignatureHex2,
  EnterpriseAddress: () => EnterpriseAddress,
  ExUnits: () => ExUnits,
  Hash: () => Hash,
  Hash28ByteBase16: () => Hash28ByteBase162,
  Hash32ByteBase16: () => Hash32ByteBase162,
  NativeScript: () => NativeScript,
  NetworkId: () => NetworkId,
  PaymentAddress: () => PaymentAddress,
  PlutusData: () => PlutusData,
  PlutusLanguageVersion: () => PlutusLanguageVersion,
  PlutusList: () => PlutusList,
  PlutusMap: () => PlutusMap,
  PlutusV1Script: () => PlutusV1Script,
  PlutusV2Script: () => PlutusV2Script,
  PlutusV3Script: () => PlutusV3Script,
  PolicyId: () => PolicyId,
  PoolId: () => PoolId,
  Redeemer: () => Redeemer,
  RedeemerPurpose: () => RedeemerPurpose,
  RedeemerTag: () => RedeemerTag,
  Redeemers: () => Redeemers,
  RequireAllOf: () => RequireAllOf,
  RequireAnyOf: () => RequireAnyOf,
  RequireNOf: () => RequireNOf,
  RequireSignature: () => RequireSignature,
  RequireTimeAfter: () => RequireTimeAfter,
  RequireTimeBefore: () => RequireTimeBefore,
  RewardAccount: () => RewardAccount,
  RewardAddress: () => RewardAddress,
  Script: () => Script,
  ScriptHash: () => ScriptHash,
  ScriptPubkey: () => ScriptPubkey,
  Serialization: () => import_core7.Serialization,
  Slot: () => Slot,
  StakeCredentialStatus: () => StakeCredentialStatus,
  StakeDelegation: () => StakeDelegation,
  StakeRegistration: () => StakeRegistration,
  StricaBip32PrivateKey: () => StricaBip32PrivateKey,
  StricaBip32PrivateKeyType: () => StricaBip32PrivateKey,
  StricaBip32PublicKey: () => StricaBip32PublicKey,
  StricaBip32PublicKeyType: () => StricaBip32PublicKey,
  StricaDecoder: () => StricaDecoder,
  StricaEncoder: () => StricaEncoder,
  StricaPrivateKey: () => StricaPrivateKey,
  StricaPrivateKeyType: () => StricaPrivateKey,
  StricaPublicKey: () => StricaPublicKey,
  StricaPublicKeyType: () => StricaPublicKey,
  Transaction: () => Transaction,
  TransactionBody: () => TransactionBody,
  TransactionId: () => TransactionId,
  TransactionInput: () => TransactionInput,
  TransactionOutput: () => TransactionOutput,
  TransactionUnspentOutput: () => TransactionUnspentOutput,
  TransactionWitnessSet: () => TransactionWitnessSet,
  Value: () => Value,
  VkeyWitness: () => VkeyWitness,
  VrfVkBech32: () => VrfVkBech32,
  addressToBech32: () => addressToBech32,
  assetTypes: () => assetTypes,
  buildBaseAddress: () => buildBaseAddress,
  buildBip32PrivateKey: () => buildBip32PrivateKey,
  buildDRepID: () => buildDRepID,
  buildEnterpriseAddress: () => buildEnterpriseAddress,
  buildKeys: () => buildKeys,
  buildRewardAddress: () => buildRewardAddress,
  buildScriptPubkey: () => buildScriptPubkey,
  checkSignature: () => checkSignature,
  deserializeAddress: () => deserializeAddress,
  deserializeDataHash: () => deserializeDataHash,
  deserializeEd25519KeyHash: () => deserializeEd25519KeyHash,
  deserializeNativeScript: () => deserializeNativeScript,
  deserializePlutusData: () => deserializePlutusData,
  deserializePlutusScript: () => deserializePlutusScript,
  deserializeScriptHash: () => deserializeScriptHash,
  deserializeScriptRef: () => deserializeScriptRef,
  deserializeTx: () => deserializeTx,
  deserializeTxHash: () => deserializeTxHash,
  deserializeTxUnspentOutput: () => deserializeTxUnspentOutput,
  deserializeValue: () => deserializeValue,
  empty: () => empty,
  fromNativeScript: () => fromNativeScript,
  fromScriptRef: () => fromScriptRef,
  fromTxUnspentOutput: () => fromTxUnspentOutput,
  fromValue: () => fromValue,
  generateNonce: () => generateNonce,
  getCoseKeyFromPublicKey: () => getCoseKeyFromPublicKey,
  getPublicKeyFromCoseKey: () => getPublicKeyFromCoseKey,
  mergeValue: () => mergeValue,
  negateValue: () => negateValue,
  negatives: () => negatives,
  resolveDataHash: () => resolveDataHash,
  resolveNativeScriptAddress: () => resolveNativeScriptAddress,
  resolveNativeScriptHash: () => resolveNativeScriptHash,
  resolvePaymentKeyHash: () => resolvePaymentKeyHash,
  resolvePlutusScriptAddress: () => resolvePlutusScriptAddress,
  resolvePlutusScriptHash: () => resolvePlutusScriptHash,
  resolvePoolId: () => resolvePoolId,
  resolvePrivateKey: () => resolvePrivateKey,
  resolveRewardAddress: () => resolveRewardAddress,
  resolveScriptRef: () => resolveScriptRef,
  resolveStakeKeyHash: () => resolveStakeKeyHash,
  resolveTxHash: () => resolveTxHash,
  signData: () => signData,
  subValue: () => subValue,
  toAddress: () => toAddress,
  toBaseAddress: () => toBaseAddress,
  toEnterpriseAddress: () => toEnterpriseAddress,
  toNativeScript: () => toNativeScript,
  toPlutusData: () => toPlutusData,
  toRewardAddress: () => toRewardAddress,
  toScriptRef: () => toScriptRef,
  toTxUnspentOutput: () => toTxUnspentOutput,
  toValue: () => toValue
});
module.exports = __toCommonJS(src_exports);
var import_core7 = require("@cardano-sdk/core");

// src/types/cardano-sdk.ts
var import_core = require("@cardano-sdk/core");
var Crypto = __toESM(require("@cardano-sdk/crypto"), 1);
var import_util = require("@cardano-sdk/util");
var Slot = import_core.Cardano.Slot;
var Value = import_core.Serialization.Value;
var Transaction = import_core.Serialization.Transaction;
var TransactionId = import_core.Cardano.TransactionId;
var TransactionBody = import_core.Serialization.TransactionBody;
var TransactionWitnessSet = import_core.Serialization.TransactionWitnessSet;
var TransactionUnspentOutput = import_core.Serialization.TransactionUnspentOutput;
var TransactionInput = import_core.Serialization.TransactionInput;
var TransactionOutput = import_core.Serialization.TransactionOutput;
var PlutusData = import_core.Serialization.PlutusData;
var PlutusList = import_core.Serialization.PlutusList;
var PlutusMap = import_core.Serialization.PlutusMap;
var Redeemers = import_core.Serialization.Redeemers;
var Redeemer = import_core.Serialization.Redeemer;
var RedeemerPurpose = import_core.Cardano.RedeemerPurpose;
var RedeemerTag = import_core.Serialization.RedeemerTag;
var Script = import_core.Serialization.Script;
var PolicyId = import_core.Cardano.PolicyId;
var AssetName = import_core.Cardano.AssetName;
var AssetId = import_core.Cardano.AssetId;
var ScriptHash = Crypto.Hash28ByteBase16;
var Address = import_core.Cardano.Address;
var RewardAddress = import_core.Cardano.RewardAddress;
var AddressType = import_core.Cardano.AddressType;
var BaseAddress = import_core.Cardano.BaseAddress;
var EnterpriseAddress = import_core.Cardano.EnterpriseAddress;
var PaymentAddress = import_core.Cardano.PaymentAddress;
var AssetFingerprint = import_core.Cardano.AssetFingerprint;
var Credential = import_core.Serialization.Credential;
var Ed25519PublicKeyHex2 = Crypto.Ed25519PublicKeyHex;
var Ed25519PrivateNormalKeyHex = (value) => (0, import_util.typedHex)(value, 64);
var Ed25519PrivateExtendedKeyHex = (value) => (0, import_util.typedHex)(value, 128);
var Ed25519KeyHash2 = Crypto.Ed25519KeyHash;
var Ed25519KeyHashHex2 = Crypto.Ed25519KeyHashHex;
var Hash28ByteBase162 = Crypto.Hash28ByteBase16;
var Hash32ByteBase162 = Crypto.Hash32ByteBase16;
var CredentialType = import_core.Cardano.CredentialType;
var Certificate = import_core.Serialization.Certificate;
var PoolId = import_core.Cardano.PoolId;
var StakeRegistration = import_core.Serialization.StakeRegistration;
var StakeDelegation = import_core.Serialization.StakeDelegation;
var CertificateType = import_core.Cardano.CertificateType;
var VkeyWitness = import_core.Serialization.VkeyWitness;
var Ed25519SignatureHex2 = Crypto.Ed25519SignatureHex;
var Ed25519PublicKey2 = Crypto.Ed25519PublicKey;
var Ed25519Signature2 = Crypto.Ed25519Signature;
var Bip32PrivateKey2 = Crypto.Bip32PrivateKey;
var Bip32PrivateKeyHex2 = Crypto.Bip32PrivateKeyHex;
var PlutusLanguageVersion = import_core.Cardano.PlutusLanguageVersion;
var NativeScript = import_core.Serialization.NativeScript;
var PlutusV1Script = import_core.Serialization.PlutusV1Script;
var PlutusV2Script = import_core.Serialization.PlutusV2Script;
var PlutusV3Script = import_core.Serialization.PlutusV3Script;
var Costmdls = import_core.Serialization.Costmdls;
var CostModel = import_core.Serialization.CostModel;
var CborWriter = import_core.Serialization.CborWriter;
var ConstrPlutusData = import_core.Serialization.ConstrPlutusData;
var RewardAccount = import_core.Cardano.RewardAccount;
var Hash = import_core.Serialization.Hash;
var DatumHash = Crypto.Hash32ByteBase16;
var Datum = import_core.Serialization.Datum;
var ExUnits = import_core.Serialization.ExUnits;
var NetworkId = import_core.Cardano.NetworkId;
var DatumKind = import_core.Serialization.DatumKind;
var CborSet = import_core.Serialization.CborSet;
var RequireAllOf = import_core.Cardano.NativeScriptKind.RequireAllOf;
var RequireAnyOf = import_core.Cardano.NativeScriptKind.RequireAnyOf;
var RequireNOf = import_core.Cardano.NativeScriptKind.RequireNOf;
var RequireSignature = import_core.Cardano.NativeScriptKind.RequireSignature;
var RequireTimeAfter = import_core.Cardano.NativeScriptKind.RequireTimeAfter;
var RequireTimeBefore = import_core.Cardano.NativeScriptKind.RequireTimeBefore;
var VrfVkBech32 = import_core.Cardano.VrfVkBech32;
var ScriptPubkey = import_core.Serialization.ScriptPubkey;
var DRepID = import_core.Cardano.DRepID;
var DRep = import_core.Serialization.DRep;
var StakeCredentialStatus = import_core.Cardano.StakeCredentialStatus;

// src/message-signing/cose-sign1.ts
var import_buffer = require("buffer");
var import_blakejs = __toESM(require_blakejs(), 1);

// src/stricahq/bip32ed25519/wrapper.ts
var cjsBip32ed25519 = __toESM(require("@stricahq/bip32ed25519"), 1);
var bip32ed25519 = cjsBip32ed25519;
var exportedBip32ed25519 = bip32ed25519?.default || bip32ed25519;
var StricaPrivateKey = exportedBip32ed25519.PrivateKey;
var StricaPublicKey = exportedBip32ed25519.PublicKey;
var StricaBip32PrivateKey = exportedBip32ed25519.Bip32PrivateKey;
var StricaBip32PublicKey = exportedBip32ed25519.Bip32PublicKey;

// src/stricahq/cbors/wrapper.ts
var cjsCbors = __toESM(require("@stricahq/cbors"), 1);
var cbors = cjsCbors;
var exportedCbors = cbors?.default || cbors;
var StricaEncoder = exportedCbors.Encoder;
var StricaDecoder = exportedCbors.Decoder;

// src/message-signing/cose-sign1.ts
var CoseSign1 = class _CoseSign1 {
  protectedMap;
  unProtectedMap;
  payload;
  signature;
  constructor(payload) {
    this.protectedMap = payload.protectedMap;
    this.unProtectedMap = payload.unProtectedMap;
    this.payload = payload.payload;
    if (this.unProtectedMap.get("hashed") == null) {
      this.unProtectedMap.set("hashed", false);
    }
    this.signature = payload.signature;
  }
  static fromCbor(cbor) {
    const decoded = StricaDecoder.decode(import_buffer.Buffer.from(cbor, "hex"));
    if (!(decoded.value instanceof Array)) throw Error("Invalid CBOR");
    if (decoded.value.length !== 4) throw Error("Invalid COSE_SIGN1");
    let protectedMap;
    const protectedSerialized = decoded.value[0];
    try {
      protectedMap = StricaDecoder.decode(protectedSerialized).value;
      if (!(protectedMap instanceof Map)) {
        throw Error();
      }
    } catch (error) {
      throw Error("Invalid protected");
    }
    const unProtectedMap = decoded.value[1];
    if (!(unProtectedMap instanceof Map)) throw Error("Invalid unprotected");
    const payload = decoded.value[2];
    const signature = decoded.value[3];
    return new _CoseSign1({
      protectedMap,
      unProtectedMap,
      payload,
      signature
    });
  }
  createSigStructure(externalAad = import_buffer.Buffer.alloc(0)) {
    let protectedSerialized = import_buffer.Buffer.alloc(0);
    if (this.protectedMap.size !== 0) {
      protectedSerialized = StricaEncoder.encode(this.protectedMap);
    }
    const structure = [
      "Signature1",
      protectedSerialized,
      externalAad,
      this.payload
    ];
    return StricaEncoder.encode(structure);
  }
  buildMessage(signature) {
    this.signature = signature;
    let protectedSerialized = import_buffer.Buffer.alloc(0);
    if (this.protectedMap.size !== 0) {
      protectedSerialized = StricaEncoder.encode(this.protectedMap);
    }
    const coseSign1 = [
      protectedSerialized,
      this.unProtectedMap,
      this.payload,
      this.signature
    ];
    return StricaEncoder.encode(coseSign1);
  }
  verifySignature({
    externalAad = import_buffer.Buffer.alloc(0),
    publicKeyBuffer
  } = {}) {
    if (!publicKeyBuffer) {
      publicKeyBuffer = this.getPublicKey();
    }
    if (!publicKeyBuffer) throw Error("Public key not found");
    if (!this.signature) throw Error("Signature not found");
    const publicKey = new StricaPublicKey(publicKeyBuffer);
    return publicKey.verify(
      this.signature,
      this.createSigStructure(externalAad)
    );
  }
  hashPayload() {
    if (!this.unProtectedMap) throw Error("Invalid unprotected map");
    if (!this.payload) throw Error("Invalid payload");
    if (this.unProtectedMap.get("hashed"))
      throw Error("Payload already hashed");
    if (this.unProtectedMap.get("hashed") != false)
      throw Error("Invalid unprotected map");
    this.unProtectedMap.set("hashed", true);
    const hash = (0, import_blakejs.blake2b)(this.payload, void 0, 24);
    this.payload = import_buffer.Buffer.from(hash);
  }
  getAddress() {
    return this.protectedMap.get("address");
  }
  getPublicKey() {
    return this.protectedMap.get(4);
  }
  getSignature() {
    return this.signature;
  }
  getPayload() {
    return this.payload;
  }
};
var getPublicKeyFromCoseKey = (cbor) => {
  const decodedCoseKey = StricaDecoder.decode(import_buffer.Buffer.from(cbor, "hex"));
  const publicKeyBuffer = decodedCoseKey.value.get(-2);
  if (publicKeyBuffer) {
    return publicKeyBuffer;
  }
  throw Error("Public key not found");
};
var getCoseKeyFromPublicKey = (cbor) => {
  const coseKeyMap = /* @__PURE__ */ new Map();
  coseKeyMap.set(1, 1);
  coseKeyMap.set(3, -8);
  coseKeyMap.set(6, -2);
  coseKeyMap.set(-2, import_buffer.Buffer.from(cbor, "hex"));
  return StricaEncoder.encode(coseKeyMap);
};

// src/message-signing/check-signature.ts
var checkSignature = (data, { key, signature }) => {
  const builder = CoseSign1.fromCbor(signature);
  if (builder.getPayload() === null) {
    return false;
  }
  if (Buffer.from(data, "hex").compare(builder.getPayload()) !== 0) {
    return false;
  }
  return builder.verifySignature({
    publicKeyBuffer: getPublicKeyFromCoseKey(key)
  });
};

// ../../node_modules/nanoid/index.js
var import_crypto = __toESM(require("crypto"), 1);
var POOL_SIZE_MULTIPLIER = 128;
var pool;
var poolOffset;
var fillPool = (bytes) => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    import_crypto.default.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    import_crypto.default.randomFillSync(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
};
var random = (bytes) => {
  fillPool(bytes -= 0);
  return pool.subarray(poolOffset - bytes, poolOffset);
};
var customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << 31 - Math.clz32(alphabet.length - 1 | 1)) - 1;
  let step = Math.ceil(1.6 * mask * defaultSize / alphabet.length);
  return (size = defaultSize) => {
    let id = "";
    while (true) {
      let bytes = getRandom(step);
      let i = step;
      while (i--) {
        id += alphabet[bytes[i] & mask] || "";
        if (id.length === size) return id;
      }
    }
  };
};
var customAlphabet = (alphabet, size = 21) => customRandom(alphabet, size, random);

// src/message-signing/generate-nonce.ts
var import_common = require("@meshsdk/common");
var generateNonce = (label = "", length = 32) => {
  if (length <= 0 || length > 2048) {
    throw new Error("Length must be bewteen 1 and 2048");
  }
  const randomString = customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  );
  const payload = randomString(length);
  return (0, import_common.stringToHex)(`${label}${payload}`);
};

// src/message-signing/sign-data.ts
var signData = (data, signer) => {
  const payload = Buffer.from(data, "hex");
  const publicKey = signer.key.toPublicKey().toBytes();
  const protectedMap = /* @__PURE__ */ new Map();
  protectedMap.set(1, -8);
  protectedMap.set(4, publicKey);
  protectedMap.set("address", Buffer.from(signer.address.toBytes(), "hex"));
  const coseSign1Builder = new CoseSign1({
    protectedMap,
    unProtectedMap: /* @__PURE__ */ new Map(),
    payload
  });
  const signature = signer.key.sign(coseSign1Builder.createSigStructure());
  const coseSignature = coseSign1Builder.buildMessage(signature).toString("hex");
  return {
    key: getCoseKeyFromPublicKey(publicKey.toString("hex")).toString("hex"),
    signature: coseSignature
  };
};

// src/resolvers/index.ts
var import_core4 = require("@cardano-sdk/core");
var import_crypto5 = require("@cardano-sdk/crypto");
var import_util5 = require("@cardano-sdk/util");

// src/utils/builder.ts
var import_crypto2 = require("@cardano-sdk/crypto");
var import_util2 = require("@cardano-sdk/util");
var import_pbkdf2 = require("pbkdf2");
var import_common2 = require("@meshsdk/common");
var buildBaseAddress = (networkId, paymentKeyHash, stakeKeyHash) => {
  return BaseAddress.fromCredentials(
    networkId,
    {
      hash: paymentKeyHash,
      type: CredentialType.KeyHash
    },
    {
      hash: stakeKeyHash,
      type: CredentialType.KeyHash
    }
  );
};
var buildEnterpriseAddress = (networkId, paymentKeyHash) => {
  return EnterpriseAddress.fromCredentials(networkId, {
    hash: paymentKeyHash,
    type: CredentialType.KeyHash
  });
};
var buildBip32PrivateKey = (entropy, password = "") => {
  const PBKDF2_ITERATIONS = 4096;
  const PBKDF2_KEY_SIZE = 96;
  const PBKDF2_DIGEST_ALGORITHM = "sha512";
  const clampScalar = (scalar) => {
    if (scalar[0] !== void 0) {
      scalar[0] &= 248;
    }
    if (scalar[31] !== void 0) {
      scalar[31] &= 31;
      scalar[31] |= 64;
    }
    return scalar;
  };
  const _entropy = Buffer.from(entropy, "hex");
  const xprv = (0, import_pbkdf2.pbkdf2Sync)(
    password,
    _entropy,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_SIZE,
    PBKDF2_DIGEST_ALGORITHM
  );
  return Bip32PrivateKey2.fromBytes(clampScalar(xprv));
};
var buildRewardAddress = (networkId, stakeKeyHash) => {
  const cred = {
    type: CredentialType.KeyHash,
    hash: stakeKeyHash
  };
  return RewardAddress.fromCredentials(networkId, cred);
};
var buildKeys = (entropy, accountIndex, keyIndex = 0) => {
  if (typeof entropy === "string") {
    const rootKey = new StricaBip32PrivateKey(Buffer.from(entropy, "hex"));
    const accountKey = rootKey.derive(import_common2.HARDENED_KEY_START + 1852).derive(import_common2.HARDENED_KEY_START + 1815).derive(import_common2.HARDENED_KEY_START + accountIndex);
    const paymentKey = accountKey.derive(0).derive(keyIndex).toPrivateKey();
    const stakeKey = accountKey.derive(2).derive(0).toPrivateKey();
    const dRepKey = accountKey.derive(3).derive(keyIndex).toPrivateKey();
    return { paymentKey, stakeKey, dRepKey };
  } else {
    const paymentKey = StricaPrivateKey.fromSecretKey(
      Buffer.from(entropy[0], "hex")
    );
    const stakeKey = StricaPrivateKey.fromSecretKey(
      Buffer.from(entropy[1], "hex")
    );
    return { paymentKey, stakeKey };
  }
};
var buildScriptPubkey = (keyHash) => {
  const scriptPubkey = new ScriptPubkey(Ed25519KeyHashHex2(keyHash.hex()));
  return NativeScript.newScriptPubkey(scriptPubkey);
};
var buildDRepID = (dRepKey, networkId = NetworkId.Testnet, addressType = AddressType.EnterpriseKey) => {
  const dRepKeyBytes = Buffer.from(dRepKey, "hex");
  const dRepIdHex = (0, import_crypto2.blake2b)(28).update(dRepKeyBytes).digest("hex");
  const paymentAddress = EnterpriseAddress.packParts({
    networkId,
    paymentPart: {
      hash: Hash28ByteBase162(dRepIdHex),
      type: CredentialType.KeyHash
    },
    type: addressType
  });
  return import_util2.HexBlob.toTypedBech32(
    "drep",
    import_util2.HexBlob.fromBytes(paymentAddress)
  );
};

// src/utils/converter.ts
var import_core3 = require("@cardano-sdk/core");
var import_crypto4 = require("@cardano-sdk/crypto");
var import_util4 = require("@cardano-sdk/util");
var import_common4 = require("@meshsdk/common");

// src/utils/deserializer.ts
var import_core2 = require("@cardano-sdk/core");
var import_crypto3 = require("@cardano-sdk/crypto");
var import_util3 = require("@cardano-sdk/util");
var import_common3 = require("@meshsdk/common");
var deserializeAddress = (address) => {
  const _address = Address.fromString(address);
  if (_address === null) throw new Error("Invalid address");
  return _address;
};
var deserializeEd25519KeyHash = (ed25519KeyHash) => Ed25519KeyHash2.fromBytes((0, import_common3.toBytes)(ed25519KeyHash));
var deserializeDataHash = (dataHash) => DatumHash.fromHexBlob((0, import_util3.HexBlob)(dataHash));
var deserializePlutusData = (plutusData) => PlutusData.fromCbor((0, import_util3.HexBlob)(plutusData));
var deserializePlutusScript = (plutusScript, version) => {
  switch (version) {
    case "V1":
      return PlutusV1Script.fromCbor((0, import_util3.HexBlob)(plutusScript));
    case "V2":
      return PlutusV2Script.fromCbor((0, import_util3.HexBlob)(plutusScript));
    case "V3":
      return PlutusV3Script.fromCbor((0, import_util3.HexBlob)(plutusScript));
    default:
      throw new Error("Invalid Plutus script version");
  }
};
var deserializeNativeScript = (nativeScript) => NativeScript.fromCbor((0, import_util3.HexBlob)(nativeScript));
var deserializeScriptHash = (scriptHash) => ScriptHash.fromEd25519KeyHashHex((0, import_crypto3.Ed25519KeyHashHex)(scriptHash));
var deserializeScriptRef = (scriptRef) => Script.fromCbor((0, import_util3.HexBlob)(scriptRef));
var deserializeTxUnspentOutput = (txUnspentOutput) => TransactionUnspentOutput.fromCbor((0, import_util3.HexBlob)(txUnspentOutput));
var deserializeValue = (value) => Value.fromCbor((0, import_util3.HexBlob)(value));
var deserializeTx = (tx) => Transaction.fromCbor((0, import_core2.TxCBOR)(tx));
var deserializeTxHash = (txHash) => TransactionId.fromHexBlob((0, import_util3.HexBlob)(txHash));

// src/utils/converter.ts
var toAddress = (bech32) => Address.fromBech32(bech32);
var toBaseAddress = (bech32) => {
  return BaseAddress.fromAddress(toAddress(bech32));
};
var toEnterpriseAddress = (bech32) => {
  return EnterpriseAddress.fromAddress(toAddress(bech32));
};
var toRewardAddress = (bech32) => RewardAddress.fromAddress(toAddress(bech32));
var fromTxUnspentOutput = (txUnspentOutput) => {
  const dataHash = txUnspentOutput.output().datum() ? txUnspentOutput.output().datum()?.toCbor().toString() : void 0;
  const scriptRef = txUnspentOutput.output().scriptRef() ? txUnspentOutput.output().scriptRef()?.toCbor().toString() : void 0;
  const plutusData = txUnspentOutput.output().datum()?.asInlineData() ? txUnspentOutput.output().datum()?.asInlineData()?.toCbor().toString() : void 0;
  return {
    input: {
      outputIndex: Number(txUnspentOutput.input().index()),
      txHash: txUnspentOutput.input().transactionId()
    },
    output: {
      address: txUnspentOutput.output().address().toBech32(),
      amount: fromValue(txUnspentOutput.output().amount()),
      dataHash,
      // todo not sure if correct
      plutusData,
      // todo not sure if correct
      scriptRef
      // todo not sure if correct
    }
  };
};
var toTxUnspentOutput = (utxo) => {
  const txInput = new TransactionInput(
    deserializeTxHash(utxo.input.txHash),
    BigInt(utxo.input.outputIndex)
  );
  const txOutput = new TransactionOutput(
    toAddress(utxo.output.address),
    toValue(utxo.output.amount)
  );
  if (utxo.output.dataHash !== void 0) {
    txOutput.setDatum(
      Datum.fromCore(deserializeDataHash(utxo.output.dataHash))
    );
  }
  if (utxo.output.plutusData !== void 0) {
    const plutusData = deserializePlutusData(utxo.output.plutusData);
    const datum = new import_core3.Serialization.Datum(void 0, plutusData);
    txOutput.setDatum(datum);
  }
  if (utxo.output.scriptRef !== void 0) {
    txOutput.setScriptRef(deserializeScriptRef(utxo.output.scriptRef));
  }
  return new TransactionUnspentOutput(txInput, txOutput);
};
var addressToBech32 = (address) => {
  return address.toBech32();
};
var fromValue = (value) => {
  const assets = [
    { unit: "lovelace", quantity: value.coin().toString() }
  ];
  const multiAsset = value.multiasset();
  if (multiAsset !== void 0) {
    const _assets = Array.from(multiAsset.keys());
    for (let i = 0; i < _assets.length; i += 1) {
      const assetId = _assets[i];
      if (assetId !== void 0) {
        const assetQuantity = multiAsset.get(assetId);
        if (assetQuantity !== void 0) {
          assets.push({
            unit: assetId,
            quantity: assetQuantity.toString()
          });
        }
      }
    }
  }
  return assets;
};
var toScriptRef = (script) => {
  if ("code" in script) {
    const plutusScript = deserializePlutusScript(script.code, script.version);
    if (plutusScript instanceof PlutusV1Script)
      return Script.newPlutusV1Script(plutusScript);
    if (plutusScript instanceof PlutusV2Script)
      return Script.newPlutusV2Script(plutusScript);
    if (plutusScript instanceof PlutusV3Script)
      return Script.newPlutusV3Script(plutusScript);
  }
  return Script.newNativeScript(toNativeScript(script));
};
var fromScriptRef = (scriptRef) => {
  const script = Script.fromCbor((0, import_util4.HexBlob)(scriptRef));
  const plutusScriptCodeV3 = script.asPlutusV3()?.toCbor().toString();
  if (plutusScriptCodeV3) {
    return {
      code: plutusScriptCodeV3,
      version: "V3"
    };
  }
  const plutusScriptCodeV2 = script.asPlutusV2()?.toCbor().toString();
  if (plutusScriptCodeV2) {
    return {
      code: plutusScriptCodeV2,
      version: "V2"
    };
  }
  const plutusScriptCodeV1 = script.asPlutusV1()?.toCbor().toString();
  if (plutusScriptCodeV1) {
    return {
      code: plutusScriptCodeV1,
      version: "V1"
    };
  }
  const nativeScript = script.asNative();
  if (!nativeScript) {
    throw new Error("Invalid script");
  }
  return fromNativeScript(nativeScript);
};
var fromNativeScript = (script) => {
  const fromNativeScripts = (scripts) => {
    const nativeScripts = new Array();
    for (let index = 0; index < scripts.length; index += 1) {
      const script2 = scripts[index];
      if (script2) {
        nativeScripts.push(fromNativeScript(script2));
      }
    }
    return nativeScripts;
  };
  switch (script.kind()) {
    case RequireAllOf: {
      const scriptAll = script.asScriptAll();
      return {
        type: "all",
        scripts: fromNativeScripts(scriptAll.nativeScripts())
      };
    }
    case RequireAnyOf: {
      const scriptAny = script.asScriptAny();
      return {
        type: "any",
        scripts: fromNativeScripts(scriptAny.nativeScripts())
      };
    }
    case RequireNOf: {
      const scriptNOfK = script.asScriptNOfK();
      return {
        type: "atLeast",
        required: scriptNOfK.required(),
        scripts: fromNativeScripts(scriptNOfK.nativeScripts())
      };
    }
    case RequireTimeAfter: {
      const timelockStart = script.asTimelockStart();
      return {
        type: "after",
        slot: timelockStart.slot().toString()
      };
    }
    case RequireTimeBefore: {
      const timelockExpiry = script.asTimelockExpiry();
      return {
        type: "before",
        slot: timelockExpiry.slot().toString()
      };
    }
    case RequireSignature: {
      const scriptPubkey = script.asScriptPubkey();
      return {
        type: "sig",
        keyHash: scriptPubkey.keyHash().toString()
      };
    }
    default:
      throw new Error(`Script Kind: ${script.kind()}, is not supported`);
  }
};
var toNativeScript = (script) => {
  const toNativeScripts = (scripts) => {
    const nativeScripts = [];
    scripts.forEach((script2) => {
      nativeScripts.push(toNativeScript(script2));
    });
    return nativeScripts;
  };
  switch (script.type) {
    case "all":
      return NativeScript.newScriptAll(
        new import_core3.Serialization.ScriptAll(toNativeScripts(script.scripts))
      );
    case "any":
      return NativeScript.newScriptAny(
        new import_core3.Serialization.ScriptAny(toNativeScripts(script.scripts))
      );
    case "atLeast":
      return NativeScript.newScriptNOfK(
        new import_core3.Serialization.ScriptNOfK(
          toNativeScripts(script.scripts),
          script.required
        )
      );
    case "after":
      return NativeScript.newTimelockStart(
        new import_core3.Serialization.TimelockStart(Slot(parseInt(script.slot)))
      );
    case "before":
      return NativeScript.newTimelockExpiry(
        new import_core3.Serialization.TimelockExpiry(Slot(parseInt(script.slot)))
      );
    case "sig":
      return NativeScript.newScriptPubkey(
        new import_core3.Serialization.ScriptPubkey(
          import_crypto4.Ed25519KeyHash.fromBytes((0, import_common4.toBytes)(script.keyHash)).hex()
        )
      );
  }
};
var toPlutusData = (data) => {
  const toPlutusList = (data2) => {
    const plutusList = new PlutusList();
    data2.forEach((element) => {
      plutusList.add(toPlutusData(element));
    });
    return plutusList;
  };
  switch (typeof data) {
    case "string":
      return PlutusData.newBytes((0, import_common4.toBytes)(data));
    case "number":
      return PlutusData.newInteger(BigInt(data));
    case "bigint":
      return PlutusData.newInteger(BigInt(data));
    case "object":
      if (data instanceof Array) {
        const plutusList = toPlutusList(data);
        return PlutusData.newList(plutusList);
      } else if (data instanceof Map) {
        const plutusMap = new PlutusMap();
        data.forEach((value, key) => {
          plutusMap.insert(toPlutusData(key), toPlutusData(value));
        });
        return PlutusData.newMap(plutusMap);
      } else {
        return PlutusData.newConstrPlutusData(
          new ConstrPlutusData(
            BigInt(data.alternative),
            toPlutusList(data.fields)
          )
        );
      }
  }
};
var toValue = (assets) => {
  const multiAsset = /* @__PURE__ */ new Map();
  assets.filter((asset) => asset.unit !== "lovelace").forEach((asset) => {
    multiAsset.set(AssetId(asset.unit), BigInt(asset.quantity));
  });
  const lovelace = assets.find((asset) => asset.unit === "lovelace");
  const value = new Value(BigInt(lovelace ? lovelace.quantity : 0));
  if (assets.length > 1 || !lovelace) {
    value.setMultiasset(multiAsset);
  }
  return value;
};

// src/utils/value.ts
function mergeValue(a, b) {
  const ma = a.multiasset() ?? /* @__PURE__ */ new Map();
  b.multiasset()?.forEach((v, k) => {
    const newVal = (ma.get(k) ?? 0n) + v;
    if (newVal == 0n) {
      ma.delete(k);
    } else {
      ma.set(k, newVal);
    }
  });
  return new Value(
    BigInt(a.coin()) + BigInt(b.coin()),
    ma.size > 0 ? ma : void 0
  );
}
function negateValue(v) {
  const entries = v.multiasset()?.entries();
  const tokenMap = /* @__PURE__ */ new Map();
  if (entries) {
    for (const entry of entries) {
      tokenMap.set(entry[0], -entry[1]);
    }
  }
  return new Value(-v.coin(), tokenMap);
}
function subValue(a, b) {
  return mergeValue(a, negateValue(b));
}
function negatives(v) {
  const entries = v.multiasset()?.entries();
  const coin = v.coin() < 0n ? v.coin() : 0n;
  const tokenMap = /* @__PURE__ */ new Map();
  if (entries) {
    for (const entry of entries) {
      if (entry[1] < 0n) {
        tokenMap.set(entry[0], entry[1]);
      }
    }
  }
  return new Value(coin, tokenMap);
}
function assetTypes(v) {
  let count = v.coin() == 0n ? 0 : 1;
  const entries = v.multiasset();
  if (entries) {
    entries.forEach(() => {
      count += 1;
    });
  }
  return count;
}
function empty(v) {
  return assetTypes(v) == 0;
}

// src/utils/encoding.ts
var hexToBytes = (hex) => Buffer.from(hex, "hex");

// src/resolvers/index.ts
var resolveDataHash = (data) => {
  const plutusData = toPlutusData(data);
  return plutusData.hash().toString();
};
var resolveNativeScriptAddress = (script, networkId = 0) => {
  const nativeScript = toNativeScript(script);
  const enterpriseAddress = EnterpriseAddress.fromCredentials(networkId, {
    hash: nativeScript.hash(),
    type: import_core4.Cardano.CredentialType.ScriptHash
  });
  return enterpriseAddress.toAddress().toBech32();
};
var resolveNativeScriptHash = (script) => {
  return toNativeScript(script).hash().toString();
};
var resolvePaymentKeyHash = (bech32) => {
  try {
    const paymentKeyHash = [
      toBaseAddress(bech32)?.getPaymentCredential().hash,
      toEnterpriseAddress(bech32)?.getPaymentCredential().hash
    ].find((kh) => kh !== void 0);
    if (paymentKeyHash !== void 0) return paymentKeyHash.toString();
    throw new Error(
      `Couldn't resolve payment key hash from address: ${bech32}`
    );
  } catch (error) {
    throw new Error(
      `An error occurred during resolvePaymentKeyHash: ${error}.`
    );
  }
};
var resolvePlutusScriptAddress = (script, networkId = 0) => {
  const plutusScript = deserializePlutusScript(script.code, script.version);
  const enterpriseAddress = EnterpriseAddress.fromCredentials(networkId, {
    hash: plutusScript.hash(),
    type: import_core4.Cardano.CredentialType.ScriptHash
  });
  return enterpriseAddress.toAddress().toBech32();
};
var resolvePlutusScriptHash = (bech32) => {
  try {
    const enterpriseAddress = toEnterpriseAddress(bech32);
    const scriptHash = enterpriseAddress?.getPaymentCredential().hash;
    if (scriptHash !== void 0) return scriptHash.toString();
    throw new Error(`Couldn't resolve script hash from address: ${bech32}`);
  } catch (error) {
    throw new Error(`An error occurred during resolveScriptHash: ${error}.`);
  }
};
var resolvePoolId = (hash) => {
  return Ed25519KeyHashHex2(hash).toString();
};
var resolvePrivateKey = (words) => {
  return "not implemented";
};
var resolveScriptRef = (script) => {
  return toScriptRef(script).toCbor().toString();
};
var resolveRewardAddress = (bech32) => {
  try {
    const address = toAddress(bech32);
    const baseAddress = toBaseAddress(bech32);
    const stakeKeyHash = baseAddress?.getStakeCredential().hash;
    if (stakeKeyHash !== void 0)
      return buildRewardAddress(address.getNetworkId(), stakeKeyHash).toAddress().toBech32();
    throw new Error(`Couldn't resolve reward address from address: ${bech32}`);
  } catch (error) {
    throw new Error(`An error occurred during resolveRewardAddress: ${error}.`);
  }
};
var resolveStakeKeyHash = (bech32) => {
  try {
    const stakeKeyHash = [
      toBaseAddress(bech32)?.getStakeCredential().hash,
      toRewardAddress(bech32)?.getPaymentCredential().hash
    ].find((kh) => kh !== void 0);
    if (stakeKeyHash !== void 0) return stakeKeyHash.toString();
    throw new Error(`Couldn't resolve stake key hash from address: ${bech32}`);
  } catch (error) {
    throw new Error(`An error occurred during resolveStakeKeyHash: ${error}.`);
  }
};
var resolveTxHash = (txHex) => {
  const txBody = deserializeTx(txHex).body();
  const hash = (0, import_crypto5.blake2b)(import_crypto5.blake2b.BYTES).update(hexToBytes(txBody.toCbor())).digest();
  return import_core4.Cardano.TransactionId.fromHexBlob(import_util5.HexBlob.fromBytes(hash));
};

// src/serializer/index.ts
var import_core6 = require("@cardano-sdk/core");
var import_util7 = require("@cardano-sdk/util");
var import_common5 = require("@meshsdk/common");

// src/utils/script-data-hash.ts
var import_core5 = require("@cardano-sdk/core");
var Crypto2 = __toESM(require("@cardano-sdk/crypto"), 1);
var import_crypto6 = require("@cardano-sdk/crypto");
var import_util6 = require("@cardano-sdk/util");
var CBOR_EMPTY_LIST = new Uint8Array([128]);
var CBOR_EMPTY_MAP = new Uint8Array([160]);
var getCborEncodedArray = (items) => {
  const writer = new import_core5.Serialization.CborWriter();
  writer.writeStartArray(items.length);
  for (const item of items) {
    writer.writeEncodedValue(Buffer.from(item.toCbor(), "hex"));
  }
  return writer.encode();
};
var hashScriptData = (costModels, redemeers, datums) => {
  const writer = new import_core5.Serialization.CborWriter();
  if (datums && datums.length > 0 && (!redemeers || redemeers.length === 0)) {
    writer.writeEncodedValue(CBOR_EMPTY_LIST);
    writer.writeEncodedValue(getCborEncodedArray(datums));
    writer.writeEncodedValue(CBOR_EMPTY_MAP);
  } else {
    if (!redemeers || redemeers.length === 0) return void 0;
    writer.writeEncodedValue(getCborEncodedArray(redemeers));
    if (datums && datums.length > 0)
      writer.writeEncodedValue(getCborEncodedArray(datums));
    writer.writeEncodedValue(
      Buffer.from(costModels.languageViewsEncoding(), "hex")
    );
  }
  return import_crypto6.Hash32ByteBase16.fromHexBlob(
    import_util6.HexBlob.fromBytes(
      Crypto2.blake2b(Crypto2.blake2b.BYTES).update(writer.encode()).digest()
    )
  );
};

// src/serializer/index.ts
var CardanoSDKSerializer = class {
  verbose;
  txBody;
  txWitnessSet;
  utxoContext = /* @__PURE__ */ new Map();
  redeemerContext = /* @__PURE__ */ new Map();
  scriptsProvided = /* @__PURE__ */ new Set();
  datumsProvided = /* @__PURE__ */ new Set();
  usedLanguages = {
    [0]: false,
    [1]: false,
    [2]: false
  };
  constructor(verbose = false) {
    this.verbose = verbose;
    this.txBody = new TransactionBody(
      import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore),
      [],
      BigInt(0),
      void 0
    );
    this.txWitnessSet = new TransactionWitnessSet();
  }
  serializeRewardAddress(stakeKeyHash, isScriptHash, network_id) {
    throw new Error("Method not implemented.");
  }
  serializePoolId(hash) {
    throw new Error("Method not implemented.");
  }
  serializeAddress(address, networkId) {
    throw new Error("Method not implemented.");
  }
  serializeData(data) {
    throw new Error("Method not implemented.");
  }
  deserializer = {
    key: {
      deserializeAddress: function(bech32) {
        throw new Error("Function not implemented.");
      }
    },
    script: {
      deserializeNativeScript: function(script) {
        throw new Error("Function not implemented.");
      },
      deserializePlutusScript: function(script) {
        throw new Error("Function not implemented.");
      }
    },
    cert: {
      deserializePoolId: function(poolId) {
        throw new Error("Function not implemented.");
      }
    }
  };
  resolver = {
    keys: {
      // resolvePaymentKeyHash: function (bech32: string): string {
      //   const cardanoAddress = toAddress(bech32);
      //   return cardanoAddress.asEnterprise()?.getPaymentCredential().type ===
      //     CredentialType.KeyHash
      //     ? cardanoAddress.asEnterprise()!.getPaymentCredential().hash
      //     : "";
      // },
      // resolvePlutusScriptHash: function (bech32: string): string {
      //   const cardanoAddress = toAddress(bech32);
      //   return cardanoAddress.asEnterprise()?.getPaymentCredential().type ===
      //     CredentialType.ScriptHash
      //     ? cardanoAddress.asEnterprise()!.getPaymentCredential().hash
      //     : "";
      // },
      resolveStakeKeyHash: function(bech32) {
        const cardanoAddress = toAddress(bech32);
        return cardanoAddress.asReward()?.getPaymentCredential().type === CredentialType.KeyHash ? cardanoAddress.asReward().getPaymentCredential().hash : "";
      },
      // resolveStakeScriptHash(bech32: string): string {
      //   const cardanoAddress = toAddress(bech32);
      //   return cardanoAddress.asReward()?.getPaymentCredential().type ===
      //     CredentialType.ScriptHash
      //     ? cardanoAddress.asReward()!.getPaymentCredential().hash
      //     : "";
      // },
      resolvePrivateKey: function(words) {
        throw new Error("Function not implemented.");
      },
      resolveRewardAddress: function(bech32) {
        throw new Error("Function not implemented.");
      },
      resolveEd25519KeyHash: function(bech32) {
        throw new Error("Function not implemented.");
      }
    },
    tx: {
      resolveTxHash: function(txHex) {
        return Transaction.fromCbor((0, import_core6.TxCBOR)(txHex)).getId();
      }
    },
    data: {
      resolveDataHash: function(data) {
        throw new Error("Function not implemented.");
      }
    },
    script: {
      // resolveNativeScript: function (script: CommonNativeScript): string {
      //   return toNativeScript(script).toCbor();
      // },
      resolveScriptRef: function(script) {
        throw new Error("Function not implemented.");
      }
    }
  };
  serializeTxBody = (txBuilderBody, protocolParams) => {
    const {
      inputs,
      outputs,
      collaterals,
      referenceInputs,
      mints,
      changeAddress,
      // certificates,
      validityRange,
      requiredSignatures
      // metadata,
    } = txBuilderBody;
    mints.sort((a, b) => a.policyId.localeCompare(b.policyId));
    inputs.sort((a, b) => {
      if (a.txIn.txHash === b.txIn.txHash) {
        return a.txIn.txIndex - b.txIn.txIndex;
      } else {
        return a.txIn.txHash.localeCompare(b.txIn.txHash);
      }
    });
    this.addAllInputs(inputs);
    this.addAllOutputs(outputs);
    this.addAllMints(mints);
    this.addAllCollateralInputs(collaterals);
    this.addAllReferenceInputs(referenceInputs);
    this.setValidityInterval(validityRange);
    this.buildWitnessSet();
    this.balanceTx(changeAddress, requiredSignatures.length, protocolParams);
    return new Transaction(this.txBody, this.txWitnessSet).toCbor();
  };
  addSigningKeys = (txHex, signingKeys) => {
    let cardanoTx = Transaction.fromCbor((0, import_core6.TxCBOR)(txHex));
    let currentWitnessSet = cardanoTx.witnessSet();
    let currentWitnessSetVkeys = currentWitnessSet.vkeys();
    let currentWitnessSetVkeysValues = currentWitnessSetVkeys ? [...currentWitnessSetVkeys.values()] : [];
    for (let i = 0; i < signingKeys.length; i++) {
      let keyHex = signingKeys[i];
      if (keyHex) {
        if (keyHex.length === 68 && keyHex.substring(0, 4) === "5820") {
          keyHex = keyHex.substring(4);
        }
        const cardanoSigner = StricaPrivateKey.fromSecretKey(
          Buffer.from(keyHex, "hex")
        );
        const signature = cardanoSigner.sign(
          Buffer.from(cardanoTx.getId(), "hex")
        );
        currentWitnessSetVkeysValues.push(
          new VkeyWitness(
            Ed25519PublicKeyHex2(
              cardanoSigner.toPublicKey().toBytes().toString("hex")
            ),
            Ed25519SignatureHex2(signature.toString("hex"))
          )
        );
      }
    }
    currentWitnessSet.setVkeys(
      import_core6.Serialization.CborSet.fromCore(
        currentWitnessSetVkeysValues.map((vkw) => vkw.toCore()),
        VkeyWitness.fromCore
      )
    );
    cardanoTx.setWitnessSet(currentWitnessSet);
    return cardanoTx.toCbor();
  };
  addAllInputs = (inputs) => {
    for (let i = 0; i < inputs.length; i += 1) {
      const currentTxIn = inputs[i];
      if (!currentTxIn) continue;
      switch (currentTxIn.type) {
        case "PubKey":
          this.addTxIn(currentTxIn);
          break;
        case "Script":
          this.addScriptTxIn(
            currentTxIn
          );
          break;
        case "SimpleScript":
          this.addSimpleScriptTxIn(
            currentTxIn
          );
      }
    }
  };
  addTxIn = (currentTxIn) => {
    let cardanoTxIn = new TransactionInput(
      TransactionId(currentTxIn.txIn.txHash),
      BigInt(currentTxIn.txIn.txIndex)
    );
    const inputs = this.txBody.inputs();
    const txInputsList = [...inputs.values()];
    if (txInputsList.find((input) => {
      input.index() == cardanoTxIn.index() && input.transactionId == cardanoTxIn.transactionId;
    })) {
      throw new Error("Duplicate input added to tx body");
    }
    txInputsList.push(cardanoTxIn);
    inputs.setValues(txInputsList);
    const cardanoTxOut = new TransactionOutput(
      Address.fromBech32(currentTxIn.txIn.address),
      toValue(currentTxIn.txIn.amount)
    );
    this.utxoContext.set(cardanoTxIn, cardanoTxOut);
    this.txBody.setInputs(inputs);
  };
  addScriptTxIn = (currentTxIn) => {
    this.addTxIn({
      type: "PubKey",
      txIn: currentTxIn.txIn
    });
    if (!currentTxIn.scriptTxIn.scriptSource) {
      throw new Error("A script input had no script source");
    }
    if (!currentTxIn.scriptTxIn.datumSource) {
      throw new Error("A script input had no datum source");
    }
    if (!currentTxIn.scriptTxIn.redeemer) {
      throw new Error("A script input had no redeemer");
    }
    if (currentTxIn.scriptTxIn.scriptSource.type === "Provided") {
      switch (currentTxIn.scriptTxIn.scriptSource.script.version) {
        case "V1": {
          this.scriptsProvided.add(
            Script.newPlutusV1Script(
              PlutusV1Script.fromCbor(
                (0, import_util7.HexBlob)(currentTxIn.scriptTxIn.scriptSource.script.code)
              )
            )
          );
          this.usedLanguages[PlutusLanguageVersion.V1] = true;
          break;
        }
        case "V2": {
          this.scriptsProvided.add(
            Script.newPlutusV2Script(
              PlutusV2Script.fromCbor(
                (0, import_util7.HexBlob)(currentTxIn.scriptTxIn.scriptSource.script.code)
              )
            )
          );
          this.usedLanguages[PlutusLanguageVersion.V2] = true;
          break;
        }
        case "V3": {
          this.scriptsProvided.add(
            Script.newPlutusV3Script(
              PlutusV3Script.fromCbor(
                (0, import_util7.HexBlob)(currentTxIn.scriptTxIn.scriptSource.script.code)
              )
            )
          );
          this.usedLanguages[PlutusLanguageVersion.V3] = true;
          break;
        }
      }
    } else if (currentTxIn.scriptTxIn.scriptSource.type === "Inline") {
      let referenceInputs = this.txBody.referenceInputs() ?? import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore);
      let referenceInputsList = [...referenceInputs.values()];
      referenceInputsList.push(
        new TransactionInput(
          TransactionId(currentTxIn.scriptTxIn.scriptSource.txHash),
          BigInt(currentTxIn.scriptTxIn.scriptSource.txIndex)
        )
      );
      referenceInputs.setValues(referenceInputsList);
      this.txBody.setReferenceInputs(referenceInputs);
      switch (currentTxIn.scriptTxIn.scriptSource.version) {
        case "V1": {
          this.usedLanguages[PlutusLanguageVersion.V1] = true;
          break;
        }
        case "V2": {
          this.usedLanguages[PlutusLanguageVersion.V2] = true;
          break;
        }
        case "V3": {
          this.usedLanguages[PlutusLanguageVersion.V3] = true;
          break;
        }
      }
    }
    if (currentTxIn.scriptTxIn.datumSource.type === "Provided") {
      this.datumsProvided.add(
        toPlutusData(currentTxIn.scriptTxIn.datumSource.data.content)
        // TODO: handle json / raw datum
      );
    } else if (currentTxIn.scriptTxIn.datumSource.type === "Inline") {
      let referenceInputs = this.txBody.referenceInputs() ?? import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore);
      let referenceInputsList = [...referenceInputs.values()];
      referenceInputsList.push(
        new TransactionInput(
          TransactionId(currentTxIn.txIn.txHash),
          BigInt(currentTxIn.txIn.txIndex)
        )
      );
      referenceInputs.setValues(referenceInputsList);
      this.txBody.setReferenceInputs(referenceInputs);
    }
    let cardanoTxIn = new TransactionInput(
      TransactionId(currentTxIn.txIn.txHash),
      BigInt(currentTxIn.txIn.txIndex)
    );
    let exUnits = currentTxIn.scriptTxIn.redeemer.exUnits;
    this.redeemerContext.set(
      cardanoTxIn,
      new Redeemer(
        RedeemerTag.Spend,
        BigInt(0),
        toPlutusData(currentTxIn.scriptTxIn.redeemer.data.content),
        // TODO: handle json / raw datum
        new ExUnits(BigInt(exUnits.mem), BigInt(exUnits.steps))
      )
    );
  };
  addSimpleScriptTxIn = (currentTxIn) => {
    this.addTxIn({
      type: "PubKey",
      txIn: currentTxIn.txIn
    });
    if (!currentTxIn.simpleScriptTxIn.scriptSource) {
      throw new Error("A native script input had no script source");
    }
    if (currentTxIn.simpleScriptTxIn.scriptSource.type === "Provided") {
      this.scriptsProvided.add(
        Script.newNativeScript(
          NativeScript.fromCbor(
            (0, import_util7.HexBlob)(currentTxIn.simpleScriptTxIn.scriptSource.script)
          )
        )
      );
    } else if (currentTxIn.simpleScriptTxIn.scriptSource.type === "Inline" && currentTxIn.simpleScriptTxIn.scriptSource.txInInfo.type === "Inline") {
      let referenceInputs = this.txBody.referenceInputs() ?? import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore);
      let referenceInputsList = [...referenceInputs.values()];
      referenceInputsList.push(
        new TransactionInput(
          TransactionId(
            currentTxIn.simpleScriptTxIn.scriptSource.txInInfo.txHash
          ),
          BigInt(currentTxIn.simpleScriptTxIn.scriptSource.txInInfo.txIndex)
        )
      );
      referenceInputs.setValues(referenceInputsList);
      this.txBody.setReferenceInputs(referenceInputs);
    }
  };
  addAllOutputs = (outputs) => {
    for (let i = 0; i < outputs.length; i++) {
      this.addOutput(outputs[i]);
    }
  };
  addOutput = (output) => {
    const currentOutputs = this.txBody.outputs();
    const cardanoOutput = new TransactionOutput(
      Address.fromBech32(output.address),
      toValue(output.amount)
    );
    if (output.datum?.type === "Hash") {
      cardanoOutput.setDatum(
        Datum.newDataHash(
          DatumHash.fromHexBlob(
            (0, import_util7.HexBlob)(toPlutusData(output.datum.data.content).hash())
          )
        )
      );
    } else if (output.datum?.type === "Inline") {
      cardanoOutput.setDatum(
        Datum.newInlineData(
          toPlutusData(output.datum.data.content)
          // TODO: handle json / raw datum
        )
      );
    }
    if (output.referenceScript) {
      switch (output.referenceScript.version) {
        case "V1": {
          cardanoOutput.setScriptRef(
            Script.newPlutusV1Script(
              PlutusV1Script.fromCbor((0, import_util7.HexBlob)(output.referenceScript.code))
            )
          );
          break;
        }
        case "V2": {
          cardanoOutput.setScriptRef(
            Script.newPlutusV2Script(
              PlutusV2Script.fromCbor((0, import_util7.HexBlob)(output.referenceScript.code))
            )
          );
          break;
        }
        case "V3": {
          cardanoOutput.setScriptRef(
            Script.newPlutusV3Script(
              PlutusV3Script.fromCbor((0, import_util7.HexBlob)(output.referenceScript.code))
            )
          );
          break;
        }
      }
    }
    currentOutputs.push(cardanoOutput);
    this.txBody.setOutputs(currentOutputs);
  };
  addAllReferenceInputs = (refInputs) => {
    for (let i = 0; i < refInputs.length; i++) {
      this.addReferenceIput(refInputs[i]);
    }
  };
  addReferenceIput = (refInput) => {
    let referenceInputs = this.txBody.referenceInputs() ?? import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore);
    let referenceInputsList = [...referenceInputs.values()];
    referenceInputsList.push(
      new TransactionInput(
        TransactionId.fromHexBlob((0, import_util7.HexBlob)(refInput.txHash)),
        BigInt(refInput.txIndex)
      )
    );
    referenceInputs.setValues(referenceInputsList);
    this.txBody.setReferenceInputs(referenceInputs);
  };
  addAllMints = (mints) => {
    for (let i = 0; i < mints.length; i++) {
      this.addMint(mints[i]);
    }
  };
  addMint = (mint) => {
    const currentMint = this.txBody.mint() ?? /* @__PURE__ */ new Map();
    const mintAssetId = mint.policyId + mint.assetName;
    for (const asset of currentMint.keys()) {
      if (asset.toString() == mintAssetId) {
        throw new Error("The same asset is already in the mint field");
      }
    }
    currentMint.set(
      AssetId.fromParts(PolicyId(mint.policyId), AssetName(mint.assetName)),
      BigInt(mint.amount)
    );
    this.txBody.setMint(currentMint);
    if (mint.type === "Native") {
      if (!mint.scriptSource)
        throw new Error("Script source not provided for native script mint");
      const nativeScriptSource = mint.scriptSource;
      if (!nativeScriptSource)
        throw new Error(
          "A script source for a native script was not a native script somehow"
        );
      if (nativeScriptSource.type === "Provided") {
        this.scriptsProvided.add(
          Script.newNativeScript(
            NativeScript.fromCbor((0, import_util7.HexBlob)(nativeScriptSource.scriptCode))
          )
        );
      } else if (nativeScriptSource.type === "Inline") {
        let referenceInputs = this.txBody.referenceInputs() ?? import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore);
        let referenceInputsList = [...referenceInputs.values()];
        referenceInputsList.push(
          new TransactionInput(
            TransactionId(nativeScriptSource.txHash),
            BigInt(nativeScriptSource.txIndex)
          )
        );
        referenceInputs.setValues(referenceInputsList);
        this.txBody.setReferenceInputs(referenceInputs);
      }
    } else if (mint.type === "Plutus") {
      if (!mint.scriptSource)
        throw new Error("Script source not provided for plutus script mint");
      const plutusScriptSource = mint.scriptSource;
      if (!plutusScriptSource) {
        throw new Error(
          "A script source for a plutus mint was not plutus script somehow"
        );
      }
      if (plutusScriptSource.type === "Provided") {
        switch (plutusScriptSource.script.version) {
          case "V1":
            this.scriptsProvided.add(
              Script.newPlutusV1Script(
                PlutusV1Script.fromCbor(
                  (0, import_util7.HexBlob)(plutusScriptSource.script.code)
                )
              )
            );
            break;
          case "V2":
            this.scriptsProvided.add(
              Script.newPlutusV2Script(
                PlutusV2Script.fromCbor(
                  (0, import_util7.HexBlob)(plutusScriptSource.script.code)
                )
              )
            );
            break;
          case "V3":
            this.scriptsProvided.add(
              Script.newPlutusV3Script(
                PlutusV3Script.fromCbor(
                  (0, import_util7.HexBlob)(plutusScriptSource.script.code)
                )
              )
            );
            break;
        }
      } else if (plutusScriptSource.type === "Inline") {
        let referenceInputs = this.txBody.referenceInputs() ?? import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore);
        let referenceInputsList = [...referenceInputs.values()];
        referenceInputsList.push(
          new TransactionInput(
            TransactionId(plutusScriptSource.txHash),
            BigInt(plutusScriptSource.txIndex)
          )
        );
        referenceInputs.setValues(referenceInputsList);
        this.txBody.setReferenceInputs(referenceInputs);
        switch (plutusScriptSource.version) {
          case "V1": {
            this.usedLanguages[PlutusLanguageVersion.V1] = true;
            break;
          }
          case "V2": {
            this.usedLanguages[PlutusLanguageVersion.V2] = true;
            break;
          }
          case "V3": {
            this.usedLanguages[PlutusLanguageVersion.V3] = true;
            break;
          }
        }
      }
    }
  };
  addAllCollateralInputs = (collaterals) => {
    for (let i = 0; i < collaterals.length; i++) {
      this.addCollateralInput(
        collaterals[i]
      );
    }
  };
  addCollateralInput = (collateral) => {
    let cardanoTxIn = new TransactionInput(
      TransactionId(collateral.txIn.txHash),
      BigInt(collateral.txIn.txIndex)
    );
    const collateralInputs = this.txBody.collateral() ?? import_core6.Serialization.CborSet.fromCore([], TransactionInput.fromCore);
    const collateralInputsList = [
      ...collateralInputs.values()
    ];
    if (collateralInputsList.find((input) => {
      input.index() == cardanoTxIn.index() && input.transactionId == cardanoTxIn.transactionId;
    })) {
      throw new Error("Duplicate input added to tx body");
    }
    collateralInputsList.push(cardanoTxIn);
    collateralInputs.setValues(collateralInputsList);
    const cardanoTxOut = new TransactionOutput(
      Address.fromBech32(collateral.txIn.address),
      toValue(collateral.txIn.amount)
    );
    this.utxoContext.set(cardanoTxIn, cardanoTxOut);
    this.txBody.setCollateral(collateralInputs);
  };
  setValidityInterval = (validity) => {
    if (validity.invalidBefore) {
      this.txBody.setValidityStartInterval(Slot(validity.invalidBefore));
    }
    if (validity.invalidHereafter) {
      this.txBody.setTtl(Slot(validity.invalidHereafter));
    }
  };
  buildWitnessSet = () => {
    const inputs = this.txBody.inputs();
    for (let i = 0; i < inputs.size(); i += 1) {
      const input = inputs.values().at(i);
      if (input) {
        let redeemer = this.redeemerContext.get(input);
        if (redeemer) {
          redeemer.setIndex(BigInt(i));
        }
      }
    }
    let redeemers = this.txWitnessSet.redeemers() ?? Redeemers.fromCore([]);
    let redeemersList = [...redeemers.values()];
    this.redeemerContext.forEach((redeemer) => {
      redeemersList.push(redeemer);
    });
    redeemers.setValues(redeemersList);
    this.txWitnessSet.setRedeemers(redeemers);
    let nativeScripts = this.txWitnessSet.nativeScripts() ?? import_core6.Serialization.CborSet.fromCore([], NativeScript.fromCore);
    let v1Scripts = this.txWitnessSet.plutusV1Scripts() ?? import_core6.Serialization.CborSet.fromCore([], PlutusV1Script.fromCore);
    let v2Scripts = this.txWitnessSet.plutusV2Scripts() ?? import_core6.Serialization.CborSet.fromCore([], PlutusV2Script.fromCore);
    let v3Scripts = this.txWitnessSet.plutusV3Scripts() ?? import_core6.Serialization.CborSet.fromCore([], PlutusV3Script.fromCore);
    this.scriptsProvided.forEach((script) => {
      if (script.asNative() !== void 0) {
        let nativeScriptsList = [...nativeScripts.values()];
        nativeScriptsList.push(script.asNative());
        nativeScripts.setValues(nativeScriptsList);
      } else if (script.asPlutusV1() !== void 0) {
        let v1ScriptsList = [...v1Scripts.values()];
        v1ScriptsList.push(script.asPlutusV1());
        v1Scripts.setValues(v1ScriptsList);
      } else if (script.asPlutusV2() !== void 0) {
        let v2ScriptsList = [...v2Scripts.values()];
        v2ScriptsList.push(script.asPlutusV2());
        v2Scripts.setValues(v2ScriptsList);
      } else if (script.asPlutusV3() !== void 0) {
        let v3ScriptsList = [...v3Scripts.values()];
        v3ScriptsList.push(script.asPlutusV3());
        v3Scripts.setValues(v3ScriptsList);
      }
      this.txWitnessSet.setNativeScripts(nativeScripts);
      this.txWitnessSet.setPlutusV1Scripts(v1Scripts);
      this.txWitnessSet.setPlutusV2Scripts(v2Scripts);
      this.txWitnessSet.setPlutusV3Scripts(v3Scripts);
    });
    let datums = this.txWitnessSet.plutusData() ?? import_core6.Serialization.CborSet.fromCore([], PlutusData.fromCore);
    this.datumsProvided.forEach((datum) => {
      let datumsList = [...datums.values()];
      datumsList.push(datum);
      datums.setValues(datumsList);
    });
    this.txWitnessSet.setPlutusData(datums);
    let costModelV1 = import_core6.Serialization.CostModel.newPlutusV1(
      import_common5.DEFAULT_V1_COST_MODEL_LIST
    );
    let costModelV2 = import_core6.Serialization.CostModel.newPlutusV2(
      import_common5.DEFAULT_V2_COST_MODEL_LIST
    );
    let costModels = new import_core6.Serialization.Costmdls();
    if (this.usedLanguages[PlutusLanguageVersion.V1]) {
      costModels.insert(costModelV1);
    }
    if (this.usedLanguages[PlutusLanguageVersion.V2]) {
      costModels.insert(costModelV2);
    }
    if (this.usedLanguages[PlutusLanguageVersion.V3]) {
    }
    let scriptDataHash = hashScriptData(
      costModels,
      redeemers.size() > 0 ? [...redeemers.values()] : void 0,
      datums.size() > 0 ? [...datums.values()] : void 0
    );
    if (scriptDataHash) {
      this.txBody.setScriptDataHash(scriptDataHash);
    }
  };
  balanceTx = (changeAddress, numberOfRequiredWitnesses, protocolParams) => {
    if (changeAddress === "") {
      throw new Error("Can't balance tx without a change address");
    }
    const inputs = this.txBody.inputs().values();
    let remainingValue = new Value(BigInt(0));
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      if (!input) {
        throw new Error("Invalid input found");
      }
      const output = this.utxoContext.get(input);
      if (!output) {
        throw new Error(`Unable to resolve input: ${input.toCbor()}`);
      }
      remainingValue = mergeValue(remainingValue, output.amount());
    }
    const withdrawals = this.txBody.withdrawals();
    if (withdrawals) {
      withdrawals.forEach((coin) => {
        remainingValue = mergeValue(remainingValue, new Value(coin));
      });
    }
    remainingValue = mergeValue(
      remainingValue,
      new Value(BigInt(0), this.txBody.mint())
    );
    const currentOutputs = this.txBody.outputs();
    for (let i = 0; i < currentOutputs.length; i++) {
      let output = currentOutputs.at(i);
      if (output) {
        remainingValue = subValue(remainingValue, output.amount());
      }
    }
    if (remainingValue.coin() < 0 || !empty(negatives(remainingValue))) {
      throw new Error(`Not enough funds to satisfy outputs`);
    }
    currentOutputs.push(
      new TransactionOutput(Address.fromBech32(changeAddress), remainingValue)
    );
    this.txBody.setOutputs(currentOutputs);
    this.txBody.setFee(BigInt("10000000"));
    const dummyTx = this.createDummyTx(numberOfRequiredWitnesses);
    const fee = protocolParams.minFeeB + dummyTx.toCbor().length / 2 * Number(protocolParams.coinsPerUtxoSize);
    this.txBody.setFee(BigInt(fee));
    const changeOutput = currentOutputs.pop();
    if (!changeOutput) {
      throw new Error(
        "Somehow the output length was 0 after attempting to calculate fees"
      );
    }
    changeOutput.amount().setCoin(changeOutput.amount().coin() - BigInt(fee));
    currentOutputs.push(changeOutput);
    this.txBody.setOutputs(currentOutputs);
  };
  createDummyTx = (numberOfRequiredWitnesses) => {
    let dummyWitnessSet = new TransactionWitnessSet();
    const dummyVkeyWitnesses = [];
    for (let i = 0; i < numberOfRequiredWitnesses; i++) {
      dummyVkeyWitnesses.push([
        Ed25519PublicKeyHex2("0".repeat(64)),
        Ed25519SignatureHex2("0".repeat(128))
      ]);
    }
    dummyWitnessSet.setVkeys(
      import_core6.Serialization.CborSet.fromCore(dummyVkeyWitnesses, VkeyWitness.fromCore)
    );
    return new Transaction(this.txBody, dummyWitnessSet);
  };
};

// src/index.ts
var CardanoSDKUtil = __toESM(require("@cardano-sdk/util"), 1);
var Crypto3 = __toESM(require("@cardano-sdk/crypto"), 1);
var CardanoSDK = __toESM(require("@cardano-sdk/core"), 1);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Address,
  AddressType,
  AssetFingerprint,
  AssetId,
  AssetName,
  BaseAddress,
  Bip32PrivateKey,
  Bip32PrivateKeyHex,
  Cardano,
  CardanoSDK,
  CardanoSDKSerializer,
  CardanoSDKUtil,
  CborSet,
  CborWriter,
  Certificate,
  CertificateType,
  ConstrPlutusData,
  CoseSign1,
  CostModel,
  Costmdls,
  Credential,
  CredentialType,
  Crypto,
  DRep,
  DRepID,
  Datum,
  DatumHash,
  DatumKind,
  Ed25519KeyHash,
  Ed25519KeyHashHex,
  Ed25519PrivateExtendedKeyHex,
  Ed25519PrivateNormalKeyHex,
  Ed25519PublicKey,
  Ed25519PublicKeyHex,
  Ed25519Signature,
  Ed25519SignatureHex,
  EnterpriseAddress,
  ExUnits,
  Hash,
  Hash28ByteBase16,
  Hash32ByteBase16,
  NativeScript,
  NetworkId,
  PaymentAddress,
  PlutusData,
  PlutusLanguageVersion,
  PlutusList,
  PlutusMap,
  PlutusV1Script,
  PlutusV2Script,
  PlutusV3Script,
  PolicyId,
  PoolId,
  Redeemer,
  RedeemerPurpose,
  RedeemerTag,
  Redeemers,
  RequireAllOf,
  RequireAnyOf,
  RequireNOf,
  RequireSignature,
  RequireTimeAfter,
  RequireTimeBefore,
  RewardAccount,
  RewardAddress,
  Script,
  ScriptHash,
  ScriptPubkey,
  Serialization,
  Slot,
  StakeCredentialStatus,
  StakeDelegation,
  StakeRegistration,
  StricaBip32PrivateKey,
  StricaBip32PrivateKeyType,
  StricaBip32PublicKey,
  StricaBip32PublicKeyType,
  StricaDecoder,
  StricaEncoder,
  StricaPrivateKey,
  StricaPrivateKeyType,
  StricaPublicKey,
  StricaPublicKeyType,
  Transaction,
  TransactionBody,
  TransactionId,
  TransactionInput,
  TransactionOutput,
  TransactionUnspentOutput,
  TransactionWitnessSet,
  Value,
  VkeyWitness,
  VrfVkBech32,
  addressToBech32,
  assetTypes,
  buildBaseAddress,
  buildBip32PrivateKey,
  buildDRepID,
  buildEnterpriseAddress,
  buildKeys,
  buildRewardAddress,
  buildScriptPubkey,
  checkSignature,
  deserializeAddress,
  deserializeDataHash,
  deserializeEd25519KeyHash,
  deserializeNativeScript,
  deserializePlutusData,
  deserializePlutusScript,
  deserializeScriptHash,
  deserializeScriptRef,
  deserializeTx,
  deserializeTxHash,
  deserializeTxUnspentOutput,
  deserializeValue,
  empty,
  fromNativeScript,
  fromScriptRef,
  fromTxUnspentOutput,
  fromValue,
  generateNonce,
  getCoseKeyFromPublicKey,
  getPublicKeyFromCoseKey,
  mergeValue,
  negateValue,
  negatives,
  resolveDataHash,
  resolveNativeScriptAddress,
  resolveNativeScriptHash,
  resolvePaymentKeyHash,
  resolvePlutusScriptAddress,
  resolvePlutusScriptHash,
  resolvePoolId,
  resolvePrivateKey,
  resolveRewardAddress,
  resolveScriptRef,
  resolveStakeKeyHash,
  resolveTxHash,
  signData,
  subValue,
  toAddress,
  toBaseAddress,
  toEnterpriseAddress,
  toNativeScript,
  toPlutusData,
  toRewardAddress,
  toScriptRef,
  toTxUnspentOutput,
  toValue
});
