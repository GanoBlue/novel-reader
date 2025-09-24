import { Button } from '@/components/ui/button';
import { Languages, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useI18n } from '@/services/i18n';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function SiteHeader() {
  const { lang, setLang } = useI18n();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">小说阅读器</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>书架</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setLang(lang === 'zh-CN' ? 'en-US' : 'zh-CN')}
          >
            <Languages
              className={cn(
                'h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all',
                lang === 'zh-CN' ? '' : 'absolute scale-0 -rotate-90',
              )}
            />
            <Globe
              className={cn(
                'h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all',
                lang === 'en-US' ? 'scale-100 rotate-0' : 'absolute',
              )}
            />
            <span className="sr-only">切换语言</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
