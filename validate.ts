import { Route } from "./types.ts";

class Validate {
  static routeParamPattern(route: string): string {
    return route.replace(/\/\:[^/]{1,}/gi, "/[^/]{1,}").replace(/\//g, "\\/");
  }

  static matchBasicRoute(e: Route, method: string, path: string): boolean {
    return e.method.toUpperCase() === method.toUpperCase() && e.path === path;
  }
}

export default Validate;
