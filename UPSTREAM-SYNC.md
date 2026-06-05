# Keeping this site in sync with upstream al-folio

This repo is a **clone of [alshedivat/al-folio](https://github.com/alshedivat/al-folio)** (shared
git history), not a template copy. Our site lives as a small stack of commits on top of upstream
`main`:

1. `Remove starter demo content` — deletes demo posts/news/books/teachings/sample pages
2. `Port site configuration` — our values in `_config.yml`
3. `Port content` — `_pages`, `_bibliography`, `_data`, `_projects`, our `assets`
4. …any future content commits

## Pulling in upstream updates

```sh
git fetch upstream
git rebase upstream/main
```

Because history is shared, this replays only **our** commits on top of the latest template.

### Resolving the common conflict

If upstream modified a demo file that we deleted (modify/delete conflict), keep our deletion:

```sh
git status --porcelain | awk '$1 ~ /^(DU|UD)$/ {print $2}' | xargs git rm
git rebase --continue
```

`rerere` is enabled in this repo, so once a conflict is resolved it auto-resolves next time.

After every sync, check for config-contract or markup drift:

```sh
bundle exec al-folio upgrade audit
```

## Building locally

```sh
bundle install          # gems vendored in vendor/bundle
bundle exec jekyll serve
```

## Going live (when ready)

```sh
git remote add origin https://github.com/wouterwln/wouterwln.github.io.git
git push --force origin main   # replaces the old, unrelated history
```

The old history stays recoverable from the previous checkout at
`~/Documents/GitHub/wouterwln.github.io` until you delete it.
