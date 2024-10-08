/**
 * 扩展 @commitlint/config-conventional 配置
 * 添加自定义的提交类型规则
 */
module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// 定义提交类型枚举规则
		'type-enum': [
			// 规则级别：2 表示错误级别，即违反规则会导致提交失败
			2,
			// 规则应用时机：always 表示每次提交都要检查
			'always',
			// 允许的提交类型列表
			[
				'build', // 构建相关的提交
				'ci', // 持续集成相关的提交
				'chore', // 杂项任务，如依赖更新、配置修改等
				'docs', // 文档相关的提交
				'feat', // 新功能或特性的提交
				'fix', // 修复 bug 的提交
				'perf', // 性能优化的提交
				'refactor', // 重构代码的提交
				'revert', // 回滚提交
				'style', // 代码样式相关的提交
				'test', // 测试相关的提交
				'addLog', // 添加日志的提交
			],
		],
	},
};

