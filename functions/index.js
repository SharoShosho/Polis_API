const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const functions = require('firebase-functions');
const { logger } = functions;

admin.initializeApp();

const db = admin.database();

function toIsoStringSafe(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function shouldNotifyForLocation(eventLocationName, locationName) {
  if (!eventLocationName || !locationName) {
    return false;
  }

  return eventLocationName.toLowerCase().includes(locationName.toLowerCase());
}

function buildEmailHtml(locationName, events) {
  const rows = events
    .map((event) => {
      const eventTime = event.datetime ? new Date(event.datetime).toLocaleString('sv-SE') : 'Okand tid';
      return `<li><strong>${event.name || 'Handelse'}</strong> (${eventTime}) - <a href="${event.url || '#'}">Las mer</a></li>`;
    })
    .join('');

  return `
    <h2>Nya handelser i ${locationName}</h2>
    <p>Foljande handelser matchar ditt favoritomrade:</p>
    <ul>${rows}</ul>
  `;
}

async function sendEmailNotification(email, locationName, events) {
  const runtimeConfig = functions.config ? functions.config() : {};
  const smtpConfig = runtimeConfig.smtp || {};

  const smtpHost = process.env.SMTP_HOST || smtpConfig.host;
  const smtpPort = Number(process.env.SMTP_PORT || smtpConfig.port || 587);
  const smtpUser = process.env.SMTP_USER || smtpConfig.user;
  const smtpPass = process.env.SMTP_PASS || smtpConfig.pass;
  const fromEmail = process.env.FROM_EMAIL || smtpConfig.from || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
    logger.warn('SMTP variables are missing, skipping email notification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject: `Polisnotis: Nya handelser i ${locationName}`,
    html: buildEmailHtml(locationName, events)
  });

  logger.info('Email notification sent', {
    email,
    locationName,
    eventsCount: events.length
  });
}

async function sendPushNotification(uid, locationName, events) {
  const tokensSnapshot = await db.ref(`notificationTokens/${uid}`).get();
  if (!tokensSnapshot.exists()) {
    return;
  }

  const tokenMap = tokensSnapshot.val() || {};
  const tokens = Object.keys(tokenMap).filter((token) => Boolean(tokenMap[token]));

  if (tokens.length === 0) {
    return;
  }

  const firstEvent = events[0];
  const body = firstEvent
    ? `${firstEvent.name || 'Ny handelse'} i ${locationName}`
    : `Nya handelser i ${locationName}`;

  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title: 'Polisnotis',
      body
    },
    data: {
      locationName
    }
  });

  logger.info('Push notification sent', {
    uid,
    locationName,
    eventsCount: events.length,
    tokensCount: tokens.length
  });
}

exports.sendAreaNotifications = onSchedule(
  {
    schedule: 'every 10 minutes',
    region: 'europe-west1',
    timeZone: 'Europe/Stockholm'
  },
  async () => {
    const [stateSnapshot, usersSnapshot, eventsResponse] = await Promise.all([
      db.ref('notificationState/lastRunAt').get(),
      db.ref('favorites').get(),
      fetch('https://polisen.se/api/events')
    ]);

    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events API: ${eventsResponse.status}`);
    }

    const events = await eventsResponse.json();
    const nowIso = new Date().toISOString();
    const sinceIso = toIsoStringSafe(stateSnapshot.val()) || new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const since = new Date(sinceIso);

    if (!usersSnapshot.exists()) {
      await db.ref('notificationState/lastRunAt').set(nowIso);
      return;
    }

    const usersFavorites = usersSnapshot.val() || {};

    for (const [uid, userData] of Object.entries(usersFavorites)) {
      const locations = userData.locations || {};
      const locationEntries = Object.values(locations);

      if (locationEntries.length === 0) {
        continue;
      }

      const userProfileSnapshot = await db.ref(`users/${uid}`).get();
      const userEmail = userProfileSnapshot.exists() ? userProfileSnapshot.val().email : null;

      for (const location of locationEntries) {
        const locationName = location.name;
        if (!locationName) {
          continue;
        }

        const matchingRecentEvents = events.filter((event) => {
          const eventTimeIso = toIsoStringSafe(event.datetime);
          if (!eventTimeIso) {
            return false;
          }

          const eventTime = new Date(eventTimeIso);
          if (eventTime <= since) {
            return false;
          }

          return shouldNotifyForLocation(event.location?.name, locationName);
        });

        if (matchingRecentEvents.length === 0) {
          continue;
        }

        logger.info('Matching events found for favorite location', {
          uid,
          locationName,
          matchingEvents: matchingRecentEvents.length
        });

        try {
          if (location.emailNotifications && userEmail) {
            await sendEmailNotification(userEmail, locationName, matchingRecentEvents);
          }

          if (location.pushNotifications) {
            await sendPushNotification(uid, locationName, matchingRecentEvents);
          }
        } catch (error) {
          logger.error('Failed to send notification', {
            uid,
            locationName,
            error: error.message
          });
        }
      }
    }

    await db.ref('notificationState/lastRunAt').set(nowIso);
    logger.info('Area notifications check completed', {
      since: sinceIso,
      now: nowIso
    });
  }
);
