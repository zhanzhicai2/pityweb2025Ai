import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import auth from '@/utils/auth';
import {
  getKnowledgeBases,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from '../services';

export default function useKnowledgeBase(projectId) {
  const [list, setList] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingKB, setEditingKB] = useState(null);

  const fetchList = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getKnowledgeBases(projectId);
      if (auth.response(res)) {
        const data = res.data || [];
        setList(data);
        // 自动选择第一个知识库
        if (data.length > 0) {
          setCurrentId(data[0].id);
        }
      }
    } catch (e) {
      console.error('加载知识库列表失败', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // 切换项目时重置当前选中的知识库
    setCurrentId(null);
    fetchList();
  }, [projectId]);

  const selectKB = useCallback((id) => {
    setCurrentId(id);
  }, []);

  const create = useCallback(
    async (data) => {
      const res = await createKnowledgeBase({ ...data, project_id: projectId });
      if (auth.response(res, true)) {
        setFormVisible(false);
        setEditingKB(null);
        await fetchList();
        if (res.data?.id) {
          setCurrentId(res.data.id);
        }
        return true;
      }
      return false;
    },
    [projectId, fetchList],
  );

  const update = useCallback(
    async (id, data) => {
      const res = await updateKnowledgeBase(id, data);
      if (auth.response(res, true)) {
        setFormVisible(false);
        setEditingKB(null);
        await fetchList();
        return true;
      }
      return false;
    },
    [fetchList],
  );

  const remove = useCallback(
    async (id) => {
      const res = await deleteKnowledgeBase(id);
      if (auth.response(res, true)) {
        if (currentId === id) {
          setCurrentId(null);
        }
        await fetchList();
        return true;
      }
      return false;
    },
    [currentId, fetchList],
  );

  const openCreate = useCallback(() => {
    setEditingKB(null);
    setFormVisible(true);
  }, []);

  const openEdit = useCallback((kb) => {
    setEditingKB(kb);
    setFormVisible(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setEditingKB(null);
  }, []);

  const currentKB = list.find((item) => item.id === currentId) || null;

  return {
    list,
    currentId,
    currentKB,
    loading,
    formVisible,
    editingKB,
    fetchList,
    selectKB,
    create,
    update,
    remove,
    openCreate,
    openEdit,
    closeForm,
  };
}
