# Project Changes & Debugging Log

## 1. MVP Identification

Community Tool Library lets neighbors list tools they own so others can borrow them. The core features that must work are:

- **Add a tool:** A user submits a name and description, and the tool is saved to the database.
- **View tools:** The page loads all saved tools from the database, and they remain after a refresh.
- **Borrow a tool:** A user marks an available tool as borrowed, and the status is saved.
- **Return a tool:** A user marks a borrowed tool as available again, and the status is saved.

Ratings, reviews, image uploads, and categories are out of scope for this MVP.

## 2. Bug Fixes

### Bug 1: Infinite fetch loop on page load
- **Symptom:** The page stayed on "Loading tools..." and the browser's Network tab showed hundreds of requests to `/api/tools`.
- **Cause:** In `client/src/App.jsx`, the `useEffect` that calls `fetchTools()` had no dependency array. It ran after every render, and each fetch updated state, which caused another render.
- **Fix:** Added an empty dependency array `[]` so the effect runs once on page load.

### Bug 2: Adding a tool never saved to the database
- **Symptom:** The form showed "Tool listed successfully!", but the tool was missing from the list after a refresh.
- **Cause:** In `server/routes/tools.js`, the POST route built a fake tool object with `Date.now()` as the id and returned it without calling `prisma.tool.create`.
- **Fix:** The route now validates the name and calls `prisma.tool.create` to save the tool. It returns the saved record with status 201.

### Bug 3: Borrow and return did not work
- **Symptom:** Clicking Borrow did nothing visible, and the status never changed.
- **Cause:** Three problems in `client/src/components/ToolCard.jsx` and `App.jsx`:
  - The request went to `/api/tool/:id` instead of `/api/tools/:id`.
  - The card built a local copy of the tool with the old `isAvailable` value instead of using the server's response.
  - `handleToolUpdate` in `App.jsx` changed the array in place, so React didn't re-render.
- **Fix:** Corrected the URL, used the updated tool from the server's response, and changed `handleToolUpdate` to return a new array with `setTools(prevTools => prevTools.map(...))`. The PATCH route in `tools.js` flips `isAvailable` in the database and returns the updated record.

### Bug 4: Server would not start
- **Symptom:** `node index.js` failed with "Cannot find module '.prisma/client/default'", and `prisma db push` failed with a `url` validation error.
- **Cause:** The project used Prisma 7, which doesn't accept a `url` property in `schema.prisma`. `routes/tools.js` also imported `../prisma.config` instead of creating a `PrismaClient`.
- **Fix:** Pinned `prisma` and `@prisma/client` to version 6 to match the schema. Replaced the import with `const prisma = new PrismaClient()`.

### Bug 5: Wrong React key in the tool list
- **Symptom:** React warned about missing or duplicate keys, which can cause cards to update incorrectly.
- **Cause:** In `client/src/components/ToolList.jsx`, the key was `tool.index`, which doesn't exist on the record.
- **Fix:** Changed the key to `tool.id`.

### Bug 6: Garbled text in the UI
- **Symptom:** The header and footer showed characters like `ðŸ› ï¸` and `Â©`.
- **Cause:** The files were saved with the wrong text encoding.
- **Fix:** Rewrote the affected files in UTF-8.

## 3. Improvements

- **Input validation:** The POST route returns a 400 error when the name is missing, instead of saving an empty tool.
- **Clearer error handling:** The PATCH route returns 400 for an invalid id and 404 when the tool doesn't exist. Failed actions show an error message in the card.
- **Stable ordering:** The GET route sorts tools by id, so the list order doesn't change between refreshes.
- **Safer setup:** `.gitignore` excludes `node_modules/`, `.env`, and `dist/`, so the database password stays out of the repo.
- **Simpler state updates:** `handleToolUpdate` replaces only the changed tool, so the rest of the list doesn't re-render unnecessarily.

## 4. Deployment

- **Frontend (Vercel or Netlify):** TODO: add link
- **Backend (Render or Railway):** TODO: add link
- **Database:** Neon PostgreSQL. The connection string is stored as the backend's `DATABASE_URL` environment variable and isn't committed to the repo.

## 5. Video Explanation

TODO: add Google Drive link, set to "Anyone with the link can view"

## 6. Deployment Configuration

- **API base URL:** `client/src/config.js` reads `VITE_API_URL` at build time and falls back to `/api` for local development through the Vite proxy. The deployed frontend sets `VITE_API_URL` to the backend's public URL, so requests go straight to the Render server.
- **Deploy order:** Deploy the backend first, then set the frontend's `VITE_API_URL` before its first build, since Vite bakes the value into the bundle.
