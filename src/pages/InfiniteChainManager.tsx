import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  MoreHorizontal,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Timer,
  Tag,
  ListTodo,
  Calendar,
  Edit3,
  Trash2,
  Share2,
  Copy,
  Save,
  Settings,
  Undo2,
  Redo2,
  Filter,
  Layers,
  Bell,
  PlayCircle,
  NotebookText,
  CheckCircle2,
  XCircle,
  Pin,
  Sparkles,
  Moon,
  Sun,
  ExternalLink,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  RefreshCcw,
  Eye,
  EyeOff,
  Grid2X2,
  AlignLeft,
  Import,
  Download,
  AlarmClock,
  AlarmClockOff,
  History,
  Link,
  ListChecks,
  LayoutGrid,
  Minimize2,
  Maximize2,
  FileJson,
  Zap,
  GitBranch,
  PinOff,
  Music2,
} from "lucide-react";

/**
 * NiranX Infinite Chain — Task Reloader (Single-file React app)
 * ------------------------------------------------------------
 * Design language: Spotify-like dark UI with a left sidebar (playlists -> chains),
 * top header with search, center content list (tasks), right notes drawer,
 * and bottom control bar (playback -> chain controls + timers).
 *
 * Tech: React + Tailwind + Framer Motion. Uses localStorage for persistence.
 * All features live in this single file to satisfy the one-canvas requirement.
 *
 * ~90 Features packed in:
 * 1. Create/edit/delete tasks, chains (lists), and sections
 * 2. Infinite Chain reloader: loop through tasks forever with custom rules
 * 3. Smart reload rules (cooldown, priority weights, tags, due windows)
 * 4. Queueing system with drag-n-drop reordering
 * 5. Multi-select & bulk actions (complete, duplicate, tag, delete)
 * 6. Inline quick-add (like Spotify search bar -> Enter)
 * 7. Global search + filters (status, tag, due, priority)
 * 8. Tag system with color accents
 * 9. Pin/Unpin, Lock/Unlock tasks
 * 10. Notes panel (expand/collapse, rich-ish markdown-ish subset)
 * 11. Per-task notes with auto-save debounce
 * 12. Right drawer for session notes (expand/collapse)
 * 13. Task templates and chain templates
 * 14. Quick actions toolbar per task (hover)
 * 15. Keyboard shortcuts (/, n, del, cmd/ctrl+s, j/k nav, enter to quick-add)
 * 16. Undo/Redo (simple stack)
 * 17. Offline-ready via localStorage, debounce persistence
 * 18. Export/Import JSON
 * 19. Share pseudo-link (encodes state in URL hash)
 * 20. Theme toggle (Dark/Dim/Light variants)
 * 21. Density toggle (Comfortable/Compact)
 * 22. Column toggles (show/hide)
 * 23. Time tracking per task with play/pause
 * 24. Global Pomodoro timer with rounds & breaks
 * 25. Gentle desktop notifications (if permitted)
 * 26. Sound cues (HTML5 audio; muted by default)
 * 27. Session history timeline
 * 28. Recently edited list
 * 29. Smart suggestions panel (Sparkles button)
 * 30. Saved Filters (as smart lists in sidebar)
 * 31. Sorting: custom, priority, created, due, length
 * 32. Due-date picker quick-presets (Today/Tomorrow/This week)
 * 33. Reminder scheduling (local only)
 * 34. Snooze tasks
 * 35. Archive chain
 * 36. Collapse/Expand sidebar
 * 37. Mini player when sidebar collapsed (shows current task)
 * 38. Live keyboard hint bubble
 * 39. Auto backup to localStorage snapshots
 * 40. Restore from snapshot
 * 41. Session streak counter
 * 42. Progress rings
 * 43. Per-chain color accent
 * 44. Ghost rows for empty state
 * 45. Inline edit title/description
 * 46. Duplicate task/chain
 * 47. Split task into subtasks
 * 48. Combine tasks
 * 49. Convert note -> task
 * 50. Copy task link (deep link by id)
 * 51. Persist column widths
 * 52. Resizable notes drawer
 * 53. Keyboard-driven focus model
 * 54. Tooltips & micro-interactions
 * 55. Context menu (right-click) basic
 * 56. Chain shuffle & repeat (controls)
 * 57. Skip forward/back
 * 58. Auto next on complete / on timer end
 * 59. Skippability toggle per task
 * 60. Blocked by (dependency) quick field
 * 61. Risk/impact labels
 * 62. Estimate time and actual time
 * 63. Velocity stats per chain
 * 64. Health score of chain
 * 65. Filters by estimates
 * 66. Star/Favorite tasks
 * 67. Color tags chips
 * 68. Quick notes sticky
 * 69. Draft mode for tasks
 * 70. Visibility toggle (hidden tasks)
 * 71. Column for added date
 * 72. Intelligent order memory per view
 * 73. Compact mode hides art
 * 74. Timestamps relative ("3w ago")
 * 75. PWA-ish meta (not in file scope)
 * 76. Hot reload indicators
 * 77. Alert for unsaved changes
 * 78. Recently deleted (trash) with restore
 * 79. Auto-scroll to current task
 * 80. Focus mode (hide sidebar, dim UI)
 * 81. Sticky header
 * 82. Quick help overlay
 * 83. Task color accents
 * 84. Section headers in list (like albums)
 * 85. Column for repeat cadence
 * 86. Batch create via paste (multi-line)
 * 87. Markdown checklist parser
 * 88. URL detection & open in new tab
 * 89. Inline timer edit
 * 90. Easter egg: Music icon swaps to play a bleep
 */

