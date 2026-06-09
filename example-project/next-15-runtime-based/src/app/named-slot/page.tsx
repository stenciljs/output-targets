/**
 * Server-rendered page that exercises named slot serialization.
 *
 * Tests that Stencil SSR components passed into named slots of another Stencil SSR
 * component are correctly serialized as light DOM children, so that the server-rendered
 * HTML matches the client-hydrated DOM (no hydration mismatch).
 *
 * Covers both shadow (DSD) and scoped rendering modes.
 */
import { MyButton, MyButtonScoped, MyComponent, MyComponentScoped } from 'component-library-react/next';

export default function NamedSlotPage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
      <h1>Named Slot SSR Tests</h1>

      <section>
        <h2>Shadow (DSD) — MyButton with named slot children</h2>

        {/* Plain HTML element in a named slot */}
        <MyButton>
          <span slot="start">★</span>
          Button with plain start slot
        </MyButton>

        {/* Stencil SSR component in the start named slot */}
        <MyButton>
          <MyComponent slot="start" first="Icon" last="Component">★</MyComponent>
          Button with Stencil component in start slot
        </MyButton>

        {/* Stencil SSR component in the end named slot */}
        <MyButton>
          Button with Stencil component in end slot
          <MyComponent slot="end" first="Icon" last="Component">→</MyComponent>
        </MyButton>
      </section>

      <hr />

      <section>
        <h2>Scoped — MyButtonScoped with named slot children</h2>

        {/* Plain HTML element in a named slot */}
        <MyButtonScoped>
          <span slot="start">★</span>
          Scoped button with plain start slot
        </MyButtonScoped>

        {/* Stencil SSR scoped component in the start named slot */}
        <MyButtonScoped>
          <MyComponentScoped slot="start" first="Icon" last="Scoped">★</MyComponentScoped>
          Scoped button with Stencil scoped component in start slot
        </MyButtonScoped>

        {/* Stencil SSR scoped component in the end named slot */}
        <MyButtonScoped>
          Scoped button with Stencil scoped component in end slot
          <MyComponentScoped slot="end" first="Icon" last="Scoped">→</MyComponentScoped>
        </MyButtonScoped>
      </section>
    </main>
  );
}
