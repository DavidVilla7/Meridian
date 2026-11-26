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

The original standalone MeridianFix already checked the return value from `v0rtex()`, but its `runV0rtex()` function attempted the subsequent kernel reads before the caller acted on that return value. This fork moves the success check ahead of those reads. It also validates the exploit callback state, including a valid `tfp0` port and non-zero kernel base, and checks each subsequent kernel task, process and credential read.

Equivalent defensive checks are applied to the headless TNS payload during the build.

These checks prevent kernel setup from continuing with missing or invalid exploit state after an unsuccessful or incomplete attempt. The change improves the ordering and validation of the failure path; it does not replace or modify the v0rtex exploit itself, and it does not guarantee a higher activation success rate.

### 2. Device-specific TNS payload build

The upstream TNS build system already targets arm64, which is the architecture required by the iPod touch 6. The arm64 architecture itself is therefore not a new contribution of this fork.

What this repository adds is an automated build of that payload with the device-specific kernel-state checks applied before compilation, followed by deployment to the hosted page.

As a result, the hosted page runs the adapted, rebuilt payload rather than an unmodified upstream TNS payload.

### 3. iOS 10 compatibility shim

The build adds an Objective-C compatibility shim for compiler availability-check entry points, using Foundation's `NSProcessInfo` operating-system version API.

Newer compiler runtimes can reference dyld availability functionality that is not present on older iOS releases. The shim supplies the required version checks for the iOS 10-targeted payload.

This lets the payload be built with the selected Xcode toolchain while remaining compatible with the older iOS runtime. It addresses build/runtime compatibility, not the jailbreak exploit.

### 4. Build only the required libcurl library

The TNS build compiles the libcurl library without also building the unused curl command-line executable.

Building only the library avoids an unnecessary target and the unrelated linker failures involving macOS Security/SecureTransport symbols.

### 5. Automated build and deployment workflow

The GitHub Actions workflow:

- Checks out this repository and the upstream TNS build system.
- Applies the kernel-state guard patch to the headless TNS source.
- Selects the required Xcode toolchain and applies the iOS 10 compatibility shim.
- Builds the arm64 JIT payload and only the required libcurl library.
- Verifies the payload and deploys it to the `gh-pages` branch.
- Updates the app-cache version marker so clients fetch the rebuilt payload.

The workflow makes the hosted payload reproducible and reduces the risk of testing an outdated cached build.

## Current build and deployment

- **Source branch:** `substrate`
- **Deployment branch:** `gh-pages`
- **Hosted page:** https://davidvilla7.github.io/Meridian/
- **Build workflow:** `.github/workflows/build-tns-payload.yml`

The current hosted build includes the changes described above.

## Objectives, device testing and current observations

This fork was developed to address the reliability problems experienced with the original MeridianFix on the target iPod touch 6 running iOS 10.3.3 after a tethered downgrade with surrealra1n.

With the original setup, jailbreak activation attempts failed frequently. Even when the device reached a jailbroken state, spontaneous reboots were common: they could happen as soon as around ten minutes after activation or only after one or two days. Keeping the device running reliably for more than 24 hours was extremely difficult, and successful, sustained sessions were rare.

The main objectives of this adaptation are to make jailbreak activation more dependable on this specific setup and, particularly, to improve stability and prevent the spontaneous reboots that made the original configuration so unreliable.

Testing is being performed on the specific iPod touch 6 / iOS 10.3.3 / surrealra1n setup described above.

Current observations:

- Activation attempts are still not perfectly consistent, and the available test sample is too small to support a reliable statistical claim about the success rate. However, the success rate has subjectively improved significantly compared with the original setup.
- No spontaneous or automatic reboots have been observed during the extended testing of this fork. The device has remained running for more than 10 days without rebooting. Testing has not been carried out consistently beyond that period, so no claim is made about longer uptimes.
- Safari is the preferred way to launch the hosted jailbreak. In testing, launching it through a Home Screen shortcut tended to have a higher failure rate than opening the hosted page directly in Safari.

These are observations from one test device and its current configuration, not guarantees for other devices or installations.

## Known issues and limitations

### Veteris

Some Veteris versions have exhibited crashes or other problems in this downgraded and jailbroken environment. The working assumption is that these issues involve the interaction between the iOS 10.3.3 downgraded environment and the jailbreak environment, but the precise cause has not been isolated.

For this setup, the currently preferred combination is **Veteris 3.2.2 with Veteris Helper 1.1**. Using these downgraded versions is recommended over the newer versions that have caused problems during testing.

### AppSync Unified

AppSync behaviour has been inconsistent. Sometimes it works immediately after entering a jailbroken state, while at other times IPA installation fails during signature verification. When this happens, the workaround that has restored functionality is:

1. Uninstall AppSync Unified.
2. Respring.
3. Install AppSync Unified again.
4. Respring again.

This behaviour is not consistently reproducible. AppSync has been observed to work on some boots without being reinstalled, while on others the uninstall/reinstall and respring sequence has been needed.

The issue has been observed across multiple AppSync versions and builds, so it is not currently attributed to a particular package version. Its underlying cause has not been established. It may involve the interaction between AppSync, `installd` and the jailbreak's injection/startup environment; further evidence is needed before assigning the cause to AppSync or Meridian.

## Building

The hosted payload is built through GitHub Actions. This fork does not use the standalone Xcode project build instructions from the original MeridianFix repository; it builds the headless TNS payload used by the hosted page.

To run the same build in your own copy of this repository:

1. Fork the repository on GitHub, or clone your fork and push it to GitHub.
2. Make sure GitHub Actions is enabled for the repository.
3. In **Settings → Actions → General → Workflow permissions**, allow the workflow to read and write repository contents. The workflow uses the repository's `GITHUB_TOKEN` to deploy the rebuilt payload to `gh-pages`.
4. Open the **Actions** tab and select **Build and deploy TNS payload**.
5. Select **Run workflow** on the `substrate` branch.

The workflow runs on a macOS 15 Intel runner with Xcode 16. It checks out the upstream [totally-not-spyware TNS build system](https://github.com/JakeBlair420/totally-not-spyware), applies the device-specific kernel-state patch, adds the iOS 10 compatibility shim, builds the arm64 JIT payload and required libcurl library, then deploys the result to the `gh-pages` branch.

A successful run updates the hosted payload and its app-cache version marker. The hosted page is then available at https://davidvilla7.github.io/Meridian/ (or the corresponding Pages URL for your own fork, if GitHub Pages is enabled and configured).

The workflow can also run automatically when the build workflow file or the tracked Meridian source path changes on the `substrate` branch. For a manual rebuild without changing those files, use **Run workflow** as described above.

## Base project and credits

This repository is based on [LukeZGD's MeridianFix](https://github.com/LukeZGD/MeridianFix). Credit for the original MeridianFix project and its underlying work belongs to **[LukeZGD](https://github.com/LukeZGD)**.

The changes in this repository are a narrow adaptation for the iPod touch 6 (A8) running iOS 10.3.3 after a tethered downgrade with surrealra1n. They should not be taken as a general replacement for, or a claim of broader compatibility than, the original project.
