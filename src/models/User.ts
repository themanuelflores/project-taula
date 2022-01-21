import { UserId, TeamId } from "./Common";

export type User = {
  id: UserId;
  realName: string;
  memberTeams: Array<TeamId>; // teams of which this user is a member
  managedTeams: Array<TeamId>; // teams that this user manages
  privilegedManagers: Array<TeamId>;
};

export interface UserMap {
  [userId: UserId]: User;
}
