# Firebase JavaScript SDK 13.0.0 (app, auth, firestore)

The parts of the [Firebase JS SDK](https://www.npmjs.com/package/firebase)
the app uses (`firebase/app`, `firebase/auth`, `firebase/firestore`), bundled
into one ES module with esbuild. Licensed under the Apache License 2.0 by
Google LLC (the licence notices are at the end of `firebase.js`).

Rebuild:

    npm install firebase@13.0.0 esbuild
    npx esbuild entry.js --bundle --format=esm --minify --target=es2020 --legal-comments=eof --outfile=firebase.js

`entry.js` re-exports the functions imported in `js/cloud.js` (built with esbuild 0.24.0).
