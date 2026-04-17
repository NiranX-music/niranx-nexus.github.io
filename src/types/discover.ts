export type ContentBlock =
  | { type: "heading"; value: string; level: 1 | 2 | 3 | 4 }
  | { type: "text"; value: string; size?: "sm" | "md" | "lg" | "xl" }
  | { type: "markdown"; value: string }
  | { type: "html"; value: string }
  | { type: "latex"; value: string; display?: boolean }
  | { type: "code"; value: string; language?: string }
  | { type: "image"; src: string; caption?: string; alt?: string }
  | { type: "embed"; url: string; height?: number }
  | { type: "video"; url: string }
  | { type: "quote"; value: string; cite?: string }
  | { type: "divider" }
  | { type: "list"; items: string[]; ordered?: boolean };

export interface DiscoverPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  tags: string[];
  content: ContentBlock[];
  cover_image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_published: boolean;
  view_count: number;
  like_count: number;
  author_id: string;
  author_name: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface DiscoverComment {
  id: string;
  page_id: string;
  parent_comment_id: string | null;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  replies?: DiscoverComment[];
}

export interface PageTreeNode extends DiscoverPage {
  children: PageTreeNode[];
}

export function buildPageTree(pages: DiscoverPage[]): PageTreeNode[] {
  const map = new Map<string, PageTreeNode>();
  pages.forEach((p) => map.set(p.id, { ...p, children: [] }));
  const roots: PageTreeNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortFn = (a: PageTreeNode, b: PageTreeNode) =>
    a.sort_order - b.sort_order || a.title.localeCompare(b.title);
  roots.sort(sortFn);
  map.forEach((n) => n.children.sort(sortFn));
  return roots;
}
