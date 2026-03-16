# Polis_API

## Notiser for favoritomraden

Projektet har nu stod for prenumeration pa favoritomraden i handelser:

- Frontend sparar favoritomraden under `favorites/{uid}/locations` i Realtime Database.
- Cloud Function `sendAreaNotifications` kor var 10:e minut och matchar nya handelser mot varje anvandares favoritomraden.
- Notiser kan skickas via e-post (SMTP) och push (FCM).

### 1) Satt upp Cloud Functions

Kora i projektroten:

```bash
cd functions
npm install
```

### 2) Satt miljo variabler for e-post

I PowerShell (exempel):

```powershell
firebase functions:config:set smtp.host="smtp.gmail.com" smtp.port="587" smtp.user="din@epost.se" smtp.pass="ditt_losenord" smtp.from="din@epost.se"
```

Om du anvander nyare Firebase CLI med Secret Manager kan du i stallet satta `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` som deploy secrets och lasa via `process.env`.

### 2.1) Satt VAPID-nyckel for push i frontend

Skapa en `.env` i projektroten (`C:/Polis_API`) med:

```bash
REACT_APP_FIREBASE_VAPID_KEY=DIN_PUBLIC_VAPID_KEY
```

VAPID-nyckeln hamtas i Firebase Console under Cloud Messaging (Web Push certificates).

### 3) Deploy funktioner

```bash
firebase deploy --only functions
```

### 4) Databasstruktur som anvands

```text
users/{uid}/email
favorites/{uid}/locations/{locationId}
favorites/{uid}/locations/{locationId}/emailNotifications
favorites/{uid}/locations/{locationId}/pushNotifications
notificationTokens/{uid}/{fcmToken}: true
notificationState/lastRunAt
```

### 5) Realtime Database-regler (minimum)

```json
{
	"rules": {
		"users": {
			"$uid": {
				".read": "auth != null && auth.uid === $uid",
				".write": "auth != null && auth.uid === $uid"
			}
		},
		"favorites": {
			"$uid": {
				".read": "auth != null && auth.uid === $uid",
				".write": "auth != null && auth.uid === $uid"
			}
		},
		"notificationTokens": {
			"$uid": {
				".read": "auth != null && auth.uid === $uid",
				".write": "auth != null && auth.uid === $uid"
			}
		},
		"notificationState": {
			".read": false,
			".write": false
		}
	}
}
```

Notera: for att push ska fungera fullt ut maste appen ocksa registrera FCM-token och spara den i `notificationTokens/{uid}`.