/**
 * @fileoverview Prevent instantiation of a styled-component in React component methods
 * @author Paul Pechin
 */

'use strict';

const Components = require('../util/Components');
const docsUrl = require('../util/docsUrl');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Prevent instantiation of a styled-component in React component methods',
      category: 'Possible Errors',
      recommended: false,
      url: docsUrl('no-new-styled-component-in-react-methods')
    }
  },

  create: Components.detect((context, components) => ({
    // We check for any TaggedTemplateExpression within
    // our React component and see if it matches
    // the syntax of a styled component declaration.
    TaggedTemplateExpression: function(node) {
      const tag = node.tag;
      let setFlag = false;
      switch (tag.type) {
        // example:
        // - styled(Link)``
        case 'CallExpression': {
          const callee = tag.callee;
          if (callee.type === 'MemberExpression' &&
            callee.object.object &&
            callee.object.object.name === 'styled') {
            // ex:
            // const Input = styled.input.attrs({
            //   // we can define static props
            //   type: 'password',
            //
            //   // or we can define dynamic ones
            //   margin: props => props.size || '1em',
            //   padding: props => props.size || '1em'
            // })`
            //   color: palevioletred;
            //   font-size: 1em;
            //   border: 2px solid palevioletred;
            //   border-radius: 3px;
            //
            //   /* here we use the dynamically computed props */
            //   margin: ${props => props.margin};
            //   padding: ${props => props.padding};
            // `;
            setFlag = true;
          } else if (callee.name === 'styled') {
            // ex: styled(Link)``
            setFlag = true;
          }
          break;
        }
        // examples:
        // - styled.div``
        // - Button.extend``
        case 'MemberExpression': {
          const object = tag.object;
          const property = tag.property;
          // could also check object.type, which is 'Identifier'
          if (object.name === 'styled' && property) {
            // styled.section``
            setFlag = true;
          } else if (property.name === 'extend' && object) {
            // Button.extend``
            setFlag = true;
          } else if (property.name === 'withComponent' && object) {
            // Button.withComponent('a')
            setFlag = true;
          }
          break;
        }
        default:
          break;
      }

      if (setFlag) {
        components.set(node, {
          newStyledComponentInComponentMethod: true
        });
      }
    },

    MemberExpression: function(node) {
      // naive check for Button.withComponent('a')
      // ... should check whether node.object is an actual
      // styled component
      if (node.property.name === 'withComponent' && node.object) {
        components.set(node, {
          newStyledComponentInComponentMethod: true
        });
      }
    },

    'Program:exit': function() {
      // 'list' will contain React components only, and
      // only ones that the Components class has been
      // able to confidently identify as a React component
      const list = components.list();
      // The only thing about this approach is for the check to work,
      // your React component has to be considered a valid React component.
      // Meaning, it can't just return null or lack the requirements
      // of being confidentally considered a React component. That will cause it not
      // to be in the list and for the linter not to catch a violation of this
      // rule.
      for (const component in list) {
        if (
          !list[component].newStyledComponentInComponentMethod
        ) {
          continue;
        }

        context.report({
          node: list[component].node,
          message: 'Do not instantiate a styled-component in a React component method. It can lead to memory leaks.'
        });
      }
    }
  }))
};
