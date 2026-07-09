import { ContactsBlock, HeroBlock, PartnershipBlock, SubProjectsBlock, SupportTypesBlock } from './sections';
import { ProjectBlock } from './types';

type Props = {
  blocks?: ProjectBlock[] | null;
  locale: string;
};

export const BlockRenderer = ({ blocks, locale }: Props) => {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map(block => {
        switch (block.__component) {
          case 'project-sections.hero':
            return <HeroBlock key={`${block.__component}-${block.id}`} {...block} />;
          case 'project-sections.support-types':
            return <SupportTypesBlock key={`${block.__component}-${block.id}`} {...block} />;
          case 'project-sections.sub-projects':
            return <SubProjectsBlock key={`${block.__component}-${block.id}`} {...block} />;
          case 'project-sections.partnership':
            return <PartnershipBlock key={`${block.__component}-${block.id}`} {...block} />;
          case 'project-sections.contacts':
            return <ContactsBlock key={`${block.__component}-${block.id}`} {...block} locale={locale} />;
          default: {
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.warn('[BlockRenderer] Unknown block component:', (block as { __component: string }).__component);
            }
            return null;
          }
        }
      })}
    </>
  );
};
