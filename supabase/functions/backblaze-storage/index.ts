import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

interface B2UploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { action, fileName, fileData, fileId } = await req.json();

    const KEY_ID = Deno.env.get("BACKBLAZE_KEY_ID");
    const APPLICATION_KEY = Deno.env.get("BACKBLAZE_APPLICATION_KEY");
    const BUCKET_ID = Deno.env.get("BACKBLAZE_BUCKET_ID");

    if (!KEY_ID || !APPLICATION_KEY || !BUCKET_ID) {
      throw new Error("Backblaze credentials not configured");
    }

    // Authorize with B2
    const authResponse = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(`${KEY_ID}:${APPLICATION_KEY}`)}`,
      },
    });

    if (!authResponse.ok) {
      throw new Error("Failed to authorize with Backblaze");
    }

    const authData: B2AuthResponse = await authResponse.json();

    // Helper: confirm a fileId belongs to the current user via our metadata table
    const userOwnsFile = async (fid: string): Promise<{ owns: boolean; fileName?: string }> => {
      const { data, error } = await supabase
        .from("backblaze_files")
        .select("file_name")
        .eq("file_id", fid)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Ownership check failed:", error);
        return { owns: false };
      }
      return { owns: !!data, fileName: data?.file_name };
    };

    switch (action) {
      case "list": {
        // Scope listing to this user's prefix only
        const listResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
          method: "POST",
          headers: {
            Authorization: authData.authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucketId: BUCKET_ID,
            prefix: `${user.id}/`,
            maxFileCount: 1000,
          }),
        });

        if (!listResponse.ok) {
          throw new Error("Failed to list files");
        }

        const listData = await listResponse.json();
        return new Response(JSON.stringify(listData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "upload": {
        if (!fileName || !fileData) {
          throw new Error("Missing file name or data");
        }

        // Force user-scoped storage prefix to prevent path collisions / cross-user access
        const safeName = fileName.replace(/^\/+/, "");
        const scopedFileName = `${user.id}/${safeName}`;

        // Get upload URL
        const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
          method: "POST",
          headers: {
            Authorization: authData.authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bucketId: BUCKET_ID }),
        });

        if (!uploadUrlResponse.ok) {
          throw new Error("Failed to get upload URL");
        }

        const uploadUrlData: B2UploadUrlResponse = await uploadUrlResponse.json();

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
        const sha1Hash = await crypto.subtle.digest("SHA-1", binaryData);
        const hashArray = Array.from(new Uint8Array(sha1Hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Upload file under user-scoped path
        const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
          method: "POST",
          headers: {
            Authorization: uploadUrlData.authorizationToken,
            "X-Bz-File-Name": encodeURIComponent(scopedFileName),
            "Content-Type": "b2/x-auto",
            "X-Bz-Content-Sha1": hashHex,
          },
          body: binaryData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }

        const uploadResult = await uploadResponse.json();

        // Save metadata to Supabase (store the original display name; ownership is via user_id)
        const { error: dbError } = await supabase.from("backblaze_files").insert({
          user_id: user.id,
          file_name: safeName,
          file_id: uploadResult.fileId,
          file_size: binaryData.length,
          content_type: uploadResult.contentType,
        });

        if (dbError) {
          console.error("Failed to save file metadata:", dbError);
        }

        return new Response(JSON.stringify(uploadResult), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "download": {
        if (!fileId) {
          throw new Error("Missing file ID");
        }

        // Verify the requesting user owns this file
        const ownership = await userOwnsFile(fileId);
        if (!ownership.owns) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const downloadResponse = await fetch(
          `${authData.downloadUrl}/b2api/v2/b2_download_file_by_id?fileId=${fileId}`,
          {
            headers: {
              Authorization: authData.authorizationToken,
            },
          }
        );

        if (!downloadResponse.ok) {
          throw new Error("Failed to download file");
        }

        const fileContent = await downloadResponse.arrayBuffer();
        const contentType = downloadResponse.headers.get("Content-Type") || "application/octet-stream";

        return new Response(fileContent, {
          headers: {
            ...corsHeaders,
            "Content-Type": contentType,
          },
        });
      }

      case "delete": {
        if (!fileId || !fileName) {
          throw new Error("Missing file ID or name");
        }

        // Verify ownership before deleting
        const ownership = await userOwnsFile(fileId);
        if (!ownership.owns) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Use the user-scoped path stored in B2 (prefix with user id)
        const scopedFileName = `${user.id}/${(ownership.fileName ?? fileName).replace(/^\/+/, "")}`;

        const deleteResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_file_version`, {
          method: "POST",
          headers: {
            Authorization: authData.authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId,
            fileName: scopedFileName,
          }),
        });

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete file");
        }

        // Delete metadata from Supabase
        const { error: dbError } = await supabase
          .from("backblaze_files")
          .delete()
          .eq("file_id", fileId)
          .eq("user_id", user.id);

        if (dbError) {
          console.error("Failed to delete file metadata:", dbError);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});