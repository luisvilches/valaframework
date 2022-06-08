export type RouteParam = {
  idx: number;
  paramKey: string;
};

export const enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}

export type Route = {
  path: string;
  method: HttpMethod;
  classController: string;
  controller: (ctx: Context) => Promise<any>;
  middleware?: Array<Promise<Function>>;
};

export type RouteOptions = {
  path: string;
  method: HttpMethod;
};

export type UrlParams = {
  path: string;
  params: Record<any, any>;
};

export type Context = {
  request: Request;
  response: {
    send: (data: Response) => Promise<any>;
    json: (data: Record<any, any>, options: ResponseInit) => Promise<any>;
    text: (data: string, options: ResponseInit) => Promise<any>;
  };
  params: RouteParam[];
  query: Record<any, any>;
  body: Record<any, any>;
  headers: Record<any, any>;
  files: Record<any, File>;
  vars?: Record<any, any>;
};

export type RequestSemType = {
  context: Context;
  url: URL;
};

export type RequestBody = {
  body: Record<any, any>;
  files: Record<any, File>;
};