export interface Team {
  id: string;
  name: string;
  short: string;
  color: string;
  secondary: string;
  logoGradient: string;
  venue: string;
}

export const TEAMS: Team[] = [
  { id: 't1', name: 'Engineering Eagles', short: 'ENG', color: '#CCFF00', secondary: '#0A0A0A', logoGradient: 'from-[#CCFF00] to-[#88CC00]', venue: 'North Field' },
  { id: 't2', name: 'Business Bulls', short: 'BIZ', color: '#FF4D5A', secondary: '#1A0A0A', logoGradient: 'from-[#FF4D5A] to-[#FF8A5A]', venue: 'Arena B' },
  { id: 't3', name: 'Law Lions', short: 'LAW', color: '#7C3AED', secondary: '#0F0A1A', logoGradient: 'from-[#7C3AED] to-[#A78BFA]', venue: 'Court Yard' },
  { id: 't4', name: 'CS Codebreakers', short: 'CSE', color: '#00E5FF', secondary: '#0A1A1A', logoGradient: 'from-[#00E5FF] to-[#00B8FF]', venue: 'Tech Pitch' },
  { id: 't5', name: 'Med Mavericks', short: 'MED', color: '#FFB800', secondary: '#1A150A', logoGradient: 'from-[#FFB800] to-[#FF6B00]', venue: 'Stadium East' },
  { id: 't6', name: 'Arts Arrows', short: 'ART', color: '#FF6BFF', secondary: '#1A0A1A', logoGradient: 'from-[#FF6BFF] to-[#B46BFF]', venue: 'Studio Park' },
  { id: 't7', name: 'Science Spartans', short: 'SCI', color: '#00FF88', secondary: '#0A1A0F', logoGradient: 'from-[#00FF88] to-[#00CC88]', venue: 'Lab Turf' },
  { id: 't8', name: 'Arch Titans', short: 'ARC', color: '#FFFFFF', secondary: '#E5E5E5', logoGradient: 'from-[#FFFFFF] to-[#A0A0A0]', venue: 'Plaza Field' },
];

export const VENUES = ['Main Stadium', 'North Field', 'East Arena', 'Central Park', 'Tech Pitch', 'Studio Park', 'Plaza Field'];

export const getTeam = (id: string | null | undefined) => TEAMS.find(t => t.id === id);
