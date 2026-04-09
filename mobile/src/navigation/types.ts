import type { PRItem } from '../../../shared/types.js';

export type DashboardStackParamList = {
  PRList: undefined;
  PRDetail: { item: PRItem };
};

export type RootTabParamList = {
  Dashboard: undefined;
  Settings: undefined;
};
