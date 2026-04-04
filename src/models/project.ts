// @ts-nocheck
import { deleteProject, listProject, updateAvatar } from '@/services/project';
import auth from '@/utils/auth';

interface Payload {
  payload?: any;
}

const getProjectId = () => {
  const projectId = localStorage.getItem('project_id');
  if (projectId === undefined || projectId === null) {
    return undefined;
  }
  return parseInt(projectId, 10);
};

export default {
  namespace: 'project',
  state: {
    projects: [],
    projectsMap: {},
    project_id: getProjectId(),
  } as any,
  reducers: {
    save(state: any, { payload }: Payload) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    *listProject(_: Payload, { call, put, select }: any) {
      const res: any = yield call(listProject, { page: 1, size: 10000 });
      if (auth.response(res)) {
        const projects: Record<number, string> = {};
        res.data.forEach((item: any) => {
          projects[item.id] = item.name;
        });
        let projId = yield select((state: any) => state.project.project_id);
        if (projId === undefined) {
          projId = res.data.length > 0 ? res.data[0].id : undefined;
        }
        yield put({
          type: 'save',
          payload: {
            projects: res.data,
            projectsMap: projects,
            project_id: projId,
          },
        });
      }
    },

    *uploadFile({ payload }: Payload, { call }: any) {
      const res: any = yield call(updateAvatar, payload);
      if (auth.response(res, true)) {
        return res.data;
      }
      return null;
    },

    *deleteProject({ payload }: Payload, { call }: any) {
      const res: any = yield call(deleteProject, payload);
      return auth.response(res, true);
    },
  },
} as any;
