import { TestStage } from 'react-test-components/next';
import type { TestComponent } from 'react-test-components/next';

export default async function TestComponentsPage({
  params,
}: {
  params: Promise<{ testComponent: string[] }>;
}) {
  const { testComponent } = await params;
  const name = testComponent.join('/') as TestComponent;

  return (
    <div>
      <TestStage name={name} />
    </div>
  );
}
