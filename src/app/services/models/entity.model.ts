export interface Page {
  title: string;
  url: string;
}

export interface Entity {
  _id: string;
  title: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  pages: Page[];
  apiKey?: string;
  isActive?: boolean;
  officer?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityResponse {
  apiKey: string;
  isActive: boolean;
}

export interface EntitiesResponse {
  total: number;
  offset: number;
  limit: number;
  entities: Entity[];
}

export interface AdminData {
  adminEmail: string;
  isActive: boolean;
}

export interface PagesResponse {
  pages: Page[];
}

export interface ValidationResponse {
  valid: boolean;
  isActive?: boolean;
  message?: string;
}

export interface SearchResponse {
  results: Entity[];
}