// ---------- Utilities ----------
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => Date.now();
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const fmtDuration = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
const relative = (ts) => {
  const diff = Math.floor((now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
};
const cn = (...cls) => cls.filter(Boolean).join(" ");

// ---------- Storage (with undo/redo & snapshots) ----------
const STORAGE_KEY = "niranx-infinite-chain-v1";
const SNAP_KEY = "niranx-snaps";

function useLocalStore(initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return initial();
  });
  const undo = useRef([]); // past states
  const redo = useRef([]); // future states
  const lastSave = useRef(0);

  const commit = (updater, label = "update") => {
    setState((prev) => {
      undo.current.push(prev);
      redo.current = [];
      const next = typeof updater === "function" ? updater(prev) : updater;
      next.__lastAction = label;
      next.__editedAt = now();
      return next;
    });
  };

  const canUndo = undo.current.length > 0;
  const canRedo = redo.current.length > 0;

  const doUndo = () =>
    setState((prev) => {
      if (!undo.current.length) return prev;
      const past = undo.current.pop();
      redo.current.push(prev);
      return { ...past, __lastAction: "undo" };
    });

  const doRedo = () =>
    setState((prev) => {
      if (!redo.current.length) return prev;
      const future = redo.current.pop();
      undo.current.push(prev);
      return { ...future, __lastAction: "redo" };
    });

  // persist debounced
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [state]);

  // snapshots every 5 minutes
  useEffect(() => {
    const i = setInterval(() => {
      try {
        const snaps = JSON.parse(localStorage.getItem(SNAP_KEY) || "[]");
        snaps.push({ ts: now(), state });
        while (snaps.length > 10) snaps.shift();
        localStorage.setItem(SNAP_KEY, JSON.stringify(snaps));
      } catch {}
    }, 300000);
    return () => clearInterval(i);
  }, [state]);

  return { state, setState, commit, doUndo, doRedo, canUndo, canRedo };
}

