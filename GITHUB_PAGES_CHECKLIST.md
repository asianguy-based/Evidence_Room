# Evidence Room — GitHub Pages morning checklist

This checklist publishes the static PWA at `https://asianguy-based.github.io/Evidence_Room/`. Complete it from the repository root. The existing Manus-hosted release remains available while this is being configured.

## 1. Pull the prepared source

```bash
git clone https://github.com/asianguy-based/Evidence_Room.git
cd Evidence_Room
git checkout main
git pull origin main
```

If the repository is already cloned:

```bash
cd Evidence_Room
git pull origin main
```

## 2. Install dependencies and build locally

```bash
corepack enable
pnpm install
pnpm check
pnpm build
```

The build output that GitHub Pages publishes is `dist/public/`. Do not publish the source directory or `node_modules`.

## 3. Confirm the deployable bundle is clean

Run:

```bash
test -f dist/public/index.html
test -f dist/public/manifest.webmanifest
test -f dist/public/sw.js
! find dist/public -type d -name __manus__ -print -quit | grep -q .
```

The final command should produce no output and exit successfully. If `__manus__` appears, remove it from the deployable bundle before publishing and confirm that no `index.html`, manifest, or JavaScript file references it.

## 4. Enable GitHub Pages

On GitHub, open `https://github.com/asianguy-based/Evidence_Room/settings/pages`. Under **Build and deployment**, choose **GitHub Actions** as the source. The repository should remain public when using GitHub Free.

After the first successful workflow, open:

```text
https://asianguy-based.github.io/Evidence_Room/
```

## 5. Verify the PWA and local file permissions

Use Chrome or Edge over the HTTPS GitHub Pages URL. Test with a disposable folder containing duplicate images:

```text
Choose a local folder → Scan → Mark visible candidates → Move to recycling bin
```

Then repeat with a disposable copy and test **Delete now**. Confirm that Reset returns the page to its blank starting state and that closing/reopening the page clears the temporary log.

## 6. Check the three critical paths

Open each URL directly and confirm it does not return a 404:

```text
https://asianguy-based.github.io/Evidence_Room/
https://asianguy-based.github.io/Evidence_Room/manifest.webmanifest
https://asianguy-based.github.io/Evidence_Room/sw.js
```

If the app loads but assets are missing, the GitHub Pages repository base path is not configured correctly. If the service worker is missing, check that `sw.js` is at the top level of `dist/public/` and that its registration uses the `/Evidence_Room/` base path.

## 7. Optional custom domain

After the GitHub Pages URL works, configure a custom domain in **Settings → Pages**. Add the DNS records GitHub displays, wait for DNS propagation, then enable HTTPS enforcement. Do not change DNS until the default GitHub Pages URL has passed the functional tests.

## Definition of done

The release is ready when the GitHub Pages URL loads over HTTPS, the manifest and service worker return successfully, no `__manus__` directory or references are present in the deployable bundle, and local folder selection, scanning, recycling, delete-now, reset, and session-only behavior have been tested with disposable files.
