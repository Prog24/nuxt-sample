export const state = () => ({
  isLogin: false,
  email: '',
  isFirstLogin: false,
})

export const mutations = {
  // eslint-disable-next-line no-shadow
  login(state, email) {
    // eslint-disable-next-line no-param-reassign
    state.isLogin = true
    // eslint-disable-next-line no-param-reassign
    state.email = email
  },
}
