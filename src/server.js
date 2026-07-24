const path = require('path');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const connectDatabase = require('./config/database');
const adminRoutes = require('./routes/admin.routes');

connectDatabase();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server);

const registerSocketHandlers = require('./sockets');
registerSocketHandlers(io);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});