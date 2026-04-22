'use strict';

// routes/ 레이어에서 DB 클라이언트 직접 import 금지
// 위반 시 service 레이어를 통해 접근하도록 강제
// 참조: docs/ARCHITECTURE.md#레이어-구조, lint/policies.md

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct DB access in route layer. Use service layer instead.',
    },
    schema: [],
    messages: {
      noDirectDb:
        'Direct DB access in routes/ is forbidden. Use the service layer. See docs/ARCHITECTURE.md',
    },
  },

  create(context) {
    const filename = context.getFilename();
    if (!filename.includes('/routes/') && !filename.includes('\\routes\\')) {
      return {};
    }

    const FORBIDDEN = ['prisma', 'knex', '@prisma/client', 'typeorm', 'sequelize'];

    return {
      ImportDeclaration(node) {
        if (FORBIDDEN.some((p) => node.source.value.includes(p))) {
          context.report({ node, messageId: 'noDirectDb' });
        }
      },
      CallExpression(node) {
        if (
          node.callee.name === 'require' &&
          node.arguments[0]?.type === 'Literal' &&
          FORBIDDEN.some((p) => node.arguments[0].value.includes(p))
        ) {
          context.report({ node, messageId: 'noDirectDb' });
        }
      },
    };
  },
};
