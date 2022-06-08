import { config } from "https://deno.land/x/dotenv/mod.ts";
import SecurityService from "./services/security.ts";
import FormatService from "./services/format.ts";
import FileService from "./services/files.ts";
import EventService from "./services/events.ts";

export interface ServiceInterface {
  security: SecurityService;
  format: FormatService;
  files: FileService;
  events: EventService;
  env: any;
  service: {};
}

export class Services {
  security: SecurityService = new SecurityService();
  format: FormatService = new FormatService();
  files: FileService = new FileService();
  events: EventService = new EventService();
  service: Record<any, Record<any, Function>> = {};
  env: any = config();
}

export default new Services();
