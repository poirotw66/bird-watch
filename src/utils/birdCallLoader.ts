export interface BirdCallManifestEntry {
  id: string;
  path: string;
  ext: string;
}

interface BirdCallManifest {
  calls: BirdCallManifestEntry[];
}

class BirdCallLoader {
  private pathById = new Map<string, string>();

  public async loadManifest(): Promise<void> {
    try {
      const response = await fetch('/audio/bird-calls/manifest.json');
      if (!response.ok) {
        return;
      }
      const manifest = (await response.json()) as BirdCallManifest;
      this.pathById.clear();
      for (const entry of manifest.calls || []) {
        this.pathById.set(entry.id, entry.path);
      }
    } catch {
      // Manifest optional; quiz falls back to synthetic calls.
    }
  }

  public getCallPath(birdId: string): string | undefined {
    return this.pathById.get(birdId);
  }

  public hasManifestEntry(birdId: string): boolean {
    return this.pathById.has(birdId);
  }
}

export const birdCallLoader = new BirdCallLoader();
