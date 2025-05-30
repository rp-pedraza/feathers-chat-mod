<script setup lang="ts">
import type DecoratedMessage from "../types/decorated-message";
import { TextDecoration } from "../types/text-decoration";

const { message } = defineProps<{ message: string | DecoratedMessage }>();
const decoration = typeof message === "string" ? undefined : message.decoration;
</script>

<template>
  <div class="pt-1 pl-1 text-sm" v-if="message">
    <span
      v-if="decoration === TextDecoration.CheckMark"
      class="text-success-content mr-1"
      role="img"
      aria-label="Success"
      >✓</span
    >
    <span
      v-if="decoration === TextDecoration.Ballot"
      class="text-error-content mr-1"
      role="img"
      aria-label="Error"
      >✗</span
    >
    <span v-text="message"></span>
  </div>
</template>