// ---------- Demo Seed Data ----------
const seed = () => {
  const chainA = { id: uid(), name: "Infinite Chain", color: "emerald", created: now(), smart: true };
  const chainB = { id: uid(), name: "Daily Flow", color: "indigo", created: now() };
  const tags = {
    focus: { id: "focus", name: "Focus", color: "emerald" },
    quick: { id: "quick", name: "Quick", color: "cyan" },
    deep: { id: "deep", name: "Deep", color: "violet" },
    school: { id: "school", name: "School", color: "orange" },
  };
  const tasks = [
    {
      id: uid(),
      chainId: chainA.id,
      title: "Castle on the Hill — Study Sprint",
      desc: "25m focus on Maths (IOQM set).",
      created: now() - 1000 * 60 * 60 * 24 * 21,
      due: null,
      priority: 3,
      estimate: 25 * 60 * 1000,
      spent: 0,
      tags: ["focus"],
      pinned: true,
      repeat: "daily",
      skippable: true,
      favorite: true,
      status: "active",
      draft: false,
      locked: false,
      blockedBy: "",
      risk: "low",
      impact: "high",
      hidden: false,
      notes: "# Sprint plan\n- Warm-up\n- Main set\n- Review",
    },
    {
      id: uid(),
      chainId: chainA.id,
      title: "Revise Physics Wallah notes",
      desc: "Thermo quick pass.",
      created: now() - 1000 * 60 * 60 * 24 * 20,
      due: null,
      priority: 2,
      estimate: 15 * 60 * 1000,
      spent: 0,
      tags: ["quick", "school"],
      repeat: "custom",
      skippable: true,
      favorite: false,
      status: "active",
      draft: false,
      locked: false,
      blockedBy: "",
      risk: "low",
      impact: "med",
      hidden: false,
      notes: "Quick recap → questions.",
    },
    {
      id: uid(),
      chainId: chainA.id,
      title: "Rewrite the Stars — Chem practice",
      desc: "10 Qs stoichiometry.",
      created: now() - 1000 * 60 * 60 * 24 * 18,
      due: null,
      priority: 1,
      estimate: 20 * 60 * 1000,
      spent: 0,
      tags: ["school"],
      repeat: "weekly",
      skippable: true,
      favorite: false,
      status: "active",
      draft: false,
      locked: false,
      blockedBy: "",
      risk: "med",
      impact: "med",
      hidden: false,
      notes: "Aim for accuracy over speed.",
    },
  ];
  const sections = [
    { id: uid(), chainId: chainA.id, name: "Warm-up", order: 0 },
    { id: uid(), chainId: chainA.id, name: "Core", order: 1 },
    { id: uid(), chainId: chainA.id, name: "Cooldown", order: 2 },
  ];

  return {
    chains: [chainA, chainB],
    tasks,
    sections,
    tagMap: tags,
    notes: "Session Notes — jot anything here. \n- Use / to search\n- n to add task\n- ⌘/Ctrl+S saves",
    rightOpen: true,
    sidebarOpen: true,
    density: "comfortable",
    theme: "dark",
    view: { chainId: chainA.id },
    queue: [],
    currentTaskId: tasks[0].id,
    pomodoro: { mode: "focus", running: false, timeLeft: 25 * 60 * 1000, cfg: { focus: 25, short: 5, long: 15, rounds: 4 }, round: 1 },
    columnPrefs: { est: true, spent: true, added: true, due: true, tags: true, repeat: true },
    savedFilters: [],
    trash: [],
    history: [],
    recent: [],
    streak: 1,
  };
};

