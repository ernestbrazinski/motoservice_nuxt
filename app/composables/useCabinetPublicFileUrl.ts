import { cabinetPublicFileUrl } from "~/utils/cabinet-upload";

/** Resolves `/upload/…` paths to absolute URLs using the configured GraphQL origin. */
export function useCabinetPublicFileUrl() {
  const runtimeConfig = useRuntimeConfig();
  return function imagePreviewSrc(publicPath: string): string {
    const graphqlUrl = (runtimeConfig.public.graphqlUrl as string)?.trim() || "";
    return cabinetPublicFileUrl(graphqlUrl, publicPath);
  };
}
