import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { verifyAccess } from "./middleware";

const http = httpRouter();

// Register Better Auth routes
authComponent.registerRoutes(http, createAuth);

// Register middleware verification endpoint
http.route({
  path: "/api/middleware/verify",
  method: "GET",
  handler: verifyAccess,
});

export default http;
