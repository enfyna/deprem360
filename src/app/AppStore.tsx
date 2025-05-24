import { createContext } from "react";
import { makeAutoObservable, observable, runInAction } from "mobx";
import api from "@/lib/axios"; // Adjust the import path as necessary

 class LocationStore {
  locations = [];
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
        this.locations = data;
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

