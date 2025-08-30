# Required Environment Variables for Production (Netlify)

Based on the debug analysis, you need to add these environment variables to your Netlify deployment:

## Google Sheets API Configuration
```
GOOGLE_SHEETS_PROJECT_ID=nanodrip-store
GOOGLE_SHEETS_PRIVATE_KEY_ID=266b1592eb3e1fc7e29c587c6c0ab43bc02dbc1d
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXd8mxuCFBAvH5
7nrXX3VgzK0bHhJdEfHqkpxN/hyFK9OGqEZ5gtAxQ+pO5kHYmcHqM1z/q+cXAYGI
b90n6VmYjVg9fiHUI4YOTh5F9dk+c59YHI5sIJ6ggdaI7aHjWiGzNoyXsbyy3+8c
0zEuqGTyq8MroIPcFoZuM5Ths3saftPNyZX0J21oOaRegYinthPps0uMydRsVQmp
YCzU7KaMdDpzHM1hV4l07A3tBonsBN10A7xyvRl3KLgXDGIqViMmKqQLv7YzI8gF
wnWP9Hw9ir+KKfP+wCKAQY2wXCHAVMHyVgDdnBfJ93/Qnxpk2MDTl27EexM9T/G3
quUnw4GXAgMBAAECggEAFjkNR759SjPq5SOK7pUH3tioBKNQsuIGQ3Kk8F5ZxAUb
J0j1ISneyICqtUHbtLgBtLgLdXXeEGoKrsRq2OehDVzhUaZQCDiJu7FO6gRLSGer
HZlZuck7fcPRGVpOV3aVAeOJvfOKSiCn4XSJdA3Q1j6Pk1EA3ehCK9ziFCKWJcs9
INsnZG2TpmdFB//VHsbc02GkHWxK2wWnQv4iEv9BLfYfQaDA+P1KA4P6+ytTV1K8
AZ06LLhO7HEtqHu93caduaIMjWsAxaqVwOPo59hJy32aX9MkyhoS5G/XQcZm1jTT
gq6u5A8DkMMJZszRTq/Ll9yW/RP6sQJaM4LmLzhsQQKBgQDtJXyQS7hwNJIg2dVA
M8AbVObmEWHsl4af+OpVbXy2cCVWttnh5hFlXU9BVTn0/zc/vGmDy0lOdP5Vy/gu
n0ogBqDNSEpL5oKP6WlwOKDzxrrdBewQ71q68NsifxEZf0wASYKEpIu0EFasxor9
GER3k/qwnRREPLjzc1Ezy+3IMQKBgQDomRcbIq2NoITEaSThafAG/Txrk8fxP/gd
DyrJPz2vhynNmfkLLcZXxZQetbUoE7v+DehMoMsklsCWMV90mlrVVlZf1eHNWejs
VT8fgidpUK79jgGRqRrU624oEeVupB/LWTVkVZ/Rfb1s41Agmaxc9KqMDBIbV9yI
owsHQF28RwKBgBnolotNOoFHvQ9JvTqebMaPqApKq+AlTdf8Yd2jcJSd+/ZVU8iS
UiQ45YfFv+c8WtTjyMNVWlTwAzlsZ1jwnjCRiM/krflM3cbLQXG5PhxkAdZT506S
V99EoSxLpZqbhboiTdggAgNSJaYKqvSryg8mY6UYBDbQS4SNfLmj9f6BAoGBAODz
HguaUCsGsSCbZ5WxtPetdf+8nsRNT5IbFxAm32ug1ucHIHqVPJuqdAP3TEqEO24K
2T0yzQSH353iBiVpGqv0ofhxi73kVIYsM64vXBpYc8S4z/+lglOllZWfKTsF89Hg
Zuiwfq5GYyqp9NZyiOYlocNr8R8MrDZhKMtMjtsFAoGAK5OpWRq4E776id5+FJDk
utI8g+nZyAif3kK+JRMQ3r2Mkcy1fR7nryxXUTveXsyTpVUv4cR/pvQ/4Ax4Ov1J
3qBo4kDIlfQoOx6lzACHYFG0NpP3h8TjDQQaski/LD85HmOguoR4Jg93M9nzSvaa
GUvVxxVLjWwLvCUBGEE/A+4=
-----END PRIVATE KEY-----
GOOGLE_SHEETS_CLIENT_EMAIL=sheet-reader-2025@nanodrip-store.iam.gserviceaccount.com
GOOGLE_SHEETS_CLIENT_ID=111104283473602447170
LIVE_SHEET_ID=1e3edGQvk3rvrMs8HtofRWlsDrE2XHISyyFykF7jMz8g
```

## Steps to add to Netlify:

1. Go to your Netlify dashboard
2. Navigate to your site settings
3. Go to Environment Variables section
4. Add each of the above variables

## Important Notes:
- Make sure GOOGLE_SHEETS_PRIVATE_KEY includes the full private key with newlines preserved
- Double-check that all values match exactly what's working in localhost
- After adding variables, redeploy your site

## Other Required Variables:
Make sure these are also set in production:
```
DATABASE_URL=your-production-database-url
DIRECT_URL=your-production-direct-database-url
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```
