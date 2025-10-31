

### CSRF Protection

Cross-Site Request Forgery (CSRF) attacks trick a user's browser into making unauthorized requests to a site when they are authenticated.

**Example Attack Scenario:**
1. User is logged into `example.com`
2. User visits `evil.com`
3. Evil site includes: `<img src="https://example.com/api/v1/devices/123" method="DELETE">`
4. Browser sends request with user's cookie automatically
5. Unauthorized action is executed


As current authentication not depends on cookies ( accept JWT in headers),wit is not vulnerable to CSRF because browsers don't automatically send custom headers like "Authorization" 