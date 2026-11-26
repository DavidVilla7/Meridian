# MeridianFix TNS fork for iPod touch 6 / iOS 10.3.3

This repository is a highly device-specific adaptation of [LukeZGD's MeridianFix](https://github.com/LukeZGD/MeridianFix). It targets one particular setup:

- **Device:** iPod touch 6 (iPod7,1, A8)
- **Firmware:** iOS 10.3.3
- **Downgrade:** tethered downgrade using [surrealra1n](https://github.com/pwnerblu/surrealra1n)
- **Jailbreak:** MeridianFix TNS, **Cydia Substrate build**

This is not a general-purpose MeridianFix fork, nor is it intended to support other devices, firmware versions, downgrade methods or jailbreak configurations. The changes and observations documented here are specific to the setup above and have been tested on the target iPod touch 6.

The hosted build is available at:

**https://davidvilla7.github.io/Meridian/**

Use the **Substrate** build. This project does not attempt to make the Substitute build or TNS Sockport work on this device.

## Changes from the original MeridianFix

The starting point for this work is [LukeZGD's MeridianFix repository](https://github.com/LukeZGD/MeridianFix). The following changes adapt its TNS Substrate path and build process to the target device and firmware.

### 1. Defensive kernel-state validation around v0rtex

The source checks the result of `v0rtex()` before continuing with kernel setup. It validates the expected exploit callback state, including a valid `tfp0` port and non-zero kernel base, and checks subsequent kernel task, process and credential reads.

The equivalent defensive checks are also applied to the headless TNS payload.

**Purpose:** prevent the jailbreak from continuing into kernel setup with missing or invalid exploit state after an unsuccessful or incomplete attempt. This is a defensive failure-path and stability improvement. It does not replace or modify the v0rtex exploit itself, and it does not guarantee a higher activation success rate.

### 2. Restore Cydia Substrate startup in the headless TNS payload

The original standalone Meridian startup path explicitly launches `/usr/libexec/substrate` when tweaks are enabled. The headless TNS path used by the hosted page did not perform that startup step.

The build workflow now patches the headless TNS source to launch Cydia Substrate when `TweaksEnabled` is true, check that the executable exists, and stop activation with an error if Substrate fails to start.

**Purpose:** make the hosted TNS activation path start Substrate, rather than merely preparing tweak directories and links. This was a significant functional difference between the standalone and headless TNS paths. After this change, Game Player opened again, and AppSync has also worked immediately after a fresh reboot and jailbreak activation in the latest device test. Those observations are encouraging, although they do not establish that every tweak or injection target will always work.

### 3. Custom arm64 TNS payload

The hosted page uses an arm64 payload built from the TNS build system, with the device-specific kernel-state checks and Substrate startup patch applied during the build.

**Purpose:** ensure that the hosted page runs the adapted payload rather than an unmodified upstream binary.

### 4. iOS 10 compatibility shim

The build adds an Objective-C compatibility shim for compiler availability-check entry points, using Foundation's `NSProcessInfo` operating-system version API.

Newer compiler runtimes can reference dyld availability functionality that is not present on older iOS releases. The shim supplies the required version checks for the iOS 10-targeted payload.

**Purpose:** allow the payload to be built with the selected Xcode toolchain while remaining compatible with the older iOS runtime. This addresses build/runtime compatibility, not the jailbreak exploit.

### 5. Build only the required libcurl library

The TNS build compiles the libcurl library without also building the unused curl command-line executable.

**Purpose:** avoid an unnecessary target and unrelated linker failures involving macOS Security/SecureTransport symbols.

### 6. Automated build and deployment workflow

The GitHub Actions workflow:

- Checks out this repository and the upstream TNS build system.
- Applies the kernel-state guard and Substrate-startup patches to the headless TNS source.
- Selects the required Xcode toolchain and applies the iOS 10 compatibility shim.
- Builds the arm64 JIT payload and only the required libcurl library.
- Verifies the payload and deploys it to the `gh-pages` branch.
- Updates the app-cache version marker so clients fetch the rebuilt payload.

**Purpose:** make the hosted payload reproducible and reduce the risk of testing an outdated cached build.

## Current build and deployment

- **Source branch:** `substrate`
- **Deployment branch:** `gh-pages`
- **Hosted page:** https://davidvilla7.github.io/Meridian/
- **Build workflow:** `.github/workflows/build-tns-payload.yml`

The current hosted build includes the changes described above, including the headless TNS Substrate-startup fix.

## Device testing and current observations

Testing is being performed on the specific iPod touch 6 / iOS 10.3.3 / surrealra1n setup described above.

Current observations:

- The hosted jailbreak has activated successfully in repeated Safari-based tests. Activation attempts are not perfectly consistent, and the available sample is too small to make a reliable statistical claim about the success rate.
- The device previously remained powered on for several consecutive days without spontaneous reboots during normal use and idle periods.
- Safari is the preferred way to launch the hosted jailbreak. A Home Screen shortcut failed in a recorded test.
- Following the Substrate-startup change, Game Player opened again. The earlier Game Player and GameGem problems are no longer being tracked as known current issues.
- In the latest clean reboot test, the device was booted through surrealra1n, activated using the hosted build, and an IPA installed successfully through AppSync on the first attempt.

These are observations from one test device and its current configuration, not guarantees for other devices or installations.

## Known issues and limitations

### Veteris

Some Veteris versions have exhibited crashes or other problems in this downgraded and jailbroken environment. The working assumption is that these issues involve the interaction between the iOS 10.3.3 downgraded environment and the jailbreak environment, but the precise cause has not been isolated.

For this setup, the currently preferred combination is **Veteris 3.2.2 with Veteris Helper 1.1**. Using these downgraded versions is recommended over the newer versions that have caused problems during testing.

### AppSync Unified

AppSync behaviour has been inconsistent. At times, after activating the jailbreak, AppSync is installed but IPA installation fails during signature verification. In those cases, the workaround that has restored functionality is:

1. Uninstall AppSync Unified.
2. Respring.
3. Install AppSync Unified again.
4. Respring again.

However, this behaviour is not consistently reproducible. On some subsequent boots and jailbreak activations, AppSync works without being reinstalled. In the latest clean reboot test, AppSync worked on the first IPA installation attempt.

The issue has been observed across multiple AppSync versions and builds, so it is not currently attributed to a particular package version. Its underlying cause has not been established. It may involve the interaction between AppSync, `installd` and the jailbreak's injection/startup environment; further evidence is needed before assigning the cause to AppSync or Meridian.

## Base project and credits

This repository is based on [LukeZGD's MeridianFix](https://github.com/LukeZGD/MeridianFix). Credit for the original MeridianFix project and its underlying work belongs to **[LukeZGD](https://github.com/LukeZGD)**.

The changes in this repository are a narrow adaptation for the iPod touch 6 (A8) running iOS 10.3.3 after a tethered downgrade with surrealra1n. They should not be taken as a general replacement for, or a claim of broader compatibility than, the original project.

## Building

The hosted TNS payload is built by the GitHub Actions workflow at `.github/workflows/build-tns-payload.yml`. The workflow checks out the TNS build system, applies the documented device-specific patches and compatibility shim, builds the arm64 payload, and deploys it to `gh-pages`.

For the original MeridianFix documentation, supported device/firmware combinations and general usage information, refer to [LukeZGD's upstream repository](https://github.com/LukeZGD/MeridianFix).
