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
