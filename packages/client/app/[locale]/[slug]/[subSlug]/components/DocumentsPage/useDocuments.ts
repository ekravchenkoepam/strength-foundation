import { useQuery } from '@tanstack/react-query';

import { getStrapiMedia } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

interface DocumentsFile {
  data?: {
    id: number;
    attributes: {
      alternativeText: string | null;
      caption: string | null;
      createdAt: string;
      ext: string;
      formats: string[] | null;
      hash: string;
      height: number | null;
      mime: string;
      name: string;
      previewUrl: string | null;
      provider: string;
      provider_metadata: string | null;
      size: number | null;
      updatedAt: string;
      url: string | null;
    };
  } | null;
}

interface DocumentsAttributes {
  createdAt: string;
  name: string;
  publishedAt: string;
  updatedAt: string;
  file: DocumentsFile;
}

interface DocumentsResponse {
  id: number;
  attributes: DocumentsAttributes;
}

interface DocumentsPageResponse {
  data?: {
    id: number;
    attributes?: {
      title?: string;
      description?: string;
      documents?: {
        data?: DocumentsResponse[];
      };
    };
  } | null;
}

export interface ParsedDocs {
  id: number;
  name: string;
  url: string;
}

export interface DocumentsPageData {
  title: string;
  description: string;
  documents: ParsedDocs[];
}

export const useDocuments = (locale: string) => {
  const parseDocuments = (documentsRes: DocumentsResponse[]): ParsedDocs[] => {
    return documentsRes
      .filter((doc: DocumentsResponse) => doc.attributes.file?.data?.attributes?.url)
      .map((doc: DocumentsResponse) => ({
        id: doc.id,
        name: doc.attributes.name,
        url: getStrapiMedia(doc.attributes.file.data?.attributes.url ?? ''),
      }));
  };

  const { data: page = { title: 'Документи', description: '', documents: [] }, isLoading } =
    useQuery<DocumentsPageData>({
      queryKey: ['documents-page', locale],
      queryFn: async () => {
        const response = (await fetchAPI({
          path: '/documents-page',
          urlParams: {
            locale,
            populate: {
              documents: {
                populate: '*',
              },
            },
          },
        })) as DocumentsPageResponse;

        return {
          title: response?.data?.attributes?.title || 'Документи',
          description: response?.data?.attributes?.description || '',
          documents: parseDocuments(response?.data?.attributes?.documents?.data || []),
        };
      },
    });

  const openInNewTab = (link: string) => () => {
    window.open(link, '_blank');
  };

  return {
    documentsList: page.documents,
    openInNewTab,
    page,
    isLoading,
  };
};
