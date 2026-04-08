---
description: "Update comprehensive documentation and Copilot instructions to be helpful for other developers and coding agents working on this project."
name: "Update docs"
agent: "agent"
tools: [search, read_file, create_file, replace_string_in_file]
---

Review the current state of the workspace and update all documentation and Copilot instructions to ensure they are comprehensive and helpful for other developers and AI coding agents.

## Tasks

1. **Explore the codebase** — read key source files, configs, and scripts to understand the project's purpose, architecture, and conventions.

2. **Update or create `.github/copilot-instructions.md`** — include:
   - Project overview and purpose
   - Directory structure with explanations
   - Build & dev commands (from `package.json` scripts)
   - Key architectural decisions and patterns used
   - Conventions: naming, file organisation, CSS/JS patterns
   - Any gotchas or non-obvious things a new developer should know

3. **Update `README.md`** — ensure it covers:
   - What the project does
   - Prerequisites and setup steps
   - Available npm scripts and what they produce
   - How to run locally and preview outputs
   - Project structure overview

4. **Review existing instruction/prompt files** in `.github/` — fix outdated info, improve descriptions, and fill any gaps.

Produce clear, concise documentation written for both human developers and AI coding agents.
