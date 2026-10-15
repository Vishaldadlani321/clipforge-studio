# Testing

## Recommended local commands

npm install
npm run test
npm run build
npm run tauri dev

## What is currently test-covered

- project creation
- clip splitting logic
- trim logic
- transform mutation logic
- export descriptor generation

## Automated test file

- src/lib/project.test.ts

## Test policy

The project follows the requirement that features are not marked as tested unless there is a real automated or manual validation path. At this milestone, tests cover only the first-phase timeline and project state logic.
