# HRZN Pay - Modern Bitcoin Payment Wallet

<div align="center">
  <img src="assets/transparent-icon.png" alt="HRZN Pay Logo" width="200" />
</div>

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![](https://img.shields.io/github/license/BlueWallet/BlueWallet.svg)

**HRZN Pay** is a modern Bitcoin payment wallet designed to make sending and receiving Bitcoin as simple and intuitive as PayPal, Cash App, or Venmo. Built for mainstream Bitcoin adoption, HRZN Pay combines the security of a self-custodial wallet with the user experience of modern payment apps.

## About

HRZN Pay is a modern Bitcoin payment wallet that aims to accelerate Bitcoin adoption by making it as easy to use as traditional payment apps. Think of it as the PayPal or Cash App for Bitcoin—simple, fast, and secure.

Built as a fork of [BlueWallet](https://github.com/BlueWallet/BlueWallet) and rebuilt with Expo, HRZN Pay focuses on delivering a seamless payment experience. Whether you're sending Bitcoin to friends, paying for services, or managing your Bitcoin balance, HRZN Pay makes it feel as natural as sending money through any other payment app—but with the power and freedom of Bitcoin.

### Key Features

* **Simple Payment Experience** - Send and receive Bitcoin with the same ease as PayPal, Cash App, or Venmo
* **Self-Custodial Security** - Your private keys never leave your device. You own your Bitcoin.
* **Lightning Network** - Fast, low-cost Bitcoin transactions via the Lightning Network
* **Modern Design** - Beautiful, intuitive interface designed for mainstream adoption
* **SegWit & RBF Support** - Advanced Bitcoin features for optimal transaction efficiency
* **Encryption & Privacy** - Full encryption with plausible deniability for your security
* **Built with Expo** - Modern development stack for rapid iteration and cross-platform compatibility


<img src="https://i.imgur.com/hHYJnMj.png" width="100%">


## BUILD & RUN IT

This project uses **Yarn** for package management and **Expo** for development and builds. Please refer to the engines field in `package.json` for the minimum required Node.js version (currently Node >= 22).

To view the version of Node and Yarn in your environment, run:

```bash
node --version && yarn --version
```

### Prerequisites

* Node.js >= 22
* Yarn package manager
* Expo CLI (installed globally or via npx)
* For iOS: Xcode and CocoaPods
* For Android: Android Studio and Android SDK

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd HRZN-Pay-Mobile-App
```

2. Install dependencies using Yarn:

```bash
yarn install
```

### Running the App

#### Start the Expo Development Server

To start the development server with cache cleared (recommended for first run or after dependency changes):

```bash
npx expo start -c
```

Or using yarn:

```bash
yarn start
```

This will start the Metro bundler and open the Expo DevTools in your browser.

#### Run on Android

1. Connect an Android device via USB with USB debugging enabled, or start an Android emulator
2. From the Expo DevTools, press `a` to open on Android, or run:

```bash
npx expo run:android
```

Or using yarn:

```bash
yarn android
```

#### Run on iOS

1. Make sure you have Xcode installed
2. Install iOS dependencies:

```bash
cd ios && pod install && cd ..
```

3. From the Expo DevTools, press `i` to open on iOS simulator, or run:

```bash
npx expo run:ios
```

Or using yarn:

```bash
yarn ios
```

**Note:** For iOS Simulator, you may need to choose a Rosetta-compatible simulator. In Xcode, navigate to Product → Destination Architectures → Show Both to see compatible simulators.

### Development Commands

* `yarn start` or `npx expo start` - Start the Expo development server
* `yarn start -c` or `npx expo start -c` - Start with cache cleared
* `yarn android` or `npx expo run:android` - Run on Android
* `yarn ios` or `npx expo run:ios` - Run on iOS

## TESTS

```bash
yarn test
```

## WANT TO CONTRIBUTE?

Contributions are welcome! HRZN Pay is a fork of BlueWallet that's been rebuilt with Expo and redesigned as a modern payment wallet. We're building the future of Bitcoin payments, and your contributions help make Bitcoin more accessible to everyone. Feel free to submit issues and pull requests.

## Based on BlueWallet

HRZN Pay is built on top of [BlueWallet](https://github.com/BlueWallet/BlueWallet), an open-source Bitcoin wallet. We've converted it to use Expo, redesigned it for a modern payment experience, and are adding new features focused on making Bitcoin payments as simple as traditional payment apps.

Original BlueWallet resources:
* Website: [bluewallet.io](https://bluewallet.io)
* Community: [telegram group](https://t.me/bluewallet)

## LICENSE

MIT

## RESPONSIBLE DISCLOSURE

Found critical bugs/vulnerabilities? Please report them through the appropriate channels or open an issue.
Thanks!
