import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Checking for due task notifications...");

    // Get all tasks that are due soon or overdue
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        due_date,
        user_id
      `)
      .eq("completed", false)
      .not("due_date", "is", null);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} incomplete tasks`);

    const now = new Date();
    const notifications = [];

    for (const task of tasks || []) {
      const dueDate = new Date(task.due_date);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Check if we should send notifications
      let notificationType = null;
      let message = "";

      if (timeDiff < 0) {
        // Task is overdue
        notificationType = "overdue";
        message = `Task "${task.title}" is overdue!`;
      } else if (hoursDiff <= 1 && hoursDiff > 0) {
        // Task due in 1 hour
        notificationType = "before_due";
        message = `Task "${task.title}" is due in less than 1 hour!`;
      } else if (hoursDiff <= 24 && hoursDiff > 1) {
        // Task due in 24 hours
        notificationType = "before_due";
        message = `Task "${task.title}" is due in ${Math.floor(hoursDiff)} hours!`;
      }

      if (notificationType) {
        // Check if notification was already sent
        const { data: existingNotif } = await supabase
          .from("task_notifications")
          .select("id")
          .eq("task_id", task.id)
          .eq("notification_type", notificationType)
          .not("sent_at", "is", null)
          .gte(
            "sent_at",
            new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
          )
          .single();

        if (!existingNotif) {
          // Send notification
          const { error: notifError } = await supabase.rpc("notify_user", {
            p_user_id: task.user_id,
            p_title: "Task Reminder",
            p_type: "task_reminder",
            p_message: message,
            p_data: {
              task_id: task.id,
              task_title: task.title,
              due_date: task.due_date,
              notification_type: notificationType,
            },
          });

          if (!notifError) {
            // Record that we sent this notification
            await supabase.from("task_notifications").insert({
              task_id: task.id,
              user_id: task.user_id,
              notification_type: notificationType,
              scheduled_for: dueDate.toISOString(),
              sent_at: now.toISOString(),
            });

            notifications.push({
              task_id: task.id,
              type: notificationType,
              sent: true,
            });

            console.log(`Sent ${notificationType} notification for task:`, task.title);
          }
        }
      }
    }

    // Send streak reminders
    console.log("Checking streak reminders...");
    const { error: streakError } = await supabase.rpc("send_streak_reminders");

    if (streakError) {
      console.error("Error sending streak reminders:", streakError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notifications.length,
        message: "Notifications processed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-task-notifications:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
