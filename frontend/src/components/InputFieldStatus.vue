<script setup lang="ts">
import DataWithID from "../classes/data-with-id";
import getFieldStatusMessages from "../common/get-field-status-messages";
import type FieldStatus from "../types/field-status";
import InputFieldStatusMessage from "./InputFieldStatusMessage.vue";

const { status } = defineProps<{ status: FieldStatus | undefined }>();
const messages = getFieldStatusMessages(status).map((message) => new DataWithID(message));
</script>

<template>
  <InputFieldStatusMessage v-for="message in messages" :message="message.value" :key="message.id" />
</template>
