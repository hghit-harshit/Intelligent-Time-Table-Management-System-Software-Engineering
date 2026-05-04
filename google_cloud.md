{
  "redirect_uris": [
    "http://localhost:8000/auth/callback",
    "http://localhost:3000/oauth2callback"
  ]
}

{
  "origins": [
    "http://localhost:8000",
    "http://localhost:3000"
  ]
}

{
  "scopes": [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.students",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents"
  ]
}

{
  "user_type": "External",
  "publishing_status": "Production (after clicking Publish app)"
}

{
  "authorization_url": "https://accounts.google.com/o/oauth2/auth",
  "token_exchange_url": "https://oauth2.googleapis.com/token"
}

{
  "access_type": "offline",
  "prompt": "consent",
  "response_type": "code"
}

{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "scope": "...",
  "token_type": "Bearer"
}

https://oauth2.googleapis.com/token

{
  "client_id": "...",
  "client_secret": "...",
  "refresh_token": "...",
  "grant_type": "refresh_token"
}

GET https://classroom.googleapis.com/v1/courses

GET https://www.googleapis.com/drive/v3/files

POST https://docs.googleapis.com/v1/documents

OAUTHLIB_INSECURE_TRANSPORT=1