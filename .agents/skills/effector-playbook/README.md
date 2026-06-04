# Effector Playbook Skill

A rule-focused skill for writing correct, reliable Effector code and fixing common mistakes. The skill is designed for LLMs and emphasizes explicit flow control, testability, SSR-safety, and consistent modeling patterns.

## What this skill provides
- A curated set of short rules with examples (`rules/`)
- A compiled rules file for quick scanning (`AGENTS.md`)
- Official API reference dump (`references/llms-full.txt`)
- Focused reference notes for rare topics (SSR/scopes, testing, Babel/SWC plugin)
- Patronum operator guidance and version notes

## Quick start

Install in one command:

```bash
npx skills add neolite/effector-playbook
```

## Structure
- `SKILL.md` - Skill metadata and rule index
- `AGENTS.md` - Compiled rules (concatenated)
- `rules/` - Individual rules by category
- `references/` - Reference documents and API dumps

## Installation

Use your skill manager (e.g., skill.sh) to add this GitHub repo, or install directly:

```bash
npx skills add neolite/effector-playbook
```

## Usage
When writing or reviewing Effector code:
1. Start with `SKILL.md` to find relevant rules.
2. Open specific files in `rules/` for guidance and examples.
3. Consult `references/` for API or rare-topic details.

## Contributing
- Keep rules short and actionable.
- Prefer code examples over long explanations.
- Avoid duplicating content between rules and references.
