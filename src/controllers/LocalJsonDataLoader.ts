import { default as teams } from "../teams.json";
import { default as channels } from "../channels.json";

export function getLocalTeamsData() {
  return teams;
}

export function getLocalChannelsData() {
  return channels;
}
