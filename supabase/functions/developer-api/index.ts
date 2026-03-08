import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Path: /developer-api/v1/{resource}[/{id}]
  const version = pathParts[1]; // "v1"
  const resource = pathParts[2]; // "tasks", "pomodoro", etc.
  const resourceId = pathParts[3];

  const apiKey = req.headers.get("x-api-key");
  const authHeader = req.headers.get("authorization");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let userId: string;
  let keyId: string;
  let permissions: string[];
  let rateLimit: number;

  // Auth via API key or Bearer token
  if (apiKey) {
    const { data: keyData, error: keyError } = await supabase.rpc("validate_api_key", { p_api_key: apiKey });
    if (keyError || !keyData || keyData.length === 0) {
      return json({ error: "Invalid or expired API key" }, 401);
    }
    userId = keyData[0].key_user_id;
    keyId = keyData[0].key_id;
    permissions = keyData[0].permissions;
    rateLimit = keyData[0].rate_limit;
  } else if (authHeader?.startsWith("Bearer ")) {
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error } = await userClient.auth.getClaims(token);
    if (error || !claims?.claims?.sub) {
      return json({ error: "Invalid token" }, 401);
    }
    userId = claims.claims.sub as string;
    keyId = "session";
    permissions = ["read", "write", "delete"];
    rateLimit = 120;
  } else {
    return json({ error: "Missing authentication. Use x-api-key header or Bearer token." }, 401);
  }

  const startTime = Date.now();
  const method = req.method;

  // User-scoped Supabase client
  const userSupabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let result: unknown;

    switch (resource) {
      // ========== TASKS ==========
      case "tasks": {
        if (method === "GET" && !resourceId) {
          const status = url.searchParams.get("status");
          const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);
          const page = Number(url.searchParams.get("page") || 1);
          let query = userSupabase.from("tasks").select("*", { count: "exact" })
            .eq("user_id", userId)
            .range((page - 1) * limit, page * limit - 1)
            .order("created_at", { ascending: false });
          if (status === "completed") query = query.eq("completed", true);
          else if (status === "pending") query = query.eq("completed", false);
          const { data, error, count } = await query;
          if (error) throw error;
          result = { tasks: data, total: count, page, limit };
        } else if (method === "GET" && resourceId) {
          const { data, error } = await userSupabase.from("tasks").select("*")
            .eq("id", resourceId).eq("user_id", userId).single();
          if (error) throw error;
          result = { task: data };
        } else if (method === "POST") {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const { data, error } = await userSupabase.from("tasks").insert({
            user_id: userId,
            title: body.title,
            description: body.description,
            subject: body.subject,
            priority: body.priority || "medium",
            due_date: body.due_date,
          }).select().single();
          if (error) throw error;
          result = { task: data, message: "Task created" };
        } else if (method === "PUT" && resourceId) {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const { data, error } = await userSupabase.from("tasks").update(body)
            .eq("id", resourceId).eq("user_id", userId).select().single();
          if (error) throw error;
          result = { task: data, message: "Task updated" };
        } else if (method === "DELETE" && resourceId) {
          if (!permissions.includes("delete")) return json({ error: "Insufficient permissions" }, 403);
          const { error } = await userSupabase.from("tasks").delete()
            .eq("id", resourceId).eq("user_id", userId);
          if (error) throw error;
          result = { message: "Task deleted" };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== FOCUS SESSIONS (Pomodoro) ==========
      case "pomodoro":
      case "focus-sessions": {
        if (method === "GET" && !resourceId) {
          const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);
          const { data, error, count } = await userSupabase.from("focus_sessions")
            .select("*", { count: "exact" })
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);
          if (error) throw error;
          result = { sessions: data, total: count };
        } else if (method === "POST") {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const { data, error } = await userSupabase.from("focus_sessions").insert({
            user_id: userId,
            duration_minutes: body.duration_minutes || 25,
            subject: body.subject,
            session_type: body.session_type || "pomodoro",
          }).select().single();
          if (error) throw error;
          result = { session: data, message: "Focus session created" };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== CALENDAR / SCHEDULER ==========
      case "calendar":
      case "scheduler": {
        if (method === "GET") {
          const { data, error } = await userSupabase.from("scheduled_classes")
            .select("*")
            .eq("user_id", userId)
            .order("start_time", { ascending: true });
          if (error) throw error;
          result = { events: data };
        } else if (method === "POST") {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const { data, error } = await userSupabase.from("scheduled_classes").insert({
            user_id: userId,
            task_name: body.title || body.task_name,
            subject: body.subject,
            day_of_week: body.day_of_week,
            start_time: body.start_time,
            end_time: body.end_time,
            notes: body.notes,
          }).select().single();
          if (error) throw error;
          result = { event: data, message: "Event created" };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== STORAGE ==========
      case "storage": {
        if (method === "GET") {
          const { data: storageData } = await userSupabase.from("user_cloud_storage")
            .select("*").eq("user_id", userId).maybeSingle();
          const { data: files, error } = await userSupabase.from("user_cloud_files")
            .select("id, file_name, file_size, content_type, folder_id, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50);
          if (error) throw error;
          result = {
            storage: {
              used_bytes: storageData?.total_bytes || 0,
              file_count: files?.length || 0,
            },
            files: files || [],
          };
        } else {
          return json({ error: "Method not allowed. Use the upload endpoint for file uploads." }, 405);
        }
        break;
      }

      // ========== PROFILE ==========
      case "profile": {
        if (method === "GET") {
          const { data, error } = await userSupabase.from("profiles")
            .select("user_id, full_name, username, display_name, avatar_url, bio, xp, level, is_verified, created_at")
            .eq("user_id", userId).single();
          if (error) throw error;
          result = { profile: data };
        } else if (method === "PUT") {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const allowed = ["full_name", "display_name", "bio", "avatar_url"];
          const updates: Record<string, unknown> = {};
          for (const k of allowed) {
            if (body[k] !== undefined) updates[k] = body[k];
          }
          const { data, error } = await userSupabase.from("profiles").update(updates)
            .eq("user_id", userId).select().single();
          if (error) throw error;
          result = { profile: data, message: "Profile updated" };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== FLASHCARDS ==========
      case "flashcards": {
        if (method === "GET" && !resourceId) {
          const { data, error } = await userSupabase.from("flashcard_decks")
            .select("*").eq("user_id", userId).order("created_at", { ascending: false });
          if (error) throw error;
          result = { decks: data };
        } else if (method === "GET" && resourceId) {
          const { data: deck } = await userSupabase.from("flashcard_decks")
            .select("*").eq("id", resourceId).eq("user_id", userId).single();
          const { data: cards } = await userSupabase.from("flashcards")
            .select("*").eq("deck_id", resourceId).order("created_at");
          result = { deck, cards };
        } else if (method === "POST") {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const { data, error } = await userSupabase.from("flashcard_decks").insert({
            user_id: userId,
            title: body.title,
            description: body.description,
            subject: body.subject,
          }).select().single();
          if (error) throw error;
          result = { deck: data, message: "Deck created" };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== NOTES ==========
      case "notes": {
        if (method === "GET") {
          const { data, error } = await userSupabase.from("cornell_notes")
            .select("*").eq("user_id", userId).order("created_at", { ascending: false });
          if (error) throw error;
          result = { notes: data };
        } else if (method === "POST") {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const { data, error } = await userSupabase.from("cornell_notes").insert({
            user_id: userId,
            title: body.title,
            main_notes: body.content || body.main_notes,
            cues: body.cues,
            summary: body.summary,
            subject: body.subject,
          }).select().single();
          if (error) throw error;
          result = { note: data, message: "Note created" };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== STUDY STREAKS ==========
      case "streaks": {
        if (method === "GET") {
          const { data, error } = await userSupabase.from("study_streaks")
            .select("*").eq("user_id", userId)
            .order("study_date", { ascending: false }).limit(30);
          if (error) throw error;
          const { data: currentStreak } = await userSupabase.rpc("get_current_streak", { p_user_id: userId });
          result = { current_streak: currentStreak, history: data };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== EXAMS ==========
      case "exams": {
        if (method === "GET") {
          const { data, error } = await userSupabase.from("exams")
            .select("*").eq("user_id", userId).order("exam_date", { ascending: true });
          if (error) throw error;
          result = { exams: data };
        } else if (method === "POST") {
          if (!permissions.includes("write")) return json({ error: "Insufficient permissions" }, 403);
          const body = await req.json();
          const { data, error } = await userSupabase.from("exams").insert({
            user_id: userId,
            name: body.name,
            subject: body.subject,
            exam_date: body.exam_date,
            exam_type: body.exam_type,
          }).select().single();
          if (error) throw error;
          result = { exam: data, message: "Exam created" };
        } else {
          return json({ error: "Method not allowed" }, 405);
        }
        break;
      }

      // ========== API STATUS ==========
      case "status": {
        result = {
          status: "operational",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          endpoints: [
            "GET /v1/tasks", "POST /v1/tasks", "PUT /v1/tasks/:id", "DELETE /v1/tasks/:id",
            "GET /v1/pomodoro", "POST /v1/pomodoro",
            "GET /v1/calendar", "POST /v1/calendar",
            "GET /v1/storage",
            "GET /v1/profile", "PUT /v1/profile",
            "GET /v1/flashcards", "GET /v1/flashcards/:id", "POST /v1/flashcards",
            "GET /v1/notes", "POST /v1/notes",
            "GET /v1/streaks",
            "GET /v1/exams", "POST /v1/exams",
          ],
        };
        break;
      }

      default:
        return json({
          error: "Unknown endpoint",
          available: ["tasks", "pomodoro", "calendar", "storage", "profile", "flashcards", "notes", "streaks", "exams", "status"],
        }, 404);
    }

    // Log usage
    const responseTime = Date.now() - startTime;
    if (keyId !== "session") {
      await userSupabase.from("api_usage_logs").insert({
        api_key_id: keyId,
        user_id: userId,
        endpoint: `/${resource}${resourceId ? "/" + resourceId : ""}`,
        method,
        status_code: 200,
        response_time_ms: responseTime,
      }).then(() => {});
    }

    return json(result);
  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    if (keyId !== "session") {
      await userSupabase.from("api_usage_logs").insert({
        api_key_id: keyId,
        user_id: userId,
        endpoint: `/${resource}${resourceId ? "/" + resourceId : ""}`,
        method,
        status_code: 500,
        response_time_ms: responseTime,
      }).then(() => {});
    }
    return json({ error: err.message || "Internal server error" }, 500);
  }
});
