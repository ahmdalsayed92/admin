import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Entity,
  EntityResponse,
  EntitiesResponse,
  AdminData,
  PagesResponse,
  ValidationResponse,
  SearchResponse,
} from './models/entity.model';
import { env } from '../environments/dev.env';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = env.apiBaseUrl + '/entities';

  constructor(private http: HttpClient) {}

  createEntity(entity: Entity): Observable<EntityResponse> {
    return this.http.post<EntityResponse>(this.baseUrl, entity);
  }

  getEntities(
    offset = 0,
    limit = 10,
    sortBy = 'title',
    sortOrder = 'asc'
  ): Observable<EntitiesResponse> {
    return this.http.get<EntitiesResponse>(
      `${this.baseUrl}?offset=${offset}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
  }

  deleteEntity(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  toggleActivation(
    id: string,
    isActive: boolean
  ): Observable<{ message: string; updated: Entity }> {
    return this.http.patch<{ message: string; updated: Entity }>(
      `${this.baseUrl}/${id}/activate`,
      { isActive: isActive }
    );
  }

  updateEntity(
    id: string,
    entity: Partial<Entity>
  ): Observable<{ message: string; updated: Entity }> {
    return this.http.put<{ message: string; updated: Entity }>(
      `${this.baseUrl}/${id}`,
      entity
    );
  }

  getAdminData(domain: string): Observable<AdminData> {
    return this.http.get<AdminData>(`${this.baseUrl}/admin/${domain}`);
  }

  getPages(domain: string): Observable<PagesResponse> {
    return this.http.get<PagesResponse>(`${this.baseUrl}/${domain}/pages`);
  }

  validateCredentials(
    domain: string,
    apiKey: string,
    adminEmail: string
  ): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>(`${this.baseUrl}/validate`, {
      domain,
      apiKey,
      adminEmail,
    });
  }

  searchEntities(keyword: string): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(
      `${this.baseUrl}/search?keyword=${keyword}`
    );
  }
}
