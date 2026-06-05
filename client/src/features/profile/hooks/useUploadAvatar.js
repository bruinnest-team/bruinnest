import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMyAvatar } from "../../../lib/api/profile";
import { afterProfileSave } from "../queries/profileInvalidation";
import { profileKeys } from "../queries/queryKeys";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return uploadMyAvatar(formData);
    },
    onSuccess: (res) => {
      queryClient.setQueryData(profileKeys.myProfile, (profile) =>
        profile
          ? { ...profile, avatarUrl: res.data.avatarUrl }
          : profile
      );
      afterProfileSave();
    },
  });
}
