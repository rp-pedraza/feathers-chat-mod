import { type DebounceSettings, debounce } from "lodash-es";
import { type ModelRef, type Ref, watch } from "vue";

const watchDebounced = <T>(
  model: ModelRef<T> | Ref<T>,
  func: (value: T) => Promise<void>,
  wait?: number,
  options?: DebounceSettings
) => {
  watch(model, debounce(func, wait ?? 500, options));
};

export default watchDebounced;
