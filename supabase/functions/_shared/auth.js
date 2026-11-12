export async function authorizeStaffToken(token, userClient) {
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data?.user || data.user.is_anonymous) return false;
  const membership = await userClient.rpc("is_staff");
  return !membership.error && membership.data === true;
}
