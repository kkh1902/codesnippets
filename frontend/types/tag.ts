export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  color?: string;
  created_at: string;
  updated_at?: string;
}

export interface TagTree extends Tag {
  children: TagTree[];
}

export interface TagCreate {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: number;
  color?: string;
}
