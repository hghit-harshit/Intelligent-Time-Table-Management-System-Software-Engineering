import { withAuthHeaders } from "../../../services/authInterceptor";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export async function fetchTimeSlotsFromApi() {
  const res = await fetch(`${API_BASE}/slots`, {
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
  const url = slotId ? `${API_BASE}/slots/${slotId}` : `${API_BASE}/slots`;
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
  const res = await fetch(`${API_BASE}/slots/${slotId}`, {
    method: "DELETE",
    headers: withAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message || "Failed to delete slot");
  }
}
