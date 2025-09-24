import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { storageService } from '@/services/storage';
import { loadBookContentDB } from '@/services/db';
import { useBookStore } from '@/store/book-store';

export default function Reader() {
  const params = useParams();
  const bookId = useMemo(() => Number(params.id), [params.id]);
  const { getBookById } = useBookStore();
  const book = getBookById(bookId);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (!book) return;
    (async () => {
      // 优先从IndexedDB读取，失败或不存在则回退localStorage
      try {
        const c1 = await loadBookContentDB(bookId);
        if (c1 !== undefined) {
          setContent(c1);
          return;
        }
      } catch {}
      const c2 = storageService.loadBookContent(bookId);
      setContent(c2 ?? '尚未导入正文内容。请在导入时一并读取TXT文本保存。');
    })();
  }, [book, bookId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-3">
          <Link to="/library">
            <Button variant="ghost">返回书架</Button>
          </Link>
          <div className="text-sm text-muted-foreground">{book?.author}</div>
        </div>
        <div className="font-semibold">{book?.title}</div>
        <div />
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <pre className="whitespace-pre-wrap leading-7 text-base text-foreground">{content}</pre>
      </div>
    </div>
  );
}