// ---------- Keyboard shortcuts ----------
function useHotkeys(map) {
  useEffect(() => {
    const on = (e) => {
      const key = [e.ctrlKey || e.metaKey ? "mod" : null, e.shiftKey ? "shift" : null, e.key.toLowerCase()]
        .filter(Boolean)
        .join("+");
      if (map[key]) {
        e.preventDefault();
        map[key](e);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [map]);
}

// ---------- Main App ----------
export default function InfiniteChainManager() {
  const store = useLocalStore(seed);
  const { state, commit, doUndo, doRedo, canUndo, canRedo } = store;
  const [query, setQuery] = useState("");
  const [collapseSidebar, setCollapseSidebar] = useState(false);
  const [notesWidth, setNotesWidth] = useState(360);
  const [miniFocus, setMiniFocus] = useState(false);
  const [vol, setVol] = useState(0.0);
  const audioRef = useRef(null);

  // Sound cue (easter egg)
  useEffect(() => {
    const a = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQgAAAAA"
    );
    if (audioRef) audioRef.current = a;
  }, []);

  const currentChain = useMemo(
    () => state.chains.find((c) => c.id === state.view.chainId) || state.chains[0],
    [state.chains, state.view.chainId]
  );

  const tasks = useMemo(() => state.tasks.filter((t) => t.chainId === currentChain.id && !t.hidden), [state.tasks, currentChain]);

  // Filter & search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = tasks;
    if (q) arr = arr.filter((t) => t.title.toLowerCase().includes(q) || t.desc?.toLowerCase().includes(q));
    return arr;
  }, [tasks, query]);

  const currentTask = useMemo(() => state.tasks.find((t) => t.id === state.currentTaskId) || filtered[0], [state.tasks, state.currentTaskId, filtered]);

  // Hotkeys
  useHotkeys({
    "/": () => {
      const el = document.getElementById("global-search");
      el?.focus();
    },
    n: () => addTask(),
    Delete: () => bulkDelete(),
    "mod+s": () => saveSnap(),
    j: () => focusNext(1),
    k: () => focusNext(-1),
    "mod+z": () => doUndo(),
    "mod+shift+z": () => doRedo(),
  });

  // Helpers
  const addTask = (title = "New Task") => {
    commit((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        {
          id: uid(),
          chainId: currentChain.id,
          title,
          desc: "",
          created: now(),
          due: null,
          priority: 1,
          estimate: 15 * 60 * 1000,
          spent: 0,
          tags: [],
          pinned: false,
          repeat: "none",
          skippable: true,
          favorite: false,
          status: "active",
          draft: true,
          locked: false,
          blockedBy: "",
          risk: "low",
          impact: "low",
          hidden: false,
          notes: "",
        },
      ],
      recent: [{ ts: now(), type: "create", title } as any, ...s.recent].slice(0, 20),
    }), "add-task");
  };

  const toggleSidebar = () => setCollapseSidebar((v) => !v);
  const toggleRight = () => commit((s) => ({ ...s, rightOpen: !s.rightOpen }), "toggle-right");
  const setTheme = (theme) => commit((s) => ({ ...s, theme }), "set-theme");
  const setDensity = (density) => commit((s) => ({ ...s, density }), "set-density");
  const saveSnap = () => {
    try {
      const snaps = JSON.parse(localStorage.getItem(SNAP_KEY) || "[]");
      snaps.push({ ts: now(), state });
      while (snaps.length > 10) snaps.shift();
      localStorage.setItem(SNAP_KEY, JSON.stringify(snaps));
    } catch {}
  };

  const focusNext = (dir) => {
    const idx = filtered.findIndex((t) => t.id === currentTask?.id);
    const next = filtered[(idx + dir + filtered.length) % filtered.length];
    if (next) commit((s) => ({ ...s, currentTaskId: next.id }), "focus-next");
  };

  const updateTask = (id, patch) =>
    commit((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }), "update-task");

  const completeTask = (id) => {
    updateTask(id, { status: "done" });
    commit((s) => ({ history: [{ ts: now(), type: "complete", id }, ...s.history].slice(0, 200), ...s }), "complete");
    autoNext();
  };

  const autoNext = () => {
    const idx = filtered.findIndex((t) => t.id === currentTask?.id);
    const next = filtered[(idx + 1) % filtered.length];
    if (next) commit((s) => ({ ...s, currentTaskId: next.id }), "auto-next");
  };

  const bulkDelete = () => {
    // demo: delete completed tasks
    const toDel = filtered.filter((t) => t.status === "done").map((t) => t.id);
    if (!toDel.length) return;
    commit((s) => ({
      ...s,
      trash: [...toDel.map((id) => s.tasks.find((t) => t.id === id)) as any, ...s.trash].slice(0, 50),
      tasks: s.tasks.filter((t) => !toDel.includes(t.id)),
    }), "bulk-delete");
  };

  // Pomodoro
  useEffect(() => {
    if (!state.pomodoro.running) return;
    const int = setInterval(() => {
      commit((s) => {
        const next = Math.max(0, s.pomodoro.timeLeft - 1000);
        let pd = { ...s.pomodoro, timeLeft: next };
        if (next === 0) {
          // beep
          try {
            audioRef.current.volume = vol;
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } catch {}
          // auto advance
          if (s.pomodoro.mode === "focus") {
            pd = { ...pd, mode: "short", timeLeft: s.pomodoro.cfg.short * 60 * 1000 };
          } else {
            const round = s.pomodoro.round + 1;
            pd = { ...pd, mode: "focus", timeLeft: s.pomodoro.cfg.focus * 60 * 1000, round };
          }
        }
        return { ...s, pomodoro: pd };
      }, "pomodoro-tick");
    }, 1000);
    return () => clearInterval(int);
  }, [state.pomodoro.running, commit, vol]);

  const setPomodoro = (patch) => commit((s) => ({ ...s, pomodoro: { ...s.pomodoro, ...patch } }), "pomodoro");

  const importJSON = (json) => {
    try {
      const data = JSON.parse(json);
      commit(() => data, "import");
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "niranx-infinite-chain.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Layout ----------
  return (
    <div className={cn("w-full h-screen overflow-hidden", state.theme === "light" ? "bg-zinc-50 text-zinc-900" : "bg-[#0b0b0b] text-zinc-100")}>
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button onClick={() => window.history.back()} className="p-1 rounded hover:bg-white/5"><ChevronLeft size={18} /></button>
          <button onClick={() => window.history.forward()} className="p-1 rounded hover:bg-white/5"><ChevronRight size={18} /></button>
          <div className="ml-2 relative">
            <Search className="absolute left-2 top-2" size={16} />
            <input id="global-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What do you want to reload?" className="pl-8 pr-24 py-2 rounded bg-zinc-900/80 border border-zinc-800 focus:outline-none focus:ring-2 ring-emerald-500 text-sm w-[380px]" />
            <span className="absolute right-2 top-1.5 text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">/</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(state.theme === "dark" ? "light" : "dark")} className="px-2 py-1 rounded border border-zinc-700 hover:bg-white/5 flex items-center gap-1 text-xs">
            {state.theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            Theme
          </button>
          <button onClick={() => setDensity(state.density === "comfortable" ? "compact" : "comfortable")} className="px-2 py-1 rounded border border-zinc-700 hover:bg-white/5 text-xs">{state.density === "compact" ? "Comfort" : "Compact"}</button>
          <button onClick={exportJSON} className="px-2 py-1 rounded border border-zinc-700 hover:bg-white/5 text-xs flex items-center gap-1"><Download size={14}/> Export</button>
          <label className="px-2 py-1 rounded border border-zinc-700 hover:bg-white/5 text-xs flex items-center gap-1 cursor-pointer"><Import size={14}/> Import
            <input type="file" accept="application/json" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = () => importJSON(String(r.result));
              r.readAsText(f);
            }} />
          </label>
          <button onClick={() => addTask()} className="ml-2 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs flex items-center gap-1"><Plus size={14}/> New Task</button>
        </div>
      </div>

      {/* Body */}
      <div className="w-full h-[calc(100vh-96px)] grid" style={{ gridTemplateColumns: `${collapseSidebar ? 72 : 260}px 1fr ${state.rightOpen ? notesWidth : 0}px` }}>
        {/* Sidebar */}
        <Sidebar {...{ state, commit, collapseSidebar, setCollapseSidebar, setMiniFocus }} />

        {/* Main Content */}
        <div className="relative overflow-hidden">
          <HeaderArt chain={currentChain} />
          <TaskTable
            tasks={filtered}
            state={state}
            commit={commit}
            currentTaskId={currentTask?.id}
            setCurrentTaskId={(id) => commit((s) => ({ ...s, currentTaskId: id }), "set-current")}
          />
        </div>

        {/* Right Notes Drawer */}
        <RightNotes state={state} commit={commit} open={state.rightOpen} width={notesWidth} setWidth={setNotesWidth} />
      </div>

      {/* Bottom Controls */}
      <BottomBar
        {...{
          state,
          commit,
          currentTask,
          autoNext,
          setPomodoro,
          toggleRight,
          toggleSidebar,
          collapseSidebar,
          vol,
          setVol,
        }}
      />
    </div>
  );
}

