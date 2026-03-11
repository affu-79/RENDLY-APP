# OAuth Login Setup (GitHub & LinkedIn)

**Tagline:** Know Your Why, Find Your Who

The "redirect_uri does not match" / "redirect_uri is not associated" errors mean the callback URL your app sends is **not** registered in the provider's dashboard. Fix it by adding the **exact** URL below in both places.

## Callback URL to register

Use this **exact** value (no trailing slash, same protocol and port):

```
http://localhost:3001/auth/callback
```

---

## 1. GitHub

1. Go to **GitHub** → **Settings** → **Developer settings** → **OAuth Apps** (or **GitHub Apps** if you use that).
2. Open your OAuth App (the one with Client ID `Ov23liiST1copkJktI58` or your own).
3. Set **Authorization callback URL** to:
   ```
   http://localhost:3001/auth/callback
   ```
4. Save.

If you use a different port or domain, set the same URL in **Authorization callback URL** and in `.env.local` as `NEXT_PUBLIC_OAUTH_REDIRECT_URI`.

---

## 2. LinkedIn

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) and open your app.
2. Open the **Auth** tab.
3. Under **OAuth 2.0 settings** → **Redirect URLs**, click **Add redirect URL**.
4. Add exactly:
   ```
   http://localhost:3001/auth/callback
   ```
5. Save.

Again, the value must match character-for-character (including `http` vs `https` and port `3001`).

---

## 3. Restart frontend

After changing redirect URLs in GitHub/LinkedIn (or changing `.env.local`):

1. Stop the dev server (Ctrl+C).
2. Run `npm run dev` again.
3. Try **Continue with GitHub** and **Continue with LinkedIn** on `/auth/sign-up`.

---

## Production

For production, register your live callback URL in both dashboards (e.g. `https://yourdomain.com/auth/callback`) and set:

```env
NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback
```
