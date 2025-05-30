export class Singleton {
  constructor() {
    const subclass = this.constructor as { name: string; __instance__?: object };

    if (subclass.name === "Singleton") {
      throw new Error("Can't instantiate the Singleton class directly");
    } else if (subclass.__instance__) {
      throw new Error("Class can only be instantiated once");
    } else {
      subclass.__instance__ = this;
    }
  }

  public static instance<T extends Singleton>(this: { new (): T; __instance__?: T }) {
    return this.__instance__ ?? new this();
  }
}
