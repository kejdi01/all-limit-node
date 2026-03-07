import { rateLimit, TokenBucket } from "./index";
import { createServer } from "http";

const usersLimiter = rateLimit({
  algorithm: TokenBucket,
  options: { capacity: 9, refillRate: 1, refillInterval: 1000 },
});

const postsLimiter = rateLimit({
  algorithm: TokenBucket,
  options: { capacity: 3, refillRate: 1, refillInterval: 2000 },
});

const server = createServer(async (req, res) => {
  if (req.url === "/api/users") {
    if (!(await usersLimiter(req, res))) return;

    res.writeHead(200);
    return res.end("users endpoint");
  }

  if (req.url === "/api/posts") {
    if (!(await postsLimiter(req, res))) return;

    res.writeHead(200);
    return res.end("posts endpoint");
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
