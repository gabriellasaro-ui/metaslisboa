export type ProgressStatus = 0 | 25 | 50 | 75 | 100;

export interface CheckIn {
  id: string;
  clientName: string;
  squadId: string;
  date: Date;
  progress: ProgressStatus;
  status: "on_track" | "at_risk" | "delayed" | "completed";
  comment: string;
  updatedBy: string;
}

export interface GoalProgress {
  clientName: string;
  squadId: string;
  currentProgress: ProgressStatus;
  timeline: {
    progress: ProgressStatus;
    date: Date;
    comment: string;
    updatedBy: string;
  }[];
  lastUpdate: Date;
}
