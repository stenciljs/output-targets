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
        config: './release-config.js'
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
