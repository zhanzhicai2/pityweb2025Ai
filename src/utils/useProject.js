import { useState, useEffect } from 'react';
import { listProject } from '@/services/project';
import auth from '@/utils/auth';

export function useProject() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await listProject({ page: 1, size: 10000 });
        if (auth.response(res)) {
          setProjects(res.data || []);
        }
      } catch (e) {
        console.error('加载项目失败', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return { projects, loading };
}
