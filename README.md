# MeridianFix - iPod touch 6 / iOS 10.3.3 fork

This fork is focused on improving the **jailbreak activation success rate and post-activation reliability on the iPod touch 6 (iPod7,1 / A8)** after a tethered downgrade to **iOS 10.3.3 using [surrealra1n](https://github.com/pwnerblu/surrealra1n)**.

The work is device- and firmware-focused. It is not a claim that Meridian's underlying exploit has been replaced or that every iOS 10 device will benefit equally. Changes are being tested on real iPod touch 6 hardware, with the aim of making the existing Meridian/TNS workflow more reliable and safer when an exploit attempt fails.

## What this fork changes

### 1. Safer kernel-state handling after v0rtex

The Meridian source now checks the result of `v0rtex()` before attempting to read kernel addresses. It also verifies that the expected exploit callback state is available, including a valid `tfp0` port and non-zero kernel base, and checks the subsequent kernel task, process and credential reads.

**Why this may help:** a failed or incomplete exploit attempt should no longer continue into kernel setup using unset or invalid addresses. That avoids unsafe follow-on kernel reads and gives the jailbreak a clearer failure path. This is a defensive correctness and stability improvement; it does **not** change the v0rtex exploit itself or guarantee that the exploit will succeed more often.

The same principle is applied to the headless TNS payload: kernel setup is stopped if the expected exploit state or required kernel reads are missing.

### 2. A custom-built arm64 TNS payload for the Substrate build

The hosted TNS version uses a locally built arm64 payload based on the TNS build system, with the kernel-state guard described above applied during the build.

**Why this may help:** it ensures that the hosted TNS page runs the patched payload rather than relying on an unmodified upstream binary. The payload is built specifically for the iOS 10-era arm64 environment used by this project.

### 3. iOS 10 compatibility shim for newer compiler availability checks

The build adds an Objective-C compatibility shim implementing the compiler availability-check entry points using Foundation's `NSProcessInfo` operating-system version API.

Newer compiler runtimes can reference a dyld availability symbol that is not present on older iOS releases. The shim provides the required version checks for this iOS 10-targeted payload.

**Why this may help:** it allows the payload to be built with the selected modern Xcode toolchain while retaining compatibility with the older iOS runtime. It addresses a build/link compatibility problem, not a jailbreak exploit issue.

### 4. Build only the required libcurl library

The TNS build is configured to compile the libcurl library rather than also attempting to build the unused curl command-line executable.

**Why this helps:** the payload needs the library, not the separate command-line tool. Avoiding that unnecessary target sidesteps unrelated linker failures involving macOS Security/SecureTransport symbols.

### 5. Reproducible build and deployment workflow

The GitHub Actions workflow:
- Uses a macOS 15 Intel runner.
- Explicitly selects Xcode 16.0.
- Builds the arm64 JIT payload with the Foundation framework linked.
- Verifies that the payload exists and is an arm64 Mach-O executable.
- Deploys the rebuilt payload to the `substrate/` directory on `gh-pages`.
- Updates the app-cache version marker so clients are prompted to fetch the new payload.

**Why this helps:** it makes the hosted build repeatable and reduces the risk of testing an old cached payload after source changes.

## Target configuration

- **Device:** iPod touch 6 (iPod7,1, A8)
- **Firmware:** iOS 10.3.3
- **Downgrade method:** surrealra1n (tethered)
- **Jailbreak path:** MeridianFix TNS, **Substrate build**
- **Hosted page:** https://davidvilla7.github.io/Meridian/
- **Source branch:** `substrate`
- **Deployment branch:** `gh-pages`

For this target, use the **Substrate** build. This fork is not intended to make the Substitute build or TNS Sockport work on this device.

## Device testing and current observations

Testing so far on the target iPod touch 6 has shown:
- Repeated successful activations when launching the hosted jailbreak through Safari.
- In the initial recorded Safari sample, 4 of 5 attempts succeeded; one attempt failed with visual corruption followed by a reboot. This is a small, informal sample, not a statistically meaningful success-rate claim.
- A Home Screen shortcut launch failed in the one recorded attempt, so Safari is currently the preferred launch method.
- A later clean activation restored access to jailbreak-dependent apps after an earlier test had left the device in a partial/hybrid state. That hybrid-state attempt is excluded from the activation success tally.
- The device subsequently remained powered on without a spontaneous reboot for more than a day while idle. This is encouraging but is not yet enough to establish long-term stability.

These observations are specific to one device and its current setup. Results may vary with device condition, installed tweaks, bootstrap state and individual activation attempts.

## Known separate investigations

Improved activation reliability does not mean every component in the jailbreak environment is fixed. The following are being investigated separately:
- **AppSync Unified:** application installation can still fail signature verification even when AppSync files are present. This may involve package state or injection into `installd`; it is not currently attributed to the Meridian payload changes.
- **Veteris:** newer 4.x versions have crashed during navigation on this device without consistently taking down the wider jailbreak environment. Veteris 3.2.2 with Helper 1.1 is the currently retained working combination.
- **Long-term stability:** continued idle and normal-use testing is needed before drawing conclusions about spontaneous reboots.

## Upstream background

Meridian is an iOS 10 jailbreak for 64-bit devices. MeridianFix combines Meridian builds with an updated bootstrap. This fork retains that foundation and focuses its modifications on the iPod touch 6 / iOS 10.3.3 TNS Substrate path.

The changes here should be understood as targeted compatibility, defensive kernel-state validation and build-pipeline improvements. They do not constitute a new exploit.

## Original MeridianFix notes

- For iOS 10.3.2-10.3.3, use the **substrate** build.
- The Substrate build is not suitable for iOS versions below 10.3.2; the original project uses the Substitute build for iOS 10.0-10.3.1.
- Tweak compatibility can vary. A successful jailbreak activation does not guarantee that every tweak or package will work correctly.

## For previously jailbroken devices

If your device was previously jailbroken with Meridian (or other jailbreak tools) and you want to switch to MeridianFix and/or reinstall the bootstrap, the original project documents a cleanup procedure below. **Proceed with caution:** the procedure can bootloop a device. Back up important data and understand the steps before attempting it.

- A "safer" version of the method is to remove `/Applications/Cydia.app`, `/meridian`, and `/var/lib/dpkg` while jailbroken, using Filza, SSH, or another suitable tool.
- The recommended alternative is to dump blobs using [Legacy iOS Kit](https://github.com/LukeZGD/Legacy-iOS-Kit) and restore using [turdus merula](https://sep.lol).

1. Run [Legacy iOS Kit](https://github.com/LukeZGD/Legacy-iOS-Kit), go to Useful Utilities -> SSH Ramdisk.
2. Follow the instructions. Once in the SSH Ramdisk, select Connect to SSH.
3. Run the following commands:
```sh
/sbin/mount_apfs /dev/disk0s1s1 /mnt1
rm -rf /mnt1/Applications/Cydia.app /mnt1/meridian
sync
/sbin/umount /mnt1
sync
exit
```
4. Select Reboot Device.
5. Once the device reboots, jailbreak with MeridianFix.

On iOS 10.0-10.2.1, the original procedure notes that `mount_apfs` may need to be replaced with `mount_hfs`.

## Building

Clone the repository, open the Xcode project, select your device (or a generic target), and make sure `ldid` is in `$PATH`. You will also need `tar`.

The hosted TNS payload is built by the GitHub Actions workflow at `.github/workflows/build-tns-payload.yml`. It checks out the TNS build system, applies the documented compatibility and kernel-state patches, builds the arm64 payload, and deploys it to `gh-pages`.
