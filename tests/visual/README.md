# Visual tests

Playwright compares Storybook scenarios in Chromium, in light and dark themes.
Each public component and module has a visual spec, grouped by the same unit name as
the library API. The suite also retains the QueryEditor widget smoke test. These tests
are separate from Vitest component tests and the browser integration suite.

Scenarios cover meaningful variants such as populated/empty/loading/error content,
disabled controls, expanded overlays, selected rows, and editor modes where applicable.
History includes successful, failed, and running queries. Search scenarios distinguish
title matching from full-text SQL matching and assert results before capturing them.
The fixture fixes the current date so running durations remain repeatable.

`npm run test:visual:coverage` checks the component/module public barrels against
per-unit visual specs containing screenshot assertions. The container runner performs
this check before building Storybook, so a newly exported unit needs a visual spec.
This is a unit-presence check, not a claim that every prop combination is covered.

## Run and update

From the repository root, with Node.js and a working Docker or Podman installation:

```sh
npm run test:visual
npm run test:visual:update
npm run test:visual -- --grep 'query editor'
npm run test:visual:update -- --grep 'query editor'
npm run test:visual:report
```

To select Podman explicitly when Docker's CLI is also installed:

```sh
CONTAINER_RUNTIME=podman npm run test:visual:update
CONTAINER_RUNTIME=podman npm run test:visual
```

The runner prefers Docker when its server is reachable, otherwise it tries Podman.
It detects Podman behind a Docker-compatible CLI/API and uses Podman-compatible mount
options. Override client selection with `CONTAINER_RUNTIME=docker` or
`CONTAINER_RUNTIME=podman`; an explicit selection disables fallback. If neither server
is available, the runner reports connection errors; it does not install or start a server.
On ARM hosts the runtime must support running `linux/amd64` images.
Runner selection and mount arguments can be checked without containers using
`node --test tests/scripts/run-visual-tests.test.mjs`.

The official Playwright image version comes from `package-lock.json`. Every run uses
Linux amd64, installs locked dependencies and builds Storybook inside the container.
Dependencies and the build use temporary volumes, while screenshots and reports are
written into the checkout. The runner removes its own container on completion or
interruption. No development Storybook server is needed or modified.

Tests are grouped by library level and unit under `tests/visual`, for example
`modules/QueriesHistory/QueriesHistory.visual.spec.ts` and
`widgets/QueryEditor/QueryEditor.visual.spec.ts`.
Canonical baselines live beside each test in `<test filename>-snapshots` and must be committed:

```text
tests/visual/
  modules/QueriesHistory/
    QueriesHistory.visual.spec.ts
    QueriesHistory.visual.spec.ts-snapshots/
      history-light-chromium-linux.png
      history-dark-chromium-linux.png
  widgets/QueryEditor/
    QueryEditor.visual.spec.ts
    QueryEditor.visual.spec.ts-snapshots/
      editor-light-chromium-linux.png
      editor-dark-chromium-linux.png
```

The filename combines the name passed to `toHaveScreenshot`, the theme (`light` or `dark`),
the browser (`chromium`), and the canonical platform (`linux`).
A normal run fails for missing or changed baselines. To bootstrap the suite, run the
update command on a machine with a container runtime and review/commit all generated PNGs.
Updates are explicit: inspect the images before committing them together with UI changes.
When upgrading Playwright, regenerate and review the baselines in the new image.

## Podman on Apple Silicon

The amd64 Storybook build can crash with a QEMU segmentation fault on an ARM VM.
Use an `applehv` Podman machine with Rosetta enabled. Merge the following setting into
`~/.config/containers/containers.conf`; preserve existing settings and reuse an existing
`[machine]` section rather than adding a duplicate:

```toml
[machine]
rosetta = true
```

Some Podman versions/images also require the host opt-in marker
`~/.config/containers/enable-rosetta`. After other containers have finished, create the
marker and restart the existing AppleHV machine (substitute its name if different):

```sh
touch ~/.config/containers/enable-rosetta
podman machine stop podman-machine-default
podman machine start podman-machine-default
podman machine ssh podman-machine-default cat /proc/sys/fs/binfmt_misc/rosetta
podman machine ssh podman-machine-default systemctl status rosetta-activation.service
```

