import { useQuery } from "@tanstack/react-query";
import { getProfileById } from "../../../lib/api/profile";
import { profileKeys } from "../queries/queryKeys";

export function useProfileDetail(userId) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => getProfileById(userId).then((res) => res.data),
  });
}
