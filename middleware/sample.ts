import { Context, Middleware } from '@nuxt/types'

const sample: Middleware = async ({ $axios, store }: Context) => {
  if (store.state.auth.isLogin === false) {
    await $axios.post('/api/ping', {}).then((res) => {
      // eslint-disable-next-line no-console
      console.log(res.data)
      store.commit('auth/login', res.data.message)
    })
  } else {
    // eslint-disable-next-line no-console
    console.log(store.state.auth.isLogin)
    // eslint-disable-next-line no-console
    console.log(store.state.auth.userId)
  }
}

export default sample
