# 🔑 TokenLens — Zero-Cloud JWT Decoder & WebCrypto Security Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Live Web App](https://img.shields.io/badge/Web_App-tokenlens.grassroot.digital-8b5cf6.svg)](https://tokenlens.grassroot.digital)
[![Author](https://img.shields.io/badge/Author-Rajesh_Narwal-blue.svg)](https://grassroot.digital/#about)
[![GitHub](https://img.shields.io/badge/GitHub-rjnarwal-181717.svg?logo=github)](https://github.com/rjnarwal)

**TokenLens** is an ultra-fast, 100% client-side JWT (JSON Web Token) inspection, signature verification, and claims debugger built with the W3C WebCrypto API.

---

## ✨ Features

- ⚡ **Zero-Cloud Local Inspection**: Your secret keys, private RSA/ECDSA keys, and tokens are computed in volatile RAM and **never leave your machine**.
- 🛡️ **Cryptographic Signature Verification**:
  - `HS256`, `HS384`, `HS512` (HMAC Shared Secret)
  - `RS256`, `RS384`, `RS512` (RSA Public Key / PEM)
  - `ES256`, `ES384`, `ES512` (ECDSA P-256/P-384/P-521)
- ⏱️ **Timestamp & Expiration Inspector**: Visual countdown of `exp`, `nbf`, `iat` with human-readable local time translation.
- 🎨 **Multi-Theme Support**: Dark, Midnight Navy, and Light themes.
- 🖥️ **Desktop Native**: Available for macOS (`.dmg`) and Windows (`.exe`).

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/rjnarwal/tokenlens.git
cd tokenlens

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build production bundle
npm run build
```

---

## 📦 Building Desktop Binaries

```bash
# Build macOS DMG
npm run build:mac

# Build Windows Installer
npm run build:win
```

---

## 📄 License

MIT License © 2026 [Rajesh Narwal](https://grassroot.digital/#about)
