import { Component, h, Prop } from '@stencil/core';

export type Foo = {
  bar: string;
  loo: number[];
  qux: { quux: symbol };
};
export type Baz = Map<string, { qux: symbol }>;
export type Quux = Set<string>;
export type Grault = typeof Infinity;
export type Waldo = null;

@Component({
  tag: 'my-complex-props-scoped',
  scoped: true,
})
export class MyComplexProps {
  /**
   * basic object
   */
  @Prop() foo: Foo;

  /**
   * map objects
   */
  @Prop() baz: Baz;

  /**
   * set objects
   */
  @Prop() quux: Quux;

  /**
   * infinity
   */
  @Prop() grault: Grault;

  /**
   * null
   */
  @Prop() waldo: Waldo;

  render() {
    return (
      <ul>
        <li>
          {`this.foo.bar`}: {this.foo?.bar}
        </li>
        <li>
          {`this.foo.loo`}: {this.foo?.loo.join(', ')}
        </li>
        <li>
          {`this.foo.qux`}: {typeof this.foo?.qux.quux}
        </li>
        <li>
          {`this.baz.get('foo')`}: {typeof this.baz?.get('foo')?.qux}
        </li>
        <li>
          {`this.quux.has('foo')`}: {this.quux?.has('foo') ? 'true' : 'false'}
        </li>
        <li>
          {`this.grault`}: {this.grault === Infinity ? 'true' : 'false'}
        </li>
        <li>
          {`this.waldo`}: {this.waldo === null ? 'true' : 'false'}
        </li>
      </ul>
    );
  }
}
