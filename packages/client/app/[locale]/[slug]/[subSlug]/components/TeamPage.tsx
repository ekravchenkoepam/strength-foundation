import { PageProps } from '../../types';
import React, { useEffect, useState } from 'react';
import { fetchAPI } from '@/app/utils/fetch-api';
import { Loading } from '@/app/components/shared';

export const TeamPage = ({ locale, slug, subSlug }: PageProps) => {
  const [teamPage, setTeamPage] = useState<any>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamPage = async () => {
      try {
        setLoading(true)
        const data = await fetchAPI({
          path: '/team-page',
          urlParams: { populate: 'members.socials,images' }
        })
        setTeamPage(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    void fetchTeamPage()
  }, [])

  if (loading) return <Loading headerText="Наша команда" />

  console.log({ teamPage });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '50vh' }}>
      <h1>{teamPage?.attributes?.title}</h1>
      <p>Locale: <strong>{locale}</strong></p>
      <p>Slug: <strong>{slug}</strong></p>
      <p>SubSlug: <strong>{subSlug}</strong></p>
    </div>
  );
}
