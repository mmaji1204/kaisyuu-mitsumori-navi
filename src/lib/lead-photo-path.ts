// Stored references may be new private keys or legacy public Storage URLs.
// A reference identifies an object; it never grants access to that object.
export function getLeadPhotoPath(reference: string): string | null {
  let path: string;
  try {
    if (reference.startsWith("lead-photos:")) {
      path = reference.slice("lead-photos:".length);
    } else {
      const url = new URL(reference);
      const prefix = "/storage/v1/object/public/lead-photos/";
      if (!url.pathname.startsWith(prefix)) return null;
      path = decodeURIComponent(url.pathname.slice(prefix.length));
    }
  } catch {
    return null;
  }
  const parts = path.split("/");
  if (parts.length !== 2 || !/^[\w-]+$/.test(parts[0]) ||
      !/^[\w.-]+$/.test(parts[1]) || [".", ".."].includes(parts[1])) return null;
  return path;
}

export function getProtectedLeadPhotoUrl(reference: string) {
  const path = getLeadPhotoPath(reference);
  return path ? `/api/lead-photos/${path.split("/").map(encodeURIComponent).join("/")}` : "";
}
