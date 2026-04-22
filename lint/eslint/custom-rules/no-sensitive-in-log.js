'use strict';

// 로그 호출에 민감정보 필드명 전달 금지
// 참조: docs/SECURITY.md#보안-금지-패턴, docs/OBSERVABILITY.md#로그-금지-필드

const SENSITIVE_KEYS = [
  'password', 'passwd', 'secret', 'token', 'apiKey', 'api_key',
  'authorization', 'creditCard', 'ssn', 'privateKey',
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow sensitive field names in logger calls',
    },
    schema: [],
    messages: {
      sensitiveProp:
        "'{{key}}' should not be logged. Mask or omit sensitive fields. See docs/SECURITY.md",
    },
  },

  create(context) {
    const LOGGER_METHODS = ['info', 'warn', 'error', 'debug', 'trace'];

    function checkObject(node) {
      if (node.type !== 'ObjectExpression') return;
      for (const prop of node.properties) {
        if (prop.type !== 'Property') continue;
        const keyName =
          prop.key.type === 'Identifier' ? prop.key.name :
          prop.key.type === 'Literal' ? String(prop.key.value) : '';
        if (SENSITIVE_KEYS.some((k) => keyName.toLowerCase().includes(k.toLowerCase()))) {
          context.report({ node: prop, messageId: 'sensitiveProp', data: { key: keyName } });
        }
      }
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'logger' &&
          LOGGER_METHODS.includes(node.callee.property.name)
        ) {
          node.arguments.forEach(checkObject);
        }
      },
    };
  },
};
