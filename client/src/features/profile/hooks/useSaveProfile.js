import { useMutation } from "@tanstack/react-query";
import { createProfile, updateMyProfile } from "../../../lib/api/profile";
import { afterProfileSave } from "../queries/profileInvalidation";

export function useSaveProfile(isEditing) {
  return useMutation({
    mutationFn: (data) =>
      isEditing ? updateMyProfile(data) : createProfile(data),
    onSuccess: () => {
      afterProfileSave();
    },
  });
}
