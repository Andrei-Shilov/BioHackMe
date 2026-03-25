import { Wrench } from 'lucide-react';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';

interface PlaceholderScreenProps {
  title:    string;
  subtitle?: string;
}

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  return (
    <PageLayout maxWidth="7xl">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 bg-calm-blue-50 rounded-3xl flex items-center justify-center">
          <Wrench size={28} className="text-calm-blue-200" />
        </div>
        <p className="text-text-muted font-body text-center max-w-xs">
          Этот экран находится в разработке и будет готов в следующей фазе.
        </p>
      </div>
    </PageLayout>
  );
}
