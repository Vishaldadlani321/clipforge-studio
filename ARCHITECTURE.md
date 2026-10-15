# Clipforge Studio Architecture

## Overview

Clipforge Studio is structured as a Tauri 2 desktop and mobile-capable editor with a React/TypeScript interface and a Rust native backend. The architecture separates creative workflows from media processing and project state management so that the app can evolve from a first usable milestone into a full-featured AI-assisted editor.

## Core architecture layers

### 1. UI and interaction layer
- React + TypeScript render shell
- dark editor workspace, panels and controls
- responsive layout for desktop and mobile
- state-driven timeline and inspector updates

### 2. Project and media library
- project model with clips, media metadata, transforms and track data
- import and project save/open logic
- local JSON-based submission format ready for versioning and migration

### 3. Timeline engine
- track list and clip list model
- trim split and reordering primitives
- playhead, split, transition and editing operations

### 4. Video and audio processing
- FFmpeg-backed export and future media transcoding pipeline
- audio volume and waveform-ready data model
- media compatibility checks and diagnostics

### 5. Effects, colour and transitions
- per-clip transform engine
- monochrome / colour-grade effect support
- transition model supporting cross-dissolve and future wipe transitions

### 6. Platform adapters
- Tauri shell for desktop packages and native file dialogs
- future Android/iOS platform adapters with capability registry

## Build choices

The first milestone uses the following real, testable libraries and tooling:

- Tauri 2
- React + TypeScript + Vite
- Rust
- FFmpeg (for export path and future transcoding)
- Vitest for project logic tests

This is intentionally conservative and credible for the current environment to satisfy the requirement to build a working first milestone before expanding the feature set.

## Data flow

1. User imports media from local disk.
2. Media metadata is captured and attached to a project.
3. Timeline clips are created and positioned with transforms.
4. Edit operations update project state through pure functions.
5. Preview render consumes clip state.
6. Export pipeline writes a valid output file using the native FFmpeg call path.

## Limitations at this milestone

- No real GPU compositing yet
- No true AI modules
- No native mobile packaging yet
- No complex motion tracking or captioning
- Project format is versioned but intentionally simple for the first phase
