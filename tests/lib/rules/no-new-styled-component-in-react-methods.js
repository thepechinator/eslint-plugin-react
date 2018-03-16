/**
 * @fileoverview Prevent instantiation of a styled-component in React component methods
 * @author Paul Pechin
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-new-styled-component-in-react-methods');
const RuleTester = require('eslint').RuleTester;

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    experimentalObjectRestSpread: true,
    jsx: true
  }
};

const ERROR_MESSAGE = 'Do not instantiate a styled-component in a React component method. It can lead to memory leaks.';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('no-new-styled-component-in-react-methods', rule, {
  valid: [
    {
      code: `
        const Button = styled.div\`
          position: relative;
        \`;

        const MyThing = styled(div)\`
          position: absolute;
        \`;

        var Hello = function() {
          return (<MyThing />)
        };
      `,
      parserOptions: parserOptions
    },
    {
      code: `
        const Link = ({ className, children }) => (
          <a className={className}>
            {children}
          </a>
        )

        const StyledLink = styled(Link)\`
          color: palevioletred;
          font-weight: bold;
        \`;

        const MediaLinkBoxed = ({
          ...props
        }) => {
          return (
            <Container border {...props}>
              <StyledLink />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions
    },
    {
      code: `
        const Link = ({ className, children }) => (
          <a className={className}>
            {children}
          </a>
        )

        const StyledLink = Link.extend\`
          color: palevioletred;
          font-weight: bold;
        \`;

        const MediaLinkBoxed = ({
          ...props
        }) => {
          return (
            <Container border {...props}>
              <StyledLink />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions
    },
    {
      code: `
        const Text = Paragraph.withComponent('div');

        const MediaLinkBoxed = ({
          ...props
        }) => {
          return (
            <Container border {...props}>
              <Text />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions
    },
    {
      code: `
        const Input = styled.input.attrs({
          // we can define static props
          type: 'password',

          // or we can define dynamic ones
          margin: props => props.size || '1em',
          padding: props => props.size || '1em'
        })\`
          color: palevioletred;
          font-size: 1em;
          border: 2px solid palevioletred;
          border-radius: 3px;

          /* here we use the dynamically computed props */
          margin: \${props => props.margin};
          padding: \${props => props.padding};
        \`;

        const MediaLinkBoxed = ({
          ...props
        }) => {
          return (
            <Container border {...props}>
              <Input />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions
    },
    {
      code: `
        const Link = ({ className, children }) => (
          <a className={className}>
            {children}
          </a>
        )

        const StyledLink = Link.extend\`
          color: palevioletred;
          font-weight: bold;
        \`;

        class Bellow extends React.Component {
            constructor(props) {
                super(props);
                this.state = { open: props.open, display: 'none', opacity: 0 };
                this.handleHeadingClick = this.handleHeadingClick.bind(this);
            }

            componentDidMount() {
                if (this.props.open) {
                    this.open();
                }
            }

            handleHeadingClick(e, listener) {
                var bellow = this;
            }

            render() {
                const { title, children, listener } = this.props;

                return (
                    <BellowBox
                        className={this.state.open ? 'bellow open' : 'bellow closed'}
                    >
                        <HeadingBox
                            insetSpacing={2}
                            border={true}
                            onClick={e => this.handleHeadingClick(e, listener)}
                        />
                        <BodyBox
                            borderLeft={true}
                            borderRight={true}
                            borderBottom={true}
                        >
                            <Box
                                insetSpacing={2}
                                style={{
                                    transition: 'opacity 0.33s ease',
                                    opacity: this.state.opacity,
                                    display: this.state.display,
                                }}
                            >
                                {children}
                            </Box>
                        </BodyBox>
                    </BellowBox>
                );
            }
        }
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    }
  ],
  invalid: [
    {
      code: `
        var Hello = function() {
          const Button = styled.div\`
            position: relative;
          \`

          return (<Button />);
        };
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    },
    {
      code: `
        const Link = ({ className, children }) => (
          <a className={className}>
            {children}
          </a>
        )

        const MediaLinkBoxed = ({
          ...props
        }) => {
          const StyledLink = styled(Link)\`
            color: palevioletred;
            font-weight: bold;
          \`;

          return (
            <Container border {...props}>
              <StyledLink />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    },
    {
      code: `
        const Link = ({ className, children }) => (
          <a className={className}>
            {children}
          </a>
        )

        const MediaLinkBoxed = ({
          ...props
        }) => {
          const StyledLink = Link.extend\`
            color: palevioletred;
            font-weight: bold;
          \`;

          return (
            <Container border {...props}>
              <StyledLink />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    },
    {
      code: `
        const MediaLinkBoxed = ({
          ...props
        }) => {
          const Text = Paragraph.withComponent('div');

          return (
            <Container border {...props}>
              <Text />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    },
    {
      code: `
        const MediaLinkBoxed = ({
          ...props
        }) => {
          const Text = Paragraph.withComponent('div').extend\`
              color: \${props => (props.invert ? 'initial' : gray50)};
          \`;

          return (
            <Container border {...props}>
              <Text />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      },
      {
        message: ERROR_MESSAGE
      }]
    },
    {
      code: `
        const MediaLinkBoxed = ({
          ...props
        }) => {
          const Input = styled.input.attrs({
            // we can define static props
            type: 'password',

            // or we can define dynamic ones
            margin: props => props.size || '1em',
            padding: props => props.size || '1em'
          })\`
            color: palevioletred;
            font-size: 1em;
            border: 2px solid palevioletred;
            border-radius: 3px;

            /* here we use the dynamically computed props */
            margin: \${props => props.margin};
            padding: \${props => props.padding};
          \`;

          return (
            <Container border {...props}>
              <Input />
            </Container>
          );
        };
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    },
    {
      code: `
        const Link = ({ className, children }) => (
          <a className={className}>
            {children}
          </a>
        )

        class Bellow extends React.Component {
            constructor(props) {
                super(props);
                this.state = { open: props.open, display: 'none', opacity: 0 };
                this.handleHeadingClick = this.handleHeadingClick.bind(this);
            }

            componentDidMount() {
                if (this.props.open) {
                    this.open();
                }
            }

            handleHeadingClick(e, listener) {
                var bellow = this;
                const StyledLink = Link.extend\`
                  color: palevioletred;
                  font-weight: bold;
                \`;
            }

            render() {
                const { title, children, listener } = this.props;

                return (
                    <BellowBox
                        className={this.state.open ? 'bellow open' : 'bellow closed'}
                    >
                        <HeadingBox
                            insetSpacing={2}
                            border={true}
                            onClick={e => this.handleHeadingClick(e, listener)}
                        />
                        <BodyBox
                            borderLeft={true}
                            borderRight={true}
                            borderBottom={true}
                        >
                            <Box
                                insetSpacing={2}
                                style={{
                                    transition: 'opacity 0.33s ease',
                                    opacity: this.state.opacity,
                                    display: this.state.display,
                                }}
                            >
                                {children}
                            </Box>
                        </BodyBox>
                    </BellowBox>
                );
            }
        }
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    },
    {
      code: `
        class Bellow extends React.Component {
            constructor(props) {
                super(props);
                this.state = { open: props.open, display: 'none', opacity: 0 };
                this.handleHeadingClick = this.handleHeadingClick.bind(this);

                this.Input = styled.input.attrs({
                  // we can define static props
                  type: 'password',

                  // or we can define dynamic ones
                  margin: props => props.size || '1em',
                  padding: props => props.size || '1em'
                })\`
                  color: palevioletred;
                  font-size: 1em;
                  border: 2px solid palevioletred;
                  border-radius: 3px;

                  /* here we use the dynamically computed props */
                  margin: \${props => props.margin};
                  padding: \${props => props.padding};
                \`;
            }

            componentDidMount() {
                if (this.props.open) {
                    this.open();
                }
            }

            handleHeadingClick(e, listener) {
                var bellow = this;
            }

            render() {
                const { title, children, listener } = this.props;

                return (
                    <BellowBox
                        className={this.state.open ? 'bellow open' : 'bellow closed'}
                    >
                        <HeadingBox
                            insetSpacing={2}
                            border={true}
                            onClick={e => this.handleHeadingClick(e, listener)}
                        />
                        <BodyBox
                            borderLeft={true}
                            borderRight={true}
                            borderBottom={true}
                        >
                            <Box
                                insetSpacing={2}
                                style={{
                                    transition: 'opacity 0.33s ease',
                                    opacity: this.state.opacity,
                                    display: this.state.display,
                                }}
                            >
                                {children}
                            </Box>
                        </BodyBox>
                    </BellowBox>
                );
            }
        }
      `,
      parserOptions: parserOptions,
      errors: [{
        message: ERROR_MESSAGE
      }]
    }
  ]
});
