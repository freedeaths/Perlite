export interface Note {
  title: string;
  path: string;
  content: string;
  tags?: string[];
  links?: string[];
  backlinks?: string[];
}

export interface NoteMetadata {
  title: string;
  path: string;
  tags?: string[];
  links?: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface SearchResult {
  title: string;
  path: string;
  excerpt: string;
}
