import { User, UserMap } from "../models/User";
import { Team, TeamMap, TeamSettings } from "../models/Team";
import {
  UserId,
  TeamId,
  ChannelId,
  Nullable,
  DropdownOptions,
} from "../models/Common";

export interface TransformedResults {
  users: UserMap;
  teams: TeamMap;
}

export function populateChannelOptions(
  json: any
): Array<DropdownOptions<ChannelId>> {
  const channelsOptions: Array<DropdownOptions<ChannelId>> = [];

  for (const channel in json) {
    const newChannel = json[channel];
    const channelId: ChannelId = channel as ChannelId;
    const { name } = newChannel;
    channelsOptions.push({ label: name, value: channelId });
  }

  return channelsOptions;
}

export function transformTeams(json: any): TransformedResults {
  const result: TransformedResults = {
    users: {},
    teams: {},
  };

  // teams.json is one object, not an array!
  for (const user in json) {
    const userId: UserId = user as UserId;
    const userObject = json[user];
    const {
      realName,
      manager: memberTeams,
      s_manager: privilegedManagers,
      teams: managerLedTeams,
    } = userObject;
    const managedTeams: Array<TeamId> = [];

    // 'teams' property of a user is an object, not an array!
    for (const team in managerLedTeams) {
      const teamNumber: number = +team;
      const teamId: TeamId = `${userId}&${teamNumber}`;

      // const teamId: TeamId = team as TeamId;
      // const teamNumber: number = teamId.split('&')[1];

      // Team does not exist yet, add it now
      if (result.teams[teamId] === undefined) {
        const teamObject = managerLedTeams[team];
        const {
          name,
          directs: members,
          s_manager: secondaryManagers,
          settings,
        } = teamObject;

        const {
          channel_id: channelId,
          consolidatedTeams,
          consolidatedPrimaryTeam: primaryTeam,
        } = settings;

        const teamSettings: TeamSettings = {
          channelId: channelId,
          consolidatedTeams,
          primaryTeam,
        };

        const transformedTeam: Team = {
          id: teamId,
          name,
          manager: userId,
          secondaryManagers,
          members,
          teamSettings,
        };

        result.teams[teamId] = transformedTeam;
      }

      managedTeams.push(teamId);
    }

    const transformedUser: User = {
      id: userId,
      realName,
      memberTeams,
      managedTeams,
      privilegedManagers,
    };
    result.users[userId] = transformedUser;
  }

  return result;
}

export function transformTeamsJson(jsonString: string): TransformedResults {
  const parsedJson = JSON.parse(jsonString);

  return transformTeams(parsedJson);
}

export function isRootTeam(teamId: TeamId, teams: TeamMap): boolean {
  const team: Team = teams[teamId];
  const { teamSettings: settings } = team;

  if (
    settings.primaryTeam === teamId ||
    (settings.primaryTeam === undefined && settings.channelId != undefined)
  ) {
    return true;
  }
  return false;
}

export function getTeamsByChannelId(
  channelId: ChannelId,
  teams: TeamMap
): Array<Team> {
  const includedTeams: Set<Team> = new Set<Team>();

  for (const id in teams) {
    const teamId: TeamId = id as TeamId;
    const team: Team = teams[teamId];
    const { teamSettings: settings } = team;

    // easy path, team already has channel ID
    if (settings.channelId != undefined && settings.channelId === channelId) {
      includedTeams.add(team);
    }

    // figure out channel's root (consolidated) channel
    const consolidatedTeam: Nullable<Team> = getRootTeamByTeamId(teamId, teams);
    if (consolidatedTeam != undefined) {
      const { teamSettings: consolidatedSettings } = consolidatedTeam;
      if (consolidatedSettings.channelId == channelId) {
        // add the root team
        includedTeams.add(team);
      }
    }
  }

  return new Array<Team>(...includedTeams);
}

// function getUsersByChannel(channelId: ChannelId, data: TransformedResults): [User] {
//     return getUsersByChannel(channelId, data.users, data.teams);
// }
export function getUsersByChannelId(
  channelId: ChannelId,
  users: UserMap,
  teams: TeamMap
): Array<User> {
  const allUsers: Set<User> = new Set<User>();
  const includedUsers: UserMap = {};
  const includedTeams: Array<Team> = getTeamsByChannelId(channelId, teams);
  includedTeams.forEach((team) => {
    const { members } = team;
    members.forEach((userId) => {
      if (includedUsers[userId] === undefined) {
        includedUsers[userId] = users[userId];
      }
    });
  });

  for (const id in includedUsers) {
    const userId: UserId = id as UserId;
    allUsers.add(includedUsers[userId]);
  }

  return new Array<User>(...allUsers);
}

/* by Team Id */

export function getRootTeamByTeamId(
  teamId: TeamId,
  teams: TeamMap
): Nullable<Team> {
  if (teams[teamId] !== null) {
    const team: Team = teams[teamId];
    const { teamSettings: settings } = team;

    if (settings.primaryTeam === teamId) {
      return team;
    }
    if (settings.primaryTeam === undefined) {
      if (settings.channelId != undefined) {
        return team;
      }
      return null; // error scenario, consider throwing exception
    } else {
      return getRootTeamByTeamId(settings.primaryTeam, teams);
    }
  }

  return null;
}

