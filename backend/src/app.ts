import { config } from "./config/index.js";
import { corsMiddleware } from "./middleware/cors.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";
import { apiRateLimit, searchRateLimit } from "./middleware/rateLimit.js";
import { securityHeaders } from "./middleware/security.js";
import { validateRequest } from "./middleware/validation.js";
import detailsRoutes from "./routes/details.js";
import discoverRoutes from "./routes/discover.js";
import embedRoutes from "./routes/embed.js";
import healthRoutes from "./routes/health.js";
import picksRoutes from "./routes/picks.js";
import searchRoutes from "./routes/search.js";
import trendingRoutes from "./routes/trending.js";
import genresRoutes from "./routes/genres.js";
import express from "express";

const app = express();

app.use(requestLogger);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: "10kb" }));
app.use(validateRequest);

app.use("/", healthRoutes);

app.use("/api", apiRateLimit);

app.use("/api/search", searchRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api", genresRoutes);

app.use("/api", trendingRoutes);
app.use("/api", detailsRoutes);
app.use("/api/embed", embedRoutes);
app.use("/api", picksRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`🚀 netflyer API v2.0.0 running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🔒 Security: enabled`);
  console.log(`⚡ Caching: enabled`);
  console.log(`🛡️  Rate limiting: enabled`);
});

export default app;
