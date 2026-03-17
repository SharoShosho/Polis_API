# Polis API

En React-app som visar polisstationer och aktuella händelser från Polisen, med Firebase-inloggning, favoriter, profilsida och notifieringar för favoritområden.

## Status

Appen är för närvarande inte deployad, eftersom notifieringsdelen använder schemalagda Cloud Functions som kan medföra kostnader.

## Funktioner

- Startsida med välkomsttext och snabblänkar till appens viktigaste delar.
- Lista över polisstationer med sökning, karta och möjlighet att spara stationer som favoriter.
- Lista över aktuella händelser från Polisen med filtrering på plats.
- Inloggning och registrering via Firebase Authentication.
- Profilsida för inloggad användare med kontouppgifter, utloggning och möjlighet att radera konto.
- Favoritsida där användaren kan hantera favoritstationer, favorithändelser och favoritområden.
- Stöd för e-post- och pushnotiser för favoritområden via Firebase Realtime Database och Cloud Functions.

## Teknik

- React 19
- React Router
- Firebase Authentication
- Firebase Realtime Database
- Firebase Cloud Messaging
- Firebase Cloud Functions
- Leaflet / React Leaflet

## Projektstruktur

```text
.
|-- src/
|   |-- components/
|   |   |-- auth/
|   |   |-- events/
|   |   |-- favorites/
|   |   |-- home/
|   |   |-- map/
|   |   |-- policeStations/
|   |   |-- profile/
|   |   `-- search/
|   |-- notifications/
|   |-- style/
|   |-- App.jsx
|   `-- Firebase.js
|-- public/
|-- functions/
|-- firebase.json
`-- package.json
```

## Kom igång

### 1. Installera beroenden

I projektroten:

```bash
npm install
```

För Cloud Functions:

```bash
cd functions
npm install
```

### 2. Starta appen lokalt

Frontend:

```bash
npm start
```

Frontend och Functions-emulator samtidigt:

```bash
npm run start:all
```

Endast Functions-emulator:

```bash
npm run start:backend
```

## Scripts

I projektroten:

```bash
npm start
npm run start:frontend
npm run start:backend
npm run start:all
npm run build
npm test
```

I `functions/`:

```bash
npm run serve
npm run deploy
npm run logs
```

## Routing i appen

- `/` visar startsidan.
- `/police-stations` visar polisstationer.
- `/events` visar aktuella händelser.
- `/login` visar inloggning.
- `/register` visar registrering.
- `/favorites` kräver inloggning.
- `/profile` kräver inloggning.

## Firebase-konfiguration

Frontend använder Firebase-konfigurationen som ligger direkt i `src/Firebase.js`.

Projektet använder dessa Firebase-tjänster:

- Authentication för inloggning och registrering.
- Realtime Database för profiler, favoriter och notifieringstokens.
- Cloud Messaging för web push.
- Cloud Functions för schemalagda områdesnotiser.

## Miljövariabler

### Frontend

Skapa en `.env` i projektroten om du vill aktivera pushnotiser i webbläsaren:

```bash
REACT_APP_FIREBASE_VAPID_KEY=DIN_PUBLIC_VAPID_KEY
```

Den publika VAPID-nyckeln hämtas från Firebase Console under Cloud Messaging.

### Cloud Functions

Notifieringar via e-post läser SMTP-inställningar från antingen Firebase runtime config eller vanliga miljövariabler.

Exempel med Firebase config:

```powershell
firebase functions:config:set smtp.host="smtp.gmail.com" smtp.port="587" smtp.user="din@epost.se" smtp.pass="ditt_losenord" smtp.from="din@epost.se"
```

Alternativt kan följande miljövariabler användas:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
FROM_EMAIL
```

## Datamodell i Realtime Database

Projektet använder främst följande noder:

```text
users/{uid}
users/{uid}/fullName
users/{uid}/email
users/{uid}/createdAt

favorites/{uid}/stations/{stationId}
favorites/{uid}/events/{eventId}
favorites/{uid}/locations/{locationId}
favorites/{uid}/locations/{locationId}/emailNotifications
favorites/{uid}/locations/{locationId}/pushNotifications

notificationTokens/{uid}/{fcmToken}: true
notificationState/lastRunAt
```

## Notifieringar för favoritområden

Cloud Function `sendAreaNotifications` körs var 10:e minut och gör följande:

- hämtar senaste händelser från `https://polisen.se/api/events`
- jämför händelsernas plats med användarnas sparade favoritområden
- skickar e-post om `emailNotifications` är aktiverat
- skickar push om `pushNotifications` är aktiverat
- sparar senaste körningstid i `notificationState/lastRunAt`

Push-token registreras i frontend när användaren aktiverar push från favoritsidan.

## Minsta Realtime Database-regler

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

## Bygga för produktion

```bash
npm run build
```

Det genererar en produktionsbuild i `build/`.

## Deploy

Deploy av Cloud Functions:

```bash
cd functions
npm run deploy
```

Om du även använder Firebase Hosting behöver du komplettera med hosting-konfiguration och deploya den separat.