# Contact and review sources

Verified on 2026-11-23 for the local demo.

- WhatsApp: the existing Ninja Star website links to `https://wa.me/972533221496?text=%D7%94%D7%99%D7%99`. The demo uses that same destination. Visiting the button opens WhatsApp; the website never sends a message automatically.
- Reviews: the carousel uses verbatim excerpts from the Google reviews listed below. Each review was read directly on Google Maps and had a five-star rating. The visible carousel has no heading, explanation or outbound review links. It retains the original displayed author name and branch attribution.
- These are selected excerpts, not a live feed or a representative sample of every rating. Review dates below are the relative labels Google displayed at verification; no exact publication date is inferred, and relative dates are not displayed on the site where they would become stale.
- The facilities shown on each branch page use the existing inventory in `src/lib/content.ts`. There is no facility lookup, branch filter or individual facility page. Retired facility URLs permanently redirect to the homepage facilities or the Ashdod branch facilities.

## Hero video

The hero video was supplied by the user as `ninjastar-hero.mp4` on 2026-11-24. Local derivatives retain the original 40.4-second edit, remove audio and use H.264 with fast-start metadata. Mobile uses a centre crop. Poster images are extracted from the supplied video. Original metadata and output sizes are recorded in `public/videos/sources.json`; the source file stays outside the repository.

## Google review provenance

| Branch | Author | Google's recency label on 2026-11-23 | Source |
| --- | --- | --- | --- |
| Ashdod | רותם יוסף | One week ago | https://www.google.com/maps?cid=1856671086403227702&hl=he |
| Rehovot | Adi Israel levi | Two weeks ago | https://www.google.com/maps?cid=6576523664867224585&hl=he |
| Hod Hasharon | יאנה ברוך | One month ago | https://www.google.com/maps?cid=5284541248003773537&hl=he |

Google review IDs, retained for matching the original reviews during future updates:

- Ashdod: `Ci9DQUlRQUNvZENodHljRjlvT25WR1FTMWZZMmRxV0dGNmIwaE1jRU00ZHpKTlQzYxAB`.
- Rehovot: `Ci9DQUlRQUNvZENodHljRjlvT2pOMU1FOWFhRUZ2WHpKbE5qQmlUVGh5U1hGQ1EwRRAB`.
- Hod Hasharon: `Ci9DQUlRQUNvZENodHljRjlvT2xsbWQwSnljbnBaTkZaZk4xaE1TM2QxWm5WSGNtYxAB`.
