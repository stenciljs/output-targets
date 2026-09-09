import { describe, it, expect, vi, beforeEach } from 'vitest';
import stencilLoader from '../../src/webpack/loader.js';
import { transform } from '../../src/transform.js';

// Mock the transform module
vi.mock('../../src/transform.js', () => ({
  transform: vi.fn()
}));

describe('stencilLoader', () => {
  let mockContext: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock LoaderContext
    mockContext = {
      getOptions: vi.fn().mockReturnValue({
        from: 'component-library-react'
      }),
      resourcePath: '/path/to/resource.ts'
    };
  });

  it('should return original source if "from" string is not found', async () => {
    const source = 'const x = 123;';
    const result = await stencilLoader.call(mockContext, source);

    expect(result).toBe(source);
    expect(transform).not.toHaveBeenCalled();
  });

  it('should call transform when source contains "from" string', async () => {
    const source = 'import { something } from "component-library-react";';
    const transformedCode = 'transformed code';

    (transform as any).mockResolvedValue(transformedCode);

    const result = await stencilLoader.call(mockContext, source);

    expect(transform).toHaveBeenCalledWith(
      source,
      mockContext.resourcePath,
      mockContext.getOptions()
    );
    expect(result).toBe(transformedCode);
  });

  it('should return original source if transform throws an error', async () => {
    const source = 'import { something } from "component-library-react";';

    (transform as any).mockRejectedValueOnce(new Error('test error'));

    const result = await stencilLoader.call(mockContext, source);

    expect(transform).toHaveBeenCalled();
    expect(result).toBe(source);
  });

  it('should use options from context', async () => {
    const customOptions = {
      from: 'custom-library',
      someOtherOption: true
    };

    mockContext.getOptions.mockReturnValue(customOptions);

    const source = 'import { something } from "custom-library";';
    await stencilLoader.call(mockContext, source);

    expect(transform).toHaveBeenCalledWith(
      source,
      mockContext.resourcePath,
      customOptions
    );
  });
});
