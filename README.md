# ⚙️ Hardhat + Viem + TypeScript Boilerplate

This project provides a **modern Ethereum development environment** using **Hardhat**, **Viem**, and **TypeScript**, offering a fast, type-safe, and developer-friendly foundation for building, testing, and deploying smart contracts.

It includes a **sample smart contract**, an associated **unit test suite**, and a **Hardhat Ignition module** for streamlined and automated deployment.

---

## 🚀 Features

* **🔧 Hardhat Framework** — Comprehensive Ethereum development toolkit for compiling, testing, debugging, and deploying smart contracts.
* **💡 Viem Integration** — A lightweight, modern alternative to Ethers.js, offering improved type safety, performance, and developer ergonomics for on-chain interactions.
* **🧩 TypeScript Support** — Full TypeScript configuration out of the box for strong typing, IntelliSense, and enhanced development reliability.
* **🧪 Built-in Sample Contract & Test Suite** — Includes an example Solidity contract (`Lock.sol`) and a corresponding test file to validate deployment and core logic using Hardhat’s testing environment.
* **🚢 Hardhat Ignition Module** — Simplifies deployment through structured and configurable deployment scripts, ensuring repeatable, deterministic contract deployments.

---

## 📚 References

For additional documentation and configuration details:

* [Hardhat Getting Started Guide](https://hardhat.org/getting-started/)
* [Hardhat TypeScript Guide](https://hardhat.org/guides/typescript.html)
* [Hardhat Testing with VSCode](https://hardhat.org/guides/vscode-tests.html)

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
npm install
```

This will install **Hardhat**, **Viem**, **TypeScript**, and all required plugins and typings for a fully functional development environment.

---

## 🧰 Usage

After installation, you can run the following commands to verify your setup:

### 1. Compile Contracts

Compile all Solidity smart contracts using Hardhat’s built-in compiler:

```bash
npx hardhat compile
```

### 2. Run Tests

Execute the automated test suite to validate contract functionality:

```bash
npx hardhat test
```

### 3. Deploy Contracts (Optional)

Use Hardhat Ignition to deploy your sample contract:

```bash
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

---

## 🧠 Tech Stack

| Layer                  | Technology                 | Purpose                                 |
| :--------------------- | :------------------------- | :-------------------------------------- |
| Smart Contracts        | **Solidity (via Hardhat)** | Core blockchain logic                   |
| Development            | **Hardhat**                | Local Ethereum dev environment          |
| Type Safety            | **TypeScript**             | Strong typing and IDE support           |
| Blockchain Interaction | **Viem**                   | Modern type-safe Ethereum client        |
| Deployment             | **Hardhat Ignition**       | Structured and reproducible deployments |
| Testing                | **Mocha / Chai**           | Contract validation and assertions      |

---

## 🪄 Summary

This boilerplate serves as a **next-generation Ethereum development template**, combining the robustness of **Hardhat** with the **type-safe performance of Viem** and **TypeScript**.
It’s ideal for developers who want a modern, scalable, and production-ready setup for building Web3 applications or smart contract systems.

---

