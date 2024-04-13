import { defaultAt, defaultVersion, RegistryUrl } from "./utils.ts";

interface NestLandResponse {
  // a list of names of the form "<repo>@<version>"
  packageUploadNames?: string[];
}

const NL_CACHE: Map<string, string[]> = new Map<string, string[]>();
async function nestlandReleases(
  repo: string,
  cache: Map<string, string[]> = NL_CACHE,
): Promise<string[]> {
  if (cache.has(repo)) {
    return cache.get(repo)!;
  }

  const url = `https://x.nest.land/api/package/${repo}`;
  const { packageUploadNames }: NestLandResponse = await (await fetch(url))
    .json();

  if (!packageUploadNames) {
    return [];
  }

  // reverse so newest versions are first
  return packageUploadNames.map((name) => name.split("@")[1]).reverse();
}

export class NestLand extends RegistryUrl {
  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return this.url.split("/")[3].split("@")[0];
  }

  regexp =
    /https?:\/\/x\.nest\.land\/[^\/\"\']+@(?!master)[^\/\"\']+\/[^\'\"]*/;

  all(): Promise<string[]> {
    return nestlandReleases(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new NestLand(url);
  }
}