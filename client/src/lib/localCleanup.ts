// Evidence Room design reminder: local-first, explicit permissions, reversible recovery path.

export type LocalImage = {
  id: string;
  name: string;
  path: string;
  size: number;
  width: number;
  height: number;
  hash: string;
  fingerprint: string;
  handle: FileSystemFileHandle;
  parent: FileSystemDirectoryHandle;
};

export type LocalPair = {
  id: number;
  candidate: LocalImage;
  retained: LocalImage;
  type: "Exact duplicate" | "Visual near-duplicate";
  subject: string;
  reason: string;
};

const IMAGE_TYPES = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp", "tif", "tiff"]);

function extension(name: string) { return name.split(".").pop()?.toLowerCase() ?? ""; }

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function imageInfo(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 16; canvas.height = 16;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  context.drawImage(bitmap, 0, 0, 16, 16);
  bitmap.close();
  const pixels = context.getImageData(0, 0, 16, 16).data;
  const values: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) values.push((pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 114) / 1000);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return { width: bitmap.width, height: bitmap.height, fingerprint: values.map((value) => value >= average ? "1" : "0").join("") };
}

function hamming(a: string, b: string) { let distance = 0; for (let i = 0; i < Math.min(a.length, b.length); i += 1) if (a[i] !== b[i]) distance += 1; return distance + Math.abs(a.length - b.length); }

async function* walk(directory: FileSystemDirectoryHandle, prefix = ""): AsyncGenerator<{ file: File; handle: FileSystemFileHandle; parent: FileSystemDirectoryHandle; path: string }> {
  for await (const [name, entry] of (directory as any).entries()) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (entry.kind === "file" && IMAGE_TYPES.has(extension(name))) yield { file: await entry.getFile(), handle: entry, parent: directory, path };
    if (entry.kind === "directory" && !name.startsWith(".")) yield* walk(entry, path);
  }
}

export async function scanLocalFolder(directory: FileSystemDirectoryHandle, onProgress?: (count: number) => void) {
  const images: LocalImage[] = [];
  for await (const item of walk(directory)) {
    const info = await imageInfo(item.file);
    images.push({ id: item.path, name: item.file.name, path: item.path, size: item.file.size, width: info.width, height: info.height, hash: await sha256(item.file), fingerprint: info.fingerprint, handle: item.handle, parent: item.parent });
    onProgress?.(images.length);
  }
  const pairs: LocalPair[] = [];
  const used = new Set<string>();
  let id = 1;
  for (let i = 0; i < images.length; i += 1) {
    for (let j = i + 1; j < images.length; j += 1) {
      const a = images[i]; const b = images[j];
      if (used.has(a.id) || used.has(b.id)) continue;
      const exact = a.hash === b.hash;
      const visual = !exact && a.width === b.width && a.height === b.height && hamming(a.fingerprint, b.fingerprint) <= 22;
      if (exact || visual) {
        const candidate = a.size <= b.size ? a : b;
        const retained = candidate.id === a.id ? b : a;
        pairs.push({ id: id++, candidate, retained, type: exact ? "Exact duplicate" : "Visual near-duplicate", subject: exact ? "Identical image content" : "Visually similar image content", reason: exact ? "Identical SHA-256 hash. The file bytes are the same." : "Matching dimensions and close visual fingerprint. Review the pair before removal." });
        used.add(a.id); used.add(b.id);
      }
    }
  }
  return { images, pairs };
}

export async function moveToRecoveryAndDelete(image: LocalImage, recoveryDirectory?: FileSystemDirectoryHandle) {
  if (recoveryDirectory) {
    const recovery = await recoveryDirectory.getDirectoryHandle("Evidence Room Recovery", { create: true });
    const writableFile = await recovery.getFileHandle(`${Date.now()}-${image.name}`, { create: true });
    const writable = await writableFile.createWritable();
    await writable.write(await image.handle.getFile());
    await writable.close();
  }
  await image.parent.removeEntry(image.name);
}

export function browserSupportsLocalFiles() { return "showDirectoryPicker" in window && "crypto" in window && "subtle" in crypto; }
