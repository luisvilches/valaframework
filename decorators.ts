import { HttpMethod, Route } from "./types.ts";
import ApplicationService from "./services.ts";
import router from "./router.ts";

export function Controller(_nombre: string) {
  return function (target: Function) {
    target.prototype.getPathController = function () {
      return {
        controller: this.constructor.name,
        path: _nombre,
      };
    };
  };
}

export function Get(path: string, middleware?: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.GET,
      controller: target[propertyKey],
      middleware: middleware,
    };
    router.addRoutes(route);

    return descriptor;
  };
}

export function Post(path: string, middleware?: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.POST,
      controller: target[propertyKey],
      middleware: middleware,
    };
    router.addRoutes(route);

    return descriptor;
  };
}

export function Put(path: string, middleware?: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.PUT,
      controller: target[propertyKey],
      middleware: middleware,
    };
    router.addRoutes(route);

    return descriptor;
  };
}

export function Delete(path: string, middleware?: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.DELETE,
      controller: target[propertyKey],
      middleware: middleware,
    };
    router.addRoutes(route);

    return descriptor;
  };
}

export function Patch(path: string, middleware?: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.PATCH,
      controller: target[propertyKey],
      middleware: middleware,
    };
    router.addRoutes(route);

    return descriptor;
  };
}

export function Options(path: string, middleware?: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.OPTIONS,
      controller: target[propertyKey],
      middleware: middleware,
    };
    router.addRoutes(route);

    return descriptor;
  };
}

export function Event(path: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApplicationService.events.subscribe(path, target[propertyKey]);
    return descriptor;
  };
}

export function Service(target: Function) {
  const names = Object.getOwnPropertyNames(target.prototype);
  const methods = Object.getOwnPropertyDescriptors(target.prototype);
  const serv: Record<any, Function> = {};

  for (const key of names) {
    if (key !== "constructor") {
      serv[key] = methods[key].value;
    }
  }

  ApplicationService.service[target.name] = serv;
}
