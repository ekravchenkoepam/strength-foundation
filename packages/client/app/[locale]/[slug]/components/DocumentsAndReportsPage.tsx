type PageProps = {
  locale: string;
  slug: string;
}

export const DocumentsAndReportsPage = ({ locale, slug }: PageProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h1>Documents and Reports Page</h1>
      <p>Locale: <strong>{locale}</strong></p>
      <p>Slug: <strong>{slug}</strong></p>
    </div>
  );
}
