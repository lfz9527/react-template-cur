module.exports = {
    extends: [
        'stylelint-config-standard', // stylelint配置标准, 如需修改请在rules添加配置
        'stylelint-config-rational-order', // 将相关属性声明进行排序, 按照(1.Positioning 2.Box Model 3.Typography 4.Visual 5.Animation 6.Misc)
        'stylelint-config-prettier' // 关闭所有不必要的或者可能与prettier相冲突的规则。(放到后面)
    ],
    customSyntax: 'postcss-less',
    plugins: [
        'stylelint-order',
        'stylelint-declaration-block-no-ignored-properties' // 提示样式矛盾情况, 禁止由于同一规则中的另一个属性值而忽略的属性值。
    ],
    // rules: 其中添加重写和添加内容。可以通过将规则的值设置为 null 来关闭规则
    rules: {
        // 禁止由于同一规则中的另一个属性值而忽略的属性值
        'plugin/declaration-block-no-ignored-properties': true,
        // 禁用注释前空行规则
        'comment-empty-line-before': null,
        // 禁用声明前空行规则
        'declaration-empty-line-before': null,
        // 函数名称使用小写
        'function-name-case': 'lower',
        // 禁用选择器优先级顺序检查
        'no-descending-specificity': null,
        // 允许使用双斜杠注释
        'no-invalid-double-slash-comments': null,
        // 允许空块
        'block-no-empty': null,
        // 禁用关键字大小写检查
        'value-keyword-case': null,
        // 规则前要有空行，除了单行注释后和第一个嵌套规则
        'rule-empty-line-before': [
            'always',
            {except: ['after-single-line-comment', 'first-nested']}
        ],
        // 允许未知的at规则
        'at-rule-no-unknown': null
    },
    // 忽略检测文件
    ignoreFiles: [
        'node_modules/**/*',
        'build/**/*',
        'dist/**/*',
        'src/assets/font/*',
        'src/styles/reset.less'
    ]
}
