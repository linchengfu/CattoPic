import { useState, useCallback, useEffect } from 'react';
import { api } from '../utils/request';
import { Tag } from '../types';

interface TagsResponse {
  success: boolean;
  tags: Tag[];
}

interface MutationResponse {
  success: boolean;
  message?: string;
  tag?: Tag;
  affectedImages?: number;
}

interface UseTagsReturn {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  selectedTags: Set<string>;
  fetchTags: () => Promise<void>;
  createTag: (name: string) => Promise<boolean>;
  renameTag: (oldName: string, newName: string) => Promise<boolean>;
  deleteTag: (name: string) => Promise<boolean>;
  deleteTags: (names: string[]) => Promise<boolean>;
  toggleTagSelection: (name: string) => void;
  selectAllTags: () => void;
  clearSelection: () => void;
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<TagsResponse>('/api/tags');
      if (response.success && response.tags) {
        setTags(response.tags);
      }
    } catch (err) {
      setError('获取标签列表失败');
      console.error('获取标签失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTag = useCallback(async (name: string): Promise<boolean> => {
    try {
      const response = await api.post<MutationResponse>('/api/tags', { name });
      if (response.success) {
        // 本地更新：添加新标签到列表
        if (response.tag) {
          setTags(prev => [...prev, response.tag!]);
        } else {
          // 如果没有返回标签数据，添加一个默认结构
          setTags(prev => [...prev, { name, count: 0 }]);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const renameTag = useCallback(async (oldName: string, newName: string): Promise<boolean> => {
    try {
      const response = await api.put<MutationResponse>(
        `/api/tags/${encodeURIComponent(oldName)}`,
        { newName }
      );
      if (response.success) {
        // 本地更新：重命名标签
        setTags(prev => prev.map(tag =>
          tag.name === oldName ? { ...tag, name: newName } : tag
        ));
        // 更新选中状态
        setSelectedTags(prev => {
          if (prev.has(oldName)) {
            const next = new Set(prev);
            next.delete(oldName);
            next.add(newName);
            return next;
          }
          return prev;
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const deleteTag = useCallback(async (name: string): Promise<boolean> => {
    try {
      const response = await api.delete<MutationResponse>(
        `/api/tags/${encodeURIComponent(name)}`
      );
      if (response.success) {
        // 本地更新：删除标签
        setTags(prev => prev.filter(tag => tag.name !== name));
        setSelectedTags(prev => {
          const next = new Set(prev);
          next.delete(name);
          return next;
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const deleteTags = useCallback(async (names: string[]): Promise<boolean> => {
    try {
      const results = await Promise.all(
        names.map(name =>
          api.delete<MutationResponse>(`/api/tags/${encodeURIComponent(name)}`)
        )
      );
      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        // 本地更新：批量删除标签
        const namesSet = new Set(names);
        setTags(prev => prev.filter(tag => !namesSet.has(tag.name)));
        setSelectedTags(new Set());
      }
      return allSuccess;
    } catch {
      return false;
    }
  }, []);

  const toggleTagSelection = useCallback((name: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const selectAllTags = useCallback(() => {
    setSelectedTags(new Set(tags.map(t => t.name)));
  }, [tags]);

  const clearSelection = useCallback(() => {
    setSelectedTags(new Set());
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    error,
    selectedTags,
    fetchTags,
    createTag,
    renameTag,
    deleteTag,
    deleteTags,
    toggleTagSelection,
    selectAllTags,
    clearSelection,
  };
}