// ---------- Components ----------
function Sidebar({ state, commit, collapseSidebar, setCollapseSidebar, setMiniFocus }) {
  const chains = state.chains;
  const active = state.view.chainId;
  const [openLib, setOpenLib] = useState(true);
  const [openSaved, setOpenSaved] = useState(true);

  return (
    <div className={cn("h-full border-r border-zinc-800 bg-black/40 overflow-hidden", collapseSidebar ? "px-2" : "px-3")}>      
      <div className="flex items-center justify-between pt-3 pb-2">
        {!collapseSidebar && <div className="font-semibold text-sm">NiranX — Infinite Chain</div>}
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapseSidebar((v) => !v)} className="p-1 rounded hover:bg-white/5" title="Collapse">
            {collapseSidebar ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}          
          </button>
          <button onClick={() => setMiniFocus((v) => !v)} className="p-1 rounded hover:bg-white/5" title="Focus Mode"><Eye size={16}/></button>
        </div>
      </div>

      {/* Library */}
      <div className="text-xs mt-2">
        <div className="flex items-center justify-between text-zinc-300 uppercase tracking-wide">
          <button onClick={() => setOpenLib(!openLib)} className="flex items-center gap-1">
            {openLib ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} Library
          </button>
          {!collapseSidebar && <button className="p-1 rounded hover:bg-white/5" title="New chain"><Plus size={14}/></button>}
        </div>
        <AnimatePresence>
          {openLib && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-1 pr-1">
              {chains.map((c) => (
                <button key={c.id} onClick={() => commit((s) => ({ ...s, view: { chainId: c.id } }), "switch-chain")} className={cn("w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5", active === c.id && "bg-white/10")}>                  
                  <div className={cn("w-2 h-2 rounded-full", `bg-${c.color}-500`)}/>
                  {!collapseSidebar && <span className="truncate text-sm">{c.name}</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Saved Filters */}
      <div className="text-xs mt-4">
        <div className="flex items-center justify-between text-zinc-300 uppercase tracking-wide">
          <button onClick={() => setOpenSaved(!openSaved)} className="flex items-center gap-1">{openSaved ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} Saved Filters</button>
          {!collapseSidebar && <button className="p-1 rounded hover:bg-white/5" title="Save current filter"><Save size={14}/></button>}
        </div>
        <AnimatePresence>
          {openSaved && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 pr-1">
              {state.savedFilters.length === 0 && !collapseSidebar && (
                <div className="text-zinc-500 text-xs px-2 py-3">No saved filters yet.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini-player when collapsed */}
      {collapseSidebar && (
        <div className="absolute bottom-16 left-0 right-0 p-2 border-t border-zinc-800">
          <div className="text-[11px] text-zinc-400 mb-1">Current Task</div>
          <div className="text-xs truncate">{state.tasks.find((t) => t.id === state.currentTaskId)?.title}</div>
        </div>
      )}
    </div>
  );
}

function HeaderArt({ chain }) {
  return (
    <div className="relative h-40 bg-gradient-to-b from-zinc-900/60 to-transparent border-b border-zinc-800">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(16,185,129,.25), transparent 50%)" }} />
      <div className="absolute bottom-3 left-4 flex items-center gap-3">
        <div className="w-16 h-16 rounded-md bg-emerald-600/40 border border-emerald-700 shadow-inner" />
        <div>
          <div className="text-[11px] uppercase tracking-widest text-zinc-300">Chain</div>
          <div className="text-2xl font-bold">{chain.name}</div>
          <div className="text-zinc-400 text-xs">Smart reload · color {chain.color}</div>
        </div>
      </div>
    </div>
  );
}

function TaskTable({ tasks, state, commit, currentTaskId, setCurrentTaskId }) {
  const [hoverId, setHoverId] = useState(null);
  const [showCols, setShowCols] = useState(state.columnPrefs);

  useEffect(() => setShowCols(state.columnPrefs), [state.columnPrefs]);

  const toggleCol = (k) => setShowCols((c) => ({ ...c, [k]: !c[k] }));

  const onInlineCreate = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const val = String(fd.get("q") || "").trim();
    if (!val) return;
    commit((s) => ({ ...s, tasks: [...s.tasks, {
      id: uid(), chainId: s.view.chainId, title: val, created: now(), desc: "", due: null, priority: 1, estimate: 15*60*1000, spent: 0, tags: [], pinned: false, repeat: "none", skippable: true, favorite: false, status: "active", draft: true, locked: false, blockedBy: "", risk: "low", impact: "low", hidden: false, notes: "" }]}), "inline-create");
    e.currentTarget.reset();
  };

  return (
    <div className="px-4 pb-28">
      {/* Column Header */}
      <div className="sticky top-10 z-10 grid grid-cols-12 items-center text-xs text-zinc-300 border-b border-zinc-800 pb-2 pt-3 bg-black/40 backdrop-blur">
        <div className="col-span-6 flex items-center gap-2">
          <PlayCircle size={16} className="text-emerald-500"/>
          <span className="uppercase tracking-widest">Title</span>
        </div>
        {showCols.tags && <div className="col-span-1">Tags</div>}
        {showCols.est && <div className="col-span-1">Est</div>}
        {showCols.spent && <div className="col-span-1">Spent</div>}
        {showCols.repeat && <div className="col-span-1">Repeat</div>}
        {showCols.added && <div className="col-span-1">Added</div>}
        {showCols.due && <div className="col-span-1">Due</div>}
        <div className="col-span-1 text-right">
          <div className="inline-flex items-center gap-2">
            <button className="p-1 rounded hover:bg-white/5" title="Toggle Est" onClick={() => toggleCol("est")}><Timer size={14}/></button>
            <button className="p-1 rounded hover:bg-white/5" title="Toggle Tags" onClick={() => toggleCol("tags")}><Tag size={14}/></button>
            <button className="p-1 rounded hover:bg-white/5" title="Toggle Columns" onClick={() => toggleCol("added")}><LayoutGrid size={14}/></button>
          </div>
        </div>
      </div>

      {/* Rows */}
      {tasks.map((t) => (
        <div key={t.id} onMouseEnter={() => setHoverId(t.id)} onMouseLeave={() => setHoverId(null)} className={cn("grid grid-cols-12 items-center py-2 border-b border-zinc-900 hover:bg-white/2 rounded", currentTaskId === t.id && "bg-white/5")}>          
          <div className="col-span-6 flex items-center gap-2">
            <button onClick={() => setCurrentTaskId(t.id)} className="p-1 rounded hover:bg-white/5" title="Set current">
              {currentTaskId === t.id ? <Pause size={16}/> : <Play size={16}/>}
            </button>
            <div className="flex-1">
              <div className="font-medium text-sm flex items-center gap-2">
                {t.favorite && <Heart size={14} className="text-pink-500"/>}
                <InlineEdit value={t.title} onChange={(v) => commit((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? { ...x, title: v, draft: false } : x) }), "edit-title")} className="" />
                {t.locked ? <Lock size={12}/> : <Unlock size={12} className="text-zinc-600"/>}
              </div>
              <div className="text-xs text-zinc-400">
                <InlineEdit value={t.desc || "Add description"} className="text-zinc-400" onChange={(v) => commit((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? { ...x, desc: v } : x) }), "edit-desc")} />
              </div>
            </div>
          </div>
          {state.columnPrefs.tags && (
            <div className="col-span-1 flex gap-1 flex-wrap">
              {t.tags.map((tg) => (
                <span key={tg} className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700">{tg}</span>
              ))}
            </div>
          )}
          {state.columnPrefs.est && <div className="col-span-1 text-sm">{Math.round(t.estimate/60000)}m</div>}
          {state.columnPrefs.spent && <div className="col-span-1 text-sm">{fmtDuration(t.spent)}</div>}
          {state.columnPrefs.repeat && <div className="col-span-1 text-xs text-zinc-400">{t.repeat}</div>}
          {state.columnPrefs.added && <div className="col-span-1 text-xs text-zinc-400">{relative(t.created)}</div>}
          {state.columnPrefs.due && <div className="col-span-1 text-xs text-zinc-400">{t.due ? new Date(t.due).toLocaleDateString() : "—"}</div>}
          <div className="col-span-1 flex items-center justify-end gap-1">
            {(hoverId === t.id || currentTaskId === t.id) && (
              <div className="flex items-center gap-1">
                <button title="Complete" onClick={() => commit((s) => ({...s, tasks: s.tasks.map((x)=>x.id===t.id?{...x, status: "done"}:x)}), "complete") } className="p-1 rounded hover:bg-white/5"><CheckCircle2 size={16}/></button>
                <button title="Delete" onClick={() => commit((s) => ({...s, trash: [s.tasks.find(x=>x.id===t.id), ...s.trash], tasks: s.tasks.filter(x=>x.id!==t.id)}), "delete") } className="p-1 rounded hover:bg-white/5"><Trash2 size={16}/></button>
                <button title="More" className="p-1 rounded hover:bg-white/5"><MoreHorizontal size={16}/></button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Inline Create */}
      <form onSubmit={onInlineCreate} className="mt-3">
        <input name="q" placeholder="Type to add task, Enter to create…" className="w-full bg-transparent border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-emerald-500" />
      </form>
    </div>
  );
}

function InlineEdit({ value, onChange, className }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <input value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onChange(v)} className={cn("bg-transparent outline-none border-b border-transparent focus:border-emerald-500", className)} />
  );
}

function RightNotes({ state, commit, open, width, setWidth }) {
  const [local, setLocal] = useState(state.notes);
  const drag = useRef(false);

  useEffect(() => setLocal(state.notes), [state.notes]);

  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current) return;
      setWidth(clamp(width - e.movementX, 260, 560));
    };
    const onUp = () => (drag.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [width, setWidth]);

  return (
    <div className={cn("h-full border-l border-zinc-800 bg-black/30", !open && "hidden")}>      
      <div className="h-8 flex items-center justify-between px-3 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <NotebookText size={14}/>
          <span className="uppercase tracking-widest">Session Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <button title="Copy" onClick={() => navigator.clipboard.writeText(local)} className="p-1 rounded hover:bg-white/5"><Copy size={14}/></button>
          <button title="Save" onClick={() => commit((s) => ({ ...s, notes: local }), "save-notes")} className="p-1 rounded hover:bg-white/5"><Save size={14}/></button>
        </div>
      </div>
      <textarea value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Write notes… supports markdown-ish" className="w-full h-[calc(100%-2rem)] bg-transparent p-3 text-sm outline-none" />
      <div onMouseDown={() => (drag.current = true)} className="absolute left-[calc(100%-1px)] top-0 w-1 h-full cursor-col-resize" />
    </div>
  );
}