// get all child teams, DFS
export function getConsolidatedTeamIdsByTeamId(
  teamId: TeamId,
  teams: TeamMap
): Set<TeamId> {
  const allTeams: Set<TeamId> = new Set<TeamId>();

  if (teams[teamId] != undefined) {
    const team: Team = teams[teamId];
    const { teamSettings: settings } = team;

    if (settings.consolidatedTeams != undefined) {
      settings.consolidatedTeams.forEach((child) => {
        allTeams.add(child);

        const childTeams = getConsolidatedTeamIdsByTeamId(child, teams);
        childTeams.forEach((child) => allTeams.add(child));
      });
    }
  }

  return allTeams;
}

export function getChildTeamIdsByTeamId(
  teamId: TeamId,
  teams: TeamMap
): Set<TeamId> {
  let childTeams: Set<TeamId> = new Set<TeamId>();

  if (teams[teamId] != undefined) {
    const team: Team = teams[teamId];
    const { teamSettings: settings } = team;

    if (settings.consolidatedTeams != undefined) {
      childTeams = new Set<TeamId>(settings.consolidatedTeams);
    }
  }

  return childTeams;
}

// get parent teams
export function getParentTeamIdsByTeamId(teamId: TeamId, teams: TeamMap) {
  const allTeams: Set<TeamId> = new Set<TeamId>();

  if (teams[teamId] != undefined) {
    const team: Team = teams[teamId];
    const { teamSettings: settings } = team;

    if (settings.primaryTeam != undefined && settings.primaryTeam !== teamId) {
      const parentId: TeamId = settings.primaryTeam;
      allTeams.add(parentId);

      const parentTeams = getParentTeamIdsByTeamId(parentId, teams);
      for (const parent of parentTeams) {
        allTeams.add(parent);
      }
    }
  }

  return allTeams;
}

export function getUsersByTeamId(
  teamId: TeamId,
  teams: TeamMap,
  users: UserMap
): Set<User> {
  const allUsers: Array<User> = [];

  const team: Team = teams[teamId];
  team.members.forEach((id) => {
    const userId: UserId = id as UserId;
    const user: User = users[userId];
    allUsers.push(user);
  });

  return new Set(allUsers);
}

export function getUsersByTeamIds(
  teamIds: Array<TeamId>,
  teams: TeamMap,
  users: UserMap
): Set<User> {
  const allUsers: Array<User> = [];

  teamIds.forEach((teamId) => {
    const teamUsers: Set<User> = getUsersByTeamId(teamId, teams, users);
    allUsers.push(...Array.from(teamUsers));
  });

  return new Set(allUsers);
}

/* by User Id */
export function getSecondaryTeamsByUserId(
  userId: UserId,
  users: UserMap
): Set<TeamId> {
  const allTeams: Array<TeamId> = [];
  const manager: User = users[userId];
  if (manager != undefined) {
    allTeams.push(...manager.privilegedManagers);
  }

  return new Set<TeamId>(allTeams);
}

export function getDirectTeamsByUserId(
  userId: UserId,
  users: UserMap
): Set<TeamId> {
  const allTeams: Set<TeamId> = new Set<TeamId>();
  const manager: User = users[userId];
  if (manager != undefined) {
    for (const team of manager.managedTeams) {
      allTeams.add(team);
    }
  }

  return allTeams;
}

export function getDirectMembersForUserId(
  userId: UserId,
  users: UserMap,
  teams: TeamMap
): Set<UserId> {
  const allUsers: Set<UserId> = new Set<UserId>();
  const manager: User = users[userId];
  if (manager != undefined) {
    for (const teamId of manager.managedTeams) {
      const team: Team = teams[teamId];
      for (const managedUser of team.members) {
        allUsers.add(managedUser);
      }
    }
  }

  return allUsers;
}

export function getPrivilegedUsersForManager(
  managerId: UserId,
  users: UserMap,
  teams: TeamMap
): Array<UserId> {
  const visibleUserIds: Array<UserId> = [];
  const visibleTeamIds: Array<TeamId> = [
    ...getSecondaryTeamsByUserId(managerId, users),
  ];
  const consolidatedTeams: Set<TeamId> = new Set<TeamId>();
  for (const teamId of visibleTeamIds) {
    getParentTeamIdsByTeamId(teamId, teams).forEach((team) => {
      consolidatedTeams.add(team);
    });
  }

  const visibleUsers = getUsersByTeamIds([...consolidatedTeams], teams, users);
  for (const user of visibleUsers) {
    visibleUserIds.push(user.id);
  }

  return visibleUserIds;
}

export function getSecondaryUsersForManager(
  managerId: UserId,
  users: UserMap,
  teams: TeamMap
): Array<UserId> {
  const secondaryUserIds: Set<UserId> = new Set<UserId>();
  const teamIds: Array<TeamId> = [
    ...getSecondaryTeamsByUserId(managerId, users),
  ];
  for (const id of teamIds) {
    getUsersByTeamId(id, teams, users).forEach((user) =>
      secondaryUserIds.add(user.id)
    );
  }

  return [...secondaryUserIds];
}
