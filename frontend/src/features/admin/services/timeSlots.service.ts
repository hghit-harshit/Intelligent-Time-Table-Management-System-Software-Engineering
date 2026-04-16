import { withAuthHeaders } from "../../../services/authInterceptor";
import { SlotsEP, SlotByIdEP } from "../../../constants/Api_constants";

export async function fetchTimeSlotsFromApi() {
  const res = await fetch(SlotsEP, {
    headers: withAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch slots");
  }
  return res.json();
}

export async function saveTimeSlotToApi(
  slotId: string | null,
  payload: unknown,
) {
  const url = slotId ? SlotByIdEP(slotId) : SlotsEP;
  const res = await fetch(url, {
    method: slotId ? "PUT" : "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Failed to save slot";
    throw new Error(message);
  }

  return data;
}

export async function deleteTimeSlotFromApi(slotId: string) {
  const res = await fetch(SlotByIdEP(slotId), {
    method: "DELETE",
    headers: withAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message || "Failed to delete slot");
  }
}
