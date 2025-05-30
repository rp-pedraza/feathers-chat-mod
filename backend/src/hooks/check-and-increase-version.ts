import { Conflict } from "@feathersjs/errors";
import { HookContext } from "@feathersjs/feathers";

const checkAndIncreaseVersion = async (context: HookContext) => {
  const { id, data, service, method, params } = context;

  console.log("method", method);

  if (method === "update" || method === "patch") {
    const { version, ...updateData } = data;

    if (params.user && !version) {
      throw new Conflict("Version is required");
    }

    const current = await service.get(id);

    if (!current) {
      throw new Conflict("Record not found");
    }

    if (params.user && current.version !== version) {
      throw new Conflict("Version mismatch");
    }

    context.data = {
      ...updateData,
      version: current.version + 1
    };
  }
};

export default checkAndIncreaseVersion;
