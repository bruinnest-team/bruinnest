import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMyAvatar } from "../../../lib/api/profile";
import { profileKeys } from "../queries/queryKeys";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return uploadMyAvatar(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.myProfile });
    },
  });
}
