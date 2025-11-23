# Admin Access Adjustments – 2025-11-12

## Summary of Changes

1. **Removed legacy admin shortcuts from the sidebar**
   - File: `components/Sidebar.jsx`
   - Removed injection of “Gerenciar Terapeutas (Testes)” and “Relatórios de Uso” from the standard navigation. These pages are now reachable only via the new admin entry point.

2. **Added floating admin access control**
   - File: `components/AdminAccess.jsx` *(new)*
   - Provides the bottom-right `Admin` button, modal-based authentication, and post-login quick links.
   - Stores a short-lived session token in `sessionStorage` (`kalon_admin_session`) with a 20-minute expiration.
   - Added to the global layout in `pages/_app.js` so it renders on every page.

3. **Local admin credentials and API**
   - File: `data/admin.json` *(new)* – single authorized credential (update the password as needed).
   - File: `pages/api/admin/login.js` *(new)* – validates credentials against the JSON file and returns a base64 session token.

4. **Shared utilities for admin sessions**
   - File: `utils/adminSession.js` *(new)* – helper functions for loading, persisting, clearing, and checking the admin session window.

5. **Protected admin pages via session checks**
   - File: `pages/admin/reports.jsx`
   - File: `pages/admin/test-users.jsx`
   - File: `pages/admin/therapists.jsx` *(new re-export of `test-users.jsx`)*
   - Each page now validates the session token on mount and every 60 seconds; unauthorized access redirects back to `/login`.

## Reverting the Changes

If you need to restore the previous behavior:

1. **Sidebar**
   - Reinsert the removed `userType === 'admin'` branch in `components/Sidebar.jsx`.

2. **Admin Access UI**
   - Remove `components/AdminAccess.jsx`.
   - Delete the `<AdminAccess />` inclusion from `pages/_app.js`.

3. **API & Data**
   - Delete `pages/api/admin/login.js` and `data/admin.json`.

4. **Utilities**
   - Remove `utils/adminSession.js`.

5. **Admin Pages**
   - Delete `pages/admin/therapists.jsx`.
   - Revert the new session guard hooks in `pages/admin/reports.jsx` and `pages/admin/test-users.jsx`.

Commit or stash the removals as appropriate to fully revert to the pre-admin-entry state.

## Manual Verification Checklist

1. Run `npm run dev`.
2. Ensure the sidebar no longer lists admin options for any user.
3. Click the new `Admin` button:
   - Without logging in, confirm that a modal requests credentials.
   - Enter the credentials from `data/admin.json`; verify the menu with links appears and closes correctly.
4. From the admin menu, open `Gerenciar Terapeutas` and `Relatórios de Uso`:
   - Confirm both pages load.
   - Refresh the browser; they should redirect to `/login` if the admin session has expired or no longer exists.
5. Close and reopen the browser/tab; verify the admin session is cleared and you must re-authenticate.






