

# NiranX Office Suite — Implementation Plan

## Current State Assessment

**Already exists:**
- AI Presentation Generator (uses Presenton API)
- Cloud File Storage (My Cloud, XDrop, File Hub, Google Drive integration)
- Calendar (XOrbit, Class Scheduler, Task Scheduler)
- Chat/Messaging (Messages, Social Chat Dashboard)
- Knowledge Base/Wiki (KnowledgeBaseWiki — localStorage only)
- Whiteboard (canvas-based drawing)
- Collaborative Notes (mock data, no real collab)
- AI Writing Assistant, AI Doc Summarizer
- Integration Hub (Google Drive, Backblaze, etc.)

**Needs to be built:**
1. **Smart Document Editor** — No rich text editor exists
2. **Spreadsheet Tool** — Nothing exists
3. **Presentation Builder** — Only AI generator, no visual slide editor

**Needs major upgrades:**
4. Knowledge Base Wiki → cloud persistence
5. Collaborative Notes → real-time editing

---

## Implementation Plan (Phased)

### Phase 1: Smart Document Editor (`/niranx/xdocs`)

**New page: `src/pages/XDocs.tsx`**
- Rich text editor using `contentEditable` with toolbar (bold, italic, headings H1-H3, lists, links, images, tables)
- Markdown import/export support
- Document templates (Essay, Report, Meeting Notes, Blank)
- Integration with existing AI Writing Assistant edge function for rewrite/grammar/expand
- AI Summarizer integration (existing edge function)
- Auto-save to database

**New DB table: `xdocs_documents`**
- `id`, `user_id`, `title`, `content` (HTML), `template`, `is_shared`, `share_token`, `created_at`, `updated_at`
- RLS: users own their docs, shared docs readable via token

**Components:**
- `src/components/xdocs/DocumentToolbar.tsx` — formatting toolbar
- `src/components/xdocs/TemplateSelector.tsx` — template picker dialog
- `src/components/xdocs/DocumentList.tsx` — sidebar document list

### Phase 2: Spreadsheet Tool (`/niranx/xsheets`)

**New page: `src/pages/XSheets.tsx`**
- Grid-based spreadsheet with editable cells (26 cols × 100 rows)
- Basic formula engine: `SUM`, `AVG`, `COUNT`, `MIN`, `MAX`, `IF`
- Cell formatting (bold, colors, alignment)
- CSV import/export
- Chart generation using Recharts (bar, line, pie from selected data)
- Auto-save to database

**New DB table: `xsheets_spreadsheets`**
- `id`, `user_id`, `title`, `data` (JSONB — cell values/formulas/styles), `created_at`, `updated_at`
- RLS: user-scoped

**Components:**
- `src/components/xsheets/SpreadsheetGrid.tsx` — main grid
- `src/components/xsheets/FormulaBar.tsx` — formula input
- `src/components/xsheets/ChartBuilder.tsx` — chart from data
- `src/components/xsheets/CellFormatter.tsx` — formatting panel

### Phase 3: Presentation Builder (`/niranx/xslides`)

**New page: `src/pages/XSlides.tsx`**
- Visual slide editor at 1920×1080 with scaled preview
- Slide templates (Title, Content, Two-Column, Image, Blank)
- Add text, images, shapes to slides
- Slide thumbnail sidebar with reordering (dnd-kit)
- Fullscreen presentation mode with keyboard nav
- AI slide content generation via existing Lovable AI
- Export as images or connect to existing AI Presentation Generator

**New DB table: `xslides_presentations`**
- `id`, `user_id`, `title`, `slides` (JSONB array of slide objects), `theme`, `created_at`, `updated_at`
- RLS: user-scoped

**Components:**
- `src/components/xslides/SlideCanvas.tsx` — scaled slide editor
- `src/components/xslides/SlideToolbar.tsx` — add elements
- `src/components/xslides/SlideThumbnails.tsx` — sidebar thumbnails
- `src/components/xslides/PresentationMode.tsx` — fullscreen presenter
- `src/components/xslides/SlideTemplates.tsx` — template picker

### Phase 4: Office Hub Landing (`/niranx/xoffice`)

**New page: `src/pages/XOffice.tsx`**
- Hub page linking to XDocs, XSheets, XSlides
- Recent documents across all types
- Quick-create buttons for each type
- Storage usage summary

### Phase 5: Upgrades to Existing Features

- **Knowledge Base Wiki**: Migrate from localStorage to `xdocs_documents` with `template = 'wiki'`
- **Collaborative Notes**: Add real-time cursors via Supabase Presence
- **AI Workspace**: Add AI formula creator in XSheets, AI slide builder in XSlides

---

## Database Migration

Single migration creating 3 tables:
- `xdocs_documents`
- `xsheets_spreadsheets`
- `xslides_presentations`

All with RLS policies for user-scoped CRUD.

## Routing

```
/niranx/xoffice       → XOffice hub
/niranx/xdocs         → Document list + editor
/niranx/xsheets       → Spreadsheet list + editor  
/niranx/xslides       → Presentation list + editor
```

## Design

- Uses existing design system tokens
- Consistent with platform aesthetics (cards, gradients, motion animations)
- Responsive — editor adapts to screen size
- Toolbar designs inspired by Google Docs/Sheets/Slides but with NiranX styling

## Files to Create (~15 files)
- 4 pages: `XOffice.tsx`, `XDocs.tsx`, `XSheets.tsx`, `XSlides.tsx`
- ~10 components across `xdocs/`, `xsheets/`, `xslides/` folders
- 1 migration file

## Files to Edit
- `src/App.tsx` — add routes
- `src/data/allPages.ts` — register pages
- Sidebar config — add Office section

