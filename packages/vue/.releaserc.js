module.exports = {
  extends: '../../.releaserc.json',
  tagFormat: '@stencil/vue-output-target@${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', scope: 'vue', release: 'minor' },
          { type: 'fix', scope: 'vue', release: 'patch' },
          { type: 'perf', scope: 'vue', release: 'patch' },
          { breaking: true, scope: 'vue', release: 'major' },
          { scope: '!vue', release: false },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: ':rocket: Enhancement' },
            { type: 'fix', section: ':bug: Bug Fix' },
            { type: 'perf', section: ':zap: Performance' },
            { type: 'docs', section: ':memo: Documentation', hidden: false },
            { type: 'chore', section: ':house: Internal', hidden: true },
          ],
        },
        writerOpts: {
          commitsSort: ['scope', 'subject'],
          commitGroupsSort: 'title',
          transform: (commit, context) => {
            // Only include commits with 'vue' scope
            if (commit.scope !== 'vue') {
              return;
            }
            return commit;
          },
          mainTemplate: `## @stencil/vue-output-target / {{version}}{{#if date}} {{date}}{{/if}}

{{> header}}

{{body}}

{{> footer}}
`,
          headerPartial: '',
        },
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node ../../scripts/filter-changelog.js vue CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
  ],
};
