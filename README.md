# Vault by HRZN BTC - A Bitcoin & Lightning Wallet

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![](https://img.shields.io/github/license/BlueWallet/BlueWallet.svg)

**Vault by HRZN BTC** is a fork of the popular [BlueWallet](https://github.com/BlueWallet/BlueWallet) mobile wallet, rebuilt with Expo and enhanced with a modern design and new features.

## About

This project is a fork of BlueWallet, a thin Bitcoin wallet built with React Native and Electrum. Vault has been converted to use Expo, providing improved developer experience, easier builds, and enhanced cross-platform compatibility. The app includes a refreshed design and will feature new functionality beyond the original BlueWallet.

### Key Features

* Private keys never leave your device
* Lightning Network supported
* SegWit-first. Replace-By-Fee support
* Encryption. Plausible deniability
* Modern UI/UX design
* Built with Expo for enhanced development workflow
* New features and improvements coming soon


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
cd Vault-HRZN-BTC-App
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

Contributions are welcome! This is a fork of BlueWallet that's been enhanced with Expo and new features. Feel free to submit issues and pull requests.

## Based on BlueWallet

This project is a fork of [BlueWallet](https://github.com/BlueWallet/BlueWallet), an open-source Bitcoin wallet. We've converted it to use Expo and are adding new features and design improvements.

Original BlueWallet resources:
* Website: [bluewallet.io](https://bluewallet.io)
* Community: [telegram group](https://t.me/bluewallet)

## LICENSE

MIT

## RESPONSIBLE DISCLOSURE

Found critical bugs/vulnerabilities? Please report them through the appropriate channels or open an issue.
Thanks!
