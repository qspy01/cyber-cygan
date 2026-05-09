# Global Rebranding (CyberCygan) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the project from "cobalt" to "CyberCygan" by replacing names and author information across the codebase.

**Architecture:** Systematic search and replace using `sed` in `api/src` and `web/src`, followed by manual updates to `package.json` files.

**Tech Stack:** `sed`, `grep`, `git`

---

### Task 1: Rebrand API

**Files:**
- Modify: All files in `api/src`
- Modify: `api/package.json`

- [ ] **Step 1: Replace "cobalt" with "CyberCygan" in `api/src`**

Run: `find api/src -type f -exec sed -i 's/cobalt/CyberCygan/g' {} +`

- [ ] **Step 2: Replace "imputnet" with "cybercygan" in `api/src`**

Run: `find api/src -type f -exec sed -i 's/imputnet/cybercygan/g' {} +`

- [ ] **Step 3: Update `api/package.json`**

Modify `name`, `author`, and `description` fields.

- [ ] **Step 4: Commit API changes**

```bash
git add api
git commit -m "chore(api): rebrand to CyberCygan"
```

### Task 2: Rebrand Web

**Files:**
- Modify: All files in `web/src`
- Modify: `web/package.json`

- [ ] **Step 1: Replace "cobalt" with "CyberCygan" in `web/src`**

Run: `find web/src -type f -exec sed -i 's/cobalt/CyberCygan/g' {} +`

- [ ] **Step 2: Replace "imputnet" with "cybercygan" in `web/src` (Optional but recommended for URLs)**

Run: `find web/src -type f -exec sed -i 's/imputnet/cybercygan/g' {} +`

- [ ] **Step 3: Update `web/package.json`**

Modify `name`, `author`, and `description` fields.

- [ ] **Step 4: Commit Web changes**

```bash
git add web
git commit -m "chore(web): rebrand to CyberCygan"
```

### Task 3: Global Project Updates

**Files:**
- Modify: `package.json` (root)
- Modify: `docker-compose.yml`

- [ ] **Step 1: Update root `package.json`**

Modify `name`.

- [ ] **Step 2: Update `docker-compose.yml`**

Replace `cobalt` with `cybercygan` in image names and container names.

- [ ] **Step 3: Commit global changes**

```bash
git add package.json docker-compose.yml
git commit -m "chore: update global rebranding metadata"
```

### Task 4: Verification

- [ ] **Step 1: Verify no "cobalt" remains in src**

Run: `grep -ri "cobalt" api/src web/src`
Expected: No matches (except maybe in comments or strings where it was intended to stay, but the task was global).

- [ ] **Step 2: Verify "CyberCygan" is present**

Run: `grep -ri "CyberCygan" api/src web/src | head`
Expected: Many matches.
