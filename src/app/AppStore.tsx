import { createContext } from "react";
import { makeAutoObservable, observable, runInAction } from "mobx";
import api from "@/lib/axios"; // Adjust the import path as necessary

// Define the structure of a district
interface District {
  name: string;
  // Add other district properties if any
}

// Define the structure of a location object
export interface Location {
  name: string;
  districts: District[];
  geometry?: any; // Or a more specific GeoJSON geometry type
  // Add other location properties if any, e.g., id, code, etc.
}

 class LocationStore {
  locations: Location[] = []; // Use the Location interface here
  loading = true;

  constructor() {
    makeAutoObservable(this);
  }
   
  async fetchLocations() {
    try {
      const response = await api.get("/locations");
      if (response.status != 200) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      console.log('Fetched',response);

      runInAction(() => {
        this.locations = data as Location[]; // Assert data as Location[]
        this.loading = false;
      });
 

    } catch (error) {
        runInAction(() => {
            this.loading = false;
        });
      console.error("Failed to fetch locations:", error);
    }
  }

}

export const locationStore = new LocationStore();

