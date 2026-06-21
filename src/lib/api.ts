const RUN_BASE = "https://{fn}-2ekw2r45la-uc.a.run.app";

function apiUrl(fn: string): string {
  if (import.meta.env.DEV) {
    return `/api/${fn}`;
  }
  return RUN_BASE.replace("{fn}", fn.toLowerCase());
}

export async function fetchAvailableSlots(date: string) {
  const res = await fetch(`${apiUrl("getAvailableSlots")}?date=${date}`);
  return res.json();
}

export async function createBooking(data: {
  date: string;
  time: string;
  companyName: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  companySize?: string;
  interest?: string;
}) {
  const res = await fetch(apiUrl("createBooking"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchBookings(token: string, filters?: { status?: string; date?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.date) params.set("date", filters.date);

  const res = await fetch(`${apiUrl("getBookings")}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateBookingStatus(token: string, bookingId: string, status: string) {
  const res = await fetch(apiUrl("updateBookingStatus"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId, status }),
  });
  return res.json();
}

export async function manageSlots(
  token: string,
  action: "create" | "delete",
  date: string,
  times: string[]
) {
  const res = await fetch(apiUrl("manageSlots"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, date, times }),
  });
  return res.json();
}
