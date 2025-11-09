export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  order: number;
  created_at: string;
  updated_at?: string;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface CategoryCreate {
  name: string;
  slug: string;
  parent_id?: number;
  order?: number;
}

export interface CategoryUpdate {
  name?: string;
  slug?: string;
  parent_id?: number;
  order?: number;
}
