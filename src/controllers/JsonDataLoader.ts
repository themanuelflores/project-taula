import { getLocalChannelsData, getLocalTeamsData } from "./LocalJsonDataLoader";

export function getTeamsData() {
  if (process.env.isLocalDev) {
    return getLocalTeamsData();
  }

  return {};
}

export function getChannelsData() {
  if (process.env.isLocalDev) {
    return getLocalChannelsData();
  }

  return {};
}
