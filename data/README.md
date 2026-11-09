# Prototype world data

`world-data.js` is the running prototype's portable data pack. It intentionally uses JavaScript rather than `fetch()`-loaded JSON so the game can be opened directly from `index.html` without a local server.

It contains the fictional league’s club profiles, real-context Brazilian region profile, record definitions, and reusable event templates. Later, these objects will be split into validated JSON packs for modding.
