import { HttpParams } from '@angular/common/http';

export type QueryParams = Record<string, string | number | boolean | Date | null | undefined>;

export function toHttpParams(query: QueryParams | null | undefined): HttpParams {
  let params = new HttpParams();
  if (!query) return params;

  Object.getOwnPropertyNames(query).forEach((key) => {
    const value = query[key];
    if (value !== undefined && value !== null && value !== '') {
      const stringValue = value instanceof Date ? value.toISOString() : String(value);
      params = params.set(key, stringValue);
    }
  });
  return params;
}
