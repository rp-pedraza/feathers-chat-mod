<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import getUserAvatar from "../common/get-user-avatar";

const props = defineProps(["user"]);
const src = ref<string>();
const alt = ref<string>();

onBeforeMount(async () => {
  if (props.user) {
    src.value = await getUserAvatar(props.user);
    alt.value = props.user.username;
  }
});
</script>

<template>
  <img :src="src" :alt="alt" v-if="src" />
</template>
