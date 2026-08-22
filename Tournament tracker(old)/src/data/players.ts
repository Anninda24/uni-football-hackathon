export interface PlayerStat {
  id: string;
  name: string;
  teamId: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  jersey: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellow: number;
  red: number;
  image: string;
  rating: number;
}

export const PLAYERS: PlayerStat[] = [
  // Engineering Eagles (t1)
  { id: 'p1', name: 'Rahman Sheikh', teamId: 't1', position: 'FWD', jersey: 9,  goals: 12, assists: 4,  cleanSheets: 0, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=11', rating: 94 },
  { id: 'p2', name: 'Rafiul Islam',   teamId: 't1', position: 'DEF', jersey: 4,  goals: 1,  assists: 2,  cleanSheets: 5, yellow: 3, red: 0, image: 'https://i.pravatar.cc/200?img=12', rating: 85 },
  { id: 'p3', name: 'Shahriar Nafis', teamId: 't1', position: 'FWD', jersey: 11, goals: 8,  assists: 3,  cleanSheets: 0, yellow: 1, red: 0, image: 'https://i.pravatar.cc/200?img=13', rating: 88 },
  { id: 'p4', name: 'Asif Iqbal',     teamId: 't1', position: 'GK',  jersey: 1,  goals: 0,  assists: 0,  cleanSheets: 6, yellow: 0, red: 0, image: 'https://i.pravatar.cc/200?img=14', rating: 83 },
  { id: 'p5', name: 'Tanvir Ahmed',   teamId: 't1', position: 'MID', jersey: 8,  goals: 3,  assists: 7,  cleanSheets: 0, yellow: 4, red: 0, image: 'https://i.pravatar.cc/200?img=15', rating: 86 },

  // Business Bulls (t2)
  { id: 'p6',  name: 'Omar Faruk',     teamId: 't2', position: 'FWD', jersey: 7,  goals: 9,  assists: 2,  cleanSheets: 0, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=16', rating: 84 },
  { id: 'p7',  name: 'Tausif Reza',    teamId: 't2', position: 'DEF', jersey: 5,  goals: 0,  assists: 1,  cleanSheets: 4, yellow: 5, red: 1, image: 'https://i.pravatar.cc/200?img=17', rating: 80 },
  { id: 'p8',  name: 'Mamun Rashid',   teamId: 't2', position: 'MID', jersey: 10, goals: 4,  assists: 6,  cleanSheets: 0, yellow: 3, red: 0, image: 'https://i.pravatar.cc/200?img=18', rating: 87 },
  { id: 'p9',  name: 'Fardin Khan',    teamId: 't2', position: 'MID', jersey: 6,  goals: 2,  assists: 9,  cleanSheets: 0, yellow: 1, red: 0, image: 'https://i.pravatar.cc/200?img=19', rating: 81 },
  { id: 'p10', name: 'Khaled Mahmud',  teamId: 't2', position: 'GK',  jersey: 1,  goals: 0,  assists: 0,  cleanSheets: 3, yellow: 0, red: 0, image: 'https://i.pravatar.cc/200?img=20', rating: 78 },

  // Law Lions (t3)
  { id: 'p11', name: 'Ayman Sadiq',    teamId: 't3', position: 'MID', jersey: 10, goals: 6,  assists: 8,  cleanSheets: 0, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=21', rating: 91 },
  { id: 'p12', name: 'Junaid Khan',    teamId: 't3', position: 'DEF', jersey: 3,  goals: 1,  assists: 1,  cleanSheets: 7, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=22', rating: 82 },
  { id: 'p13', name: 'Raihan Uddin',   teamId: 't3', position: 'DEF', jersey: 4,  goals: 0,  assists: 0,  cleanSheets: 6, yellow: 4, red: 1, image: 'https://i.pravatar.cc/200?img=23', rating: 79 },
  { id: 'p14', name: 'Nahid Hasan',    teamId: 't3', position: 'FWD', jersey: 9,  goals: 5,  assists: 2,  cleanSheets: 0, yellow: 1, red: 0, image: 'https://i.pravatar.cc/200?img=24', rating: 83 },

  // CS Codebreakers (t4)
  { id: 'p15', name: 'Sakib Al Hasan', teamId: 't4', position: 'MID', jersey: 10, goals: 7,  assists: 11, cleanSheets: 0, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=25', rating: 93 },
  { id: 'p16', name: 'Ahmed Karim',    teamId: 't4', position: 'MID', jersey: 8,  goals: 5,  assists: 8,  cleanSheets: 0, yellow: 3, red: 0, image: 'https://i.pravatar.cc/200?img=26', rating: 92 },
  { id: 'p17', name: 'Adnan Sami',     teamId: 't4', position: 'DEF', jersey: 4,  goals: 0,  assists: 2,  cleanSheets: 5, yellow: 4, red: 0, image: 'https://i.pravatar.cc/200?img=27', rating: 85 },
  { id: 'p18', name: 'Siam Rahman',    teamId: 't4', position: 'DEF', jersey: 3,  goals: 0,  assists: 1,  cleanSheets: 4, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=28', rating: 80 },

  // Med Mavericks (t5)
  { id: 'p19', name: 'Nabil Chowdhury', teamId: 't5', position: 'MID', jersey: 6,  goals: 3,  assists: 4,  cleanSheets: 0, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=29', rating: 87 },
  { id: 'p20', name: 'Tahmid Alam',     teamId: 't5', position: 'GK',  jersey: 1,  goals: 0,  assists: 0,  cleanSheets: 5, yellow: 0, red: 0, image: 'https://i.pravatar.cc/200?img=30', rating: 81 },
  { id: 'p21', name: 'Sabbir Hossain',  teamId: 't5', position: 'FWD', jersey: 9,  goals: 6,  assists: 1,  cleanSheets: 0, yellow: 1, red: 0, image: 'https://i.pravatar.cc/200?img=31', rating: 82 },

  // Arts Arrows (t6)
  { id: 'p22', name: 'Rahim Uddin',    teamId: 't6', position: 'FWD', jersey: 7,  goals: 4,  assists: 1,  cleanSheets: 0, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=32', rating: 74 },
  { id: 'p23', name: 'Emon Khan',      teamId: 't6', position: 'MID', jersey: 8,  goals: 1,  assists: 3,  cleanSheets: 0, yellow: 3, red: 0, image: 'https://i.pravatar.cc/200?img=33', rating: 77 },
  { id: 'p24', name: 'Zubair Alam',    teamId: 't6', position: 'FWD', jersey: 11, goals: 3,  assists: 0,  cleanSheets: 0, yellow: 1, red: 0, image: 'https://i.pravatar.cc/200?img=34', rating: 72 },

  // Science Spartans (t7)
  { id: 'p25', name: 'Imtiaz Hossain', teamId: 't7', position: 'FWD', jersey: 9,  goals: 5,  assists: 1,  cleanSheets: 0, yellow: 1, red: 0, image: 'https://i.pravatar.cc/200?img=35', rating: 81 },
  { id: 'p26', name: 'Fahim Faisal',   teamId: 't7', position: 'MID', jersey: 6,  goals: 2,  assists: 3,  cleanSheets: 0, yellow: 4, red: 0, image: 'https://i.pravatar.cc/200?img=36', rating: 77 },
  { id: 'p27', name: 'Mahfuzur Rahman', teamId: 't7', position: 'GK',  jersey: 1,  goals: 0,  assists: 0,  cleanSheets: 4, yellow: 0, red: 0, image: 'https://i.pravatar.cc/200?img=37', rating: 80 },

  // Arch Titans (t8)
  { id: 'p28', name: 'Hasan Mahmud',   teamId: 't8', position: 'DEF', jersey: 4,  goals: 0,  assists: 1,  cleanSheets: 5, yellow: 2, red: 0, image: 'https://i.pravatar.cc/200?img=38', rating: 76 },
  { id: 'p29', name: 'Rayhan Kabir',   teamId: 't8', position: 'MID', jersey: 8,  goals: 1,  assists: 2,  cleanSheets: 0, yellow: 3, red: 0, image: 'https://i.pravatar.cc/200?img=39', rating: 75 },
  { id: 'p30', name: 'Raihan Ahmed',   teamId: 't8', position: 'MID', jersey: 10, goals: 0,  assists: 4,  cleanSheets: 0, yellow: 1, red: 0, image: 'https://i.pravatar.cc/200?img=40', rating: 74 },
];

/**
 * Expand each team's roster to 17 players (11 Starting XI + 6 substitutes).
 * Generated deterministically from the existing player/team data — no hardcoded
 * duplicate records. All reference the same Team IDs / player shape.
 */
const EXTRA_FIRST = ['Abrar', 'Anik', 'Ashik', 'Biplob', 'Bappy', 'Chanchal', 'Dipu', 'Emon', 'Golam', 'Habib', 'Iqbal', 'Jamil', 'Kawsar', 'Liton', 'Mahin', 'Masud', 'Mithun', 'Munna', 'Nayeem', 'Nishat', 'Ovi', 'Polash', 'Rifat', 'Rony', 'Rasel', 'Sajid', 'Sohan', 'Tarek', 'Tuhin', 'Uzzal', 'Yeasin', 'Zahid', 'Ziaul', 'Shakil', 'Sohel', 'Rakib', 'Rafi', 'Nadim', 'Farid', 'Sabbir'];
const EXTRA_LAST = ['Islam', 'Ahmed', 'Khan', 'Hossain', 'Rahman', 'Chowdhury', 'Sarker', 'Das', 'Mia', 'Uddin', 'Haque', 'Alam', 'Akter', 'Bhuiyan', 'Talukder', 'Parvez', 'Jaman', 'Rana', 'Sikder', 'Mondol'];
const EXTRA_POS: PlayerStat['position'][] = ['GK', 'DEF', 'MID', 'FWD', 'DEF', 'MID', 'FWD', 'DEF', 'MID', 'FWD', 'DEF', 'MID', 'FWD', 'DEF', 'MID', 'FWD', 'MID'];

const TEAM_IDS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

const fillers: PlayerStat[] = [];
TEAM_IDS.forEach((teamId, teamIdx) => {
  const existing = PLAYERS.filter(p => p.teamId === teamId);
  const usedJerseys = new Set(existing.map(p => p.jersey));
  const need = 17 - existing.length;
  for (let i = 0; i < need; i++) {
    let jersey = 12 + i;
    while (usedJerseys.has(jersey)) jersey++;
    usedJerseys.add(jersey);
    const pos = EXTRA_POS[i % EXTRA_POS.length];
    const first = EXTRA_FIRST[(teamIdx * 7 + i * 5) % EXTRA_FIRST.length];
    const last = EXTRA_LAST[(teamIdx * 3 + i * 7) % EXTRA_LAST.length];
    fillers.push({
      id: `px${teamIdx + 1}-${i + 1}`,
      name: `${first} ${last}`,
      teamId,
      position: pos,
      jersey,
      goals: i % 4,
      assists: (i * 2) % 3,
      cleanSheets: pos === 'GK' ? (i % 3) : 0,
      yellow: i % 3,
      red: i % 7 === 0 ? 1 : 0,
      image: `https://i.pravatar.cc/200?img=${47 + ((teamIdx * 13 + i * 3) % 24)}`,
      rating: 60 + (i % 14),
    });
  }
});

export const ALL_PLAYERS: PlayerStat[] = [...PLAYERS, ...fillers];

export const getPlayersByTeam = (teamId: string) => ALL_PLAYERS.filter(p => p.teamId === teamId);

export const getPlayer = (id: string | null | undefined) => ALL_PLAYERS.find(p => p.id === id);
