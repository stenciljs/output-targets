module.exports = {
  extends: '../../.releaserc.json',
  tagFormat: '@stencil/react-output-target@${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', scope: 'react', release: 'minor' },
          { type: 'fix', scope: 'react', release: 'patch' },
          { type: 'perf', scope: 'react', release: 'patch' },
          { breaking: true, scope: 'react', release: 'major' },
          { scope: '!react', release: false }
        ]
      }
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
            { type: 'chore', section: ':house: Internal', hidden: true }
          ]
        },
        writerOpts: {
          commitsSort: ['scope', 'subject'],
          commitGroupsSort: 'title',
          transform: (commit, context) => {
            // Only include commits with 'react' scope
            if (commit.scope !== 'react') {
              return;
            }
            return commit;
          },
          mainTemplate: `## @stencil/react-output-target / {{version}}{{#if date}} {{date}}{{/if}}

{{> header}}

{{body}}

{{> footer}}
`,
          headerPartial: ''
        }
      }
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node ../../scripts/filter-changelog.js react CHANGELOG.md'
      }
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false
      }
    ]
  ]
};
