# Clipforge Studio

A modular Tauri 2 + React + TypeScript + Rust application for a professional dark-themed video editor targeting desktop and mobile workflows.

## First milestone: usable editing workspace

This repository is organized around a real editing engine and a non-blocking UI shell. The initial release provides:

- professional dark workspace shell
- project creation, save, open and local export
- media import flow
- preview monitor
- multitrack timeline
- clip splitting and trimming
- drag-and-drop placement of imported material
- transform controls for position, scale and rotation
- one functional transition (cross dissolve)
- audio volume control
- a working monochrome colour effect
- undo and redo support
- automated project logic tests

## Getting started

1. Install Node.js 20+ and Rust stable.
2. Install Tauri prerequisites for your platform.
3. Run:

   npm install
   npm run test
   npm run build
   npm run tauri dev

## Architecture summary

- Frontend: React + TypeScript + Vite
- Desktop shell: Tauri 2
- Native services: Rust project state and FFmpeg integration
- Metadata: JSON-based local project files and SQLite-ready schema for future persistence
- Performance: timeline state is isolated from render logic and is ready for proxy/cache extensions

## Next milestone focus

- stronger timeline editing interactions
- project persistence in SQLite / native project schema
- more realistic FFmpeg export pipeline
- mobile-adaptive shell
- AI and captioning modules

## Repository state

This starter project intentionally keeps the first milestone small, testable and buildable while leaving a clear path toward the broader feature set described in the product brief.
