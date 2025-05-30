import type FieldStatus from "./field-status";

export type FieldValidator = (value: string | undefined) => Promise<FieldStatus>;
