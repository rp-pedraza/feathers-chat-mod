import type { ClientApplication, AuthenticationResult } from '@rp-pedraza/feathers-chat-mod-backend'

// Log in either using the given email/password or the token from storage
const login = async (
  client: ClientApplication,
  credentials: object | null = null,
): Promise<AuthenticationResult> => {
  if (!credentials) {
    // Try to authenticate using an existing token
    return await client.reAuthenticate()
  } else {
    // Otherwise log in with the `local` strategy using the credentials we got
    return client.authenticate({
      strategy: 'local',
      ...credentials,
    })
  }
}

export default login
