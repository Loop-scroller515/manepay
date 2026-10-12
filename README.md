# manepay⚡💳

> *Empowering commerce everywhere—even where the signal stops.*

---

## Problem Statement

Everyday, thousands if not millions of people struggle or get "payment anxiety" when they make an online payment to a merchant and the screen just buffers around without the assurance of whether the payment has been made or not, this is true in situations where there is little to no internet available either due to their geographical location, network traffic in the area, and other reasons. Hence, we felt the ultimate need to build an app which tackles this problem by allowing users to pay to merchants offline(i.e., without the use of internet) and also allows the merchant to keep a digital ledger for their business, which they could use for their future financial references.

---

## 🌟 Features

* **🌐 100% Offline Capability:** Process transactions seamlessly in remote areas, underground markets, flights, or during major network outages without dropping a single sale.
* **⚡ Lightning-Fast Local Handshakes:** Complete a secure payment in under 2 seconds using optimized **Bluetooth Low Energy (BLE)** and **NFC tap-to-pay** protocols.
* **🛡️ Tamper-Proof Cryptography:** Advanced asymmetric encryption and pre-signed token certificates eliminate double-spending risks while keeping user funds secure offline.
* **🔄 Smart Auto-Reconciliation:** No manual bookkeeping needed! The app automatically detects returning network connectivity and securely syncs all pending offline ledgers to the cloud.
* **📊 Real-Time Merchant Ledger:** Track pending offline balances, completed settlements, and daily sales totals instantly on an intuitive local dashboard.
* **🔋 Ultra-Low Power Consumption:** Engineered to run efficiently on budget smartphones without draining the device's battery during active peer-to-peer broadcasting.

---

## 🚀 Overview

**ManePay** is a decentralized, peer-to-peer payment gateway designed for merchants and users operating in regions with little to no cellular or internet coverage. By bridging the gap between local device communication and backend banking infrastructure, OfflinePay ensures that business never has to pause due to infrastructure failures.

---

## 🛠️ Tech Stack

* **Frontend Mobile:** React Native (Cross-platform iOS & Android)
* **Local Connectivity:** BLE (`nearby_connections`), NFC (`nfc_manager`)
* **Security & Crypto:** ECDSA Cryptographic Signatures & Secure Enclave / Keystore
* **Local Storage:** Hive / SQLite for encrypted offline ledgers
* **Backend Sync:** Node.js / FastAPI with REST endpoints for transaction reconciliation

---

## ⚙️ How It Works

```text
[ Merchant App ]  ---( Broadcasts BLE/NFC Beacon )--->  [ Customer App ]
      ^                                                         |
      |                                              ( Enters Amount & Signs Token )
      |<---( Transfers Cryptographic Token Securely )-----------|
      |
[ Local Verification & Instant Success ] 
      |
      +---( Auto-Syncs to Cloud once Internet is Restored )---> [ Bank Settlement ]
