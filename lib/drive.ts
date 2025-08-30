export function getDriveDirectLink(url: string): string {
  try {
    // Extract the file ID from common Drive links
    const match = url.match(/[-\w]{25,}/);
    if (!match) return url; // if no ID found, return original

    const fileId = match[0];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch {
    return url;
  }
}
