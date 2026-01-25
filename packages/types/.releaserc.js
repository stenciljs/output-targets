module.exports = {
  extends: '../../.releaserc.json',
  tagFormat: '@stencil/types-output-target@${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', scope: 'types', release: 'minor' },
          { type: 'fix', scope: 'types', release: 'patch' },
          { type: 'perf', scope: 'types', release: 'patch' },
          { breaking: true, scope: 'types', release: 'major' },
          { scope: '!types', release: false },
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
        prepareCmd: 'node ../../scripts/filter-changelog.js types CHANGELOG.md',
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
