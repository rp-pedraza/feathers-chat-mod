import type {
  ClientApplication,
  FeathersService,
  HookContext,
  ServiceTypes
} from "@rp-pedraza/feathers-chat-mod-backend";
import assert from "assert";
import client from "../client";

export default class RecordsSynchronizer<
  K extends keyof ServiceTypes,
  T extends Awaited<ReturnType<ServiceTypes[K]["get"]>>
> {
  collection: Array<T> = [];
  service: FeathersService<ClientApplication, ServiceTypes[K]>;
  validator: (data: unknown) => Promise<T>;
  errorHandler: (error: unknown) => void | Promise<void>;
  listeners: Record<string, (object: T, context: HookContext) => Promise<void>> = {};

  async mainListener(eventName: string, object: T, _context: HookContext) {
    try {
      const validatedObject = await this.validator(object);
      assert(typeof validatedObject.id === "number");

      switch (eventName) {
        case "created":
        case "updated":
        case "patched":
          this.collection[validatedObject.id] = object;
          break;
        case "removed":
          delete this.collection[validatedObject.id];
      }
    } catch (error: unknown) {
      await this.errorHandler(error);
    }
  }

  constructor(
    collection: Array<T>,
    service: K | FeathersService<ClientApplication, ServiceTypes[K]>,
    validator: (data: unknown) => Promise<T>,
    errorHandler: (error: unknown) => void | Promise<void>
  ) {
    this.collection = collection;
    this.service = typeof service === "string" ? client.service(service) : service;
    this.validator = validator;
    this.errorHandler = errorHandler;
  }

  activate() {
    for (const eventName of ["created", "updated", "patched", "removed"]) {
      const listener = async (object: T, _context: HookContext) => {
        await this.mainListener(eventName, object, _context);
      };

      this.service.on(eventName, listener);
      this.listeners[eventName] = listener;
    }
  }

  deactivate() {
    for (const [eventName, listener] of Object.entries(this.listeners)) {
      this.service.off(eventName, listener);
    }
  }
}
