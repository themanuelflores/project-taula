import { ChannelId, TeamId, UserId } from "./Common";

export type TeamSettings = {
  channelId: ChannelId | undefined;
  primaryTeam: TeamId | undefined; // the primary team into which this team consolidates, OR this team ID to indicate this is root team
  consolidatedTeams: Array<TeamId>; // teams that consolidate into this team
};

export type Team = {
  id: TeamId;
  name: string;
  manager: UserId; // the manager of this team
  secondaryManagers: Array<UserId>; // other managers who have the same view privileges as this manager
  members: Array<UserId>; // the users who are members of this team
  teamSettings: TeamSettings;
};

export interface TeamMap {
  [teamId: TeamId]: Team;
}
