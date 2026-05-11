import { TestStage } from 'react-test-components';
import type { TestComponent } from 'react-test-components';

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
