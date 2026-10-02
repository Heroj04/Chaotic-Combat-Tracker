# Chaotic Combat Tracker

A two-player, face-to-face stat tracker for Chaotic TCG. One player's panel is rotated so both players can read the shared screen from opposite sides.

## AI usage disclosure

Generative AI coding tools assisted with development of this project. The resulting changes were reviewed and tested, but may still contain errors. The app does not use AI services at runtime.

## Track a match

- Energy, Courage, Power, Wisdom, and Speed start at 50. Use the plus and minus controls to change a stat by 5; there are no limits.
- Fire, Air, Earth, and Water can be toggled independently for each player.
- The center reset button asks for confirmation, then returns both players' stats to 50 and turns off every element.
- Open tracker options to set each player's name and tribe theme, place the players opposite or next to each other, and choose facing or same-way-up orientation.
- Names, themes, placement, and orientation are saved on the device. Match stats and element toggles return to defaults when the page is reloaded.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Run checks and create a production build with:

```sh
npm test
npm run lint
npm run build
```

## Install the PWA

The app's **Install** button opens the browser's native install prompt when available, or shows device-specific steps. Deploy the app over HTTPS: mobile browsers do not allow service workers or PWA installation from a plain HTTP LAN address such as `http://192.168.x.x`. `localhost` is considered secure only when opened on the same device.

On Android, open the HTTPS site in Chrome and use the in-app prompt or Chrome's **Install app** menu action. On iPhone or iPad, open the HTTPS site in Safari, tap **Share > Add to Home Screen**, then tap **Add**. After installation, the app shell and bundled assets are cached for offline launch.

## Host the app

### Static site

Run `npm run build` and publish the generated `dist/` directory to a static host such as Cloudflare Pages, Netlify, or an object-storage website endpoint. Set the build command to `npm run build` and the publish directory to `dist`. Use the host's HTTPS URL for PWA installation.

### Docker

The included multi-stage `Dockerfile` builds the app and serves it with Nginx on port 8080:

```sh
docker build -t chaotic-combat-tracker .
docker run --rm -p 8080:8080 chaotic-combat-tracker
```

Put the container behind an HTTPS reverse proxy when exposing it publicly; service-worker installation requires a secure origin.

An example Compose file runs the published image. Set `TRACKER_IMAGE` to your GHCR package (for example, `ghcr.io/owner/repository:latest`) in the environment or a `.env` file next to the Compose file, then start it with:

```sh
docker compose -f docker-compose.example.yml up -d
```

### GitHub Actions

The `Verify and publish container` workflow runs unit tests and the PWA build as separate jobs on pull requests. Push a version tag such as `v1.2.3` (`git tag v1.2.3`, then `git push origin v1.2.3`) to run both checks and publish the container to GHCR with `1.2.3`, `1.2`, `1`, and `latest` tags. You can also run the workflow manually from **Actions > Verify and publish container > Run workflow**, entering an existing semantic version tag such as `v1.2.3`. Enable GitHub Actions package write access for the repository if it is not already enabled.
