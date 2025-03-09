<script setup lang="ts">
import {
  messageValidator,
  userValidator,
  type Message,
  type User,
  type Paginated,
} from '@rp-pedraza/feathers-chat-mod-backend'

import { useChatErrorsStore } from '@/stores/chat-errors'

const chatErrors = useChatErrorsStore()

import client from '@/client'
import login from '@/login'
import router from '@/router'

import { computed, nextTick, onMounted, ref } from 'vue'

const users = ref([] as Array<User>)
const messages = ref([] as Array<Message>)

const inputMessage = defineModel<string>('inputMessage')

const scrollToBottom = () => {
  const chat = document.querySelector('#chat')

  if (chat) {
    chat.scrollTop = chat.scrollHeight - chat.clientHeight
  }
}

const messageService = client.service('messages')
const userService = client.service('users')

messageService.on('created', async (message) => {
  try {
    await messageValidator(message)
  } catch (e: unknown) {
    chatErrors.add(e, 'Invalid message data detected: ')
  }

  if (0) {
    const { user = {} } = message

    try {
      await userValidator(user)
    } catch (e: unknown) {
      chatErrors.add(e, 'Invalid user data detected: ')
    }

    users.value.push(user)
  }

  messages.value.push(message)
  await nextTick(() => scrollToBottom())
})

userService.on('created', async (user) => {
  try {
    await userValidator(user)
  } catch (e: unknown) {
    chatErrors.add(e, 'Invalid user data detected: ')
  }

  users.value.push(user)
})

onMounted(async () => {
  // Check if logged in; redirect to '/login' if not

  try {
    await login(client, null)
  } catch (e: unknown) {
    console.debug('Not logged in', e)
    router.push('/login')
    return
  }

  let foundUsers: Paginated<User>

  // Find all users

  try {
    foundUsers = await userService.find()
  } catch (e: unknown) {
    chatErrors.add(e, 'Failed to get users: ')
    return
  }

  // Add each user to the list

  foundUsers.data.forEach((user) => users.value.push(user))

  // Find the latest 25 messages in newest comes first order

  let foundMessages: Paginated<Message>

  try {
    foundMessages = await messageService.find({
      query: {
        $sort: { createdAt: -1 },
        $limit: 25,
      },
    })
  } catch (e: unknown) {
    chatErrors.add(e, 'Failed to get messages: ')
    return
  }

  // Add existing messages

  if (foundMessages.data.length > 0) {
    // We want to show the newest message last

    foundMessages.data.reverse().forEach((message) => messages.value.push(message))

    // Always scroll to the bottom of our message list

    await nextTick(() => scrollToBottom())
  }
})

async function logout() {
  await client.logout()
  router.push('/login')
}

async function sendMessage() {
  if (typeof inputMessage.value === 'string' && inputMessage.value.length > 0) {
    await messageService.create({ text: inputMessage.value as string })
  }
}

const formatDate = (timestamp: number | undefined) => {
  if (typeof timestamp === 'number') {
    return new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'medium' }).format(
      new Date(timestamp),
    )
  } else {
    return '<Date unknown>'
  }
}

const userCount = computed(() => users.value.length)
</script>

<template>
  <div class="drawer drawer-mobile">
    <input id="drawer-left" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <div class="navbar w-full">
        <div class="navbar-start">
          <label for="drawer-left" class="btn btn-square btn-ghost lg:hidden drawer-button">
            <i class="i-feather-menu text-lg"></i>
          </label>
        </div>
        <div class="navbar-center flex flex-col">
          <p>Feathers Chat</p>
          <label for="drawer-right" class="text-xs cursor-pointer">
            <span class="online-count" v-text="userCount"></span> User(s)
          </label>
        </div>
        <div class="navbar-end">
          <div class="tooltip tooltip-left" data-tip="Logout">
            <button type="button" id="logout" class="btn btn-ghost" @click="logout">
              <i class="i-feather-log-out text-lg"></i>
            </button>
          </div>
        </div>
      </div>
      <div id="chat" class="h-full overflow-y-auto px-3">
        <div
          class="chat chat-start py-2"
          v-for="(message, messageIndex) in messages"
          :key="messageIndex"
        >
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img :src="message.user.avatar" />
            </div>
          </div>
          <div class="chat-header pb-1">
            <span v-text="message.user.email"></span>
            &nbsp;
            <time class="text-xs opacity-50" v-text="formatDate(message.createdAt)"></time>
          </div>
          <div class="chat-bubble" v-text="message.text"></div>
        </div>
      </div>
      <div class="form-control w-full py-2 px-3">
        <form class="input-group overflow-hidden" id="send-message" @submit.prevent="sendMessage">
          <input
            name="text"
            type="text"
            placeholder="Compose message"
            class="input input-bordered w-full"
            v-model="inputMessage"
          />
          <button type="submit" class="btn">Send</button>
        </form>
      </div>
    </div>
    <div class="drawer-side">
      <label for="drawer-left" class="drawer-overlay"></label>
      <ul class="menu user-list compact p-2 overflow-y-auto w-60 bg-base-300 text-base-content">
        <li class="menu-title"><span>Users</span></li>
        <li class="user" v-for="(user, userIndex) in users" :key="userIndex">
          <a>
            <div class="avatar indicator">
              <div class="w-6 rounded"><img :src="user.avatar" :alt="user.email" /></div>
            </div>
            <span v-text="user.email"></span>
          </a>
        </li>
      </ul>
      <div
        v-for="error in chatErrors.takeAll()"
        class="alert alert-error justify-start"
        :key="error.id"
      >
        <i class="i-feather-alert-triangle"></i>
        <span class="flex-grow" v-text="error.value.message"></span>
      </div>
    </div>
  </div>
</template>
