import { RequestSemType, Route } from "./types.ts";
import RequestSem from "./request.ts";
import router from "./router.ts";

class ValaFramework {
  private request: RequestSem = new RequestSem();
  private pathStaticFiles: string = "";

  controllers(controllers: Array<any>) {
    controllers.map((controllerClass: any) => {
      const ctrl = new controllerClass();
      if (ctrl.getPathController) {
        const { controller, path } = ctrl.getPathController();
        router.setRouterController(controller, path);
      }
    });
  }

  services(services: Array<any>) {
    services.map((service: any) => new service());
  }

  use(middleware: Function) {
    router.addMiddleware(middleware);
  }

  setStaticFolder(path: string) {
    this.pathStaticFiles = path;
  }

  setCors() {
  }

  private async notFound(requestEvent: Deno.RequestEvent) {
    const url: URL = new URL(requestEvent.request.url);
    const notFoundResponse = new Response(
      "Cannot " + requestEvent.request.method + " " + url.pathname,
      { status: 404, statusText: "404 not found" },
    );
    await requestEvent.respondWith(notFoundResponse);
  }

  private handler(requestEvent: Deno.RequestEvent): Route | null {
    const urlTemp: URL = new URL(requestEvent.request.url);
    return router.handler(requestEvent, urlTemp.pathname);
  }

  parseDirStaticFolder() {
    const init = new RegExp("^/");
    const end = new RegExp("/$");
    let dir: string = this.pathStaticFiles;

    if (!init.test(dir)) {
      dir = "/" + dir;
    }

    if (!end.test(dir)) {
      dir = dir + "/";
    }
    return dir;
  }

  private async recursiveDir(dir: string, pathname: string) {
    return new Promise(async (resolve: any, reject: any) => {
      for await (
        const xfile of Deno.readDirSync("." + this.parseDirStaticFolder() + dir)
      ) {
        if ("/" + xfile.name === pathname && xfile.isFile == true) {
          resolve(xfile.name);
        }

        if (xfile.isDirectory) {
          resolve(
            xfile.name + "/" +
              await this.recursiveDir(dir + "/" + xfile.name, pathname),
          );
        }
      }

      reject(null);
    });
  }

  private async searchFileStatics(requestEvent: Deno.RequestEvent) {
    const url: URL = new URL(requestEvent.request.url);
    let file = null;
    for await (
      const xfile of Deno.readDirSync("." + this.parseDirStaticFolder())
    ) {
      if ("/" + xfile.name === url.pathname && xfile.isFile == true) {
        file = xfile.name;
        break;
      }

      if (xfile.isDirectory) {
        file = xfile.name + "/" +
          await this.recursiveDir(xfile.name, url.pathname);
        break;
      }
    }

    if (file) {
      const dir = decodeURIComponent("." + this.parseDirStaticFolder() + file);
      const xfile = await Deno.open(decodeURIComponent(dir), { read: true });
      await requestEvent.respondWith(
        new Response(xfile.readable, { status: 200 }),
      );
    } else {
      await this.notFound(requestEvent);
    }
  }

  private async httpHandler(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      const hand: Route | null = this.handler(requestEvent);

      if (hand != null) {
        const context: RequestSemType = await this.request.main(
          requestEvent,
          hand,
        );
        router.middlewares(context.context, hand);
      } else {
        await this.searchFileStatics(requestEvent);
      }
    }
  }

  async serve(port: number = 4242) {
    const server = Deno.listen({ port: port || 4242 });
    for await (const conn of server) {
      this.httpHandler(conn).catch(console.error);
    }
  }
}

export default ValaFramework;
