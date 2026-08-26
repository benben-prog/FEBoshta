import { getCookie } from "./cookies";

const getUser = () => {
  const userData = getCookie("user_data");
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

const getUserPermissions = () => {
  const user = getUser();
  return user?.permissions || null;
};

export { getUser, getUserRole, getUserPermissions };
export default getUser;
