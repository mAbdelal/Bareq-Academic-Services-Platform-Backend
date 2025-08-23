const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler")
const rateLimit = require("./middlewares/rateLimiter");
const cors = require("./middlewares/corsMiddleware");
const app = express();
const checkDatabase = require("./utils/dbHealth");
const { success } = require("./utils/response");
const { NODE_ENV } = require("./config/env");
const indexRoutes = require("./routes/index");


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(rateLimit);
app.use(cors);

app.use("/api/v1", indexRoutes);

app.get('/health', async (req, res) => {
    const dbStatus = await checkDatabase();
    if (dbStatus.status === 'error') {
        return res.status(500).json({ success: false, message: 'Database connection failed', error: NODE_ENV === 'production' ? 'Internal Server Error' : dbStatus.error });
    }
    success(res, { status: dbStatus.status }, 'Database health check successful');

});

app.use(errorHandler);

module.exports = app;