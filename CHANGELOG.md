# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

(coming soon)

## [1.0.5] - 2024-10-09

### Added

- New logo for the extension

## [1.0.4] - 2024-10-09

### Changed

- Fixed changelog display in descending chronology

## [1.0.3] - 2024-10-09

### Changed

- Fixed issue where selecting '.jsx' in settings would still create '.tsx' files

## [1.0.2] - 2024-10-09

### Added

- Section detailing how to use in Readme

### Changed

- Fixed extension name in VSCode settings

## [1.0.1] - 2024-10-09

### Changed

- Fixed incorrect link to the GitHub repo
- Modified Readme for preciseness and clarity

## [1.0.0] - 2024-10-09

### Added

- Ability to create a React component in a suitable directory
- Ability to create a React Native component in a suitable directory
- Detect the presence of a 'frontend' folder to create a component inside frontend
- Detect the type of project to apply suitable boilerplate code, eg. React, React Native or React Native with Expo
- Automatically append selected file extension to components, either 'tsx' or 'jsx'.
- Ability to change the default file extension from settings.