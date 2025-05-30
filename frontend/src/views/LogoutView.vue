<script setup lang="ts">
import client from "../client";
import router from "../router";

client.logout().then(() => router.replace("/login"));
</script>
