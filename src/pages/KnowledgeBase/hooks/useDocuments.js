import { useState, useEffect, useCallback } from 'react';
import auth from '@/utils/auth';
import { getDocuments, deleteDocument, getDocumentDetail, searchDocuments } from '../services';

export default function useDocuments(currentKB) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchAll, setSearchAll] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const fetchList = useCallback(async () => {
    if (!currentKB) {
      setDocuments([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getDocuments({ lib_id: currentKB.id, page: 1, size: 100 });
      if (auth.response(res)) {
        setDocuments(res.data?.list || []);
      }
    } catch (e) {
      console.error('加载文档列表失败', e);
    } finally {
      setLoading(false);
    }
  }, [currentKB]);

  useEffect(() => {
    fetchList();
    setSearchKeyword('');
    setSearchResults(null);
  }, [currentKB?.id]);

  const remove = useCallback(
    async (docId) => {
      const res = await deleteDocument(docId);
      if (auth.response(res, true)) {
        await fetchList();
        return true;
      }
      return false;
    },
    [fetchList],
  );

  const showDetail = useCallback(async (docId) => {
    const res = await getDocumentDetail(docId);
    if (auth.response(res)) {
      setDetailData(res.data);
      setDetailVisible(true);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
    setDetailData(null);
  }, []);

  const search = useCallback(
    async (keyword, projectId) => {
      if (!keyword?.trim()) {
        setSearchResults(null);
        return;
      }
      setLoading(true);
      try {
        const data = { query: keyword, top_k: 20 };
        if (searchAll && projectId) {
          data.project_id = projectId;
        } else if (currentKB) {
          data.lib_id = currentKB.id;
        }
        const res = await searchDocuments(data);
        if (auth.response(res)) {
          setSearchResults(res.data);
        }
      } catch (e) {
        console.error('检索失败', e);
      } finally {
        setLoading(false);
      }
    },
    [currentKB, searchAll],
  );

  const resetSearch = useCallback(() => {
    setSearchKeyword('');
    setSearchResults(null);
  }, []);

  const stats = {
    total: documents.length,
    ready: documents.filter((d) => d.status === 'ready').length,
    processing: documents.filter((d) => d.status === 'processing').length,
    error: documents.filter((d) => d.status === 'error').length,
  };

  return {
    documents,
    loading,
    searchKeyword,
    searchAll,
    detailVisible,
    detailData,
    searchResults,
    stats,
    fetchList,
    remove,
    showDetail,
    closeDetail,
    search,
    setSearchKeyword,
    setSearchAll,
    resetSearch,
  };
}
