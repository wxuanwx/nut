
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修补bug
        'docs',     // 文档
        'style',    // 格式（不影响代码运行的变动）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试相关
        'build',    // 构建系统或外部依赖变动
        'ci',       // CI配置变动
        'chore',    // 其他变动
        'revert'    // 回滚
      ]
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
};
