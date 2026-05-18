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

export type CompanyBrand = {
  name: string;
  legalName: string;
  branchName: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
};

export type CurrentUser = {
  name: string;
  email: string;
  roleName: string;
  roleSlug: string;
  permissions: string[];
};

export type LiveData = {
  cashMovements: CashMovement[];
  clients: Client[];
  company: CompanyBrand;
  currentUser: CurrentUser;
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
  company: {
    name: "Transporte Nexo",
    legalName: "Transporte Nexo SRL",
    branchName: "Parana",
    primaryColor: "#0f172a",
    accentColor: "#2563eb",
    backgroundColor: "#f1f5f9",
  },
  currentUser: {
    name: "Ignacio",
    email: "ignacio@nexo.local",
    roleName: "Administrador",
    roleSlug: "administrador",
    permissions: ["*"],
  },
  documents,
  drivers,
  incidents,
  maintenanceJobs,
  orders,
  trips,
  units,
};
