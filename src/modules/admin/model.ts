import { BaseModuleState, buildActionByEffect, buildActionByReducer, buildLoading, buildModel } from "react-coat";
import { call, put } from "redux-saga/effects";
import * as messageService from "./api/message";
import thisModule from "./index";
import RootState from "core/RootState";
import * as actionNames from "./actionNames";

// 定义本模块的State
interface State extends BaseModuleState {
  messageList: string[];
}
// 定义本模块State的初始值
const state: State = {
  messageList: [],
  loading: {
    global: "Stop"
  }
};
// 定义本模块的Action
class ModuleActions {
  [actionNames.UPDATE_MESSAGE_LIST] = buildActionByReducer(function(messageList: string[], moduleState: State, rootState: RootState): State {
    return { ...moduleState, messageList };
  });
}
// 定义本模块的监听
class ModuleHandlers {
  @buildLoading()
  [actionNames.INIT] = buildActionByEffect(function*({ pathname }: { pathname: string }, moduleState: State, rootState: RootState) {
    const messageList: messageService.GetMessageListResponse = yield call(messageService.api.getMessageList);
    yield put(thisModule.actions.admin_updateMessageList(messageList.list));
  });
}

const model = buildModel(state, ModuleActions, ModuleHandlers);

export default model;

type Actions = typeof model.actions;

export { Actions, State };
