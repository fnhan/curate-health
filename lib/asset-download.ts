/**
 * Builds a download link for a Sanity file asset that saves under its real
 * name rather than its content hash.
 *
 * A Sanity file URL ends in the asset's SHA, for example
 * `.../6cb3d58ca11474dacffaa870ecaa71c6e2476ca6.pdf`. Linked as-is, that is
 * the filename the browser saves, so a physician who downloads the Curate
 * Lifestyle referral form ends up with a 40 character hash on their desktop.
 *
 * Sanity's CDN takes a `?dl=` parameter naming the file in the
 * Content-Disposition header. Passing the name explicitly is also the only
 * reliable route: the CDN keeps serving the name the asset was uploaded with,
 * and editing `originalFilename` on the asset document afterwards does not
 * change what a bare `?dl=` returns. Verified 2026-09-08 against the referral
 * form, whose stored name was corrected but whose bare `?dl=` still served the
 * misspelled original.
 */

type DownloadableAsset =
  | {
      url?: string | null;
      originalFilename?: string | null;
    }
  | null
  | undefined;

export function getAssetDownloadUrl(asset: DownloadableAsset): string {
  const url = asset?.url?.trim();
  if (!url) return "";

  const filename = asset?.originalFilename?.trim();
  if (!filename) return url;

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}dl=${encodeURIComponent(filename)}`;
}
