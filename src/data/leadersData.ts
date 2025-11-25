export interface Leader {
  id: string;
  name: string;
  role: string;
  avatar: string;
  squads: string[];
  email?: string;
  joinedDate: Date;
}

export const leadersData: Leader[] = [
  {
    id: "gabriel",
    name: "Gabriel",
    role: "Squad Leader",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel&backgroundColor=b6e3f4",
    squads: ["INTERNACIONAL", "MIDAS", "TIGERS"],
    email: "gabriel@empresa.com",
    joinedDate: new Date(2024, 0, 1), // Janeiro 2024
  },
  {
    id: "otavio",
    name: "Otavio",
    role: "Squad Leader",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Otavio&backgroundColor=c0aede",
    squads: ["SHARK", "STRIKE FORCE"],
    email: "otavio@empresa.com",
    joinedDate: new Date(2024, 0, 1), // Janeiro 2024
  },
];

export const getLeaderById = (id: string) => {
  return leadersData.find(leader => leader.id === id);
};

export const getLeaderBySquad = (squadName: string) => {
  return leadersData.find(leader => 
    leader.squads.includes(squadName.toUpperCase())
  );
};