Check that the Rosetta handler is enabled and the activation service is active; the
Rosetta handler should replace `qemu-x86_64`. This configuration was verified with
Podman 6.1.4. That version [rereads the Rosetta setting on startup](https://github.com/podman-container-tools/podman/blob/v6.1.4/pkg/machine/applehv/stubber.go#L109),
so the machine does not need to be recreated and cached images are preserved.
See also the [Podman Rosetta status update](https://blog.podman.io/2025/08/podman-5-6-released-rosetta-status-update/).

## CI and environments without containers

The **Visual tests** workflow compares screenshots on pull requests and uploads the HTML
report and failure traces as `visual-test-report-<attempt>` (retained for 14 days).
Each attempt has its own artifact so a rerun cannot publish an earlier attempt's report.
The separate **Visual test report** workflow publishes the HTML report and its attachments
to the same S3 bucket used by Storybook previews, using `STORYBOOK_S3_KEY_ID` and
`STORYBOOK_S3_SECRET_KEY`. It updates one PR comment with a direct report link and adds
the link to its job summary, including when screenshot comparisons fail. Reports use
an immutable path per run and attempt:

```text
https://storage.yandexcloud.net/storybook-static/querieskit/visual-reports/<run-id>/<attempt>/index.html
```

The publisher reads artifacts from a completed PR run without checking out or executing
PR code. It only updates comments for an open PR at the tested commit and skips stale
runs. If tests fail before producing a report, the CI logs remain the source of details.
GitHub starts `workflow_run` publishers only when their workflow exists on the default
branch: merge `visual-tests-report.yml` into `main` before expecting automatic report
links, then rerun **Visual tests**. Manual `workflow_dispatch` runs retain downloadable
artifacts but do not publish a PR comment.

Once the testing workflow is available in GitHub Actions, it can also
be dispatched manually with `update_snapshots` enabled. Download the `visual-baselines`
artifact and extract its contents into `tests/visual`, preserving the `components`, `modules`, and
`widgets` directories. Review the images and commit them. CI never commits or accepts
changed screenshots automatically.

For native debugging without Docker/Podman, install dependencies and the local browser:

```sh
npm ci
npx playwright install chromium
npm run build-storybook
npm run test:visual:impl -- --update-snapshots --workers=2
npm run test:visual:impl -- --workers=2
```

Native snapshots go into ignored
`tests/visual/__screenshots__/local-<os>-<architecture>/<theme>/<testFilePath>/<name>.png`
directories, even on Linux. Here `testFilePath` is relative to `tests/visual`, such as
`modules/QueriesHistory/QueriesHistory.visual.spec.ts`.
They cannot overwrite container baselines and do not verify the canonical Linux images.
`VISUAL_CONTAINER` is reserved for the container runner; do not set it for native runs.

By default Playwright starts its own static preview on port 6016 and shuts it down after
the run. An occupied port fails without touching the existing process. To reuse a running
Storybook, first confirm that it belongs to this checkout, then run:

```sh
VISUAL_BASE_URL=http://localhost:6006 npm run test:visual:impl -- --workers=2
```

An explicitly supplied server is never started or stopped by the tests. This variable
is for native debugging and is intentionally not forwarded into containers.

## Add a scenario

Add a case to the unit's `<Name>.visual.spec.ts`, or create a file under
`tests/visual/<level>/<Name>/` for a new unit. Import `test` and `expect` from
`../../fixtures` and use `openStory` with the story ID from Storybook's `index.json`.
Assert the expected content is ready before calling `toHaveScreenshot` with a descriptive
name, such as `history.png`; theme, browser, and platform suffixes are added automatically.
Prefer fixed data and completed states over timers or live progress. The fixture fixes
the date, locale, timezone and theme, and waits for fonts; it does not freeze timers.
For async editors/charts, also wait for their actual rendered content.
Canvas graphs and timelines additionally use `prepareCanvas` to load their text fonts
and redraw through the zoom/fit controls before capture. Canvas text does not update
automatically when a webfont finishes loading.

Capture `#storybook-root` for ordinary stories and the dialog/menu locator for portals.
Avoid arbitrary sleeps, broad masks and relaxed diff thresholds. Both themes run
automatically as separate Playwright projects.
