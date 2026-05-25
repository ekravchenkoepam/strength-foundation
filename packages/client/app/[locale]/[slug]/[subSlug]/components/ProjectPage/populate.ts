export const projectBlocksPopulate = {
  blocks: {
    on: {
      'project-sections.hero': {
        populate: { image: '*' },
      },
      'project-sections.support-types': {
        populate: {
          items: { populate: { icon: '*' } },
        },
      },
      'project-sections.sub-projects': {
        populate: {
          projects: { populate: { image: '*' } },
        },
      },
      'project-sections.partnership': {
        populate: {
          items: '*',
        },
      },
      'project-sections.contacts': {
        populate: {
          channels: '*',
          qrImage: '*',
        },
      },
    },
  },
} as const;
