import RootState from "core/RootState";
import { BaseModuleActions, BaseModuleHandlers, BaseModuleState, ERROR_ACTION_NAME, LoadingState, buildModel, effect } from "react-coat-pkg";
import * as sessionService from "./api/session";
import * as settingsService from "./api/settings";
import * as actionNames from "./exportActionNames";
import thisModule from "./index";

// 定义本模块的State
interface State extends BaseModuleState {
  projectConfig: {
    title: string;
  };
  curUser: {
    uid: string;
    username: string;
    hasLogin: boolean;
  };
  loginError: string;
  loading: {
    global: LoadingState;
    login: LoadingState;
  };
}
// 定义本模块State的初始值
const state: State = {
  projectConfig: {
    title: "",
  },
  curUser: {
    uid: "",
    username: "",
    hasLogin: false,
  },
  loginError: "",
  loading: {
    global: "Stop",
    login: "Stop",
  },
};
// 定义本模块的Action
class ModuleActions extends BaseModuleActions {
  updateSettings(settings: { title: string }, moduleState: State, rootState: RootState): State {
    return { ...moduleState, projectConfig: settings };
  }
  updateCurUser(curUser: { uid: string; username: string; hasLogin: boolean }, moduleState: State, rootState: RootState): State {
    this.puta();
    return { ...moduleState, curUser };
  }
  @effect(actionNames.NAMESPACE, "login") // 创建另一个局部loading状态来给“登录”按钮做反映
  *login({ username, password }: { username: string; password: string }): any {
    // 注意，此处返回如果不为any会引起编译错误，有待ts修复
    const curUser: sessionService.LoginResponse = yield this.call(sessionService.api.login, username, password);
    yield this.put(thisModule.actions.updateCurUser(curUser));
  }
  protected puta() {
    console.log(1);
  }
}
// 定义本模块的监听
class ModuleHandlers extends BaseModuleHandlers {
  // 监听全局错误Action，收集并发送给后台，为null表示不需要loading计数
  @effect(null)
  *[ERROR_ACTION_NAME](error, moduleState: State, rootState: RootState) {
    console.log(error);
    yield this.call(settingsService.api.reportError, error);
  }
  // 监听自已的INIT Action
  @effect()
  *[actionNames.INIT]() {
    const config: settingsService.GetSettingsResponse = yield this.call(settingsService.api.getSettings);
    yield this.put(thisModule.actions.updateSettings(config));
    const curUser: sessionService.GetCurUserResponse = yield this.call(sessionService.api.getCurUser);
    yield this.put(thisModule.actions.updateCurUser(curUser));
  }
}

const model = buildModel(state, ModuleActions, ModuleHandlers);

export default model;

type Actions = typeof model.actions;

export { Actions, State };
