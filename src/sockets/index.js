const { buildVectors, cosineSimilarity } = require('../services/matching.service');
const { translateText } = require('../services/translation.service');
const { containsProfanity, censor } = require('../services/moderation.service');
const { createBucket, tryConsume } = require('../services/rateLimiter.service');

const waitingQueue = [];
const MAX_STRIKES = 3;
const MESSAGE_BUCKET_CAPACITY = 5;
const MESSAGE_REFILL_RATE = 0.5; // one new token every 2 seconds

function matchOrQueue(socket) {
  if (waitingQueue.length > 0) {
    const pool = [...waitingQueue.map((s) => s.profile), socket.profile];
    const vectors = buildVectors(pool);
    const newVector = vectors[vectors.length - 1];

    let bestIndex = 0;
    let bestScore = -Infinity;

    waitingQueue.forEach((candidate, i) => {
      const score = cosineSimilarity(newVector, vectors[i]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });

    const partner = waitingQueue[bestIndex];
    waitingQueue.splice(bestIndex, 1);

    const roomId = `room-${socket.id}-${partner.id}`;

    socket.join(roomId);
    partner.join(roomId);

    socket.roomId = roomId;
    partner.roomId = roomId;
    socket.partner = partner;
    partner.partner = socket;

    socket.emit('matched', {
      partner: { nickname: partner.profile.nickname, language: partner.profile.language }
    });
    partner.emit('matched', {
      partner: { nickname: socket.profile.nickname, language: socket.profile.language }
    });
  } else {
    waitingQueue.push(socket);
    socket.emit('waiting');
  }
}

function leaveCurrentRoom(socket) {
  if (socket.partner) {
    socket.partner.emit('partner-left');
    socket.partner.roomId = null;
    socket.partner.partner = null;
  }
  socket.roomId = null;
  socket.partner = null;
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('find-match', (profile) => {
      socket.profile = profile;
      matchOrQueue(socket);
    });

    socket.on('chat-message', async (data) => {
      if (!socket.roomId || !socket.partner) return;

      if (!socket.messageBucket) {
        socket.messageBucket = createBucket(MESSAGE_BUCKET_CAPACITY);
      }

      const allowed = tryConsume(socket.messageBucket, MESSAGE_BUCKET_CAPACITY, MESSAGE_REFILL_RATE);
      if (!allowed) {
        console.log('rate limited:', socket.id);
        return;
      }

      if (containsProfanity(data.text)) {
        socket.strikes = (socket.strikes || 0) + 1;
        socket.emit('moderation-warning', { strikeCount: socket.strikes, max: MAX_STRIKES });

        if (socket.strikes >= MAX_STRIKES) {
          socket.emit('kicked', { reason: 'Repeated inappropriate language.' });
          socket.disconnect(true);
          return;
        }
      }

      const safeText = censor(data.text);

      const myLanguage = socket.profile.language;
      const partnerLanguage = socket.partner.profile.language;

      let translated = null;
      if (myLanguage !== partnerLanguage) {
        translated = await translateText(safeText, partnerLanguage);
      }

      const payload = {
        fromId: socket.id,
        from: socket.profile.nickname,
        text: safeText,
        translated,
        ts: Date.now(),
      };

      io.to(socket.roomId).emit('chat-message', payload);
    });

    socket.on('skip', () => {
      leaveCurrentRoom(socket);
      matchOrQueue(socket);
    });

    socket.on('disconnect', () => {
      console.log('a user disconnected:', socket.id);

      const queueIndex = waitingQueue.indexOf(socket);
      if (queueIndex !== -1) {
        waitingQueue.splice(queueIndex, 1);
      }

      leaveCurrentRoom(socket);
    });
  });
}

module.exports = registerSocketHandlers;