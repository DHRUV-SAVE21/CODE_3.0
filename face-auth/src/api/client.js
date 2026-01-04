export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function getAccounts() {
  const res = await fetch(`${API_BASE_URL}/api/accounts`);
  if (!res.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return res.json();
}

export async function createCustomAccount(fullName, file) {
  const formData = new FormData();
  formData.append("full_name", fullName);
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/accounts/custom`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to create custom account");
  }

  return res.json();
}

export async function faceLogin(accountId, success) {
  const res = await fetch(`${API_BASE_URL}/api/auth/face-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accountId, success }),
  });

  if (!res.ok) {
    throw new Error("Failed to call face login endpoint");
  }

  return res.json();
}

export async function submitGuidedSolvingEvent(eventData) {
  const res = await fetch(`${API_BASE_URL}/api/guided-solving`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    throw new Error("Failed to submit event to backend");
  }

  return res.json();
}

export async function submitLiveDoubtEvent(eventData) {
  const res = await fetch(`${API_BASE_URL}/api/live-doubt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    throw new Error("Failed to submit doubt to backend");
  }

  return res.json();
}

export async function getUserDashboard(userId) {
  const res = await fetch(`${API_BASE_URL}/api/user/${userId}/dashboard`);
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return res.json();
}
