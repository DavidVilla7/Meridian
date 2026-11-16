# MeridianFix TNS web mirror

This branch hosts the static TNS MeridianFix web frontend. The `substrate/` directory is the original substrate build for iOS 10.3.2–10.3.3. The root launcher detects the device and routes A8/A10 devices on those versions to the locally hosted `substrate/` directory.

The native Xcode source remains on the `substrate` branch. This `gh-pages` branch is a static website deployment branch.
