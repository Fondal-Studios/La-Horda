# Independent launch — 16 October 2026

Owner authorized a new page and relay because Fly access belongs to an unavailable partner.
Keep the old deployment untouched. Accounts and saves are NOT migrated without an export.

Static site: build `node tools/build-static.mjs`, publish `dist`, environment `GAME_RELAY_URL`
set to the newly created relay's wss URL. The bundle only includes public game files.
Set `GAME_SITE_URL` to the actual static-site URL for canonical/social metadata.

Relay: Node, build `npm ci --prefix server`, start `node server/relay.js`.
Use `REQUIRE_PERSISTENT_ACCOUNTS=1`, `PAYMENTS_PROVIDER=` and the exact static site's
origin in `ALLOWED_ORIGINS`. Rooms are available independently from account storage.
Until DATABASE_URL is configured, accounts return 503, health reports not ready, and
real-money purchases remain disabled. Never claim durable accounts based on a file store.

Free Postgres creation was rejected: workspace already has an active free database (Nexus).
Do not repurpose another product's database. Paid database needs owner cost authorization.
After approval create an isolated Postgres in the relay's region, configure its INTERNAL
connection string privately as DATABASE_URL, restrict external DB access, deploy, and
verify register/save/restart/read before enabling purchases. Free web services share 750
monthly hours across this workspace and sleep on idle; this is not a 24/7 capacity promise.

Existing operator CLI `server/recover-owner.js` creates NanoGM through database access.
Its password minimum remains 12 characters. Never put credentials in this file or the bundle.
Mercado Pago seller configuration and end-to-end purchase/refund remain separate gates.
