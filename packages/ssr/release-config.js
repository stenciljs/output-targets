const config = require('conventional-changelog-conventionalcommits');

module.exports = config({
  types: [
    { type: 'feat', section: ':rocket: Enhancement' },
    { type: 'fix', section: ':bug: Bug Fix' },
    { type: 'perf', section: ':zap: Performance' },
    { type: 'docs', section: ':memo: Documentation', hidden: false },
    { type: 'chore', section: ':house: Internal', hidden: true }
  ]
}).then((preset) => {
  // Wrap the original writer to filter commits by scope
  const originalWriter = preset.writerOpts.transform;

  preset.writerOpts.transform = function (commit, context) {
    // Only include commits with 'ssr' scope
    if (commit.scope !== 'ssr') {
      return;
    }

    // Call original transform if it exists
    if (originalWriter) {
      return originalWriter.call(this, commit, context);
    }

    return commit;
  };

  // Custom template for header with package name
  preset.writerOpts.mainTemplate = `## @stencil/ssr / {{version}}{{#if date}} {{date}}{{/if}}

{{> header}}

{{body}}

{{> footer}}
`;

  preset.writerOpts.headerPartial = '';
  preset.writerOpts.commitsSort = ['scope', 'subject'];
  preset.writerOpts.commitGroupsSort = 'title';

  return preset;
});
