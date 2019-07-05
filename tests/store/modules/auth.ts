const debug = process.env.NODE_ENV !== "production";

const state = {
  token: "",
  status: ""
};

const validateToken = (token: string) => token === "login-token";

const getters = {
  isAuthenticated: (state: any) => validateToken(state.token)
};

const apiLogin = (): Promise<{ token: string }> =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ token: "login-token" });
    }, 200);
  });
const apiLogout = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 200);
  });

const actions = {
  async login({ commit }: { commit: any }) {
    try {
      commit("setStatusLoading");
      const { token } = await apiLogin();
      validateToken(token);
      commit("setStatusSuccess", { token });
    } catch (e) {
      console.error(e);
      commit("setStatusError");
    }
  },
  async logout({ commit }: { commit: any }) {
    try {
      commit("setStatusLoading");
      await apiLogout();
      commit("setStatusLoggedOut");
    } catch (e) {
      console.error(e);
      commit("setStatusError");
    }
  }
};

const mutations = {
  setStatusLoading(state: any) {
    state.status = "loading";
  },

  setStatusSuccess(state: any, { token }: { token: string }) {
    state.status = "success";
    state.token = token;
  },

  setToken(state: any, { token }: { token: string }) {
    state.token = token;
  },

  setStatusError(state: any) {
    state.status = "error";
    state.token = "";
  },

  setStatusLoggedOut(state: any) {
    state.status = "success";
    state.token = "";
  }
};

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true,
  debug
};