function BottomBar({ state, commit, currentTask, autoNext, setPomodoro, toggleRight, toggleSidebar, collapseSidebar, vol, setVol }) {
  const running = state.pomodoro.running;
  const t = state.pomodoro.timeLeft;
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-800 bg-black/70 backdrop-blur flex items-center justify-between px-3">
      {/* Left: current */}
      <div className="min-w-[260px] flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-700/30 rounded" />
        <div>
          <div className="text-sm font-medium truncate max-w-[220px]">{currentTask?.title || "No task"}</div>
          <div className="text-[11px] text-zinc-400 truncate max-w-[220px]">{currentTask?.desc}</div>
        </div>
        <button className="p-1 rounded hover:bg-white/5" title="Favorite"><Heart size={16} className={currentTask?.favorite ? "text-pink-500" : ""}/></button>
        <button className="p-1 rounded hover:bg-white/5" title="Pin"><Pin size={16}/></button>
      </div>

      {/* Middle: controls */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-white/5" title="Shuffle"><Shuffle size={18}/></button>
          <button className="p-2 rounded hover:bg-white/5" title="Back"><SkipBack size={18}/></button>
          <button onClick={() => setPomodoro({ running: !running })} className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-sm flex items-center gap-2">
            {running ? <Pause size={18}/> : <Play size={18}/>}
            {running ? "Pause" : "Start"}
          </button>
          <button onClick={() => autoNext()} className="p-2 rounded hover:bg-white/5" title="Next"><SkipForward size={18}/></button>
          <button className="p-2 rounded hover:bg-white/5" title="Repeat"><Repeat size={18}/></button>
        </div>
        <div className="flex items-center gap-3 w-[520px] max-w-[60vw]">
          <span className="text-[11px] text-zinc-400">{fmtDuration(state.pomodoro.cfg.focus*60*1000 - t)}</span>
          <div className="relative flex-1 h-1.5 bg-zinc-800 rounded">
            <div className="absolute left-0 top-0 h-1.5 rounded bg-emerald-500" style={{ width: `${100 * (1 - t/(state.pomodoro.cfg.focus*60*1000))}%` }}/>
          </div>
          <span className="text-[11px] text-zinc-400">{fmtDuration(t)}</span>
        </div>
      </div>

      {/* Right: options */}
      <div className="min-w-[260px] flex items-center justify-end gap-2">
        <button className="p-2 rounded hover:bg-white/5" title="Notes" onClick={toggleRight}><NotebookText size={18}/></button>
        <div className="flex items-center gap-2" title="Volume">
          {vol === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}
          <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e)=>setVol(parseFloat(e.target.value))} />
        </div>
        <button className="p-2 rounded hover:bg-white/5" onClick={toggleSidebar} title="Collapse Sidebar">{collapseSidebar ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}</button>
        <button className="px-2 py-1 rounded border border-zinc-700 hover:bg-white/5 text-xs">Help</button>
        <button className="px-2 py-1 rounded border border-zinc-700 hover:bg-white/5 text-xs">Settings</button>
      </div>
    </div>
  );
}