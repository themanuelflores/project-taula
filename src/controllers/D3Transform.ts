import { UserMap } from "../models/User";
import { D3User, D3Team } from "../models/D3";
import { TeamId, UserId } from "../models/Common";
import { TeamMap } from "../models/Team";

export function getD3UserWithTeamAsParent(
  userId: UserId,
  users: UserMap,
  teamId: TeamId
): D3User {
  const user: D3User = {
    ...users[userId],
    parentNodeId: teamId,
  };
  return user;
}

export function getD3UserWithManagerAsParent(
  userId: UserId,
  users: UserMap,
  managerId: UserId
): D3User {
  const user: D3User = {
    ...users[userId],
    parentNodeId: managerId,
  };
  return user;
}

export function getD3TeamWithManagerAsParent(
  teamId: TeamId,
  teams: TeamMap,
  managerId: UserId
): D3Team {
  const team: D3Team = {
    ...teams[teamId],
    parentNodeId: managerId,
  };
  return team;
}

export function getD3TeamWithConsolidatedPrimaryTeam(
  teamId: TeamId,
  teams: TeamMap,
  consolidatedTeamId: TeamId
): D3Team {
  const team: D3Team = {
    ...teams[teamId],
    parentNodeId: consolidatedTeamId,
  };
  return team;
}
