const asList = (value) => (Array.isArray(value) ? value : []);

const toExperienceEntry = (item = {}, index = 0) => ({
  id: item.id ? `volunteer-${item.id}` : `volunteer-${index + 1}`,
  role: item.role || item.name || 'Volunteer',
  company: item.org || item.organization || '',
  date: item.date || '',
  desc: item.desc || item.description || '',
  experienceType: 'volunteering',
});

export const mergeVolunteeringIntoExperience = (resumeData = {}) => {
  const volunteering = asList(resumeData?.volunteering).filter(Boolean);
  if (!volunteering.length) {
    return {
      ...resumeData,
      experience: asList(resumeData?.experience),
      volunteering: [],
    };
  }

  return {
    ...resumeData,
    experience: [
      ...asList(resumeData?.experience),
      ...volunteering.map(toExperienceEntry),
    ],
    volunteering: [],
  };
};

export default mergeVolunteeringIntoExperience;
