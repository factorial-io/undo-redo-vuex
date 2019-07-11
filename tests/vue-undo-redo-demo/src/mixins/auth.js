import { mapGetters, mapActions } from "vuex";

export default {
  computed: {
		...mapGetters("auth", {
			$_auth_isAuthenticated: "isAuthenticated"
		})
	},
  methods: {
    ...mapActions("auth", {
      $_auth_login: "login",
			$_auth_logout: "logout"
    })
  }
};
