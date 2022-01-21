export type UserId = `U${string}`;
export type TeamId = `U${string}&${number}`;
export type ChannelId = `C${string}`;
export type Nullable<T> = T | null;
export type DropdownOptions<T> = {
  label: string;
  value: T;
};
