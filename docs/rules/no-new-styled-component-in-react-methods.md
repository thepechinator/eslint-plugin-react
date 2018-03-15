# Prevent instantiation of a styled-component in React component methods (react/no-new-styled-component-in-react-methods)

When using styled components, it's generally a good idea to define your styled components above your component definition. Declaring a styled component in one of your component's methods can lead to memory leaks.

## Rule Details

The following patterns are considered warnings:

```jsx
var Hello = createReactClass({
  render: function() {
    const MyButton = styled.div`
      position: relative;
    `;
    return <MyButton />
  }
});
```

The following patterns are **not** considered warnings:

```jsx
const MyButton = styled.div`
  position: relative;
`;

var Hello = createReactClass({
  render: function() {
    return <MyButton />
  }
});
```
