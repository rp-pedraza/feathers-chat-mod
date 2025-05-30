<script setup lang="ts">
import {
  messageValidator,
  userValidator,
  type Message,
  type Paginated,
  type User
} from "@rp-pedraza/feathers-chat-mod-backend";
import { computed, nextTick, onBeforeMount, onMounted, ref } from "vue";
import client from "../client";
import getCurrentUserValidated from "../common/get-current-user-validated";
import logout from "../common/logout";
import setupErrorHandling from "../common/setup-error-handling";
import UserAvatar from "../components/UserAvatar.vue";

const currentUserId = ref(0);
const inputMessage = defineModel<string>("inputMessage");
const messages = ref([] as Array<Message>);
const messageService = client.service("messages");
const showSettingsDropdown = ref(false);
const users = ref([] as Array<User>);
const userService = client.service("users");

const { addError } = setupErrorHandling("chat", {
  discardedErrorsSelector: (e) => e.domain !== "chat"
});

const scrollToBottom = () => {
  const chat = document.getElementById("chat-main");

  if (chat) {
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }
};

const sendMessage = async () => {
  if (typeof inputMessage.value === "string" && inputMessage.value.length > 0) {
    await messageService.create({ text: inputMessage.value as string });
  }
};

const formatDate = (timestamp: number | undefined) =>
  typeof timestamp === "number" ? new Date(timestamp).toLocaleString() : undefined;

const userCount = computed(() => users.value.length);

const isCurrentUser = (user: User) => user.id === currentUserId.value;

messageService.on("created", async (message) => {
  await messageValidator(message);
  messages.value.push(message);
  nextTick(() => scrollToBottom());
});

userService.on("created", async (user) => {
  await userValidator(user);
  users.value.push(user);
});

const toggleShowSettingsDropdown = () => {
  showSettingsDropdown.value = !showSettingsDropdown.value;
};

const onSettingsDropdownFocusOut = (ev: FocusEvent, dropdownElement: HTMLElement) => {
  if (!dropdownElement.contains(ev.relatedTarget as HTMLElement | null)) {
    showSettingsDropdown.value = false;
  }
};

onBeforeMount(async () => {
  const foundUsers = await userService.find();
  users.value.push(...foundUsers.data);

  const currentUser = await getCurrentUserValidated();
  currentUserId.value = currentUser.id;

  let foundMessages: Paginated<Message>;

  try {
    foundMessages = await messageService.find({
      query: {
        $sort: { createdAt: -1 },
        $limit: 25
      }
    });
  } catch (e: unknown) {
    addError(e, "Failed to get messages: ");
    return;
  }

  if (foundMessages.data.length > 0) {
    messages.value.push(...foundMessages.data.reverse());
    onMounted(() => scrollToBottom());
  }
});
</script>

<template>
  <div id="chat" class="drawer lg:drawer-open">
    <input id="drawer-left" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content h-full overflow-hidden flex flex-col">
      <div class="navbar w-full">
        <div class="navbar-start">
          <label for="drawer-left" class="btn btn-square btn-ghost lg:hidden drawer-button">
            <i class="i-feather-menu text-lg"></i>
          </label>
        </div>
        <div class="navbar-center flex flex-col">
          <p>Feathers Chat Mod</p>
          <label for="drawer-right" class="text-xs cursor-pointer">
            <span class="online-count" v-text="userCount"></span> User(s)
          </label>
        </div>
        <div class="navbar-end">
          <div
            class="dropdown dropdown-open tooltip tooltip-left"
            data-tip="Settings"
            @focusout="onSettingsDropdownFocusOut($event, $refs.dropdown as HTMLElement)"
            ref="dropdown"
          >
            <button type="button" class="btn btn-ghost" @click="toggleShowSettingsDropdown">
              <i class="i-heroicons-cog-6-tooth text-lg"></i>
            </button>
            <ul
              class="menu dropdown-content bg-base-200 z-1 w-52 shadow-sm px-0"
              v-if="showSettingsDropdown"
            >
              <li><router-link to="/avatars">Avatars</router-link></li>
              <li><router-link to="/username">Username</router-link></li>
            </ul>
          </div>
          <div class="tooltip tooltip-bottom ml-2" data-tip="Logout">
            <button type="button" id="logout-button" class="btn btn-ghost" @click="logout">
              <i class="i-feather-log-out text-lg"></i>
            </button>
          </div>
        </div>
      </div>
      <div id="chat-main" class="h-full overflow-y-auto px-3">
        <div
          class="chat chat-start py-2"
          v-for="(message, messageIndex) in messages"
          :key="messageIndex"
        >
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <UserAvatar :user="message.user" />
            </div>
          </div>
          <div class="chat-header pb-1 text-sm">
            <span v-text="message.user.username"></span>
            &nbsp;
            <time class="opacity-50" v-text="formatDate(message.createdAt)"></time>
          </div>
          <div class="chat-bubble" v-text="message.text"></div>
        </div>
      </div>
      <fieldset class="fieldset w-full py-2 px-3">
        <form class="input-group" id="send-message" @submit.prevent="sendMessage">
          <div class="join w-full">
            <input
              name="text"
              type="text"
              placeholder="Compose message"
              class="input input-bordered w-full join-item"
              v-model="inputMessage"
            />
            <button type="submit" class="btn join-item">Send</button>
          </div>
        </form>
      </fieldset>
    </div>
    <div class="drawer-side">
      <label for="drawer-left" class="drawer-overlay"></label>
      <ul
        class="menu user-list compact p-2 overflow-y-auto w-60 bg-base-300 text-base-content h-full"
      >
        <li class="menu-title"><span>Users</span></li>
        <li
          class="user"
          v-for="(user, userIndex) in users"
          :key="userIndex"
          :class="{ 'current-user': isCurrentUser(user) }"
        >
          <a>
            <div class="avatar indicator">
              <div class="w-6 rounded">
                <UserAvatar :user="user" />
              </div>
            </div>
            <span v-text="user.username"></span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.drawer-side li.user {
  color: #aaa;
  font-weight: bold;

  &.current-user {
    color: orange;
  }
}

:root {
  --original-fg-color: rgb(194, 202, 245);
  --original-bg-color: rgb(65, 69, 88);
  --original-hover-color: rgba(248, 248, 242, 0.2);
}

#send-message {
  input {
    &,
    &:focus,
    &:focus-within {
      --input-color: var(--original-bg-color);
    }
  }

  button {
    text-transform: uppercase;
  }
}

#send-message button,
.chat-bubble {
  color: var(--original-fg-color);
  background-color: var(--original-bg-color);
  border-color: var(--original-bg-color);
}

.btn-ghost:hover,
.btn-ghost.btn-active {
  background-color: var(--original-hover-color);
}
</style>
