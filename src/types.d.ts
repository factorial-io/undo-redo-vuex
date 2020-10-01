declare interface UndoRedoOptions {
  namespace?: string;
  ignoreMutations?: Array<string>;
  paths?: Array<UndoRedoOptions>;
  newMutation?: boolean;
  done?: Array<Mutation> | [];
  undone?: Array<Mutation> | [];
  exposeUndoRedoConfig?: boolean;
}

declare interface Mutation {
  type: string;
  payload: any;
}

declare interface Action {
  type: string;
  payload: any;
}
