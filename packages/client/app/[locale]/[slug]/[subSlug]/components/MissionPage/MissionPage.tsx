import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { fetchAPI } from '@/app/utils/fetch-api'
import { Loading } from '@/app/components/shared'
import { getStrapiMedia } from '@/app/utils/api-helpers'

import styles from './MissionPage.module.scss'

export const MissionPage = () => {
  const [missionPage, setMissionPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMissionPage = async () => {
      try {
        setLoading(true)
        const data = await fetchAPI({
          path: '/mission-page',
          urlParams: { populate: 'missionBlock.image,principles' }
        })
        console.log({ data })
        setMissionPage(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    void fetchMissionPage()
  }, [])

  if (loading) return <Loading headerText="Звіти" />

  if (!missionPage) return null

  console.log({ missionPage })

  return (
    <div className={styles.missionPage}>
      <div className={clsx('h1', styles.pageTitle)}>{missionPage.attributes.title}</div>

      <div className={styles.missionBlock}>
        {missionPage.attributes.missionBlock.map((block: any, index: number) => {
          const isEven = index % 2 !== 0

          return (
            <div
              key={block.id}
              className={clsx(styles.missionSection, {
                [styles.reversed]: isEven
              })}
            >
              <div className={styles.missionImage}>
                {block?.image?.data && (
                  <img
                    src={getStrapiMedia(block.image.data.attributes.url)}
                    alt={block.image.data.attributes.name}
                  />
                )}
              </div>

              <div className={styles.missionContent}>
                <h2>{block.title}</h2>
                <div
                  className={styles.missionText}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.principlesBlock}>
        <div className={styles.principlesTitle}>{missionPage.attributes.principlesTitle}</div>
        <div className={styles.principlesList}>
          {missionPage.attributes.principles.map((principle: any) => (
            <div key={principle.id} className={styles.principleItem}>
              <div className={styles.principleIcon}>
                <img
                  src={`/images/icons/${principle.icon}.svg`}
                  alt={principle.title}
                />
              </div>
              <h3>{principle.title}</h3>
              <div
                className={styles.principleContent}
                dangerouslySetInnerHTML={{ __html: principle.content }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
