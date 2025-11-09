'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tagsApi } from '@/lib/api';
import { Tag, TagCreate, TagTree } from '@/types/tag';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, X, Tag as TagIcon } from 'lucide-react';

export default function TagManagePage() {
  const [tagTree, setTagTree] = useState<TagTree[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagCreate>({
    name: '',
    slug: '',
    description: '',
    parent_id: undefined,
    color: '#3B82F6',
  });
  const [expandedTags, setExpandedTags] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const [tree, flat] = await Promise.all([
        tagsApi.getTagTree(),
        tagsApi.getAllTags()
      ]);
      setTagTree(tree);
      setAllTags(flat);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagsApi.updateTag(editingTag.id, formData);
      } else {
        await tagsApi.createTag(formData);
      }
      setFormData({ name: '', slug: '', description: '', parent_id: undefined, color: '#3B82F6' });
      setShowForm(false);
      setEditingTag(null);
      loadTags();
    } catch (error: any) {
      console.error('Failed to save tag:', error);
      alert(error.response?.data?.detail || '태그 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 태그를 삭제하시겠습니까?')) return;

    try {
      await tagsApi.deleteTag(id);
      loadTags();
    } catch (error: any) {
      console.error('Failed to delete tag:', error);
      alert(error.response?.data?.detail || '태그 삭제에 실패했습니다.');
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      parent_id: tag.parent_id,
      color: tag.color || '#3B82F6',
    });
    setShowForm(true);
  };

  const toggleExpand = (tagId: number) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedTags(newExpanded);
  };

  const renderTagTree = (tags: TagTree[], level = 0) => {
    return tags.map((tag) => {
      const hasChildren = tag.children && tag.children.length > 0;
      const isExpanded = expandedTags.has(tag.id);

      return (
        <div key={tag.id}>
          <div
            className="flex items-center justify-between p-3 hover:bg-gray-50 border-b"
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            <div className="flex items-center gap-2 flex-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(tag.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="w-4" />
              )}

              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: tag.color || '#3B82F6' }}
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tag.name}</span>
                  <span className="text-sm text-gray-500">({tag.slug})</span>
                </div>
                {tag.description && (
                  <p className="text-sm text-gray-600 mt-1">{tag.description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(tag)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && renderTagTree(tag.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TagIcon className="w-6 h-6" />
                태그 관리
              </h1>
              <p className="text-gray-600 mt-1">태그를 생성하고 관리합니다</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingTag(null);
                setFormData({ name: '', slug: '', description: '', parent_id: undefined, color: '#3B82F6' });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? '취소' : '새 태그'}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="p-6 bg-gray-50 border-b">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">태그 이름 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">슬러그 *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                      placeholder="예: react, javascript"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={2}
                    placeholder="태그에 대한 설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">부모 태그</label>
                    <select
                      value={formData.parent_id || ''}
                      onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">없음 (최상위)</option>
                      {allTags
                        .filter(tag => !editingTag || tag.id !== editingTag.id)
                        .map(tag => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name} ({tag.slug})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">색상</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-20 border rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-md"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingTag ? '수정' : '생성'}
                </button>
              </form>
            </div>
          )}

          {/* Tag List */}
          <div className="divide-y">
            {tagTree.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 태그가 없습니다.
              </div>
            ) : (
              renderTagTree(tagTree)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
