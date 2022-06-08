import { Context, HttpMethod, Route } from "./types.ts";
import RequestSem from "./request.ts";
import Validate from "./validate.ts";

class Router {
  routes: Array<Route> = [];
  private middles: Array<any> = [];
  private cors: Record<any, any> = {};
  private req: RequestSem = new RequestSem();
  private matchParamsRoute(e: Route, method: string, path: string): boolean {
    const routeMatcherRegEx = new RegExp(
      `^${Validate.routeParamPattern(e.path)}$`,
    );
    return method === e.method && e.path.includes("/:") &&
      routeMatcherRegEx.test(path);
  }

  setRouterController(controller: string, pathCtrl: string) {
    let routes: Route[] = Object.assign([], this.routes);
    this.routes = routes.map((e: Route) => {
      if (e.classController === controller) e.path = pathCtrl + e.path;
      return e;
    });
  }

  setCors() {
  }

  addRoutes(route: Route) {
    this.routes.push(route);
  }

  addMiddleware(middleware: Function) {
    this.middles.push(middleware);
  }

  getMiddleWares(route: Route) {
    return new Promise((resolve: any, reject: any) => {
      let num: number = 0;
      if (route.middleware) {
        while (num < route.middleware?.length) {
          num++;
        }
      }
    });
  }

  handler(requestEvent: Deno.RequestEvent, path: string): Route | null {
    let controller = null;
    let index: number = 0;
    while (index < this.routes.length) {
      if (
        Validate.matchBasicRoute(
          this.routes[index],
          requestEvent.request.method,
          path,
        )
      ) {
        controller = this.routes[index];
      } else {
        if (
          this.matchParamsRoute(
            this.routes[index],
            requestEvent.request.method,
            path,
          )
        ) {
          controller = this.routes[index];
        }
      }
      index++;
    }

    return controller;
  }

  async middlewares(ctx: Context, route: Route) {
    let index: number = 0;
    let routeMiddlewares: Array<any> = [];
    if (Array.isArray(route.middleware)) {
      routeMiddlewares = route.middleware.slice();
    }
    routeMiddlewares.push(await route.controller);
    const middlewares = this.middles.concat(routeMiddlewares).slice();
    const next = () => middlewares[++index](ctx, next);
    return middlewares[index](ctx, next);
  }
}

const router: Router = new Router();

export default router;
