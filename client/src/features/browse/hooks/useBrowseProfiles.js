import { useQuery } from "@tanstack/react-query";
import { getProfiles } from "../../../lib/api/profile";
import { browseKeys } from "../queries/queryKeys";

const PAGE_SIZE = 10;

function buildQuery(filters, page) {
  const parts = [];
  if (filters.keyword) parts.push("keyword=" + encodeURIComponent(filters.keyword));
  if (filters.gender) parts.push("gender=" + encodeURIComponent(filters.gender));
  if (filters.graduationYear) parts.push("graduationYear=" + encodeURIComponent(filters.graduationYear));
  if (filters.budgetMin) parts.push("budgetMin=" + encodeURIComponent(filters.budgetMin));
  if (filters.budgetMax) parts.push("budgetMax=" + encodeURIComponent(filters.budgetMax));
  if (filters.moveInDate) parts.push("moveInDate=" + encodeURIComponent(filters.moveInDate));
  if (filters.sortBy) parts.push("sortBy=" + encodeURIComponent(filters.sortBy));
  parts.push("page=" + page);
  parts.push("pageSize=" + PAGE_SIZE);
  return "?" + parts.join("&");
}

export function useBrowseProfiles(filters, page) {
  return useQuery({
    queryKey: browseKeys.filtered(filters, page),
    queryFn: () =>
      getProfiles(buildQuery(filters, page)).then((res) => res.data),
    placeholderData: (prev) => prev,
  });
}
