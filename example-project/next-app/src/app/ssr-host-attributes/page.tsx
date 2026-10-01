import { MyComponent, MyList } from 'component-library-react/next';

export default function SsrHostAttributes() {
  return (
    <section id="ssr-host-attributes">
      <MyComponent className="scoped-host" style={{ color: 'red' }} tabIndex={0} />
      <MyList className="shadow-host" style={{ color: 'red' }} tabIndex={0} />
    </section>
  );
}
