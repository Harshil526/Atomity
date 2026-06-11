/**
 * Vercel Serverless Function entry point.
 *
 * TanStack Start v1.x builds a Web-standard Fetch API handler
 * (dist/server/server.js exports `{ fetch(Request): Promise<Response> }`).
 *
 * Vercel Node.js Serverless Functions use the Node.js http interface
 * (IncomingMessage / ServerResponse). This file bridges the two.
 */

import { createServer } from "node:http";
import { Readable } from "node:stream";

// Import the built TanStack Start server handler
let serverHandler;
async function getHandler() {
  if (!serverHandler) {
    const mod = await import("../.output/server/chunks/server.mjs").catch(
      () => import("../dist/server/server.js")
    );
    serverHandler = mod.default ?? mod;
  }
  return serverHandler;
}

/**
 * Convert a Node.js IncomingMessage to a Web API Request.
 */
async function nodeRequestToWebRequest(req) {
  const host = req.headers["host"] || "localhost";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const url = new URL(req.url, `${protocol}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const method = req.method || "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  let body = undefined;
  if (hasBody) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }

  return new Request(url.toString(), {
    method,
    headers,
    body: hasBody && body && body.length > 0 ? body : undefined,
  });
}

/**
 * Write a Web API Response to a Node.js ServerResponse.
 */
async function webResponseToNodeResponse(webResponse, res) {
  res.statusCode = webResponse.status;

  for (const [key, value] of webResponse.headers.entries()) {
    res.setHeader(key, value);
  }

  if (webResponse.body) {
    const reader = webResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }

  res.end();
}

export default async function handler(req, res) {
  try {
    const mod = await getHandler();
    const fetchFn = mod.fetch ?? mod.default?.fetch;

    if (typeof fetchFn !== "function") {
      res.statusCode = 500;
      res.end("Server handler not found");
      return;
    }

    const webRequest = await nodeRequestToWebRequest(req);
    const webResponse = await fetchFn(webRequest, {}, {});
    await webResponseToNodeResponse(webResponse, res);
  } catch (err) {
    console.error("[vercel-handler] Error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
