import thisModule from "modules/admin";
import { BaseActions, BaseState, buildActionByEffect, buildActionByReducer, buildLoading, buildModel } from "react-coat";
import { call, put } from "redux-saga/effects";
import * as todoService from "./api/todo";

interface State extends BaseState {
  todos: string[];
}

const state: State = {
  todos: [],
  loading: {
    global: "Stop"
  }
};

class ModuleActions extends BaseActions<State> {
  updateTodos = buildActionByReducer(function(todos: string[], moduleState: State, rootState: any): State {
    return { ...moduleState, todos };
  });
}

class ModuleHandlers {
  @buildLoading()
  "app/INIT" = buildActionByEffect(function*(data: State, moduleState: State, rootState: any): any {
    const todos: todoService.GetTodosResponse = yield call(todoService.getTodos);
    yield put(thisModule.actions.updateTodos(todos.list));
  });
}

const model = buildModel(state, ModuleActions, ModuleHandlers);

export default model;

type Actions = typeof model.actions;

export { Actions, State };
