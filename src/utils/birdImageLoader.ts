export interface BirdManifestEntry {
  id: string;
  original: string;
  large: string;
  medium: string;
  thumbnail: string;
}

interface BirdManifest {
  images: BirdManifestEntry[];
}

class BirdImageLoader {
  private cache = new Map<string, HTMLImageElement>();
  private manifestById = new Map<string, BirdManifestEntry>();

  public async loadManifest(): Promise<void> {
    const response = await fetch('/images/birds/manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to load bird manifest: ${response.status}`);
    }
    const manifest = (await response.json()) as BirdManifest;
    this.manifestById.clear();
    for (const entry of manifest.images) {
      this.manifestById.set(entry.id, entry);
    }
  }

  public async preloadAll(): Promise<void> {
    if (this.manifestById.size === 0) {
      await this.loadManifest();
    }
    const urls = new Set<string>();
    for (const entry of this.manifestById.values()) {
      urls.add(entry.medium);
      urls.add(entry.thumbnail);
      urls.add(entry.large);
    }
    await Promise.all([...urls].map((url) => this.load(url)));
  }

  public async load(url: string): Promise<HTMLImageElement> {
    const cached = this.cache.get(url);
    if (cached && cached.complete) {
      return cached;
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  public get(url: string): HTMLImageElement | undefined {
    const img = this.cache.get(url);
    if (img?.complete) {
      return img;
    }
    return undefined;
  }

  public getPathsForBird(birdId: string): BirdManifestEntry | undefined {
    return this.manifestById.get(birdId);
  }

  public getMedium(birdId: string): HTMLImageElement | undefined {
    const paths = this.manifestById.get(birdId);
    if (!paths) {
      return undefined;
    }
    return this.get(paths.medium);
  }

  public getThumbnail(birdId: string): HTMLImageElement | undefined {
    const paths = this.manifestById.get(birdId);
    if (!paths) {
      return undefined;
    }
    return this.get(paths.thumbnail);
  }

  public getLarge(birdId: string): HTMLImageElement | undefined {
    const paths = this.manifestById.get(birdId);
    if (!paths) {
      return undefined;
    }
    return this.get(paths.large);
  }
}

export const birdImageLoader = new BirdImageLoader();
