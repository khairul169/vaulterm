import api from "@/lib/api";

const authRepo = {
  getUser() {
    return api("/auth/user");
  },
};

export default authRepo;
