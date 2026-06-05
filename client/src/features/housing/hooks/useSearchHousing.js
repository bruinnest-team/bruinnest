import { useQuery } from "@tanstack/react-query";
import { searchHousing } from "../../../lib/api/housing";
import { housingKeys } from "../queries/queryKeys";

const PAGE_SIZE = 10;

function buildHousingQuery(filters, page) {
  const parts = [];
  if (filters.q) parts.push("q=" + encodeURIComponent(filters.q));
  if (filters.neighborhood) parts.push("neighborhood=" + encodeURIComponent(filters.neighborhood));
  if (filters.budgetMin) parts.push("budgetMin=" + encodeURIComponent(filters.budgetMin));
  if (filters.budgetMax) parts.push("budgetMax=" + encodeURIComponent(filters.budgetMax));
  if (filters.bedrooms) parts.push("bedrooms=" + encodeURIComponent(filters.bedrooms));
  parts.push("page=" + page);
  parts.push("pageSize=" + PAGE_SIZE);
  return "?" + parts.join("&");
}

export function useSearchHousing(filters, page) {
  return useQuery({
    queryKey: housingKeys.filtered(filters, page),
    queryFn: () =>
      searchHousing(buildHousingQuery(filters, page)).then((res) => res.data),
    placeholderData: (prev) => prev,
  });
}
