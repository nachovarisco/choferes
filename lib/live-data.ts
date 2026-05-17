import type {
  CashMovement,
  Client,
  DocumentRecord,
  Driver,
  Incident,
  MaintenanceJob,
  Order,
  Trip,
  Unit,
} from "./data";
import {
  cashMovements,
  clients,
  documents,
  drivers,
  incidents,
  maintenanceJobs,
  orders,
  trips,
  units,
} from "./data";

export type LiveData = {
  cashMovements: CashMovement[];
  clients: Client[];
  documents: DocumentRecord[];
  drivers: Driver[];
  incidents: Incident[];
  maintenanceJobs: MaintenanceJob[];
  orders: Order[];
  trips: Trip[];
  units: Unit[];
};

export const fallbackLiveData: LiveData = {
  cashMovements,
  clients,
  documents,
  drivers,
  incidents,
  maintenanceJobs,
  orders,
  trips,
  units,
};
