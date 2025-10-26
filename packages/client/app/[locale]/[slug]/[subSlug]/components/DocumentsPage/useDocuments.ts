import { useEffect, useState } from 'react';
import { fetchAPI } from '@/app/utils/fetch-api';
import { getStrapiMedia } from '@/app/utils/api-helpers';

interface  DocumentsFile {
  data: {
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
    }
  }
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

export interface ParsedDocs {
  id: number;
  name: string;
  url: string;
}

export const useDocuments = () => {
  const [documentsList, setDocumentsList] =  useState<ParsedDocs[]>([]);

  const parseDocuments = (documentsRes: DocumentsResponse[]): ParsedDocs[] => {
    return documentsRes.map((doc: DocumentsResponse) => ({
      id: doc.id,
      name: doc.attributes.name,
      url: getStrapiMedia(doc.attributes.file.data.attributes.url ?? '')
    }))
  }

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await fetchAPI({
          path: '/documents',
          urlParams: { populate: '*' },
        });

        setDocumentsList(parseDocuments(data));
      } catch (error) {
        console.error(error);
      }
    };

    void fetchReports();
  }, []);


  const openInNewTab = (link: string) => () => {
    window.open(link, '_blank');
  };


  return { documentsList, openInNewTab };
}
