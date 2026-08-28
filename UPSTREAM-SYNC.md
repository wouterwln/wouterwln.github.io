# Keeping this site in sync with upstream al-folio

This repo is a **clone of [alshedivat/al-folio](https://github.com/alshedivat/al-folio)** (shared
git history), not a template copy. Our site content lives as a stack of commits on top of upstream
`main`:

1. `Remove starter demo content` deletes demo posts/news/books/teachings/sample pages
2. `Port site configuration` sets our values in `_config.yml`
3. `Port content` adds `_pages`, `_bibliography`, `_data`, `_projects`, our `assets`
4. ...any later content commits

## Pulling in upstream updates

`main` is published and carries merge commits from the automated Scholar-citations
workflow, so **merge, do not rebase**. Rebasing would rewrite public history, drop those
merge commits, and require a force push.

```sh
git fetch upstream
git merge upstream/main
```

Test the merge in a throwaway worktree first if it looks large:

```sh
git worktree add -b sync-test ../al-folio-sync HEAD
cd ../al-folio-sync && git merge upstream/main
```

### Resolving the four recurring conflicts

**Demo files upstream modified that we deleted** (modify/delete). Keep our deletion:

```sh
git status --porcelain | awk '$1 ~ /^(DU|UD)$/ {print $2}' | xargs git rm
```

**`_data/citations.yml`.** Upstream keeps regenerating theirs from the demo Scholar
profile. Always keep ours:

```sh
git checkout --ours _data/citations.yml && git add _data/citations.yml
```

**`.gitignore`.** Both sides tend to append different entries. Keep both.

**`_config.yml`.** Keep our identity values (`icon`, `url`, `baseurl`, name, socials) and
take upstream's new keys. Most of the file auto-merges; usually only one hunk conflicts.

`rerere` is enabled, so once a conflict is resolved it auto-resolves next time.

### Then check for demo content upstream _added_

Git reports no conflict for new files, so new demo posts land silently and would publish
under `/blog` on this site. After every merge:

```sh
git diff --diff-filter=A --name-only HEAD -- _posts _news _books _projects _teachings
```

Delete anything that shows up. The v1.2 sync added `_posts/2022-10-15-rtl.md` and
`_posts/2025-04-28-marimo.md` this way.

New upstream workflows (`star-history.yml`, `update-screenshots.yml`, `release.yml`,
`broken-links.yml`) are all guarded by `if: github.repository == 'alshedivat/al-folio'`,
so they stay inert here. Re-check that guard if a new workflow appears.

### Workflows deliberately deleted from this fork

**`.github/workflows/visual-regression.yml` is removed on purpose. Do not restore it.**

It screenshot-diffs the site against a `v0.16.3` baseline worktree to catch CSS drift
from upstream's v0-to-v1 Tailwind rewrite. That is useful in the template repo and
meaningless here, for two independent reasons:

1. It needs the `v0.16.3` tag, and this fork has no tags (`git push` does not push tags,
   so none reached `origin`). The step failed with `fatal: invalid reference: v0.16.3`.
2. Even with the tag, it diffs `/`, `/projects/`, `/publications/` and `/repositories/`
   against upstream's v0.16.3 **demo content**. We deleted that content and have no
   repositories page, so every route would mismatch on content rather than on styling.

It only ever triggered on the automated Scholar-citations PRs, where it showed a red X.
If a future merge reintroduces the file, delete it again. Keep `test/visual/` itself:
`test/style_contract.js` requires that path to exist, and dropping it fails
`unit-tests.yml`.

### Finally, verify

```sh
bundle install
bundle exec jekyll build
bundle exec al-folio upgrade audit    # expect 0 blocking, 0 non-blocking
npm run lint:style-contract
npm run lint:prettier
```

Note that `docs/` and `AGENTS.md` come from upstream and describe _their_ starter, which
builds under a `/al-folio` baseurl. Our `baseurl` is blank because the site is served at
the domain root, so build with a plain `bundle exec jekyll build`.

## Building locally

```sh
bundle install          # gems vendored in vendor/bundle
bundle exec jekyll serve
```

## Sync history

| Date       | Upstream point    | Notes                                         |
| ---------- | ----------------- | --------------------------------------------- |
| 2026-08-28 | v1.2 (`267426f1`) | al_folio_core 1.0.11 to 1.0.15; 3 new plugins |
