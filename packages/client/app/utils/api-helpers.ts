export function getStrapiURL(path = "") {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

  return `${baseUrl}${path}`;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return "";

  if (url.startsWith("http") || url.startsWith("//")) return url;

  return `${getStrapiURL()}${url}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

export const extractAttributes = <T = any>(data: { attributes: T }[]): T[] => {
  return data?.map((item) => item.attributes);
};
