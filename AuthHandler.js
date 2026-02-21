// lib/auth.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Encode secret key
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

/**
 * Wraps an API handler with authentication logic.
 * @param {Function} handler - The original API route function (GET, POST, etc.)
 */
export function withAuth(handler) {
  return async (req, params) => {

    // 1️⃣ Extract Authorization Header
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid Authorization header" }, // changed
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // 2️⃣ Verify JWT Token
      const { payload } = await jwtVerify(token, SECRET_KEY);

      // Optional: attach user info (example)
      // req.headers.set("x-user-id", payload.id);

      // 3️⃣ Token valid → Execute handler
      return handler(req, params);

    } catch (error) {
      console.error("Authentication Error:", error.message); // changed wording

      return NextResponse.json(
        { success: false, error: "Session expired or token invalid" }, // changed
        { status: 401 }
      );
    }
  };
}