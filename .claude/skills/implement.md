---
name: implement
description: Structured workflow for code implementation - PREPARE → CODE → VALIDATE → REFINE → COMMIT. Use when implementing features, fixing bugs, or making code changes. Ensures quality, consistency, and browser validation.
---

# Implement Workflow

Execute this workflow for **every** code implementation.

## 🔍 PREPARE

### Git Checkpoint (if risky)

```bash
git add -A && git commit -m "chore: checkpoint before [task]"
```

### Search First

- `tree` - Understand structure
- `rg` / `fd` - Find existing patterns
- **Rule:** Reuse before creating new code

### Get Documentation

**Priority order:**

1. **Svelte 5** → `mcp__svelte__list-sections` + `mcp__svelte__get-documentation`
2. **Libraries** → `mcp__context7__resolve-library-id` + `mcp__context7__get-library-docs`
3. **Code Examples** → `mcp__perplexity__code_search`
4. **Quick Facts** → `mcp__perplexity__quick_search`

### Plan

- Break into small functions (<20 lines)
- Use `TodoWrite` for multi-step tasks

---

## ⚙️ CODE

### Decision Tree

1. Search codebase first
2. Check standard library
3. Check installed dependencies
4. Search & add dependency (`bun add`)
5. Custom implementation (last resort)

### Standards (see CLAUDE.md)

- TypeScript: Explicit types, no `any`, early returns
- Svelte 5: `$state` runes (NOT stores), `$derived`, `$effect` sparingly
- Clean Code: KISS, DRY, Single Responsibility
- UI: DaisyUI components only

### Scope Control

✅ Exact task only | ❌ No extras | ❌ Don't touch unrelated files

---

## ✅ VALIDATE

### Start Dev Server

```bash
bun run dev
```

### Chrome DevTools MCP (MANDATORY for UI)

Execute in order:

1. Navigate: `mcp__chrome-devtools__navigate_page(url: "http://localhost:5173")`
2. Snapshot: `mcp__chrome-devtools__take_snapshot()`
3. Screenshot: `mcp__chrome-devtools__take_screenshot()`
4. Console: `mcp__chrome-devtools__list_console_messages()`
5. Network: `mcp__chrome-devtools__list_network_requests()` (if API calls)

**Check:**

- Does it solve the problem?
- Console errors?
- UI matches requirements?

---

## 🔧 REFINE

### Refactor Checklist

- [ ] Functions < 20 lines?
- [ ] No duplication (DRY)?
- [ ] Self-documenting names?
- [ ] KISS - simplest solution?
- [ ] Single Responsibility?
- [ ] No `any` types?

### Svelte Validation (for .svelte files)

```
mcp__svelte__svelte-autofixer(code: "...", desired_svelte_version: 5)
```

Apply suggestions → run again to confirm fixes.

### Iterate if Needed

VALIDATE → REFINE → VALIDATE (until passing)

---

## 🎯 COMMIT

### Quality Gates

```bash
bun run format && bun run lint && bun run check
```

Fix errors before commit.

### Conventional Commit

```bash
git add -A
git commit -m "feat: [clear description]"
```

**Types:** `feat`, `fix`, `refactor`, `chore`, `docs`

**Rules:**

- ❌ Never mention "Claude Code"
- ✅ Clear, concise description
- ✅ One feature = one commit

---

## Quick Reference

```
PREPARE → CODE → VALIDATE → REFINE → COMMIT
   ↓        ↓        ↓         ↓         ↓
Search   Follow  DevTools  Refactor  Quality
 Docs    CLAUDE.md   MCP     Check    Gates
 Plan    Standards Console   DRY      Git
```

**Critical:** Never skip VALIDATE for UI changes!
