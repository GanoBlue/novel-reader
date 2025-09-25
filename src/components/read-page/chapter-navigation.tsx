import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, ChevronRight, List, X } from 'lucide-react';

interface Chapter {
  title: string;
  startPosition: number;
  endPosition: number;
  progress: number;
}

interface ChapterNavigationProps {
  content: string;
  currentPosition: number;
  onNavigateToChapter: (position: number) => void;
  onClose: () => void;
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  content,
  currentPosition,
  onNavigateToChapter,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 解析章节
  const chapters = useMemo(() => {
    if (!content) return [];

    const chapterRegex = /^第[一二三四五六七八九十百千万\d]+[章节回集卷部].*$/gm;
    const lines = content.split('\n');
    const chapters: Chapter[] = [];

    let currentChapterStart = 0;
    let chapterIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检查是否是章节标题
      if (chapterRegex.test(line)) {
        // 保存前一章
        if (chapterIndex > 0) {
          chapters[chapterIndex - 1].endPosition = currentChapterStart;
        }

        // 开始新章
        chapters.push({
          title: line,
          startPosition: currentChapterStart,
          endPosition: content.length, // 临时值，会被下一章覆盖
          progress: 0,
        });

        chapterIndex++;
        currentChapterStart = content.indexOf(line);
      }
    }

    // 计算每章的进度
    chapters.forEach((chapter, index) => {
      const chapterLength = chapter.endPosition - chapter.startPosition;
      const readLength = Math.max(0, currentPosition - chapter.startPosition);
      chapter.progress = Math.min(100, Math.round((readLength / chapterLength) * 100));
    });

    return chapters;
  }, [content, currentPosition]);

  // 过滤章节
  const filteredChapters = useMemo(() => {
    if (!searchTerm) return chapters;

    return chapters.filter((chapter) =>
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [chapters, searchTerm]);

  // 找到当前章节
  const currentChapterIndex = useMemo(() => {
    return chapters.findIndex(
      (chapter) =>
        currentPosition >= chapter.startPosition && currentPosition < chapter.endPosition,
    );
  }, [chapters, currentPosition]);

  // 导航到指定章节
  const navigateToChapter = (chapter: Chapter) => {
    onNavigateToChapter(chapter.startPosition);
    onClose();
  };

  // 导航到上一章
  const navigateToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      onNavigateToChapter(prevChapter.startPosition);
    }
  };

  // 导航到下一章
  const navigateToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      onNavigateToChapter(nextChapter.startPosition);
    }
  };

  return (
    <div className="w-full h-full bg-background border-l">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            章节导航
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索章节..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 章节统计 */}
        <Card className="p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">共 {chapters.length} 章</span>
            {currentChapterIndex >= 0 && (
              <span className="text-muted-foreground">当前: 第 {currentChapterIndex + 1} 章</span>
            )}
          </div>
        </Card>

        {/* 快速导航按钮 */}
        {chapters.length > 0 && (
          <div className="flex space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToPrevChapter}
              disabled={currentChapterIndex <= 0}
              className="flex-1"
            >
              上一章
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToNextChapter}
              disabled={currentChapterIndex >= chapters.length - 1}
              className="flex-1"
            >
              下一章
            </Button>
          </div>
        )}

        {/* 章节列表 */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredChapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? '没有找到匹配的章节' : '没有检测到章节'}
            </div>
          ) : (
            filteredChapters.map((chapter, index) => (
              <Card
                key={index}
                className={`p-3 cursor-pointer transition-colors ${
                  index === currentChapterIndex
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => navigateToChapter(chapter)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{chapter.title}</h4>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-muted rounded-full h-1.5 mr-2">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${chapter.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{chapter.progress}%</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 章节解析提示 */}
        {chapters.length === 0 && (
          <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-2">
              <List className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">章节解析提示</p>
                <p className="text-xs">
                  系统会自动识别以"第X章"、"第X回"等格式开头的章节标题。
                  如果您的书籍章节格式不同，可以手动搜索章节内容。
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

