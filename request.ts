import {
  Context,
  RequestBody,
  RequestSemType,
  Route,
  RouteParam,
  UrlParams,
} from "./types.ts";

class RequestSem {
  private cors: Record<any, any> = {};
  constructor() {}

  async body(request: Request): Promise<RequestBody> {
    const req: Request = request;
    let body: Record<any, any> = {};
    let files: Record<any, File> = {};
    const ContantType: string | undefined =
      req.headers.get("content-type")?.split(";")[0];
    switch (ContantType) {
      case "application/json":
        if (req.body) {
          body = await req.json();
        }
        break;
      case "application/x-www-form-urlencoded":
      case "multipart/form-data":
        if (req.body) {
          const form = await req.formData();
          for await (const [key, value] of form) {
            if (typeof value === "object") {
              files[key] = value;
            } else {
              body[key] = value;
            }
          }
        }
        break;
      case "text/plain":
        if (req.body) {
          const text = await req.text();
          body = { "data": text };
        }
        break;
    }

    return { body, files };
  }

  private headers(request: Request): any {
    const headers: any = {};
    for (const [key, value] of request.headers) {
      headers[key] = value;
    }
    return headers;
  }

  private query(url: string): UrlParams {
    const temp: URL = new URL(url);

    const par: UrlParams = {
      path: temp.pathname,
      params: this.extractRouteQuery(temp.searchParams),
    };
    return par;
  }

  private extractRouteQuery(url: URLSearchParams): Record<any, any> {
    const params: Record<any, any> = {};
    for (const [key, value] of url) {
      params[key] = value;
    }

    return params;
  }

  private extractRouteParams(route: string): RouteParam[] {
    const params: RouteParam[] = route.split("/").reduce(
      (accum: RouteParam[], curr: string, idx: number) => {
        if (/:[A-Za-z1-9]{1,}/.test(curr)) {
          const paramKey: string = curr.replace(":", "");
          const param: RouteParam = { idx, paramKey };
          return [...accum, param];
        }
        return accum;
      },
      [],
    );

    return params;
  }

  private params(route: Route, path: string): any {
    const routeParamsMap: RouteParam[] = this.extractRouteParams(route.path);
    const routeSegments: string[] = path.split("/");
    const routeParams: { [key: string]: string | number } = routeParamsMap
      .reduce(
        (accum: { [key: string]: string | number }, curr: RouteParam) => {
          return {
            ...accum,
            [curr.paramKey]: routeSegments[curr.idx],
          };
        },
        {},
      );

    return routeParams;
  }

  private async send(requestEvent: Deno.RequestEvent, data: Response) {
    await requestEvent.respondWith(data);
  }

  private async json(
    requestEvent: Deno.RequestEvent,
    data: Record<any, any>,
    options: ResponseInit,
  ) {
    await requestEvent.respondWith(
      new Response(
        JSON.stringify(data, null, 2),
        this.optionsRequest(options, requestEvent.request),
      ),
    );
  }

  private optionsRequest(option: ResponseInit, req: Request): ResponseInit {
    const opt: ResponseInit = {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
      ...option,
    };

    return opt;
  }

  private async text(
    requestEvent: Deno.RequestEvent,
    data: string,
    options: ResponseInit,
  ) {
    await requestEvent.respondWith(
      new Response(
        data || "",
        this.optionsRequest(options, requestEvent.request),
      ),
    );
  }

  private async context(
    requestEvent: Deno.RequestEvent,
    hand: Route,
  ): Promise<Context> {
    const url: UrlParams = this.query(requestEvent.request.url);
    const request: Request = requestEvent.request;
    const { body, files } = await this.body(request);
    const req: Context = {
      request: request,
      params: this.params(hand, url.path),
      query: url.params,
      body: body,
      headers: this.headers(request),
      files: files,
      response: {
        send: async (data: Response) => await this.send(requestEvent, data),
        json: async (data: Record<any, any>, options: ResponseInit) =>
          await this.json(requestEvent, data, options),
        text: async (data: string, options: ResponseInit) =>
          await this.text(requestEvent, data, options),
      },
    };
    return req;
  }

  async main(
    requestEvent: Deno.RequestEvent,
    hand: Route,
  ): Promise<RequestSemType> {
    const urlTemp: URL = new URL(requestEvent.request.url);
    const req: RequestSemType = {
      context: await this.context(requestEvent, hand),
      url: urlTemp,
    };

    return req;
  }
}

export default RequestSem;
