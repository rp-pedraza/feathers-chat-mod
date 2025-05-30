<script setup lang="ts">
import { upcaseFirstLetter } from "@rp-pedraza/feathers-chat-mod-utils";
import { computed, watchEffect } from "vue";
import getFieldStatusMessages from "../common/get-field-status-messages";
import { BindableInputType } from "../types/bindable-input-types";
import type FieldStatus from "../types/field-status";
import type { FieldValidator } from "../types/field-validator";
import InputFieldStatus from "./InputFieldStatus.vue";

const props = defineProps<{
  label: string;
  name: string;
  type?: BindableInputType;
  title?: string;
  placeholder?: string;
  required?: boolean;
  validator?: FieldValidator;
}>();

const { label, name, validator } = props;
const { placeholder = "", required = false, type = BindableInputType.Text } = props;
const { title = `${upcaseFirstLetter(type)} input` } = props;
const value = defineModel<string>("value");
const status = defineModel<FieldStatus>("status");

if (validator) {
  watchEffect(async () => {
    status.value = await validator(value.value);
  });
}

const getFieldAttributes = (status: FieldStatus | undefined, defaultTitle: string) => {
  const valid = status?.valid;
  const title = getFieldStatusMessages(status)
    .map((message) => (typeof message === "string" ? message : message.message))
    .join("\n");

  return {
    class: { "input-success": valid === true, "input-error": valid === false },
    title: title || defaultTitle
  };
};

const attributes = computed(() => getFieldAttributes(status.value, title));
</script>

<template>
  <fieldset class="fieldset">
    <legend :for="name" class="fieldset-legend" v-text="label"></legend>
    <input
      :type="type"
      :name="name"
      :placeholder="placeholder"
      class="input input-bordered"
      :class="attributes.class"
      :title="attributes.title"
      v-model="value"
      :required="required"
    />
    <InputFieldStatus :status="status" v-if="status" />
  </fieldset>
</template>
