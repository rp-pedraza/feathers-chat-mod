<script setup lang="ts">
import client from '@/client'
import login from '@/login'
import router from '@/router'
import { useLoginErrorsStore } from '@/stores/login-errors'
import { defineModel, onMounted } from 'vue'
import { userValidator, type UserData } from '@rp-pedraza/feathers-chat-mod-backend'

const loginErrors = useLoginErrorsStore()
const email = defineModel<string>('email')
const password = defineModel<string>('password')

const signup = async () => {
  const credentials = { email: email.value, password: password.value }

  try {
    await userValidator(credentials)
  } catch (e: unknown) {
    loginErrors.add(e, 'Invalid credentials: ')
  }

  await client.service('users').create(credentials as UserData)
  await login(client, credentials as UserData)
}

const loginWithGitHub = () => {
  window.location.href = '/oauth/github'
}

onMounted(async () => {
  try {
    await login(client)
    router.push('/chat')
  } catch (error: unknown) {
    loginErrors.add(error)
  }
})
</script>

<template>
  <div class="login flex min-h-screen bg-neutral justify-center items-center">
    <div class="card w-full max-w-sm bg-base-100 px-4 py-8 shadow-xl">
      <div class="px-4">
        <i alt="" class="h-32 w-32 block mx-auto i-logos-feathersjs invert"></i>
        <h1 class="text-5xl font-bold text-center my-5 bg-clip-text bg-gradient-to-br">
          Feathers Chat
        </h1>
      </div>
      <form class="card-body pt-2">
        <div
          v-for="error in loginErrors.takeAll()"
          class="alert alert-error justify-start"
          :key="error.id"
        >
          <i class="i-feather-alert-triangle"></i>
          <span class="flex-grow" v-text="error.value.message"></span>
        </div>
        <div class="form-control">
          <label for="email" class="label"><span class="label-text">Email</span></label>
          <input
            type="text"
            name="email"
            placeholder="enter email"
            class="input input-bordered"
            v-model="email"
          />
        </div>
        <div class="form-control mt-0">
          <label for="password" class="label"><span class="label-text">Password</span></label>
          <input
            type="password"
            name="password"
            placeholder="enter password"
            class="input input-bordered"
            v-model="password"
          />
        </div>
        <div class="form-control mt-6">
          <button id="login" type="button" class="btn" @click="login(client)">Login</button>
        </div>
        <div class="form-control mt-6">
          <button id="signup" type="button" class="btn" @click="signup()">Signup</button>
        </div>
        <div class="form-control mt-6">
          <button id="login-with-github" type="button" class="btn" @click="loginWithGitHub()">
            Login with GitHub
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
