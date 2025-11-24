import { useState } from "react";
import { squadsData as initialSquadsData, Squad, Client } from "@/data/clientsData";

export const useClientsData = () => {
  const [squadsData, setSquadsData] = useState<Squad[]>(initialSquadsData);

  const updateClient = (squadId: string, clientIndex: number, updatedClient: Client) => {
    setSquadsData(prevSquads => 
      prevSquads.map(squad => {
        if (squad.id === squadId) {
          const updatedClients = [...squad.clients];
          updatedClients[clientIndex] = updatedClient;
          return { ...squad, clients: updatedClients };
        }
        return squad;
      })
    );
  };

  const addClient = (squadId: string, newClient: Client) => {
    setSquadsData(prevSquads => 
      prevSquads.map(squad => {
        if (squad.id === squadId) {
          return { ...squad, clients: [...squad.clients, newClient] };
        }
        return squad;
      })
    );
  };

  const deleteClient = (squadId: string, clientIndex: number) => {
    setSquadsData(prevSquads => 
      prevSquads.map(squad => {
        if (squad.id === squadId) {
          const updatedClients = squad.clients.filter((_, idx) => idx !== clientIndex);
          return { ...squad, clients: updatedClients };
        }
        return squad;
      })
    );
  };

  return {
    squadsData,
    updateClient,
    addClient,
    deleteClient,
  };
};
