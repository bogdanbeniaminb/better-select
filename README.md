# Better Select

Better Select is a minimal custom select, with the option to fallback to the native select on mobile devices.

The plugin doesn't require jQuery, but it also offers a jQuery adapter if needed.

## Instalation

### Installing through npm

If you use npm/yarn, first install the better-select module:

```bash
npm install --save @bogdanbeniaminb/better-select
```

or

```bash
yarn add @bogdanbeniaminb/better-select
```

## Usage

```js
import BetterSelect from '@bogdanbeniaminb/better-select';

new BetterSelect(element);

// or pass some options
new BetterSelect(element, {...});

// or with jQuery
$('select.my-select').betterSelect({...});
```

The available options are:

| Option           | Description                                             | Default value               |
| ---------------- | ------------------------------------------------------- | --------------------------- |
| skipEmpty        | don't display options with empty value                  | true                        |
| placeholder      | text to display when no option is selected              | null                        |
| nativeOnMobile   | display the original select "dropdown" when on mobile   | true                        |
| mobileBreakpoint | window width (px) under which to be considered "mobile" | 1024                        |
| wrapperClass     | the class added to the wrapper element                  | 'better-select'             |
| triggerClass     | the class added to the trigger element                  | 'better-select\_\_trigger'  |
| dropdownClass    | the class added to the dropdown element                 | 'better-select\_\_dropdown' |
| zIndex           | the z-index to be set on the custom select wrapper      | decrementing from 100       |
