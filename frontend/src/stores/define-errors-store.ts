import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { stash, unstash } from 'json-stash'

import DataWithID from '@/classes/data-with-id'

const setupErrorsStore = () => {
  const errors = ref([] as Array<DataWithID<Error>>)

  function add(error: unknown, prefix: string = '') {
    if (error instanceof DataWithID) {
      errors.value.push(error as DataWithID<Error>)
    } else if (error instanceof Error) {
      errors.value.push(new DataWithID<Error>(error as Error))
    } else if (typeof error === 'string') {
      errors.value.push(new DataWithID<Error>(new Error((prefix + error) as string)))
    } else if (Object.prototype.hasOwnProperty.call(error, 'toString')) {
      errors.value.push(
        new DataWithID<Error>(new Error(prefix + (error as { toString: () => string }).toString())),
      )
    } else {
      errors.value.push(new DataWithID<Error>(new Error(prefix + '(Unknown error type)')))
    }
  }

  function clear() {
    return errors.value.splice(0)
  }

  function takeAll() {
    return errors.value.splice(0)
  }

  const asMessages = computed((): Array<string> => errors.value.map((e) => e.value.message))

  return { errors, add, clear, takeAll, asMessages }
}

export const defineErrorsStore = (name: string) =>
  defineStore(name, setupErrorsStore, {
    persist: {
      key: name,
      storage: sessionStorage,
      pick: [name],
      serializer: {
        serialize: stash,
        deserialize: unstash,
      },
    },
  })
