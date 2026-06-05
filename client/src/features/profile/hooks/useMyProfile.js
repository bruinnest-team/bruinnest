import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../../lib/api/profile";
import { profileKeys } from "../queries/queryKeys";

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.myProfile,
    queryFn: () => getMyProfile().then((res) => res.data),
    retry: false,
  });
}
