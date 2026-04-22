'use strict';

// console.log/warn/error 사용 금지, 구조화 로거 강제
// 참조: docs/OBSERVABILITY.md#표준-로그-필드, lint/policies.md

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce structured logging (logger.*) over console.*',
    },
    schema: [],
    messages: {
      noConsole:
        'Use structured logger (logger.info/warn/error) instead of console.*. See docs/OBSERVABILITY.md',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          ['log', 'warn', 'error', 'info', 'debug'].includes(node.callee.property.name)
        ) {
          context.report({ node, messageId: 'noConsole' });
        }
      },
    };
  },
};
