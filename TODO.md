## Auth Fix Steps (ArcList)

- [ ] Verify DB env vars + MySQL connection log on server startup.
- [ ] Fix frontend API_BASE_URL to reliably target correct backend origin (prevents login “load failed” on deployed environments).
- [ ] Harden backend JWT_SECRET handling and improve auth error messages for debugging.
- [ ] Confirm protected frontend API requests send `Authorization: Bearer <token>` (verify token exists in localStorage).
- [ ] Validate login stores `arclist_token` and `arclist_user` and subsequent page guards succeed.
