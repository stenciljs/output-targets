module.exports = {
  extends: '../../.releaserc.json',
  tagFormat: '@stencil/ssr@${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', scope: 'ssr', release: 'minor' },
          { type: 'fix', scope: 'ssr', release: 'patch' },
          { type: 'perf', scope: 'ssr', release: 'patch' },
          { breaking: true, scope: 'ssr', release: 'major' },
          { scope: '!ssr', release: false }
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
        prepareCmd: 'node ../../scripts/filter-changelog.js ssr CHANGELOG.md'
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
