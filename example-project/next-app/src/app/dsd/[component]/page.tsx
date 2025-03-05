import { MyButton, MyList, MyListItem } from 'component-library-react';
import { PureReactComponent } from '../../PureReactComponent/PureReactComponent';
import { ToggleableContent } from '../../ToggleableContent/ToggleableContent';

export default async function Page({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;

  switch (component) {
    case 'simple':
      return <MyButton href="#">Test</MyButton>;
    case 'nested':
      return (
        <MyList>
          <MyListItem>Item 1</MyListItem>
          <MyListItem>Item 2</MyListItem>
          <MyListItem>Item 3</MyListItem>
        </MyList>
      );
    case 'nested-with-react':
      return (
        <MyList>
          <MyListItem>
            <PureReactComponent />
          </MyListItem>
        </MyList>
      );
    case 'complex-use-client':
      // contains a lazy-loaded component and a context provider
      return <ToggleableContent />;
    default:
      return 'Unknown component';
  }
}
