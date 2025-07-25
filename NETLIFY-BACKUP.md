# Alternative Netlify Configuration (if plugin fails)

If the @netlify/plugin-nextjs continues to fail, use this configuration instead:

```toml
[build]
  command = "npm run build && npm run export"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
  NEXT_TELEMETRY_DISABLED = "1"
  SECRETS_SCAN_ENABLED = "false"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

And add this to package.json scripts:
```json
"export": "next export"
```

This would create a static export instead of using server functions.
