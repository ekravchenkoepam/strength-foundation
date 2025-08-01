// 'use client';
//
// import { Breadcrumbs } from '@/app/components/shared';
// import { useApp } from '@/app/context/AppContext';
// import { useEffect, useState } from 'react';
// import { fetchAPI } from '@/app/utils/fetch-api';
//
// export default function HomePage({ params }) {
//   const { locale } = useApp();
//   const { slug, subSlug } = params;
//   const [navigation, setNavigation] = useState<any[]>([]);
//   const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
//
//   useEffect(() => {
//     async function fetchNavigation() {
//       if (!locale) return;
//
//       const { data }: any = await fetchAPI({ path: '/navigations' });
//
//       setNavigation(data);
//
//       // Find the main link
//       const mainLink = data.find(
//         (item) => item.attributes.href === slug
//       );
//
//       if (!mainLink) {
//         setBreadcrumbs([]);
//         return;
//       }
//
//       const crumbs = [
//         {
//           label: mainLink.attributes.title,
//           href: `/${mainLink.attributes.href}`,
//         },
//       ];
//
//       if (subSlug) {
//         const subLink = mainLink.attributes.sublinks.find(
//           (sublink) => sublink.href === subSlug
//         );
//
//         if (subLink) {
//           crumbs.push({
//             label: subLink.title,
//             href: `/${mainLink.attributes.href}/${subLink.href}`,
//           });
//         }
//       }
//
//       setBreadcrumbs(crumbs);
//     }
//
//     void fetchNavigation();
//   }, [locale, slug, subSlug]);
//
//   return (
//     <div
//       style={{
//         height: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         flexDirection: 'column',
//       }}
//     >
//       <Breadcrumbs breadcrumbs={breadcrumbs} />
//
//       <h1>{slug}/{subSlug}</h1>
//     </div>
//   );
// }
// app/[locale]/[slug]/[subSlug]/page.tsx
"use client";

import { useParams } from "next/navigation";

export default function SubPage() {
  const params = useParams();

  return (
    <div style={{ padding: 20, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h1>Static Subpage</h1>
        <p>Locale: <strong>{params.locale}</strong></p>
        <p>Slug: <strong>{params.slug}</strong></p>
        <p>SubSlug: <strong>{params.subSlug}</strong></p>
      </div>
    </div>
  );
}
